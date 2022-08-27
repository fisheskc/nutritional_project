const ExpressError = require('./utils/ExpressError');


module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        console.log(req.session.returnTo = req.originalUrl);
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/customers/login');
    }
    next();
}