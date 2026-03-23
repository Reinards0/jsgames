let man = document.getElementById("man");
const bt1 = document.getElementById("m1");
const bt2 = document.getElementById("m2");

let show = 0;
let apple;
let manWidth = 608;

const boards = {
    txt: ["9 x 9","16 x 16","25 x 25","36 x 36","49 x 49","64 x 64","81 x 81"],
    val: [3,4,5,6,7,8,9],
    thx: ["09","10","19","24","31","40","51"],
    siz: [32,30,28,26,24,22,20],
    nof: [1,0,10,0,0,0,0],
    bon: [0x26,0x29,0x28,0x24,0x24,0x24,0x24],
    bof: [0x25,0x27,0x25,0x25,0x25,0x25,0x25],
    spc: [0,0x21,0x23,0x26,0x26,0x26,0x26]
}

const lifes = [0,1,2,3,5,6,7,8,9,10,12,15,16];

const rates = {
    txt: ["Low","Medium","High"],
    val: [30,50,70],
}

function urange(){
    inp = document.getElementById("stack");
    if(isNaN(parseInt(inp.value)) || inp.value < 0) inp.value = 0;
    else if(inp.value >= 100) inp.value = 100;
    else inp.value = parseInt(inp.value);
    achange();
}

function achange(){
    if(document.getElementById("app") !== null) return;
    apple = document.createElement("input");
    apple.id = "app";
    apple.type = "submit";
    apple.value = "Apply";
    apple.style = "bottom: 25px; right: 25px;";
    apple.onclick = function(){
        gmdat.boards = parseInt(document.querySelector('input[name="boards"]:checked').value);
        let b = gmdat.boards - 3;
        gmdat.sa = boards.siz[b];
        gmdat.nsec = boards.nof[b];
        gmdat.plus = boards.bon[b];
        gmdat.minus = boards.bof[b];
        gmdat.wildn = boards.spc[b];
        gmdat.mlim = parseInt(document.querySelector('input[name="lifes"]:checked').value);
        gmdat.snum = parseInt(document.getElementById('stack').value);
        gmdat.snum = Math.max(gmdat.snum, 50);
        gmdat.bchn = parseInt(document.querySelector('input[name="bonuses"]:checked').value);
        gmdat.mus = document.getElementById("mus").checked;
        gmdat.snd = document.getElementById("sfx").checked;
        localStorage.setItem("gmdat",JSON.stringify(gmdat));
        let appli = document.createElement("label");
        appli.id = "apd";
        appli.style = "bottom: 25px; right: 25px;";
        appli.innerText = "Settings applied. Please refresh the page.";
        apple.replaceWith(appli);
    };
    if(document.getElementById("apd") !== null){
        document.getElementById("apd").replaceWith(apple);
    }else{
        man.appendChild(apple);
    }
}

