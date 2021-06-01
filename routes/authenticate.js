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
// .get(async (req, res) => {
//     // console.log("--", req.body);
//     // var contact = req.body.contact;
//     // console.log("contact", contact);
//     // try{
//     //     await client.messages.create({
//     //         to: '+917408159898',
//     //         body: "sms from Organic Express",
//     //         from: from
//     //     }).then(message => console.log("after", message.sid)).done();
//     // } catch(err){
//     //     console.log("otp - error", err);
//     // }
//     console.log("authenticate get --", req.body);
//     var contact = "+917408159898";
//     // console.log("contact", contact);

//     /*

//     var user = await User.findOne({'contact': contact});

//     if(!user){
//         var newUser = new User;
//         newUser.contact = contact;
//         newUser.name = "abcd";
//         await newUser.save();
//     }

//     var otp_number = random_otp();

//     await User.updateOne({ 'contact': contact }, {$set: {"otp": otp_number}});

//     var txt = "SMS from Organic Express.\nYour otp is: ";
//     txt+=(otp_number).toString();
//     txt+="\n";

//     await client.messages.create({
//         to: contact,
//         body: txt,
//         from: otp.from
//     }).then((message) => {
//         if(message.errorMessage){
//             res.send({success: false, msg: 'Otp sending Failed'});    
//             return;
//         }
//         // console.log("after", message);
//         res.send({success: true, msg: 'Otp sent successfully'});
//     }).done();

//     */
   
// })
.post(async (req, res) => {

    var index = 0;

    console.log("Auth post");
    console.log("--", req.body);
    var contact = req.body.contact;
    // console.log("contact", contact);
    contact = ("+91"+contact).toString();

    var user = await User.findOne({'contact': contact});

    if(!user){
        var newUser = new User;
        newUser.contact = contact;
        newUser.name = "abcd";
        newUser.done = false,
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
            res.send({success: false, msg: 'Otp sending Failed'});    
            return;
        }
        // console.log("after", message);
        var token = jwt.encode(user, config.secret);
        res.send({success: true, msg: 'Otp sent successfully', index: index, token: token});
    }).done();

});

router.route('/otpverify')
.post(async(req, res) => {

});



module.exports = router;