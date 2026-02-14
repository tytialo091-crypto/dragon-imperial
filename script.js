const symbols = ["tea_cup.png", "royal_fan.png", "gold_coin.png", "lantern_red.png", "jade_seal.png", "dragon_gold.png"];
let balance = 100000, currentBet = 1000, isSpinning = false, totalMultiplier = 0, adminClicks = 0, forceWin = false;

const rp = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });
const sounds = {
    bgm: new Audio('assets/sounds/bgm.mp3'),
    spin: new Audio('assets/sounds/spin.mp3'),
    win: new Audio('assets/sounds/win.mp3')
};
sounds.bgm.loop = true;

// Jackpot System
setInterval(() => {
    let jp = 5000000 + Math.floor(Math.random() * 5000);
    document.getElementById("jpDisplay").innerText = rp.format(jp);
}, 2000);

document.getElementById("triggerAdmin").addEventListener("click", () => {
    if (++adminClicks >= 5) { document.getElementById("adminPanel").style.display = "block"; adminClicks = 0; }
});

document.getElementById("startBtn").addEventListener("click", () => {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("mainGame").style.display = "flex";
    sounds.bgm.play().catch(() => {});
    initGrid(); updateUI();
});

function initGrid() {
    const grid = document.getElementById("grid");
    grid.innerHTML = "";
    for(let i=0; i<20; i++) {
        const div = document.createElement("div");
        div.className = "grid-item";
        div.innerHTML = `<img src="assets/icons/${symbols[0]}">`;
        grid.appendChild(div);
    }
}

async function startSpin() {
    if (isSpinning || balance < currentBet) return;
    isSpinning = true; balance -= currentBet; totalMultiplier = 0;
    document.getElementById("multiplierTracker").style.display = "none";
    updateUI(); sounds.spin.play().catch(() => {});

    let count = 0;
    const imgs = document.querySelectorAll(".grid-item img");
    const timer = setInterval(() => {
        imgs.forEach(img => {
            let pool = (forceWin || balance < 5000) ? symbols.slice(3) : symbols;
            img.src = `assets/icons/${pool[Math.floor(Math.random() * pool.length)]}`;
        });
        if ((count += 100) >= 1000) { clearInterval(timer); checkWin(); }
    }, 80);
}

async function checkWin() {
    const items = Array.from(document.querySelectorAll(".grid-item"));
    const results = items.map(item => item.querySelector("img").src.split('/').pop());
    const counts = {};
    results.forEach(src => counts[src] = (counts[src] || 0) + 1);

    const rates = { "jade_seal.png": 10, "lantern_red.png": 5, "gold_coin.png": 2, "royal_fan.png": 1, "tea_cup.png": 0.5 };
    let winAmount = 0, winSrcs = [];

    for (const [src, count] of Object.entries(counts)) {
        if (rates[src] && count >= 6) { winSrcs.push(src); winAmount += Math.floor(currentBet * (count * rates[src])); }
    }

    if (winSrcs.length > 0 || forceWin) {
        totalMultiplier += [2, 5, 10, 50][Math.floor(Math.random() * 4)];
        triggerDragonFire();

        items.forEach(item => {
            if (winSrcs.includes(item.querySelector("img").src.split('/').pop()) || forceWin) 
                item.querySelector("img").classList.add("symbol-explode");
        });

        sounds.win.play().catch(() => {});
        await new Promise(r => setTimeout(r, 500));
        let winFinal = (winAmount || currentBet * 5) * totalMultiplier;
        balance += winFinal;
        document.getElementById("winDisplay").innerText = rp.format(winFinal);

        if (winFinal >= currentBet * 10) showBigWin(winFinal);

        // Tumble Logic
        items.forEach(item => {
            if (item.querySelector("img").classList.contains("symbol-explode")) {
                item.querySelector("img").src = `assets/icons/${symbols[Math.floor(Math.random() * 6)]}`;
                item.querySelector("img").classList.remove("symbol-explode");
            }
        });

        forceWin = false; updateUI();
        await new Promise(r => setTimeout(r, 600));
        isSpinning = false;
    } else {
        isSpinning = false;
        if (document.getElementById("autoCheck").checked) setTimeout(startSpin, 1000);
    }
}

function triggerDragonFire() {
    const dragon = document.querySelector(".dragon-bg");
    dragon.classList.add("dragon-attack");
    document.getElementById("multiplierTracker").style.display = "block";
    document.getElementById("multValue").innerText = "x" + totalMultiplier;
    setTimeout(() => dragon.classList.remove("dragon-attack"), 600);
}

function showBigWin(amt) {
    sounds.win.play().catch(() => {});
    document.getElementById("bigWinAmount").innerText = rp.format(amt);
    document.getElementById("bigWinOverlay").style.display = "flex";
}

function closeBigWin() { document.getElementById("bigWinOverlay").style.display = "none"; }
function updateUI() {
    document.getElementById("balance").innerText = rp.format(balance);
    document.getElementById("betDisplay").innerText = "BET: " + rp.format(currentBet);
}
function changeBet(v) { if(!isSpinning) { currentBet = Math.max(1000, currentBet + v); updateUI(); } }
document.getElementById("spinBtn").addEventListener("click", startSpin);
function addBalance(amt) { balance += amt; updateUI(); }
function cheatMaxWin() { forceWin = true; document.getElementById("adminPanel").style.display = "none"; }
function closeAdmin() { document.getElementById("adminPanel").style.display = "none"; }
