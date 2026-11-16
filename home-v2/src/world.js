import * as THREE from 'three';

// Coordinates are those of the real world. Each shot has its own framing;
// titles remain in the DOM, so camera movement never affects navigation.
export const shots = [
  {id:'central', name:'Cidade central', world:'central', from:[-75,174,358], to:[-101,160,338], target:[-236,66,185], fov:48},
  {id:'monumentos', name:'Praças e monumentos', world:'central', from:[-356,154,346], to:[-338,146,330], target:[-170,69,209], fov:55},
  {id:'avenidas', name:'A outra cidade', world:'cidade-dois', from:[177,160,876], to:[158,151,860], target:[60,72,754], fov:52},
  {id:'ruas', name:'Pelas ruas', world:'cidade-dois', from:[55,74.6,787], to:[55,75,774], target:[59,77,712], fov:60},
];

export async function createWorld(host, onState) {
  const renderer = new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.1:1.5));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.15;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate=false;
  renderer.domElement.setAttribute('aria-hidden','true');
  host.append(renderer.domElement);
  const scene=new THREE.Scene();
  scene.background=new THREE.Color('#a6cee0');
  scene.fog=new THREE.Fog('#b4d4dd',250,560);
  const sky=new THREE.Mesh(new THREE.SphereGeometry(800,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{top:{value:new THREE.Color('#71b8dc')},horizon:{value:new THREE.Color('#b4d4dd')}},vertexShader:'varying vec3 skyDirection;void main(){skyDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform vec3 top;uniform vec3 horizon;varying vec3 skyDirection;void main(){float h=clamp(normalize(skyDirection).y,0.0,1.0);gl_FragColor=vec4(mix(horizon,top,pow(h,.45)),1.0);#include <colorspace_fragment>}'.replace(';#include',';\n#include')}));
  scene.add(sky);
  const camera=new THREE.PerspectiveCamera(53,1,.3,900);
  scene.add(new THREE.HemisphereLight('#d4f1ff','#69704c',2.3));
  const sun=new THREE.DirectionalLight('#ffe0a2',3.2);
  sun.position.set(-180,310,155);
  sun.castShadow=true;
  sun.shadow.mapSize.set(innerWidth<700?1024:2048,innerWidth<700?1024:2048);
  Object.assign(sun.shadow.camera,{left:-250,right:250,top:250,bottom:-250,near:1,far:650});
  sun.shadow.normalBias=.35;sun.shadow.bias=-.0002;
  scene.add(sun,sun.target);
  const water=new THREE.Mesh(new THREE.PlaneGeometry(1600,1600),new THREE.MeshStandardMaterial({color:'#2e8fae',roughness:.32,metalness:.23}));
  water.rotation.x=-Math.PI/2;water.position.y=15.03;water.receiveShadow=true;scene.add(water);
  const cache=new Map();let active=null,currentShot=shots[0],elapsed=0,playing=true,visible=true,raf=0,last=0,disposed=false,request=0,exploring=false;
  const pointer=new THREE.Vector2();const smooth=new THREE.Vector2();
  const small=()=>host.clientWidth<700;
  let frameCount=0,totalDelta=0,adaptive=false;

  function makeMesh(records,meta) {
    const count=records.length/8;
    const origins=new Float32Array(count*3),sizes=new Float32Array(count*2),directions=new Float32Array(count),colors=new Float32Array(count*3);
    const center=[(meta.bounds[0]+meta.bounds[1])/2,meta.bounds[4],(meta.bounds[2]+meta.bounds[3])/2];
    const color=new THREE.Color();
    for(let i=0;i<count;i++) {
      const j=i*8;origins.set([records[j]+meta.bounds[0]-center[0],records[j+1],records[j+2]+meta.bounds[2]-center[2]],i*3);
      sizes.set([records[j+3],records[j+4]],i*2);directions[i]=records[j+5]*2+records[j+6];
      const rgb=meta.colors[records[j+7]];color.setRGB(rgb[0]/255,rgb[1]/255,rgb[2]/255,THREE.SRGBColorSpace);color.toArray(colors,i*3);
    }
    const geometry=new THREE.InstancedBufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,1,0,0,0,1,0,1,1,0],3));
    geometry.setAttribute('normal',new THREE.Float32BufferAttribute([0,0,1,0,0,1,0,0,1,0,0,1],3));
    geometry.setIndex([0,1,2,2,1,3]);
    geometry.setAttribute('faceOrigin',new THREE.InstancedBufferAttribute(origins,3));
    geometry.setAttribute('faceSize',new THREE.InstancedBufferAttribute(sizes,2));
    geometry.setAttribute('faceDirection',new THREE.InstancedBufferAttribute(directions,1));
    geometry.setAttribute('faceColor',new THREE.InstancedBufferAttribute(colors,3));
    geometry.instanceCount=count;
    const declarations='attribute vec3 faceOrigin; attribute vec2 faceSize; attribute float faceDirection; attribute vec3 faceColor; varying vec3 vFaceColor; varying vec3 vBlockPosition;';
    const position=`float ax=floor(faceDirection/2.0); float sg=mod(faceDirection,2.0)*2.0-1.0;
      vec2 uv=vec2(sg<0.0?1.0-position.x:position.x,position.y)*faceSize;
      vec3 transformed=faceOrigin;
      if(ax<0.5){transformed.y+=uv.x;transformed.z+=uv.y;}
      else if(ax<1.5){transformed.z+=uv.x;transformed.x+=uv.y;}
      else{transformed.x+=uv.x;transformed.y+=uv.y;}
      vFaceColor=faceColor;vBlockPosition=transformed;`;
    const material=new THREE.MeshStandardMaterial({roughness:.9,metalness:0});
    const customize=shader=>{
      shader.vertexShader=declarations+'\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>',`vec3 objectNormal=vec3(0.0);float a=floor(faceDirection/2.0);float s=mod(faceDirection,2.0)*2.0-1.0;if(a<0.5)objectNormal.x=s;else if(a<1.5)objectNormal.y=s;else objectNormal.z=s;`);
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',position);
    };
    material.onBeforeCompile=shader=>{
      customize(shader);
      shader.fragmentShader='varying vec3 vFaceColor;varying vec3 vBlockPosition;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`float grain=fract(sin(dot(floor(vBlockPosition*8.0),vec3(12.9898,78.233,37.719)))*43758.5453);diffuseColor.rgb*=vFaceColor*(.94+.12*grain);`);
    };
    const mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;mesh.castShadow=true;mesh.receiveShadow=true;
    const depth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking});depth.onBeforeCompile=customize;mesh.customDepthMaterial=depth;
    return {mesh,center,faceCount:count};
  }

  async function load(name) {
    if(cache.has(name))return cache.get(name);
    const pending=(async()=>{
      const base=new URL(`media/world/${name}`,document.baseURI);
      const [metaResponse,dataResponse]=await Promise.all([fetch(base+'.json'),fetch(base+'.bin.gz')]);
      if(!metaResponse.ok||!dataResponse.ok)throw new Error('World asset unavailable');
      const meta=await metaResponse.json();
      const data=await new Response(dataResponse.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
      if(data.byteLength!==meta.faceCount*meta.stride*2)throw new Error('Invalid geometry length');
      return makeMesh(new Uint16Array(data),meta);
    })();
    cache.set(name,pending);try{return await pending;}catch(e){cache.delete(name);throw e;}
  }
  async function setShot(id) {
    const token=++request;const shot=shots.find(s=>s.id===id)||shots[0];onState('loading',shot);
    const model=await load(shot.world);
    if(disposed||token!==request)return;
    if(active!==model){if(active)scene.remove(active.mesh);active=model;scene.add(model.mesh);}
    currentShot=shot;elapsed=0;renderer.shadowMap.needsUpdate=true;
    sun.position.set(-180,310,155);sun.target.position.set(0,25,0);
    camera.fov=small()?60:shot.fov;camera.updateProjectionMatrix();
    update(0);render();onState('ready',shot);
    start();
  }
  function update(dt) {
    if(!active)return;
    elapsed+=dt;
    const progress=.5-.5*Math.cos((elapsed/26)*Math.PI*2);
    const c=active.center;
    smooth.lerp(pointer,.04);
    camera.position.set(THREE.MathUtils.lerp(currentShot.from[0],currentShot.to[0],progress)-c[0]+smooth.x*2.7,THREE.MathUtils.lerp(currentShot.from[1],currentShot.to[1],progress)-c[1]+smooth.y*1.3,THREE.MathUtils.lerp(currentShot.from[2],currentShot.to[2],progress)-c[2]);
    camera.lookAt(currentShot.target[0]-c[0],currentShot.target[1]-c[1],currentShot.target[2]-c[2]);
    sky.position.copy(camera.position);
    if(!small()&&!exploring)camera.setViewOffset(host.clientWidth,host.clientHeight,-host.clientWidth*.12,0,host.clientWidth,host.clientHeight);else camera.clearViewOffset();
  }
  function render(){if(active&&!disposed)renderer.render(scene,camera);}
  function tick(now) {
    raf=0;if(!playing||!visible||document.hidden||disposed)return;
    // A slow camera tour needs 30 rendered frames, not a full game loop at 120 Hz.
    if(last&&now-last<32){raf=requestAnimationFrame(tick);return;}
    const dt=last?Math.min((now-last)/1000,.08):0;last=now;
    if(dt){frameCount++;totalDelta+=dt;if(frameCount===120&&!adaptive){if(totalDelta/120>.035){renderer.setPixelRatio(Math.min(1,devicePixelRatio));renderer.shadowMap.enabled=false;adaptive=true;}frameCount=0;totalDelta=0;}}
    update(dt);render();raf=requestAnimationFrame(tick);
  }
  function stop(){cancelAnimationFrame(raf);raf=0;last=0;}
  function start(){if(!raf&&playing&&visible&&!document.hidden&&!disposed)raf=requestAnimationFrame(tick);}
  function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.fov=small()?60:currentShot.fov;camera.updateProjectionMatrix();update(0);render();}
  const observer=new ResizeObserver(resize);observer.observe(host);
  host.addEventListener('webglcontextlost',e=>{e.preventDefault();stop();onState('fallback',currentShot);},true);
  host.addEventListener('webglcontextrestored',()=>{renderer.shadowMap.needsUpdate=true;render();onState('ready',currentShot);start();},true);
  const onPointer=e=>{if(matchMedia('(pointer:fine)').matches&&playing){const r=host.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width-.5,.5-(e.clientY-r.top)/r.height);}};
  host.parentElement.addEventListener('pointermove',onPointer,{passive:true});
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
  resize();
  return {setShot,explore(value){exploring=value;update(0);render();},play(value){playing=value;value?start():stop();},visible(value){visible=value;value?start():stop();},stats(){return {faceCount:active?.faceCount,triangles:renderer.info.render.triangles,calls:renderer.info.render.calls,playing,visible,pixelRatio:renderer.getPixelRatio(),shot:currentShot.id,elapsed};},destroy(){disposed=true;stop();observer.disconnect();renderer.dispose();for(const promise of cache.values())promise.then(m=>{m.mesh.geometry.dispose();m.mesh.material.dispose();m.mesh.customDepthMaterial.dispose();});}};
}
