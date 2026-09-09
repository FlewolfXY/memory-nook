import {assetURL} from './asset-url.mjs';
import * as T from './vendor/three.module.js';
import {legacyIds,displayBooks,furnishingKind} from './furnishing-data.mjs';
import {roomPalette} from './photo-palette.mjs';

export function installFurnishings(root){
  const objects=[];root.traverse(o=>{if(o.userData.layoutId)objects.push(o);});
  for(const o of objects){
    const oldIndex=Number(o.userData.layoutId.slice(5));o.userData.layoutId=legacyIds[oldIndex];
    o.userData.furnishingKind=furnishingKind(o.userData.layoutId);o.userData.originalPosition=o.position.clone();
    if(oldIndex>=4&&oldIndex<=27){
      const i=oldIndex-4;o.userData.extraBook=!displayBooks.includes(i);o.visible=!o.userData.extraBook;
      if(o.visible){o.children[0].scale.x=1.4;for(const line of o.children.slice(1))line.scale.x=1.2;}
      const h=o.children[0].geometry.boundingBox||(o.children[0].geometry.computeBoundingBox(),o.children[0].geometry.boundingBox);
      const height=h.max.y-h.min.y;
      const label=new T.Mesh(new T.PlaneGeometry(.125,height*.43),new T.MeshStandardMaterial({color:'#ede2c9',roughness:.9}));
      label.position.set(0,height*.53,.154);label.userData.traceDecoration=true;o.add(label);o.userData.storyLabel=label;
      const bookmark=new T.Mesh(new T.BoxGeometry(.029,.095,.013),new T.MeshStandardMaterial({color:'#cda07e',roughness:.9}));
      bookmark.position.set(.037,height*.13,.158);bookmark.userData.traceDecoration=true;o.add(bookmark);o.userData.bookmark=bookmark;
    }
    if(o.userData.furnishingKind==='cushion'&&o.isMesh&&o.userData.movable==='抱枕'){
      o.geometry.computeBoundingBox();const b=o.geometry.boundingBox,w=b.max.x-b.min.x,d=b.max.z-b.min.z;
      const pattern=new T.Mesh(new T.PlaneGeometry(w*.8,d*.72),new T.MeshStandardMaterial({transparent:true,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-1}));
      pattern.rotation.x=-Math.PI/2;pattern.position.y=b.max.y+.002;pattern.userData.traceDecoration=true;o.add(pattern);o.userData.stitches=pattern;
    }
    if(o.userData.furnishingKind==='frame'){
      const photo=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({color:'#ffffff'}));
      photo.position.z=.091;photo.scale.set(.31,.40,1);photo.visible=false;photo.userData.traceDecoration=true;o.add(photo);o.userData.storyPhoto=photo;
    }
    if(o.userData.furnishingKind==='cup'){
      const tea=new T.Mesh(new T.CylinderGeometry(.09,.09,.004,24),new T.MeshStandardMaterial({color:'#6e5943',roughness:.35}));tea.position.set(0,.172,0);tea.userData.traceDecoration=true;o.add(tea);
    }
    const own=[];function collect(n){if(n!==o&&n.userData.layoutId)return;if(n.userData.traceDecoration)return;if(n.isMesh){n.material=n.material.clone();n.userData.originalColor=n.material.color.clone();own.push(n);}for(const c of n.children)collect(c);}collect(o);o.userData.tintMeshes=own;
  }
  return objects;
}

