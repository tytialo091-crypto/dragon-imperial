const symbols = ["s1.png", "s2.png", "s3.png", "s4.png", "s5.png", "s6.png", "s7.png", "s8.png", "s9.png", "wild.png", "scatter.png"];
const rates = { "s1.png": 100, "s2.png": 50, "s3.png": 30, "s4.png": 20, "s5.png": 15, "s6.png": 10, "s7.png": 5, "s8.png": 3, "s9.png": 2 };

let userData = { name: "", balance: 1000000, level: 1, xp: 0, nextXp: 1000, lastWin: 0 };
let currentBet = 25000, currentMultiplier = 1, isSpinning = false;
let autoCount = 0, totalAutoStart = 0, isAutoPlaying = false;
let freeSpinLeft = 0, isFreeSpinMode = false;

// Parallax
document.addEventListener('mousemove', (e) => {
    const bg = document.getElementById("parallaxBg");
    bg.style.transform = `translate(${(window.innerWidth/2 - e.pageX)/40}px, ${(window.innerHeight/2 - e.pageY)/40}px)`;
});

// Login & Save System
function handleLogin() {
    const name = document.getElementById("usernameInput").value.trim();
    if (!name) return alert("Isi nama dulu!");
    userData.name = name;
    const saved = localStorage.getItem("DRAGON_SAVE_" + name);
    if (saved) Object.assign(userData, JSON.parse(saved));
    document.getElementById("loginOverlay").style.display = "none";
    document.getElementById("mainGame").style.display = "block";
    initGrid(); updateUI();
}

function saveData() { localStorage.setItem("DRAGON_SAVE_" + userData.name, JSON.stringify(userData)); }

// Core Game Functions
function handleSpinClick() { if (isAutoPlaying || isFreeSpinMode) stopAuto(); else startSpin(); }

async function startSpin() {
    if (isSpinning) return;
    if (!isFreeSpinMode && userData.balance < currentBet) { stopAuto(); return; }
    
    isSpinning = true;
    if (!isFreeSpinMode) {
        userData.balance -= currentBet;
        userData.lastWin = 0;
        currentMultiplier = 1;
        updateXP(Math.floor(currentBet / 100));
    }
    updateUI(); updateMultiUI();

    const imgs = document.querySelectorAll(".grid-item img");
    let c = 0;
    const t = setInterval(() => {
        imgs.forEach(img => img.src = `assets/icons/${symbols[Math.floor(Math.random()*9)]}`);
        if ((c+=100) >= 1500) { clearInterval(t); finalizeSpin(); }
    }, 70);
}

async function finalizeSpin() {
    let { winAmount, winningNodes, scatterCount } = calculateWays();

    if (scatterCount >= 3 && !isFreeSpinMode) triggerFreeSpin(15);

    if (winAmount > 0) {
        let finalWin = winAmount * currentMultiplier;
        winningNodes.forEach(node => node.classList.add("symbol-explode"));
        await new Promise(r => setTimeout(r, 450));
        userData.balance += finalWin; userData.lastWin += finalWin;
        currentMultiplier++; updateUI(); updateMultiUI();
        await dropSymbols(); applyEffects();
        setTimeout(finalizeSpin, 600); // Cascade logic
    } else {
        isSpinning = false;
        if (userData.lastWin > 0) triggerWinAnnouncement(userData.lastWin);
        saveData();
        
        if (isFreeSpinMode) {
            freeSpinLeft--;
            document.getElementById("fsLeft").innerText = freeSpinLeft;
            if (freeSpinLeft <= 0) exitFreeSpin();
            else setTimeout(startSpin, 1000);
        } else if (isAutoPlaying) {
            if (autoCount > 0 && autoCount < 1000) autoCount--;
            if (autoCount <= 0 && totalAutoStart < 1000) stopAuto();
            else { updateSpinButtonUI(); setTimeout(startSpin, 1000); }
        }
    }
}

function calculateWays() {
    const items = Array.from(document.querySelectorAll(".grid-item"));
    const reels = [[],[],[],[],[]];
    let scCount = 0;
    items.forEach((item, i) => {
        const s = item.querySelector("img").src.split('/').pop();
        reels[i % 5].push({sym: s, node: item});
        if (s === "scatter.png") scCount++;
    });

    let totalWin = 0, winNodes = new Set(), checked = new Set();
    reels[0].forEach(obj => {
        let s = obj.sym; if (checked.has(s) || s === "scatter.png" || s === "wild.png") return;
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
    return { winAmount: totalWin, winningNodes: Array.from(winNodes), scatterCount: scCount };
}

async function dropSymbols() {
    const items = Array.from(document.querySelectorAll(".grid-item"));
    for (let col = 0; col < 5; col++) {
        let colItems = []; for (let row = 0; row < 4; row++) colItems.push(items[row * 5 + col]);
        let remaining = colItems.filter(i => !i.classList.contains("symbol-explode")).map(i => i.querySelector("img").src);
        while(remaining.length < 4) remaining.unshift(`assets/icons/${symbols[Math.floor(Math.random()*9)]}`);
        colItems.forEach((item, idx) => {
            item.querySelector("img").src = remaining[idx];
            item.classList.remove("symbol-explode");
        });
    }
}

// UI Handlers
function triggerFreeSpin(count) {
    isFreeSpinMode = true; freeSpinLeft = count;
    document.getElementById("freeSpinCounter").style.display = "block";
    document.getElementById("fsDragon").classList.add("fs-active");
}
function exitFreeSpin() {
    isFreeSpinMode = false;
    document.getElementById("freeSpinCounter").style.display = "none";
    document.getElementById("fsDragon").classList.remove("fs-active");
}
function startAuto(count) { autoCount = count; totalAutoStart = count; isAutoPlaying = true; toggleAutoPanel(); updateSpinButtonUI(); startSpin(); }
function stopAuto() { isAutoPlaying = false; autoCount = 0; updateSpinButtonUI(); }
function updateSpinButtonUI() {
    const btn = document.getElementById("spinBtn"), txt = document.getElementById("spinText");
    if (isAutoPlaying) {
        btn.classList.add("stop-btn-active");
        txt.innerHTML = `STOP <span class="sub-text">AUTO ${autoCount > 1000 ? "∞" : autoCount+"/"+totalAutoStart}</span>`;
    } else { btn.classList.remove("stop-btn-active"); txt.innerHTML = "SPIN"; }
}
function updateUI() {
    document.getElementById("balance").innerText = userData.balance.toLocaleString();
    document.getElementById("winDisplay").innerText = userData.lastWin.toLocaleString();
}
function updateMultiUI() { document.getElementById("multiDisplay").innerText = "x" + currentMultiplier; }
function toggleAutoPanel() { const p = document.getElementById("autoPanel"); p.style.display = p.style.display === "none" ? "flex" : "none"; }
function initGrid() {
    const g = document.getElementById("grid"); g.innerHTML = "";
    for(let i=0; i<20; i++) g.innerHTML += `<div class="grid-item"><img src="assets/icons/s${Math.floor(Math.random()*9)+1}.png"></div>`;
}

// Particle Coins & Win Overlay Logic (Sama seperti sebelumnya)
