const express = require('express');
const morgan  = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');
const passport = require('passport');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;

connectDB();

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(passport.initialize())
require('./config/passport')(passport)

app.use('/', require('./routes/index'));
app.use('/authenticate', require('./routes/authenticate'));

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

app.listen(PORT, console.log("Server Started"));