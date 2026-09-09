const express = require("express");
const User = require("../models/user");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");
const userController = require("../controller/user.js");
const multer = require('multer');
const { storage, cloudinary } = require("../cloudConfig.js");
const upload = multer({ storage })

router.route("/signup")
    .get(userController.redirectSignup)
    .post(wrapAsync(userController.signup));

router.route("/login")
    .get(userController.loginRedirect)
    .post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), userController.login)

router.get("/logout", userController.logout)

router.get("/user/profile", isLoggedIn, wrapAsync(userController.profile));

router.get("/user/:userId/edit", isLoggedIn, wrapAsync(userController.profileEditForm));

router.put("/user/:userId", isLoggedIn, upload.single("image"), wrapAsync(userController.profileEdit));

router.get("/user/:userId/change-password", isLoggedIn, wrapAsync(userController.changepasswordform));

router.put("/user/:userId/change-password", isLoggedIn, wrapAsync(userController.changepassword));

module.exports = router;


