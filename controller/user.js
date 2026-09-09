const User = require("../models/user");
const Listing = require("../models/listing");
const crypto = require("crypto");
const sendMail = require("../utils/sendEmail")

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
            req.flash("success", "Welcome to Nextify, Please complete profile first");
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

module.exports.profile = async (req, res, next) => {
    let user = await User.findById(req.user);
    let allPersonalListings = await Listing.find({ owner: req.user._id });
    res.render("users/profile.ejs", { user, allPersonalListings });
}

module.exports.profileEditForm = async (req, res, next) => {
    let { userId } = req.params;
    let user = await User.findById(userId);
    res.render("users/editProfile.ejs", { user });
}

module.exports.profileEdit = async (req, res, next) => {
    let { userId } = req.params;

    let user = await User.findById(userId);

    const { password } = req.body;

    const result = await user.authenticate(password);

    if (!result.user) {
        req.flash("error", "Incorrect password");
        return res.redirect(`/user/${userId}/edit`);
    }

    user = await User.findByIdAndUpdate(userId, { ...req.body });

    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        user.image = { url, filename };
        await user.save();
    }

    req.flash("success", "Profile updated!")
    res.redirect("/user/profile");
}

module.exports.changepasswordform = async (req, res, next) => {
    let { userId } = req.params;
    res.render("users/changePassword.ejs", { userId });
}

module.exports.changepassword = async (req, res, next) => {
    let { userId } = req.params;
    let user = await User.findById(userId);

    const { old_password, new_password } = req.body;

    const result = await user.authenticate(old_password);

    if (!result.user) {
        req.flash("error", "Incorrect current password");
        return res.redirect(`/user/${userId}/change-password`);
    }

    await user.setPassword(new_password);

    await user.save();

    req.flash("success", "Password changed successfully!");
    res.redirect("/user/profile");
}

// Show verification page
module.exports.showVerifyEmail = async (req, res, next) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        req.flash("error", "User not found.");
        return res.redirect("/listings");
    }

    if (user.isVerified) {
        req.flash("success", "Email is already verified.");
        return res.redirect("/listings");
    }

    res.render("users/verify-email.ejs");
};

module.exports.sendVerificationOTP = async (req, res, next) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        req.flash("error", "User not found.");
        return res.redirect("/listings");
    }

    if (user.isVerified) {
        req.flash("success", "Email is already verified.");
        return res.redirect("/listings");
    }

    // Check if user is locked
    if (
        user.verificationLockedUntil &&
        user.verificationLockedUntil > new Date()
    ) {
        req.flash(
            "error",
            "Too many incorrect attempts. Try again after 10 min."
        );

        return res.redirect("/verify-email");
    }

    // Lock expired → reset attempts
    if (
        user.verificationLockedUntil &&
        user.verificationLockedUntil <= new Date()
    ) {
        user.verificationLockedUntil = undefined;
        user.verificationAttempts = 0;
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    user.verificationOTP = otp;
    user.verificationOTPExpires =
        new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    // Send OTP
    await sendMail(
        user.email,
        "Nextify Email Verification",
        `Your verification OTP is ${otp}. It expires in 10 minutes.`
    );

    req.flash("success", "OTP sent to your email.");

    res.redirect("/verify-email");
};

module.exports.verifyEmail = async (req, res, next) => {
    const { verificationOTP: otp } = req.body;
    const user = await User.findById(req.user._id);
    console.log("Entered OTP:", otp);
    console.log("Saved OTP:", user.verificationOTP);
    console.log("Types:", typeof otp, typeof user.verificationOTP);



    if (!user) {
        req.flash("error", "User not found.");
        return res.redirect("/listings");
    }

    if (user.isVerified) {
        req.flash("success", "Email is already verified.");
        return res.redirect("/listings");
    }

    // Check if user is currently locked
    if (
        user.verificationLockedUntil &&
        user.verificationLockedUntil > new Date()
    ) {
        req.flash(
            "error",
            "Too many incorrect attempts. Try again after 10 min."
        );
        return res.redirect("/verify-email");
    }

    // Lock expired → automatically reset
    if (
        user.verificationLockedUntil &&
        user.verificationLockedUntil <= new Date()
    ) {
        user.verificationAttempts = 0;
        user.verificationLockedUntil = undefined;

        await user.save();
    }

    // Check OTP expiry
    if (
        !user.verificationOTPExpires ||
        user.verificationOTPExpires < new Date()
    ) {
        req.flash(
            "error",
            "OTP has expired. Please request a new OTP."
        );
        return res.redirect("/verify-email");
    }

    // Wrong OTP
    if (user.verificationOTP !== otp) {
        user.verificationAttempts += 1;

        // 3 wrong attempts → lock for 10 min
        if (user.verificationAttempts >= 3) {
            user.verificationLockedUntil = new Date(
                Date.now() + 10 * 60 * 1000
            );

            await user.save();

            req.flash(
                "error",
                "Too many incorrect attempts. Verification is locked for 10 min."
            );

            return res.redirect("/verify-email");
        }

        await user.save();

        req.flash(
            "error",
            `Invalid OTP. ${3 - user.verificationAttempts} attempts remaining.`
        );

        return res.redirect("/verify-email");
    }

    // Correct OTP
    user.isVerified = true;
    user.verificationOTP = undefined;
    user.verificationOTPExpires = undefined;
    user.verificationAttempts = 0;
    user.verificationLockedUntil = undefined;

    await user.save();

    req.flash("success", "Email verified successfully!");
    res.redirect("/listings");
};