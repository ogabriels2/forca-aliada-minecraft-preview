export function createServerActivity(api){
  const inflight=new Set();
  const supported=server=>server&&!server.example&&(server.id==='forca-aliada'||/^[a-f0-9-]{36}$/i.test(server.id));
  function view(server){
    if(!supported(server)||document.visibilityState!=='visible')return;
    const key='fa-page-visit:'+server.id;
    if(inflight.has(key))return;
    let saved;
    try{saved=JSON.parse(sessionStorage.getItem(key)||'null');}catch{}
    if(saved?.sent&&saved.at>Date.now()-1800000)return;
    const visit=saved?.at>Date.now()-1800000?saved:{eventId:crypto.randomUUID(),at:Date.now()};
    try{sessionStorage.setItem(key,JSON.stringify(visit));}catch{}
    inflight.add(key);
    void api.activity(server.id,{eventId:visit.eventId,type:'view'}).then(()=>{
      try{sessionStorage.setItem(key,JSON.stringify({...visit,sent:true}));}catch{}
    }).catch(()=>{}).finally(()=>inflight.delete(key));
  }
  function copied(server,edition){
    if(!supported(server)||!server.editions.includes(edition))return;
    void api.activity(server.id,{eventId:crypto.randomUUID(),type:'copy',edition}).catch(()=>{});
  }
  return {view,copied};
}
