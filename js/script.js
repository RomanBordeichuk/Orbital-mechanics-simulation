//  ******************* CONSTANTS *******************

const density = 1;
const G = 5000;
const FPS = 30;
const runTime = true;
const showTrajectory = false;
const spaceWidth = 100000;
const spaceHeight = 100000;

let numObjects = 4;
let objectList = [];

let massList = [];
let posXList = [];
let posYList = [];
let directionList = [];
let speedList = [];

const space = document.querySelector(".obj_area");
space.style.width = spaceWidth + "px";
space.style.height = spaceHeight + "px";

const noteSpace = document.querySelector(".noteSpace");
const objectListInfo = document.querySelector(".info_block_list");
const controlsBlock = document.querySelector(".controls_block");
const objOptionsBlock = document.querySelector(".options_block");
const objConfigBlock = document.querySelector(".setObjConfig_block");
const objRandConfigBlock = document.querySelector(".setRandConfig_block");
const objCreationBLock = document.querySelector(".createObject_block");
const objDeletionBlock = document.querySelector(".deleteObject_block");

//  ******************* OBJECTS *******************

class SObject{
    constructor(m, x, y){
        this.x = x + spaceWidth / 2;
        this.y = y + spaceHeight / 2;

        this.dx = 0;
        this.dy = 0;

        this.id;
        this.mass = m;
        this.diameter = (m ** 0.5) / density;

        this.velocity;
        this.accelerationList = [];

        this.activeShowInfo = false;
        this.activeInfoConfig = false;
        this.activeDeletionLabel = false;

        this.obj = document.createElement("div");
        this.obj.classList.add("circle");
        space.append(this.obj);
    }
    initObjectInfo(){
        this.objInfo = document.createElement("div");
        this.objInfo.classList.add("object_info");
        this.objInfo.addEventListener("click", () => showCertainObject(this));
        objectListInfo.append(this.objInfo);

        this.spanId = document.createElement("span");
        this.spanId.classList.add("spanId");
        this.spanId.textContent = "ID: " + this.id;
        this.objInfo.append(this.spanId);

        this.spanMass = document.createElement("span");
        this.objInfo.append(this.spanMass);

        this.spanX = document.createElement("span");
        this.objInfo.append(this.spanX);

        this.spanY = document.createElement("span");
        this.objInfo.append(this.spanY);

        this.spanDirection = document.createElement("span");
        this.objInfo.append(this.spanDirection);

        this.spanSpeed = document.createElement("span");
        this.objInfo.append(this.spanSpeed);

        this.initConfigInfo();
        this.initDeletionInfo();
    }
    initConfigInfo(){
        this.configInfo = document.createElement("div");
        this.configInfo.classList.add("object_config");
        objConfigBlock.append(this.configInfo);

        this.configSpanId = document.createElement("span");
        this.configSpanId.classList.add("spanId");
        this.configSpanId.textContent = "ID: " + this.id;
        this.configInfo.append(this.configSpanId);

        this.configSpanMass = document.createElement("span");
        this.configSpanMass.innerHTML = 'Mass: <input type="text" value="' + this.mass + '">';
        this.configInfo.append(this.configSpanMass);

        this.configSpanX = document.createElement("span");
        this.configSpanX.innerHTML = 
            'X: <input type="text" value="' + (this.x - spaceWidth / 2) + '">';
        this.configInfo.append(this.configSpanX);

        this.configSpanY = document.createElement("span");
        this.configSpanY.innerHTML = 
            'Y: <input type="text" value="' + (this.y - spaceWidth / 2) + '">';
        this.configInfo.append(this.configSpanY);

        this.configSpanDirection = document.createElement("span");
        this.configSpanDirection.innerHTML = 
            'Direction: <input type="text" value="' + this.velocity.direction + '">';
        this.configInfo.append(this.configSpanDirection);

        this.configSpanSpeed = document.createElement("span");
        this.configSpanSpeed.innerHTML = 
            'Speed: <input type="text" value="' + this.velocity.module + '">';
        this.configInfo.append(this.configSpanSpeed);
    }
    initDeletionInfo(){
        this.deletionInfo = document.createElement("div");
        this.deletionInfo.classList.add("object_del");
        this.deletionInfo.innerHTML = "ID: " + this.id;
        this.deletionInfo.addEventListener("click", () => deleteObject(this));
        objDeletionBlock.append(this.deletionInfo);
    }
    changeObjectInfo(){
        this.spanMass.textContent = "Mass: " + this.mass;
        this.spanX.textContent = "X: " + (this.x - spaceWidth / 2).toFixed(3);
        this.spanY.textContent = "Y: " + (this.y - spaceWidth / 2).toFixed(3);
        this.spanDirection.textContent = "Direction: " + 
        this.velocity.direction.toFixed(3);
        this.spanSpeed.textContent = "Speed: " + this.velocity.module.toFixed(3);
    }
    initVelocity(m, d){
        this.velocity = new Velocity(m, d, this.x, this.y);
    }
    change(){
        if(this.accelerationList){
            this.accelerationList.forEach(a => a.change());
        }

        let adx = 0;
        let ady = 0;

        for(let i = 0; i < objectList.length - 1; i++){
            adx += this.accelerationList[i].dx;
            ady += this.accelerationList[i].dy;
        }

        this.dx = (this.velocity.dx + adx / FPS / 2) / FPS + adx * ((1 / FPS) ** 2) / 2;
        this.dy = (this.velocity.dy + ady / FPS / 2) / FPS + ady * ((1 / FPS) ** 2) / 2;

        this.velocity.dx += adx / FPS;
        this.velocity.dy += ady / FPS;

        this.velocity.change();
    }
    update(){
        this.x += this.dx;
        this.y += this.dy;

        this.velocity.x = this.x;
        this.velocity.y = this.y;
        this.velocity.update();

        if(this.accelerationList){
            this.accelerationList.forEach(a => {
                a.x = this.x;
                a.y = this.y;
                a.update();
            });
        }

        this.obj.style.width = this.diameter + "px";
        this.obj.style.height = this.diameter + "px";
        this.obj.style.left = this.x - (this.diameter / 2) + "px";
        this.obj.style.top = this.y - (this.diameter / 2) + "px";

        this.changeObjectInfo();

        if(showTrajectory){
            let p = document.createElement("div");
            p.classList.add("point");
            p.style.left = this.x - 2 + "px";
            p.style.top = this.y - 2 + "px";
            space.append(p);            
        }
    }
}

