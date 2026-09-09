// Read-only diagnostics for the audited implementation. Uses synthetic fixtures only.
// This is not a passing regression suite: false result flags describe open defects.
import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {restoreMomentExamples} from '../dist/rollback-home.mjs';
import {portableBackup,validBackup} from '../dist/home-data.mjs';
import {storyExamples,pondExamples} from '../dist/demo-memories.mjs';
import {defaultBindings,legacyIds,visibleObject} from '../dist/furnishing-data.mjs';
import {buildRoom} from '../dist/room.mjs';
import {buildCourtyard} from '../dist/courtyard.mjs';

const fixture=JSON.parse(await fs.readFile(new URL('../tests/rejected-home.json',import.meta.url)));
const dateHome=structuredClone(fixture);
dateHome.records[0].date='2024-04-03';
restoreMomentExamples(dateHome,1);
const rotationHome=structuredClone(fixture);
rotationHome.records[0].rotation=1.25;
restoreMomentExamples(rotationHome,1);
const records=Array.from({length:1001},(_,i)=>({...structuredClone(storyExamples[0]),id:'audit-'+i,image:null,example:false}));
const backup=await portableBackup({records,layout:{},bindings:{}},()=>{throw Error('No image expected');});
const longSource={...structuredClone(storyExamples[0]),id:'audit-long',note:'记'.repeat(1001)};
const room=buildRoom(),yard=buildCourtyard();
const items=[];for(const root of [room,yard])root.traverse(o=>{if(o.userData.layoutId)items.push(o);});
for(const r of [...storyExamples,...pondExamples])await fs.access(new URL('../dist'+r.image,import.meta.url));
let sourceCommit=null;
try{sourceCommit=execFileSync('git',['rev-parse','HEAD'],{cwd:new URL('..',import.meta.url),encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();}catch{/* Exported source archives may not include Git history. */}
const result={
  recordedAt:new Date().toISOString(),
  sourceCommit,
  method:'Node pure-data diagnostics and geometry construction; no browser, GPU or private records',
  inventory:{layoutIdentities:items.length,legacyIdentities:legacyIds.length,visibleFurnishings:items.filter(visibleObject).length,photoStories:storyExamples.length,pondPhotoStories:pondExamples.length,defaultPhotoBindings:Object.keys(defaultBindings).length,distinctDefaultPhotos:new Set([...storyExamples,...pondExamples].map(r=>r.image)).size,allDefaultPhotoPathsReadable:true},
  rollback:{edition:1,dateOnlyEditPreserved:dateHome.records[0].date==='2024-04-03',dateAfter:dateHome.records[0].date,rotationOnlyEditPreserved:rotationHome.records[0].rotation===1.25,rotationAfter:rotationHome.records[0].rotation},
  roundTrip:{exportedRecordCount:backup.records.length,exportAcceptedByImporter:validBackup(backup),note1001AcceptedByImporter:validBackup({version:2,records:[longSource],layout:{},bindings:{}})},
  sizeBoundary:{tenMaximumPhotosBase64MiB:10*Math.ceil(8*1024*1024/3)*4/1024/1024,importFileLimitMiB:100,method:'Arithmetic from current 8 MiB photo and 100 MiB import limits; not a browser quota test'}
};
console.log(JSON.stringify(result,null,2));
