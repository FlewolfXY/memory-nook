import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import * as T from '../dist/vendor/three.module.js';
import {buildRoom} from '../dist/room.mjs';
import {LayoutEditor} from '../dist/editor.mjs';
import {FurnishingStories} from '../dist/furnishings.mjs';
import {legacyIds,stableId,defaultBindings,visibleObject} from '../dist/furnishing-data.mjs';
import {storyExamples} from '../dist/demo-memories.mjs';
import {normalizeHome,validBackup,portableBackup,bindStory,placeStory,upgradeStories,photoKey} from '../dist/home-data.mjs';
const fixture=JSON.parse(await fs.readFile(new URL('./legacy-layout.json',import.meta.url)));
function fixtureEditor(){const root=buildRoom(),e=Object.create(LayoutEditor.prototype);e.room={room:root,models:new Map()};e.items=new Map();root.traverse(o=>{if(o.userData.layoutId)e.items.set(o.userData.layoutId,o);});e.defaults=e.snapshot();return e;}
function close(a,b){assert.equal(a.length,b.length);a.forEach((v,i)=>assert.ok(Math.abs(v-b[i])<1e-5,`${i}: ${v} != ${b[i]}`));}

test('all 48 legacy objects retain their world transforms after identity migration',()=>{
 const e=fixtureEditor(),home=normalizeHome({records:[],layout:fixture.layout});e.apply(home.layout);
 assert.equal(e.items.size,48);assert.equal(new Set(legacyIds).size,48);
 for(const [id,t]of Object.entries(fixture.layout))close(e.items.get(stableId(id)).matrixWorld.toArray(),t.world);
 assert.equal([...e.items.values()].filter(o=>o.userData.furnishingKind==='book'&&visibleObject(o)).length,8);
});

test('a moved old extra book and any keepsake attached to it survive the smaller bookcase',()=>{
 const layout=structuredClone(fixture.layout);layout['item-5'].position[0]+=.42;
 const original={...storyExamples[0],id:'mine',example:false,image:'data:image/png;base64,AAAA',parentId:'item-5',localPosition:[.05,.1,0],position:[1,2,3],note:'我的原文\n🪷保持原样'};
 const home=normalizeHome({records:[original],layout}),e=fixtureEditor();e.apply(home.layout);
 assert.equal(e.items.get(stableId('item-5')).visible,true);assert.equal(home.records[0].parentId,stableId('item-5'));assert.equal(home.records[0].note,original.note);assert.equal(home.records[0].image,original.image);close(home.records[0].localPosition,original.localPosition);
 const o=new T.Group();e.room.models.set('mine',o);e.records=home.records;e.restoreMemoryParents();assert.equal(o.parent,e.items.get(stableId('item-5')));close(o.position.toArray(),original.localPosition);
});

test('twelve default objects have twelve distinct photographs, including eight books',()=>{
 const e=fixtureEditor(),stories=new FurnishingStories(e.room.room);stories.photo=()=>{};stories.apply(storyExamples,defaultBindings);
 e.room.room.traverse(o=>{if(o.geometry)for(const attr of Object.values(o.geometry.attributes))assert.ok(attr.array.every(Number.isFinite));});
 const visible=[...e.items.values()].filter(visibleObject),books=visible.filter(o=>o.userData.furnishingKind==='book');assert.equal(visible.length,32);assert.equal(books.length,8);assert.equal(new Set(books.map(o=>o.userData.traceId)).size,8);
 const traced=visible.filter(o=>o.userData.traceId);assert.equal(traced.length,12);assert.equal(new Set(traced.map(o=>o.userData.traceId)).size,12);assert.equal(new Set(storyExamples.map(r=>r.image)).size,12);for(const o of traced){const r=storyExamples.find(r=>r.id===o.userData.traceId);assert.ok(r?.image);assert.ok(r?.photoCredit?.url);}
});

test('binding a personal photo to one cushion does not recolor its sofa or another cushion',()=>{
 const e=fixtureEditor(),stories=new FurnishingStories(e.room.room);stories.photo=()=>{};stories.apply(storyExamples,defaultBindings);
 const colors=()=>Object.fromEntries([...e.items].map(([id,o])=>[id,o.userData.tintMeshes.map(m=>m.material.color.getHexString())]));const before=colors(),id='living-room/sofa-cushion-left';
 const own={...storyExamples[0],id:'mine',example:false,palette:['#1b40c4','#c7b9eb','#353f80']};stories.apply([...storyExamples,own],{...defaultBindings,[id]:'mine'});const after=colors();assert.notDeepEqual(after[id],before[id]);for(const other of legacyIds.filter(x=>x!==id))assert.deepEqual(after[other],before[other]);assert.deepEqual(own.palette,['#1b40c4','#c7b9eb','#353f80']);
});

