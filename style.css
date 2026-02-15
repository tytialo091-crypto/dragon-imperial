const symbols = ["jade.png", "orb_blue.png", "orb_red.png", "s1.png", "s2.png", "s3.png", "s4.png", "s5.png", "wild.png", "scatter.png"];
const rates = { "jade.png": 50, "orb_blue.png": 20, "orb_red.png": 30, "s1.png": 10, "s2.png": 5, "s3.png": 4, "s4.png": 3, "s5.png": 2 };

let userData = { name: "PLAYER", balance: 1000000, lastWin: 0, level: 1, xp: 0, nextXp: 1000 };
let currentBet = 25000, currentMultiplier = 1, isSpinning = false, isMuted = false;

const sounds = {
    bgm: new Audio('assets/sounds/bgm.mp3'),
    spin: new Audio('assets/sounds/spin.mp3'),
    win: new Audio('assets/sounds/win.mp3'),
    roar: new Audio('assets/sounds/roar.mp3')
};
sounds.bgm.loop = true;

// Parallax Controller
document.addEventListener('mousemove', (e) => {
    const bg = document.getElementById("parallaxBg");
    const x = (window.innerWidth / 2 - e.pageX) / 35;
    const y = (window.innerHeight / 2 - e.pageY) / 35;
    bg.style.transform = `translate(${x}px, ${y}px)`;
});

async function handleLogin() {
    userData.name = document.getElementById("usernameInput").value || "PLAYER";
    document.getElementById("loginOverlay").style.display = "none";
    document.getElementById("mainGame").style.display = "block";
    if(!isMuted) sounds.bgm.play();
    initGrid(); updateUI(); updateLevelUI();
}

function initGrid() {
    const g = document.getElementById("grid");
    g.innerHTML = "";
    for(let i=0; i<20; i++) g.innerHTML += `<div class="grid-item"><img src="assets/icons/s5.png"></div>`;
    applySpecialEffects();
}

async function startSpin() {
    if (isSpinning || userData.balance < currentBet) return;
    isSpinning = true;
    userData.balance -= currentBet;
    userData.lastWin = 0;
    currentMultiplier = 1;
    
    updateXP(Math.floor(currentBet / 100)); // Gain XP per spin
    updateMultiUI(); updateUI();
    
    if(!isMuted) { sounds.spin.currentTime = 0; sounds.spin.play(); }

    const imgs = document.querySelectorAll(".grid-item img");
    let c = 0;
    const t = setInterval(() => {
        imgs.forEach((img, i) => {
            const col = i % 5;
            if (c < 600 + (col * 250)) img.src = `assets/icons/${symbols[Math.floor(Math.random()*8)]}`;
        });
        if ((c+=100) >= 2000) { clearInterval(t); checkWin(); }
    }, 70);
}

async function checkWin() {
    let { winAmount, winningNodes } = calculateWays();

    if (winAmount > 0) {
        let finalWin = winAmount * currentMultiplier;
        winningNodes.forEach(node => {
            node.classList.add("symbol-explode");
        });
        if(!isMuted) sounds.win.play();
        
        await new Promise(r => setTimeout(r, 500));
        userData.balance += finalWin;
        userData.lastWin += finalWin;
        updateUI();

        currentMultiplier++;
        updateMultiUI();
        await dropSymbols();
        applySpecialEffects();
        setTimeout(checkWin, 600);
    } else {
        isSpinning = false;
        if(userData.lastWin > 0) addHistory(userData.name, userData.lastWin);
    }
}

