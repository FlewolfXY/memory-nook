import * as T from './vendor/three.module.js';
import {box,ball,cyl,rod,archPanel} from './room.mjs';

// These are architectural navigation objects, never inventory or saved furniture.
export function gardenSign(){
 const root=new T.Group();root.name='garden-path';root.userData.navigation='courtyard';
 // The midpoint of the right open edge is x=3.675, z=0. Grow outwards along +x.
 root.position.set(3.59,-.24,0);
 const outline=new T.Shape();outline.moveTo(0,-.40);outline.bezierCurveTo(.40,-.43,.84,-.42,1.15,-.40);
 outline.lineTo(1.13,-.69);outline.quadraticCurveTo(1.14,-.78,1.24,-.70);
 outline.lineTo(1.99,-.08);outline.quadraticCurveTo(2.09,0,1.99,.08);outline.lineTo(1.24,.70);
 outline.quadraticCurveTo(1.14,.78,1.13,.69);outline.lineTo(1.15,.40);
 outline.bezierCurveTo(.83,.44,.35,.40,0,.40);outline.closePath();
 const geo=new T.ExtrudeGeometry(outline,{depth:.10,bevelEnabled:true,bevelSize:.055,bevelThickness:.045,bevelSegments:5,curveSegments:18});geo.rotateX(-Math.PI/2);
 const material=new T.MeshStandardMaterial({color:'#adc985',roughness:.88,emissive:'#e5d496',emissiveIntensity:0});
 const lawn=new T.Mesh(geo,material);lawn.castShadow=true;lawn.receiveShadow=true;root.add(lawn);root.userData.pathMaterial=material;
 // A tiny glimpse of blue at the far end suggests the water beyond the room.
 ball(root,.38,'#8bcac3',[1.61,.135,.06],[1.02,.13,.92]);
 ball(root,.27,'#b6e0d4',[1.59,.16,.01],[1,.10,.90]);
 for(let i=0;i<5;i++){
  const x=.09+i*.32,z=Math.sin(i*.9)*.065;
  const stone=ball(root,.235,i%2?'#f4dfb3':'#fff0cd',[x,.19-i*.012,z],[1,.28,.79]);stone.rotation.y=-.12+i*.13;
 }
 // A flattened arrow-tip stone keeps the direction readable without a signboard.
 const tip=new T.Shape();tip.moveTo(-.21,-.24);tip.quadraticCurveTo(-.28,0,-.21,.24);tip.lineTo(.21,.035);tip.quadraticCurveTo(.26,0,.21,-.035);tip.closePath();
 const tg=new T.ExtrudeGeometry(tip,{depth:.025,bevelEnabled:true,bevelSize:.035,bevelThickness:.025,bevelSegments:4});tg.rotateX(-Math.PI/2);
 const tipStone=new T.Mesh(tg,new T.MeshStandardMaterial({color:'#ffe7b5',roughness:.83}));tipStone.position.set(1.73,.19,0);tipStone.castShadow=true;root.add(tipStone);
 const beds=[[.27,-.36],[.73,.35],[1.16,-.52],[1.38,.47]];
 for(let j=0;j<beds.length;j++){
  const [x,z]=beds[j];ball(root,.18,j%2?'#c2d99a':'#9fbc79',[x,.13,z],[1.15,.35,.85]);
  const h=.22+(j%2)*.065;rod(root,[x,.14,z],[x,h+.09,z],.012,'#85a264');
  ball(root,.075,'#c9dda2',[x+.055,h-.015,z],[1,.42,.48]);
  for(let k=0;k<5;k++){const t=k/5*Math.PI*2;ball(root,.047,j%2?'#c8b1df':'#efb9bb',[x+Math.cos(t)*.055,h+.09,z+Math.sin(t)*.055],[1,.5,1]);}
  ball(root,.032,'#ffe3a0',[x,h+.105,z],[1,.55,1]);
 }
 for(const [x,z]of [[.5,-.27],[1.05,.29],[1.68,-.25]])ball(root,.025,'#fff1bc',[x,.20,z],[1,.45,1]);
 return root;
}
export function gardenDoor(root){
 const entry=new T.Group();entry.name='home-door';entry.userData.navigation='living-room';root.add(entry);
 archPanel(entry,1.5,2.65,.18,'#b5946c',[4.4,.04,-4.9]);
 archPanel(entry,1.23,2.4,.03,'#3c4b3d',[4.4,.09,-4.69]);
 box(entry,1.65,.11,.56,'#cfbea0',[4.4,.07,-4.5],.035);
 const hinge=new T.Group();hinge.position.set(3.8,.1,-4.60);entry.add(hinge);
 archPanel(hinge,1.18,2.35,.09,'#819577',[.6,0,0]);
 for(let i=0;i<5;i++)box(hinge,.015,1.65,.014,'#a2b18c',[.15+i*.23,.86,.105],.003);
 for(const y of [.42,1.53])box(hinge,.17,.065,.035,'#a28d63',[.06,y,.12],.012);
 ball(hinge,.06,'#d7ba79',[1.02,.99,.14]);
 const wreath=new T.Mesh(new T.TorusGeometry(.2,.037,8,28),new T.MeshStandardMaterial({color:'#596f4f',roughness:1}));wreath.position.set(.6,1.62,.14);hinge.add(wreath);
 for(let i=0;i<9;i++){const a=i/9*Math.PI*2;ball(hinge,.055,i%3?'#a6b38b':'#dbb8a2',[.6+Math.cos(a)*.2,1.62+Math.sin(a)*.2,.16],[.7,1,.6]);}
 root.userData.doorHinge=hinge;root.userData.doorEntry=entry;return entry;
}
export function navigationOwner(object){for(let o=object;o;o=o.parent)if(o.userData.navigation)return o;return null;}
export function animateDoor(hinge,open,dt,reduced=false){const target=open?-.57:0;hinge.rotation.y=reduced?target:T.MathUtils.lerp(hinge.rotation.y,target,1-Math.exp(-Math.max(0,dt)*7));}
