// Public search only: a cancelled/older request must never replace a newer query.
export function createPublicCatalog({client,remember,onChange=()=>{}}){
  let current={key:'',ids:new Set(),loading:false,error:null,nextOffset:null,loaded:false};
  let params={},controller,timer,version=0;
  const query=filters=>Object.fromEntries(Object.entries({q:filters.q||'',edition:filters.edition||'',category:filters.mode||'',feature:filters.feature||'',language:filters.language||'',access:filters.access||'',sort:['name','rating'].includes(filters.sort)?filters.sort:''}).filter(([,v])=>v));
  function changed(){queueMicrotask(onChange);}
  async function load({append=false}={}){
    const generation=++version;controller?.abort();controller=new AbortController();
    const signal=controller.signal,offset=append?current.nextOffset:0;
    current={...current,loading:true,error:null};changed();
    try{
      const result=await client.list({...params,limit:24,offset},signal);
      if(signal.aborted||generation!==version)return;
      const ids=append?new Set(current.ids):new Set();
      for(const page of result.rows){remember(page);ids.add(page.id);}
      current={...current,ids,loaded:true,nextOffset:result.nextOffset};
    }catch(error){if(signal.aborted||generation!==version)return;current={...current,error};}
    finally{if(generation===version){current={...current,loading:false};changed();}}
  }
  return {
    get state(){return current;},
    sync(filters,{immediate=false,force=false}={}){
      if(filters.favorites||filters.recent)return;
      const next=query(filters),key=JSON.stringify(next);
      if(!force&&key===current.key)return;
      clearTimeout(timer);controller?.abort();++version;params=next;
      current={key,ids:new Set(),loading:true,error:null,nextOffset:null,loaded:false};
      changed();if(immediate)return load();timer=setTimeout(()=>void load(),250);
    },
    more(){if(!current.loading&&current.nextOffset!==null)return load({append:true});},
    retry(){clearTimeout(timer);return load();},
  };
}
