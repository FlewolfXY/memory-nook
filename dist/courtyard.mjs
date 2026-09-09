import * as T from './vendor/three.module.js';
import {fish} from './fish.mjs';
import {pond,makeSwimmer,beckon,stepSwimmer,seedFor} from './pond-state.mjs';
import {box,ball,cyl,rod,plant,archPanel,mergeStatic} from './room.mjs';
function movable(root,id,label,p){const g=new T.Group();g.userData={layoutId:'courtyard/'+id,movable:label,space:'courtyard'};g.position.set(...p);root.add(g);return g;}
export function buildCourtyard(){
 const root=new T.Group();root.name='courtyard';
 box(root,7.35,.28,6.35,'#9d987c',[0,-.16,0],.09);
 box(root,7.18,.06,6.15,'#b7bd98',[0,.005,0],.02);
 // A low walled garden, with a timber arch framing the way home.
 for(const x of [-3.48,3.48]){box(root,.2,1.2,6.12,'#d9cfb4',[x,.57,0]);box(root,.28,.1,6.15,'#e8dec5',[x,1.19,0]);}
 box(root,7.05,1.35,.18,'#d9cfb4',[0,.64,-3]);box(root,7.12,.12,.3,'#ece0c3',[0,1.35,-3]);
 archPanel(root,1.4,2.55,.14,'#ad8760',[2.2,.06,-2.9]);archPanel(root,1.16,2.34,.04,'#647c68',[2.2,.08,-2.73]);
 for(let i=0;i<5;i++)box(root,.018,1.67,.012,'#94a486',[1.75+i*.23,.97,-2.67],.002);
 ball(root,.055,'#cbb373',[2.6,1.04,-2.61]);
 // Stepping stones leave a clear foreground path and room for the pond.
 for(let k=0;k<7;k++){const z=-2.25+k*.7,x=-2.4+Math.sin(k*.8)*.2;const stone=cyl(root,.38,.42,.07,k%2?'#e3d9bd':'#d2c8ad',[x,.065,z]);stone.scale.z=.72;stone.rotation.y=k*.55;}
 const basin=cyl(root,1,1,.12,'#568d8c',[pond.x,.14,pond.z]);basin.scale.set(pond.rx,1,pond.rz);
 for(let k=0;k<23;k++){const a=k/23*Math.PI*2;const stone=ball(root,.27,k%3?'#c3bea5':'#d7cbb2',[pond.x+Math.cos(a)*pond.rx,.24,pond.z+Math.sin(a)*pond.rz],[1.12,.67,.9]);stone.rotation.y=-a;}
 const bench=movable(root,'bench','花园长凳',[-.8,0,-2.38]);
 for(const x of [-.88,.88])for(const z of [-.26,.26])box(bench,.1,.64,.12,'#826b4b',[x,.34,z],.02);
 for(let i=0;i<3;i++)box(bench,2.12,.1,.18,'#bb986b',[0,.62,-.2+i*.21],.025);
 for(const x of [-1,1])box(bench,.08,.84,.08,'#826b4b',[x,.95,-.31],.02);
 for(let i=0;i<3;i++)box(bench,2.12,.13,.07,'#bfa073',[0,.94+i*.18,-.31],.025);
 const cushion=movable(bench,'seat-cushion','院子坐垫',[.55,.68,.02]);box(cushion,.59,.13,.49,'#c8a9ad',[0,.065,0],.055);
 const table=movable(root,'table','院子石台',[-1.95,0,1.2]);cyl(table,.2,.3,.66,'#c2b79b',[0,.36,0]);cyl(table,.55,.55,.1,'#e1d4b6',[0,.74,0]);
 const specs=[['pot-lavender',[-2.94,.08,-2.48],.8],['pot-sage',[3,.08,2.25],.95],['pot-rose',[-2.94,.08,2.44],.62]];
 for(const [id,pos,size]of specs){const pot=plant(root,...pos,size);pot.userData={layoutId:'courtyard/'+id,movable:id==='pot-lavender'?'淡紫花盆':id==='pot-rose'?'小花盆':'鼠尾草盆',space:'courtyard'};for(let i=0;i<5;i++){const a=i*2.4;ball(pot,.06,id==='pot-lavender'?'#ae9bc2':'#d9b1a5',[Math.cos(a)*.17,size*(.8+(i%2)*.16),Math.sin(a)*.17],[.7,1.2,.7]);}}
 const can=movable(root,'watering-can','浇水壶',[-2.8,.08,.15]);cyl(can,.16,.2,.3,'#91a5a0',[0,.16,0]);rod(can,[.1,.17,0],[.4,.34,0],.044,'#91a5a0');const handle=new T.Mesh(new T.TorusGeometry(.18,.025,8,20),new T.MeshStandardMaterial({color:'#728e84'}));handle.position.set(-.14,.24,0);can.add(handle);
 const lantern=movable(root,'lantern','花园小灯',[2.95,.08,-2]);cyl(lantern,.17,.2,.07,'#8d704a',[0,.04,0]);const glow=box(lantern,.24,.29,.24,'#f3d4a0',[0,.22,0]);glow.material=new T.MeshStandardMaterial({color:'#edcc91',emissive:'#ffbf63',emissiveIntensity:.45});for(const x of [-.15,.15])for(const z of [-.15,.15])rod(lantern,[x,.05,z],[x,.39,z],.014,'#8d704a');cyl(lantern,.1,.24,.16,'#8d704a',[0,.44,0]);const light=new T.PointLight('#ffd390',1.7,4);light.position.y=.35;lantern.add(light);root.userData.lampLight=light;
 // Fixed reed beds and ivy belong to the architecture; pots above remain movable.
 for(let i=0;i<12;i++){const a=3.4+i*.07,x=pond.x+Math.cos(a)*(pond.rx+.06),z=pond.z+Math.sin(a)*(pond.rz+.06);rod(root,[x,.25,z],[x+.07,.8+(i%3)*.13,z+.08],.013,'#7a8f61');ball(root,.08,'#a09270',[x+.07,.83+(i%3)*.13,z+.08],[.43,1.8,.43]);}
 for(let i=0;i<15;i++){const x=-3.34+i*.28,y=1.45+Math.sin(i*.52)*.22;ball(root,.11,i%2?'#799264':'#98a077',[x,y,-2.84],[.85,1.4,.4]);}
 root.traverse(o=>{if(!o.userData.layoutId)return;o.userData.furnishingKind=o.userData.layoutId.includes('pot-')?'plant':o.userData.layoutId.includes('cushion')?'cushion':'wood';const meshes=[];function collect(n){if(n!==o&&n.userData.layoutId)return;if(n.isMesh&&n.material.color){n.material=n.material.clone();n.userData.originalColor=n.material.color.clone();meshes.push(n);}n.children.forEach(collect);}collect(o);o.userData.tintMeshes=meshes;});
 mergeStatic(root);return root;
}
export class Pond{
 constructor(root){
  this.root=root;this.residents=new Map();this.ripples=[];this.time=0;
  const waterMaterial=new T.ShaderMaterial({uniforms:{time:{value:0},night:{value:0}},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 vUv;uniform float time;uniform float night;void main(){vec2 p=vUv*2.-1.;float wave=sin(p.x*22.+sin(p.y*11.+time*.2)*2.)*sin(p.y*19.-time*.3);float glint=pow(max(0.,wave),12.);vec3 c=mix(vec3(.25,.52,.51),vec3(.44,.67,.62),vUv.y);c+=glint*.09;c=mix(c,c*vec3(.48,.66,.88),night);gl_FragColor=vec4(c,1.);}`});
  this.water=new T.Mesh(new T.CircleGeometry(1,80),waterMaterial);this.water.rotation.x=-Math.PI/2;this.water.scale.set(pond.rx*.98,pond.rz*.98,1);this.water.position.set(pond.x,pond.y,pond.z);this.water.userData.water=true;root.add(this.water);
 }
 sync(records){
  const live=records.filter(r=>r.form==='fish'&&r.spot==='pond'),ids=new Set(live.map(r=>r.id));
  for(const [id,res]of this.residents)if(!ids.has(id)){this.dispose(res.mesh);this.residents.delete(id);}
  for(const r of live){const signature=JSON.stringify(r.palette);let res=this.residents.get(r.id);if(res?.signature===signature){res.mesh.userData.traceTitle=r.title;continue;}if(res)this.dispose(res.mesh);
   const seed=seedFor(r.id),mesh=fish({palette:r.palette,roundness:.95,frills:5+seed%4,feature:'pearl-flow'});mesh.scale.setScalar(.22);mesh.userData.recordId=r.id;mesh.userData.traceTitle=r.title;mesh.position.y=pond.y+.20;this.root.add(mesh);res={mesh,signature,state:makeSwimmer(r.id)};this.residents.set(r.id,res);
  }
 }
 tap(x,z){const id=beckon([...this.residents.values()].map(r=>r.state),x,z,this.time);const ripple=new T.Mesh(new T.RingGeometry(.09,.105,48),new T.MeshBasicMaterial({color:'#f1e1b4',transparent:true,opacity:.75,depthWrite:false,side:T.DoubleSide}));ripple.rotation.x=-Math.PI/2;ripple.position.set(x,pond.y+.016,z);this.root.add(ripple);this.ripples.push({mesh:ripple,born:this.time});if(this.ripples.length>6)this.dispose(this.ripples.shift().mesh);return id;}
 update(time,dt,reduced){this.time=time;this.water.material.uniforms.time.value=reduced?0:time;for(const res of this.residents.values()){stepSwimmer(res.state,time,dt,reduced);res.mesh.position.set(res.state.x,pond.y+.20,res.state.z);res.mesh.rotation.y=res.state.heading;for(const m of res.mesh.userData.materials)m.userData.lightTime.value=reduced?time*.22:time;}
  this.ripples=this.ripples.filter(r=>{const age=time-r.born;if(age>2.4){this.dispose(r.mesh);return false;}r.mesh.scale.setScalar(1+age*5);r.mesh.material.opacity=Math.max(0,.65-age*.27);return true;});
 }
 dispose(mesh){mesh.removeFromParent();const materials=new Set();mesh.traverse(o=>{o.geometry?.dispose();if(o.material)materials.add(o.material);});materials.forEach(m=>m.dispose());}
}