test('the portable backup embeds the exact photo files and restores sources, layouts and bindings',async()=>{
 const home=normalizeHome({records:[],layout:fixture.layout},{seedStories:true});
 const read=async path=>'data:image/jpeg;base64,'+(await fs.readFile(new URL('../dist'+path,import.meta.url))).toString('base64');
 const exported=await portableBackup(home,read);assert.ok(validBackup(exported));const restored=normalizeHome(JSON.parse(JSON.stringify(exported)));
 assert.deepEqual(restored.layout,home.layout);assert.deepEqual(restored.bindings,home.bindings);
 for(const r of restored.records){const source=storyExamples.find(x=>x.id===r.id);assert.equal(r.image,await read(source.image));assert.deepEqual(r.palette,source.palette);assert.equal(r.note,source.note);}
});

test('missing photos fail portable export instead of yielding an incomplete success',async()=>{
 await assert.rejects(portableBackup(normalizeHome({records:storyExamples}),async()=>{throw Error('offline');}),/offline/);
});

test('invalid photo URLs, dangling source links and dependency cycles are rejected on restore',()=>{
 const base={version:2,...normalizeHome({records:storyExamples,bindings:defaultBindings})};assert.ok(validBackup(base));
 const badPhoto=structuredClone(base);badPhoto.records[0].image='javascript:alert(1)';assert.equal(validBackup(badPhoto),false);
 const missing=structuredClone(base);missing.bindings[legacyIds[0]]='missing';assert.equal(validBackup(missing),false);
 const cycle=structuredClone(base);cycle.records[0].parents=[cycle.records[1].id];cycle.records[1].parents=[cycle.records[0].id];assert.equal(validBackup(cycle),false);
 const badLayout=structuredClone(base);badLayout.layout=normalizeHome({layout:fixture.layout}).layout;badLayout.layout[legacyIds[0]].parent=legacyIds[3];badLayout.layout[legacyIds[3]].parent=legacyIds[0];assert.equal(validBackup(badLayout),false);
 const old={version:1,records:[{...storyExamples[0],parentId:'item-0'}],layout:fixture.layout};assert.ok(validBackup(old));
});

test('migration is idempotent and clearing demo bindings stays cleared',()=>{
 const home=normalizeHome({records:[],layout:fixture.layout},{seedStories:true});assert.deepEqual(normalizeHome(home,{seedStories:true}),home);
 const cleared=normalizeHome({...home,bindings:{}});assert.deepEqual(cleared.bindings,{});assert.deepEqual(normalizeHome(cleared),cleared);
});

function uniqueDisplays(home){
 const keys=[...home.records.filter(r=>r.spot).map(photoKey),...Object.values(home.bindings).map(id=>photoKey(home.records.find(r=>r.id===id)))];
 assert.equal(keys.length,new Set(keys).size);
}
test('legacy repeated sources converge without deleting records or moving furniture',()=>{
 const original={records:structuredClone(storyExamples),layout:fixture.layout,bindings:{'living-room/window-bench':'story-sunset','living-room/book-01':'story-sunset','living-room/sofa':'story-forest','living-room/book-08':'story-forest'}};
 const home=normalizeHome(original);uniqueDisplays(home);assert.deepEqual(home.records,original.records);assert.equal(home.bindings['living-room/book-01'],'story-sunset');assert.equal(home.bindings['living-room/window-bench'],undefined);assert.deepEqual(normalizeHome(home),home);
});
test('choosing another object moves the source, including byte-identical photos under another record ID',()=>{
 const home=normalizeHome({records:storyExamples},{seedStories:true}),id=storyExamples[0].id;
 bindStory(home,'living-room/sofa-cushion-left',id);uniqueDisplays(home);assert.equal(home.bindings['living-room/book-01'],undefined);
 placeStory(home,id,{spot:'table',rotation:0});uniqueDisplays(home);assert.equal(home.bindings['living-room/sofa-cushion-left'],undefined);
 home.records.push({...structuredClone(home.records[0]),id:'same-photo-other-note',note:'原文保留',spot:null});
 bindStory(home,'living-room/cup','same-photo-other-note');uniqueDisplays(home);assert.equal(home.records[0].spot,null);assert.equal(home.records.at(-1).note,'原文保留');assert.equal(home.records.length,storyExamples.length+1);
});
test('new cushion examples replace old repeated samples once, without overriding personal or cleared bindings',()=>{
 const old={records:structuredClone(storyExamples.slice(0,8)),layout:{},bindings:{'living-room/window-cushion-left':'story-sunset','living-room/sofa-cushion-left':'mine'}};
 old.records.push({...structuredClone(storyExamples[0]),id:'mine',example:false,image:'data:image/png;base64,AAAA'});
 const home=normalizeHome(upgradeStories(old,1));uniqueDisplays(home);assert.equal(home.bindings['living-room/window-cushion-left'],'story-picnic');assert.equal(home.bindings['living-room/sofa-cushion-left'],'mine');assert.equal(home.bindings['living-room/window-cushion-right'],undefined);
 const cleared=normalizeHome(upgradeStories({records:[],layout:{},bindings:{}},1));assert.deepEqual(cleared.bindings,{});assert.equal(cleared.records.length,0);
});
