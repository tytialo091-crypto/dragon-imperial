const symbols = [
    "assets/icons/cherry.png", "assets/icons/lemon.png", 
    "assets/icons/bell.png", "assets/icons/diamond.png", "assets/icons/clover.png"
];

// Pastikan file ini ada di folder assets/sounds/
const sounds = {
    bgm: new Audio('assets/sounds/bgm.mp3'),
    spin: new Audio('assets/sounds/spin.mp3'),
    win: new Audio('assets/sounds/win.mp3'),
    jackpot: new Audio('assets/sounds/jackpot.mp3')
};
sounds.bgm.loop = true;

let balance = 100000;
let currentBet = 100;
let isSpinning = false;

document.getElementById("startBtn").addEventListener("click", () => {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("mainGame").style.display = "flex";
    // Play BGM setelah klik
    sounds.bgm.play().catch(e => console.log("Audio diblokir browser"));
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

function startSpin() {
    if(isSpinning || balance < currentBet) return;
    isSpinning = true;
    balance -= currentBet;
    document.getElementById("winDisplay").innerText = "0";
    updateUI();
    
    sounds.spin.currentTime = 0;
    sounds.spin.play().catch(() => {});

    let count = 0;
    const imgs = document.querySelectorAll(".grid-item img");
    const timer = setInterval(() => {
        imgs.forEach(img => img.src = symbols[Math.floor(Math.random()*symbols.length)]);
        count += 100;
        if(count >= 1000) {
            clearInterval(timer);
            sounds.spin.pause();
            checkWin();
        }
    }, 100);
}

function checkWin() {
    const items = document.querySelectorAll(".grid-item");
    const dragon = document.querySelector(".dragon-bg");
    const results = Array.from(document.querySelectorAll(".grid-item img")).map(img => img.src);
    const counts = {};
    results.forEach(src => counts[src] = (counts[src] || 0) + 1);

    let winSrcs = [];
    let winAmount = 0;

    for (const [src, count] of Object.entries(counts)) {
        if (count >= 8) {
            winSrcs.push(src);
            winAmount += currentBet * (count * 0.5);
        }
    }

    if (winSrcs.length > 0) {
        sounds.win.currentTime = 0;
        sounds.win.play().catch(() => {});
        dragon.classList.add("power-up");

        items.forEach(item => {
            if(winSrcs.includes(item.querySelector("img").src)) item.classList.add("win-glow");
        });

        setTimeout(() => {
            if(winAmount >= currentBet * 10) showJackpot(winAmount);
            items.forEach(item => {
                if(item.classList.contains("win-glow")) {
                    item.classList.remove("win-glow");
                    item.querySelector("img").src = symbols[Math.floor(Math.random()*symbols.length)];
                }
            });
            dragon.classList.remove("power-up");
            balance += winAmount;
            document.getElementById("winDisplay").innerText = winAmount.toLocaleString();
            updateUI();
            checkWin(); 
        }, 1200);
    } else {
        isSpinning = false;
        if(document.getElementById("autoCheck").checked) setTimeout(startSpin, 1000);
    }
}

function showJackpot(amt) {
    sounds.jackpot.play().catch(() => {});
    document.getElementById("jpAmount").innerText = amt.toLocaleString();
    document.getElementById("jpOverlay").style.display = "flex";
}

function closeJP() { document.getElementById("jpOverlay").style.display = "none"; }
function updateUI() {
    document.getElementById("balance").innerText = balance.toLocaleString();
}
function changeBet(v) {
    if(!isSpinning) {
        currentBet = Math.max(10, currentBet + v);
        document.getElementById("betDisplay").innerText = "BET: " + currentBet;
    }
}

// Tombol BGM
document.getElementById("muteBtn").addEventListener("click", (e) => {
    if(sounds.bgm.paused) {
        sounds.bgm.play().catch(() => alert("Klik layar dulu!"));
        e.target.innerText = "🔊";
    } else {
        sounds.bgm.pause();
        e.target.innerText = "🔇";
    }
});

document.getElementById("spinBtn").addEventListener("click", startSpin);
