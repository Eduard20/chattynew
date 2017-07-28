
// Modules

const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const platformConfigs = require('./config/config');
const mongoRequests = require("./dbRequests/mongoRequests");
const port = platformConfigs.port;
const moment = require("moment");
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const routes = require("./routes/routes");
const auth = require("./middlewares/auth");
const jade = require("jade");
process.env.NODE_ENV = platformConfigs.mode;

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/views'));
app.set('view engine', 'jade');
app.use("/api", auth.isAuth);
app.use("/", routes);

// app.get('/', function(req, res){
//     res.sendfile('index.html');
// });

app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    })
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {}
    });
});

io.on("connection", socket => {
    var users = {};
    let roomId;
    // console.log(roomId);
    socket.on("joinChat", data => {
        if (roomId) socket.leave("room-" + roomId);
        roomId = data._id;
        socket.join("room-"+roomId)});
    socket.on('send message', function(data, callback) {
        const msg = data.message.trim();
        data.date = moment(new Date()).unix();
        mongoRequests.addMessage(data, err => {
            if (!err) io.sockets.in("room-"+roomId).emit("new message", {msg: msg, date : moment(new Date()).format("LT"), nick : data.username});

        });
    });
    socket.on('disconnect', function(data){
        if(!socket.nickname) return;
        delete users[socket.nickname];
    });
});

http.listen(port, () => {
    console.log(`listening on port ${port} in ${process.env.NODE_ENV} mode with process id ${process.pid}`);
});
