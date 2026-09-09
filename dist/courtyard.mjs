import * as T from './vendor/three.module.js';
import {gardenDoor} from './navigation.mjs';
import {fish} from './fish.mjs';
import {pond,makeSwimmer,beckon,stepSwimmer,seedFor} from './pond-state.mjs';
import {box,ball,cyl,rod,plant,archPanel,mergeStatic} from './room.mjs';
function movable(root,id,label,p){const g=new T.Group();g.userData={layoutId:'courtyard/'+id,movable:label,space:'courtyard'};g.position.set(...p);root.add(g);return g;}
export function buildCourtyard(){
 const root=new T.Group();root.name='courtyard';
 box(root,12.6,.28,10.4,'#9d987c',[0,-.16,0],.09);
 box(root,12.43,.06,10.23,'#b7bd98',[0,.005,0],.02);
 // A low walled garden, with a timber arch framing the way home.
 box(root,.2,.72,10.2,'#d9cfb4',[-6.2,.32,0]);box(root,.28,.1,10.23,'#e8dec5',[-6.2,.72,0]);
 box(root,12.42,.85,.18,'#d9cfb4',[0,.39,-5.1]);box(root,12.5,.12,.3,'#ece0c3',[0,.85,-5.1]);
 gardenDoor(root);
 // Stepping stones leave a clear foreground path and room for the pond.
 for(let k=0;k<11;k++){const z=-4.35+k*.85,x=-4.65+Math.sin(k*.8)*.2;const stone=cyl(root,.38,.42,.07,k%2?'#e3d9bd':'#d2c8ad',[x,.065,z]);stone.scale.z=.72;stone.rotation.y=k*.55;}
 const basin=cyl(root,1,1,.12,'#568d8c',[pond.x,.14,pond.z]);basin.scale.set(pond.rx,1,pond.rz);
 for(let k=0;k<35;k++){const a=k/35*Math.PI*2;if(Math.sin(a)>.3&&k%3!==0)continue;const stone=ball(root,.22+(k%4)*.028,k%3?'#c3bea5':'#d7cbb2',[pond.x+Math.cos(a)*pond.rx,.24,pond.z+Math.sin(a)*pond.rz],[1.12,.67,.9]);stone.rotation.y=-a;}
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
 for(let i=0;i<15;i++){const x=-5.9+i*.39,y=.96+Math.sin(i*.52)*.22;ball(root,.11,i%2?'#799264':'#98a077',[x,y,-4.94],[.85,1.4,.4]);}
 for(const o of root.children)if(o.userData.layoutId){o.position.x*=2;o.position.z*=1.65;}
 root.traverse(o=>{if(!o.userData.layoutId)return;o.userData.furnishingKind=o.userData.layoutId.includes('pot-')?'plant':o.userData.layoutId.includes('cushion')?'cushion':'wood';const meshes=[];function collect(n){if(n!==o&&n.userData.layoutId)return;if(n.isMesh&&n.material.color){n.material=n.material.clone();n.userData.originalColor=n.material.color.clone();meshes.push(n);}n.children.forEach(collect);}collect(o);o.userData.tintMeshes=meshes;});
 mergeStatic(root);return root;
}
export class Pond{
 constructor(root){
  this.root=root;this.residents=new Map();this.ripples=[];this.time=0;
  const rippleUniforms=Array.from({length:6},()=>new T.Vector4(0,0,-100,0));
  const waterMaterial=new T.ShaderMaterial({uniforms:{time:{value:0},waveTime:{value:0},night:{value:0},ripples:{value:rippleUniforms}},vertexShader:waterVertex,fragmentShader:waterFragment});
  this.water=new T.Mesh(new T.CircleGeometry(1,128),waterMaterial);this.water.rotation.x=-Math.PI/2;this.water.scale.set(pond.rx*.99,pond.rz*.99,1);this.water.position.set(pond.x,pond.y,pond.z);this.water.userData.water=true;root.add(this.water);

 }
 sync(records){
  const live=records.filter(r=>r.form==='fish'&&r.spot==='pond'),ids=new Set(live.map(r=>r.id));
  for(const [id,res]of this.residents)if(!ids.has(id)){this.dispose(res.mesh);this.residents.delete(id);}
  for(const r of live){const signature=JSON.stringify(r.palette);let res=this.residents.get(r.id);if(res?.signature===signature){res.mesh.userData.traceTitle=r.title;continue;}if(res)this.dispose(res.mesh);
   const seed=seedFor(r.id),mesh=fish({palette:r.palette,roundness:.95,frills:5+seed%4,feature:'pearl-flow'});mesh.scale.setScalar(.22);mesh.userData.recordId=r.id;mesh.userData.traceTitle=r.title;mesh.position.y=pond.y+.20;this.root.add(mesh);res={mesh,signature,state:makeSwimmer(r.id)};this.residents.set(r.id,res);
  }
 }
 tap(x,z){const id=beckon([...this.residents.values()].map(r=>r.state),x,z,this.time);this.ripples.push({x,z,born:this.time});if(this.ripples.length>6)this.ripples.shift();return id;}
 update(time,dt,reduced){this.time=time;const u=this.water.material.uniforms;u.time.value=time;u.waveTime.value=reduced?0:time;this.ripples=this.ripples.filter(r=>time-r.born<5.5);for(let i=0;i<6;i++){const r=this.ripples[i];u.ripples.value[i].set(r?.x||0,r?.z||0,r?.born??-100,r?1:0);}
  for(const res of this.residents.values()){stepSwimmer(res.state,time,dt,reduced);res.mesh.position.set(res.state.x,pond.y+.20,res.state.z);res.mesh.rotation.y=res.state.heading;for(const m of res.mesh.userData.materials)m.userData.lightTime.value=reduced?time*.22:time;}
 }
 dispose(mesh){mesh.removeFromParent();const materials=new Set();mesh.traverse(o=>{o.geometry?.dispose();if(o.material)materials.add(o.material);});materials.forEach(m=>m.dispose());}
}

