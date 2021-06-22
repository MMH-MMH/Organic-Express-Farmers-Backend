const express = require('express');
const morgan  = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config()
const connectDB = require('./config/db');
const passport = require('passport');
const bodyParser = require('body-parser');
const PORT = process.env.PORT;

connectDB();

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(passport.initialize())
require('./config/passport')(passport)

app.use('/', require('./routes/index'));
app.use('/authenticate', require('./routes/authenticate'));

var engine = require('consolidate');
const { ConversationList } = require('twilio/lib/rest/conversations/v1/service/conversation');
app.set('views', __dirname + '/views');
app.engine('html', engine.mustache);
app.set('view engine', 'html');

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', (userSocket) => {
    console.log('socket on');
    userSocket.on("send_message", (data) => {
        console.log("send_message", data);
        userSocket.broadcast.emit("receive_message", data);
    });
 });

http.listen(PORT, console.log("Server Started at", PORT));

require('dns').lookup(require('os').hostname(), (err, add, fam) => {
    console.log('ip: ' + add);
  });

