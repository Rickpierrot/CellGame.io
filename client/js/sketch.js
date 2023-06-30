var socket;

function preload() {
    // write code
}
function setup() {
    // write code
    socket = io();
    socket.emit("message", "J'entre dans le serveur !")
    socket.on('messageFromServer', function(data){
        console.log(data);
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

var x = 0;
var y = 200;

var speed = 5;

function draw() {
    // write code
    background(0,204,204);
    
    translate(windowWidth/2 - x ,windowHeight/2 - y);

    fill(51);
    rect(-300, 150, 800, 600);

    fill(200,50,50)
    beginShape();
    vertex(x, y - 45);
    vertex( x - 30, y + 45);
    vertex(x ,y + 37);
    vertex(x + 30, y + 45);
    endShape(CLOSE);

    //x += speed * Math.cos(angle(pmouseX-width/2, pmouseY-height/2)); // radiant = arctan(x/y)
    //y += speed * Math.sin(angle(pmouseX-width/2, pmouseY-height/2));

    x += speedX(speed);
    y += speedY(speed);

    speedtot();
    
}