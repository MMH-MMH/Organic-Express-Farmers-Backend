const express = require('express');
const actions = require('../methods/actions');
const router = express.Router();

router.route('/')
.get((req, res) => {
    res.render('index.html');
});

router.route('/dashboard', (req, res) => {
    res.send("Dashboard");
});

module.exports = router;