const symbols = ["jade.png", "orb_blue.png", "orb_red.png", "s1.png", "s2.png", "s3.png", "s4.png", "s5.png"];
const rates = { "jade.png": 50, "orb_blue.png": 20, "orb_red.png": 30, "s1.png": 10, "s2.png": 5, "s3.png": 3, "s4.png": 2, "s5.png": 1 };

let userData = { balance: 1000000, level: 1, lastWin: 0 };
let currentBet = 25000;
let isSpinning = false, isAutoPlaying = false, autoSpinCount = 0;
let saldoClickCount = 0, saldoClickTimer;

const rp = (v) => "Rp " + new Intl.NumberFormat('id-ID').format(v);

async function handleLogin() {
    const name = document.getElementById("usernameInput").value.trim();
    if (!name) return;
    const smoke = document.getElementById("transitionOverlay");
    smoke.classList.add("smoke-active");
    await new Promise(r => setTimeout(r, 800));
    document.getElementById("loginOverlay").style.display = "none";
    document.getElementById("mainGame").style.display = "flex";
    document.getElementById("userNameDisplay").innerText = name;
    initGrid(); updateUI();
    smoke.classList.remove("smoke-active");
}

function initGrid() {
    const g = document.getElementById("grid");
    g.innerHTML = "";
    for(let i=0; i<20; i++) g.innerHTML += `<div class="grid-item"><img src="assets/icons/s5.png"></div>`;
}

async function startSpin() {
    if (isSpinning || userData.balance < currentBet) { stopAuto(); return; }
    isSpinning = true; userData.balance -= currentBet;
    userData.lastWin = 0; updateUI();

    const imgs = document.querySelectorAll(".grid-item img");
    let c = 0;
    const t = setInterval(() => {
        imgs.forEach(img => {
            img.src = `assets/icons/${symbols[Math.floor(Math.random()*symbols.length)]}`;
        });
        if ((c+=100) >= 1000) { clearInterval(t); checkWin(); }
    }, 80);
}

function checkWin() {
    const imgs = Array.from(document.querySelectorAll(".grid-item img"));
    const files = imgs.map(img => img.src.split('/').pop());
    
    // WAYS LOGIC (5 Reels)
    let reels = [[],[],[],[],[]];
    files.forEach((f, i) => reels[i % 5].push(f));

    let winAmount = 0;
    let checked = new Set();

    reels[0].forEach(sym => {
        if (checked.has(sym)) return;
        checked.add(sym);
        let combo = 0, multi = 1;
        for(let r=0; r<5; r++) {
            let matches = reels[r].filter(s => s === sym || s === "wild.png").length;
            if(matches > 0) { multi *= matches; combo++; } else break;
        }
        if(combo >= 3) winAmount += multi * (rates[sym] || 1) * (currentBet / 100);
    });

    // MULTIPLIER ORBS
    let orbMult = 0;
    files.forEach(f => {
        if(f === "orb_red.png") orbMult += 10;
        if(f === "orb_blue.png") orbMult += 2;
    });

    if(winAmount > 0) {
        if(orbMult > 0) winAmount *= orbMult;
        userData.balance += winAmount;
        userData.lastWin = winAmount;
        if(winAmount > currentBet * 5) showBigWin(winAmount);
    }

    isSpinning = false; updateUI();
    if(isAutoPlaying) handleAutoNext();
}

function handleAutoNext() {
    if (autoSpinCount < 900000) autoSpinCount--;
    updateAutoStatus();
    if (autoSpinCount <= 0) stopAuto(); else setTimeout(startSpin, 1200);
}

function stopAuto() { isAutoPlaying = false; autoSpinCount = 0; updateAutoStatus(); }

function updateAutoStatus() {
    const btn = document.getElementById("autoOpenBtn"), st = document.getElementById("autoStatus");
    if (isAutoPlaying) {
        btn.innerText = "STOP"; btn.style.background = "red";
        st.style.display = "block"; st.innerText = autoSpinCount > 1000 ? "∞" : autoSpinCount + "x";
    } else {
        btn.innerText = "AUTO"; btn.style.background = "#222"; st.style.display = "none";
    }
}

function updateUI() {
    document.getElementById("balance").innerText = rp(userData.balance);
    document.getElementById("winDisplay").innerText = rp(userData.lastWin);
    document.getElementById("betDisplay").innerText = (currentBet/1000) + "k";
}

function changeBet(v) { currentBet = Math.max(25000, currentBet + v); updateUI(); }
function setMaxBet() { currentBet = 1000000; updateUI(); }
function toggleAutoPanel() { 
    const p = document.getElementById("autoPanel"); 
    p.style.display = p.style.display === "none" ? "block" : "none"; 
}

function setupAuto(val) {
    autoSpinCount = (val === 'custom') ? parseInt(document.getElementById("customAutoInput").value) : val;
    if (autoSpinCount > 0) { isAutoPlaying = true; toggleAutoPanel(); updateAutoStatus(); startSpin(); }
}

function handleSaldoClick() {
    saldoClickCount++; clearTimeout(saldoClickTimer);
    saldoClickTimer = setTimeout(() => { saldoClickCount = 0; }, 1500);
    if (saldoClickCount >= 5) toggleAdminPanel();
}
function toggleAdminPanel() { 
    const p = document.getElementById("adminPanel");
    p.style.display = p.style.display === "none" ? "flex" : "none"; 
}
function adminSetSaldo() {
    const v = document.getElementById("setSaldoInput").value;
    if(v) { userData.balance = parseInt(v); updateUI(); }
}
function togglePaytable() {
    const pt = document.getElementById("paytableOverlay");
    pt.style.display = pt.style.display === "none" ? "flex" : "none";
}

async function changeModeWithSmoke(isFree) {
    const smoke = document.getElementById("transitionOverlay");
    smoke.classList.add("smoke-active");
    await new Promise(r => setTimeout(r, 800));
    document.getElementById("mainGame").className = `mobile-wrapper ${isFree ? 'bg-freespin' : 'bg-normal'}`;
    smoke.classList.remove("smoke-active");
}

function showBigWin(amt) {
    const o = document.getElementById("bigWinOverlay");
    const c = document.getElementById("countDisplay");
    o.style.display = "flex"; c.innerText = rp(amt);
    setTimeout(() => o.style.display = "none", 3000);
}
