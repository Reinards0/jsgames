const canvas = document.getElementById("theGame");
const ctx = canvas.getContext("2d");
const sp0 = document.getElementById("sprite0");
const s0 = sp0.getContext("2d");
const menu1 = document.getElementById("m1");
const menu2 = document.getElementById("m2"); 

let gmdat = localStorage.getItem("gmdat");
if(!gmdat){
    // GameData: 
    // Board Size (n^2), Mistake Limit (Lives), 
    // Bonus Appear Rate, Numbers in Stack (% of Board Size), 
    // Tile Size, Base Char, Bonus Char, Empty Char, Wild Char,
    // Music, SFX
    gmdat = {
        boards: 3,
        mlim: 3,
        bchn: 50,
        snum: 85,
        sa: 32,
        nsec: 1,
        plus: 38,
        minus: 37,
        wildn: 0,
        mus: false,
        snd: false
    }
    localStorage.setItem("gmdat",JSON.stringify(gmdat));
}else{
    gmdat = JSON.parse(gmdat);
}

let size = gmdat.sa;
let hlsize = size / 2;
let qtsize = hlsize / 2;
let power = gmdat.boards;   // W/H of each boxes
let rc = power * power;     // Total Board W/H

let gmsize = size * rc; // Board * Tile Size

canvas.width = gmsize + (size * 11);
canvas.height = gmsize + (size * 7);
canvas.style.backgroundColor = "#ddd";
canvas.style.border = "1px solid #999";
sp0.width = canvas.width;
sp0.height = canvas.height;
sp0.style.border = "1px solid transparent";

menu1.style.left = canvas.width + 20 + "px";
menu2.style.left = menu1.offsetLeft + menu1.offsetWidth + 4 + "px";

let score = 0;
let lives = 3;

let board;
let btop;   // Numbers on top of the Board
let stack;
let avnum;              // Current Available Numbers in Stack
let sview = gmdat.boards;   // Visible Numbers in Stack
let instk = Math.round(gmdat.snum * rc / 100);
let bnChan = gmdat.bchn;
let row = 0;    // Rows Completed
let col = 0;    // Cols Completed
let box = 0;    // Boxes Completed
let bon = 0;    // + Bonus Applied
let brow = -1;
let bcol = -1;

let state = 0;
let hVal = 0x7f;    // Interacting Number
let err = -1;   // Main Board Mistake
let tpf = -1;   // Top Row Mistake
let lv = 1;
let chn = 0;
let lchn = 0;

let cx = 0;
let cy = 0;
let tx = 0;
let ty = 0;

let bpx = size * 3 + hlsize;
let bpy = size * 3;
let cpx = size + hlsize;
let cpy = size * 3;
let spx = canvas.width - (size * 4) - hlsize;
let sy = size * power + hlsize;
let ly = size * power * 2 + hlsize;
let bns = size * power * 3 + hlsize;
let alrt = bpy + (rc * size) + size;
let rbtx;
let rbty;

let anim = 0;
let frim = 0;
let isComp = false;
let tpa = 15;
let run;

const bg = new Audio("snd/bgm.wav");
const pik = new Audio("snd/pickin.wav");
const fall = new Audio("snd/dropin.wav");
const fild = new Audio("snd/filled.wav");
const bned = new Audio("snd/boned.wav");
const mist = [new Audio("snd/lifelose1.wav"), new Audio("snd/lifelose2.wav")];
const gedi = new Audio("snd/endin.wav");
const gmov = new Audio("snd/poped.wav");
const gend = new Audio("snd/lifelost.wav");

const nums = [
    '0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F',
    'G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V',
    'W','X','Y','Z','!','?','+','-','=','*','/','%','<','>','.',','
];

const xTile = nums.length;
let bnTile = 0;
let bnFill = 0x26;
let ftile = 0x25;
let base = 1;
let inplay = false;

