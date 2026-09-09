// Measured source colors stay separate from the softer colors used by the room.
export function extractPalette(pixels) {
  const buckets=new Map();
  for(let i=0;i<pixels.length;i+=4){
    if(pixels[i+3]<128)continue;
    const rgb=[pixels[i],pixels[i+1],pixels[i+2]],hi=Math.max(...rgb),lo=Math.min(...rgb);
    if(hi<24||lo>242)continue;
    const key=rgb.map(v=>Math.round(v/32)).join(',');
    const b=buckets.get(key)||{n:0,sum:[0,0,0],weight:0};
    b.n++;rgb.forEach((v,k)=>b.sum[k]+=v);b.weight+=.35+(hi-lo)/255;buckets.set(key,b);
  }
  const candidates=[...buckets.values()].sort((a,b)=>b.weight-a.weight).map(b=>b.sum.map(v=>Math.round(v/b.n)));
  const picked=[];
  for(const c of candidates){if(picked.every(p=>Math.hypot(...c.map((v,k)=>v-p[k]))>65))picked.push(c);if(picked.length===3)break;}
  while(picked.length<3)picked.push(picked[0]||[177,170,151]);
  return picked.map(c=>'#'+c.map(v=>v.toString(16).padStart(2,'0')).join(''));
}
function hsl(hex){const [r,g,b]=hex.match(/[a-f\d]{2}/gi).map(v=>parseInt(v,16)/255),hi=Math.max(r,g,b),lo=Math.min(r,g,b),d=hi-lo,l=(hi+lo)/2;let h=0,s=0;if(d){s=d/(1-Math.abs(2*l-1));h=hi===r?((g-b)/d)%6:hi===g?(b-r)/d+2:(r-g)/d+4;h=((h/6)+1)%1;}return[h,s,l];}
function rgb([h,s,l]){const a=s*Math.min(l,1-l),f=n=>{const k=(n+h*12)%12;return l-a*Math.max(-1,Math.min(k-3,9-k,1));};return[0,8,4].map(n=>Math.round(f(n)*255));}
export function roomPalette(colors,kind='object'){
  return colors.map((hex,i)=>{let[h,s,l]=hsl(hex);const cloth=kind==='cushion'||kind==='sofa';s=Math.min(cloth?.43:.63,s*.85);l=Math.max(cloth?.55:.40,Math.min(cloth?.72:.65,l));if(kind==='book')l=Math.min(.66,l+[.03,.08,-.02][i]);const c=rgb([h,s,l]);return'#'+c.map((v,k)=>Math.round(v*.92+[239,224,201][k]*.08).toString(16).padStart(2,'0')).join('');});
}
