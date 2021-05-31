var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');


var userSchema = new Schema({
    name: String,
    phone: String,
    otp: String,
});


module.exports = mongoose.model('User', userSchema);