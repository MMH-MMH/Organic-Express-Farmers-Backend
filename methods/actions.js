var User = require('../models/user');
var jwt = require('jwt-simple');
var config = require('../config/dbConfig');
var otp = require('../config/twilioConfig');

var functions = {
    random_otp: () => {
        var num = Math.floor(Math.random()*(otp.max - otp.min + 1)) + otp.min;
        return num;
    },
    getContact: (req, res) => {
        if(req.headers.authorization){
            var token = req.headers.authorization;
            var decodedtoken = jwt.decode(token, config.secret);
            return {success: true, contact: decodedtoken.contact};
        } else {
            return {success: false, msg: 'No Headers'};
        }
    }
}

module.exports = functions;