import assert from 'node:assert/strict';
import {createPublicCatalog} from '../directory-catalog.mjs';
const saved=new Map(),queries=[];let releaseOld;
const catalog=createPublicCatalog({remember:row=>saved.set(row.id,row),client:{list:async(params,signal)=>{queries.push(params);if(params.q==='old')return new Promise(resolve=>releaseOld=()=>resolve({rows:[{id:'old'}],nextOffset:null}));if(params.q==='new')return {rows:[{id:'new'}],nextOffset:null};return params.offset?{rows:[{id:'second'}],nextOffset:null}:{rows:[{id:'first'}],nextOffset:24};}}});
await catalog.sync({},{immediate:true});assert.deepEqual([...catalog.state.ids],['first']);await catalog.more();assert.deepEqual([...catalog.state.ids],['first','second']);assert.equal(catalog.state.nextOffset,null);
const stale=catalog.sync({q:'old'},{immediate:true});await catalog.sync({q:'new'},{immediate:true});releaseOld();await stale;assert.deepEqual([...catalog.state.ids],['new']);assert.equal(saved.has('old'),false);
await catalog.sync({q:'vanilla',mode:'Survival',edition:'Java',feature:'Vanilla',language:'Português',access:'open'},{immediate:true});assert.equal(queries.at(-1).category,'Survival');assert.equal(queries.at(-1).feature,'Vanilla');
console.log('Public catalog: paging, filter forwarding and cancellation/stale response isolation passed.');
