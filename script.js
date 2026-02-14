const symbols = ["tea_cup.png", "royal_fan.png", "gold_coin.png", "lantern_red.png", "jade_seal.png", "dragon_gold.png"];
let balance = 100000, currentBet = 1000, isSpinning = false, totalMultiplier = 0;
let isPausedForBigWin = false, adminClicks = 0, winDifficulty = 0.7, forceWin = false;

// Format Rupiah
const rp = new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
});

const sounds = {
    bgm: new Audio('assets/sounds/bgm.mp3'),
    spin: new Audio('assets/sounds/spin.mp3'),
    win: new Audio('assets/sounds/win.mp3')
};
sounds.bgm.loop = true;

// Jackpot Berjalan (Rp)
setInterval(() => {
    let jpStr = document.getElementById("jpDisplay").innerText.replace(/[Rp.]/g, '');
    let jp = parseInt(jpStr) + Math.floor(Math.random() * 500);
    document.getElementById("jpDisplay").innerText = rp.format(jp);
}, 2000);

// Admin Trigger (Klik SALDO 5x)
document.getElementById("triggerAdmin").addEventListener("click", () => {
    adminClicks++;
    if (adminClicks >= 5) {
        document.getElementById("adminPanel").style.display = "block";
        adminClicks = 0;
    }
});

document.getElementById("startBtn").addEventListener("click", () => {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("mainGame").style.display = "flex";
    sounds.bgm.play().catch(() => {});
    initGrid();
    updateUI();
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
    updateUI();
    
    sounds.spin.play().catch(() => {});
    let count = 0;
    const imgs = document.querySelectorAll(".grid-item img");
    
    const timer = setInterval(() => {
        imgs.forEach(img => {
            let pool = (forceWin || balance < 5000) ? symbols.slice(3) : symbols;
            img.src = `assets/icons/${pool[Math.floor(Math.random() * pool.length)]}`;
        });
        count += 100;
        if (count >= 1000) { clearInterval(timer); checkWin(); }
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
        if (rates[src] && count >= 6) {
            winSrcs.push(src);
            winAmount += Math.floor(currentBet * (count * rates[src]));
        }
    }

    if (winSrcs.length > 0 || forceWin) {
        if (Math.random() > winDifficulty || forceWin) {
            let multVal = [2, 5, 10, 25, 50, 100][Math.floor(Math.random() * 6)];
            totalMultiplier += multVal;
            triggerDragonFire();
        }

        items.forEach(item => {
            let src = item.querySelector("img").src.split('/').pop();
            if (winSrcs.includes(src) || forceWin) item.querySelector("img").classList.add("symbol-explode");
        });

        sounds.win.play().catch(() => {});
        await new Promise(r => setTimeout(r, 500));

        let winFinal = (winAmount || currentBet * 2) * (totalMultiplier || 1);
        balance += winFinal;
        document.getElementById("winDisplay").innerText = rp.format(winFinal);

        if (winFinal >= currentBet * 10) {
            isPausedForBigWin = true;
            showBigWin(winFinal);
            while(isPausedForBigWin) await new Promise(r => setTimeout(r, 100));
        }

        for (let col = 0; col < 5; col++) {
            let colIndices = [col, col+5, col+10, col+15];
            let remain = [];
            colIndices.forEach(idx => {
                const img = items[idx].querySelector("img");
                if (!img.classList.contains("symbol-explode")) remain.push(img.src);
            });
            let needed = 4 - remain.length;
            let finalCol = [...Array(needed).fill(0).map(() => `assets/icons/${symbols[Math.floor(Math.random() * 5)]}`), ...remain];
            colIndices.forEach((idx, i) => {
                const img = items[idx].querySelector("img");
                img.src = finalCol[i];
                img.classList.remove("symbol-explode");
                if (i < needed) img.classList.add("symbol-falling");
            });
        }
        
        forceWin = false;
        updateUI();
        await new Promise(r => setTimeout(r, 600));
        return checkWin();
    } else {
        isSpinning = false;
        if (document.getElementById("autoCheck").checked) setTimeout(startSpin, 1000);
    }
}

function triggerDragonFire() {
    document.querySelector(".dragon-bg").classList.add("dragon-attack");
    document.getElementById("multiplierTracker").style.display = "block";
    document.getElementById("multValue").innerText = "x" + totalMultiplier;
    setTimeout(() => document.querySelector(".dragon-bg").classList.remove("dragon-attack"), 500);
}

function showBigWin(amt) {
    sounds.win.play().catch(() => {});
    document.getElementById("bigWinAmount").innerText = rp.format(amt);
    document.getElementById("bigWinOverlay").style.display = "flex";
}

function closeBigWin() {
    document.getElementById("bigWinOverlay").style.display = "none";
    isPausedForBigWin = false;
}

function updateUI() {
    document.getElementById("balance").innerText = rp.format(balance);
    document.getElementById("betDisplay").innerText = "BET: " + rp.format(currentBet);
}

function changeBet(v) { if(!isSpinning) { currentBet = Math.max(100, currentBet + v); updateUI(); } }
document.getElementById("spinBtn").addEventListener("click", startSpin);

// Admin Logic
function addBalance(amt) { balance += amt; updateUI(); alert("Saldo ditambahkan!"); }
function cheatMaxWin() { forceWin = true; closeAdmin(); }
function closeAdmin() { 
    winDifficulty = parseFloat(document.getElementById("rtpSetting").value);
    document.getElementById("adminPanel").style.display = "none"; 
}