// Original water shading: slow crossed swells, sky reflections and radial surface slopes.
const waterVertex=`varying vec2 waterXZ;void main(){vec4 p=modelMatrix*vec4(position,1.);waterXZ=p.xz;gl_Position=projectionMatrix*viewMatrix*p;}`;
const waterFragment=`
precision highp float;
varying vec2 waterXZ;
uniform float time;uniform float waveTime;uniform float night;uniform vec4 ripples[6];
void main(){
 vec2 p=waterXZ;float t=waveTime;
 float a=p.x*.83+p.y*.42+t*.16,b=p.x*-.51+p.y*1.08-t*.12;
 float h=sin(a)*.035+sin(b)*.024;
 vec2 slope=vec2(cos(a)*.029-cos(b)*.012,cos(a)*.015+cos(b)*.026);
 float crest=0.;
 for(int i=0;i<6;i++){
  float age=time-ripples[i].z;vec2 offset=p-ripples[i].xy;float d=length(offset);float front=d-age*1.05;
  float band=exp(-front*front/(.19+age*.11));float fade=exp(-max(age,0.)*.55)*(1.-exp(-max(age,0.)*8.))*ripples[i].w;
  float signal=sin(front*17.);float wave=band*fade;
  if(age>=0.&&age<5.5){h+=signal*wave*.036;slope+=offset/max(d,.01)*cos(front*17.)*wave*.19;crest+=max(0.,cos(front*17.))*wave;}
 }
 vec2 bend=p+slope*2.8;
 vec2 ellipse=(p-vec2(1.,.55))/vec2(4.1,3.25);float edge=length(ellipse);
 float depth=1.-smoothstep(.68,1.,edge);
 vec3 col=mix(vec3(.52,.70,.64),vec3(.12,.39,.46),depth);
 float sky=sin(bend.x*.69+sin(bend.y*.74+t*.035)*1.7)*.5+.5;
 float cloud=smoothstep(.60,.94,sky)*(.55+.45*sin(bend.y*.43+t*.025));
 col=mix(col,vec3(.69,.79,.76),cloud*.24);
 float caustic=pow(max(0.,sin(bend.x*5.2+sin(bend.y*3.4-t*.16))*sin(bend.y*5.1+sin(bend.x*3.2+t*.12))),9.);
 col+=vec3(.22,.29,.20)*caustic*.25;
 vec3 normal=normalize(vec3(-slope.x,1.,-slope.y));
 float sheen=pow(max(0.,dot(normal,normalize(vec3(.22,1.,.17)))),36.);
 col+=vec3(.20,.24,.20)*sheen*.35+vec3(.43,.52,.47)*crest*.32;
 col+=h*.30;col=mix(col,col*vec3(.38,.56,.74),night*.8);
 gl_FragColor=vec4(col,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;
