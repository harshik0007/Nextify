const User = require("../models/user");

module.exports.redirectSignup = (req, res, next) => {
    res.render("users/signup.ejs");
}

module.exports.signup = async (req, res, next) => { //by wrap we redirect to error page but we want flash msg so we use try-catch
    try {
        const { username, email, password } = req.body;
        const newUser = await new User({ username, email });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Nextify");
            res.redirect("/listings");
        })
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup")
    }
}

module.exports.loginRedirect = (req, res, next) => {
    res.render("users/login.ejs");
}

module.exports.login = async (req, res, next) => {
    req.flash("success", "Welcome back to Nextify!");
    res.redirect(res.locals.redirectUrl || "/listings");
}

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
    });

    req.flash("success", "Successfully Logout!");
    res.redirect("/listings");
}