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

var Statut = function(type, health, energy, xbox, ybox){

    this.type = type;
    this.health = health;
    this.energy = energy;
    this.xbox = xbox;
    this.ybox = ybox;

    return false;
}

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

var Coordinates = function(id, name, x, y, speed, dx, dy, angle){
    this.id = id;
    this.name = name; 
    this.x = x; 
    this.y = y; 
    this.speed = speed; 
    this.dx = dx;
    this.dy = dy; 
    this.angle = angle;
    
    return false;
}


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

var Entity = function(coordinate, statut){
    this.id = coordinate.id;
    this.name = coordinate.name; 
    this.x = coordinate.x; 
    this.y = coordinate.y; 
    this.speed = coordinate.speed; 
    this.dx = coordinate.dx;
    this.dy = coordinate.dy; 
    this.angle = coordinate.angle;

    this.type = statut.type;
    this.health = statut.health;
    this.energy = statut.energy;
    this.xbox = statut.xbox;
    this.ybox = statut.ybox;

    /* ===============================================================================================
    Procédure : Affichage du Player
    Input - VOID
    Output - VOID
    -------------------------------------------------------------------------------------------------- */
    this.draw = function(){
        
        push();
        translate(this.x, this.y);
        fill(200,50,50);

        if (this.type === "projectile"){

            rotate(this.angle);
            imageMode(CENTER);
            image(imgMissile, 0, 0, 40, 40);
            this.x += this.dx;
            this.y += this.dy;
        }
        else{

            textSize(18);
            textAlign(CENTER);
            text(this.name, 0, -80);
            rotate(this.angle);

            imageMode(CENTER);
            image(imgPlayer, 0, 0, 200, 200);
        }
        pop();

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
            angle : this.angle,

            type : this.type,
            health : this.health,
            energy : this.energy,
            xbox : this.xbox,
            ybox : this.ybox
        }

    }
    this.getPosition = function(){
        return{
            id : this.id,
            x : this.x,
            y : this.y,
            dx : this.dx,
            dy : this.dy,
            angle : this.angle,
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

function newEntity(data, list){
    let coord = new Coordinates(data.id, data.name, data.x, data.y, data.speed, data.dx, data.dy, data.angle);
    let statut = new Statut(data.type, data.health, data.energy, data.xbox, data.ybox);

    let entity = new Entity(coord, statut);

    if(list === "players"){
        players.push(entity);
        console.log("Player created at x:" + entity.x, " and y: " + entity.y);
    }
    if(list === "projectiles"){
        projectiles.push(entity);
    }
}


function collisionProjectiles(){
    let projectilesClone = JSON.parse(JSON.stringify(projectiles)); // cloning

    for (var i in projectilesClone){
        for (var j in players){
            if (projectilesClone[i].id != players[j].id 
                && projectilesClone[i].x >= players[j].x - (players[j].xbox/2)
                && projectilesClone[i].x <= players[j].x + (players[j].xbox/2)
                && projectilesClone[i].y >= players[j].y - (players[j].ybox/2)
                && projectilesClone[i].y <= players[j].y + (players[j].ybox/2)){
                    for (var k in projectiles){
                        if (projectilesClone[i].name === projectiles[k].name){
                            impactEffect(projectiles[k], players[j]);
                            projectiles.splice(k, 1);
                            io.emit("MissileDestruction", {i : k});
                        }
                    }
                }
        }
    }
}

function impactEffect(projectile, player){
    if (projectile.type === "projectile"){
        for (var i in players){
            if(players[i].id === projectile.id){
                players[i].energy += 10;
                io.emit("WinPoint", {id : players[i].id , energy : players[i].energy});
            }
        }
    }
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

function update(){
    setTimeout(() => {

        io.local.emit("Ping", true); // Envoie de ping

        for (var i in projectiles){ // Update interne des projectiles
            projectiles[i].x += projectiles[i].dx;
            projectiles[i].y += projectiles[i].dy;
        }


        // Collisions
        collisionProjectiles()

        //seePlayers(projectiles);
        //seePlayers(players);

        update();
    }, 20)
}

//==========================================================================================
//==========================================================================================
//                               Algorithme principale
//------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------

var players = [];
var projectiles = [];
let missileSpeed = 22;

var projnames = 0;

// Run the server on port
server.listen(port, function(){
    console.log("Server started successfully on port " + port);
    update();
    
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
        let newData = {
            id : socket.id,
            name : data.name,
            x : 0,
            y : 0,
            speed : 13,
            dx : 0,
            dy : 0,
            angle : 0,

            type : "player",
            health : 20,
            energy : 0,
            xbox : 120,
            ybox : 120,
        }

        newEntity(newData, "players");

        // Emission de l'ID au nouveau client
        socket.emit("YourId", {id : newData.id});

        io.emit("NewPlayer", newData);

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
            

            let newData = {
                id : data.id,
                name : projnames.toString(),
                x : data.x,
                y : data.y,
                speed : missileSpeed,
                dx : Math.cos(data.angle)* missileSpeed,
                dy : Math.sin(data.angle)* missileSpeed,
                angle : data.angle,
                
                type : "projectile",
                health : 0,
                energy : 0,
                xbox : 10,
                ybox : 10
            }

            newEntity(newData, "projectiles")

            io.emit("NewMissile",newData);
            destroyProj(newData.name);
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
                    io.local.emit("Update", players[i].getPosition()); // Emission de l'update
                }
            }
            
        })
        
    })
})