ctx.font = `${hlsize}px Consolas`;
ctx.textAlign = "center";
ctx.textBaseline = "middle";
s0.font = ctx.font;
s0.textAlign = ctx.textAlign;
s0.textBaseline = ctx.textBaseline;

function welcom(){
    state = 15;
    const hx = canvas.width / 2;
    const hy = canvas.height / 2;
    const ofx = hx - (size * (rc / 2));
    const ofy = hy - (size * power / 2) - hlsize;
    ctx.font = `${size}px Consolas`;
    ctx.fillStyle = "#000";
    ctx.fillText("Sudoku Drop", hx, ofy-size*2);
    ctx.font = `${hlsize}px Consolas`;
    for(let b = 0; b < power; b++){
        for(let a = 0; a < rc; a++){
            const x = ofx + (size * a);
            const y = ofy + (size * b);
            const z = rc * b + a;
            ctx.fillStyle = "#fff";
            ctx.fillRect(x, y, size, size);
            if(z < xTile){
                getVal(z, x, y);
            }
            ctx.strokeStyle = (b === 0) ? "#000" : "#888";
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x+size, y);
            ctx.stroke();
            ctx.strokeStyle = (a % power === 0) ? "#000" : "#888";
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y+size);
            ctx.stroke();
        }
    }
    const bs = size * rc;
    const bs2 = size * power;
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(ofx+bs, ofy);
    ctx.lineTo(ofx+bs, ofy+bs2);
    ctx.lineTo(ofx, ofy+bs2);
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.fillRect(hx-size*3, ofy+size*(power+2), size*6, size);
    ctx.strokeStyle = "#111";
    ctx.strokeRect(hx-size*3, ofy+size*(power+2), size*6, size);
    ctx.fillStyle = "#000";
    ctx.fillText("Play", hx, ofy+size*(power+2)+hlsize);
}

function inigm(){
    if(run) cancelAnimationFrame(run);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    s0.clearRect(0, 0, s0.width, s0.height);
    ctx.font = `${hlsize}px Consolas`;
    score = 0;
    lives = gmdat.mlim === 0 ? 65535 : gmdat.mlim;
    instk = Math.round((gmdat.snum * rc) / 100);
    bnChan = gmdat.bchn;
    row = col = box = bon = 0;
    brow = bcol = -1;
    state = 0;
    hVal = 0x7f;
    err = tpf = -1;
    lv = 1;
    chn = lchn = 0;
    anim = frim = 0;
    isComp = false;
    tpa = 15;
    bnTile = gmdat.wildn;
    bnFill = gmdat.plus;
    ftile = gmdat.minus;
    base = gmdat.nsec;
    inplay = false;
    makeBoard();
    initStack();
    genNum();
    drawBoard();
    drawColum();
    statBoard();
    gmloop();
    if(gmdat.mus){
        bg.currentTime = 0;
        bg.loop = true;
        bg.play();
    }
}

function doReset(p){
    if(state > 10) return;
    const rect = sp0.getBoundingClientRect();
    let r1 = p.clientX - rect.left;
    let r2 = p.clientY - rect.top;
    if(r1 > rbtx && r1 < (rbtx + (size*3)) && r2 > rbty && r2 < (rbty + size)){
        inigm();
    }
}

function playSf(sid){
    if(!gmdat.snd) return;
    switch(sid){
        case 0:
            pik.currentTime = 0;
            pik.play();
            break;
        case 1:
            fall.currentTime = 0;
            fall.play();
            break;
        case 2:
            fall.pause();
            break;
        case 3:
            fild.play();
            break;
        case 4:
            let p = Math.floor(Math.random() * 2);
            mist[p].play();
            break;
        case 5:
            bned.currentTime = 0;
            bned.play();
            break;
        case 6:
            gedi.currentTime = 0;
            gedi.play();
            break;
        case 7:
            gmov.currentTime = 0;
            gmov.play();
            break;
        case 8:
            gend.play();
            break;
    }
}

