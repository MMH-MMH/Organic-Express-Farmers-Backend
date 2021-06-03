const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const otp = require('../config/twilioConfig');
const { random_otp } = require('../methods/actions');
require('../methods/actions');
const client = new twilio(otp.acc_sid, otp.auth_token);
const User = require('../models/user');
const jwt = require('jwt-simple');
const config = require('../config/dbConfig')

router.route('/')
.post(async (req, res) => {

    var index = 0;

    console.log("Auth post");
    console.log("--", req.body);
    var contact = req.body.contact;

    if(contact.length!==10){
        res.send({success: false, msg: 'Incorrect phone number!'});
        return;
    }

    var pcontact = contact;

    contact = ("+91"+contact).toString();
    
    console.log("post contact -- ", contact);
    var user = await User.findOne({'contact': contact});

    if(!user){
        var newUser = new User;
        newUser.contact = contact;
        newUser.name = "abcd";
        newUser.registered = false,
        await newUser.save();
        index = 1;
    } else {
        if(user.done === false){
            index = 1;
        } else {
            index = 2;
        }
    }

    var otp_number = random_otp();

    await User.updateOne({ 'contact': contact }, {$set: {"otp": otp_number}});

    var txt = "SMS from Organic Express.\nYour otp is: ";
    txt+=(otp_number).toString();
    txt+="\n";

    await client.messages.create({
        to: contact,
        body: txt,
        from: otp.from
    }).then((message) => {
        if(message.errorMessage){
            res.send({success: false, msg: 'Failed sending otp, check the number you entered!'});    
            return;
        }
        console.log("after", message);
        var token = jwt.encode(user, config.secret);
        res.send({success: true, msg: 'Otp sent successfully!', index: index, token: token});
    }).done();

});

router.route('/otpverify')
.post(async(req, res) => {
    console.log("Here");


    var contact, name;
    if(req.headers.authorization){
        var token = req.headers.authorization;
        var decodedtoken = await jwt.decode(token, config.secret);
        contact = decodedtoken.contact;
        name = decodedtoken.name;
    } else {
        res.send({success: false, msg: 'Invalid Authorization', contact: contact, isregistered: false});
        return;
    }

    var userOtp = req.body.otp;

    console.log("userOtp -- ", userOtp);

    User.findOne({'contact': contact}, async (err, user) => {
        if(err)throw err;
        if(!user || user.contact!==contact){
            res.send({success: false, msg: 'Enter your Phone number correctly', contact: contact, isregistered: false});
            return;
        }
        console.log("Real otp -- ", user.otp);
        if(user.otp === ''){
            res.send({success: false, msg: 'Invalid Authorization', contact: contact, isregistered: false});
            return;
        }
        if(user.otp !== userOtp){
            res.send({success: false, msg: 'Incorrect Otp', contact: contact, isregistered: false});
            return;
        }
        await User.updateOne({'contact': contact}, { $set: {'otp': ''} });
        res.send({success: true, msg: 'You are authorized', isregistered: user.registered, contact: contact, name: name});
    });
    
});

router.route('/getinfo')
.post(async(req, res) => {
    console.log("getinfo");

    var contact, data;
    if(req.headers.authorization){
        var token = req.headers.authorization;
        data = await jwt.decode(token, config.secret);
        contact = data.contact;
    } else {
        res.send({success: false, msg: 'Invalid Authorization', contact: contact, isregistered: false});
        return;
    }
    console.log("getinfo data -- ", data);
    res.send({success: true, msg: 'Success', isregistered: true, data: data});

})



module.exports = router;