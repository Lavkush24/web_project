const { string } = require("joi");
const mongoose = require("mongoose");
const { use } = require("passport");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
});


//this plugin automatincally added hashin , salting, and username other methods
userSchema.plugin(passportLocalMongoose);

//exxport of define userSchema model
module.exports = mongoose.model("User", userSchema);