let coin=1000;
let freeSpin=0;
let totalWin=0;
let totalSpin=0;
let highscore=1000;
let auto=false;
let autoInterval;
let volatility="medium";
let combo=1;

const RTP=0.92;

const normal=["🀄","🀅","🀆","🀇","🀈","🀉"];
const wild="⭐";
const scatter="🧧";

const grid=document.getElementById("grid");
const coinEl=document.getElementById("coin");
const freeEl=document.getElementById("free");
const highEl=document.getElementById("high");
const info=document.getElementById("info");

function save(){
    localStorage.setItem("slot_save",JSON.stringify({
        coin,freeSpin,totalWin,totalSpin,highscore
    }));
}

function load(){
    let data=localStorage.getItem("slot_save");
    if(data){
        let d=JSON.parse(data);
        coin=d.coin;
        freeSpin=d.freeSpin;
        totalWin=d.totalWin;
        totalSpin=d.totalSpin;
        highscore=d.highscore;
    }
}

function randomSymbol(){
    let r=Math.random();

    if(volatility==="low"){
        if(r<0.05) return wild;
        if(r<0.1) return scatter;
    }
    if(volatility==="medium"){
        if(r<0.1) return wild;
        if(r<0.18) return scatter;
    }
    if(volatility==="high"){
        if(r<0.15) return wild;
        if(r<0.25) return scatter;
    }

    return normal[Math.floor(Math.random()*normal.length)];
}

function createGrid(){
    for(let i=0;i<15;i++){
        let c=document.createElement("div");
        c.className="cell";
        c.textContent=randomSymbol();
        grid.appendChild(c);
    }
}

function spin(){
    let bet=parseInt(document.getElementById("bet").value);

    if(freeSpin<=0){
        if(coin<bet){
            info.textContent="❌ Coin Habis!";
            return;
        }
        coin-=bet;
    }else{
        freeSpin--;
    }

    combo=1;
    totalSpin++;
    update();

    document.querySelectorAll(".cell").forEach(c=>{
        c.classList.remove("win");
        c.textContent=randomSymbol();
    });

    setTimeout(()=>checkWin(bet),200);
}

function checkWin(bet){
    let cells=document.querySelectorAll(".cell");
    let win=0;
    let scatterCount=0;

    cells.forEach(c=>{
        if(c.textContent===scatter) scatterCount++;
    });

    if(scatterCount>=3) freeSpin+=5;

    for(let r=0;r<3;r++){
        let start=r*5;
        let first=cells[start].textContent;
        let match=true;

        for(let i=1;i<5;i++){
            let cur=cells[start+i].textContent;
            if(cur!==first && cur!==wild && first!==wild){
                match=false; break;
            }
        }

        if(match){
            for(let i=0;i<5;i++){
                cells[start+i].classList.add("win");
                particle(cells[start+i]);
            }
            win+=bet*2*combo;
            combo++;
        }
    }

    let expected=totalSpin*bet*RTP;
    if(totalWin>expected) win*=0.5;

    if(win>0){
        coin+=Math.floor(win);
        totalWin+=Math.floor(win);
        info.innerHTML=`🔥 WIN ${Math.floor(win)} | ⚡ x${combo-1}`;
        setTimeout(()=>cascade(bet),600);
    }

    if(coin>highscore) highscore=coin;

    save();
    update();
}

function cascade(bet){
    let again=false;
    document.querySelectorAll(".cell").forEach(c=>{
        if(c.classList.contains("win")){
            c.classList.remove("win");
            c.textContent=randomSymbol();
            again=true;
        }
    });

    if(again) setTimeout(()=>checkWin(bet),400);
    else combo=1;
}

function particle(cell){
    let rect=cell.getBoundingClientRect();
    let p=document.createElement("div");
    p.className="particle";
    p.style.left=rect.left+"px";
    p.style.top=rect.top+"px";
    document.body.appendChild(p);
    setTimeout(()=>p.remove(),500);
}

function toggleAuto(){
    auto=!auto;
    if(auto) autoInterval=setInterval(spin,1200);
    else clearInterval(autoInterval);
}

function update(){
    coinEl.textContent=coin;
    freeEl.textContent=freeSpin;
    highEl.textContent=highscore;
}

document.getElementById("spinBtn").onclick=spin;
document.getElementById("autoBtn").onclick=toggleAuto;
document.getElementById("vol").onchange=e=>volatility=e.target.value;

load();
createGrid();
update();