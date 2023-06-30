var socket;
var playernum1;
var playernum2;
var player;
var players = [];

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
    return false;
}



function preload() {
    // write code
}
function setup() {
    // write code


    socket = io();

    socket.emit("ImReady", {name : "name"});
    socket.on("YourId", function(data){
        myId = data.id;
    })
    socket.on("NewPlayer", function(data){
        player = new Player(data.id, "Name", data.x, data.y, data.speed)
        players.push(player);
    })

    

    createCanvas(windowWidth, windowHeight);

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

function speedtot(speed){
    console.log(Math.sqrt((speedX(speed)^2))+(speedY(speed)^2));
}


function draw() {
    // Drawing
    background(0,204,204);
    
    socket.on("NewPlayer", function(data){
        player = new Player(data.id, "Name", data.x, data.y, data.speed)
        players.push(player);
    })

    if(players[0]){
        translate(windowWidth/2 - players[0].x ,windowHeight/2 - players[0].y);

        players[0].x += speedX(players[0].speed);
        players[0].y += speedY(players[0].speed);
    }

    fill(51);
    rect(-300, 150, 800, 600);

    for(var i in players){
        players[i].draw();
    }
    

    // Control

}