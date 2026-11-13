const ROOT='/api/minecraft/creations';
export function createCreationsClient({origin='https://forca-aliada-minecraft-beta.onrender.com',readToken=()=>sessionStorage.getItem('fa_directory_beta_token')||''}={}){
  if(origin&&!['https://forca-aliada-minecraft-beta.onrender.com'].includes(origin))throw Error('Origem de criações inválida.');
  async function request(path,{method='GET',body,headers={},signal,token=readToken()}={}){
    let response;try{response=await fetch(origin+ROOT+path,{method,credentials:origin?'omit':'same-origin',cache:'no-store',signal:signal?AbortSignal.any([signal,AbortSignal.timeout(25000)]):AbortSignal.timeout(25000),headers:{Accept:'application/json',...(token?{Authorization:'Bearer '+token}:{}),...(body&&!(body instanceof FormData)?{'Content-Type':'application/json'}:{}),...headers},...(body?{body:body instanceof FormData?body:JSON.stringify(body)}:{})});}
    catch{throw Error('Não foi possível conectar às criações. Tente novamente.');}
    const data=await response.json().catch(()=>({error:'O serviço não respondeu como esperado.'}));
    if(!response.ok)throw Object.assign(new Error(data.error),{code:data.code,status:response.status});return data;
  }
  const params=values=>new URLSearchParams(Object.entries(values).filter(([,v])=>v!==''&&v!==undefined));
  return {
    list:(values={},signal)=>request('/items?'+params(values),{signal}),
    mine:(values={})=>request('/mine?'+params(values)),
    favoriteIds:()=>request('/favorite-ids'),
    favorites:(values={})=>request('/favorites?'+params(values)),
    profile:(name,values={})=>request('/profiles/'+encodeURIComponent(name)+'?'+params(values)),
    get:id=>request('/items/'+encodeURIComponent(id)),
    save:async(entry,kind='skin')=>{const token=readToken(),form=new FormData();const {image,...metadata}=entry;form.append('metadata',JSON.stringify({...metadata,kind}));if(entry.image?.startsWith('data:image/png;base64,')){const blob=await fetch(entry.image).then(r=>r.blob());form.append('file',blob,'creation.png');}
      const updating=Boolean(entry.revision);return request('/items'+(updating?'/'+entry.id:''),{method:updating?'PATCH':'POST',body:form,token,headers:updating?{'If-Match':String(entry.revision)}:{'Idempotency-Key':entry.creationKey}});},
    remove:entry=>request('/items/'+entry.id,{method:'DELETE',headers:{'If-Match':String(entry.revision)}}),
    favorite:(id,on)=>request('/favorites/'+id,{method:on?'PUT':'DELETE'}),
    accounts:()=>request('/accounts'),
    current:id=>request('/accounts/'+id+'/skin'),
    apply:(entry,integrationId)=>request('/items/'+entry.id+'/apply',{method:'POST',body:{confirmed:true,integrationId,revision:entry.revision}}),
    microsoftStart:proof=>request('/microsoft/start',{method:'POST',body:{proof}}),
    microsoftStatus:(id,proof)=>request('/microsoft/status',{method:'POST',body:{id,proof}}),
    microsoftConfirm:(id,proof)=>request('/microsoft/confirm',{method:'POST',body:{id,proof,confirmed:true}}),
    microsoftCancel:(id,proof)=>request('/microsoft/cancel',{method:'POST',body:{id,proof}}),
    microsoftDisconnect:id=>request('/microsoft/accounts/'+id,{method:'DELETE',body:{confirmed:true}}),
  };
}
