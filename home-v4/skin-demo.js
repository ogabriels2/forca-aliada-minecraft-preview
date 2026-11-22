import {createTexture,drawFront,presets} from './skin-textures.js';
export function setupSkinDemo({toast,motion}){
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 const host=$('#skin-canvas-wrap'),canvas=$('#skin-canvas'),poster=$('#skin-poster');
 let viewer,api,loaded=false,visible=false,preset='orbita',color=presets.orbita.coat,texture=createTexture(),paint=false,stroke=false,undo=[],turnTimer;
 function remember(){undo.push({pixels:texture.getContext('2d').getImageData(0,0,64,64),preset,color});if(undo.length>20)undo.shift();$('#skin-undo').disabled=false;}
 function syncChoices(){$$('[data-skin-preset]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.skinPreset===preset)));$$('[data-color]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.color===color)));poster.alt=`Skin ${presets[preset].name || preset} vista de frente`;}
 function fallback(){host.dataset.ready='false';$('#skin-hint').textContent='Prévia em 2D';$('#skin-paint').disabled=true;$('#skin-paint').title='Seu navegador abriu a prévia em 2D. Você ainda pode trocar as cores e baixar a skin.';$('#skin-left').disabled=true;$('#skin-right').disabled=true;}
 function refresh(){if(viewer){const map=viewer.playerObject.skin.map;if(map?.image){const ctx=map.image.getContext('2d');ctx.clearRect(0,0,64,64);ctx.drawImage(texture,0,0);map.needsUpdate=true;}}const front=document.createElement('canvas');front.width=192;front.height=256;drawFront(front,texture);poster.src=front.toDataURL();}
 async function load(){
  if(loaded)return;loaded=true;
  try{
   api=await new Promise((resolve,reject)=>{if(window.faSkin3d)return resolve(window.faSkin3d);const s=document.createElement('script');s.src=new URL('vendor/studio.bundle.js',import.meta.url).href;s.onload=()=>resolve(window.faSkin3d);s.onerror=reject;document.head.append(s);});
   viewer=new api.SkinViewer({canvas,width:host.clientWidth,height:host.clientHeight,zoom:.84,pixelRatio:Math.min(devicePixelRatio,2)});
   viewer.controls.enableZoom=false;viewer.controls.enablePan=false;viewer.playerObject.rotation.y=.36;await viewer.loadSkin(texture,{model:'default'});refresh();host.dataset.ready='true';viewer.renderPaused=!visible||document.hidden;
   new ResizeObserver(()=>{viewer.width=host.clientWidth;viewer.height=host.clientHeight;}).observe(host);
   if(!motion.instant()&&visible){const start=performance.now();const turn=t=>{if(!motion.allowed()||!visible||paint)return;const f=Math.min(1,(t-start)/2800);viewer.playerObject.rotation.y=.36+Math.sin(f*Math.PI)*.45;if(f<1)turnTimer=requestAnimationFrame(turn);};turnTimer=requestAnimationFrame(turn);}
  }catch{fallback();}
 }
 new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible)load();if(viewer)viewer.renderPaused=!visible||document.hidden;},{rootMargin:'120px 0px'}).observe(host);
 document.addEventListener('visibilitychange',()=>{if(viewer)viewer.renderPaused=document.hidden||!visible;});
 function mode(value){paint=value;if(viewer)viewer.controls.enabled=!paint;canvas.style.cursor=paint?'crosshair':'grab';$('#skin-paint').setAttribute('aria-pressed',String(paint));$('#skin-orbit').setAttribute('aria-pressed',String(!paint));$('#skin-hint').textContent=paint?'Toque ou clique para pintar':'Arraste para girar';cancelAnimationFrame(turnTimer);}
 $('#skin-paint').addEventListener('click',()=>mode(true));$('#skin-orbit').addEventListener('click',()=>mode(false));
 const rotate=amount=>{cancelAnimationFrame(turnTimer);if(viewer)viewer.playerObject.rotation.y+=amount;};$('#skin-left').addEventListener('click',()=>rotate(-Math.PI/4));$('#skin-right').addEventListener('click',()=>rotate(Math.PI/4));
 canvas.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();rotate(e.key==='ArrowLeft'?-.25:.25);}});
 $$('[data-skin-preset]').forEach(b=>b.addEventListener('click',()=>{remember();preset=b.dataset.skinPreset;color=presets[preset].coat;texture=createTexture(preset);refresh();syncChoices();}));
 $$('[data-color]').forEach(b=>b.addEventListener('click',()=>{if(!paint)remember();color=b.dataset.color;$$('[data-color]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if(!paint){texture=createTexture(preset,color);refresh();}}));
 function pixel(event){
  if(!viewer||!paint)return;const r=canvas.getBoundingClientRect(),ray=new api.Raycaster();ray.setFromCamera(new api.Vector2((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1),viewer.camera);
  const objects=['head','body','rightArm','leftArm','rightLeg','leftLeg'].map(part=>viewer.playerObject.skin[part].innerLayer);const hit=ray.intersectObjects(objects,true)[0];if(!hit?.uv)return;
  const x=Math.min(63,Math.max(0,Math.floor(hit.uv.x*64))),y=Math.min(63,Math.max(0,Math.floor((1-hit.uv.y)*64)));const ctx=texture.getContext('2d');ctx.fillStyle=color;ctx.fillRect(x,y,1,1);refresh();
 }
 canvas.addEventListener('pointerdown',e=>{cancelAnimationFrame(turnTimer);if(!paint)return;remember();stroke=true;canvas.setPointerCapture(e.pointerId);pixel(e);});canvas.addEventListener('pointermove',e=>{if(stroke)pixel(e);});canvas.addEventListener('pointerup',()=>stroke=false);canvas.addEventListener('pointercancel',()=>stroke=false);
 $('#skin-undo').addEventListener('click',()=>{const previous=undo.pop();if(previous){texture.getContext('2d').putImageData(previous.pixels,0,0);preset=previous.preset;color=previous.color;syncChoices();refresh();}$('#skin-undo').disabled=!undo.length;});
 $('#skin-download').addEventListener('click',()=>{const a=document.createElement('a');a.href=texture.toDataURL('image/png');a.download=`forca-aliada-${preset}.png`;a.click();toast('Skin exportada em PNG.');});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();mode(false);fallback();});
}