class Acceleration{
    constructor(id){
        this.id = id;

        this.module;
        this.direction;

        this.x;
        this.y;

        this.dx; 
        this.dy;

        this.obj = document.createElement("div");
        this.obj.classList.add("line");
        space.append(this.obj);
    }
    change(){
        for(let i = 0; i < objectList.length; i++){
            if(objectList[i].id == this.id){
                let dx = objectList[i].x - this.x;
                let dy = objectList[i].y - this.y;

                let r = (dx ** 2 + dy ** 2) ** 0.5;

                if(r){
                    this.module = G * objectList[i].mass / (r ** 2);
                    this.direction = Math.atan(dy / dx) / Math.PI * 180;
                }else{
                    this.module = 0;
                    this.direction = 0;
                }
        
                if(dx < 0){
                    if(this.direction >= 0) this.direction -= 180;
                    else this.direction += 180;
                }
        
                this.dx = this.module * Math.cos(this.direction * Math.PI / 180);
                this.dy = this.module * Math.sin(this.direction * Math.PI / 180);

                break;
            }
        }
    }
    update(){
        this.obj.style.width = (this.module ** 0.7) + "px";
        this.obj.style.transform = "rotate(" + this.direction + "deg)";
        this.obj.style.left = this.x - ((this.module ** 0.7) / 2 * 
            (1 - Math.cos(this.direction * Math.PI / 180))) + "px";
        this.obj.style.top = this.y + ((this.module ** 0.7) / 2 * 
            Math.sin(this.direction * Math.PI / 180)) - 1 + "px";
    }
}

class Velocity{
    constructor(m, d, x, y){
        this.module = m;
        this.direction = d;
        this.x = x;
        this.y = y;

        this.dx = this.module * Math.cos(this.direction * Math.PI / 180); 
        this.dy = this.module * Math.sin(this.direction * Math.PI / 180);

        this.obj = document.createElement("div");
        this.obj.classList.add("line");
        space.append(this.obj);
    }
    change(){
        this.module = (this.dx ** 2 + this.dy ** 2) ** 0.5;
        this.direction = Math.atan(this.dy / this.dx) / Math.PI * 180;
    
        if(this.dx < 0){
            if(this.direction >= 0) this.direction -= 180;
            else this.direction += 180; 
        }
    }
    update(){
        this.obj.style.width = (this.module ** 0.7) + "px";
        this.obj.style.transform = "rotate(" + this.direction + "deg)";
        this.obj.style.left = this.x - ((this.module ** 0.7) / 2 * 
            (1 - Math.cos(this.direction * Math.PI / 180))) + "px";
        this.obj.style.top = this.y + ((this.module ** 0.7) / 2 * 
            Math.sin(this.direction * Math.PI / 180)) - 1 + "px";
    }
}

