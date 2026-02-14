/* PARTICLES */
const canvas=document.getElementById("particles");
const ctx=canvas.getContext("2d");

canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

let particles=[];

class Particle{
constructor(){
this.x=Math.random()*canvas.width;
this.y=Math.random()*canvas.height;
this.size=Math.random()*3+1;
this.speed=Math.random()*2+1;
this.opacity=Math.random();
}
update(){
this.y+=this.speed;
if(this.y>canvas.height){
this.y=0;
this.x=Math.random()*canvas.width;
}
}
draw(){
ctx.fillStyle="rgba(255,215,0,"+this.opacity+")";
ctx.beginPath();
ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
ctx.fill();
}
}

function init(){
particles=[];
for(let i=0;i<150;i++){
particles.push(new Particle());
}
}

function animate(){
ctx.clearRect(0,0,canvas.width,canvas.height);
particles.forEach(p=>{
p.update();
p.draw();
});
requestAnimationFrame(animate);
}

init();
animate();

/* PARALLAX */
document.addEventListener("mousemove",e=>{
const bg=document.querySelector(".parallax-bg");
let x=(e.clientX/window.innerWidth-0.5)*30;
let y=(e.clientY/window.innerHeight-0.5)*30;
bg.style.transform=`translate(${x}px,${y}px)`;
});

/* SOUND AUTO ON CLICK */
document.body.addEventListener("click",()=>{
document.getElementById("bgSound").play();
},{once:true});

window.addEventListener("resize",()=>{
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;
init();
});
