const RAND_WORDLIST = "rack,wage,bind,border,ball,drunk,luke,seeker,frame,reload,turned,firms,flu,opt,hit,adult,ozone,stayed,toe,peel,date,read,buck,dollar,number,wicked,sites,verbal,alloy,brief,offer,tapes,atm,roads,fridge,farm,doctor,bee,farmer,tide,indoor,ship,shoot,indie,expert,vendor,she,month,today,shown,seems,think,first,wed,bunch,shark,windy,would,warner,vision,burn,extra,eric,flag,happy,pets,rain,calls,this,guinea,beast,damage,guide,mars,speech,actor,vessel,ltd,hearts,views,breed,fewer,hawk,dutch,styles,zum,gamma,stress,tires,app,girls,pct,shape,bubble,belly,rss,band,knife,reform,trash,campus,bikini,appeal,device,ruth,adrian,unique,fall,nick,moment,jake,usd,wrote,glance,ignore,hard,choose,mens,wrong,elite,apollo,dating,inf,locks,mining,multi,ripe,slave,place,shots,topics,week,acre,judy,nasa,shield,drop,fisher,cached,powell,asn,strip,remote,island,fly,node,marble,brake,moss,pushed,been,cet,heavy,itunes,price,nearby,extra,cards,lambda,laptop,cnet,rip,caring,sarah,arabia,speaks,dir,enjoy,makes,katie,answer,cheats,duo,fed,lisa,cups,miss,spirit,fake,nav,golf,system,weekly,bar,bass,harder,tale,bags,nepal,settle,mime,ebay,rounds,skip,client,target,bullet,coin,barnes,nine".toUpperCase().split(",");

// set up for video capture
var video = document.querySelector("#webCamera");
video.onplay = function() {
    setTimeout(drawBoundingBox , 300);
};

// set up button clicks
document.getElementById("randomButton").addEventListener("click", function() { pickRandom = true; showGameScreen(); }, false);
document.getElementById("startButton").addEventListener("click", showGameScreen, false);
document.getElementById("goButton").addEventListener("click", startGame, false);
document.getElementById("restartButton").addEventListener("click", function() { transitionBgEnd(); setTimeout(restartGameViews, 2200);}, false);
document.getElementById("resultsButton").addEventListener("click", showResultScreen, false);

// set up game variables
var pickRandom = false; // whether user inputted a word or generating random
var curr = 0;
var moveX = 0;
var charPos = 0;
var nameString = "";
var gameStarted = false;
var timerReset = false;
var timerId;

function resetGameVars() {
    pickRandom = false; // whether user inputted a word or generating random
    curr = 0;
    moveX = 0;
    charPos = 0;
    nameString = "";
    gameStarted = false;
    timerReset = false;
    timerId;
    iTimer = 0;
    document.getElementById("character").style.left = 0;
}

// load pretrained ASL model
var model = null;
async function loadASLModel() {
    model = await tf.loadLayersModel('models/model.json');
}

var startTime, endTime;

loadASLModel();

function showGameScreen() {
    document.getElementById("startScreen").style.setProperty("display", "none");
    document.getElementById("gameScreen").style.setProperty("visibility", "visible");
    document.getElementById("gameScreen").style.setProperty("max-height", "85vw");

    transitionBgStart();
    setUpGame();
    loadCamera();
}

function startRandom() {
    pickRandom = true;
    showGameScreen();
}

function transitionBgStart() {
    var bgContainer = document.getElementsByClassName("bgContainer")[1];
    bgContainer.style.setProperty("background-position-y", "-50vw")
    bgContainer.style.setProperty("background-size", "cover");
    bgContainer.style.height = "50vw";
    document.getElementById("goButton").style.setProperty("top", "10vw");
}

function transitionBgEnd() {
    var bgContainer = document.getElementsByClassName("bgContainer")[1];
    bgContainer.style.setProperty("background-position-y", "-15vw")
    bgContainer.style.setProperty("background-size", "cover");
    bgContainer.style.height = "85vw";
    document.getElementById("goButton").style.setProperty("top", "-10vw");
}

function setUpGame() {
    if (pickRandom) nameString = RAND_WORDLIST[Math.trunc(Math.random()*100)];
    else nameString = document.getElementById("nameInp").value.toUpperCase();

    document.getElementById("nameText").textContent = nameString;
    document.getElementById("winText").textContent = nameString;

    // single-time setup for character movement
    moveX = 80.0/nameString.length;
    document.documentElement.style.setProperty('--move-x', moveX+'vw');
}

async function loadCamera(){        
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({audio: false, video: {facingMode: 'user'}})
        .then( function(stream) {
            video.srcObject = stream;
            // return stream;            
        })
        .catch(function(error) {
            alert("Error opening device");
        });
    }
}

function stopVideo(stream) {
    stream.getTracks().forEach(function(track) {
        if (track.readyState == 'live' && track.kind === 'video') {
            track.stop();
        }
    });
}

