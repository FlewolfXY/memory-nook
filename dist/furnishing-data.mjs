import {courtyardIds} from './spaces.mjs';
// Explicit v1 identities. Keep this mapping when the geometry tree changes.
export const legacyIds=[
 'window-bench','window-cushion-left','window-cushion-right','bookcase',
 ...Array.from({length:24},(_,i)=>'book-'+String(i+1).padStart(2,'0')),
 'bookcase-plant','sofa','sofa-cushion-left','sofa-cushion-right','rug','coffee-table','table-books','cup','cabinet','cabinet-plant','keepsake-shelf','shelf-plant','wall-frame-1','wall-frame-2','wall-frame-3','floor-plant-left','floor-plant-right','side-table','floor-lamp','pouffe'
].map(s=>'living-room/'+s);
export const stableId=id=>/^item-\d+$/.test(id||'')?(legacyIds[Number(id.slice(5))]||id):id;
export const displayBooks=[0,3,7,11,14,16,17,21];
export const storyThemes=['sunset','sea','forest','autumn','flowers','coffee','snow','city'];
const kinds={'window-bench':'bench','window-cushion-left':'cushion','window-cushion-right':'cushion','sofa-cushion-left':'cushion','sofa-cushion-right':'cushion','sofa':'sofa','rug':'rug','floor-lamp':'lamp','cup':'cup','pouffe':'cushion'};
export function furnishingKind(id){const name=id.split('/').pop();return /^book-\d+$/.test(name)?'book':name.startsWith('wall-frame')?'frame':name.includes('plant')?'plant':kinds[name]||'wood';}
const defaults=Object.fromEntries(displayBooks.map((i,n)=>['book-'+String(i+1).padStart(2,'0'),storyThemes[n]]));
Object.assign(defaults,{'window-cushion-left':'picnic','window-cushion-right':'lavender','sofa-cushion-left':'peach','sofa-cushion-right':'rain'});
export const defaultBindings=Object.fromEntries(Object.entries(defaults).map(([id,theme])=>['living-room/'+id,'story-'+theme]));
export function migrateLayout(layout={}){return Object.fromEntries(Object.entries(layout).map(([id,t])=>[stableId(id),{...t,parent:t.parent?stableId(t.parent):null}]));}
export function migrateAttachments(records){return records.map(r=>({...r,...(r.parentId?{parentId:stableId(r.parentId)}:{})}));}
export const allLayoutIds=[...legacyIds,...courtyardIds];
export function validBindings(bindings,records){if(!bindings||Array.isArray(bindings)||typeof bindings!=='object')return false;const ids=new Set(records.map(r=>r.id));return Object.entries(bindings).every(([p,id])=>allLayoutIds.includes(stableId(p))&&ids.has(id));}
export function visibleObject(o){for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;}
