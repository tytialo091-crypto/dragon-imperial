/* MENU AWAL ENTER */
const menu=document.getElementById("menu");
const game=document.getElementById("game");
const enterBtn=document.getElementById("enterGame");

enterBtn.addEventListener("click",()=>{
  menu.style.display="none";
  game.style.display="block";
  init();    // start particles
  animate(); // start animation
});

/* CANVAS PARTICLES */
const canvas=document.getElementById("particles");
const ctx=canvas.getContext("2d");
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;
let particles=[];
class Particle{
constructor(){this.x=Math.random()*canvas.width;this.y=Math.random()*canvas.height;this.size=Math.random()*2+1;this.speed=Math.random()*1.5+0.5;this.opacity=Math.random()*0.6+0.3;}
update(){this.y+=this.speed;if(this.y>canvas.height){this.y=0;this.x=Math.random()*canvas.width;}}
draw(){ctx.fillStyle="rgba(255,215,0,"+this.opacity+")";ctx.beginPath();ctx.arc(this.x,this.y,this.size,0,Math.PI*2);ctx.fill();}
}
function init(){particles=[];for(let i=0;i<100;i++){particles.push(new Particle());}}
function animate(){ctx.clearRect(0,0,canvas.width,canvas.height);particles.forEach(p=>{p.update();p.draw();});requestAnimationFrame(animate);}

/* PARALLAX LIGHT */
document.addEventListener("mousemove",e=>{
const bg=document.querySelector(".parallax-bg");
let x=(e.clientX/window.innerWidth-0.5)*15;
let y=(e.clientY/window.innerHeight-0.5)*15;
bg.style.transform=`translate(${x}px,${y}px)`;
});
window.addEventListener("resize",()=>{canvas.width=window.innerWidth;canvas.height=window.innerHeight;init();});

/* SLOT ENGINE */
const reels=[...document.querySelectorAll(".reel")];
const symbols=[
"assets/icons/cherry.png",
"assets/icons/lemon.png",
"assets/icons/bell.png",
"assets/icons/diamond.png",
"assets/icons/clover.png"
];
let balance=parseInt(document.getElementById("balance").innerText);
let autoSpin=false;

document.getElementById("autoSpin").addEventListener("change",(e)=>{autoSpin=e.target.checked;if(autoSpin){spinReels();}});
document.getElementById("spin").addEventListener("click",spinReels);

function spinReels(){
if(balance<=0){alert("Balance habis!");return;}
balance--;
document.getElementById("balance").innerText=balance;

reels.forEach((reel)=>{
reel.innerHTML="";
for(let i=0;i<3;i++){
let img=document.createElement("img");
img.src=symbols[Math.floor(Math.random()*symbols.length)];
img.style.width="40px";
img.style.margin="5px 0";
reel.appendChild(img);
}
});

if(autoSpin){setTimeout(spinReels,1500);}
}