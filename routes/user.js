const express = require("express");
const User = require("../models/user");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controller/user.js");


router.get("/signup", userController.redirectSignup)

router.post("/signup", wrapAsync(userController.signup));

router.get("/login", userController.loginRedirect)

router.post("/login", saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), userController.login)

router.get("/logout", userController.logout)

module.exports = router;