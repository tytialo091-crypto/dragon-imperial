const symbols = ["s1.png", "s2.png", "s3.png", "s4.png", "s5.png", "s6.png", "s7.png", "s8.png", "s9.png"];
const rates = { "s1.png": 50, "s2.png": 25, "s3.png": 15, "s4.png": 10, "s5.png": 5, "s6.png": 3, "s7.png": 2, "s8.png": 1, "s9.png": 0.5 };

let currentUser = "";
let userData = { balance: 1000000, exp: 0, level: 1, lastWin: 0 };
let currentBet = 25000;
let isSpinning = false;
let autoSpinCount = 0;
let isAutoPlaying = false;
let saldoClickCount = 0;
let saldoClickTimer;

const rp = (v) => "Rp " + new Intl.NumberFormat('id-ID').format(v);

// --- LOGIN & TRANSISI ---
async function handleLogin() {
    const name = document.getElementById("usernameInput").value.trim();
    if (!name) return;

    const smoke = document.getElementById("transitionOverlay");
    smoke.classList.add("smoke-active");
    await new Promise(r => setTimeout(r, 800));

    currentUser = name;
    const all = JSON.parse(localStorage.getItem('dragonUsers')) || {};
    userData = all[currentUser] || userData;
    
    document.getElementById("loginOverlay").style.display = "none";
    document.getElementById("mainGame").style.display = "flex";
    initGrid(); updateUI();
    smoke.classList.remove("smoke-active");
}

// --- CORE GAMEPLAY ---
function initGrid() {
    const g = document.getElementById("grid");
    g.innerHTML = "";
    for(let i=0; i<20; i++) g.innerHTML += `<div class="grid-item"><img src="assets/icons/s9.png"></div>`;
}

async function startSpin() {
    if (isSpinning || userData.balance < currentBet) { stopAuto(); return; }
    isSpinning = true;
    userData.balance -= currentBet;
    updateUI();

    const imgs = document.querySelectorAll(".grid-item img");
    let count = 0;
    const interval = setInterval(() => {
        imgs.forEach(img => {
            img.src = `assets/icons/${symbols[Math.floor(Math.random()*symbols.length)]}`;
        });
        if ((count+=100) >= 1000) { clearInterval(interval); checkWin(); }
    }, 80);
}

function checkWin() {
    // Logika menang (Sederhana untuk demo)
    let win = Math.random() > 0.7 ? currentBet * 5 : 0;
    if (win > 0) {
        userData.balance += win;
        userData.lastWin = win;
    }
    isSpinning = false;
    updateUI();
    if (isAutoPlaying) handleAutoNext();
}

// --- AUTO SPIN SYSTEM ---
function toggleAutoPanel() {
    const p = document.getElementById("autoPanel");
    p.style.display = (p.style.display === "none") ? "flex" : "none";
}

function setupAuto(val) {
    autoSpinCount = (val === 'custom') ? parseInt(document.getElementById("customAutoInput").value) : val;
    if (autoSpinCount > 0) {
        isAutoPlaying = true;
        toggleAutoPanel();
        updateAutoStatus();
        startSpin();
    }
}

function handleAutoNext() {
    if (autoSpinCount > 0) {
        if (autoSpinCount < 9999) autoSpinCount--;
        updateAutoStatus();
        if (autoSpinCount <= 0) stopAuto();
        else setTimeout(startSpin, 1200);
    }
}

function stopAuto() {
    isAutoPlaying = false; autoSpinCount = 0; updateAutoStatus();
}

function updateAutoStatus() {
    const btn = document.getElementById("autoOpenBtn");
    const st = document.getElementById("autoStatus");
    if (isAutoPlaying) {
        btn.innerText = "STOP"; btn.style.background = "red";
        st.style.display = "block"; st.innerText = autoSpinCount > 1000 ? "∞" : autoSpinCount + "x";
    } else {
        btn.innerText = "AUTO"; btn.style.background = "#222"; st.style.display = "none";
    }
}

// --- ADMIN & UTILITY ---
function handleSaldoClick() {
    saldoClickCount++;
    clearTimeout(saldoClickTimer);
    saldoClickTimer = setTimeout(() => { saldoClickCount = 0; }, 1500);
    if (saldoClickCount >= 5) toggleAdminPanel();
}

function toggleAdminPanel() {
    const p = document.getElementById("adminPanel");
    p.style.display = (p.style.display === "none") ? "flex" : "none";
}

async function changeModeWithSmoke(isFree) {
    const smoke = document.getElementById("transitionOverlay");
    smoke.classList.add("smoke-active");
    await new Promise(r => setTimeout(r, 800));
    document.getElementById("mainGame").className = `mobile-wrapper ${isFree ? 'bg-freespin' : 'bg-normal'}`;
    smoke.classList.remove("smoke-active");
}

function updateUI() {
    document.getElementById("balance").innerText = rp(userData.balance);
    document.getElementById("winDisplay").innerText = rp(userData.lastWin);
    document.getElementById("betDisplay").innerText = "BET: " + (currentBet/1000) + "k";
    document.getElementById("userNameDisplay").innerText = currentUser;
    document.getElementById("userLevel").innerText = userData.level;
}

function changeBet(v) { currentBet = Math.max(25000, currentBet + v); updateUI(); }
function setMaxBet() { currentBet = 1000000; updateUI(); }
function save() { const all = JSON.parse(localStorage.getItem('dragonUsers')) || {}; all[currentUser] = userData; localStorage.setItem('dragonUsers', JSON.stringify(all)); }
