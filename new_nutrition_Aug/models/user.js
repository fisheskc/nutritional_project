const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const bcrypt = require("bcrypt");
const passportLocalMongoose = require('passport-local-mongoose');


const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});
// this works if we avoid the username and it looks only at the email
// customerRegisterSchema.plugin(passportLocalMongoose, {usernameField: 'email'});
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema)