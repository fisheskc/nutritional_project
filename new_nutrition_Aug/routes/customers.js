const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const Joi = require('joi');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const {isLoggedIn} = require('../middleware');

router.use((req, res, next) => {
     res.locals.messages = req.flash('success');
     res.locals.error = req.flash('error');
     // next needs to be called for this to run
     next();
 })

router.get('/customers/register', (req, res) => {
     res.render('customers/register')
})

router.post('/customers/register', catchAsync(async(req, res, next) => {
     try {
            const {email, username, password} = req.body;
            // new schema instance made here
            const user = new User({email, username});
            // npm passport-local: this writes the username and password into the DB & hashes it
            // username: is name, password
            const registeredUser = await User.register(user, password);
            // user is logged in after after registering with npm passport
               req.login(registeredUser, err => {
                    if(err) return next(err);
                    req.flash('success','You are registered');
                    res.redirect('/meals');
               })
          } catch (e) {
                    req.flash('error', e.message);
                    res.redirect('register');
          } 
}));

router.get('/meals/new', (req, res) => {
     if(!req.isAuthenticated()) {
          req.flash('error', 'you must be signed in');
          return res.redirect('/customers/login');
     }
     res.render('meals/new');
})

router.get('/customers/login', (req,res) => {
    res.render('customers/login')
})

router.post('/customers/login', passport.authenticate('local',{failureFlash: true, failureRedirect: '/customers/login'}), (req,res) => {
     req.flash('success', 'welcome back!');
     const redirectUrl = req.session.returnTo || '/meals';
     delete req.session.returnTo;
     res.redirect(redirectUrl);
})

router.get('/customers/logout', (req,res) => {
     // logout is used with NPM passport, keyword from Passport
     req.logout();
     req.flash('success',"Goodbye");
     res.redirect('/');
 })

module.exports = router;