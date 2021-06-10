const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const otp = require('../config/twilioConfig');
const { random_otp } = require('../methods/actions');
require('../methods/actions');
const client = new twilio(otp.acc_sid, otp.auth_token);
const User = require('../models/user');
const Image = require('../models/image');
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
        console.log("He/she is newUser");
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

    var token = jwt.encode(user, config.secret), decoded;
    console.log("token -- ", token);
    try{
        decoded = await jwt.decode(token, config.secret);
        
    } catch (err){
        res.send({success: false, msg: 'Some server error occurred! Please retry', index: index, token: token});
        throw err;

    }

    console.log("decoded == ", decoded);

    if(decoded){

        await client.messages.create({
            to: contact,
            body: txt,
            from: otp.from
        }).then(async(message) => {
            if(message.errorMessage){
                res.send({success: false, msg: 'Failed sending otp, check the number you entered!'});    
                return;
            }
            console.log("after", message);
            
            // console.log("decoded token -- ", decoded);

            res.send({success: true, msg: 'Otp sent successfully!', index: index, token: token});
        }).done();
    } else {
        res.send({success: false, msg: 'Server error, Please retry'});    
    }

});

router.route('/otpverify')
.post(async(req, res) => {
    console.log("Here");


    var contact, name;
    if(req.headers.authorization){
        var token = req.headers.authorization;
        console.log("token -- ", token);
        var decodedtoken = await jwt.decode(token, config.secret);
        console.log("decodedtoken -- ", decodedtoken);
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
        console.log("user -- ", user);
        if(!user || user.contact!==contact){
            res.send({success: false, msg: 'Enter your Phone number correctly', contact: contact, isregistered: false});
            return;
        }
        console.log("Real otp -- ", user.otp);
        
        if(user.otp !== userOtp){
            res.send({success: false, msg: 'Incorrect Otp', contact: contact, isregistered: false});
            return;
        }
        await User.updateOne({'contact': contact}, { $set: {'otp': ''} });
        var msg = "You have to register yourself";
        if(user.registered){
            msg = "You are logged in now";
        }
        res.send({success: true, msg: msg, isregistered: user.registered, contact: contact, name: name});
    });
    
});

router.route('/getinfo')
.post(async(req, res) => {
    try{
        console.log("getinfo");
        console.log(req.body);
        var contact = req.body.contact;
        
        var userData;

        User.findOne({'contact': contact}).then((err, user) => {
            if(err) {
                throw err;
            }
            console.log("user -- ", user);
            userData = user;
            res.send({success: true, msg: 'Success', data: userData});
        });

        
    } catch (err) {
        res.send({success: false, msg: "We couldn't get your account info. We are trying hard to make everything work fine!", data: {}})
    }

});

router.route('/register')
.post(async(req, res) => {
    try{
        console.log("Register");

        var userData = req.body.data;
        
        // console.log(req.body);
        // console.log(userData);
        userData["registered"] = true;
        var contact = ("+91" + userData["contact"]).toString();
        userData["contact"] = contact;
        var cropList = userData["cropsList"].split(',');
        userData['cropsList'] = cropList;
        console.log("final userdata -- ", userData);

        await User.updateOne({'contact': userData["contact"]}, { $set: userData}, (err) => {
            if(err)throw err;
            console.log("Updated");
        });

        res.send({"success": true});
    } catch (err){
        throw err;
    }
});

router.route('/requestItems')
.post(async(req, res) => {
    try{
        console.log("requestItems = ", req.body);
        var contact = req.body.data.contact, items = req.body.data.items;
        contact = "+91"+contact;
        console.log("contact -- ", contact, "\nitems -- ", items);
        var user = await User.findOne({'contact': contact});
        console.log("user -- ", user);

        var newrequests = user.requests;

        if(newrequests == null)newrequests={};

        console.log("initial requests -- ", newrequests);
        
        Object.keys(items).forEach((key) => {
            var value = items[key];
            console.log(key, value);
            if(newrequests[key] == null){
                newrequests[key] = 0;
            }
            newrequests[key]+=Number(value);
        });

        console.log("final requests -- ", newrequests);

        User.updateOne({'contact': contact}, { $set: {'requests': newrequests} }, (err) => {
            if(err) throw err;
            console.log("Updates");
            res.send({"success": true, 'msg': "Request sent succesfully"});
        });
    } catch (err){
        console.log(err);
    }

})

router.route('/updateStatus')
.post(async(req, res) => {
    console.log("updateStatus", req.body);
    var contact = "+91"+req.body.contact;
    var cropStatus = req.body.status;
    console.log("new crop status -- ", cropStatus);
    await User.findOne({'contact': contact}, { $set: {'cropStatus': cropStatus} }, (err, user) => {
        if(err) throw err;
        console.log("final user -- ", user);
    });
    
    res.send({"success":true});
})

router.route('/getCropStatus')
.post(async(req, res) => {
    try{
        console.log("getCropStatus -- ", req.body);
        var contact = req.body.contact;
        contact = "+91"+contact;
        console.log("contact -- ", contact);
        var user = await User.findOne({'contact': contact});

        if(!user){
            res.send({"success": false, 'msg': "User Not found", 'cropStatus': null});
        } else {
            console.log("user -- ", user);
            res.send({"success": true, 'msg': "Success", 'cropStatus': user.cropStatus});
        }
            
    } catch (err) {
        console.log("getCropStatuserr -- ", err);
    }

})


module.exports = router;
