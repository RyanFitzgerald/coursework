const passport = require('passport');
const crypto = require('crypto'); // Built into node.js
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

exports.login = passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Failed to login!',
    successRedirect: '/',
    successFlash: 'You have logged in!'
});

exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'You are now logged out!');
    res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
    // If authenticated
    if (req.isAuthenticated()) {
        next(); // Carry on, they are logged in
        return;
    }
    req.flash('error', 'You must be logged in!');
    res.redirect('/login');
};

exports.forgot = async (req, res) => {
    // 1. See if user exists based on email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        req.flash('error', 'If an account existed, you will receive a reset link'); // No good practice
        return res.redirect('/login');
    }

    // 2. Set reset tokens and expiry on account
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
    await user.save();

    // 3. Send them email with the token
    const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`; // Temporary...this will be emailed
    await mail.send({
        user,
        subject: 'Password Reset',
        resetURL,
        filename: 'password-reset'    
    });
    req.flash('success', 'If an account existed, you will receive a reset link.');

    // 4. Redirect to login page
    res.redirect('/login');
};

exports.reset = async (req, res) => {
    // Find a user with that token and a password expiry that hasn't expired
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired!');
        return res.redirect('/login');
    }

    // IF there is a user, show reset password form
    res.render('reset', { title: 'Reset Password' });
};

exports.confirmedPasswords = (req, res, next) => {
    if (req.body.password === req.body['password-confirm']) {
        next(); // Keep it going
        return;
    }
    req.flash('error', 'Passwords do not match!');
    res.redirect('back');
};

exports.update = async (req, res) => {
    // Find a user again with that token and a password expiry that hasn't expired
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired!');
        return res.redirect('/login');
    }

    // Promisify it and call it
    const setPassword = promisify(user.setPassword, user);
    await setPassword(req.body.password);

    // Get rid of fields now
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Update user
    const updatedUser = await user.save();

    // Log them in
    await req.login(updatedUser);

    req.flash('success', 'Your password has been reset!');
    res.redirect('/');
};