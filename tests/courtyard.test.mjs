import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {buildRoom,spots} from '../dist/room.mjs';
import {buildCourtyard,Pond} from '../dist/courtyard.mjs';
import {courtyardIds,spotSpace} from '../dist/spaces.mjs';
import {LayoutEditor} from '../dist/editor.mjs';
import {makeSwimmer,stepSwimmer,beckon,inside} from '../dist/pond-state.mjs';
import {normalizeHome,placeStory,validBackup} from '../dist/home-data.mjs';
import {storyExamples} from '../dist/demo-memories.mjs';

test('garden identities and local parent transforms survive the same editor snapshot',()=>{
 const room=buildRoom(),yard=buildCourtyard(),e=Object.create(LayoutEditor.prototype);e.room={room,yard};e.items=new Map();for(const root of [room,yard])root.traverse(o=>{if(o.userData.layoutId)e.items.set(o.userData.layoutId,o);if(o.geometry)assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));});e.defaults=e.snapshot();
 assert.equal(e.items.size,56);assert.ok(courtyardIds.every(id=>e.items.has(id)));
 const saved=e.snapshot();saved['courtyard/bench'].position[0]+=.25;e.apply(saved);assert.equal(e.items.get('courtyard/seat-cushion').parent,e.items.get('courtyard/bench'));assert.deepEqual(e.snapshot(),saved);assert.equal(e.items.get('courtyard/table').parent,yard);
 for(const s of spots.filter(s=>s.space==='courtyard'))assert.ok(e.items.has(s.owner));
});

test('tapping ten times preserves resident identity and finite bounded motion',()=>{
 const a=makeSwimmer('my-memory'),b=makeSwimmer('other-memory'),all=[a,b];assert.deepEqual(makeSwimmer('my-memory'),a);
 for(let i=0;i<10;i++){const id=beckon(all,12,-15,i*.1);assert.ok(all.some(s=>s.id===id));}
 assert.equal(all.length,2);
 for(let frame=0;frame<2400;frame++)for(const s of all){const old={...s};stepSwimmer(s,frame/60,1/60);assert.ok(inside(s.x,s.z,.73));assert.ok(Math.hypot(s.x-old.x,s.z-old.z)<=.5/60+1e-8);assert.ok(Number.isFinite(s.heading));}
 assert.ok(all.every(s=>s.target===null));
});

test('chosen resident approaches the target before resuming its route',()=>{
 const s=makeSwimmer('arrival');beckon([s],1.1,1.1,0);const before=Math.hypot(s.x-s.target.x,s.z-s.target.z);
 for(let i=0;i<240;i++)stepSwimmer(s,i/60,1/60);
 assert.ok(Math.hypot(s.x-s.target.x,s.z-s.target.z)<Math.min(.05,before));
});

test('pond source survives backup, converts exclusively from a book and does not grow on tap',()=>{
 const home=normalizeHome({records:storyExamples},{seedStories:true}),id='story-sea';home.records.find(r=>r.id===id).form='fish';placeStory(home,id,{spot:'pond',parentId:null,position:null,localPosition:null});
 assert.ok(!Object.values(home.bindings).includes(id));assert.ok(validBackup({version:2,...home}));const restored=normalizeHome(JSON.parse(JSON.stringify(home)));assert.deepEqual(restored,home);
 const root=new T.Group(),pond=new Pond(root);pond.sync(home.records);assert.equal(pond.residents.size,1);const resident=pond.residents.get(id);pond.sync(restored.records);assert.equal(pond.residents.get(id),resident);
 for(let i=0;i<10;i++){pond.tap(.8,.6);pond.update(i*.2,.016,false);}assert.equal(pond.residents.size,1);assert.equal(pond.ripples.length,6);assert.equal(home.records.length,12);
 const bad=structuredClone(home);bad.records.find(r=>r.id===id).spot='table';assert.equal(validBackup({version:2,...bad}),false);assert.equal(spotSpace('pond'),'courtyard');
});
