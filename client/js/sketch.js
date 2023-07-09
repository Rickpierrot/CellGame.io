/* ===============================================================================================
Procédure :
Input - 
Output - 
-------------------------------------------------------------------------------------------------- */

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
        
        push();
        translate(this.x, this.y);
        fill(200,50,50);

        if (this.name === "Missile"){

            rectMode(CENTER);
            rotate(this.angle);
            rect(0, 0, 5, 10);
            this.x += this.dx;
            this.y += this.dy;
        }
        else{

            textSize(13);
            text(this.id, -70, 80);
            rotate(this.angle);

            beginShape();
            vertex(0, -45);
            vertex(-30, 45);
            vertex(0, 37);
            vertex(30, 45);
            endShape(CLOSE);
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


function seePlayers(players){
    console.log("-----------------------------------------------------------");
    for (var i in players){
        console.log ("ID:" + players[i].id + " Name:" + players[i].name + " Index:" + i + " x:" + players[i].x + " y:" + players[i].y);
    }
    console.log("-----------------------------------------------------------");
}

/* ===============================================================================================
Procédure :
Input - 
Output - 
-------------------------------------------------------------------------------------------------- */

function angle(x, y){
    return Math.atan2(y,x);
}

/* ===============================================================================================
Procédure :
Input - 
Output - 
-------------------------------------------------------------------------------------------------- */

function speedX(speed){
    if( pmouseX < windowWidth/2 + 100 && pmouseX > windowWidth/2 - 100 ){
        return (speed * Math.cos(angle(pmouseX-windowWidth/2, pmouseY-windowHeight/2)) * (Math.abs(pmouseX - windowWidth/2)/100));
    }
    return speed * Math.cos(angle(pmouseX-windowWidth/2, pmouseY-windowHeight/2));
}

/* ===============================================================================================
Procédure :
Input - 
Output - 
-------------------------------------------------------------------------------------------------- */

function speedY(speed){
    if( pmouseY < windowHeight/2 + 100 && pmouseY > windowHeight/2 - 100 ){
        return (speed * Math.sin(angle(pmouseX-windowWidth/2, pmouseY-height/2)) *(Math.abs(pmouseY - windowHeight/2)/100));
    }
    return speed * Math.sin(angle(pmouseX-windowWidth/2, pmouseY-windowHeight/2));
}

function destroyProj(i){
    setTimeout(() => {
        projectiles.splice(i, 1);
    }, 3000)
}

/* ================================================================================================
===================================================================================================
                                Algorithme principale
---------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------*/
var socket;
var myId;
var player;
var players = [];
var projectiles = [];

socket = io();

/* ===============================================================================================
Procédure :
Input - 
Output - 
-------------------------------------------------------------------------------------------------- */

function preload() {
    // write code
}
function setup() {
    // write code
    createCanvas(windowWidth, windowHeight);


    socket.emit("ImReady", {name : "name"});
    socket.on("YourId", function(data){
        myId = data.id;
        //console.log(myId);
    })
    socket.on("CurrentElements", function(data){
        player = new Entity(data.id, "Name", data.x, data.y, data.speed, data.dx, data.dy, data.angle);
        players.push(player);
    
        console.log("Other players created");
    })

    socket.on("NewPlayer", function(data){
  
        player = new Entity(data.id, "Name", data.x, data.y, data.speed, data.dx, data.dy, data.angle);
        if (player.id === myId){
            players.unshift(player);
        }
        else{
            players.push(player);
        }
        
        console.log("Player created at x:" + player.x, " and y: " + player.y);

        socket.on("Ping", function(){
            if (players[0]){
                socket.emit("MyPosition", players[0].getinfo());
            }


            socket.on("Update", function(data){
                
                for (var i in players){
                    //seePlayers(players);
                    if(players[i].id === data.id && myId !== data.id){
                        players[i].x = data.x;
                        players[i].y = data.y;
                        players[i].speed = data.speed;
                        players[i].dx = data.dx;
                        players[i].dy = data.dy;
                        players[i].angle = data.angle;
                        //console.log( "x = " + players[i].x + "    ID est : " + players[i].id);
                    }
                }
            })
        })
    });
    socket.on("NewMissile", function(data){
        proj = new Entity(socket.id, "Missile", data.x, data.y, 12, Math.cos(data.angle - Math.PI/2)* 12, Math.sin(data.angle - Math.PI/2)* 12, data.angle);
        projectiles.push(proj);
    })

    socket.on("MissileDestruction", function(data){
        projectiles.splice(data.i, 1);
    })

    socket.on("DeleteThisId", function(data){
        var indexID;
        for (var i in players){
            if (players[i].id === data){
                indexID = i;
            }
        }
        console.log( "Destroy ID:" + data);
        players.splice(indexID, 1);

    })
}

/* ===============================================================================================
Procédure :
Input - 
Output - 
-------------------------------------------------------------------------------------------------- */

function draw() {
    // Drawing
    frameRate(60);
    background(0,204,204);
    
    if(players[0]){
        translate(windowWidth/2 - players[0].x ,windowHeight/2 - players[0].y);
        
        players[0].angle = angle(pmouseX-windowWidth/2, pmouseY-height/2) + (Math.PI / 2);

        players[0].dx = speedX(players[0].speed);
        players[0].dy = speedY(players[0].speed);

        players[0].x += players[0].dx;
        players[0].y += players[0].dy;

    }
    
    fill(51);
    rect(-300, 150, 800, 600);

    for(var i in players){
        players[i].draw();
    }

    for(var i in projectiles){
        projectiles[i].draw();
    }

    seePlayers(projectiles);
}

function keyPressed(){
    if (keyCode === LEFT_ARROW) {
        socket.emit("InputMissile", {id : players[0].id, x : players[0].x, y : players[0].y, angle : players[0].angle})
      }
}