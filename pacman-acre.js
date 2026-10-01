const c=document.querySelector('#game'),g=c.getContext('2d');g.imageSmoothingEnabled=false;
const W=800,H=600,C=30,OX=70,OY=25,COLS=22,ROWS=18;let score=0,lives=3,state='play',last=performance.now(),power=0,anim=0,pillClock=0,ghostFrame=0;
const M=[
'######################',
'#....................#',
'#.###.##.####.##.###.#',
'#.....#......#.......#',
'###.#.#.####.#.#.#####',
'#...#..........#.....#',
'#.####.##.##.##.####.#',
'#......#....#........#',
'###.##.#....#.##.#####',
'#......#.HH.#........#',
'###.##.#.HH.#.##.#####',
'#......#....#........#',
'#.####.#.##.#.####.#.#',
'#...#..........#.....#',
'###.#.##.####.##.#.###',
'#.....#......#.......#',
'#....................#',
'######################'];
const grid=M.map(r=>[...r].map(ch=>ch!=='#'));const dots=new Set();for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(M[y][x]==='.')dots.add(`${x},${y}`);
let pills=[{x:1,y:2,on:true},{x:20,y:2,on:true},{x:1,y:15,on:true},{x:20,y:15,on:true}];
const pac={x:10,y:14,px:10,py:14,t:0,dir:{x:-1,y:0},next:{x:-1,y:0}};const homes=[[9,9],[10,9],[11,9],[10,10]],ghostColors=['#ef7b86','#f1a0cf','#86d7e4','#e8a26b'];const ghosts=homes.map((p,i)=>({x:p[0],y:p[1],px:p[0],py:p[1],t:0,dir:{x:i%2?1:-1,y:0},home:p.slice(),col:ghostColors[i]}));
function open(x,y){return x>=0&&x<COLS&&y>=0&&y<ROWS&&grid[y][x]}function key(x,y){return `${x},${y}`}function resetPos(){Object.assign(pac,{x:10,y:14,px:10,py:14,t:0,dir:{x:-1,y:0},next:{x:-1,y:0}});ghosts.forEach((q,i)=>Object.assign(q,{x:q.home[0],y:q.home[1],px:q.home[0],py:q.home[1],t:0,dir:{x:i%2?1:-1,y:0}}))}function lose(){lives--;power=0;if(lives<=0)state='over';else resetPos()}
addEventListener('keydown',e=>{const d={ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0},ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1}};if(d[e.code]){e.preventDefault();pac.next=d[e.code]}if(e.code==='Escape')location.href='index.html';if(e.code==='Enter'&&state==='over')location.reload()});
function choices(q){return[{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}].filter(d=>open(q.x+d.x,q.y+d.y)&&!(d.x===-q.dir.x&&d.y===-q.dir.y))}function ghostDir(q){let a=choices(q);if(!a.length)return{x:-q.dir.x,y:-q.dir.y};if(power>0)return a[Math.floor(Math.random()*a.length)];a.sort((u,v)=>(Math.abs(q.x+u.x-pac.x)+Math.abs(q.y+u.y-pac.y))-(Math.abs(q.x+v.x-pac.x)+Math.abs(q.y+v.y-pac.y)));return Math.random()<.48?a[0]:a[Math.floor(Math.random()*a.length)]}
function step(o,amt,isPac=false){o.t+=amt;if(o.t<1)return;o.t-=1;o.px=o.x;o.py=o.y;if(isPac&&open(o.x+pac.next.x,o.y+pac.next.y))o.dir=pac.next;if(!open(o.x+o.dir.x,o.y+o.dir.y)){if(isPac){o.t=0;return}o.dir=ghostDir(o)}o.x+=o.dir.x;o.y+=o.dir.y;if(!isPac)o.dir=ghostDir(o)}
function update(dt){if(state!=='play')return;anim+=dt*11;ghostFrame=(ghostFrame+1)%4;if(power>0)power=Math.max(0,power-dt);step(pac,dt*6.0,true);if(dots.delete(key(pac.x,pac.y)))score+=1;for(const p of pills)if(p.on&&pac.x===p.x&&pac.y===p.y){p.on=false;power=7.5;score+=5;pillClock=8;ghosts.forEach(q=>q.dir={x:-q.dir.x,y:-q.dir.y})}if(pills.every(p=>!p.on)){pillClock-=dt;if(pillClock<=0)pills.forEach(p=>p.on=true)}ghosts.forEach(q=>step(q,dt*(power>0?3.2:4.4)));for(const q of ghosts)if(q.x===pac.x&&q.y===pac.y&&q.t<.78&&pac.t<.78){if(power>0){score+=20;Object.assign(q,{x:q.home[0],y:q.home[1],px:q.home[0],py:q.home[1],t:0})}else{lose();return}}if(dots.size===0){state='win';setTimeout(()=>location.href='index.html',2200)}}
function pos(o){return{x:OX+(o.px+(o.x-o.px)*o.t)*C+C/2,y:OY+(o.py+(o.y-o.py)*o.t)*C+C/2}}function rect(x,y,w,h,col){g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),w,h)}
function pacman(){let p=pos(pac),ang=Math.atan2(pac.dir.y,pac.dir.x),a=.08+Math.abs(Math.sin(anim))*.5;g.fillStyle='#f2d43c';g.beginPath();g.moveTo(p.x,p.y);g.arc(p.x,p.y,13,ang+a,ang+Math.PI*2-a);g.closePath();g.fill();rect(p.x-3,p.y-13,5,4,'#f2d43c')}
function ghost(q,i){let p=pos(q),fr=power>0,blink=fr&&power<1.8&&Math.floor(power*8)%2===0,col=fr?(blink?'#ddd':'#7189dc'):q.col;rect(p.x-11,p.y-10,22,19,col);rect(p.x-7,p.y-14,14,5,col);rect(p.x-11,p.y+8,5,5,col);rect(p.x-2,p.y+8,5,5,col);rect(p.x+7,p.y+8,5,5,col);rect(p.x-6,p.y-6,4,5,'#fff');rect(p.x+3,p.y-6,4,5,'#fff');if(!fr){rect(p.x-5+q.dir.x,p.y-5+q.dir.y,2,2,'#33459a');rect(p.x+4+q.dir.x,p.y-5+q.dir.y,2,2,'#33459a')}}
function maze(){rect(0,0,W,H,'#000');rect(OX-5,OY-5,C*COLS+10,C*ROWS+10,'#ad9a3f');rect(OX,OY,C*COLS,C*ROWS,'#3446b7');const wall='#ad9a3f';for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(!grid[y][x])rect(OX+x*C+3,OY+y*C+3,C-6,C-6,wall);rect(OX+9*C+3,OY+9*C+3,C*4-6,C*2-6,wall);rect(OX+9*C+10,OY+9*C+10,C*4-20,C*2-20,'#3446b7');for(const s of dots){let [x,y]=s.split(',').map(Number);rect(OX+x*C+10,OY+y*C+13,10,3,'#c9b450')}for(const p of pills)if(p.on){let col=Math.floor(anim*2)%2?'#6ff27a':'#d7a3e4';rect(OX+p.x*C+8,OY+p.y*C+7,14,15,col)}}
function draw(){maze();/* o Atari alternava os fantasmas rapidamente; este leve flicker aproxima o vídeo sem esconder a jogabilidade */ghosts.forEach((q,i)=>{if(i===ghostFrame||power>0||((ghostFrame+i)&1)===0)ghost(q,i)});pacman();rect(20,570,760,25,'#3d7f43');g.fillStyle='#050505';g.textAlign='center';g.font='bold 24px monospace';g.fillText(String(score),400,591);g.textAlign='left';for(let i=0;i<Math.max(0,lives-1);i++)rect(58+i*28,598-16,16,12,'#67d579');if(state!=='play'){rect(250,250,300,92,'#111');g.fillStyle='#fff';g.textAlign='center';g.font='bold 25px monospace';g.fillText(state==='win'?'FASE COMPLETA!':'GAME OVER',400,288);g.font='15px monospace';g.fillText(state==='win'?'VOLTANDO...':'ENTER PARA RECOMEÇAR',400,321);g.textAlign='left'}}function loop(n){let dt=Math.min(.033,(n-last)/1000);last=n;update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);