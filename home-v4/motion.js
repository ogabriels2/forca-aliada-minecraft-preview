// One motion policy for every demonstration. No work on hidden pages/sections.
export function setupMotion() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const conserve = Boolean(navigator.connection?.saveData || (navigator.deviceMemory && navigator.deviceMemory < 4));
  const loops = new Map();
  let globalPaused = false, heroVisible = false;
  const globalButton = document.querySelector('#motion-toggle');
  const allowed = () => !reduced.matches && !conserve && !globalPaused && !document.hidden;
  const renderControl = (button,paused,name) => {
    button.setAttribute('aria-pressed',String(paused));
    button.setAttribute('aria-label',`${paused?'Retomar':'Pausar'} ${name}`);
    button.title = button.getAttribute('aria-label');
    button.querySelector('use')?.setAttribute('href',paused?'#play':'#pause');
  };
  function sync() {
    document.body.classList.toggle('ambient', !reduced.matches && !conserve);
    document.body.classList.toggle('motion-paused',!allowed() || !heroVisible);
    globalButton.hidden = reduced.matches || conserve;
    renderControl(globalButton,globalPaused,'movimento');
    globalButton.querySelector('span').textContent = globalPaused?'Retomar movimento':'Pausar movimento';
    document.querySelectorAll('[data-loop-toggle]').forEach(button=>button.hidden=reduced.matches||conserve);
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
    const control = document.querySelector(`[data-loop-toggle="${name}"]`);
    function canRun(){return allowed() && visible && !paused && !focused;}
    function schedule(){clearTimeout(timer);if(canRun())timer=setTimeout(()=>{if(canRun())fn();schedule();},delay);}
    function setPaused(value=true){paused=value;if(control)renderControl(control,paused,`demonstração ${name==='manager'?'do Manager':name==='catalog'?'do catálogo':'do Community'}`);schedule();}
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.15});
    observer.observe(element);
    element.addEventListener('focusin',()=>{focused=true;schedule();});
    element.addEventListener('focusout',()=>{queueMicrotask(()=>{focused=element.contains(document.activeElement);schedule();});});
    control?.addEventListener('click',()=>setPaused(!paused));
    const loop={schedule,setPaused,canRun,get paused(){return paused;}};
    loops.set(name,loop);if(control)control.hidden=reduced.matches||conserve;return loop;
  }
  new IntersectionObserver(es=>{heroVisible=es[0].isIntersecting;sync();}).observe(document.querySelector('.hero'));
  globalButton.addEventListener('click',()=>{globalPaused=!globalPaused;sync();});
  reduced.addEventListener('change',sync);
  document.addEventListener('visibilitychange',sync);
  sync();
  return {register,allowed,instant:()=>reduced.matches||conserve};
}
