import * as T from './vendor/three.module.js';

// A bounded, authored body plan. Local +X is the nose; -X is the tail.
// All parts use the same local-space deformation, including eyes and fin rays.
export function fish(g) {
  const root = new T.Group(), materials = [];
  // Expand captured hues into a jewel palette without altering the source genome.
  const colors = g.palette.map((c,i) => {const hsl={};new T.Color(c).getHSL(hsl);return new T.Color().setHSL((hsl.h+[.07,.13,.015][i])%1,Math.max(.76,hsl.s),[.31,.43,.53][i]);});
  const height = .72 + T.MathUtils.clamp(g.roundness, .5, 1.2) * .16;
  function material(fin = false, color = null) {
    const m = new T.MeshPhysicalMaterial({
      color: color || '#ffffff', vertexColors: !color,
      roughness: fin ? .27 : .32, metalness: color ? .05 : .36,
      clearcoat: color ? .4 : .48, clearcoatRoughness: .2,
      iridescence: color ? 0 : .85, iridescenceIOR: 1.38,
      iridescenceThicknessRange: [120, 520], envMapIntensity: .7,
      side: fin ? T.DoubleSide : T.FrontSide,
      transparent: fin, opacity: fin ? .86 : 1, depthWrite: !fin,
    });
    m.userData.lightTime = {value: 0};
    m.onBeforeCompile = shader => {
      shader.uniforms.fishTime = m.userData.lightTime;
      shader.uniforms.flowA={value:colors[0]};shader.uniforms.flowB={value:colors[1]};shader.uniforms.flowC={value:colors[2]};
      shader.uniforms.finFlex = {value: fin ? 1 : 0};
      shader.uniforms.pearlFlow = {value: g.feature === 'pearl-flow' ? 1 : 0};
      const deform = (fin ? 'attribute float finWeight;\n' : 'const float finWeight=0.;\n') + `
        uniform float fishTime; uniform float finFlex;
        varying vec3 fishPosition; varying vec2 fishUV; varying float fishEdge;
        float fishBend(vec3 p) {
          float tail = max(0., .55-p.x);
          float wave = sin(fishTime*2.1+tail*1.4);
          float bend = .055*min(tail*tail,2.6)*wave;
          float loose = pow(max(finWeight,0.),1.65);
          float trailing = sin(fishTime*1.8-tail*1.65-finWeight*2.4+p.y*1.1);
          float ripple = sin(fishTime*2.7-tail*2.6+p.y*4.5);
          return bend + finFlex*loose*(.38*trailing+.095*ripple);

        }
      `;
      shader.vertexShader = deform + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace('#include <beginnormal_vertex>', `
        #include <beginnormal_vertex>
        float dx=(fishBend(position+vec3(.002,0.,0.))-fishBend(position-vec3(.002,0.,0.)))/.004;
        float dy=(fishBend(position+vec3(0.,.002,0.))-fishBend(position-vec3(0.,.002,0.)))/.004;
        objectNormal=normalize(vec3(objectNormal.x-dx*objectNormal.z,objectNormal.y-dy*objectNormal.z,objectNormal.z));
      `);
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
        #include <begin_vertex>
        fishPosition=position;fishUV=uv;fishEdge=finWeight;
        transformed.z+=fishBend(position);
      `);
      shader.fragmentShader = `varying vec3 fishPosition;varying vec2 fishUV;varying float fishEdge;
        uniform float fishTime;uniform float pearlFlow;uniform vec3 flowA;uniform vec3 flowB;uniform vec3 flowC;
        float flowField(vec2 p){return sin(p.x+sin(p.y*1.7))*.55+sin(p.y*.8-p.x*.6)*.3+sin(p.x*2.3+p.y*1.4)*.15;}
      ` + shader.fragmentShader;
      if(!color){
        shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>', `
          #include <color_fragment>
          vec2 current=vec2(fishPosition.x*1.8-fishTime*.18,fishPosition.y*2.8+fishUV.y*1.2);
          float field=flowField(current);
          float ribbon=.5+.5*sin(field*3.8+fishPosition.x*1.3-fishTime*.22);
          float filament=pow(.5+.5*sin(field*8.+fishPosition.y*5.-fishTime*.35),14.);
          vec3 flowing=mix(flowA,flowB,smoothstep(.12,.85,ribbon));
          flowing=mix(flowing,flowC,filament*.55);
          float underside=(1.-smoothstep(-.65,.65,fishPosition.y));
          diffuseColor.rgb=flowing*mix(.55,1.05,underside);
          ${fin ? 'diffuseColor.a=mix(.93,.4,pow(fishEdge,1.7));' : ''}
        `);
        shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>', `
          #include <roughnessmap_fragment>
          float ribs=pow(.5+.5*cos(fishUV.y*100.+sin(fishUV.x*14.)*.4),10.);
          roughnessFactor=clamp(roughnessFactor-ribs*.1,.14,.5);
        `);
        shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>', `
          #include <emissivemap_fragment>
          float facing=abs(dot(normalize(normal),normalize(vViewPosition)));
          float rim=pow(1.-facing,2.7);
          vec3 spectral=.5+.5*cos(6.28318*(vec3(.02,.35,.67)+facing*.8+field*.13));
          totalEmissiveRadiance+=diffuseColor.rgb*.14+spectral*rim*.18;
          totalEmissiveRadiance+=flowC*filament*${fin ? '.18' : '.07'};
          float pearlBand=pow(.5+.5*sin(fishPosition.x*5.-fishTime*1.4),10.);
          totalEmissiveRadiance+=flowC*pearlBand*pearlFlow*.4;
        `);
      }

    };
    m.customProgramCacheKey = () => 'worldseed-fish-flow-4-'+(color?'eye':fin?'fin':'body');
    materials.push(m); return m;
  }
  const bodyMat=material(), finMat=material(true);
  function surface(n,m,point,color,mat,flex=()=>0){
    const p=[],c=[],uv=[],idx=[],weights=[];
    for(let i=0;i<=n;i++)for(let j=0;j<=m;j++){
      const u=i/n,v=j/m;p.push(...point(u,v));c.push(...color(u,v).toArray());uv.push(u,v);weights.push(flex(u,v));
      if(i<n&&j<m){const a=i*(m+1)+j;idx.push(a,a+1,a+m+1,a+1,a+m+2,a+m+1);}
    }
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('normal',new T.Float32BufferAttribute(new Float32Array(p.length),3));geo.setAttribute('color',new T.Float32BufferAttribute(c,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setAttribute('finWeight',new T.Float32BufferAttribute(weights,1));geo.setIndex(idx);geo.computeVertexNormals();root.add(new T.Mesh(geo,mat));
  }
  // Smooth closed hull: narrow peduncle, full shoulder, small rounded muzzle.
  surface(80,48,(u,v)=>{
    const a=v*Math.PI*2,x=-1.13+2.28*u;
    const radius=Math.pow(Math.sin(Math.PI*u),.66)*(.57+.51*u);
    return [x,Math.cos(a)*radius*height,Math.sin(a)*radius*.54];
  },(u,v)=>{
    const belly=.5-.5*Math.cos(v*Math.PI*2);
    const col=colors[0].clone().lerp(colors[1],u*.52);
    col.lerp(colors[2],belly*.12);
    const scales=Math.pow(Math.max(0,Math.cos(u*95+Math.sin(v*Math.PI*36)*.7)),18)*.06;
    return col.multiplyScalar(.77+.23*belly+scales);
  },bodyMat);
  // Caudal fin fans out from a compact root; seeded frills control scalloping.
  surface(56,64,(u,v)=>{
    const a=(v-.5)*2.5;
    const length=2.25+.26*Math.cos(a*2)+.075*Math.cos(v*Math.PI*2*g.frills);
    return [-1.01-u*length*Math.cos(a*.63),Math.sin(a)*Math.pow(u,.8)*1.42,.075*Math.sin(v*Math.PI*16+u*3)*u*u];
  },(u,v)=>{
    const ray=Math.pow(.5+.5*Math.cos(v*Math.PI*32),12);
    return colors[0].clone().lerp(colors[1],u*.8).lerp(colors[2],Math.pow(u,4)*.65+ray*.17);
  },finMat,(u,v)=>u);
  // Dorsal and anal fins follow the back/belly; no worm-like streamers.
  for(const side of [1,-1])surface(48,28,(u,v)=>{
    const x=.7-u*1.7,arc=Math.pow(Math.sin(Math.PI*u),.8);
    const bodyU=(x+1.13)/2.28;
    const base=side*(Math.pow(Math.sin(Math.PI*bodyU),.66)*(.57+.51*bodyU)*height-.035);
    return [x-Math.pow(v,1.2)*arc*1.05,base+side*v*arc*(side>0?1.02:.72),.065*Math.sin(u*28+v*3)*v*v];
  },(u,v)=>colors[0].clone().lerp(colors[1],v*.6).lerp(colors[2],v*v*.5),finMat,(u,v)=>v);
  // Paired pectoral fins angle outwards from the shoulders.
  for(const side of [-1,1])surface(16,24,(u,v)=>{
    const a=(v-.5)*1.6;
    return [.38-u*(.5+.18*Math.cos(a)),-.12-u*(.17+.27*Math.sin(a)),side*(.41+u*.58*Math.cos(a))];
  },(u,v)=>colors[0].clone().lerp(colors[2],u*.65),finMat,(u,v)=>u);
  function ellipsoid(pos,scale,mat){const mesh=new T.Mesh(new T.SphereGeometry(1,24,16),mat);mesh.position.set(...pos);mesh.scale.set(...scale);root.add(mesh);}
  const iris=material(false,g.palette[2]),black=material(false,'#061b25'),white=material(false,'#ffffff');
  for(const side of [-1,1]){
    ellipsoid([.72,.17,side*.337],[.181,.198,.088],iris);
    ellipsoid([.751,.178,side*.408],[.125,.143,.046],black);
    ellipsoid([.781,.232,side*.449],[.033,.036,.012],white);
    // Thin curved gill cover, embedded in the cheek.
    const points=[];for(let i=0;i<=20;i++){const a=-1.12+i/20*2.24;points.push(new T.Vector3(.42-.105*Math.cos(a),.01+.31*Math.sin(a),side*(.421+.037*Math.cos(a))));}
    root.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),24,.009,4,false),iris));
  }
  ellipsoid([1.12,-.035,0],[.024,.023,.068],iris);
  root.userData.materials=materials;
  return root;
}
