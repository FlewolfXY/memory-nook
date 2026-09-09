import * as T from './vendor/three.module.js';
import {box,ball,cyl,rod,archPanel} from './room.mjs';

// These are architectural navigation objects, never inventory or saved furniture.
export function gardenSign(){
 const root=new T.Group();root.name='garden-path';root.userData.navigation='courtyard';root.position.set(4.05,-.27,1.1);root.rotation.y=.62;
 for(let i=0;i<3;i++){const stone=ball(root,.26,'#c7b69a',[-.9+i*.3,.05,-.17+i*.07],[1,.3,.72]);stone.rotation.y=i*.4;}
 ball(root,.58,'#c4b292',[.15,.065,0],[1.35,.19,.85]);
 const plaque=new T.Group();plaque.position.set(.08,.28,.03);plaque.rotation.set(-.42,0,-.035);root.add(plaque);
 box(plaque,1.38,.48,.23,'#94a585',[0,0,0],.075);
 box(plaque,1.22,.35,.012,'#aaba98',[-.03,.015,.12],.004);
 // A chunky clay arrow at the end of the tablet.
 const shape=new T.Shape();shape.moveTo(0,-.11);shape.lineTo(.16,0);shape.lineTo(0,.11);shape.closePath();
 const arrow=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.05,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:3}),new T.MeshStandardMaterial({color:'#ece2bc',roughness:.9}));arrow.position.set(.46,0,.13);arrow.castShadow=true;plaque.add(arrow);
 if(typeof document!=='undefined'){
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=192;const ctx=canvas.getContext('2d');
  const draw=()=>{ctx.clearRect(0,0,768,192);ctx.fillStyle='#3f563b';ctx.font='500 68px "Noto Serif SC", serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('去花园与池塘',384,96);};draw();
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
  const label=new T.Mesh(new T.PlaneGeometry(1.0,.25),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));label.position.set(-.12,.01,.133);plaque.add(label);
  document.fonts?.ready.then(()=>{draw();texture.needsUpdate=true;});
 }
 rod(root,[.8,.06,-.09],[.82,.31,-.09],.016,'#76835d');
 ball(root,.10,'#87996b',[.76,.27,-.09],[1.2,.55,.45]);ball(root,.09,'#a4ad7a',[.89,.34,-.09],[.95,.55,.45]);
 root.userData.plaque=plaque;return root;
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