function drawBoundingBox(){
    var video = document.querySelector("#webCamera");
    var canvas = document.querySelector("#videoCanvas");
    var ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth * 37 / 100;
    canvas.height = window.innerWidth * 28 / 100;

    var offset = window.innerWidth / 35; // ~2.5vw
    var x = window.innerWidth * 13 / 100; // 13vw

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight,
                  0, 0, canvas.width, canvas.height);

    if (gameStarted) {
        var frameImg = ctx.getImageData(offset, offset, x, x);
        predictASL(frameImg);
    }

    ctx.rect(canvas.width-offset-x, offset, x, x);
    ctx.lineWidth = "4";
    ctx.strokeStyle = "red";
    ctx.stroke();
    
    setTimeout(drawBoundingBox, 100);
}

function startGame() {
    document.getElementById("goButton").style.display = "none";
    document.getElementById("instructionPanel").style.display = "none";

    gameStarted = true;
    
    var letterObj = document.getElementById("letter");
    letterObj.textContent = nameString[curr];
    var imgObj = document.getElementById("image");
    imgObj.src = "asl_alphabet_test/" + nameString[curr] + "_test.jpg";

    document.getElementById("timerProgress").style.display = "block";
    document.getElementById("timerBar").style.setProperty("width", "100%");

    startTimer();
    startTimerBar();
}

// CURRENTLY NOT USED
function finishGame() {
    document.getElementById("gameScreen").style.setProperty("display", "none");
    document.getElementById("finishScreen").style.setProperty("display", "inline");
}

function updateState(timeRanOut=false) {
    if (!timeRanOut) { // if state is updated because time ran out, character does not move
        var charObj = document.getElementById("character");
        // add animation
        if(charObj.classList != "animate"){
            charObj.classList.add("animate");}
        // update character's animation position
        document.documentElement.style.setProperty('--char-pos', charPos+'vw');
        
        // update character's fixed location
        charPos += moveX;
        charObj.style.left = charPos+'vw'; 
        // remove animation
        setTimeout(function(){charObj.classList.remove("animate");},500);
    }

    curr += 1;
    if (curr == nameString.length) {
        // reset state
        gameStarted = false;
        showEndState();
        
        // end webcam video
        setTimeout(stopVideo(video.srcObject), 1000);

        // var finishText = document.getElementById("guide");
        // finishText.textContent = "Yummy yummy!";
    } else {
        // update ASL display letter
        var letterObj = document.getElementById("letter");
        letterObj.textContent = nameString[curr];
        // update ASL display image
        var imgObj = document.getElementById("image");
        imgObj.src = "asl_alphabet_test/" + nameString[curr] + "_test.jpg";

        // restart timer bar
        restartTimerBar();
    }
}

function showEndState() {
    document.getElementById("bottomDisplay").style.display = "none";
    document.getElementById("winContainer").style.display = "block";
    document.getElementById("timerProgress").style.display = "none";
    document.getElementById("restartButton").style.display = "block";
    document.getElementById("resultsButton").style.display = "block";
}

function restartGameViews() {
    transitionBgEnd();
    resetGameVars();
    document.getElementById("startScreen").style.setProperty("display", "block");
    document.getElementById("gameScreen").style.setProperty("visibility", "hidden");
    document.getElementById("gameScreen").style.setProperty("max-height", "0");
    // reverse all end state element displays
    document.getElementById("bottomDisplay").style.display = "block";
    document.getElementById("winContainer").style.display = "none";
    document.getElementById("restartButton").style.display = "none";
    document.getElementById("resultsButton").style.display = "none";
    
    document.getElementById("goButton").style.display = "block";
    document.getElementById("instructionPanel").style.display = "block";
}

function showResultScreen() {
    pass;
}

function getChar(x) {
    let y = 65+x;
    if (5<=x && x<=14) return String.fromCharCode(y-1);
    else if (16<=x && x<=20) return String.fromCharCode(y-2);
    else if (x>=22) return String.fromCharCode(y-3);
    else if (x<=3) return String.fromCharCode(y);
    else return "nothing";
}

function predictASL(imgFrame) {
    let imgTensor = tf.browser.fromPixels(imgFrame);
    
    // convert image to grayscale
    imgTensor = imgTensor.mean(2).toFloat().expandDims(0).expandDims(-1);
    imgTensor = imgTensor.div(255);
    const alignCorners = true;
    const imgResize = tf.image.resizeBilinear(imgTensor, [64, 64], alignCorners);

    let prediction = model.predict(imgResize).squeeze();
    let highestIndex = prediction.argMax().arraySync();

    // document.getElementById("predText").textContent = "prediction: " + getChar(highestIndex);

    if (getChar(highestIndex) == nameString[curr]) {
        timerReset = true;
        // updateState();
        endTimer();
    }
}

function startTimer() {
    startTime = new Date();
}

function endTimer() {
    endTime = new Date();
    var timeDiff = endTime - startTime;
    timeDiff /= 1000;

    var seconds = Math.round(timeDiff);
    console.log(seconds + " seconds");
}

function restartTimerBar() {
    timerReset = true;
    startTimerBar();
}

var iTimer = 0;
function startTimerBar() {
  if (iTimer == 0) {
    iTimer = 1; // safeguard that only one setInterval is running at once
    timerReset = false;
    var width = 1000;
    var elem = document.getElementById("timerBar");
    timerId = setInterval(frame, 50);
    function frame() {
      if (width <= 5 || timerReset) {
        clearInterval(timerId);
        iTimer = 0;
        updateState(!timerReset);
      } else {
        width -= 5;
        elem.style.width = width/10 + "%";
      }
    }
  }
}