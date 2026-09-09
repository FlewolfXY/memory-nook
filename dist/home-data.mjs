import {storyExamples,pondExamples} from './demo-memories.mjs';
import {defaultBindings,allLayoutIds,stableId,migrateLayout,migrateAttachments,validBindings} from './furnishing-data.mjs';
import {validTransform} from './editor.mjs';
const photoPaths=new Set([...storyExamples,...pondExamples].map(r=>r.image));
export const safePhoto=image=>!image||typeof image==='string'&&(photoPaths.has(image)||/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image));
export function normalizeHome(data,{seedStories=false}={}){
  const home={records:migrateAttachments(structuredClone(data.records||[])),layout:migrateLayout(data.layout||{}),bindings:Object.fromEntries(Object.entries(data.bindings||{}).map(([k,v])=>[stableId(k),v])),edition:2,gardenVersion:2};
  if(data.gardenVersion!==2){
    for(const [id,t]of Object.entries(home.layout))if(id.startsWith('courtyard/')&&!t.parent){t.position[0]*=2;t.position[2]*=1.65;}
    for(const r of home.records)if(r.spot?.startsWith('garden-')&&r.position){r.position[0]*=2;r.position[2]*=1.65;}
  }
  if(seedStories){
    for(const r of storyExamples)if(!home.records.some(x=>x.id===r.id)&&home.records.length<1000)home.records.push(structuredClone(r));
    for(const [id,source]of Object.entries(defaultBindings))if(!Object.hasOwn(home.bindings,id)&&home.records.some(r=>r.id===source&&r.example))home.bindings[id]=source;
  }
  return enforceSingleObject(home);
}
export function seedPondExamples(home){for(const r of pondExamples)if(!home.records.some(x=>x.id===r.id)&&home.records.length<1000)home.records.push(structuredClone(r));return enforceSingleObject(home);}
// Source records remain intact; only their display associations are exclusive.
export const photoKey=r=>r.image||'record:'+r.id;
export function detachSource(home,id){
  const source=home.records.find(r=>r.id===id);if(!source)throw Error('找不到这段记忆');
  const same=new Set(home.records.filter(r=>photoKey(r)===photoKey(source)).map(r=>r.id));
  for(const r of home.records)if(same.has(r.id))r.spot=null;
  for(const [prop,sourceId]of Object.entries(home.bindings))if(same.has(sourceId))delete home.bindings[prop];
}
export function bindStory(home,prop,id){detachSource(home,id);home.bindings[prop]=id;}
export function placeStory(home,id,placement){detachSource(home,id);Object.assign(home.records.find(r=>r.id===id),placement);}
export function enforceSingleObject(home){
  const sources=new Map(home.records.map(r=>[r.id,r])),seen=new Set();
  // Existing standalone keepsakes win migration conflicts. Never alter furniture transforms.
  for(const r of home.records)if(r.spot){const key=photoKey(r);if(seen.has(key))r.spot=null;else seen.add(key);}
  const entries=Object.entries(home.bindings).sort(([a,x],[b,y])=>{
    // Prefer a user's non-default association, then the designated demo book.
    const rank=(p,id)=>!sources.get(id)?.example||!id.startsWith('story-')?0:defaultBindings[p]===id?1:2;
    return rank(a,x)-rank(b,y);
  });
  const bindings={};
  for(const [prop,id]of entries){const r=sources.get(id);if(!r)continue;const key=photoKey(r);if(seen.has(key))continue;seen.add(key);bindings[prop]=id;}
  home.bindings=bindings;return home;
}
export function upgradeStories(home,edition){
  if(edition!==1)return home;
  // A deliberately cleared demo stays cleared. Add new cushion examples only to
  // cushions that still carried one of the old repeated demo sources.
  const additions=Object.entries(defaultBindings).filter(([p])=>p.includes('cushion'));
  for(const [prop,id]of additions){const old=home.records.find(r=>r.id===home.bindings[prop]);
    if(!old?.example||!old.id.startsWith('story-'))continue;
    const sample=storyExamples.find(r=>r.id===id);if(!sample)continue;
    if(!home.records.some(r=>r.id===id)&&home.records.length<1000)home.records.push(structuredClone(sample));
    if(home.records.some(r=>r.id===id))home.bindings[prop]=id;
  }
  return home;
}
export function validBackup(data){
  if(![1,2].includes(data?.version)||!Array.isArray(data.records)||data.records.length>1000)return false;
  const ids=new Set(),forms=['card','frame','lamp','clay','fish'],spots=['table','window','shelf','cabinet','bookshelf','side','garden-table','garden-bench','pond'];
  for(const r of data.records){
    if(!r||typeof r.id!=='string'||!/^[-a-zA-Z0-9]{1,80}$/.test(r.id)||ids.has(r.id)||typeof r.title!=='string'||r.title.length>80||typeof r.note!=='string'||r.note.length>1000||typeof r.date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||!forms.includes(r.form)||(r.spot&&!spots.includes(r.spot))||!Array.isArray(r.palette)||r.palette.length!==3||!r.palette.every(c=>/^#[a-f0-9]{6}$/i.test(c))||!Number.isFinite(r.rotation)||!Number.isFinite(r.scale)||r.scale<.1||r.scale>2||!Array.isArray(r.parents)||!safePhoto(r.image))return false;
    if(r.spot&&(r.form==='fish')!==(r.spot==='pond'))return false;
    for(const key of ['position','localPosition'])if(r[key]&&(!Array.isArray(r[key])||r[key].length!==3||!r[key].every(n=>Number.isFinite(n)&&Math.abs(n)<30)))return false;
    if(r.parentId&&!allLayoutIds.includes(stableId(r.parentId)))return false;
    if(r.photoCredit&&(!(typeof r.photoCredit.creator==='string'&&r.photoCredit.creator.length<160)||typeof r.photoCredit.url!=='string'||!/^https:\/\//.test(r.photoCredit.url)||r.photoCredit.url.length>1000))return false;
    ids.add(r.id);
  }
  const records=new Map(data.records.map(r=>[r.id,r])),active=new Set(),done=new Set();
  const visit=id=>{if(done.has(id))return true;if(active.has(id)||!records.has(id))return false;active.add(id);for(const p of records.get(id).parents)if(!visit(p))return false;active.delete(id);done.add(id);return true;};
  if(!data.records.every(r=>visit(r.id)))return false;
  if(data.layout){if(typeof data.layout!=='object'||Array.isArray(data.layout))return false;const layout=migrateLayout(data.layout);for(const [id,t]of Object.entries(layout)){if(!allLayoutIds.includes(id)||!validTransform(t)||(t.parent&&!allLayoutIds.includes(t.parent)))return false;const chain=new Set([id]);for(let p=t.parent;p;p=layout[p]?.parent){if(chain.has(p))return false;chain.add(p);}}}
  return data.bindings===undefined||validBindings(data.bindings,data.records);
}
export async function portableBackup(home,readPhoto){
  const data=structuredClone({version:2,gardenVersion:2,records:home.records,layout:home.layout,bindings:home.bindings}),photos=new Map();
  await Promise.all(data.records.map(async r=>{if(photoPaths.has(r.image)){const path=r.image;if(!photos.has(path))photos.set(path,readPhoto(path));r.image=await photos.get(path);if(!r.image?.startsWith('data:image/')||!safePhoto(r.image))throw Error('照片未能完整打包');}}));
  return data;
}