class GravityPoint{
    constructor(m, x, y){
        this.mass = m;
        this.x = x;
        this.y = y;

        this.obj = document.createElement("div");
        this.obj.classList.add("point");
        space.append(this.obj);

        this.obj.style.left = this.x + "px";
        this.obj.style.top = this.y + "px";
    }
    change(){};
    update(){};
}

//  ******************* TIME FLOWING *******************

let running;

function start(){
    running = setInterval(run, 1000 / FPS);
}
function stop(){
    clearInterval(running);
}

//  ******************* CONTROLS *******************

setTimeout(startScrollPos, 50);

function startScrollPos(){
    window.scrollTo(spaceWidth / 2, spaceHeight / 2);
}

let isRunning = false;

document.addEventListener("keydown", (event) => {
    if(event.key == " "){
        event.preventDefault();

        if(runTime){
            if(!isRunning){
                start();
                isRunning = true;

                noteSpace.innerText = "Press Space to pause";
            }
            else{
                stop();
                isRunning = false;

                noteSpace.innerText = "Press Space to start";
            }
        }
        else run();
    }
});

resetRunning();

function resetRunning(){
    if(confirm(
        "Caution, all changes will be deleted. Do you realy agree to reset confiquration?"
    )){
        setTimeout(startScrollPos, 50);

        stop();
        isRunning = false;

        massList = [500, 100, 50, 50];
        posXList = [400, 600, 500, 530];
        posYList = [300, 300, 130, 400];
        directionList = [-100, 40, 90, 120];
        speedList = [50, 100, 70, 100];
    
        numObjects = 4;

        updateRunning();
    }
}
function changeRunning(){
    let paramsCorrect = true;

    for(let i = 0; i < objectList.length; i++){
        if(objectList[i]){
            if(!(
                parseInt(objectList[i].configSpanMass.querySelector("input").value) &&
                parseInt(objectList[i].configSpanX.querySelector("input").value) &&
                parseInt(objectList[i].configSpanY.querySelector("input").value) &&
                parseInt(objectList[i].configSpanDirection.querySelector("input").value) &&
                parseInt(objectList[i].configSpanSpeed.querySelector("input").value)
            )) paramsCorrect = false;
        }
    }

    if(paramsCorrect){    
        for(let i = 0; i < objectList.length; i++){
            if(objectList[i]){
                let id = objectList[i].id;
                massList[id] = parseInt(objectList[i].configSpanMass.querySelector("input").value);
                posXList[id] = parseInt(objectList[i].configSpanX.querySelector("input").value);
                posYList[id] = parseInt(objectList[i].configSpanY.querySelector("input").value);
                directionList[id] = 
                    parseInt(objectList[i].configSpanDirection.querySelector("input").value);
                speedList[id] = parseInt(objectList[i].configSpanSpeed.querySelector("input").value);
            }
        }

        updateRunning();
    }
    else alert("Some of parameters had given incorrectly");
}

