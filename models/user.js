var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');


var userSchema = new Schema({
    name: String,
    contact: String,
    otp: String,
    registered: Boolean,
});


const User = mongoose.model('User', userSchema);
module.exports = User;