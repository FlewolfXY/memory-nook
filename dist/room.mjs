import {buildCourtyard,Pond} from './courtyard.mjs';
import {gardenSpots,spotSpace} from './spaces.mjs';
import {jewelEnvironment} from './lighting.mjs';
import {assetURL} from './asset-url.mjs';
import * as T from './vendor/three.module.js';
import {installFurnishings,FurnishingStories} from './furnishings.mjs';
const C={wall:'#ddcaae',wood:'#99704b',edge:'#6a513c',honey:'#bd9468',cream:'#f0dfbc',sage:'#879476',sageDark:'#637555',pink:'#d9a89b',blue:'#93acb4',gold:'#b99352',leaf:'#60794e'};
const mats=new Map();function mat(color,extra={}){const key=color+JSON.stringify(extra);if(!mats.has(key))mats.set(key,new T.MeshStandardMaterial({color,roughness:.85,...extra}));return mats.get(key);}
function rounded(w,h,d,r=.06){r=Math.min(r,w/3,h/3,d/3);const s=new T.Shape(),x=-w/2+r,y=-h/2+r,W=w-2*r,H=h-2*r;s.moveTo(x,y);s.lineTo(x+W,y);s.lineTo(x+W,y+H);s.lineTo(x,y+H);s.closePath();const g=new T.ExtrudeGeometry(s,{depth:d-2*r,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:r,bevelThickness:r,curveSegments:6});g.translate(0,0,-d/2+r);g.computeVertexNormals();return g;}
function mesh(parent,geo,color,pos=[0,0,0],extra={}){const m=new T.Mesh(geo,mat(color,extra));m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
export function box(p,w,h,d,color,pos,r=.05){return mesh(p,rounded(w,h,d,r),color,pos);}
export function ball(p,r,color,pos,scale=[1,1,1]){const m=mesh(p,new T.SphereGeometry(r,16,12),color,pos);m.scale.set(...scale);return m;}
export function cyl(p,r1,r2,h,color,pos){return mesh(p,new T.CylinderGeometry(r1,r2,h,24),color,pos);}
export function rod(p,a,b,r,color){const av=new T.Vector3(...a),bv=new T.Vector3(...b),v=bv.clone().sub(av);const o=cyl(p,r,r,v.length(),color,av.clone().add(bv).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o;}
function arch(w,h){const s=new T.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h-w/2);s.absarc(0,h-w/2,w/2,0,Math.PI,false);s.lineTo(-w/2,0);return s;}
export function archPanel(p,w,h,d,color,pos){const g=new T.ExtrudeGeometry(arch(w,h),{depth:d,bevelEnabled:true,bevelThickness:.02,bevelSize:.02,bevelSegments:2,steps:1,curveSegments:24});return mesh(p,g,color,pos);}
export function plant(p,x,y,z,size=.55){const group=new T.Group();group.position.set(x,y,z);p.add(group);cyl(group,size*.22,size*.16,size*.35,'#bd9575',[0,size*.175,0]);cyl(group,size*.23,size*.23,size*.065,'#ddbaa0',[0,size*.34,0]);cyl(group,size*.19,size*.19,.014,'#594837',[0,size*.37,0]);for(let k=0;k<7;k++){const a=k*2.4,height=size*(.55+(k%3)*.16),end=[Math.cos(a)*size*.27,height,Math.sin(a)*size*.27];rod(group,[0,size*.34,0],end,.012,C.leaf);const leaf=ball(group,size*.19,k%2?C.leaf:'#83915c',end,[.55,1.25,.22]);leaf.rotation.set(.3,a,.5*Math.cos(a));}group.userData.movable='盆栽';return group;}
function cushion(p,pos,color,w=.48){const m=box(p,w,.18,w*.85,color,pos,.075);m.rotation.x=.7;m.rotation.z=.1;m.userData.movable='抱枕';return m;}
function flower(p,pos,size=.18){for(let k=0;k<5;k++){const a=k/5*Math.PI*2;ball(p,size,C.pink,[pos[0]+Math.cos(a)*size,pos[1]+Math.sin(a)*size,pos[2]],[.9,.9,.35]);}ball(p,size*.65,C.cream,pos,[1,1,.45]);}
function book(p,x,y,z,w,h,color,rot=0){const g=new T.Group();g.position.set(x,y,z);g.rotation.z=rot;p.add(g);box(g,w,h,.28,color,[0,h/2,0],.012);box(g,w*.75,.025,.015,C.gold,[0,h*.22,.15],.005);box(g,w*.75,.02,.015,C.gold,[0,h*.78,.15],.005);g.userData.movable='书本';return g;}
function lamp(p,x,z){const start=p.children.length;cyl(p,.25,.29,.07,C.gold,[x,.09,z]);cyl(p,.032,.045,2.15,C.gold,[x,1.16,z]);const shade=mesh(p,new T.CylinderGeometry(.22,.42,.52,32,1,true),C.cream,[x,2.12,z],{side:T.DoubleSide,emissive:'#f4c477',emissiveIntensity:.28});cyl(p,.23,.23,.025,C.honey,[x,2.39,z]);cyl(p,.43,.43,.025,C.honey,[x,1.86,z]);ball(p,.055,C.gold,[x,2.48,z]);const light=new T.PointLight('#ffc87f',1.8,4);light.position.set(x,1.96,z);p.add(light);pack(p,start,'落地灯');return light;}
export const spots=[{id:'table',name:'茶几',p:[.15,.76,.9]},{id:'window',name:'窗台',p:[-1.7,.96,-2.42]},{id:'shelf',name:'纪念物架',p:[-3.12,1.95,.15]},{id:'cabinet',name:'矮柜',p:[2.7,1,-1.9]},{id:'bookshelf',name:'书架',p:[1.2,1.67,-2.65]},{id:'side',name:'边桌',p:[-1.65,.84,2.05]},...gardenSpots];
export function buildRoom(){const root=new T.Group();root.name='memory-nook';
 box(root,7.35,.28,6.35,C.edge,[0,-.16,0],.09);
 for(let j=0;j<14;j++)for(let i=0;i<5;i++){const z=-2.83+j*.43,x=-2.82+i*1.4;box(root,1.385,.055,.415,(i+j)%3===0?'#ba956c':(i+j)%3===1?'#b18a60':'#c29c74',[x,.009,z],.008);}
 box(root,7.15,3.7,.18,C.wall,[0,1.85,-3.04],.04);box(root,.18,3.7,6.15,'#d4c3a6',[-3.54,1.85,0],.04);
 for(const x of [-3.43,3.43])box(root,.19,3.75,.27,C.edge,[x,1.87,-2.95],.035);
 box(root,7.25,.2,.32,C.edge,[0,3.65,-3],.04);box(root,.3,.2,6.22,C.edge,[-3.51,3.65,0],.04);box(root,7.13,.16,.22,C.honey,[0,.13,-2.91],.02);box(root,.2,.16,6.1,C.honey,[-3.4,.13,0],.02);
 for(const z of [-2.88,0,2.92])box(root,.23,3.7,.2,C.wood,[-3.4,1.86,z]);
 // Arched window: nested arch + crossbars, clean modular silhouette.
 archPanel(root,2.38,2.59,.09,C.honey,[-1.72,.85,-2.91]);archPanel(root,2.13,2.37,.025,'#a8c5ce',[-1.72,.94,-2.80]);
 for(let k=0;k<4;k++){const m=ball(root,.3,'#dce3d5',[-2.5+k*.46,2.55+(k%2)*.1,-2.745],[1.3,.5,.06]);m.castShadow=false;}
 box(root,.065,2.25,.07,C.cream,[-1.72,2.03,-2.71],.01);box(root,2.07,.065,.07,C.cream,[-1.72,1.78,-2.7],.01);box(root,2.05,.065,.07,C.cream,[-1.72,2.46,-2.7],.01);box(root,2.65,.13,.58,C.honey,[-1.72,.89,-2.61]);
 let start=root.children.length;
 // Window-seat drawers, feet and pillows.
 box(root,2.52,.54,.75,C.honey,[-1.72,.35,-2.49]);for(const x of [-2.3,-1.1]){box(root,1.08,.34,.055,'#c9a67b',[x,.39,-2.08],.025);ball(root,.035,C.gold,[x,.4,-2.03]);}box(root,2.48,.15,.76,C.blue,[-1.72,.7,-2.47],.07);cushion(root,[-2.55,.89,-2.5],C.pink,.43);cushion(root,[-.88,.89,-2.5],C.cream,.43);
 pack(root,start,'窗下长凳');start=root.children.length;
 // Bookcase: individual shelves, supports and reusable books.
 const bx=1.05,bz=-2.68;archPanel(root,1.72,3.14,.3,C.wood,[bx,.14,bz-.26]);archPanel(root,1.49,2.91,.02,'#725639',[bx,.28,bz+.07]);
 for(const x of [bx-.82,bx+.82])box(root,.13,2.65,.5,C.honey,[x,1.46,bz]);for(let k=0;k<5;k++){const y=.46+k*.59;box(root,1.68,.095,.56,C.honey,[bx,y,bz+.035],.02);if(k<4)for(let b=0;b<(k===2?3:7);b++)book(root,bx-.61+b*.19,y+.05,bz+.08,.13,.32+((b+k)%3)*.07,[C.sage,C.pink,'#b0aca0',C.blue,'#ad8056'][(b+k)%5],b===5?-.1:0);}
 box(root,1.8,.13,.67,C.edge,[bx,.17,bz]);plant(root,2.05,0,-2.42,.9);
 pack(root,start,'书架');
 // Sofa along left wall, with visible wooden base and separate soft pieces.
 const sofa=new T.Group();sofa.position.set(-2.65,0,.25);sofa.rotation.y=Math.PI/2;root.add(sofa);sofa.userData.movable='沙发';
 for(const x of [-.9,.9])for(const z of [-.35,.35])cyl(sofa,.055,.065,.24,C.wood,[x,.18,z]);box(sofa,2.38,.22,1,C.wood,[0,.34,0]);box(sofa,2.38,.85,.23,C.sage,[0,.93,-.43],.095);for(const x of [-.57,.57]){box(sofa,1.06,.23,.83,'#98a184',[x,.58,.02],.095);box(sofa,1.06,.6,.19,C.sage,[x,1,-.29],.08);}for(const x of [-1.14,1.14])box(sofa,.27,.57,1.05,C.sageDark,[x,.71,0],.1);cushion(sofa,[-.72,.91,-.18],C.cream,.46);cushion(sofa,[.72,.91,-.18],C.blue,.46);flower(sofa,[0,.96,-.15],.13);
 start=root.children.length;
 // Layered rug, oval coffee table and small props.
 const rug=box(root,3.6,.022,3.8,'#d4b29a',[-.25,.066,.7],.01);box(root,3.45,.023,3.65,'#e6d7b8',[-.25,.08,.7],.01);box(root,3.21,.025,3.42,'#c3c4a5',[-.25,.093,.7],.01);box(root,3.12,.027,3.33,'#e5d6b8',[-.25,.108,.7],.01);
 for(let k=0;k<14;k++){const a=k/14*Math.PI*2;const petal=ball(root,.09,k%2?C.pink:C.sage,[-.25+Math.cos(a)*1.28,.128,.7+Math.sin(a)*1.43],[1,.12,1.7]);petal.rotation.y=-a;}
 pack(root,start,'地毯');
 const table=new T.Group();table.position.set(.15,0,.9);root.add(table);table.userData.movable='茶几';for(const x of [-.65,.65])for(const z of [-.36,.36])rod(table,[x,.15,z],[x*.85,.69,z*.9],.047,C.wood);const top=cyl(table,1,1,.12,C.honey,[0,.7,0]);top.scale.set(1,.99,.65);const low=cyl(table,.81,.81,.075,C.wood,[0,.28,0]);low.scale.z=.66;
 let propStart=table.children.length;box(table,.52,.08,.37,C.sage,[-.35,.81,.06],.014);box(table,.47,.065,.33,C.pink,[-.32,.88,.04],.014);pack(table,propStart,'桌上的书');propStart=table.children.length;cyl(table,.12,.11,.17,C.cream,[.54,.84,.17]);const handle=mesh(table,new T.TorusGeometry(.062,.016,6,16),C.cream,[.66,.85,.17]);
 pack(table,propStart,'杯子');start=root.children.length;
 // Right-hand display console.
 box(root,.84,.8,1.8,C.honey,[2.7,.51,-1.9]);box(root,.96,.12,1.94,C.wood,[2.7,.94,-1.9]);for(const z of [-2.35,-1.47]){box(root,.05,.56,.73,'#c9a377',[3.14,.53,z]);ball(root,.037,C.gold,[3.19,.59,z]);}for(const x of [2.4,3])for(const z of [-2.57,-1.23])cyl(root,.05,.045,.17,C.wood,[x,.12,z]);plant(root,2.7,1.02,-2.52,.47);
 pack(root,start,'矮柜');start=root.children.length;
 // Wall-mounted keepsake shelf on left.
 box(root,.59,.09,1.72,C.honey,[-3.13,1.9,.13]);for(const z of [-.46,.72])rod(root,[-3.35,1.54,z],[-2.9,1.85,z],.036,C.wood);plant(root,-3.12,1.95,-.4,.35);
 pack(root,start,'纪念物架');
 // Little wall frames, stacked groups, greenery and a reading lamp.
 for(let k=0;k<3;k++){const g=new T.Group();g.position.set(-3.39,2.55+(k%2)*.18,-.8+k*.68);g.rotation.y=Math.PI/2;g.userData.movable='墙上小画';root.add(g);box(g,.43,.55,.065,C.honey,[0,0,0],.025);box(g,.33,.44,.02,k%2?C.blue:C.cream,[0,0,.045],.015);ball(g,.08,C.sage,[0,.025,.07],[.7,1.7,.08]);}
 for(let k=0;k<12;k++){const y=3.27-k*.15,x=-2.9+Math.sin(k*.7)*.12;ball(root,.085,k%2?C.leaf:C.sage,[x,y,-2.6],[.7,1.3,.3]);}
 plant(root,-3.05,0,2.48,.8);plant(root,2.8,0,2.15,1.1);
 start=root.children.length;box(root,.67,.1,.65,C.honey,[-1.65,.79,2.05]);for(const x of [-1.9,-1.4])for(const z of [1.8,2.3])rod(root,[x,.1,z],[x,.75,z],.03,C.wood);
 pack(root,start,'边桌');
 const lampLight=lamp(root,-.95,-1.6);
 start=root.children.length;const puff=cyl(root,.36,.34,.4,'#c8a88e',[1.6,.32,1.55]);for(let k=0;k<8;k++){const a=k/8*Math.PI*2;rod(root,[1.6+Math.cos(a)*.34,.15,1.55+Math.sin(a)*.34],[1.6+Math.cos(a)*.28,.48,1.55+Math.sin(a)*.28],.009,'#b3947f');}
 pack(root,start,'圆凳');
 root.userData.lampLight=lampLight;let id=0;root.traverse(o=>{if(o.userData.movable)o.userData.layoutId='item-'+id++;});installFurnishings(root);mergeStatic(root);return root;
}
export function keepsake(record){const root=new T.Group();root.name='keepsake-'+record.id;root.userData.recordId=record.id;const pal=record.palette||[C.pink,C.blue,C.gold],type=record.form||'card';
 if(type==='lamp'){
  cyl(root,.17,.2,.07,C.wood,[0,.035,0]);for(let k=0;k<3;k++){const slab=box(root,.27-k*.025,.16,.16,pal[k],[k*.015,.16+k*.12,0],.025);slab.material=mat(pal[k],{roughness:.38,emissive:pal[k],emissiveIntensity:.2});slab.rotation.y=k*.24;}ball(root,.025,C.gold,[.03,.52,0]);
 }else if(type==='clay'){
  cyl(root,.23,.24,.045,C.cream,[0,.025,0]);archPanel(root,.24,.34,.075,pal[0],[-.1,.055,-.025]);archPanel(root,.2,.24,.09,pal[1],[.1,.055,.04]);ball(root,.075,pal[2],[.075,.38,.015]);
 }else{
  const framed=type==='frame';box(root,.52,.63,.06,framed?C.honey:'#fff9e9',[0,.33,0],.02);const front=mesh(root,new T.PlaneGeometry(.43,.43),pal[0],[0,.36,.034]);front.castShadow=false;
  if(record.image){new T.TextureLoader().load(assetURL(record.image),tex=>{tex.colorSpace=T.SRGBColorSpace;front.material=new T.MeshBasicMaterial({map:tex});const aspect=tex.image.width/tex.image.height;front.scale.set(Math.min(1,aspect),Math.min(1,1/aspect),1);});}else{ball(root,.095,pal[2],[.065,.4,.044],[1,1,.03]);box(root,.43,.12,.01,pal[1],[0,.205,.045],.003);}
  rod(root,[0,.025,-.17],[0,.45,-.045],.017,C.wood);
 }
 root.rotation.y=record.rotation||0;root.scale.setScalar(record.scale||1);return root;
}
export class Room{
 constructor(host,onPick,onSpot){this.host=host;this.onPick=onPick;this.onSpot=onSpot;this.scene=new T.Scene();this.scene.background=new T.Color('#eee7dc');this.renderer=new T.WebGLRenderer({antialias:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.1;host.append(this.renderer.domElement);this.camera=new T.OrthographicCamera();this.angle=.78;this.zoom=1;this.camera.position.set(10,9,12);this.camera.lookAt(0,1,0);this.room=buildRoom();this.space='living-room';this.yard=buildCourtyard();this.yard.visible=false;this.scene.add(this.yard);this.pond=new Pond(this.yard);this.environment=jewelEnvironment(this.renderer);this.stories=new FurnishingStories(this.room);this.yard.traverse(o=>{if(o.userData.layoutId)this.stories.objects.set(o.userData.layoutId,o);});this.scene.add(this.room);this.scene.add(new T.HemisphereLight('#fff3df','#b6aa91',2.3));this.sun=new T.DirectionalLight('#ffdda0',3.3);this.sun.position.set(-3,8,5);this.sun.castShadow=true;this.sun.shadow.mapSize.set(2048,2048);Object.assign(this.sun.shadow.camera,{left:-6,right:6,top:6,bottom:-6,near:.5,far:25});this.sun.shadow.normalBias=.03;this.sun.shadow.bias=-.0004;this.sun.shadow.radius=4;this.scene.add(this.sun);const fill=new T.DirectionalLight('#cbdce4',.65);fill.position.set(6,4,-2);this.scene.add(fill);
 const ground=mesh(this.scene,new T.PlaneGeometry(200,200),'#eee7dc',[0,-.33,0]);ground.rotation.x=-Math.PI/2;ground.castShadow=false;
 this.models=new Map();this.ray=new T.Raycaster();this.markers=new T.Group();this.scene.add(this.markers);for(const s of spots){const mark=new T.Mesh(new T.RingGeometry(.19,.23,40),new T.MeshBasicMaterial({color:'#f5d293',side:T.DoubleSide,transparent:true,opacity:.9,depthTest:false}));mark.rotation.x=-Math.PI/2;mark.position.set(...s.p);mark.position.y+=.02;mark.userData.spotId=s.id;mark.renderOrder=10;this.markers.add(mark);}this.markers.visible=false;

 window.addEventListener('resize',()=>this.resize());this.resize();this.elapsed=0;this.lastTime=null;this.reduced=window.matchMedia('(prefers-reduced-motion: reduce)');this.frame=this.frame.bind(this);requestAnimationFrame(this.frame);
 }
 resize(){const a=innerWidth/innerHeight,h=(innerWidth<700?12.8:9.7)/this.zoom;this.camera.left=-h*a/2;this.camera.right=h*a/2;this.camera.top=h/2;this.camera.bottom=-h/2;this.camera.near=.1;this.camera.far=100;this.camera.updateProjectionMatrix();this.renderer.setSize(innerWidth,innerHeight);this.view();}
 view(){this.camera.position.set(Math.sin(this.angle)*14,11,Math.cos(this.angle)*14);this.camera.lookAt(innerWidth<700?0:-.6,1.25,0);}
 rotate(n){this.angle=T.MathUtils.clamp(this.angle+n,.12,1.43);this.view();}
 setRecords(records){this.pond.sync(records);for(const m of this.models.values()){m.parent?.remove(m);dispose(m);}this.models.clear();const occupied={};for(const r of records.filter(r=>r.spot&&r.form!=='fish')){const s=spots.find(s=>s.id===r.spot);if(!s)continue;const m=keepsake(r),i=occupied[s.id]||0;occupied[s.id]=i+1;m.position.set(s.p[0]+(s.id==='shelf'?0:(i%3)*.3-.15),s.p[1],s.p[2]+(s.id==='shelf'?(i%3)*.3:Math.floor(i/3)*.25));if(r.position){m.position.fromArray(r.position);}else if(s.id==='shelf')m.rotation.y+=Math.PI/2;m.userData.space=spotSpace(r.spot);m.visible=m.userData.space===this.space;this.scene.add(m);this.models.set(r.id,m);}this.editor?.restoreMemoryParents();}
 startPlace(record,spotId){for(const m of this.markers.children){if(this.editor){m.position.copy(this.editor.spotPosition(m.userData.spotId));m.position.y+=.02;}}for(const m of this.markers.children)m.visible=spotSpace(m.userData.spotId)===this.space;this.markers.visible=true;this.preview=keepsake(record);this.scene.add(this.preview);this.movePreview(spotId||'table');}
 movePreview(id){const s=spots.find(x=>x.id===id);this.preview.position.copy(this.editor?this.editor.spotPosition(id):new T.Vector3(...s.p));}
 stopPlace(){this.markers.visible=false;if(this.preview){this.scene.remove(this.preview);dispose(this.preview);this.preview=null;}}
 night(value){this.sun.intensity=value?.45:3.3;this.sun.color.set(value?'#8eaad7':'#ffdda0');this.room.userData.lampLight.intensity=value?5:1.8;this.yard.userData.lampLight.intensity=value?3:1.7;this.pond.water.material.uniforms.night.value=value?1:0;this.scene.background.set(value?'#c3c8c6':'#eee7dc');}
 switchSpace(space){this.editor?.setEnabled(false);this.space=space;this.scene.environment=space==='courtyard'?this.environment.texture:null;this.room.visible=space==='living-room';this.yard.visible=space==='courtyard';for(const m of this.models.values())m.visible=m.userData.space===space;this.angle=.78;this.zoom=space==='courtyard'?1.12:1;this.resize();}
 activeRoots(){return [this.space==='courtyard'?this.yard:this.room,...this.models.values()].filter(o=>o.visible);}
 frame(t){const dt=this.lastTime===null?0:Math.min(.05,(t-this.lastTime)/1000);this.lastTime=t;if(!document.hidden){if(this.space==='courtyard'){this.elapsed+=dt;this.pond.update(this.elapsed,dt,this.reduced.matches);}this.markers.children.forEach((m,i)=>m.material.opacity=.6+.3*Math.sin(t*.002+i));this.renderer.render(this.scene,this.camera);}requestAnimationFrame(this.frame);}

}
function dispose(g){g.traverse(m=>{m.geometry?.dispose();if(m.material?.map){m.material.map.dispose();m.material.dispose();}});}

export function mergeStatic(root){root.updateMatrixWorld(true);const groups=new Map(),old=[];root.traverse(m=>{if(!m.isMesh)return;let a=m;while(a!==root){if(a.userData.movable)return;a=a.parent;}old.push(m);const key=m.material.uuid+String(m.castShadow);if(!groups.has(key))groups.set(key,{material:m.material,cast:m.castShadow,geos:[]});const geo=m.geometry.clone().applyMatrix4(m.matrixWorld);const flat=geo.index?geo.toNonIndexed():geo;if(flat!==geo)geo.dispose();groups.get(key).geos.push(flat);});for(const m of old){m.parent.remove(m);m.geometry.dispose();}for(const {material,cast,geos}of groups.values()){const geo=new T.BufferGeometry();for(const name of ['position','normal','uv']){const attrs=geos.map(g=>g.getAttribute(name));if(attrs.some(a=>!a))continue;const arr=new Float32Array(attrs.reduce((s,a)=>s+a.array.length,0));let at=0;for(const a of attrs){arr.set(a.array,at);at+=a.array.length;}geo.setAttribute(name,new T.BufferAttribute(arr,attrs[0].itemSize));}geos.forEach(g=>g.dispose());const m=new T.Mesh(geo,material);m.castShadow=cast;m.receiveShadow=true;root.add(m);}}

function pack(parent,start,label){const parts=parent.children.slice(start),g=new T.Group();g.userData.movable=label;parent.add(g);for(const o of parts)g.add(o);parent.updateMatrixWorld(true);const b=new T.Box3().setFromObject(g),pivot=parent.worldToLocal(new T.Vector3((b.min.x+b.max.x)/2,b.min.y,(b.min.z+b.max.z)/2));for(const o of g.children)o.position.sub(pivot);g.position.copy(pivot);return g;}
