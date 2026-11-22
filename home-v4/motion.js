// One motion policy for every demonstration. No work on hidden pages/sections.
export function setupMotion() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const conserve = Boolean(navigator.connection?.saveData || (navigator.deviceMemory && navigator.deviceMemory < 4));
  const loops = new Map();
  let heroVisible = false;
  const pausePreference = document.querySelector('#pause-preview-motion');
  const allowed = () => !reduced.matches && !conserve && !pausePreference.checked && !document.hidden;
  function sync() {
    document.body.classList.toggle('ambient', !reduced.matches && !conserve);
    document.body.classList.toggle('motion-paused',!allowed() || !heroVisible);
    if(!allowed()) {
      document.querySelectorAll('.demo-cursor').forEach(cursor=>{
        cursor.getAnimations({subtree:true}).forEach(animation=>animation.cancel());
        cursor.style.display='none';
      });
    }
    for(const l of loops.values()) l.schedule();
  }
  function register(name, element, fn, delay=4800) {
    let timer, visible=false, paused=false, focused=false;
    function canRun(){return allowed() && visible && !paused && !focused;}
    function schedule(){clearTimeout(timer);if(canRun())timer=setTimeout(()=>{if(canRun())fn();schedule();},delay);}
    function setPaused(value=true){paused=value;schedule();}
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.15});
    observer.observe(element);
    element.addEventListener('focusin',()=>{focused=true;schedule();});
    element.addEventListener('focusout',()=>{queueMicrotask(()=>{focused=element.contains(document.activeElement);schedule();});});
    const loop={schedule,setPaused,canRun,get paused(){return paused;}};
    loops.set(name,loop);
    return loop;
  }
  new IntersectionObserver(es=>{heroVisible=es[0].isIntersecting;sync();}).observe(document.querySelector('.hero'));
  pausePreference.addEventListener('change',sync);
  reduced.addEventListener('change',sync);
  document.addEventListener('visibilitychange',sync);
  sync();
  return {register,allowed,instant:()=>reduced.matches||conserve};
}
