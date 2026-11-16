import {build} from 'esbuild';
import {readdir,rm,readFile,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const result=await build({absWorkingDir:root,entryPoints:['src/hero.js'],bundle:true,minify:true,format:'esm',splitting:true,outdir:'build',entryNames:'[name]-[hash]',chunkNames:'chunks/[name]-[hash]',legalComments:'eof',metafile:true});
const current=new Set(Object.keys(result.metafile.outputs).map(p=>resolve(root,p)));
const chunkDir=resolve(root,'build/chunks');
for(const name of await readdir(chunkDir)) {
  const path=resolve(chunkDir,name);
  if(name.endsWith('.js')&&!current.has(path))await rm(path);
}
for(const name of await readdir(resolve(root,'build'))){const path=resolve(root,'build',name);if(name.endsWith('.js')&&!current.has(path))await rm(path);}
const entry=Object.keys(result.metafile.outputs).find(p=>result.metafile.outputs[p].entryPoint==='src/hero.js');
let html=await readFile(resolve(root,'index.html'),'utf8');
html=html.replace(/src="build\/hero[^"/]*\.js"/,`src="${entry}"`);
for(const file of ['home.css','cinema.css','platform-home.css','home.js']){
  const version=createHash('sha256').update(await readFile(resolve(root,file))).digest('hex').slice(0,10);
  html=html.replace(new RegExp(`((?:href|src)=")${file.replace('.','\\.')}(?:\\?[^\"]*)?"`),`$1${file}?v=${version}"`);
}
await writeFile(resolve(root,'index.html'),html);
for(const [path,info] of Object.entries(result.metafile.outputs))console.log(`${path}: ${(info.bytes/1024).toFixed(1)} KB`);
