let adapter=null,identity=null,version=0,inflight=null;
let state={phase:'guest',data:null,error:''};
let available=null,updating=false;
const listeners=new Set();
const emit=()=>{for(const listener of listeners)listener(state);};
export const communityConnection={
  get state(){return state;},
  get available(){return available;},
  setAvailable(value){if(value!==available){available=value;emit();}},
  subscribe(listener){listeners.add(listener);listener(state);return()=>listeners.delete(listener);},
  bind(account,nextAdapter){
    adapter=nextAdapter;
    const id=account?.id??null;
    if(id===identity&&state.phase!=='guest')return;
    identity=id;++version;inflight=null;updating=false;state={phase:id?'loading':'guest',data:null,error:''};emit();
    if(id)void this.refresh();
  },
  async refresh(){
    if(!identity||!adapter||updating)return;
    if(inflight)return inflight;
    const request=version,account=identity;
    inflight=(async()=>{
      try{const data=await adapter.load();if(request!==version||identity!==account)return;state={phase:data.connected?'connected':'disconnected',data:data.connected?data:null,error:'',expired:data.expired===true};}
      catch(error){if(request!==version||identity!==account)return;state={phase:'error',data:null,error:error.message||'Não foi possível carregar o Community.'};}
      finally{if(request===version){inflight=null;emit();}}
    })();
    return inflight;
  },
  connect(){return adapter?.connect();},
  async markRead(ids){
    if(state.phase!=='connected'||!ids.length||updating)return;
    updating=true;
    const request=++version;inflight=null;
    try {
      await adapter.read(ids);
      if(request!==version)return;
      const changed=state.data.notifications.filter(row=>ids.includes(row.id)&&!row.read).length;
      state={...state,data:{...state.data,unreadCount:Math.max(0,state.data.unreadCount-changed),notifications:state.data.notifications.map(row=>ids.includes(row.id)?{...row,read:true}:row)}};
      emit();
    } finally { if(request===version)updating=false; }
  },
  async disconnect(){
    if(updating)return;
    updating=true;
    const previous=state;const request=++version;inflight=null;
    state={phase:'disconnecting',data:null,error:''};emit();
    try{await adapter.disconnect();if(request!==version)return;state={phase:'disconnected',data:null,error:''};emit();}
    catch(error){if(request===version){state={...previous,error:error.message};emit();}throw error;}
    finally{if(request===version)updating=false;}
  },
};
document.addEventListener('visibilitychange',()=>{if(!document.hidden)void communityConnection.refresh();});
setInterval(()=>{if(!document.hidden)void communityConnection.refresh();},60_000);
