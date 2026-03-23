const canvas = document.getElementById("theGame");
const ctx = canvas.getContext("2d");

let size = 32;
let hlsize = size / 2;

canvas.width = 20 * size;
canvas.height = 16 * size;
canvas.style.backgroundColor = "#ddd";
canvas.style.border = "1px solid #999";

ctx.font = `${hlsize}px Consolas`;
ctx.textAlign = "center";
ctx.textBaseline = "middle";

function makeChar(n, x, y){
    ctx.fillStyle = "#fff";
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = "#333";
    ctx.strokeRect(x, y, size, size);
    ctx.fillStyle = "#000";
    ctx.fillText(n, x+hlsize, y+hlsize);
}

let bing = ['B','I','N','G','O'];

for(let a = 0; a < 5; a++){
    makeChar(bing[a], a*size, 0);
    for(let b = 0; b < 15; b++){
        makeChar(a*15+b+1, a*size, b*size+size);
    }
}
