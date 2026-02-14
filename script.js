const symbols = ["tea_cup.png", "royal_fan.png", "gold_coin.png", "lantern_red.png", "jade_seal.png", "dragon_gold.png", "orb_blue.png", "orb_red.png"];
const sounds = { bgm: new Audio('assets/sounds/bgm.mp3'), spin: new Audio('assets/sounds/spin.mp3'), win: new Audio('assets/sounds/win.mp3'), jackpot: new Audio('assets/sounds/jackpot.mp3') };
sounds.bgm.loop = true;

let balance = 100000, currentBet = 100, isSpinning = false, freeSpins = 0, totalMultiplier = 0;

document.getElementById("startBtn").addEventListener("click", () => {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("mainGame").style.display = "flex";
    sounds.bgm.play().catch(() => {});
    initGrid();
});

function getRandomSymbol() {
    const weights = ["tea_cup.png", "tea_cup.png", "royal_fan.png", "royal_fan.png", "gold_coin.png", "lantern_red.png", "jade_seal.png", "dragon_gold.png", "orb_blue.png"];
    return weights[Math.floor(Math.random() * weights.length)];
}

function initGrid() {
    const grid = document.getElementById("grid");
    grid.innerHTML = "";
    for(let i=0; i<30; i++) {
        const div = document.createElement("div");
        div.className = "grid-item";
        div.innerHTML = `<img src="assets/icons/${getRandomSymbol()}">`;
        grid.appendChild(div);
    }
}

async function startSpin() {
    if(isSpinning) return;
    if(freeSpins <= 0) {
        if(balance < currentBet) return alert("Saldo Habis!");
        balance -= currentBet;
    } else {
        freeSpins--;
    }
    
    isSpinning = true;
    updateUI();
    sounds.spin.play().catch(() => {});

    let count = 0;
    const imgs = document.querySelectorAll(".grid-item img");
    const timer = setInterval(() => {
        imgs.forEach(img => img.src = "assets/icons/" + getRandomSymbol());
        count += 100;
        if(count >= 1000) { clearInterval(timer); checkWin(); }
    }, 100);
}

async function checkWin() {
    const items = Array.from(document.querySelectorAll(".grid-item"));
    const results = items.map(item => item.querySelector("img").src.split('/').pop());
    const counts = {};
    results.forEach(src => counts[src] = (counts[src] || 0) + 1);

    let winSrcs = [], currentWin = 0;
    const table = { "jade_seal.png": 10, "lantern_red.png": 5, "gold_coin.png": 2, "royal_fan.png": 1, "tea_cup.png": 0.5 };

    for (const [src, count] of Object.entries(counts)) {
        if (table[src] && count >= 8) {
            winSrcs.push(src);
            currentWin += Math.floor(currentBet * (count * table[src]));
        }
    }

    if (winSrcs.length > 0) {
        items.forEach(item => {
            const src = item.querySelector("img").src.split('/').pop();
            if(winSrcs.includes(src)) item.classList.add("win-glow");
            if(src.includes("orb")) {
                totalMultiplier += src.includes("red") ? 25 : 5;
                item.classList.add("multiplier-orb");
            }
        });

        await new Promise(r => setTimeout(r, 1000));
        
        // Logika Tumble: Sederhananya acak ulang yang menang
        items.forEach(item => {
            if(item.classList.contains("win-glow")) {
                item.classList.remove("win-glow");
                item.querySelector("img").src = "assets/icons/" + getRandomSymbol();
            }
        });

        let finalWin = currentWin * (totalMultiplier || 1);
        balance += finalWin;
        document.getElementById("winDisplay").innerText = finalWin.toLocaleString();
        updateUI();
        checkWin(); 
    } else {
        if(counts["dragon_gold.png"] >= 3) {
            freeSpins += 10;
            document.querySelector(".mobile-wrapper").classList.add("shake");
            setTimeout(() => document.querySelector(".mobile-wrapper").classList.remove("shake"), 1000);
        }
        totalMultiplier = 0;
        isSpinning = false;
        if(document.getElementById("autoCheck").checked || freeSpins > 0) setTimeout(startSpin, 1000);
    }
}

function updateUI() {
    document.getElementById("balance").innerText = balance.toLocaleString();
    document.getElementById("betDisplay").innerText = freeSpins > 0 ? `FREE: ${freeSpins}` : `BET: ${currentBet}`;
    document.getElementById("buyCost").innerText = (currentBet * 100).toLocaleString();
}

document.getElementById("buySpinBtn").addEventListener("click", () => {
    let cost = currentBet * 100;
    if(balance >= cost && !isSpinning) {
        balance -= cost;
        freeSpins = 10;
        startSpin();
    }
});

document.getElementById("spinBtn").addEventListener("click", startSpin);
function changeBet(v) { if(!isSpinning) { currentBet = Math.max(10, currentBet + v); updateUI(); } }
