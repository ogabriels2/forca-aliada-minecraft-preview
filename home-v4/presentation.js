export function setupPresentation({motion,toast}){
 const frames=[...document.querySelectorAll('[data-manager-frame]')];
 window.addEventListener('message',e=>{const full=frames.find(f=>f.dataset.managerFrame==='full');if(e.origin===location.origin&&e.source===full?.contentWindow&&e.data?.type==='manager-preview'&&e.data.event==='activity'&&typeof e.data.message==='string')toast(e.data.message);});
 const heroFrame=frames.find(f=>f.dataset.managerFrame==='hero');
 if(heroFrame)new ResizeObserver(()=>{heroFrame.style.transform=`scale(${heroFrame.parentElement.clientWidth/1000})`;}).observe(heroFrame.parentElement);
 if(heroFrame){
  const scenes=['overview','terminal','files'];let scene=0;
  motion.register('hero-product',heroFrame.parentElement,()=>{
   scene=(scene+1)%scenes.length;
   heroFrame.contentWindow?.postMessage({type:'manager-preview-control',view:scenes[scene],playing:false},location.origin);
   heroFrame.animate([{opacity:.65},{opacity:1}],{duration:350,easing:'ease-out'});
  },6200);
 }
 const start=frame=>{if(!frame.src&&frame.dataset.src)frame.src=frame.dataset.src;};
 const observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{
  if(isIntersecting)start(target);
  target.contentWindow?.postMessage({type:'manager-preview-control',playing:false,visible:isIntersecting},location.origin);
 }),{rootMargin:'200px 0px'});frames.forEach(f=>observer.observe(f));
 const content=[document.querySelector('.hero h1'),document.querySelector('.hero-copy>p'),document.querySelector('.hero-copy .actions'),document.querySelector('.hero-native')];
 if(!motion.instant())content.forEach((el,i)=>el.animate([{opacity:.4,transform:`translateY(${i===3?18:10}px)`},{opacity:1,transform:'translateY(0)'}],{duration:650,delay:i*90,easing:'cubic-bezier(.2,.8,.2,1)'}));
 const entered=new WeakSet();
 const reveal=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{
  if(!isIntersecting||entered.has(target))return;entered.add(target);
  if(motion.instant())return;
  const isPhone=target.classList.contains('phone');
  target.animate([{opacity:.72,transform:isPhone?'translateY(26px) rotate(-2deg)':'translateY(20px) scale(.985)'},{opacity:1,transform:'none'}],{duration:isPhone?850:700,easing:'cubic-bezier(.2,.8,.2,1)'});
 }),{threshold:.18});
 document.querySelectorAll('.native-stage,.skin-editor-window,.phone').forEach(e=>reveal.observe(e));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)frames.forEach(f=>f.contentWindow?.postMessage({type:'manager-preview-control',playing:false,visible:false},location.origin));});
}
