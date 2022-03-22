var block = document.getElementById("block");
var character = document.getElementById("character");
var curr = 0;
var charPos = 0;
var keyList = [76, 67, 66, 79, 90];
var letterList = ["L","C","B","O","Z"];
var srcList = ["src/L_letter.jpg","src/C_letter.jpg","src/B_letter.jpg","src/O_letter.jpg","src/Z_letter.jpg"];

function moveDown() {
    var keycode = window.event.keyCode;
    if (keycode == keyList[curr]) {
        var obj = document.getElementById("character");
        // add animation
        if(obj.classList != "animate"){
        obj.classList.add("animate");}
        // update character's animation position
        document.documentElement.style.setProperty('--char-pos', charPos+'px');
        charPos += 80;
        // update character's fixed location
        var leftVal = parseInt(obj.style.left, 10);
        obj.style.left = (leftVal + 80) + "px";    
        // remove animation
        setTimeout(function(){obj.classList.remove("animate");},500);

        curr += 1;
        // update ASL display letter
        var letterText = document.getElementById("letter");
        letterText.textContent = letterList[curr];
        // update ASL display image
        var imgObj = document.getElementById("image");
        imgObj.src = srcList[curr];
    }
}