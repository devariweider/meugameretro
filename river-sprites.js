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
  // pequena proa escalonada do desenho
  rect(o.x+42,o.y+4,12,4,alt?'#72a7c7':'#8ed143');
}
function heli(o){
  const frame=(Math.floor(performance.now()/130)+Math.floor(o.y/30))%3;
  const body=frame===0?'#063d11':frame===1?'#084b18':'#164d1d';
  const stripe=frame===1?'#ed3b43':frame===0?'#2436c5':'#9cc89a';
  // rotor superior e eixo bege
  rect(o.x-21,o.y-23,42,5,'#d5a24e');
  rect(o.x-3,o.y-34,6,12,'#d5a24e');
  // corpo verde escuro do helicóptero
  rect(o.x-27,o.y-7,48,12,body);
  rect(o.x-20,o.y-13,32,7,body);
  rect(o.x-14,o.y+5,28,8,body);
  rect(o.x-8,o.y+13,16,10,body);
  // cauda longa e ponta colorida, como eli01/02/03
  rect(o.x+20,o.y-4,35,7,body);
  rect(o.x+49,o.y-7,8,13,body);
  rect(o.x-40,o.y-7,15,7,stripe);
  rect(o.x-34,o.y+1,9,5,'#0b1735');
}
function drawHouse(x,y,variant=0){
  // Casa + árvore reproduzindo casa01/casa02.
  const roof=variant?'#343434':'#2321a5';
  const wall=variant?'#ffc533':'#e82d37';
  const tree=variant?'#8fc777':'#009a5d';
  rect(x-73,y-1,146,20,wall);
  g.fillStyle=roof;g.beginPath();g.moveTo(x-73,y-1);g.lineTo(x,y-24);g.lineTo(x+73,y-1);g.fill();
  for(let i=-1;i<=1;i++){rect(x+i*40-10,y+3,20,11,'#f5d49c');rect(x+i*40-7,y+5,14,7,variant?'#ffe7b6':'#ffb98c')}
  // árvore em camadas retangulares/triangulares
  rect(x+50,y+63,22,31,'#403500');
  g.fillStyle=tree;g.beginPath();g.moveTo(x+61,y+26);g.lineTo(x+34,y+61);g.lineTo(x+88,y+61);g.fill();
  rect(x+8,y+51,106,18,tree);rect(x+28,y+39,67,20,tree);
}
const baseWorld=world;
world=function(){
  baseWorld();
  // As casas ficam nas margens e descem junto com o cenário.
  // Posições repetidas de forma estável para parecer parte do mapa, não objetos aleatórios.
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