function calculateWays() {
    const items = Array.from(document.querySelectorAll(".grid-item"));
    const reels = [[],[],[],[],[]];
    items.forEach((item, i) => reels[i % 5].push({sym: item.querySelector("img").src.split('/').pop(), node: item}));

    let totalWin = 0, winNodes = new Set(), checked = new Set();
    reels[0].forEach(obj => {
        let s = obj.sym;
        if (checked.has(s) || s === "scatter.png") return;
        checked.add(s);
        let combo = [];
        for(let r=0; r<5; r++) {
            let match = reels[r].filter(i => i.sym === s || i.sym === "wild.png");
            if(match.length > 0) combo.push(match); else break;
        }
        if(combo.length >= 3) {
            let ways = combo.reduce((a, b) => a * b.length, 1);
            totalWin += ways * (rates[s] || 1) * (currentBet / 100);
            combo.forEach(c => c.forEach(m => winNodes.add(m.node)));
        }
    });
    return { winAmount: totalWin, winningNodes: Array.from(winNodes) };
}

async function dropSymbols() {
    const grid = document.getElementById("grid");
    const items = Array.from(grid.children);
    for (let col = 0; col < 5; col++) {
        let colItems = [];
        for (let row = 0; row < 4; row++) colItems.push(items[row * 5 + col]);
        let remaining = colItems.filter(i => !i.classList.contains("symbol-explode")).map(i => i.querySelector("img").src);
        while(remaining.length < 4) remaining.unshift(`assets/icons/${symbols[Math.floor(Math.random()*8)]}`);
        colItems.forEach((item, idx) => {
            item.querySelector("img").src = remaining[idx];
            item.classList.remove("symbol-explode");
            item.classList.add("symbol-fall");
            setTimeout(() => item.classList.remove("symbol-fall"), 300);
        });
    }
}

function applySpecialEffects() {
    document.querySelectorAll(".grid-item").forEach(item => {
        const src = item.querySelector("img").src;
        item.classList.toggle("symbol-scatter", src.includes("scatter"));
        item.classList.toggle("symbol-wild", src.includes("wild"));
    });
}

function updateXP(amt) {
    userData.xp += amt;
    if(userData.xp >= userData.nextXp) {
        userData.level++;
        userData.xp -= userData.nextXp;
        userData.nextXp = Math.floor(userData.nextXp * 1.5);
        userData.balance += (userData.level * 50000); // Level Reward
        if(!isMuted) sounds.roar.play();
        showLevelReward();
    }
    updateLevelUI();
    updateUI();
}

function showLevelReward() {
    const r = document.getElementById("lvlRewardAnim");
    r.style.display = "block";
    setTimeout(() => r.style.display = "none", 2000);
}

function updateLevelUI() {
    const titles = ["NEWBIE", "BRONZE", "SILVER", "GOLDEN", "ANCIENT", "GOD"];
    document.getElementById("userLevel").innerText = "LV. " + userData.level;
    document.getElementById("levelName").innerText = titles[Math.min(Math.floor(userData.level/5), 5)] + " DRAGON";
    document.getElementById("xpProgress").style.width = (userData.xp / userData.nextXp * 100) + "%";
}

function updateUI() {
    document.getElementById("balance").innerText = "Rp " + userData.balance.toLocaleString();
    document.getElementById("winDisplay").innerText = "Rp " + userData.lastWin.toLocaleString();
    document.getElementById("betDisplay").innerText = (currentBet/1000) + "k";
}

function updateMultiUI() {
    const el = document.getElementById("multiDisplay");
    el.innerText = `x${currentMultiplier}`;
    el.classList.add("multi-bump");
    setTimeout(() => el.classList.remove("multi-bump"), 200);
}

function addHistory(name, amt) {
    const list = document.getElementById("historyList");
    list.innerHTML = `<div class="history-item"><span>${name}</span><span class="history-value">+Rp ${amt.toLocaleString()}</span></div>` + list.innerHTML;
}

function changeBet(v) { if(!isSpinning) { currentBet = (currentBet >= 500000) ? 25000 : currentBet + v; updateUI(); } }
function toggleMute() { isMuted = !isMuted; sounds.bgm[isMuted?'pause':'play'](); document.getElementById("muteBtn").innerText = isMuted?'🔇':'🔊'; }
