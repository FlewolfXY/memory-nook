import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {normalizeHome,validBackup,portableBackup,enforceSingleObject,photoKey} from '../dist/home-data.mjs';
import {upgradePersonalHome,personalPhotoPaths,residentLinks} from '../dist/personal-home.mjs';
import {keepsake} from '../dist/room.mjs';

test('personal demo has one resident, unique photo objects, linked stories and portable souvenirs',async()=>{
 const home=normalizeHome({records:[]},{seedStories:true});upgradePersonalHome(home);enforceSingleObject(home);
 assert.equal(home.records.filter(r=>r.personalEdition).length,20);
 assert.equal(home.records.filter(r=>r.generatedImage).length,3);
 assert.equal(home.bindings['living-room/cup'],'story-coffee');assert.equal(home.bindings['living-room/wall-frame-1'],'story-flowers');
 const displays=[...home.records.filter(r=>r.spot).map(photoKey),...Object.values(home.bindings).map(id=>photoKey(home.records.find(r=>r.id===id)))];assert.equal(new Set(displays).size,displays.length);
 const saved=structuredClone(home);upgradePersonalHome(home,1);assert.deepEqual(home,saved);
 for(const targets of Object.values(residentLinks))for(const id of targets)assert.ok(home.records.some(r=>r.id===id));
 for(const form of ['box','tote','rabbit']){const r=home.records.find(r=>r.form===form);assert.ok(r?.spot);keepsake(r).traverse(o=>{if(o.geometry)assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));});}
 const backup=await portableBackup(home,async path=>'data:image/jpeg;base64,'+(await fs.readFile(new URL('../dist'+path,import.meta.url))).toString('base64'));
 assert.ok(validBackup(backup));assert.ok(backup.records.filter(r=>r.generatedImage).every(r=>r.image.startsWith('data:image/jpeg;base64,')));
 assert.equal(personalPhotoPaths.length,3);
});
test('personal demo migration preserves edited notes, palettes, associations and cleared homes',()=>{
 const home=normalizeHome({records:[]},{seedStories:true});home.records[0].note='我自己的搬家记忆';home.records[1].palette=['#123456','#654321','#ababab'];
 home.bindings['living-room/window-cushion-left']='story-forest';delete home.bindings['living-room/book-08'];
 const mine=structuredClone(home.records.slice(0,3));upgradePersonalHome(home);assert.deepEqual(home.records.slice(0,3),mine);
 assert.equal(home.bindings['living-room/window-cushion-left'],'story-forest');
 const empty={records:[],layout:{},bindings:{}};upgradePersonalHome(empty);assert.deepEqual(empty,{records:[],layout:{},bindings:{}});
});
