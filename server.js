const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const fs = require('fs');


const config = require('./config/database');
const path  = require('path');
const auth = require('./routes/auth');
const blogs = require('./routes/blogs');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = process.env.port || 8080;
const chat = require('./routes/chat');
const chatCont = require('./controllers/chatController');
chatCont.sockets(io);




const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(config.uri, function (err) {
    if(err){
        console.log('Error: Not Connect to Database ' + err);
    }else {
        //console.log(config.secret);
        console.log('Connect to Database ' + config.uri);
    }
});
app.use(cors({
    origin: 'http://localhost:4200'
}));

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.static(__dirname + '/client/dist/'));
app.use('/blogs', blogs);
app.use('/auth', auth);
app.use('/chat', chat);

app.use('/assets' , express.static(path.join(__dirname + '/assets')));

app.use(function(req, res, next) {
//set headers to allow cross origin request.
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


app.get('*', function (req,res,next) {
   res.sendFile(path.join(__dirname + '/client/dist/index.html'));
});

app.get('/', function (req,res,next) {
    res.send('hello world');
});

server.listen(port, function () {
    console.log('listening on port ' + port);
});

module.exports.io = io;