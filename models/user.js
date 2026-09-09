const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose").default;//gives object inside it funtion so we need to do .default

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    fullname: {
        type: String,
    },
    bio: {
        type: String,
    },
    location: {
        type: String,
    },
    image: {
        url: String,
        filename: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationOTP: {
        type: String,
    },
    verificationOTPExpires: {
        type: Date
    },
    verificationAttempts: {
        type: Number,
        default: 0
    },
    verificationLockedUntil: {
        type: Date
    }
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

module.exports = User;