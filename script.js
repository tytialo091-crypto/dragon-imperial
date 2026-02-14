const symbols = [
    "assets/icons/cherry.png", "assets/icons/lemon.png", 
    "assets/icons/bell.png", "assets/icons/diamond.png", "assets/icons/clover.png"
];

const sounds = {
    bgm: new Audio('assets/sounds/bgm.mp3'),
    spin: new Audio('assets/sounds/spin.mp3'),
    win: new Audio('assets/sounds/win.mp3'),
    jackpot: new Audio('assets/sounds/jackpot.mp3')
};
sounds.bgm.loop = true;

let balance = 100000;
let currentBet = 100;
let jpVal = 5000000;
let isSpinning = false;

// Klik Awal
document.getElementById("startBtn").addEventListener("click", () => {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("mainGame").style.display = "flex";
    sounds.bgm.play().catch(e => {});
    initGrid();
});

function initGrid() {
    const grid = document.getElementById("grid");
    grid.innerHTML = "";
    for(let i=0; i<30; i++) {
        const div = document.createElement("div");
        div.className = "grid-item";
        div.innerHTML = `<img src="${symbols[Math.floor(Math.random()*symbols.length)]}">`;
        grid.appendChild(div);
    }
}

document.getElementById("spinBtn").addEventListener("click", startSpin);

function startSpin() {
    if(isSpinning || balance < currentBet) return;
    
    isSpinning = true;
    balance -= currentBet;
    jpVal += Math.floor(currentBet * 0.1);
    document.getElementById("winDisplay").innerText = "0";
    updateUI();
    
    sounds.spin.currentTime = 0;
    sounds.spin.play();

    let count = 0;
    const imgs = document.querySelectorAll(".grid-item img");
    const timer = setInterval(() => {
        imgs.forEach(img => img.src = symbols[Math.floor(Math.random()*symbols.length)]);
        count += 100;
        if(count >= 1200) {
            clearInterval(timer);
            sounds.spin.pause();
            checkWin();
        }
    }, 100);
}

function checkWin() {
    const items = document.querySelectorAll(".grid-item");
    const results = Array.from(document.querySelectorAll(".grid-item img")).map(img => img.src);
    const counts = {};
    results.forEach(src => counts[src] = (counts[src] || 0) + 1);

    let winSrcs = [];
    let totalWin = 0;

    for (const [src, count] of Object.entries(counts)) {
        if (count >= 8) { // Sistem Pay Anywhere
            winSrcs.push(src);
            totalWin += currentBet * (count * 0.5);
        }
    }

    if (winSrcs.length > 0) {
        // Mainkan suara win (petir)
        sounds.win.currentTime = 0;
        sounds.win.play();

        items.forEach(item => {
            if(winSrcs.includes(item.querySelector("img").src)) item.classList.add("win-glow");
        });

        setTimeout(() => {
            // Efek Jackpot jika menang besar
            if(totalWin >= currentBet * 10) {
                sounds.jackpot.play();
            }

            items.forEach(item => {
                if(item.classList.contains("win-glow")) {
                    item.classList.remove("win-glow");
                    item.querySelector("img").src = symbols[Math.floor(Math.random()*symbols.length)];
                }
            });
            balance += totalWin;
            document.getElementById("winDisplay").innerText = totalWin.toLocaleString();
            updateUI();
            checkWin(); // Tumble
        }, 1000);
    } else {
        isSpinning = false;
        if(document.getElementById("autoCheck").checked) setTimeout(startSpin, 1000);
    }
}

function updateUI() {
    document.getElementById("balance").innerText = balance.toLocaleString();
    document.getElementById("jpDisplay").innerText = jpVal.toLocaleString();
}

function changeBet(v) {
    if(!isSpinning) {
        currentBet = Math.max(10, currentBet + v);
        document.getElementById("betDisplay").innerText = "BET: " + currentBet;
    }
}

document.getElementById("muteBtn").addEventListener("click", (e) => {
    if(sounds.bgm.paused) { sounds.bgm.play(); e.target.innerText = "🔊"; }
    else { sounds.bgm.pause(); e.target.innerText = "🔇"; }
});