function showSets(){
    const opt = document.createElement("div");
    opt.id = "man";
    opt.style.left = bt1.offsetLeft + "px";
    opt.style.top = bt1.offsetHeight + bt1.offsetTop - 1 + "px";
    if(show === 1){
        show = 0;
        opt.style.display = "none";
        man.replaceWith(opt);
        man = opt;
        bt1.style.backgroundColor = "";
        bt1.style.borderBottom = "";
        return;
    }
    show = 1;

    bt1.style.backgroundColor = "#fff";
    bt1.style.borderBottom = "none";
    bt2.style.backgroundColor = "";
    bt2.style.borderBottom = "";

    let lab = document.createElement("label");
    let inp;

    lab.style = "top: 20px; left: 20px;";
    lab.textContent = "Board Size";
    opt.appendChild(lab);

    let y = 45;
    let x = 20;

    for(let v = 0; v < 2; v++){
        inp = document.createElement("input");
        inp.type = "radio";
        inp.name = "boards";
        inp.id = `s${boards.thx[v]}`;
        inp.value = boards.val[v];
        inp.style = `top: ${y}px; left: ${x}px;`;
        inp.onchange = () => achange();
        if(boards.val[v] === gmdat.boards) inp.checked = true;
        lab = document.createElement("label");
        lab.setAttribute("for", `s${boards.thx[v]}`);
        lab.style = `top: ${y}px; left: ${x+25}px;`;
        lab.textContent = boards.txt[v];
        opt.appendChild(inp);
        opt.appendChild(lab);
        y += 20;
    }

    lab = document.createElement("label");
    lab.style = "top: 150px; left: 20px;"
    lab.textContent = "Mistake Limit (Lives)";
    opt.appendChild(lab);

    y = 175;
    x = 20;

    for(let v = 0; v < lifes.length; v++){
        inp = document.createElement("input");
        inp.type = "radio";
        inp.name = "lifes";
        inp.id = `c${lifes[v]}`;
        inp.value = lifes[v];
        inp.style = `top: ${y}px; left: ${x}px;`;
        inp.onchange = () => achange();
        if(lifes[v] === gmdat.mlim) inp.checked = true;
        lab = document.createElement("label");
        lab.setAttribute("for", `c${lifes[v]}`);
        lab.style = `top: ${y}px; left: ${x+25}px;`;
        lab.textContent = v === 0 ? "None" : lifes[v];
        opt.appendChild(inp);
        opt.appendChild(lab);
        if(v === 0){
            y += 25;
        }else if(v % 3 === 0){
            y += 20;
            x = 20;
        }else{
            x += 50;
        }
    }

    lab = document.createElement("label");
    lab.style = "top: 20px; left: 220px;";
    lab.textContent = "Uniqueness";
    opt.appendChild(lab);

    inp = document.createElement("input");
    inp.type = "text";
    inp.name = "diff1";
    inp.id = "stack";
    inp.value = gmdat.snum;
    inp.style = "top: 45px; left: 220px; width: 3ch;";
    inp.maxLength = 3;
    inp.onchange = () => urange();
    lab = document.createElement("label");
    lab.setAttribute("for", "stack");
    lab.style = "top: 45px; left: 255px;";
    lab.textContent = "%";
    opt.appendChild(inp);
    opt.appendChild(lab);

    lab = document.createElement("label");
    lab.style = "top: 100px; left: 220px;";
    lab.textContent = "Bonus Rate";
    opt.appendChild(lab);

    y = 125;
    x = 220;

    for(let v = 0; v < 3; v++){
        inp = document.createElement("input");
        inp.type = "radio";
        inp.name = "bonuses";
        inp.id = `b${v+1}`;
        inp.value = rates.val[v];
        inp.style = `top: ${y}px; left: ${x}px;`;
        inp.onchange = () => achange();
        if(rates.val[v] === gmdat.bchn) inp.checked = true;
        lab = document.createElement("label");
        lab.setAttribute("for", `b${v+1}`);
        lab.style = `top: ${y}px; left: ${x+25}px;`;
        lab.textContent = rates.txt[v];
        opt.appendChild(inp);
        opt.appendChild(lab);
        y += 20;
    }

    lab = document.createElement("label");
    lab.style = "top: 200px; left: 220px;";
    lab.textContent = "Sounds";
    opt.appendChild(lab);

    y = 225;
    x = 220;

    inp = document.createElement("input");
    inp.type = "checkbox";
    inp.name = "music";
    inp.id = "mus";
    inp.checked = gmdat.mus;
    inp.style = `top: ${y}px; left: ${x}px;`;
    inp.onchange = () => achange();
    lab = document.createElement("label");
    lab.setAttribute("for", "mus");
    lab.style = `top: ${y}px; left: ${x+25}px;`;
    lab.textContent = "Music";
    opt.appendChild(inp);
    opt.appendChild(lab);
    y += 20;

    inp = document.createElement("input");
    inp.type = "checkbox";
    inp.name = "sfx";
    inp.id = "sfx";
    inp.checked = gmdat.snd;
    inp.style = `top: ${y}px; left: ${x}px;`;
    inp.onchange = () => achange();
    lab = document.createElement("label");
    lab.setAttribute("for", "sfx");
    lab.style = `top: ${y}px; left: ${x+25}px;`;
    lab.textContent = "SFX";
    opt.appendChild(inp);
    opt.appendChild(lab);

    man.replaceWith(opt);
    man = opt;
}

