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

var players = [];

// run the server on port
server.listen(port, function(){
    console.log("Server started successfully on port " + port);
});

function idNotInPlayers(players, data){
    for (var i in players){
        if(players[i].id === data.id){
            return false;
        }
        return true;
    }
}

// the client information will be stored in the socket parameter
io.on('connection', function(socket){
    console.log("Someone's connected, id : " + socket.id);

    socket.on("ImReady", function(data){

        for(var i in players){
            socket.emit("CurrentElements", players[i].getinfo());
            console.log("id : " + players[i].id + "  x : " + players[i].x + "  y : " + players[i].y);
        }

        player = new Player(socket.id, data.name, 0, 0, 3);
        players.push(player);

        socket.emit("YourId", {id : player.id});

        io.emit("NewPlayer", player.getinfo());


        console.log(" Nombre de players : " + players.length);
        socket.on("MyPosition", function(data){
            for (var i in players){
                if (players[i].id === socket.id){
                    players[i].x = data.x;
                    players[i].y = data.y;
                    
                }
                io.local.emit("Update", { 
                    id: players[i].id,
                    x: players[i].x,
                    y : players[i].y,
                    speed : players[i].speed});
            }
        })
        
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
        console.log("getinfo()")
        return{
            id : this.id,
            x : this.x,
            y : this.y,
            speed : this.speed
        }
    }
    return false;
}
