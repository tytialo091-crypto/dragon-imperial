const symbols = ["s1.png", "s2.png", "s3.png", "s4.png", "s5.png", "s6.png", "s7.png", "s8.png", "s9.png"];
const rates = { "s1.png": 50, "s2.png": 25, "s3.png": 15, "s4.png": 10, "s5.png": 5, "s6.png": 3, "s7.png": 2, "s8.png": 1, "s9.png": 0.5 };

let currentUser = "";
let userData = { balance: 1000000, exp: 0, level: 1, lastWin: 0, lastDaily: 0 };
let currentBet = 25000;
let isSpinning = false;
let isMuted = false;

const rp = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);
const sounds = { bgm: new Audio('assets/sounds/bgm.mp3'), spin: new Audio('assets/sounds/spin.mp3'), win: new Audio('assets/sounds/win.mp3'), roar: new Audio('assets/sounds/roar.mp3') };
sounds.bgm.loop = true;

function handleLogin() {
    const name = document.getElementById("usernameInput").value.trim();
    if (!name) return;
    currentUser = name;
    const all = JSON.parse(localStorage.getItem('dragonUsers')) || {};
    userData = all[currentUser] || userData;
    document.getElementById("loginOverlay").style.display = "none";
    document.getElementById("mainGame").style.display = "flex";
    if(!isMuted) sounds.bgm.play();
    initGrid(); updateUI();
}

function updateUI() {
    document.getElementById("balance").innerText = rp(userData.balance);
    document.getElementById("winDisplay").innerText = rp(userData.lastWin);
    document.getElementById("betDisplay").innerText = "BET: " + (currentBet/1000) + "k";
    document.getElementById("userNameDisplay").innerText = currentUser;
    document.getElementById("userLevel").innerText = userData.level;
    document.getElementById("expFill").style.width = (userData.exp/1000*100) + "%";
}

async function startSpin() {
    if (isSpinning || userData.balance < currentBet) return;
    isSpinning = true;
    userData.balance -= currentBet;
    userData.exp += 100;
    if (userData.exp >= 1000) { userData.level++; userData.exp=0; userData.balance+=100000; alert("LEVEL UP! +Rp 100k"); }
    updateUI();
    sounds.spin.play();

    const imgs = document.querySelectorAll(".grid-item img");
    let c = 0;
    const t = setInterval(() => {
        imgs.forEach(img => {
            let s = symbols[Math.floor(Math.random()*symbols.length)];
            // Volatility Control: Bet < 100k dipersulit dapat S1
            if(currentBet < 100000 && s === "s1.png" && Math.random() > 0.2) s = "s9.png";
            img.src = `assets/icons/${s}`;
        });
        if ((c+=100) >= 1000) { clearInterval(t); checkWin(); }
    }, 80);
}

async function checkWin() {
    const items = Array.from(document.querySelectorAll(".grid-item"));
    const results = items.map(i => i.querySelector("img").src.split('/').pop());
    const counts = {};
    results.forEach(s => counts[s] = (counts[s] || 0) + 1);

    let totalWin = 0; let winSrcs = [];
    for (const [s, count] of Object.entries(counts)) {
        if (rates[s] && count >= 8) { winSrcs.push(s); totalWin += (currentBet * rates[s]); }
    }

    if (totalWin > 0) {
        if (winSrcs.includes("s1.png")) triggerFlash();
        if (totalWin >= currentBet * 50) await showSpecialWin(totalWin);
        else { userData.balance += totalWin; userData.lastWin = totalWin; }
        
        save(); updateUI();
        items.forEach(i => { if (winSrcs.includes(i.querySelector("img").src.split('/').pop())) i.querySelector("img").classList.add("explode"); });
        await new Promise(r => setTimeout(r, 600));
        items.forEach(i => { if(i.querySelector("img").classList.contains("explode")) { i.querySelector("img").src = `assets/icons/${symbols[Math.floor(Math.random()*symbols.length)]}`; i.querySelector("img").classList.remove("explode"); } });
        setTimeout(checkWin, 400);
    } else {
        isSpinning = false;
        if (document.getElementById("autoCheck").checked) setTimeout(startSpin, 1000);
    }
}

async function showSpecialWin(target) {
    const isMax = target >= currentBet * 100;
    const ov = document.getElementById(isMax ? "maxwinOverlay" : "bigWinOverlay");
    const disp = document.getElementById(isMax ? "maxwinCount" : "countDisplay");
    ov.style.display = "flex";
    if(isMax) triggerDragonBreath();
    sounds.win.play();
    
    let cur = 0;
    return new Promise(res => {
        const itv = setInterval(() => {
            cur += target/40;
            disp.innerText = rp(Math.floor(cur));
            if (cur >= target) { 
                clearInterval(itv); 
                userData.balance += target; 
                userData.lastWin = target;
                setTimeout(() => { ov.style.display="none"; res(); }, 3000); 
            }
        }, 50);
    });
}

function triggerDragonBreath() {
    const container = document.getElementById("fireContainer");
    for (let i = 0; i < 40; i++) {
        setTimeout(() => {
            const p = document.createElement("div");
            p.className = "fire-particle";
            p.style.left = Math.random() * 100 + "%";
            p.style.setProperty('--random-x', ((Math.random()-0.5)*200) + "px");
            container.appendChild(p);
            setTimeout(() => p.remove(), 1000);
        }, i * 30);
    }
}

function triggerFlash() {
    const g = document.getElementById("mainGame");
    g.classList.add("gold-flash");
    sounds.roar.play();
    setTimeout(() => g.classList.remove("gold-flash"), 1000);
}

function claimDaily() {
    const now = Date.now();
    if (now - userData.lastDaily < 86400000) return alert("Belum 24 jam!");
    userData.balance += 50000; userData.lastDaily = now;
    save(); updateUI(); alert("Bonus 50rb klaim!");
}

function save() { const all = JSON.parse(localStorage.getItem('dragonUsers')) || {}; all[currentUser] = userData; localStorage.setItem('dragonUsers', JSON.stringify(all)); }
function initGrid() { const g = document.getElementById("grid"); g.innerHTML = ""; for(let i=0; i<20; i++) g.innerHTML += `<div class="grid-item"><img src="assets/icons/s9.png"></div>`; }
function toggleUserModal() { const m = document.getElementById("userModal"); m.style.display = m.style.display === "none" ? "flex" : "none"; }
function togglePaytable() { 
    const m = document.getElementById("paytableModal");
    document.getElementById("payList").innerHTML = Object.entries(rates).map(([s, r]) => `<div style="display:flex; justify-content:space-between"><span>${s}</span><b>x${r}</b></div>`).join('');
    m.style.display = m.style.display === "none" ? "flex" : "none"; 
}
function changeBet(v) { if(!isSpinning) { let t = currentBet+v; if(t>=25000 && t<=1000000) { currentBet=t; updateUI(); } } }
function setMaxBet() { if(!isSpinning) { currentBet=1000000; updateUI(); } }
function handleLogout() { save(); location.reload(); }
function toggleMute() { isMuted = !isMuted; sounds.bgm.muted = isMuted; document.getElementById("muteBtn").innerText = isMuted ? "🔇" : "🔊"; }