function showHelp(){
    const hlp = document.createElement("div");
    hlp.id = "man";
    hlp.style.left = bt1.offsetLeft + "px";
    hlp.style.top = bt1.offsetHeight + bt1.offsetTop - 1 + "px";
    if(show === 2){
        show = 0;
        hlp.style.display = "none";
        man.replaceWith(hlp);
        man = hlp;
        bt2.style.backgroundColor = "";
        bt2.style.borderBottom = "";
        return;
    }
    show = 2;

    bt2.style.backgroundColor = "#fff";
    bt2.style.borderBottom = "none";
    bt1.style.backgroundColor = "";
    bt1.style.borderBottom = "";

    let lab = document.createElement("h3");
    lab.style = "top: 16px; left: 20px; margin: 0;";
    lab.textContent = "About";
    hlp.appendChild(lab);

    lab = document.createElement("p");
    const brr = () => document.createElement("br");

    lab.style = "top: 45px; left: 20px; margin: 0;";
    lab.style.width = `${manWidth-40}px`;
    lab.append("Welcome to Sudoku Drop.");
    lab.append(brr());
    lab.append("This is a game about filling sudoku board from bottom to top.");
    lab.append(brr());
    lab.append(brr());
    lab.append("Click and drag the numbers from the left column onto the top of the board.");
    lab.append(brr());
    lab.append("Release to drop the number onto the board.");
    lab.append(brr());
    lab.append(brr());
    lab.append("Try and place all the numbers by the sudoku rule!");
    lab.append(brr());
    lab.append(brr());
    lab.append("The 'Bonus' shows which number act as a wild number.");
    lab.append(brr());
    lab.append("Wild numbers will not be validated for conflicts.");
    hlp.appendChild(lab);

    lab = document.createElement("h3");
    lab.style = "top: 250px; left: 20px; margin: 0;";
    lab.textContent = "Settings";
    hlp.appendChild(lab);

    lab = document.createElement("p");
    const bol = (t) => (bp = document.createElement("b"), bp.textContent = t, bp);

    lab.style = "top: 280px; left: 20px; margin: 0;";
    lab.style.width = `${manWidth-40}px`;
    lab.append(bol("Board Size"));
    lab.append(brr());
    lab.append("Sets the board size, can be classic (9 x 9) or hexadecimal (16 x 16).");
    lab.append(brr());
    lab.append(brr());
    lab.append(bol("Mistake Limit"));
    lab.append(brr());
    lab.append("Sets the number of allowed conflicts in one game.");
    lab.append(brr());
    lab.append("Setting it to none means no limit.");
    lab.append(brr());
    lab.append(brr());
    lab.append(bol("Uniqueness"));
    lab.append(brr());
    lab.append("Affects how the left column generates number.");
    lab.append(brr());
    lab.append("Higher values makes it more possible to avoid conflicts.");
    lab.append(brr());
    lab.append(brr());
    lab.append(bol("Bonus Rate"));
    lab.append(brr());
    lab.append("Sets how often the wild number will be generated.");
    lab.append(brr());
    hlp.appendChild(lab);

    lab = document.createElement("label");
    lab.style = "top: 540px; right: 20px;";
    lab.innerHTML = "&copy; 2025 renalde0";
    hlp.appendChild(lab);

    lab = document.createElement("label");
    lab.style = "top: 570px; visibility: hidden;";
    lab.innerHTML = "-";
    hlp.appendChild(lab);

    man.replaceWith(hlp);
    man = hlp;
}

showHelp();