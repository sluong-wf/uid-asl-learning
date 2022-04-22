// set up for video capture
var video = document.querySelector("#webCamera");
video.onplay = function() {
    setTimeout(drawBoundingBox , 300);
};

// set up button clicks
document.getElementById("startButton").addEventListener("click", showGameScreen, false);
document.getElementById("goButton").addEventListener("click", startGame, false);

// set up game variables
var curr = 0;
var moveX = 0;
var charPos = 0;
var nameString = "";
var gameStarted = false;

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
    document.getElementById("gameScreen").style.setProperty("max-height", "none");

    transitionBg();
    setUpGame();
    loadCamera();
    // setTimeout(loadCamera, 1000);
}

function transitionBg() {
    var bgContainer = document.getElementsByClassName("bgContainer")[1];
    bgContainer.style.setProperty("background-position-y", "-50vw")
    bgContainer.style.setProperty("background-size", "cover");
    bgContainer.style.height = "50vw";
    document.getElementById("goButton").style.setProperty("top", "10vw");
}

function setUpGame() {
    nameString = document.getElementById("nameInp").value.toUpperCase();

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

    startTimer();
}

function finishGame() {
    document.getElementById("gameScreen").style.setProperty("display", "none");
    document.getElementById("finishScreen").style.setProperty("display", "inline");
}

function updateState() {
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
    }
}

function showEndState() {
    console.log("here");
    document.getElementById("bottomDisplay").style.display = "none";
    document.getElementById("winContainer").style.display = "block";

    //TODO: show Play Again or Next button
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
        updateState();
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

var i = 0;
async function move() {
    document.getElementById("testmove").textContent = "move called";
  if (i == 0) {
    i = 1;
    var elem = document.getElementById("myBar");
    var width = 1;
    var id = setInterval(frame, 10);
    function frame() {
      if (width >= 100) {
        clearInterval(id);
        i = 0;
      } else {
        width++;
        elem.style.width = width + "%";
      }
    }
  }
}