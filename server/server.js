var path = require("path"); // path to the game
var http = require("http"); // create the server
var express = require("express"); // sending and receiving file
var socketio = require("socket.io"); // sending and receiving data

var publicPath = path.join(__dirname,"../client"); // it join 2 path together

var port = process.env.port || 2000; // open a port on 2000
var app = express(); // initialise the express library
var server = http.createServer(app); // create a server on a file responsibility (app)
var io = socketio(server); // connecting the socket library to the server
app.use(express.static(publicPath)); // This send client folder to each client who connect

// run the server on port
server.listen(port, function(){
    console.log("Server started successfully on port " + port);
});

// the client information will be stored in the socket parameter
io.on('connection', function(socket){
    console.log("Someone's connected yo ... id : " + socket.id);
    socket.on('message', function(data){
        console.log(data);
    });
    socket.emit('messageFromServer', 'Tu viens de te connecter');
});