function makeBoard(){
    const bs = rc * rc;
    board = new Uint8Array(bs).fill(0x7f);
    btop = new Uint8Array(rc).fill(0x7f);
}

function initStack(){
    stack = new Uint8Array(instk).fill(0x7f);
    avnum = new Uint8Array(rc).fill(0);
}

function genNum(){
    let a = 0;
    let n;
    while(a < instk){
        n = parseInt(Math.random() * (rc + 1));
        if(n < rc){
            if(avnum[n] >= lv) continue;
            avnum[n]++;
        }
        stack[a] = n >= rc ? bnTile : (n + base);
        a++;
    }
}

function getVal(c, x, y){
    ctx.fillStyle = "#000";
    ctx.fillText(nums[c], x+hlsize, y+hlsize);
}

function drawBoard(){
    const bs = size * rc;
    const tr = tpa >= 0 ? tpa : 0;
    let rct = (parseInt((tr/15)*0x22) + 0xdd) * 0x010101;
    let txt = (0xdd - parseInt((tr/15)*0xdd)) * 0x010101;
    let bdr = (0xdd - parseInt((tr/15)*0x55)) * 0x010101;
    let bd0 = parseInt((tr/15)*0x44) * 0x010101;
    ctx.clearRect(bpx-hlsize, bpy-size-hlsize, bs+size, bs+size*2);
    if(gmdat.mus) bg.volume = 0.8 * (tr/15);

    for(let b = -1; b < rc; b++){
        if(tpa <= 0 && b === -1) continue;
        for(let a = 0; a < rc; a++){
            const x = bpx + (size * a);
            const y = bpy + (size * b);
            const z = rc * b + a;
            const c = (b === -1) ? btop[a] : board[z];
            ctx.fillStyle = "#fff";
            if(b >= 0){
                const bx = parseInt(b / power) * power + parseInt(a / power);
                if(((row >> b) & 1) || ((col >> a) & 1) || ((box >> bx) & 1)){
                    if(c === bnFill){
                        ctx.fillStyle = "#aaf";
                    }else{
                        ctx.fillStyle = "#ffa";
                    }
                }
                if(z === err || (z === (rc * ty + tx) && err >= 0)){
                    if(ctx.fillStyle === "#ffffaa"){
                        ctx.fillStyle = "#f0f";
                    }else{
                        ctx.fillStyle = "#f00";
                    }
                }
                if(isComp && frim >= z){
                    ctx.fillStyle = "#afa";
                }
                if(c === ftile){
                    ctx.fillStyle = "#fcc";
                }
            }else if(tpa < 15){
                ctx.fillStyle = "#" + rct.toString(16).padStart(6, "0");
            }else if(a === tpf || (a === tx && (err >= 0 || tpf >= 0))){
                ctx.fillStyle = "#f00";
            }

            if(b >= 0 || c < xTile){
                ctx.fillRect(x, y, size, size);
                if(b < 0){
                    ctx.fillStyle = "#" + txt.toString(16).padStart(6, "0");
                    ctx.fillText(nums[c], x+hlsize, y+hlsize);
                }else if(c < xTile){
                    getVal(c, x, y);
                }

                ctx.strokeStyle = "#" + bdr.toString(16).padStart(6, "0");
                if(b === 0){
                    ctx.strokeStyle = "#" + bd0.toString(16).padStart(6, "0");
                }else if(b >= 1){
                    ctx.strokeStyle = (b % power === 0) ? "#000" : "#888";
                }
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x+size, y);
                ctx.stroke();

                if(b >= 0){
                    ctx.strokeStyle = (a % power === 0) ? "#000" : "#888";
                }
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x, y+size);
                ctx.stroke();

                if(b < 0){
                    ctx.beginPath();
                    ctx.moveTo(x+size, y);
                    ctx.lineTo(x+size, y+size);
                    ctx.stroke();
                }
            }
        }
    }
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(bpx+bs, bpy);
    ctx.lineTo(bpx+bs, bpy+bs);
    ctx.lineTo(bpx, bpy+bs);
    ctx.stroke();

    ctx.strokeStyle = "#" + txt.toString(16).padStart(6, "0");
    ctx.beginPath();
    ctx.moveTo(bpx, bpy-hlsize);
    ctx.lineTo(bpx, bpy);
    ctx.moveTo(bpx+bs, bpy-hlsize);
    ctx.lineTo(bpx+bs, bpy);
    ctx.stroke();
}

