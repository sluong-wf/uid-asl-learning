var block = document.getElementById("block");
var character = document.getElementById("character");
var curr = 0;
var keyList = [76, 67, 66, 79, 90];
var letterList = ["L","C","B","O","Z"];
var srcList = ["src/L_letter.jpg","src/C_letter.jpg","src/B_letter.jpg","src/O_letter.jpg","Z"];

// function move(){
//     // if(character.classList != "animate"){
//     // character.classList.add("animate");}
//     // character.style.left = parseInt(character.style.left, 10) + 80 + "px";
//     character.style.left = character.style.left + "80px";
//     // setTimeout(function(){character.classList.remove("animate");},500);
// }

function moveDown() {
    var keycode = window.event.keyCode;
    if (keycode == keyList[curr]) {
        var obj = document.getElementById("box");
        var leftVal = parseInt(obj.style.left, 10);
        obj.style.left = (leftVal + 100) + "px";    
        curr += 1;

        var letterText = document.getElementById("letter");
        letterText.textContent = letterList[curr];
        
        var imgObj = document.getElementById("image");
        imgObj.src = srcList[curr];
    }
}