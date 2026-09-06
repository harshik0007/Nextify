const express = require("express");
const User = require("../models/user");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");

router.get("/signup", (req, res, next) => {
    res.render("users/signup.ejs");
})

router.post("/signup", wrapAsync(async (req, res, next) => { //by wrap we redirect to error page but we want flash msg so we use try-catch
    try {
        const { username, email, password } = req.body;
        const newUser = await new User({ username, email });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.flash("success", "Welcome to Nextify");
        res.redirect("/listings");
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup")
    }
}));

router.get("/login", (req, res, next) => {
    res.render("users/login.ejs");
})

router.post("/login", passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), async (req, res, next) => {
    req.flash("success", "Welcome back to Nextify!");
    res.redirect("/listings");
})

module.exports = router;