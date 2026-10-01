const c=document.querySelector('#game'),g=c.getContext('2d');g.imageSmoothingEnabled=false;
const W=960,H=540,T=30,COLS=30,ROWS=16,OX=30,OY=30,STARTING_LIVES=3,POWER_DURATION=7,PLAYER_SPEED=6.3,GHOST_SPEED=4.1;
const TEMPLATE=[
'##############..##############',
'#............#..#............#',
'#.####.#####.#..#.#####.####.#',
'#.#..........#..#..........#.#',
'#.#.####.###......###.####.#.#',
'#......#....##..##....#......#',
'######.#.##........##.#.######',
'.......#....#....#....#.......',
'######.#.##.#....#.##.#.######',
'#......#....######....#......P#',
'#.####.####........####.####..#',
'#.#........##....##........#.P#',
'#.#.######.#......#.######.#..#',
'#............#..#............#',
'#............#S.#............#',
'##############..##############'];
let grid,dots,powers,score=0,high=+(localStorage.getItem('retroPacHigh')||0),lives=STARTING_LIVES,level=1,power=0,state='ready',pause=1,last=performance.now(),anim=0,flash=0,soundOn=true,audio=null;
const pac={x:14,y:14,px:14,py:14,t:0,dir:{x:-1,y:0},next:{x:-1,y:0}};
const ghost={x:14,y:7,px:14,py:7,t:0,dir:{x:1,y:0},home:{x:14,y:7},dead:0,release:2.5};
function loadLevel(){grid=TEMPLATE.map(r=>[...r].map(ch=>ch==='#'?1:0));dots=new Set();powers=new Set();for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){let ch=TEMPLATE[y][x];if(ch==='.'||ch==='P'){dots.add(`${x},${y}`);if(ch==='P')powers.add(`${x},${y}`)}}resetActors();state='ready';pause=1;beep(180,.08,'square')}
function resetActors(){Object.assign(pac,{x:14,y:14,px:14,py:14,t:0,dir:{x:-1,y:0},next:{x:-1,y:0}});Object.assign(ghost,{x:14,y:7,px:14,py:7,t:0,dir:{x:1,y:0},dead:0,release:2.5});power=0}
function open(x,y){if((x===14||x===15)&&(y===-1||y===ROWS))return true;if(y===7&&(x===-1||x===COLS))return true;return x>=0&&x<COLS&&y>=0&&y<ROWS&&grid[y][x]===0}
function portal(o){if(o.y<0){o.y=ROWS-1;o.py=o.y}if(o.y>=ROWS){o.y=0;o.py=o.y}if(o.x<0){o.x=COLS-1;o.px=o.x}if(o.x>=COLS){o.x=0;o.px=o.x}}
function beep(f=220,d=.04,type='square',vol=.025){if(!soundOn)return;try{audio=audio||new (AudioContext||webkitAudioContext)();let o=audio.createOscillator(),a=audio.createGain();o.type=type;o.frequency.value=f;a.gain.value=vol;o.connect(a);a.connect(audio.destination);o.start();a.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+d);o.stop(audio.currentTime+d)}catch(e){}}
function key(x,y){return `${x},${y}`}function setHigh(){if(score>high){high=score;localStorage.setItem('retroPacHigh',high)}}
function input(d){pac.next=d;if(state==='over')return;if(audio&&audio.state==='suspended')audio.resume()}
addEventListener('keydown',e=>{let m={ArrowLeft:{x:-1,y:0},KeyA:{x:-1,y:0},ArrowRight:{x:1,y:0},KeyD:{x:1,y:0},ArrowUp:{x:0,y:-1},KeyW:{x:0,y:-1},ArrowDown:{x:0,y:1},KeyS:{x:0,y:1}};if(m[e.code]){e.preventDefault();input(m[e.code])}if(e.code==='KeyM')soundOn=!soundOn;if(e.code==='Escape')location.href='index.html';if(e.code==='Enter'&&state==='over'){score=0;lives=3;level=1;loadLevel()}});
function dirs(o){return[{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}].filter(d=>open(o.x+d.x,o.y+d.y)&&!(d.x===-o.dir.x&&d.y===-o.dir.y))}
function ghostChoice(){let a=dirs(ghost);if(!a.length)return{x:-ghost.dir.x,y:-ghost.dir.y};if(power>0)return a[Math.floor(Math.random()*a.length)];a.sort((u,v)=>(Math.abs(ghost.x+u.x-pac.x)+Math.abs(ghost.y+u.y-pac.y))-(Math.abs(ghost.x+v.x-pac.x)+Math.abs(ghost.y+v.y-pac.y)));return Math.random()<.72?a[0]:a[Math.floor(Math.random()*a.length)]}
function move(o,speed,isPac){o.t+=speed;if(o.t<1)return;o.t-=1;o.px=o.x;o.py=o.y;if(isPac&&open(o.x+pac.next.x,o.y+pac.next.y))o.dir=pac.next;if(!open(o.x+o.dir.x,o.y+o.dir.y)){if(isPac){o.t=0;return}else o.dir=ghostChoice()}o.x+=o.dir.x;o.y+=o.dir.y;portal(o);if(!isPac)o.dir=ghostChoice()}
function die(){lives--;beep(90,.35,'sawtooth',.05);state='dead';pause=1;if(lives<=0){setTimeout(()=>{state='over';setHigh()},700)}else setTimeout(()=>{resetActors();state='ready';pause=.7},850)}
function update(dt){anim+=dt*10;if(state==='ready'){pause-=dt;if(pause<=0)state='play';return}if(state!=='play')return;if(power>0)power=Math.max(0,power-dt);if(ghost.dead>0){ghost.dead-=dt;if(ghost.dead<=0){Object.assign(ghost,{x:ghost.home.x,y:ghost.home.y,px:ghost.home.x,py:ghost.home.y,t:0});ghost.release=1.5}}if(ghost.release>0)ghost.release-=dt;move(pac,dt*PLAYER_SPEED,true);let k=key(pac.x,pac.y);if(dots.has(k)){dots.delete(k);if(powers.has(k)){powers.delete(k);score+=50;power=POWER_DURATION;beep(105,.18,'square',.05);ghost.dir={x:-ghost.dir.x,y:-ghost.dir.y}}else{score+=10;beep(420,.025,'square',.012)}setHigh()}if(ghost.dead<=0&&ghost.release<=0)move(ghost,dt*(GHOST_SPEED+(level-1)*.22)*(power>0?.72:1),false);if(ghost.dead<=0&&ghost.x===pac.x&&ghost.y===pac.y&&ghost.t<.8&&pac.t<.8){if(power>0){score+=200;setHigh();ghost.dead=1.6;beep(650,.15,'square',.05)}else die()}if(dots.size===0){state='clear';flash=1.6;beep(760,.35,'square',.05);setTimeout(()=>{level++;loadLevel()},1700)}}
function pos(o){let dx=o.x-o.px,dy=o.y-o.py;if(Math.abs(dx)>2)dx=0;if(Math.abs(dy)>2)dy=0;return{x:OX+(o.px+dx*o.t)*T+T/2,y:OY+(o.py+dy*o.t)*T+T/2}}
function rect(x,y,w,h,col){g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function drawPac(){let p=pos(pac),d=pac.dir,a=.18+Math.abs(Math.sin(anim))*.55,ang=Math.atan2(d.y,d.x);g.fillStyle='#f4d94b';g.beginPath();g.moveTo(p.x,p.y);g.arc(p.x,p.y,12,ang+a,ang+Math.PI*2-a);g.closePath();g.fill();rect(p.x-3-d.y*5,p.y-9+d.x*5,3,3,'#17347d')}
function drawGhost(){if(ghost.dead>0)return;let p=pos(ghost),fr=power>0,blink=fr&&power<1.7&&Math.floor(power*9)%2===0,col=fr?(blink?'#efe7b0':'#7084d2'):'#f4e8b5';rect(p.x-11,p.y-10,22,18,col);rect(p.x-7,p.y-14,14,5,col);rect(p.x-11,p.y+7,5,5,col);rect(p.x-2,p.y+7,5,5,col);rect(p.x+7,p.y+7,5,5,col);rect(p.x-6,p.y-6,4,5,'#fff');rect(p.x+3,p.y-6,4,5,'#fff');rect(p.x-5+ghost.dir.x,p.y-5+ghost.dir.y,2,2,'#2445a4');rect(p.x+4+ghost.dir.x,p.y-5+ghost.dir.y,2,2,'#2445a4')}
function render(){let wall='#3449bd',road='#9a8137',blink=state==='clear'&&Math.floor(performance.now()/120)%2===0;rect(0,0,W,H,'#16110b');rect(OX-8,OY-8,COLS*T+16,ROWS*T+16,road);rect(OX,OY,COLS*T,ROWS*T,road);for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(grid[y][x])rect(OX+x*T+2,OY+y*T+2,T-4,T-4,blink?'#d5c55a':wall);for(const s of dots){let [x,y]=s.split(',').map(Number);if(powers.has(s)){if(Math.floor(anim*2)%2)rect(OX+x*T+7,OY+y*T+7,16,16,'#dce77b')}else rect(OX+x*T+9,OY+y*T+13,12,3,'#e3c65a')}drawGhost();drawPac();rect(0,510,W,30,'#17120d');g.font='bold 16px monospace';g.fillStyle='#e3c65a';g.textAlign='left';g.fillText(`SCORE ${String(score).padStart(6,'0')}`,20,531);g.fillText(`HIGH ${String(high).padStart(6,'0')}`,205,531);g.fillText(`LEVEL ${level}`,400,531);g.fillText(`LIVES ${lives}`,520,531);g.fillText(soundOn?'M: SOUND ON':'M: SOUND OFF',675,531);if(state==='ready'){g.textAlign='center';g.fillText('READY!',W/2,285)}if(state==='clear'){g.textAlign='center';g.fillText('LEVEL COMPLETE',W/2,285)}if(state==='over'){rect(300,220,360,95,'#17120d');g.textAlign='center';g.fillStyle='#f4d94b';g.font='bold 25px monospace';g.fillText('GAME OVER',W/2,258);g.font='15px monospace';g.fillText('PRESS ENTER TO RESTART',W/2,292)}}
function loop(n){let dt=Math.min(.04,(n-last)/1000);last=n;update(dt);render();requestAnimationFrame(loop)}loadLevel();requestAnimationFrame(loop);