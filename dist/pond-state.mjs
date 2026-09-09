// Pure bounded motion: tapping never creates residents or changes source data.
export const pond={x:1,z:.55,rx:4.1,rz:3.25,y:.31};
export function seedFor(id){let n=2166136261;for(const c of id)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
export function inside(x,z,margin=1){return ((x-pond.x)/(pond.rx*margin))**2+((z-pond.z)/(pond.rz*margin))**2<=1;}
export function clampTarget(x,z,margin=.66){const dx=x-pond.x,dz=z-pond.z,q=Math.hypot(dx/(pond.rx*margin),dz/(pond.rz*margin));return {x:pond.x+dx/Math.max(1,q),z:pond.z+dz/Math.max(1,q)};}
export function makeSwimmer(id){const seed=seedFor(id),phase=(seed%6283)/1000;return{id,phase,x:pond.x+Math.cos(phase)*2.1,z:pond.z+Math.sin(phase)*1.55,heading:0,target:null,until:0};}
export function beckon(swimmers,x,z,time){const p=clampTarget(x,z);const chosen=[...swimmers].sort((a,b)=>(a.x-p.x)**2+(a.z-p.z)**2-((b.x-p.x)**2+(b.z-p.z)**2))[0];if(chosen){chosen.target=p;chosen.until=time+15;}return chosen?.id||null;}
export function stepSwimmer(s,time,delta,reduced=false){
 const dt=Math.min(.05,Math.max(0,delta));if(s.target&&time>s.until)s.target=null;
 const target=s.target||{x:pond.x+Math.cos(time*.09+s.phase)*2.35,z:pond.z+Math.sin(time*.11+s.phase)*1.72};
 const dx=target.x-s.x,dz=target.z-s.z,d=Math.hypot(dx,dz);
 const distance=Math.min(d,dt*(s.target?.65:reduced?.075:.25));
 if(d>.012){const desired=Math.atan2(-dz,dx),difference=Math.atan2(Math.sin(desired-s.heading),Math.cos(desired-s.heading));s.heading+=difference*(1-Math.exp(-dt*3));s.x+=dx/d*distance;s.z+=dz/d*distance;}
 const p=clampTarget(s.x,s.z,.72);s.x=p.x;s.z=p.z;return s;
}