function drawColum(){
    const cs = size * sview;
    const tr = tpa >= 0 ? tpa : 0;
    let rct = (parseInt((tr/15)*0x22) + 0xdd) * 0x010101;
    let txt = (0xdd - parseInt((tr/15)*0xdd)) * 0x010101;
    let bdr = (0xdd - parseInt((tr/15)*0x55)) * 0x010101;

    ctx.clearRect(cpx-hlsize, cpy-hlsize, size*2, cs+size);

    let a = hVal < xTile ? 1 : 0;

    for(; a < sview; a++){
        const y = cpy + (size * a);
        const c = stack[a];

        if(c < xTile){
            ctx.fillStyle = "#" + rct.toString(16).padStart(6, "0");
            ctx.fillRect(cpx, y, size, size);
            
            ctx.fillStyle = "#" + txt.toString(16).padStart(6, "0");
            ctx.fillText(nums[c], cpx+hlsize, y+hlsize);

            ctx.strokeStyle = "#" + bdr.toString(16).padStart(6, "0");
            ctx.beginPath();
            ctx.moveTo(cpx, y);
            ctx.lineTo(cpx+size, y);
            ctx.stroke();
        }
    }
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(cpx, cpy);
    ctx.lineTo(cpx, cpy+cs);
    ctx.lineTo(cpx+size, cpy+cs);
    ctx.lineTo(cpx+size, cpy);
    ctx.stroke();
}

