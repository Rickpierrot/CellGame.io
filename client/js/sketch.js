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

function chooseName(){
    fill(255);

    textSize(25);
    text("Hey pilot, what's your name ?", windowWidth/2 - 100, windowHeight/2 - 20);

    let inp = createInput('');
    inp.position(windowWidth/2, windowHeight/2);
    inp.size(100);
    inp.input(myInputEvent);

    button = createButton("Let's kick some asses !");
    button.position(windowWidth/2 - 18, windowHeight/2 +30);
    button.mousePressed(function(){
        myName = inp.value();
        console.log("My Name : " + myName.toString());
        socket.emit("ImReady", {name : myName.toString()});
        inp.remove();
        button.remove();
    });
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
let myName = "";

var player;
var players = [];
var projectiles = [];

let imgBg;
let imgPlayer;
let imgMissile;

socket = io();

/* ===============================================================================================
Procédure :
Input - 
Output - 
-------------------------------------------------------------------------------------------------- */

function preload() {
    imgPlayer = loadImage("./assets/spaceship.png");
    imgMissile = loadImage("./assets/missile.png");
    imgBg = loadImage("./assets/spacebg.jpeg");

}
function setup() {
    // write code
    createCanvas(windowWidth, windowHeight);
    background(imgBg);

    chooseName();

    socket.on("YourId", function(data){
        myId = data.id;
        //console.log(myId);
    })
    socket.on("CurrentElements", function(data){
        player = new Entity(data.id, data.name, data.x, data.y, data.speed, data.dx, data.dy, data.angle);
        players.push(player);
    
        console.log("Other players created");
    })

    socket.on("NewPlayer", function(data){
  
        player = new Entity(data.id, data.name, data.x, data.y, data.speed, data.dx, data.dy, data.angle);
        console.log("Name2 : " + player.name);
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
        proj = new Entity(socket.id, "Missile", data.x, data.y, data.speed, data.dx, data.dy, data.angle);
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


    // Setup
    frameRate(50);

    // Choose name window
    if (myName === ""){
    }

    else{
        background(imgBg);

        // Player Control
        if(players[0]){
            
            players[0].angle = angle(pmouseX-windowWidth/2, pmouseY-windowHeight/2);

            players[0].dx = speedX(players[0].speed);
            players[0].dy = speedY(players[0].speed);

            players[0].x += players[0].dx;
            players[0].y += players[0].dy;

            translate(windowWidth/2 - players[0].x ,windowHeight/2 - players[0].y);

        }

        // Background
        fill(90, 90, 90);
        rect(-300, 150, 800, 600);
        rect(600, 150, 800, 600);
        rect(-1200, 150, 800, 600);
        rect(-300, 850, 800, 600);
        rect(-300, -550, 800, 600);

        
        // Entity Drawing
        for(var i in projectiles){
            projectiles[i].draw();
        }

        for(var i in players){
            players[i].draw();
        }

        // HUD
        fill(255,255,255);
        if (players[0]){
            textSize(30);
            text("Your score : ", (-windowWidth/2) + 20 + players[0].x, (windowHeight/2) - 50 + players[0].y );

            textSize(25);
            text("Press SHIFT to shoot ! ", (-windowWidth/2) + 20 + players[0].x, (-windowHeight/2) + 35 + players[0].y );
        }
    }
}

function keyPressed(){
    if (keyCode === SHIFT) {
        socket.emit("InputMissile", {id : players[0].id, x : players[0].x, y : players[0].y, angle : players[0].angle})
      }
}
