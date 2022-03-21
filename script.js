var character = document.getElementById("character");
var block = document.getElementById("block");
function move(){
    if(character.classList != "animate"){
    character.classList.add("animate");}
    character.style.left = character.style.left + "80px";
    setTimeout(function(){character.classList.remove("animate");},500);
}