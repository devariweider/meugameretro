const c=document.querySelector('#game'),g=c.getContext('2d');g.imageSmoothingEnabled=false;
const W=800,H=600,C=28,OX=92,OY=58,COLS=22,ROWS=18;
let score=0,lives=3,state='play',last=performance.now(),power=0,anim=0,pillTimer=0;
// Corredores reconstruídos para lembrar a referência Atari 2600: campo azul, paredes ocre, casa central.
const M=[
'######################',
'#....................#',
'#.###.##.####.##.###.#',
'#.....#......#.......#',
'###.#.#.####.#.#.#####',
'#...#..........#.....#',
'#.####.##.##.##.####.#',
'#......#....#........#',
'###.##.# HH #.##.#####',
'#......# HH #........#',
'###.##.#....#.##.#####',
'#......#.##.#........#',
'#.####.#.##.#.####.#.#',
'#...#..........#.....#',
'###.#.##.####.##.#.###',
'#.....#......#.......#',
'#....................#',
'######################'];
const grid=M.map(r=>[...r].map(ch=>ch!=='#'));
const dots=new Set();for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(M[y][x]==='.')dots.add(`${x},${y}`);
// Pílulas verdes laterais como na imagem de referência.
let pills=[{x:20,y:2,on:true},{x:20,y:15,on:true}];
const pac={x:10,y:14,px:10,py:14,t:0,dir:{x:-1,y:0},next:{x:-1,y:0}};
const homes=[[10,8],[11,8],[10,9],[11,9]],ghostColors=['#ef4b54','#e68bc7','#6adbe3','#ef9a45'];
const ghosts=homes.map((p,i)=>({x:p[0],y:p[1],px:p[0],py:p[1],t:0,dir:{x:i%2?1:-1,y:0},home:p.slice(),col:ghostColors[i]}));
function open(x,y){return x>=0&&x<COLS&&y>=0&&y<ROWS&&grid[y][x]}function key(x,y){return `${x},${y}`}
function resetPos(){Object.assign(pac,{x:10,y:14,px:10,py:14,t:0,dir:{x:-1,y:0},next:{x:-1,y:0}});ghosts.forEach((q,i)=>Object.assign(q,{x:q.home[0],y:q.home[1],px:q.home[0],py:q.home[1],t:0,dir:{x:i%2?1:-1,y:0}}))}
function lose(){lives--;power=0;if(lives<=0)state='over';else resetPos()}
addEventListener('keydown',e=>{const d={ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0},ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1}};if(d[e.code]){e.preventDefault();pac.next=d[e.code]}if(e.code==='Escape')location.href='index.html';if(e.code==='Enter'&&state==='over')location.reload()});
function choices(q){return[{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}].filter(d=>open(q.x+d.x,q.y+d.y)&&!(d.x===-q.dir.x&&d.y===-q.dir.y))}
function ghostDir(q){let a=choices(q);if(!a.length)return{x:-q.dir.x,y:-q.dir.y};if(power>0)return a[Math.floor(Math.random()*a.length)];a.sort((u,v)=>(Math.abs(q.x+u.x-pac.x)+Math.abs(q.y+u.y-pac.y))-(Math.abs(q.x+v.x-pac.x)+Math.abs(q.y+v.y-pac.y)));return Math.random()<.55?a[0]:a[Math.floor(Math.random()*a.length)]}
function step(o,amt,isPac=false){o.t+=amt;if(o.t<1)return;o.t-=1;o.px=o.x;o.py=o.y;if(isPac&&open(o.x+pac.next.x,o.y+pac.next.y))o.dir=pac.next;if(!open(o.x+o.dir.x,o.y+o.dir.y)){if(isPac){o.t=0;return}o.dir=ghostDir(o)}o.x+=o.dir.x;o.y+=o.dir.y;if(!isPac)o.dir=ghostDir(o)}
function update(dt){if(state!=='play')return;anim+=dt*10;if(power>0)power=Math.max(0,power-dt);step(pac,dt*6.2,true);if(dots.delete(key(pac.x,pac.y)))score+=10;for(const p of pills)if(p.on&&pac.x===p.x&&pac.y===p.y){p.on=false;power=8;score+=50;pillTimer=10;ghosts.forEach(q=>q.dir={x:-q.dir.x,y:-q.dir.y})}if(pills.every(p=>!p.on)){pillTimer-=dt;if(pillTimer<=0){pills.forEach(p=>p.on=true);pillTimer=10}}
ghosts.forEach(q=>step(q,dt*(power>0?3.5:4.7)));for(const q of ghosts)if(q.x===pac.x&&q.y===pac.y&&q.t<.75&&pac.t<.75){if(power>0){score+=200;Object.assign(q,{x:q.home[0],y:q.home[1],px:q.home[0],py:q.home[1],t:0})}else{lose();return}}if(dots.size===0){state='win';setTimeout(()=>location.href='index.html',2200)}}
function pos(o){return{x:OX+(o.px+(o.x-o.px)*o.t)*C+C/2,y:OY+(o.py+(o.y-o.py)*o.t)*C+C/2}}function rect(x,y,w,h,col){g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),w,h)}
function pacman(){const p=pos(pac),ang=Math.atan2(pac.dir.y,pac.dir.x),a=.15+Math.abs(Math.sin(anim))*.48;g.fillStyle='#f2cf35';g.beginPath();g.moveTo(p.x,p.y);g.arc(p.x,p.y,12,ang+a,ang+Math.PI*2-a);g.closePath();g.fill()}
function ghost(q){let p=pos(q),fr=power>0,blink=fr&&power<2&&Math.floor(power*8)%2===0,col=fr?(blink?'#eee':'#3d60d8'):q.col;rect(p.x-10,p.y-10,20,19,col);rect(p.x-6,p.y-14,12,5,col);rect(p.x-10,p.y+8,5,5,col);rect(p.x-2,p.y+8,5,5,col);rect(p.x+6,p.y+8,5,5,col);rect(p.x-6,p.y-6,4,5,'#fff');rect(p.x+3,p.y-6,4,5,'#fff');if(!fr){rect(p.x-5+q.dir.x,p.y-5+q.dir.y,2,2,'#16337d');rect(p.x+4+q.dir.x,p.y-5+q.dir.y,2,2,'#16337d')}}
function maze(){rect(0,0,W,H,'#2e4fc1');const wall='#b4a43d';for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(!grid[y][x]){let X=OX+x*C,Y=OY+y*C;rect(X+2,Y+2,C-4,C-4,wall)}// casa central destacada
rect(OX+9*C+3,OY+8*C+3,C*4-6,C*2-6,'#c0aa3d');rect(OX+9*C+10,OY+8*C+10,C*4-20,C*2-20,'#2e4fc1');
for(const s of dots){let [x,y]=s.split(',').map(Number);rect(OX+x*C+10,OY+y*C+12,8,3,'#c9b851')}for(const p of pills)if(p.on)rect(OX+p.x*C+8,OY+p.y*C+7,13,13,'#65ef76')}
function draw(){maze();ghosts.forEach(ghost);pacman();rect(0,0,W,48,'#111');g.fillStyle='#fff';g.font='bold 18px monospace';g.fillText('SCORE '+String(score).padStart(5,'0'),22,30);g.fillText('PAC-MAN 2600',318,30);g.fillText('VIDAS '+lives,665,30);if(power>0){g.fillStyle='#7df08a';g.fillText('POWER',365,585)}if(state!=='play'){rect(235,245,330,105,'#111');g.fillStyle='#fff';g.textAlign='center';g.font='bold 27px monospace';g.fillText(state==='win'?'FASE COMPLETA!':'GAME OVER',400,290);g.font='16px monospace';g.fillText(state==='win'?'VOLTANDO À SALA...':'ENTER PARA RECOMEÇAR',400,325);g.textAlign='left'}}
function loop(n){let dt=Math.min(.033,(n-last)/1000);last=n;update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);