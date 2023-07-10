/* ===============================================================================================
Procédure :
Input - 
Output - 
-------------------------------------------------------------------------------------------------- */

// ---------------------------------------------------------------------------------------------
// Initialisation du server et des ses dépendences
// ---------------------------------------------------------------------------------------------

var path = require("path"); // path to the game
var http = require("http"); // create the server
var express = require("express"); // sending and receiving file
var socketio = require("socket.io"); // sending and receiving data
var victor = require("victor"); // dépendance utilisant les vecteurs

var publicPath = path.join(__dirname,"../client"); // it join 2 path together

var port = process.env.port || 2000; // open a port on 2000
var app = express(); // initialise the express library
var server = http.createServer(app); // create a server on a file responsibility (app)
var io = socketio(server); // connecting the socket library to the server
app.use(express.static(publicPath)); // This send client folder to each client who connect


/* ===============================================================================================
Objet : Player caractèrise toute les données d'un joueur
Input : 
- id : INT id du joueur
- name : STRING Nom du joueur
- x : INT Position en x du joueur
- y : INT Position en y du joueur
- speed : INT vitesse du joueur
- dx : INT vitesse en x
- dy : INT vitesse en y
-------------------------------------------------------------------------------------------------- */

var Entity = function(id, name, x, y, speed, dx, dy, angle){
    this.id = id;
    this.name = name; 
    this.x = x; 
    this.y = y; 
    this.speed = speed; 
    this.dx = dx;
    this.dy = dy; 
    this.angle = angle;

    /* ===============================================================================================
    Procédure : Affichage du Player
    Input - VOID
    Output - VOID
    -------------------------------------------------------------------------------------------------- */
    this.draw = function(){

        //this.x += this.dx;
        //this.y += this.dy;

        fill(200,50,50)
        beginShape();
        vertex(this.x, this.y - 45);
        vertex( this.x - 30, this.y + 45);
        vertex(this.x, this.y + 37);
        vertex(this.x + 30, this.y + 45);
        endShape(CLOSE);

    }

    /* ===============================================================================================
    Fonction : Renvoie les infos du Player (pour pouvoir les envoyer en socket)
    Input - VOID
    Output - ID, x, y , speed, dx, dy
    -------------------------------------------------------------------------------------------------- */
    this.getinfo = function(){
        return{
            id : this.id,
            name : this.name,
            x : this.x,
            y : this.y,
            speed : this.speed,
            dx : this.dx,
            dy : this.dy,
            angle : this.angle
        }
    }
    return false;
}

/* ===============================================================================================
Procédure : Affichage de la liste des joueurs
Input - players : Array of Player
Output - VOID
-------------------------------------------------------------------------------------------------- */

function seePlayers(players){
    console.log("-----------------------------------------------------------");
    for (var i in players){
        console.log ("ID:" + players[i].id + " Name:" + players[i].name + " Index:" + i + " x:" + players[i].x + " y:" + players[i].y);
    }
    console.log("-----------------------------------------------------------");
}

function destroyProj(name){
    setTimeout(() => {
        var projectilesClone = projectiles;
        for (var i in projectilesClone){
            if (projectilesClone[i].name === name){
                projectiles.splice(i, 1);
                io.emit("MissileDestruction", {i : i});
            }
        }
    }, 3000)
}

/* ===============================================================================================
Procédure : Boucle pricipale d'update, envoie un ping régulièrements pour récupérer des données clients
Input - VOID
Output - VOID
-------------------------------------------------------------------------------------------------- */

function update(i){
    setTimeout(() => {

        io.local.emit("Ping", true); // Envoie de ping
        //seePlayers(projectiles);
        //seePlayers(players);

        update(i++);
    }, 20)
}

//==========================================================================================
//==========================================================================================
//                               Algorithme principale
//------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------

var players = [];
var projectiles = [];
var projnames = 0;
var i = 1;

// Run the server on port
server.listen(port, function(){
    console.log("Server started successfully on port " + port);
    update(i);
    
});

// The client information will be stored in the socket parameter

io.on('connection', function(socket){ // Callback si connexion d'un nouveau client

    console.log("Someone's connected, id : " + socket.id);

    socket.on("ImReady", function(data){ // Callback si le nouveau client soit prêt

        // Emet les données de joueurs au nouveau client
        for(var i in players){
            socket.emit("CurrentElements", players[i].getinfo()); 
        }

        // Création d'un nouveau joueur
        player = new Entity(socket.id, data.name, 0, 0, 8, 0, 0, 0);
        players.push(player);

        // Emission de l'ID au nouveau client
        socket.emit("YourId", {id : player.id});

        io.emit("NewPlayer", player.getinfo());

        socket.on("disconnect", () => { // Callback si le client se déconnecte
            console.log(socket.id + " is disconnected.");
            var indexID;
            
            // Recherche de l'index du joueurs qui se déconnecte dans players
            for (var i in players){
                if (players[i].id === socket.id){
                    indexID = i;
                }
            }
        
            console.log("Delete : " + socket.id + "  i : " + i);
            
            if (players.length === 1){players = []}
            else {players.splice(indexID, 1)}

            io.emit("DeleteThisId", socket.id); // Envoie de l'ID à delete à tout les joueurs
        });

        socket.on("InputMissile", function(data){
            projnames += 1;

            var missilename = projnames.toString();
            var speedMissile = 17;

            proj = new Entity(socket.id, missilename, data.x, data.y, speedMissile, Math.cos(data.angle)* speedMissile, Math.sin(data.angle)* speedMissile, data.angle);
            projectiles.push(proj);

            io.emit("NewMissile",proj.getinfo());
            destroyProj(missilename);
        })

        socket.on("MyPosition", function(data){ // Callback si la position est réçu
            for (var i in players){
                if (players[i].id === socket.id){
                    players[i].x = data.x;
                    players[i].y = data.y;
                    players[i].speed = data.speed;
                    players[i].dx = data.dx;
                    players[i].dy = data.dy;
                    players[i].angle = data.angle;

                    //console.log("Data de " + players[i].id);
                    io.local.emit("Update", players[i].getinfo()); // Emission de l'update
                }
            }
            
        })
        
    })
})
