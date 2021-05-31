const express = require('express');
const router = express.Router();

router.route('/')
.get((req, res) => {
    console.log("--", req.body);
    var contact = req.body.contact;
    console.log("contact", contact);
    res.send("Hey");
})
.post((req, res) => {
    console.log("Auth post");
    console.log("--", req.body);
    var contact = req.body.contact;
    console.log("contact", contact);
    res.send("Connected");
})

module.exports = router;