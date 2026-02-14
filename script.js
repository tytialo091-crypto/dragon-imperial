const symbols = ["tea_cup.png", "royal_fan.png", "gold_coin.png", "lantern_red.png", "jade_seal.png", "dragon_gold.png", "orb_blue.png", "orb_red.png"];
const sounds = {
    bgm: new Audio('assets/sounds/bgm.mp3'),
    spin: new Audio('assets/sounds/spin.mp3'),
    win: new Audio('assets/sounds/win.mp3')
};
sounds.bgm.loop = true;

let balance = 100000, currentBet = 100, isSpinning = false, freeSpins = 0, totalMultiplier = 0;

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
    if (freeSpins <= 0) {
        if (balance < currentBet) return alert("Saldo Habis!");
        balance -= currentBet;
    } else {
        freeSpins--;
    }

    isSpinning = true;
    updateUI();
    sounds.spin.currentTime = 0;
    sounds.spin.play().catch(() => {});

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
        // Multiplier Check
        items.forEach(item => {
            const src = item.querySelector("img").src.split('/').pop();
            if (src.includes("orb")) {
                totalMultiplier += src.includes("red") ? 25 : 5;
            }
            if (winSrcs.includes(src)) item.classList.add("win-glow");
        });

        sounds.win.play().catch(() => {});
        await new Promise(r => setTimeout(r, 1000));
        
        // Tumble Action
        items.forEach(item => {
            if (item.classList.contains("win-glow")) {
                item.classList.remove("win-glow");
                item.querySelector("img").src = `assets/icons/${symbols[Math.floor(Math.random() * 5)]}`;
            }
        });

        balance += (winAmount * (totalMultiplier || 1));
        document.getElementById("winDisplay").innerText = (winAmount * (totalMultiplier || 1)).toLocaleString();
        updateUI();
        checkWin(); 
    } else {
        if (counts["dragon_gold.png"] >= 3) {
            freeSpins += 10;
            alert("10 FREE SPINS!");
        }
        totalMultiplier = 0;
        isSpinning = false;
        if (document.getElementById("autoCheck").checked || freeSpins > 0) setTimeout(startSpin, 1000);
    }
}

function updateUI() {
    document.getElementById("balance").innerText = balance.toLocaleString();
    document.getElementById("betDisplay").innerText = freeSpins > 0 ? `FREE: ${freeSpins}` : `BET: ${currentBet}`;
    document.getElementById("buyCost").innerText = (currentBet * 100).toLocaleString();
}

document.getElementById("spinBtn").addEventListener("click", startSpin);
document.getElementById("muteBtn").addEventListener("click", (e) => {
    if(sounds.bgm.paused) { sounds.bgm.play(); e.target.innerText = "🔊"; }
    else { sounds.bgm.pause(); e.target.innerText = "🔇"; }
});
document.getElementById("buySpinBtn").addEventListener("click", () => {
    let cost = currentBet * 100;
    if(balance >= cost && !isSpinning) { balance -= cost; freeSpins = 10; startSpin(); }
});
function changeBet(v) { if(!isSpinning) { currentBet = Math.max(10, currentBet + v); updateUI(); } }
function closeInfo() { document.getElementById("infoOverlay").style.display = "none"; }
document.getElementById("infoBtn").addEventListener("click", () => document.getElementById("infoOverlay").style.display = "flex");