function createRandomConfig(){
    if(
        (parseFloat(objRandConfigBlock.querySelector(".divMass input").value) &&
        parseFloat(objRandConfigBlock.querySelector(".divMassDiap input").value) &&
        parseFloat(objRandConfigBlock.querySelector(".divDirection input").value) &&
        parseFloat(objRandConfigBlock.querySelector(".divDirectionDiap input").value) &&
        parseFloat(objRandConfigBlock.querySelector(".divSpeed input").value) &&
        parseFloat(objRandConfigBlock.querySelector(".divSpeedDiap input").value) &&
        parseFloat(objRandConfigBlock.querySelector(".divNumObjects input").value) &&
        parseFloat(objRandConfigBlock.querySelector(".divAreaX input").value) &&
        parseFloat(objRandConfigBlock.querySelector(".divAreaY input").value) &&
        parseFloat(objRandConfigBlock.querySelector(".divAreaRadius input").value))
    ){
        if(confirm(
            "Do you realy want to set random configuration with current parameters?"
        )){
            let massValue = 
                parseFloat(objRandConfigBlock.querySelector(".divMass input").value);
            let massDiap = 
                parseFloat(objRandConfigBlock.querySelector(".divMassDiap input").value);
            let directionValue =
                parseFloat(objRandConfigBlock.querySelector(".divDirection input").value);
            let directionDiap =
                parseFloat(objRandConfigBlock.querySelector(".divDirectionDiap input").value);
            let speedValue =
                parseFloat(objRandConfigBlock.querySelector(".divSpeed input").value);
            let speedDiap =
                parseFloat(objRandConfigBlock.querySelector(".divSpeedDiap input").value);
            let numRandObjects =
                parseFloat(objRandConfigBlock.querySelector(".divNumObjects input").value);
            let areaX = 
                parseFloat(objRandConfigBlock.querySelector(".divAreaX input").value);
            let areaY =
                parseFloat(objRandConfigBlock.querySelector(".divAreaY input").value);
            let areaRadius =
                parseFloat(objRandConfigBlock.querySelector(".divAreaRadius input").value);
            
            let squareArea = Math.PI * areaRadius ** 2;
            let sumSquareObj = numRandObjects * Math.PI * 
            (((massValue + massDiap * 0.5) ** 0.5) / density / 2) ** 2;

            if(sumSquareObj * 5 < squareArea){
                for(let creationCount = 1; creationCount <= numRandObjects;){
                    let mass = massValue + 2 * massDiap * (Math.random() - 0.5);
                    if(mass < 1) mass = 1;

                    let direction = directionValue + 2 * directionDiap * (Math.random() - 0.5);
                    if(direction < -180) direction = -180;
                    else if(direction > 180) direction = 180;

                    let speed = speedValue + 2 * speedDiap * (Math.random() - 0.5);
                    if(speed < 1) speed = 1;

                    let radius = mass ** 0.5 / density / 2;
                    let x;
                    let y;
                    let hasIntersect = false;

                    do{
                        hasIntersect = false;

                        x = areaX + areaRadius * 2 * (Math.random() - 0.5);
                        y = areaY + areaRadius * 2 * (Math.random() - 0.5);

                        if(((x - areaX) ** 2 + (y - areaY) ** 2) ** 0.5 < areaRadius){
                            for(let i = 0; i < objectList.length; i++){
                                let secondX = posXList[i];
                                let secondY = posYList[i];
                                let secondRadius = massList[i] ** 0.5 / density / 2;
        
                                if(
                                    ((x - secondX) ** 2 + (y - secondY) ** 2) ** 0.5 <
                                    radius + secondRadius
                                ){
                                    hasIntersect = true;
                                    break;
                                }
                            }
                        }
                        else hasIntersect = true;
                    }
                    while(hasIntersect);

                    massList.push(mass);
                    posXList.push(x);
                    posYList.push(y);
                    directionList.push(direction);
                    speedList.push(speed);

                    numObjects++;
                    creationCount++;

                    updateRunning();
                }
            }
            else alert("There are not enough place to create configuration");
        }
    }
    else alert("Some of parameters had given incorrectly");
}

function createObject(){
    if(
        parseFloat(objCreationBLock.querySelector(".spanMass input").value) &&
        parseFloat(objCreationBLock.querySelector(".spanX input").value) &&
        parseFloat(objCreationBLock.querySelector(".spanY input").value) &&
        parseFloat(objCreationBLock.querySelector(".spanDirection input").value) &&
        parseFloat(objCreationBLock.querySelector(".spanSpeed input").value)
    ){
        if(confirm(
            "Do you confirm creation of this object?"
        )){
            massList.push(parseFloat(objCreationBLock.querySelector(".spanMass input").value));
            posXList.push(parseFloat(objCreationBLock.querySelector(".spanX input").value));
            posYList.push(parseFloat(objCreationBLock.querySelector(".spanY input").value));
            directionList.push(parseFloat(objCreationBLock.querySelector(".spanDirection input").value));
            speedList.push(parseFloat(objCreationBLock.querySelector(".spanSpeed input").value));

            numObjects++;

            updateRunning();
        }
    }
    else alert("Some of parameters had given incorrectly");
}

function deleteObject(object){
    if(confirm(
        "Do you realy wand to delete this object?"
    )){
        massList.splice(object.id, 1);
        posXList.splice(object.id, 1);
        posYList.splice(object.id, 1);
        directionList.splice(object.id, 1);
        speedList.splice(object.id, 1);

        numObjects--;

        updateRunning();
    }
}

function updateRunning(){
    setTimeout(startScrollPos, 50);
    stop();
    
    isRunning = false;

    objectList.forEach(object =>{
        object.accelerationList.forEach(a =>{
            a.obj.remove();
        });

        object.velocity.obj.remove();
        object.obj.remove();
        object.objInfo.remove();
        object.configInfo.remove();
        object.deletionInfo.remove();
    });

    objectList = [];

    for(let i = 0; i < numObjects; i++){
        objectList[i] = new SObject(massList[i], posXList[i], posYList[i]);
        objectList[i].initVelocity(speedList[i], directionList[i]);
    }

    for(let i = 0; i < objectList.length; i++){
        for(let j = 0, k = 0; j < objectList.length; j++){
            if(i != j){
                objectList[i].accelerationList[k] = new Acceleration(j);
                objectList[i].accelerationList[k].obj.style.background = "red";
                k++;
            }
        }
    }

    for(let i = 0; i < objectList.length; i++){
        objectList[i].id = i;
        objectList[i].initObjectInfo();
        objectList[i].velocity.update();
        objectList[i].update();
    }
}

