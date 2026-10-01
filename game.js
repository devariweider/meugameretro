const canvas=document.querySelector('#scene'),ctx=canvas.getContext('2d');
const start=document.querySelector('#start'),hud=document.querySelector('#hud'),coming=document.querySelector('#coming'),title=document.querySelector('#game-title'),back=document.querySelector('#back');
const buttons=[...document.querySelectorAll('.games button')];
const names={river:'RIVER RAID',frost:'FROSTBITE',frog:'FROGGER',acre:'PAC-MAN ACRE'};
let powered=false,menu=false,selected=0,t=0;
function resize(){const d=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*d;canvas.height=innerHeight*d;ctx.setTransform(d,0,0,d,0,0)}addEventListener('resize',resize);resize();
function rr(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}
function room(){const w=innerWidth,h=innerHeight,cx=w/2;t+=.016;
 const glow=ctx.createRadialGradient(cx,h*.34,20,cx,h*.34,h*.72);glow.addColorStop(0,powered?'#5c6d66':'#493725');glow.addColorStop(.45,'#241a17');glow.addColorStop(1,'#070608');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
 // parede e piso
 ctx.fillStyle='#261b18';ctx.fillRect(0,h*.68,w,h*.32);ctx.strokeStyle='#5b4030';ctx.lineWidth=2;for(let y=h*.7;y<h;y+=42){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}for(let x=0;x<w;x+=90){ctx.beginPath();ctx.moveTo(cx+(x-cx)*.15,h*.68);ctx.lineTo(x,h);ctx.stroke()}
 // posters
 [['RIVER',.12,'#4da9cf'],['FROST',.27,'#d9edf2'],['FROG',.73,'#77b64b'],['ACRE',.88,'#e5c34a']].forEach(([s,p,c])=>{ctx.fillStyle='#100e0f';ctx.fillRect(w*p-48,h*.12,96,128);ctx.strokeStyle=c;ctx.strokeRect(w*p-44,h*.12+4,88,120);ctx.fillStyle=c;ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.fillText(s,w*p,h*.2)});
 // TV móvel
 ctx.fillStyle='#3a2920';rr(cx-210,h*.22,420,300,18);ctx.fillStyle='#17191b';rr(cx-174,h*.255,300,205,24);ctx.fillStyle=powered?'#152e36':'#080a0b';rr(cx-160,h*.27,272,176,28);
 if(powered){ctx.save();ctx.beginPath();ctx.roundRect(cx-160,h*.27,272,176,28);ctx.clip();ctx.fillStyle='#0a1117';ctx.fillRect(cx-160,h*.27,272,176);for(let i=0;i<12;i++){ctx.fillStyle=`rgba(80,210,255,${.025+Math.random()*.035})`;ctx.fillRect(cx-160,h*.27+Math.random()*176,272,1)}ctx.fillStyle='#f1c84d';ctx.font='bold 21px monospace';ctx.textAlign='center';ctx.fillText(menu?'ESCOLHA UMA FITA':'MEU GAME RETRÔ',cx-24,h*.35);ctx.font='12px monospace';ctx.fillStyle='#72d6ed';ctx.fillText('ACRE • MEMÓRIAS EM 8 BITS',cx-24,h*.39);ctx.restore()}
 ctx.fillStyle='#242326';rr(cx+145,h*.28,38,38,19);rr(cx+145,h*.35,38,38,19);ctx.fillStyle='#15100d';rr(cx-235,h*.61,470,78,8);
 // sofá
 ctx.fillStyle='#4a2d24';rr(cx-330,h*.67,660,185,35);ctx.fillStyle='#6a4030';rr(cx-285,h*.62,570,120,35);ctx.strokeStyle='#2e1d19';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(cx,h*.63);ctx.lineTo(cx,h*.78);ctx.stroke();
 // jovem de costas
 ctx.fillStyle='#171313';ctx.beginPath();ctx.arc(cx,h*.64,42,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2b5268';rr(cx-70,h*.69,140,125,34);ctx.fillStyle='#1a3546';ctx.beginPath();ctx.moveTo(cx-70,h*.72);ctx.lineTo(cx-130,h*.84);ctx.lineTo(cx-92,h*.86);ctx.lineTo(cx-30,h*.75);ctx.fill();ctx.beginPath();ctx.moveTo(cx+70,h*.72);ctx.lineTo(cx+130,h*.84);ctx.lineTo(cx+92,h*.86);ctx.lineTo(cx+30,h*.75);ctx.fill();
 // controle
 ctx.fillStyle='#17191c';rr(cx-48,h*.82,96,38,10);ctx.fillStyle='#ddd';ctx.fillRect(cx-29,h*.835,22,5);ctx.fillRect(cx-20,h*.826,5,22);ctx.fillStyle='#d84b4b';ctx.beginPath();ctx.arc(cx+25,h*.836,5,0,7);ctx.fill();ctx.beginPath();ctx.arc(cx+37,h*.848,5,0,7);ctx.fill();
 // vinheta
 const v=ctx.createRadialGradient(cx,h/2,h*.25,cx,h/2,h*.85);v.addColorStop(.55,'transparent');v.addColorStop(1,'rgba(0,0,0,.72)');ctx.fillStyle=v;ctx.fillRect(0,0,w,h);requestAnimationFrame(room)}room();
function setSelection(i){selected=(i+buttons.length)%buttons.length;buttons.forEach((b,n)=>b.classList.toggle('active',n===selected));buttons[selected].focus()}
function openMenu(){powered=true;menu=true;start.classList.add('hidden');hud.classList.remove('hidden');setSelection(0)}
function launch(game){menu=false;hud.classList.add('hidden');coming.classList.remove('hidden');title.textContent=names[game]}
start.addEventListener('click',openMenu);buttons.forEach((b,i)=>b.addEventListener('click',()=>{selected=i;launch(b.dataset.game)}));back.addEventListener('click',()=>{coming.classList.add('hidden');hud.classList.remove('hidden');menu=true;setSelection(selected)});
addEventListener('keydown',e=>{if(!powered&&(e.key==='Enter'||e.key===' ')){openMenu();return}if(menu){if(e.key==='ArrowDown'){e.preventDefault();setSelection(selected+1)}if(e.key==='ArrowUp'){e.preventDefault();setSelection(selected-1)}if(e.key==='Enter')launch(buttons[selected].dataset.game)}else if(powered&&e.key==='Escape'&&!coming.classList.contains('hidden'))back.click()});