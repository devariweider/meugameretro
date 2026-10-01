const c=document.querySelector('#game'),g=c.getContext('2d');g.imageSmoothingEnabled=false;
const W=800,H=600,C=32,OX=96,OY=70,COLS=19,ROWS=15;
let score=0,lives=3,state='play',last=performance.now(),power=0,mouth=0,fruitTimer=0;
// Labirinto compacto inspirado na estética do Pac-Man do Atari 2600.
const map=[
'###################',
'#........#........#',
'#.###.##.#.##.###.#',
'#.#.....#.#.....#.#',
'#.#.###.#.#.###.#.#',
'#.....#.....#.....#',
'###.#.#.###.#.#.###',
'....#...   ...#....',
'###.#.#.###.#.#.###',
'#.....#.....#.....#',
'#.#.###.#.#.###.#.#',
'#.#.....#.#.....#.#',
'#.###.##.#.##.###.#',
'#.................#',
'###################'];
const grid=map.map(r=>r.split('').map(ch=>ch!=='#'));
const dots=new Set();for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(map[y][x]==='.')dots.add(x+','+y);
// Uma única pílula de poder aparece no centro, como o usuário pediu.
let pill={x:9,y:7,active:true};
const pac={x:9,y:13,px:9,py:13,t:0,dir:{x:-1,y:0},next:{x:-1,y:0}};
const ghostHome=[[8,7],[9,7],[10,7],[9,8]],ghostCols=['#ff5b54','#f49ad1','#64dce8','#f3a64c'];
const ghosts=ghostHome.map((p,i)=>({x:p[0],y:p[1],px:p[0],py:p[1],t:0,dir:{x:i%2?1:-1,y:0},col:ghostCols[i],home:[...p],flash:i*.12}));
function open(x,y){if(y<0||y>=ROWS)return false;if(x<0||x>=COLS)return y===7;return !!grid[y][x]}
function wrap(o){if(o.x<0){o.x=COLS-1;o.px=o.x}if(o.x>=COLS){o.x=0;o.px=o.x}}
function k(x,y){return x+','+y}function resetPos(){Object.assign(pac,{x:9,y:13,px:9,py:13,t:0,dir:{x:-1,y:0},next:{x:-1,y:0}});ghosts.forEach((q,i)=>Object.assign(q,{x:q.home[0],y:q.home[1],px:q.home[0],py:q.home[1],t:0,dir:{x:i%2?1:-1,y:0}}))}
function lose(){lives--;power=0;if(lives<=0)state='over';else resetPos()}
addEventListener('keydown',e=>{const m={ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0},ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1}};if(m[e.code]){e.preventDefault();pac.next=m[e.code]}if(e.code==='Escape')location.href='index.html';if(e.code==='Enter'&&state==='over')location.reload()});
function options(q){return[{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}].filter(d=>open(q.x+d.x,q.y+d.y)&&!(d.x===-q.dir.x&&d.y===-q.dir.y))}
function ghostDir(q){let a=options(q);if(!a.length)return{x:-q.dir.x,y:-q.dir.y};if(power>0)return a[Math.floor(Math.random()*a.length)];a.sort((u,v)=>Math.abs(q.x+u.x-pac.x)+Math.abs(q.y+u.y-pac.y)-Math.abs(q.x+v.x-pac.x)-Math.abs(q.y+v.y-pac.y));return Math.random()<.58?a[0]:a[Math.floor(Math.random()*a.length)]}
function step(o,amt,isPac){o.t+=amt;if(o.t<1)return;o.t-=1;o.px=o.x;o.py=o.y;if(isPac&&open(o.x+pac.next.x,o.y+pac.next.y))o.dir=pac.next;if(!open(o.x+o.dir.x,o.y+o.dir.y)){if(isPac){o.t=0;return}else o.dir=ghostDir(o)}o.x+=o.dir.x;o.y+=o.dir.y;wrap(o);if(!isPac)o.dir=ghostDir(o)}
function update(dt){if(state!=='play')return;mouth+=dt*10;if(power>0)power=Math.max(0,power-dt);step(pac,dt*6.5,true);let s=k(pac.x,pac.y);if(dots.delete(s))score+=10;if(pill.active&&pac.x===pill.x&&pac.y===pill.y){pill.active=false;power=8;score+=50;fruitTimer=12;ghosts.forEach(q=>q.dir={x:-q.dir.x,y:-q.dir.y})}if(!pill.active){fruitTimer-=dt;if(fruitTimer<=0){pill.active=true;fruitTimer=12}}
ghosts.forEach(q=>step(q,dt*(power>0?3.6:4.9),false));for(const q of ghosts){if(q.x===pac.x&&q.y===pac.y&&q.t<.8&&pac.t<.8){if(power>0){score+=200;Object.assign(q,{x:q.home[0],y:q.home[1],px:q.home[0],py:q.home[1],t:0})}else{lose();return}}}if(dots.size===0){state='win';setTimeout(()=>location.href='index.html',2300)}}
function pos(o){let dx=o.x-o.px;if(Math.abs(dx)>2)dx=0;return{x:OX+(o.px+dx*o.t)*C+C/2,y:OY+(o.py+(o.y-o.py)*o.t)*C+C/2}}
function rect(x,y,w,h,col){g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),w,h)}function circ(x,y,r,col){g.fillStyle=col;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill()}
function drawPac(){let p=pos(pac),ang=Math.atan2(pac.dir.y,pac.dir.x),a=.18+Math.abs(Math.sin(mouth))*.45;g.fillStyle='#ffd52a';g.beginPath();g.moveTo(p.x,p.y);g.arc(p.x,p.y,12,ang+a,ang+Math.PI*2-a);g.closePath();g.fill()}
function drawGhost(q,i){let p=pos(q),fright=power>0,blink=power<2&&Math.floor(power*8)%2===0,col=fright?(blink?'#ddd':'#274fe0'):q.col;rect(p.x-10,p.y-8,20,16,col);rect(p.x-7,p.y-12,14,5,col);rect(p.x-10,p.y+7,5,5,col);rect(p.x-2,p.y+7,5,5,col);rect(p.x+6,p.y+7,5,5,col);if(!fright){rect(p.x-6,p.y-6,4,5,'#fff');rect(p.x+3,p.y-6,4,5,'#fff');rect(p.x-5+q.dir.x,p.y-5+q.dir.y,2,2,'#142c86');rect(p.x+4+q.dir.x,p.y-5+q.dir.y,2,2,'#142c86')}else{rect(p.x-5,p.y-4,3,3,'#fff');rect(p.x+3,p.y-4,3,3,'#fff')}}
function drawMaze(){g.fillStyle='#000';g.fillRect(0,0,W,H);for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(!grid[y][x]){let X=OX+x*C,Y=OY+y*C;rect(X+4,Y+4,C-8,C-8,'#3152d6')}for(const s of dots){let [x,y]=s.split(',').map(Number);rect(OX+x*C+14,OY+y*C+14,4,4,'#e7c7a4')}if(pill.active){let pulse=6+(Math.sin(mouth*.7)+1)*2;circ(OX+pill.x*C+C/2,OY+pill.y*C+C/2,pulse,'#f7e7cf')}}
function draw(){drawMaze();drawPac();ghosts.forEach(drawGhost);g.fillStyle='#fff';g.font='bold 19px monospace';g.fillText('1UP',40,27);g.fillText(String(score).padStart(6,'0'),40,51);g.fillText('PAC-MAN',350,36);g.fillText('VIDAS '+lives,650,36);for(let i=0;i<lives-1;i++){circ(55+i*28,570,9,'#ffd52a');rect(55+i*28,561,10,9,'#000')}if(power>0){g.fillStyle='#8ea6ff';g.fillText('POWER',355,575)}if(state!=='play'){rect(230,250,340,100,'#000');g.fillStyle='#fff';g.textAlign='center';g.font='bold 27px monospace';g.fillText(state==='win'?'FASE COMPLETA!':'GAME OVER',400,292);g.font='16px monospace';g.fillText(state==='win'?'VOLTANDO À SALA...':'ENTER PARA RECOMEÇAR',400,326);g.textAlign='left'}}
function loop(n){let dt=Math.min(.033,(n-last)/1000);last=n;update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);