function clothTexture(colors){
  if(typeof document==='undefined')return null;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d');
  ctx.strokeStyle=colors[1];ctx.lineWidth=9;ctx.globalAlpha=.75;
  for(const x of [24,64,104]){ctx.beginPath();ctx.moveTo(x,4);ctx.lineTo(x,124);ctx.stroke();}
  ctx.globalAlpha=.9;ctx.strokeStyle='#f7ecda';ctx.lineWidth=2;ctx.setLineDash([3,4]);
  for(const x of [16,32,56,72,96,112]){ctx.beginPath();ctx.moveTo(x,4);ctx.lineTo(x,124);ctx.stroke();}
  ctx.strokeStyle=colors[2];ctx.strokeRect(4,4,120,120);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;return texture;
}
function labelTexture(title){
  if(typeof document==='undefined')return null;
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=224;const c=canvas.getContext('2d');c.fillStyle='#eee4cf';c.fillRect(0,0,128,224);c.strokeStyle='#b8a784';c.lineWidth=2;c.strokeRect(10,10,108,204);c.fillStyle='#675a44';c.textAlign='center';c.font='27px serif';[...title].slice(0,5).forEach((ch,i)=>c.fillText(ch,64,45+i*33));
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;return texture;
}
export class FurnishingStories{
  constructor(root){this.objects=new Map();root.traverse(o=>{if(o.userData.layoutId)this.objects.set(o.userData.layoutId,o);});this.photos=new Map();}
  photo(url,mesh){
    if(!url){mesh.visible=false;return;}mesh.visible=true;mesh.userData.photoUrl=url;
    const apply=texture=>{if(mesh.userData.photoUrl!==url)return;mesh.material.map=texture;mesh.material.needsUpdate=true;const a=texture.image.width/texture.image.height,w=.31,h=.40;mesh.scale.set(Math.min(w,h*a),Math.min(h,w/a),1);};
    let cached=this.photos.get(url);if(cached){if(cached.image)apply(cached.texture);else cached.listeners.push(apply);return;}
    cached={listeners:[apply]};this.photos.set(url,cached);const texture=new T.TextureLoader().load(assetURL(url),tex=>{tex.colorSpace=T.SRGBColorSpace;cached.image=tex.image;cached.listeners.forEach(fn=>fn(tex));cached.listeners=[];},undefined,()=>{this.photos.delete(url);if(mesh.userData.photoUrl===url)mesh.visible=false;});cached.texture=texture;
  }
  apply(records,bindings){
    const sources=new Map(records.map(r=>[r.id,r]));const personal=records.some(r=>r.personalEdition);
    for(const id of ['book-01','book-08','book-15','book-17']){const o=this.objects.get('living-room/'+id);if(o&&personal&&!o.userData.extraBook)o.visible=!!bindings['living-room/'+id]||o.position.distanceTo(o.userData.originalPosition)>.001;}
    for(const [id,o]of this.objects){
      const r=sources.get(bindings[id]),kind=o.userData.furnishingKind;
      o.userData.traceId=r?.id||null;o.userData.traceTitle=r?.title||null;
      const colors=r?roomPalette(r.palette,kind):null;o.userData.displayPalette=colors;
      const meshes=o.userData.tintMeshes||[];
      meshes.forEach((m,i)=>{const base=m.userData.originalColor;m.material.color.copy(base);if(!colors)return;let strength=0,index=0;
        if(kind==='book'&&i===0)strength=1;
        else if(kind==='cushion'){strength=i===0?.90:.2;}
        else if(kind==='plant'&&i<2){strength=.6;index=i;}
        else if(kind==='cup'){strength=.75;index=i%3;}
        else if(kind==='sofa'&&['879476','637555','98a184'].includes(base.getHexString()))strength=.20;
        else if(kind==='rug')strength=i<4?.12:.35;
        else if(kind==='bench'&&base.getHexString()==='93acb4')strength=.3;
        else if(kind==='lamp'&&base.getHexString()==='f0dfbc')strength=.16;
        else if(kind==='wood')strength=.06;
        if(strength)m.material.color.lerp(new T.Color(colors[index]),strength);
      });
      const styleKey=r?JSON.stringify([r.title,colors,r.image]):'';
      if(o.userData.storyStyle===styleKey)continue;o.userData.storyStyle=styleKey;
      if(o.userData.storyLabel){const m=o.userData.storyLabel.material;m.map?.dispose();m.map=labelTexture(r?.title||'待续');m.needsUpdate=true;o.userData.bookmark.material.color.set(colors?.[2]||'#cda07e');}
      if(o.userData.stitches){const m=o.userData.stitches.material;m.map?.dispose();m.map=clothTexture(colors||['#879476','#b0ad93','#d0bf9f']);m.needsUpdate=true;}
      if(o.userData.storyPhoto)this.photo(r?.image,o.userData.storyPhoto);
    }
  }
}
