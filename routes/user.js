const express = require("express");
const User = require("../models/user");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controller/user.js");

router.route("/signup")
    .get(userController.redirectSignup)
    .post(wrapAsync(userController.signup));

router.route("/login")
    .get(userController.loginRedirect)
    .post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), userController.login)

router.get("/logout", userController.logout)

module.exports = router;