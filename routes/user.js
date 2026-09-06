const express = require("express");
const User = require("../models/user");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js")

router.get("/signup", (req, res, next) => {
    res.render("users/signup.ejs");
})

router.post("/signup", wrapAsync(async (req, res, next) => { //by wrap we redirect to error page but we want flash msg so we use try-catch
    try {
        const { username, email, password } = req.body.user;
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

module.exports = router;