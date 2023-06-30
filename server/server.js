var path = require("path"); // path to the game
var http = require("http"); // create the server
var express = require("express"); // sending and receiving file
var socketio = require("socket.io"); // sending and receiving data
var victor = require("victor");

var publicPath = path.join(__dirname,"../client"); // it join 2 path together

var port = process.env.port || 2000; // open a port on 2000
var app = express(); // initialise the express library
var server = http.createServer(app); // create a server on a file responsibility (app)
var io = socketio(server); // connecting the socket library to the server
app.use(express.static(publicPath)); // This send client folder to each client who connect

var player;
var players = [];

// run the server on port
server.listen(port, function(){
    console.log("Server started successfully on port " + port);
});

// the client information will be stored in the socket parameter
io.on('connection', function(socket){
    console.log("Someone's connected, id : " + socket.id);

    socket.on("ImReady", function(data){
        player = new Player(socket.id, "Name", 0, 0, 0.1);
        players.push(player);

        socket.emit("YourId", {id : player.id});
        io.emit("NewPlayer", player.getinfo());
    })
});

var Player = function(id, name, x, y, speed){
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.draw = function(){

        fill(200,50,50)
        beginShape();
        vertex(this.x, this.y - 45);
        vertex( this.x - 30, this.y + 45);
        vertex(this.x, this.y + 37);
        vertex(this.x + 30, this.y + 45);
        endShape(CLOSE);

    }

    this.getinfo = function(){
        return{
            id : this.id,
            x : this.x,
            y : this.y,
            speed : this.speed
        }
    }
    return false;
}
