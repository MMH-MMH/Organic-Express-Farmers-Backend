const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const otp = require('../config/otp');
const { random_otp } = require('../methods/actions');
require('../methods/actions');
const client = new twilio(process.env.twilio_acc_sid, process.env.twilio_auth_token);
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
    
    var user = await User.findOne({'contact': contact});

    if(!user){
        console.log("He/she is newUser");
        var newUser = new User;
        newUser.contact = contact;
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

    var token = jwt.encode(user, process.env.secret), decoded;
    
    try{
        decoded = await jwt.decode(token, process.env.secret);
        
    } catch (err){
        res.send({success: false, msg: 'Some server error occurred! Please retry', index: index, token: token});
        throw err;

    }

    if(decoded){

        await client.messages.create({
            to: contact,
            body: txt,
            from: process.env.twilio_from
        }).then(async(message) => {
            if(message.errorMessage){
                res.send({success: false, msg: 'Failed sending otp, check the number you entered!'});    
                return;
            }

            res.send({success: true, msg: 'Otp sent successfully!', index: index, token: token});
        }).done();
    } else {
        res.send({success: false, msg: 'Server error, Please retry'});    
    }

});

router.route('/otpverify')
.post(async(req, res) => {

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

    User.findOne({'contact': contact}, async (err, user) => {

        if(err)throw err;
        
        if(!user || user.contact!==contact){
            res.send({success: false, msg: 'Enter your Phone number correctly', contact: contact, isregistered: false});
            return;
        }
        
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
        
        console.log("getInfo", req.body);
        var contact = req.body.contact;
        
        var userData;
        
        contact = "+91"+contact;

        userData = await User.findOne({'contact': contact});

        if(userData){
            res.send({success: true, msg: 'Success', data: userData});
        } else {
            res.send({success: true, msg: 'Some error occurred', data: null});
        }

        
    } catch (err) {
        res.send({success: false, msg: "We couldn't get your account info. We are trying hard to make everything work fine!", data: {}})
    }

});

router.route('/register')
.post(async(req, res) => {
    try{

        var userData = req.body.data;
        userData["registered"] = true;
        var contact = ("+91" + userData["contact"]).toString();
        userData["contact"] = contact;
        var cropList = userData["cropsList"].split(',');
        userData['cropsList'] = cropList;

        var cropStatus = [];
        for(var i=0;i<cropList.length;i++){
            var crop = {
                "name": cropList[i],
                "Status": 'none'
            }
            cropStatus.append(crop);
        }

        userData['cropStatus'] = cropStatus;
        
        await User.updateOne({'contact': userData["contact"]}, { $set: userData}, (err) => {
            if(err)throw err;
        
        });

        res.send({"success": true});
    } catch (err){
        res.send({"success": false});
        throw err;
    }
});

router.route('/requestItems')
.post(async(req, res) => {
    try{
        
        var contact = req.body.data.contact, items = req.body.data.items;
        contact = "+91"+contact;
        
        var user = await User.findOne({'contact': contact});
        
        var newrequests = user.requests;

        if(newrequests == null)newrequests={};

        Object.keys(items).forEach((key) => {
            var value = items[key];
            
            if(newrequests[key] == null){
                newrequests[key] = 0;
            }
            newrequests[key]+=Number(value);
        });

        User.updateOne({'contact': contact}, { $set: {'requests': newrequests} }, (err) => {
            if(err) throw err;
   
            res.send({"success": true, 'msg': "Request sent succesfully"});
        });
    } catch (err){
        res.send({"success": false, 'msg': "Request sending failed"});
    }

})

router.route('/updateStatus')
.post(async(req, res) => {
    
    var contact = "+91"+req.body.data.contact;
    var cropStatus = req.body.data.cropStatus;
    
    await User.updateOne({'contact': contact}, { $set: {'cropStatus': cropStatus} }, (err, user) => {
        if(err) throw err;
    
    });
    
    res.send({"success":true});
})

router.route('/getCropStatus')
.post(async(req, res) => {
    try{
        
        var contact = req.body.contact;
        contact = "+91"+contact;
        
        var user = await User.findOne({'contact': contact});

        if(!user){
            res.send({"success": false, 'msg': "User Not found", 'cropStatus': null});
        } else {
        
            res.send({"success": true, 'msg': "Success", 'cropStatus': user.cropStatus});
        }
            
    } catch (err) {
        res.send({"success": false, 'msg': "Failed", 'cropStatus': null});
    }

})


module.exports = router;
