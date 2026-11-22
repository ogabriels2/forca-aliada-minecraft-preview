// Original pixel artwork on the game's standard 64×64 UV layout.
// Coordinates use the same cuboid layout as the platform's skin-pixels.mjs.
export const presets={
 orbita:{name:'Órbita',coat:'#3665ac',skin:'#c58d67',hair:'#40352d',pants:'#293c54',trim:'#e1c382'},
 aurora:{name:'Aurora',coat:'#8656b7',skin:'#926044',hair:'#29283a',pants:'#33374c',trim:'#d6b5d9'},
 trilha:{name:'Trilha',coat:'#b86738',skin:'#e0b38c',hair:'#62432c',pants:'#4d5141',trim:'#d5bd7c'}
};
const parts={head:[0,0,8,8,8],body:[16,16,8,12,4],rightArm:[40,16,4,12,4],leftArm:[32,48,4,12,4],rightLeg:[0,16,4,12,4],leftLeg:[16,48,4,12,4]};
function faces([x,y,w,h,d]){return {top:[x+d,y,w,d],bottom:[x+d+w,y,w,d],right:[x,y+d,d,h],front:[x+d,y+d,w,h],left:[x+d+w,y+d,d,h],back:[x+d+w+d,y+d,w,h]};}
const tint=(hex,amount)=>'#'+hex.slice(1).match(/../g).map(v=>Math.max(0,Math.min(255,parseInt(v,16)+amount)).toString(16).padStart(2,'0')).join('');
export function createTexture(name='orbita',coat){
 const p={...presets[name],coat:coat||presets[name].coat};const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const c=canvas.getContext('2d');
 const rect=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 for(const [part,box]of Object.entries(parts))for(const [face,[x,y,w,h]]of Object.entries(faces(box))){
  const head=part==='head',arm=part.includes('Arm'),leg=part.includes('Leg');
  const main=head?(face==='front'?p.skin:p.hair):leg?p.pants:p.coat;
  rect(x,y,w,h,tint(main,face==='top'?12:face==='right'?-12:face==='back'?-7:0));
  if(head&&face==='front'){
   rect(x,y,8,2,p.hair);rect(x,y+2,1,3,p.hair);rect(x+6,y+2,2,1,p.hair);
   rect(x+1,y+4,2,1,'#e8e5d8');rect(x+5,y+4,2,1,'#e8e5d8');rect(x+2,y+4,1,1,'#34483c');rect(x+5,y+4,1,1,'#34483c');
   rect(x+3,y+5,2,1,tint(p.skin,-22));rect(x+3,y+6,2,1,tint(p.skin,-38));rect(x+1,y+6,1,1,tint(p.skin,7));
  }
  if(head&&face==='back'){rect(x+1,y+1,2,4,tint(p.hair,11));rect(x+5,y+3,2,3,tint(p.hair,-7));}
  if(part==='body'&&face==='front'){
   rect(x+2,y,4,2,p.skin);rect(x+3,y+2,2,8,'#e5ddc5');rect(x+1,y+2,1,3,p.trim);rect(x+6,y+2,1,3,p.trim);
   rect(x,y+10,8,2,tint(p.coat,-22));rect(x+3,y+10,2,2,p.trim);rect(x+1,y+7,2,1,tint(p.coat,-30));rect(x+5,y+7,2,1,tint(p.coat,-30));
  }
  if(part==='body'&&face==='back'){rect(x+1,y+2,6,3,tint(p.coat,-12));rect(x+2,y+3,4,1,p.trim);rect(x,y+10,8,2,tint(p.coat,-22));}
  if(arm&&face!=='top'&&face!=='bottom'){rect(x,y+8,w,1,tint(p.coat,-25));rect(x,y+9,w,3,p.skin);rect(x+(face==='left'?0:w-1),y+9,1,3,tint(p.skin,-12));rect(x,y+4,1,3,tint(p.coat,-12));}
  if(arm&&face==='bottom')rect(x,y,w,h,p.skin);
  if(leg&&face!=='top'&&face!=='bottom'){rect(x,y+5,w,1,tint(p.pants,9));rect(x,y+9,w,3,'#252a2b');rect(x,y+11,w,1,p.trim);if(face==='front')rect(x+1,y+9,2,1,'#656454');}
  if(leg&&face==='bottom')rect(x,y,w,h,'#24292b');
 }
 // Hair on the second layer gives a real Minecraft silhouette without a helmet shape.
 for(const [face,[x,y,w,h]]of Object.entries(faces([32,0,8,8,8]))){
  if(face==='top')rect(x,y,w,h,tint(p.hair,5));
  if(face==='back'||face==='right'||face==='left'){rect(x,y,w,name==='aurora'?7:4,p.hair);rect(x+1,y+1,2,2,tint(p.hair,9));}
  if(face==='front'){rect(x,y,8,1,p.hair);rect(x+1,y+1,name==='aurora'?4:2,1,p.hair);rect(x+6,y+1,2,2,p.hair);}
 }
 return canvas;
}
export function drawFront(canvas,texture){
 const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);c.imageSmoothingEnabled=false;c.save();c.scale(canvas.width/24,canvas.height/32);
 for(const r of [[8,8,8,8,8,0,8,8],[20,20,8,12,8,8,8,12],[44,20,4,12,4,8,4,12],[36,52,4,12,16,8,4,12],[4,20,4,12,8,20,4,12],[20,52,4,12,12,20,4,12],[40,8,8,8,8,0,8,8]])c.drawImage(texture,...r);c.restore();
}
