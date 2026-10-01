// Sprites baseados nos desenhos fornecidos pelo usuário.
// Mantém o visual geométrico/pixelado mesmo em 800x600.
function ship(o){
  const alt=(Math.floor(distance/180)+Math.floor(o.y/70))%2===0;
  // Barco: casco azul/cinza, faixa vermelha/laranja, cabine preta e mastro.
  rect(o.x-42,o.y+5,84,11,alt?'#72a7c7':'#93c5de');
  rect(o.x-52,o.y-3,104,7,alt?'#a63d20':'#f13a36');
  rect(o.x-18,o.y-12,36,9,'#202020');
  rect(o.x-4,o.y-25,8,13,'#202020');
  rect(o.x-12,o.y-4,24,3,'#202020');
  rect(o.x+42,o.y+4,12,4,alt?'#72a7c7':'#8ed143');
}
function heli(o){
  const x=Math.round(o.x),y=Math.round(o.y),s=o.scale||.72;
  // Corpo fixo: desenho eli01 aprovado pelo usuário.
  g.save();
  g.translate(x,y);
  g.scale(s,s);
  const green='#064414',blue='#14289d',gold='#d5a24e';
  // fuselagem azul longa
  rect(-42,-3,84,9,blue);
  // cauda e cabine verdes
  rect(-48,-8,15,7,green);
  rect(-48,7,15,7,green);
  rect(-14,-13,42,10,green);
  rect(-8,-20,26,8,green);
  // trem/pés verdes
  rect(-9,6,28,9,green);
  rect(-2,14,15,8,green);
  rect(-2,22,15,5,green);
  // rotor: 4 quadros alternados dão sensação de giro sem deformar o corpo
  const frame=Math.floor((animTime*18+(o.phase||0))%4);
  rect(-2,-31,4,12,gold);
  if(frame===0){
    rect(-24,-34,48,4,gold);
  }else if(frame===1){
    rect(-16,-35,32,4,gold);
    rect(-3,-38,6,10,gold);
  }else if(frame===2){
    rect(-8,-34,16,4,gold);
  }else{
    rect(-16,-35,32,4,gold);
    rect(-3,-38,6,10,gold);
  }
  g.restore();
}
function drawHouse(x,y,variant=0){
  const roof=variant?'#343434':'#2321a5';
  const wall=variant?'#ffc533':'#e82d37';
  const tree=variant?'#8fc777':'#009a5d';
  rect(x-73,y-1,146,20,wall);
  g.fillStyle=roof;g.beginPath();g.moveTo(x-73,y-1);g.lineTo(x,y-24);g.lineTo(x+73,y-1);g.fill();
  for(let i=-1;i<=1;i++){rect(x+i*40-10,y+3,20,11,'#f5d49c');rect(x+i*40-7,y+5,14,7,variant?'#ffe7b6':'#ffb98c')}
  rect(x+50,y+63,22,31,'#403500');
  g.fillStyle=tree;g.beginPath();g.moveTo(x+61,y+26);g.lineTo(x+34,y+61);g.lineTo(x+88,y+61);g.fill();
  rect(x+8,y+51,106,18,tree);rect(x+28,y+39,67,20,tree);
}
const baseWorld=world;
world=function(){
  baseWorld();
  const period=900;
  for(let k=-1;k<3;k++){
    const d0=k*period+260;
    let y=player.y-(d0-distance);
    if(y>-100&&y<PLAY-70)drawHouse(82,y,(k&1));
    const d1=k*period+690;
    y=player.y-(d1-distance);
    if(y>-100&&y<PLAY-70)drawHouse(718,y,((k+1)&1));
  }
};