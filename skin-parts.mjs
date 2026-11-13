import {blankPixels,pieceMask,faces,rgba,extractPiece} from './skin-pixels.mjs?v=creations-20261113';
import {SAMPLE_PARTS as LEGACY_PARTS} from './skin-parts-legacy.mjs';
export const CATEGORIES={hair:'Cabelos',tops:'Parte de cima',bottoms:'Parte de baixo',shoes:'Calçados'};
export const PART_TYPES={hair:{short:'Curtos',layered:'Em camadas'},tops:{tshirt:'Camisetas',shirt:'Camisas',hoodie:'Moletons',jacket:'Jaquetas'},bottoms:{jeans:'Jeans',cargo:'Calças cargo'},shoes:{sneakers:'Tênis',boots:'Botas'}};
const designs=[
 ['fa-tee-night','Camiseta noite','tops','tshirt','#263345','#dae1d7'],
 ['fa-shirt-flannel','Camisa xadrez','tops','shirt','#a8473c','#ebc5a3'],
 ['fa-hoodie-ocean','Moletom azul','tops','hoodie','#315e9c','#e4e3d7'],
 ['fa-jacket-denim','Jaqueta jeans','tops','jacket','#416980','#b8b6a4'],
 ['fa-jeans','Jeans escuro','bottoms','jeans','#303c53','#b29972'],
 ['fa-cargo','Calça cargo','bottoms','cargo','#626f53','#9aab7f'],
 ['fa-sneakers','Tênis de lona','shoes','sneakers','#e8e5d9','#2f4059'],
 ['fa-boots','Botas de trilha','shoes','boots','#70513b','#bf9b6b'],
 ['fa-hair-crop','Cabelo curto castanho','hair','short','#593c2f','#967052'],
 ['fa-hair-dark','Cabelo escuro em camadas','hair','layered','#25252c','#55515b'],
];
function designPixels(category,type,base,detail,model){
 const output=blankPixels(),mask=pieceMask(category,model),body=faces(model,'outer'),main=rgba(base),accent=rgba(detail);
 const put=(part,face,x,y,color)=>{const r=body[part][face],p=(r[1]+y)*64+r[0]+x;if(mask[p])output.set(color,p*4);};
 for(const [part,ff] of Object.entries(body))for(const [face,r] of Object.entries(ff))for(let y=0;y<r[3];y++)for(let x=0;x<r[2];x++){
   if(category==='tops'&&part.includes('Arm')&&(face==='bottom'||y>=(type==='tshirt'?4:10)))continue;
   let shift=face==='top'?12:['right','back'].includes(face)?-12:0;shift+=(x===0||x===r[2]-1)?-5:0;shift+=((x*7+y*3)%13===0)?3:0;
   let color=main.map((v,i)=>i===3?v:Math.max(0,Math.min(255,v+shift)));
   if(type==='shirt'&&((x%4<2)!==(y%4<2)))color=main.map((v,i)=>i===3?v:Math.max(0,v-27));
   if(category==='hair'&&((type==='layered'?x:x+y)%3===0))color=accent.map((v,i)=>i===3?v:Math.max(0,v-12));
   put(part,face,x,y,color);
 }
 const rect=(part,face,x,y,w,h,color)=>{const r=body[part][face];for(let yy=y;yy<Math.min(y+h,r[3]);yy++)for(let xx=x;xx<Math.min(x+w,r[2]);xx++)put(part,face,xx,yy,color);};
 if(category==='tops'){
   if(type==='tshirt'){rect('body','front',2,0,4,1,accent);rect('body','front',3,1,2,1,accent);rect('body','front',1,7,6,1,accent);}
   if(type==='hoodie'){rect('body','front',2,0,4,2,rgba('#263e61'));rect('body','front',2,2,1,4,accent);rect('body','front',5,2,1,3,accent);rect('body','front',1,7,6,3,rgba('#25446f'));rect('body','front',2,7,4,1,accent);}
   if(type==='jacket'){rect('body','front',3,0,2,12,rgba('#d8d2c2'));rect('body','front',0,1,3,1,accent);rect('body','front',5,1,3,1,accent);for(const x of [1,6]){rect('body','front',x,4,1,2,accent);rect('body','front',x,8,1,2,accent);}}
   if(type==='shirt'){rect('body','front',3,0,2,12,rgba('#56382e'));for(let y=2;y<12;y+=3)rect('body','front',4,y,1,1,accent);rect('body','front',1,3,2,2,accent);}
   for(const arm of ['leftArm','rightArm'])if(type!=='tshirt')for(const face of ['front','back','left','right'])rect(arm,face,0,9,4,1,accent);
 }
 if(category==='bottoms')for(const leg of ['leftLeg','rightLeg']){for(const face of ['front','back','left','right'])rect(leg,face,0,0,4,1,accent);rect(leg,'front',1,1,2,2,accent);if(type==='cargo'){rect(leg,'front',0,5,3,3,rgba('#4c5842'));rect(leg,'front',0,5,3,1,accent);}else rect(leg,'front',0,10,4,1,accent);}
 if(category==='shoes')for(const leg of ['leftLeg','rightLeg']){for(const face of ['front','back','left','right'])rect(leg,face,0,11,4,1,accent);rect(leg,'front',1,9,2,1,accent);if(type==='boots')rect(leg,'front',1,8,2,1,accent);}
 return output;
}
export const SAMPLE_PARTS=[...designs.map(([id,name,category,type,color,detail])=>({id,name,category,type,color,creator:'Força Aliada',model:'both',sample:true,pixelsFor:model=>designPixels(category,type,color,detail,model)})),...LEGACY_PARTS.map(part=>({...part,legacy:true}))];
export function safePart(value) {
  if (
    !value ||
    !/^[a-zA-Z0-9-]{1,70}$/.test(value.id || "") ||
    !CATEGORIES[value.category] ||
    !["classic", "slim"].includes(value.model) ||
    !/^data:image\/png;base64,[a-zA-Z0-9+/=]+$/.test(value.image || "") ||
    value.image.length > 100000
  )
    return null;
  return {
    id: value.id,
    name: String(value.name || "Minha peça")
      .trim()
      .slice(0, 60),
    category: value.category,
    model: value.model,
    image: value.image,
    creator: "Você",
    own: true,
    sourceCredits: Array.isArray(value.sourceCredits)
      ? value.sourceCredits.map((x) => String(x).slice(0, 120)).slice(0, 30)
      : [],
  };
}
export const maskedPart = extractPiece;
