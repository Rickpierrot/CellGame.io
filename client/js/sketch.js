var socket;
var myId;
var player;
var players = [];

socket = io();

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

function idNotInPlayers(players, data){
    for (var i in players){
        if(players[i].id === data.id){
            return false;
        }
        return true;
    }
}



function preload() {
    // write code
}
function setup() {
    // write code



    socket.emit("ImReady", {name : "name"});
    socket.on("YourId", function(data){
        myId = data.id;
        //console.log(myId);
    })
    socket.on("CurrentElements", function(data){
        player = new Player(data.id, "Name", data.x, data.y, data.speed);
        players.push(player);
    
        console.log("Other players created");
    })

    socket.on("NewPlayer", function(data){
  
        player = new Player(data.id, "Name", data.x, data.y, data.speed);
        if (player.id === myId){
            players.unshift(player);
        }
        else{
            players.push(player);
        }
        
        console.log("My player created at x:" + player.x, " and y: " + player.y);
        socket.on("Update", function(data){
            //console.log("Mon id: " + myId + "  id reçu en upload: " + data.id);

            
            for (var i in players){
                //console.log(players[i].id)
                if(players[i].id === data.id){
                    players[i].x = data.x;
                    players[i].y = data.y;
                    //console.log( "x = " + players[i].x + "    ID est : " + players[i].id);
                }
            }
        })

    });


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



function draw() {
    // Drawing
    background(0,204,204);
    
    if(players[0]){
        translate(windowWidth/2 - players[0].x ,windowHeight/2 - players[0].y);

        players[0].x += speedX(players[0].speed);
        players[0].y += speedY(players[0].speed);
    }
    console.log(" Nombre de players : " + players.length)
    fill(51);
    rect(-300, 150, 800, 600);

    for(var i in players){
        players[i].draw();
    }
    /*
    socket.on("NewPlayer", function(data){

        if (idNotInPlayers(players, data)){
            player = new Player(data.id, "Name", data.x, data.y, data.speed);
            players.push(player);
    
            console.log("One player created");
        }
        else{
            for (var i in players){
                if(players[i].id === data.id){
                    players[i].x = data.x;
                    players[i].y = data.y;
                }
            }
        }
    })
    */
    if (players[0]){
        socket.emit("MyPosition", { 
            id: myId,
            x: players[0].x,
            y : players[0].y,
            speed : players[0].speed});
    }
    

    // Control


}