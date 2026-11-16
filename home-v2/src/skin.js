import * as THREE from 'three';
import {gsap} from 'gsap';

export function initSkin(host){
  const canvas=host.querySelector('canvas'),fallback=host.querySelector('img');
  const choices=host.closest('article').querySelectorAll('[data-skin]');
  const turn=host.querySelector('#skin-turn');
  turn.hidden=true;
  function updateFallback(name){
    fallback.src=`media/skin-${name}.png?v=wardrobe-2`;
    fallback.alt=`Personagem de exemplo com visual ${name==='ocean'?'azul':name==='plum'?'roxo':'verde'}`;
    choices.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.skin===name)));
  }
  choices.forEach(button=>button.addEventListener('click',()=>updateFallback(button.dataset.skin)));
  let renderer;
  try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});}catch{return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(30,1,.1,200);
  camera.position.set(0,1,68);camera.lookAt(0,0,0);
  scene.add(new THREE.HemisphereLight('#ffffff','#a6a37c',2.7));
  const sun=new THREE.DirectionalLight('#fff4df',2.8);sun.position.set(-30,45,45);scene.add(sun);
  const model=new THREE.Group();model.rotation.set(.03,-.4,0);scene.add(model);
  const material=new THREE.MeshStandardMaterial({roughness:1,transparent:true,alphaTest:.4});
  // Minecraft classic layout. All examples are existing Força Aliada showcase textures.
  function part(w,h,d,x,y,z,u,v){
    const g=new THREE.BoxGeometry(w,h,d),uv=g.getAttribute('uv');
    const rects=[[u+d+w,v+d,d,h],[u,v+d,d,h],[u+d,v,w,d],[u+d+w,v,w,d],[u+d,v+d,w,h],[u+2*d+w,v+d,w,h]];
    rects.forEach(([a,b,c,e],face)=>{[[a,b],[a+c,b],[a,b+e],[a+c,b+e]].forEach(([xx,yy],i)=>uv.setXY(face*4+i,xx/64,1-yy/64));});
    const mesh=new THREE.Mesh(g,material);mesh.position.set(x,y,z);model.add(mesh);return mesh;
  }
  part(8,8,8,0,12,0,0,0);part(8,12,4,0,2,0,16,16);
  part(4,12,4,-6,2,0,40,16).rotation.z=-.07;part(4,12,4,6,2,0,32,48).rotation.z=.07;
  part(4,12,4,-2,-10,0,0,16);part(4,12,4,2,-10,0,16,48);
  const render=()=>renderer.render(scene,camera);
  const observer=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();render();});observer.observe(host);
  let request=0,activeTexture;
  async function select(name){
    const token=++request;
    fallback.src=`media/skin-${name}.png?v=wardrobe-2`;
    fallback.alt=`Personagem de exemplo com visual ${name==='ocean'?'azul':name==='plum'?'roxo':'verde'}`;
    host.closest('article').querySelectorAll('[data-skin]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.skin===name)));
    try{
      const texture=await new THREE.TextureLoader().loadAsync(`media/skin-texture-${name}.png?v=wardrobe-2`);
      if(token!==request){texture.dispose();return;}
      texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestFilter;texture.colorSpace=THREE.SRGBColorSpace;
      activeTexture?.dispose();activeTexture=texture;material.map=texture;material.needsUpdate=true;render();host.dataset.ready='true';turn.hidden=false;
    }catch{host.dataset.ready='false';turn.hidden=true;}
  }
  host.closest('article').querySelectorAll('[data-skin]').forEach(button=>button.addEventListener('click',()=>select(button.dataset.skin)));
  host.querySelector('#skin-turn').addEventListener('click',()=>{
    gsap.to(model.rotation,{y:model.rotation.y+Math.PI/2,duration:matchMedia('(prefers-reduced-motion:reduce)').matches?0:.65,ease:'power3.out',onUpdate:render,overwrite:true});
  });
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();host.dataset.ready='false';turn.hidden=true;});
  canvas.addEventListener('webglcontextrestored',()=>{render();host.dataset.ready='true';turn.hidden=false;});
  select('ocean');
}
