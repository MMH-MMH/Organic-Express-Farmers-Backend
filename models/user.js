var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');


var userSchema = new Schema({
    name: String,
    contact: String,
    otp: String,
    language: String,
    registered: Boolean,
    currAdd: String,
    anotherNumber: String,
    landSize: Number,
    cropsList: Object,
    farmingType: Object,
    certificateNumber: String,
    requests: Object,
    cropStatus: Object,
    landSizeUnit: String,
});


const User = mongoose.model('User', userSchema);
module.exports = User;