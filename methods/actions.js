var User = require('../models/user');
var jwt = require('jwt-simple');
var config = require('../config/dbConfig');
var otp = require('../config/twilioConfig');

var functions = {
    random_otp: () => {
        var num = Math.floor(Math.random()*(otp.max - otp.min + 1)) + otp.min;
        return num;
    },
    getinfo: (req, res) => {
        if(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'bearer'){
            var token = req.headers.authorization.split(' ')[1];
            var decodedtoken = jwt.decode(token, config.secret);
            return res.json({success: true, msg: 'Hello '+decodedtoken.name});
        } else {
            return res.json({success: false, msg: 'No Headers'});
        }
    }
}

module.exports = functions;