const express = require('express');
const actions = require('../methods/actions');
const router = express.Router();

router.route('/')
.get((req, res) => {
    res.send("Started Organic Express Farmeres Backend");
});

router.route('/dashboard', (req, res) => {
    res.send("Dashboard");
});

router.route('/getinfo')
.get(actions.getinfo);

module.exports = router;