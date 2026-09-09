import fs from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {storyExamples} from '../dist/demo-memories.mjs';
import {assetURL} from '../dist/asset-url.mjs';
const root=new URL('../dist/',import.meta.url), files=await fs.readdir(root);
for(const name of files.filter(x=>x.endsWith('.mjs'))){
 const path=new URL(name,root),body=await fs.readFile(path,'utf8');
 assert.equal(spawnSync(process.execPath,['--check',path.pathname]).status,0,name);
 for(const [,ref]of body.matchAll(/from\s+['"]([^'"]+)['"]/g))await fs.access(new URL(ref,path));
}
const html=await fs.readFile(new URL('index.html',root),'utf8');
for(const [,ref]of html.matchAll(/(?:src|href)="([^"]+)"/g))if(!ref.startsWith('#')){assert.ok(ref.startsWith('./'));await fs.access(new URL(ref,root));}
for(const r of storyExamples){await fs.access(new URL('.'+r.image,root));assert.ok(assetURL(r.image,'https://example.github.io/memory-nook/asset-url.mjs').startsWith('https://example.github.io/memory-nook/assets/'));}
console.log('Entrypoints, module syntax, imports and bundled photo paths passed.');
