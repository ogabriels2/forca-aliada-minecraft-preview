export const LEGACY_SKIN_DRAFT='fa-skin-studio-v1';
export function skinDraftKey(userId){
 if(userId===undefined||userId===null||userId==='')return LEGACY_SKIN_DRAFT;
 const id=Number(userId);if(!Number.isSafeInteger(id)||id<1)throw Error('Conta inválida para o rascunho.');
 return 'fa-skin-studio-v2-account-'+id;
}
// A session keeps its original owner even when sign-out happens before the
// editor is disposed. Guest drafts can seed a first visit, never the reverse.
export function createSkinDraftSession(storage,userId){
 const key=skinDraftKey(userId);let expected=storage.getItem(key);
 return {
  key,
  read:()=>expected??(key!==LEGACY_SKIN_DRAFT?storage.getItem(LEGACY_SKIN_DRAFT):null),
  write(value){
   if(storage.getItem(key)!==expected)throw Object.assign(new Error('Alterado em outra aba. Baixe este PNG e reabra o editor.'),{code:'SKIN_DRAFT_CONFLICT'});
   storage.setItem(key,value);expected=value;
  },
 };
}