let showRandConfigBlock = false;
function showRandConfig(){
    if(showRandConfigBlock){
        objRandConfigBlock.style.display = "none";
        showRandConfigBlock = false;
    }
    else{
        objRandConfigBlock.style.display = "flex";
        showRandConfigBlock = true;
    }
}

let showObjectDeletion = false;
function showDeleteObjBlock(){
    if(showObjectDeletion){
        objDeletionBlock.style.display = "none";
        showObjectDeletion = false;
    }
    else{
        objDeletionBlock.style.display = "flex";
        showObjectDeletion = true;
    }
}

let showObjCreation = false;
function showCreateObjBlock(){
    if(showObjCreation){
        objCreationBLock.style.display = "none";
        showObjCreation = false;
    }
    else{
        objCreationBLock.style.display = "block";
        showObjCreation = true;
    }
}

let showInfo = false;
function showObjectsInfo(){
    if(showInfo){
        objectListInfo.style.display = "none";
        showInfo = false;
    }
    else {
        objectListInfo.style.display = "block";
        showInfo = true;
    }
}

let showControls = false;
function showControlsBlock(){
    if(showControls){
        controlsBlock.style.display = "none";
        showControls = false;
    }
    else{
        controlsBlock.style.display = "flex";
        showControls = true;
    }
}

let showObjConfig = false;
function showObjectsConfig(){
    if(showObjConfig){
        objConfigBlock.style.display = "none";
        showObjConfig = false;
    }
    else{
        objConfigBlock.style.display = "grid";
        showObjConfig = true;
    }
}

function showCertainObject(object){
    if(object.activeShowInfo){
        object.activeShowInfo = false;
        object.obj.style.background = "white";

        object.spanMass.style.display = "none";
        object.spanX.style.display = "none";
        object.spanY.style.display = "none";
        object.spanDirection.style.display = "none";
        object.spanSpeed.style.display = "none";
    }
    else{
        object.activeShowInfo = true;
        object.obj.style.background = "yellow";

        object.spanMass.style.display = "block";
        object.spanX.style.display = "block";
        object.spanY.style.display = "block";
        object.spanDirection.style.display = "block";
        object.spanSpeed.style.display = "block";
    }
}

//  ******************* MAIN EXECUTION *******************

function run(){
    console.log("running...");

    objectList.forEach(object => {
        object.change();
    })

    objectList.forEach(object => {
        object.update();
    })

    for(let i = 0; i < objectList.length; i++){
        for(let j = 0; j < objectList.length; j++){
            if(i != j){
                let r = ((objectList[i].x - objectList[j].x) ** 2 + 
                    (objectList[i].y - objectList[j].y) ** 2) ** 0.5;
            
                if(
                    (r < (objectList[i].diameter + objectList[j].diameter) / 2) &&
                    (objectList[i].mass >= objectList[j].mass)
                ){
                    for(let k = 0; k < objectList.length; k++){
                        if(k != j){
                            for(let l = 0; l < objectList.length; l++){
                                if(objectList[k].accelerationList[l].id == objectList[j].id){
                                    objectList[k].accelerationList[l].obj.remove();
                                    objectList[k].accelerationList.splice(l, 1);
                                    break;
                                }
                            }
                        }
                    }
                    objectList[j].accelerationList.forEach(a => a.obj.remove()); 
                    objectList[j].accelerationList = [];

                    objectList[i].velocity.dx = 
                        (objectList[i].mass * objectList[i].velocity.dx +
                        objectList[j].mass * objectList[j].velocity.dx) /
                        (objectList[i].mass + objectList[j].mass);
                    objectList[i].velocity.dy = 
                        (objectList[i].mass * objectList[i].velocity.dy +
                        objectList[j].mass * objectList[j].velocity.dy) /
                        (objectList[i].mass + objectList[j].mass);
                    objectList[i].velocity.change();

                    objectList[j].velocity.obj.remove();
                    objectList[j].obj.remove();
                    objectList[j].objInfo.remove();
                    objectList[j].configInfo.remove();
                    objectList[j].deletionInfo.remove();

                    objectList[i].mass += objectList[j].mass;
                    objectList[i].diameter = (objectList[i].mass ** 0.5) / density;

                    objectList.splice(j, 1);

                    j--;
                    if(i > j) i--;
                }
            }
        }
    }
}