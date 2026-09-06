const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose").default;//gives object inside it funtion so we need to do .default

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    }
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

module.exports = User;