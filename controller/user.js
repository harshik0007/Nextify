const User = require("../models/user");
const Listing = require("../models/listing");

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