var curr = 0;
var charPos = 0;
var keyList = [76, 67, 66, 79, 78];
var letterList = ["L","C","B","O","N"];
var srcList = ["src/L_letter.jpg","src/C_letter.jpg","src/B_letter.jpg","src/O_letter.jpg","src/N_letter.jpg"];

function updateState() {
    var keycode = window.event.keyCode;
    if (keycode == keyList[curr]) {
        var charObj = document.getElementById("character");
        // add animation
        if(charObj.classList != "animate"){
            charObj.classList.add("animate");}
        // update character's animation position
        document.documentElement.style.setProperty('--char-pos', charPos+'px');
        // update character's fixed location
        charPos += 80;
        charObj.style.left = charPos+'px'; 
        // remove animation
        setTimeout(function(){charObj.classList.remove("animate");},500);

        curr += 1;
        // update ASL display letter
        var letterObj = document.getElementById("letter");
        letterObj.textContent = letterList[curr];
        if (curr > 4) {
            var finishText = document.getElementById("display");
            finishText.textContent = "Yummy yummy!";
        }
        // update ASL display image
        var imgObj = document.getElementById("image");
        imgObj.src = srcList[curr];
    }
}