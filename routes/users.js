const express = require('express');
const actions = require('../methods/actions');
const router = express.Router();
const User = require('../models/user');

router.route('/register')
.post((req, res) => {
  if((!req.body.name)){
    res.json({success: false, msg: 'Enter all fields'});
  } else {
    var newUser = User({
      name: req.body.name,
      contact: req.body.contact
    });
    newUser.save((err) => {
      if(err){
        res.json({success: false, msg: 'Failed to save'});
      } else {
        res.json({success: true, msg: 'Successfully saved'});
      }
    });
  }
});
