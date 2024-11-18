var ai,
aiSize = 18,
seSize = 30,
y,
y1,
y2,
y3, bSize=15, 
bSpeed1=0, 
bSpeed2=0, 
bSpeed3=0, 
yDir1=1,
yDir2=1,
yDir3=1,
isTraining=true, 
getTime=10,
next=true, 
moveY=true, 
canNext=false,
movement=1,
rx,
ry,
randY,
addGen=false,
canMove=true,
isCollided=false;
const vertex = [0,0,0];
function setup(){
    createCanvas(300,300);
    ai = new GameAI({
        tag: 'ai',
        position:{
            x: (seSize-aiSize)/2,
            y: height/2
        },
        size:{
            w: aiSize,
            h: aiSize
        },
        speed: 1
    });
    yDir = int(random(1)) ? -1 : 1;
    y=(height/2);
    y1=(height/2);
    y2=(height/2);
    y3=(height/2);
    vertex[0] = (seSize-aiSize)/2;
    vertex[1] = height/2;
    rx = ai.get(ai.select('ai'),`position,x`),
    ry = ai.get(ai.select('ai'),`position,y`);
    randY = height/2;
}

function setCircles(){
    fill("blue");

    bSpeed1 = int(random(10,30));
    bSpeed2 = int(random(10,30));
    bSpeed3 = int(random(10,30));

    // Update positions for each circle with different speeds
    y1 = constrain(y1 + bSpeed1 * yDir1, 0, height);
    y2 = constrain(y2 + bSpeed2 * yDir2, 0, height);
    y3 = constrain(y3 + bSpeed3 * yDir3, 0, height);
    
    // Apply bouncing behavior (change direction when hitting top or bottom)
    if (y1 > height - bSize / 2 || y1 < bSize / 2) {
        yDir1 = -yDir1;
    }
    if (y2 > height - bSize / 2 || y2 < bSize / 2) {
        yDir2 = -yDir2;
    }
    if (y3 > height - bSize / 2 || y3 < bSize / 2) {
        yDir3 = -yDir3;
    }

    // Draw the circles at different positions with different speeds
    circle((0 + seSize) * (PI * QUARTER_PI), y1, bSize);   // Circle 1
    circle((0 + seSize) * (PI * HALF_PI), height - y2, bSize); // Circle 2
    circle((0 + seSize) * (Math.pow(PI, 2) * QUARTER_PI), y3, bSize); // Circle 3
}

function draw(){
    let pos = ai.get(ai.select('ai'),'attributes,matrix',[[(seSize-aiSize)/2,height/2,0]]), size = ai.get(ai.select('ai'),'size');
    background(200);
    noStroke();
    fill('black');
    textSize(18);
    text(`Generation: ${ai.toVertexArray().gen}`,seSize, 15);
    fill('lime');
    rect(0,0,seSize,height);
    fill('lime');
    rect(width-seSize,0,seSize,height);
    
    setCircles();
    fill(0);
    rect(pos[pos.length-1][0],pos[pos.length-1][1],size.w,size.h);
    
    ai.train((o,mode)=>{
        if((mode&&o['attributes']['matrix'])){
            if(o['attributes']['matrix'].length==0) o['attributes']['matrix'].push([vertex[0],vertex[1],0]);
            const len = ai.get(ai.select('ai'),'attributes,matrix').length;
            movement = canNext ? int(random(2)) : movement;
            if(moveY){
                randY = int(random(0,height-o.size.h));
                moveY = false;
            }else randY = randY;
            const matrix = ai.getVertex(len-1);
            if(canMove){
            if(movement){
                vertex[0] = (matrix[0] += o.speed);
                canNext = true;
                moveY = true;
            }else{
                if(randY>matrix[1])
                    vertex[1] = (matrix[1] += o.speed);
                else if(randY<matrix[1])
                    vertex[1] = (matrix[1] -= o.speed);
                else {canNext = true; moveY=true;}
            } 
            ai.addVertex(vertex);
            ai.addStep(vertex);

            
            
            //x1, y1, width1, height1, cx, cy, diameter
            if(collideRectCircle(vertex[0],vertex[1],o['size']['w'],o['size']['h'],((0+seSize)*(PI*QUARTER_PI)),y1,bSize)&&!isCollided){
                isCollided = true;
                canMove = false;
                
            }
            if(collideRectCircle(vertex[0],vertex[1],o['size']['w'],o['size']['h'],((0+seSize)*(PI*HALF_PI)),y2,bSize)&&!isCollided){
                isCollided = true;
                canMove = false;
                
            }
            if(collideRectCircle(vertex[0],vertex[1],o['size']['w'],o['size']['h'],((0+seSize)*(Math.pow(PI,2)*QUARTER_PI)),y3,bSize)&&!isCollided){
                isCollided = true;
                canMove = false;
                
            }
            if(collideRectRect(vertex[0], vertex[1], o['size']['w'], o['size']['h'], width-(seSize/2),0,seSize,height)){
                isTraining = false;
            }
        }
        }else {
            const results = ai.end();
            const chart = new chartJS('body');
            chart.add(ai);
            chart.linearRegression();
        }
        if(isCollided){
            ai.reset(rx,ry);
            ai.addGen();
            o['speed']+=.5;
            vertex[0] = (seSize-aiSize)/2;
            vertex[1] = height/2;
            isCollided = false;
            setTimeout(()=>{
                canMove = true;
            },200);
        }
    },isTraining);

    
}