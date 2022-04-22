// setup for video capture
var video = document.querySelector("#webCamera");
video.onplay = function() {
    setTimeout(drawBoundingBox , 300);
};

// setup for button clicks
document.getElementById("startButton").addEventListener("click", startGame, false);
// document.getElementById("startButton").addEventListener("click", transitionBg, false);

// setup for game variables
var curr = 0;
var moveX = 0;
var charPos = 0;
var nameString = "";

// load pretrained ASL model
var model = null;
async function loadASLModel() {
    model = await tf.loadLayersModel('models/model.json');
}

var startTime, endTime;

loadASLModel();

function loadCamera(){        
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

    // canvas.width = video.videoWidth;
    // canvas.height = video.videoHeight;
    
    canvas.width = "320";
    canvas.height = "240";
    

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    var frameImg = ctx.getImageData(20, 20, 128, 128)
    predictASL(frameImg);

    ctx.rect(172, 20, 128, 128);
    ctx.lineWidth = "6";
    ctx.strokeStyle = "red";
    ctx.stroke();

    setTimeout(drawBoundingBox, 100);
}

function startGame() {
    document.getElementById("startScreen").style.setProperty("display", "none");
    document.getElementById("gameScreen").style.setProperty("visibility", "visible");
    document.getElementById("gameScreen").style.setProperty("max-height", "none");

    transitionBg()
    loadCamera();
    startTimer();
    setUpGame();
}

function transitionBg() {
    var bgContainer = document.getElementsByClassName("bgContainer")[0];
    // bgContainer.style.setProperty("transition-property", "height");
    // bgContainer.style.setProperty("transition-duration", "1s");
    bgContainer.style.setProperty("background-size", "cover");
    bgContainer.style.height = "50vw";
}

function setUpGame() {
    nameString = document.getElementById("nameInp").value.toUpperCase();

    // single-time setup for character movement
    moveX = 80.0/nameString.length;
    document.documentElement.style.setProperty('--move-x', moveX+'vw');
    
    var letterObj = document.getElementById("letter");
    letterObj.textContent = nameString[curr];
    var imgObj = document.getElementById("image");
    imgObj.src = "asl_alphabet_test/" + nameString[curr] + "_test.jpg";
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
    // update ASL display letter
    var letterObj = document.getElementById("letter");
    letterObj.textContent = nameString[curr];
    if (curr == nameString.length) {
        // end webcam video
        stopVideo(video.srcObject);
        var finishText = document.getElementById("guide");
        finishText.textContent = "Yummy yummy!";
    }
    // update ASL display image
    var imgObj = document.getElementById("image");
    imgObj.src = "asl_alphabet/" + nameString[curr] + "_test.jpg";
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
    // let img_inp = document.getElementById("img_inp");
    let imgTensor = tf.browser.fromPixels(imgFrame);
    
    // convert image to grayscale
    imgTensor = imgTensor.mean(2).toFloat().expandDims(0).expandDims(-1);
    imgTensor = imgTensor.div(255);
    const alignCorners = true;
    const imgResize = tf.image.resizeBilinear(imgTensor, [64, 64], alignCorners);

    let prediction = model.predict(imgResize).squeeze();
    let highestIndex = prediction.argMax().arraySync();

    document.getElementById("predText").textContent = "prediction: " + getChar(highestIndex);

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