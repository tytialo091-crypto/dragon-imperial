const symbols = ["tea_cup.png", "royal_fan.png", "gold_coin.png", "lantern_red.png", "jade_seal.png", "dragon_gold.png"];
const sounds = {
    bgm: new Audio('assets/sounds/bgm.mp3'),
    spin: new Audio('assets/sounds/spin.mp3'),
    win: new Audio('assets/sounds/win.mp3')
};
sounds.bgm.loop = true;

let balance = 100000, currentBet = 100, isSpinning = false, totalMultiplier = 0;

// Jackpot Berjalan
setInterval(() => {
    let jp = parseInt(document.getElementById("jpDisplay").innerText.replace(/\./g, ''));
    jp += Math.floor(Math.random() * 50);
    document.getElementById("jpDisplay").innerText = jp.toLocaleString();
}, 2000);

document.getElementById("startBtn").addEventListener("click", () => {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("mainGame").style.display = "flex";
    sounds.bgm.play().catch(() => {});
    initGrid();
});

function initGrid() {
    const grid = document.getElementById("grid");
    grid.innerHTML = "";
    for(let i=0; i<30; i++) {
        const div = document.createElement("div");
        div.className = "grid-item";
        div.innerHTML = `<img src="assets/icons/${symbols[0]}">`;
        grid.appendChild(div);
    }
}

async function startSpin() {
    if (isSpinning) return;
    if (balance < currentBet) return alert("Saldo Habis!");
    
    isSpinning = true;
    balance -= currentBet;
    totalMultiplier = 0;
    document.getElementById("multiplierTracker").style.display = "none";
    updateUI();
    
    sounds.spin.currentTime = 0;
    sounds.spin.play().catch(() => {});

    // Animasi Spin Awal
    let count = 0;
    const imgs = document.querySelectorAll(".grid-item img");
    const timer = setInterval(() => {
        imgs.forEach(img => img.src = `assets/icons/${symbols[Math.floor(Math.random() * 5)]}`);
        count += 100;
        if (count >= 1000) { clearInterval(timer); checkWin(); }
    }, 100);
}

async function checkWin() {
    const items = Array.from(document.querySelectorAll(".grid-item"));
    const results = items.map(item => item.querySelector("img").src.split('/').pop());
    const counts = {};
    results.forEach(src => counts[src] = (counts[src] || 0) + 1);

    const rates = { "jade_seal.png": 10, "lantern_red.png": 5, "gold_coin.png": 2, "royal_fan.png": 1, "tea_cup.png": 0.5 };
    let winAmount = 0, winSrcs = [];

    for (const [src, count] of Object.entries(counts)) {
        if (rates[src] && count >= 8) {
            winSrcs.push(src);
            winAmount += Math.floor(currentBet * (count * rates[src]));
        }
    }

    if (winSrcs.length > 0) {
        // Efek Multiplier Naga (Semburan Api)
        if (Math.random() > 0.6) {
            let mult = [2, 5, 8, 10, 20, 50][Math.floor(Math.random() * 6)];
            totalMultiplier += mult;
            triggerDragonFire();
            updateMultiplierTracker();
        }

        // Animasi Pecah
        items.forEach(item => {
            if (winSrcs.includes(item.querySelector("img").src.split('/').pop())) {
                item.querySelector("img").classList.add("symbol-explode");
            }
        });
        
        sounds.win.play().catch(() => {});
        await new Promise(r => setTimeout(r, 500));

        // Tumble (Simbol Jatuh)
        for (let col = 0; col < 6; col++) {
            let colIndices = [col, col+6, col+12, col+18, col+24];
            let remain = [];
            colIndices.forEach(idx => {
                const img = items[idx].querySelector("img");
                if (!img.classList.contains("symbol-explode")) remain.push(img.src);
            });
            let needed = 5 - remain.length;
            let finalCol = [...Array(needed).fill(0).map(() => `assets/icons/${symbols[Math.floor(Math.random() * 5)]}`), ...remain];
            colIndices.forEach((idx, i) => {
                const img = items[idx].querySelector("img");
                img.src = finalCol[i];
                img.classList.remove("symbol-explode");
                if (i < needed) img.classList.add("symbol-falling");
            });
        }

        let winFinal = winAmount * (totalMultiplier || 1);
        balance += winFinal;
        document.getElementById("winDisplay").innerText = winFinal.toLocaleString();
        if (winFinal >= currentBet * 10) showBigWin(winFinal);
        updateUI();

        await new Promise(r => setTimeout(r, 600));
        return checkWin(); // Combo!
    } else {
        isSpinning = false;
        if (document.getElementById("autoCheck").checked) setTimeout(startSpin, 1000);
    }
}

function triggerDragonFire() {
    const f = document.createElement("div"); f.className = "fire-flash"; document.body.appendChild(f);
    setTimeout(() => f.remove(), 300);
    const d = document.querySelector(".dragon-bg"); d.classList.add("dragon-attack");
    setTimeout(() => d.classList.remove("dragon-attack"), 500);
}

function updateMultiplierTracker() {
    const t = document.getElementById("multiplierTracker");
    t.style.display = "flex";
    document.getElementById("multValue").innerText = "x" + totalMultiplier;
}

function updateUI() {
    document.getElementById("balance").innerText = balance.toLocaleString();
    document.getElementById("betDisplay").innerText = "BET: " + currentBet;
    document.getElementById("buyCost").innerText = (currentBet * 100).toLocaleString();
}

function showBigWin(amt) {
    document.getElementById("bigWinAmount").innerText = amt.toLocaleString();
    document.getElementById("bigWinOverlay").style.display = "flex";
    document.getElementById("coinCanvas").style.display = "block";
    if (navigator.vibrate) navigator.vibrate([100, 50, 300]);
}

function closeBigWin() {
    document.getElementById("bigWinOverlay").style.display = "none";
    document.getElementById("coinCanvas").style.display = "none";
}

document.getElementById("spinBtn").addEventListener("click", startSpin);
function changeBet(v) { if(!isSpinning) { currentBet = Math.max(10, currentBet + v); updateUI(); } }
