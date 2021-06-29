const express = require('express');
const router = express.Router();

// mongoose user model
const User = require('./../models/User');

// Password handler
const bcrypt = require('bcrypt');

//signup
router.post('/signup',(req,res)=>{
    let{name,email,password} = req.body;
    name = name.trim();
    email = email.trim();
    password = password.trim();

    if(name == "" || email == "" || password == ""){
        res.json({
            status: "FAILED",
            message: "Empty input field!"
        });

    }
    else if(!/^[a-zA-Z]*$/.test(name)){
        res.json({
            status:"FAILED",
            message: "Invalid name entered!"
        })
    }
    else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
        res.json({
            status: "FAILED",
            message: "Invalid name entered"
        })
    }
    else if(password.length<8){
        res.json({
            status: "FAILED",
            message: "Password is too short!"
        })
    }
    else{
        // checking if user already exists
        User.find({email}).then(result => {
            if(result.length){
                res.json({
                    status: "FAILED",
                    message: "User with the provided email already exists"
                })
            }
            else{
                //try create a new user

                // password handling
                const saltRounds = 10;
                bcrypt.hash(password, saltRounds).then(hashedPassword =>{
                    const newUser = new User({
                        name,
                        email,
                        password: hashedPassword,
                    });
                    newUser.save().then(result =>{
                        res.json({
                            status:"SUCCESS",
                            message:"Signup successful",
                            data:result,
                        })
                    })
                    .catch(err=>{
                        res.json({
                            status:"FAILED",
                            message:"An error has occured while saving the password!",
                        })
                    })
                })
                .catch(err=>{
                    res.json({
                        status: "FAILED",
                        message: "An error occurred while hashing password!"
                    })
                })
            }
        }).catch(err => {
            console.log(err);
            res.json({
                status: "FAILED",
                message: "An error occured while checking for existing user!"
            })
        })
    }
    
})

//signin
router.post('/signin',(req,res)=>{
    let{email,password} = req.body;
    email = email.trim();
    password = password.trim();

    if(email == "" || password == ""){
        res.json({
            status: "FAILED",
            message: "Empty credentials supplied"
        })
    } else{
        // check if user exists
        User.find({email})
        .then(data => {
            if(data){
                //user exists

                const hashedPassword = data[0].password;
                bcrypt.compare(password,hashedPassword).then(result => {
                    if(result){
                        res.json({
                            status: "SUCCESS",
                            message: "Signin successful",
                            data: data
                        })
                    }else{
                        res.json({
                            status:"FAILED",
                            message: "Invalid password entered!"
                        })
                    }
                })
                .catch(err => {
                    res.json({
                        status:"FAILED",
                        message: "An error occurred while comapring passwords"
                    })
                })
            }else{
                res.json({
                    status:"FAILED",
                    message: "Invalid credentials."
                })
            }

        })
        .catch(err =>{
            res.json({
                status: "FAILED",
                message: "An error has occurred while checking for existing user!"
            })
        })
    }
})

module.exports = router;