function statBoard(){
    ctx.clearRect(spx, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#eee";
    ctx.fillRect(spx, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(spx, 0);
    ctx.lineTo(spx, canvas.height);
    ctx.stroke();

    const tcen = (canvas.width - spx) / 2;
    ctx.fillStyle = "#000";
    ctx.fillText("Score", spx+tcen, sy);
    ctx.fillText(score, spx+tcen, sy+size-qtsize);
    if(lives >= 0 && lives < 128){
        ctx.fillText("Lives", spx+tcen, ly);
        ctx.fillText(lives, spx+tcen, ly+size-qtsize);
    }
    ctx.fillText("Bonus", spx+tcen, bns);
    ctx.fillStyle = "#fff";
    ctx.fillRect(spx+tcen-hlsize,bns+hlsize,size,size);
    ctx.strokeStyle = "#888";
    ctx.strokeRect(spx+tcen-hlsize,bns+hlsize,size,size);
    getVal(bnTile,spx+tcen-hlsize,bns+hlsize);
    
    rbtx = spx + tcen - size * 1.5;
    rbty = canvas.height - size * 2;

    ctx.fillStyle = "#fff";
    ctx.fillRect(rbtx,rbty,size*3,size);
    ctx.strokeStyle = "#111";
    ctx.strokeRect(rbtx,rbty,size*3,size);
    ctx.fillStyle = "#000";
    ctx.fillText("Restart", spx+tcen, rbty+hlsize);
}

function nexTile(){
    let n = stack[0];
    if(n !== bnTile){
        n -= base;
        avnum[n]--;
    }
    for(let a = 1; a < instk; a++){
        stack[a-1] = stack[a];
    }
    n = stack.reduce((a, b) => b === bnTile ? a + 1 : a, 0);
    if(n < parseInt((bnChan * rc) / 100)) n = parseInt(Math.random() * 100);
    else n = 0;
    if(n >= (100 - bnChan)) n = bnTile;
    else{
        while(true){
            n = parseInt(Math.random() * rc);
            if(avnum[n] < lv){
                avnum[n]++;
                n += base;
                break;
            }
        }
    }
    stack[instk-1] = n;
    drawColum();
}

function adp(pts){
    if(lives < 0 || lives >= 128) return;
    score += parseInt(pts);
    statBoard();
    if(score >= 1024) lv = 3;
    else if(score >= 256) lv = 2;
}

function decstk(){
    if(instk < 2) return;
    let n = stack.pop();
    if(n !== bnTile) avnum[n]--;
    instk--;
}

function toBonus(i){
    let cbit = (2 ** power) - 1;
    let b = i === 0 ? 1 : (1 << power);
    let c = i === 0 ? row : col;
    for(let a = 0; a < power; a++){
        if(b & bon){
            cbit <<= power;
            b <<= 1;
            continue;
        }
        if((cbit & c) === cbit){
            if(i === 0) brow = a;
            else bcol = a;
            bon |= b;
            state = 5;
            break;
        }
        if(a === power - 1) break;
        cbit <<= power;
        b <<= 1;
    }
}

function bCheck(){
    let b = parseInt(ty / power) * power + parseInt(tx / power);
    let bx = b * power + parseInt(b / power) * (power - 1) * rc;
    let comp = 7;
    let c0 = ty * rc + tx;
    let c1 = 0;
    let c2 = 0;
    let c3 = 0;
    for(let a = 0; a < rc; a++){
        c1 = ty * rc + a;
        c2 = a * rc + tx;
        c3 = bx + parseInt(a / power) * rc + (a % power);
        if(board[c1] === 0x7f) comp &= ~1;
        else if(board[c1] === hVal && c0 !== c1 && hVal !== bnTile){
            err = c1;
            break;
        }
        if(board[c2] === 0x7f) comp &= ~2;
        else if(board[c2] === hVal && c0 !== c2 && hVal !== bnTile){
            err = c2;
            break;
        }
        if(board[c3] === 0x7f) comp &= ~4;
        else if(board[c3] === hVal && c0 !== c3 && hVal !== bnTile){
            err = c3;
            break;
        }
    }
    if(err < 0){
        if(comp !== 0){
            playSf(3);
        }
        if(comp & 4){
            box |= (1 << b);
            adp(rc*2/3);
        }
        if(comp & 2){
            col |= (1 << tx);
            toBonus(1);
            adp(rc*2/3);
        }
        if(comp & 1){
            row |= (1 << ty);
            toBonus(0);
            adp(rc*2/3);
        }
        if(hVal !== bnTile) adp(1);
    }else{
        state = 4;
    }
    drawBoard();
}

function tCheck(c0){
    let c1 = 0;
    let c2 = 0;
    for(let a = 0; a < rc; a++){
        c1 = a * rc + c0;
        c2 = a;
        if(board[c1] === hVal && c0 !== c1 && hVal !== bnTile){
            err = c1;
            break;
        }
        if(btop[c2] === hVal && c0 !== c2 && hVal !== bnTile){
            tpf = c2;
            break;
        }
    }
    if(err >= 0 || tpf >= 0){
        state = 4;
        drawBoard();
    }
}

function msFilter(){
    if(--anim < 1){
        if(frim > 2){
            frim = 0;
            if(--lives < 1){
                hVal = 0;
                statBoard();
                run = requestAnimationFrame(gmend);
                return;
            }
            statBoard();
            state = 0;
            nexTile();
            run = requestAnimationFrame(gmloop);
            return;
        }else if(frim === 2){
            s0.clearRect(0, 0, sp0.width, sp0.height);
            if(ty >= 0){
                let a = ty * rc + tx;
                board[a] = 0x7f;
            }else{
                btop[tx] = 0x7f;
            }
            err = -1;
            tpf = -1;
            hVal = 0x7f;
            drawBoard();
            anim = 10;
        }else{
            s0.strokeStyle = "#000";
            switch(frim){
                case 0:
                    s0.beginPath();
                    s0.moveTo(cx, cy);
                    s0.lineTo(cx+size, cy+size);
                    s0.stroke();
                    break;
                case 1:
                    s0.beginPath();
                    s0.moveTo(cx, cy+size);
                    s0.lineTo(cx+size, cy);
                    s0.stroke();
                    break;
            }
            anim = 30;
        }
        frim++;
    }
    run = requestAnimationFrame(msFilter);
}

function giveBn(){
    if(--anim < 1){
        if(frim >= rc){
            frim = 0;
            if(!board.includes(127)){
                isComp = true;
                frim = -1;
                anim = 5;
                run = requestAnimationFrame(gmfin);
                return;
            }
            brow = -1;
            bcol = -1;
            lchn = 0;
            state = 0;
            hVal = 0x7f;
            nexTile();
            run = requestAnimationFrame(gmloop);
            return;
        }else{
            chn = lchn;
            let a,b,c;
            let d = Math.ceil(Math.log2(chn+1) * power);
            let bset = new Uint8Array(power).fill(127);
            if(brow >= 0){
                for(a = 0; a < rc; a++){
                    for(b = 0; b < power; b++){
                        c = brow + (b * rc) + a;
                        if(board[c] === (frim+base)){
                            bset[b] = a;
                        }
                    }
                }
                if(!bset.includes(127)){
                    for(let a = 0; a < power; a++){
                        c = brow + (a * rc) + bset[a];
                        board[c] = bnFill;
                    }
                    drawBoard();
                    adp(power+d);
                    playSf(5);
                    chn++;
                    anim = 15;
                }
            }
            if(bcol >= 0){
                for(a = 0; a < rc; a++){
                    for(b = 0; b < power; b++){
                        c = bcol + (a * rc) + b;
                        if(board[c] === (frim+base)){
                            bset[b] = a;
                        }
                    }
                }
                if(!bset.includes(127)){
                    for(let a = 0; a < power; a++){
                        c = bcol + (bset[a] * rc) + a;
                        board[c] = bnFill;
                    }
                    drawBoard();
                    adp(power+d);
                    playSf(5);
                    chn++;
                    anim = 15;
                }
            }
            if(chn > lchn) lchn++;
            frim++;
        }
    }
    run = requestAnimationFrame(giveBn);
}

function gmend(){
    if(--anim < 1){
        if(--tpa >= 0){
            drawBoard();
            drawColum();
            anim = 4;
        }else{
            if(board[frim] >= xTile){
                board[frim] = ftile;
                playSf(7);
                drawBoard();
                anim = 5;
            }
            frim++;
            if(frim === rc * rc){
                anim = 30;
                frim++;
            }
            else if(frim > rc * rc){
                ctx.fillStyle = "#fff";
                ctx.fillRect(bpx, alrt, size*rc, size);
                ctx.strokeStyle = "#000";
                ctx.strokeRect(bpx, alrt, size*rc, size);
                ctx.fillStyle = "#000";
                ctx.fillText("Game Over", bpx+hlsize*rc, alrt+hlsize);
                playSf(8);
                return;
            }
        }
    }
    run = requestAnimationFrame(gmend);
}

function gmfin(){
    if(lives < 0 || lives >= 128){
        run = requestAnimationFrame(gmend);
        return;
    }
    if(--anim < 1){
        if(--tpa >= 0){
            drawBoard();
            drawColum();
            anim = 4;
        }else{
            drawBoard();
            frim++;
            anim = 5;
            if(frim >= rc * rc){
                if(--lives >= 0){
                    adp(20);
                    anim = 10;
                }else{
                    ctx.fillStyle = "#fff";
                    ctx.fillRect(bpx, alrt, size*rc, size);
                    ctx.strokeStyle = "#000";
                    ctx.strokeRect(bpx, alrt, size*rc, size);
                    ctx.fillStyle = "#000";
                    ctx.fillText("Game Over", bpx+hlsize*rc, alrt+hlsize);
                    return;
                }
            }else playSf(6);
        }
    }
    run = requestAnimationFrame(gmfin);
}

function gmloop(){
    s0.clearRect(0, 0, sp0.width, sp0.height);
    if(hVal < xTile){
        if(state === 2){
            if(cy >= canvas.height ||
                (cx > cpx - hlsize && cx < cpx + hlsize && cy > cpy - hlsize && cy < cpy)
            ){
                hVal = 0x7f;
                state = 0;
                playSf(2);
                drawColum();
            }
            if(cx > bpx - hlsize && cx < bpx + (size*rc) - hlsize && cy >= bpy - size - hlsize && cy < bpy - hlsize){
                tx = Math.round((cx - bpx) / size);
                ty = 0;
                if(board[tx] === 0x7f) state = 3;
                else if(btop[tx] === 0x7f){
                    ty = -1;
                    btop[tx] = hVal;
                    drawBoard();
                    tCheck(tx);
                    playSf(2);
                    if(state === 4){
                        cx = tx * size + bpx;
                        cy = ty * size + bpy;
                        anim = 30;
                        playSf(4);
                        run = requestAnimationFrame(msFilter);
                        return;
                    }
                    hVal = 0x7f;
                    state = 0;
                    nexTile();
                }
            }
            cy += size;
        }else if(state === 3){
            let a = ty * rc + tx + rc;
            if(board[a] === 0x7f && a < rc*rc){
                ty++;
            }else{
                a -= rc;
                board[a] = hVal;
                drawBoard();
                bCheck();
                fall.pause();
                if(state === 4){
                    anim = 30;
                    playSf(4);
                    run = requestAnimationFrame(msFilter);
                    return;
                }
                if(state === 5){
                    brow *= (power * rc);
                    bcol *= power;
                    anim = 10;
                    run = requestAnimationFrame(giveBn);
                    return;
                }
                hVal = 0x7f;
                state = 0;
                nexTile();
            }
        }
        if(state >= 1 && state < 4){
            if(state === 3){
                cx = tx * size + bpx;
                cy = ty * size + bpy;
            }else{
                s0.fillStyle = "#fff";
                s0.fillRect(cx, cy, size, size);
                s0.strokeStyle = "#888";
                s0.strokeRect(cx, cy, size, size);
            }
            s0.fillStyle = "#000";
            s0.fillText(nums[hVal], cx+hlsize, cy+hlsize);
        }
    }
    run = requestAnimationFrame(gmloop);
}

function getCPos(p){
    const rect = sp0.getBoundingClientRect();
    cx = p.clientX - rect.left - hlsize;
    cy = p.clientY - rect.top - hlsize;
}

function movCur(p){
    if(state !== 1) return;
    getCPos(p);
}

function pickTile(p){
    if(state !== 0) return;
    getCPos(p);
    if(cx > cpx - hlsize && cx < cpx + hlsize && cy > cpy - hlsize && cy < cpy + hlsize){
        state = 1;
        playSf(0);
        hVal = stack[0];
        drawColum();
    }
}

function dropTile(){
    if(state !== 1) return;
    state = 2;
    playSf(1);
}

function begin(p){
    const btsta = canvas.width / 2 - size * 3;
    const btend = btsta + (size * 6);
    const bttop = canvas.height / 2 - size * (power / 2 - (2 + power)) - hlsize;
    const btbtm = bttop + size;
    const rect = sp0.getBoundingClientRect();
    cx = p.clientX - rect.left;
    cy = p.clientY - rect.top;
    if(cx > btsta && cx < btend && cy > bttop && cy < btbtm){
        sp0.removeEventListener("click", begin);
        inigm();
    }
}

sp0.addEventListener("mousedown", pickTile);
sp0.addEventListener("mouseup", dropTile);
sp0.addEventListener("mousemove", movCur);
sp0.addEventListener("click", begin);
sp0.addEventListener("click", doReset);

welcom();
