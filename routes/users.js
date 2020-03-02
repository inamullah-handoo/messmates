const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// models
let User = require('../models/user');

// route to register page
router.get('/register', (req,res) => {
    if(req.user){
        res.redirect('/');
    }else{
        res.render('register', {
            title:'Register',
            registerActive:'bg-light text-dark'
        });
    }
});

// save user in db
router.post('/register', (req,res) => {
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('username', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password', 'Password is small').isLength(8);
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    let errors = req.validationErrors();

    // check for errors
    if(errors){
        res.render('register', {
            title:'Register',
            registerActive:'bg-light text-dark',
            errors
        });
    }else{
        name = req.body.name;
        username = req.body.username;
        email = req.body.email;
        password = req.body.password;

        User.find({'username':username}, (err,users) => {
            if(err){
                console.log(err);
            }else{
                if(users[0]){
                    res.render('register', {
                        title:'Register',
                        registerActive:'bg-light text-dark',
                        err: 'Username already exists'
                    });
                }else{
                    let newUser = new User({
                        name:name,
                        username:username,
                        email:email,
                        password:password
                    });
            
                    bcrypt.genSalt(10, function(err, salt){
                        bcrypt.hash(newUser.password, salt, function(err,hash){
                            if(err){
                                console.log(err);
                            }
                            newUser.password = hash;
                            newUser.save(err => {
                                if(err){
                                    console.log(err);
                                }else{
                                    res.redirect('/users/login');
                                }
                            });
                        });
                    });
                }
            }
        });
    }
});

// route to login page
router.get('/login', (req,res) => {
    if(req.user){
        res.redirect('/');
    }else{
        res.render('login',{
            title:'Login',
            loginActive:'bg-light text-dark'
        });
    }
});

// login process
router.post('/login', (req,res,next) => {
    passport.authenticate('local', {
        successRedirect:'/',
        failureRedirect:'/users/login',
        // failureFlash: true
    })(req,res,next); 
});

  // logout
router.get('/logout', (req,res) => {
    req.logout();
    // req.flash('success','Logged out');
    res.redirect('/users/login');
});

module.exports = router;