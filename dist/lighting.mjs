import * as T from './vendor/three.module.js';

// Reflective light cards: visible in the fish's curved surface, not the aquarium.
export function jewelEnvironment(renderer) {
  const room = new T.Scene();
  room.background = new T.Color('#091223');
  const cards = [
    [[-4,5,3],[3,6],'#b2d4ff',2.2],
    [[5,2,-3],[2,5],'#6440d7',2.4],
    [[1,5,-4],[4,1],'#27c8b5',2],
    [[-3,-1,-5],[1,4],'#d75a99',1.2],
  ];
  for(const [pos,size,color,power] of cards){
    const material=new T.MeshBasicMaterial({color:new T.Color(color).multiplyScalar(power),side:T.DoubleSide});
    const panel=new T.Mesh(new T.PlaneGeometry(...size),material);
    panel.position.set(...pos);panel.lookAt(0,0,0);room.add(panel);
  }
  const generator=new T.PMREMGenerator(renderer);
  const target=generator.fromScene(room,.08,.1,30);
  generator.dispose();room.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
  return target;
}
