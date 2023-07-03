var socket;
var myId;
var player;
var players = [];

socket = io();

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
        player = new Player(data.id, "Name", data.x, data.y, data.speed, data.dx, data.dy);
        players.push(player);
    
        console.log("Other players created");
    })

    socket.on("NewPlayer", function(data){
  
        player = new Player(data.id, "Name", data.x, data.y, data.speed, data.dx, data.dy);
        if (player.id === myId){
            players.unshift(player);
        }
        else{
            players.push(player);
        }
        
        console.log("My player created at x:" + player.x, " and y: " + player.y);

        socket.on("Ping", function(){
            if (players[0]){
                socket.emit("MyPosition", players[0].getinfo());
            }

            socket.on("Update", function(data){
                
                for (var i in players){
                    //console.log(players[i].id)
                    if(players[i].id === data.id){
                        players[i].x = data.x;
                        players[i].y = data.y;
                        players[i].speed = data.speed;
                        players[i].dx = data.dx;
                        players[i].dy = data.dy;
                        //console.log( "x = " + players[i].x + "    ID est : " + players[i].id);
                    }
                }
            })
        })
    });

}

function angle(x, y){
    return Math.atan2(y,x);
}

function speedX(speed){
    if( pmouseX < windowWidth/2 + 100 && pmouseX > windowWidth/2 - 100 ){
        return (speed * Math.cos(angle(pmouseX-windowWidth/2, pmouseY-windowHeight/2)) * (Math.abs(pmouseX - windowWidth/2)/100));
    }
    return speed * Math.cos(angle(pmouseX-windowWidth/2, pmouseY-windowHeight/2));
}

function speedY(speed){
    if( pmouseY < windowHeight/2 + 100 && pmouseY > windowHeight/2 - 100 ){
        return (speed * Math.sin(angle(pmouseX-windowWidth/2, pmouseY-height/2)) *(Math.abs(pmouseY - windowHeight/2)/100));
    }
    return speed * Math.sin(angle(pmouseX-windowWidth/2, pmouseY-windowHeight/2));
}

function draw() {
    // Drawing
    frameRate(60);
    background(0,204,204);
    
    if(players[0]){
        translate(windowWidth/2 - players[0].x ,windowHeight/2 - players[0].y);

        players[0].dx = speedX(players[0].speed);
        players[0].dy = speedY(players[0].speed);

    }
    
    fill(51);
    rect(-300, 150, 800, 600);

    for(var i in players){
        players[i].draw();
    }
}