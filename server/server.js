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


var Player = function(id, name, x, y, speed, dx, dy){
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.dx = dx;
    this.dy = dy;
    this.draw = function(){

        this.x += this.dx;
        this.y += this.dy;

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
            speed : this.speed,
            dx : this.dx,
            dy : this.dy
        }
    }
    return false;
}

function update(){
    setTimeout(() => {

        io.local.emit("Ping", true);
        //console.log("Ping n°" + i);

        update(i++);
    }, 150)
}

//------------------------------------------------------------------------------------------
// Run part
//------------------------------------------------------------------------------------------
var players = [];
var i = 1;
// run the server on port
server.listen(port, function(){
    console.log("Server started successfully on port " + port);
    update(i);
    
});

// the client information will be stored in the socket parameter
io.on('connection', function(socket){
    console.log("Someone's connected, id : " + socket.id);

    socket.on("ImReady", function(data){

        for(var i in players){
            socket.emit("CurrentElements", players[i].getinfo());
        }

        player = new Player(socket.id, data.name, 0, 0, 6, 0, 0);
        players.push(player);

        socket.emit("YourId", {id : player.id});

        io.emit("NewPlayer", player.getinfo());

        socket.on("MyPosition", function(data){
            for (var i in players){
                if (players[i].id === socket.id){
                    players[i].x = data.x;
                    players[i].y = data.y;
                    players[i].speed = data.speed;
                    players[i].dx = data.dx;
                    players[i].dy = data.dy;

                    console.log("Data de " + players[i].id);
                    io.local.emit("Update", players[i].getinfo());
                }
            }
            
        })
        
    })
});
