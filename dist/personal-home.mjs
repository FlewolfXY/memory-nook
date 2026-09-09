import {storyExamples} from './demo-memories.mjs';
import {defaultBindings} from './furnishing-data.mjs';
// Authored fictional resident. These notes are not AI inferences about the user.
const sampledPalettes={"moving-day":["#9a8164","#5a3d24","#fce1a1"],"shared-meal":["#5e3c21","#9d643a","#dd9c60"],"reading-window":["#e6d7c0","#82827f","#26251e"]};
const stories=[
 ['story-sunset','搬家那天，先把杯子拿出来','2026-09-03','箱子还没拆完，就先找出了那只绿杯子。蓝条纹抱枕垫在地上，坐着吃了半个饭团。窗户比上一个住处大一点。','moving-day'],
 ['story-sea','夹着车票的那本书','2026-08-17','从旧住处到公司的路，要坐四十分钟地铁。那张薄薄的车票夹在第八十六页，后来换了路线，书签一直没换。'],
 ['story-forest','这次终于读到了下一页','2026-09-07','搬完家四天，才重新打开这本书。抱枕还是旧的，窗外的树却不一样了。那张绿色书签往后挪了两页。','reading-window'],
 ['story-autumn','妈妈口述的番茄面','2026-05-12','电话开着免提，妈妈说先把番茄炒软。我在笔记本上记了三行，最后加了一句：盐要分两次放。'],
 ['story-flowers','小满第一次来新家','2026-09-06','桌子刚好能放下两碗面。小满说这回窗边终于有地方坐了。吃完谁也没立刻起身，我把这张照片挂在最容易看见的位置。','shared-meal'],
 ['story-coffee','缺了一点口，还是这只','2026-03-22','洗杯子时碰掉了边缘一点点釉。小满说换个新的吧。可这是第一次领工资时买的，握起来的手感我已经记住了。'],
 ['story-snow','冬天写到一半的信','2026-01-18','给小满写的信，写着写着变成了这一年的流水账。没有寄出去，夹进了本子里。下次见面，也许可以当面念。'],
 ['story-city','新地址写在最后一页','2026-09-04','上一个地址划掉了，新的写在下面。这个本子跟我搬过两次家。钥匙的样子变了，封皮上的折痕还在。'],
 ['story-picnic','旧窗边带来的条纹','2026-09-03','搬家公司问这只抱枕要不要单独装袋。我说不用，抱着就行。到新屋时，第一件放好的东西就是它。'],
 ['story-lavender','留给来串门的人','2026-09-05','又买了一只小抱枕。平时搭在窗边，有人来的时候，就不用一直坐硬凳子了。小满来的前一天，我把它晒了一下午。'],
 ['story-peach','缝歪的那一小块','2025-12-09','抱枕边角开线了，用剩下的蓝布补了一块。针脚不齐，还扎了手。现在每次摸到这里，就知道哪一面朝上。'],
 ['story-rain','雨天就在这里待着','2026-08-15','那天取消了出门的计划，抱着这个垫子听雨。后来搬家，把沙发让给了下一位租客，这只垫子带走了。']
];
export const personalExamples=stories.map(([id,title,date,note,photo],i)=>({id,title,date,note,image:photo?'/assets/memories/'+photo+'.jpg':null,palette:sampledPalettes[photo]||[['#a8b994','#829ca6','#dbb69c'],['#93a8ad','#d9c8aa','#7c9a82'],['#b6c59f','#8ca8b1','#e4c692']][i%3],form:'card',spot:null,rotation:0,scale:1,parents:[],example:true,resident:'阿禾',personalEdition:1,paletteMethod:photo?'sampled':'authored',...(photo?{generatedImage:true}: {})}));
export const personalBindings={...defaultBindings};
for(const id of ['book-01','book-08','book-15','book-17'])delete personalBindings['living-room/'+id];
Object.assign(personalBindings,{'living-room/wall-frame-1':'story-flowers','living-room/cup':'story-coffee','living-room/table-books':'story-forest'});
// story-sunset is the box itself: one photo, one displayed object.
Object.assign(personalExamples[0],{form:'box',spot:'side',position:[2.25,.04,1.6],scale:1});
const extra=[
 {id:'home-tote',title:'门边总是这个帆布袋',date:'2026-09-04',note:'钥匙、折叠伞和楼下超市的收据。袋子没有固定用途，反正出门时顺手一拎就走。搬家那天，绿杯子也是放在这里带过来的。',form:'tote',spot:'side',position:[2.9,.04,.35],palette:['#e5d2ad','#8fa88b','#ba8a72']},
 {id:'home-rabbit',title:'行李箱里给它留一点地方',date:'2026-09-03',note:'耳朵有一边总是垂着，是很多年前小满送的。搬家前说要少带点东西，最后还是给它留了一个角落。先让它坐在窗边吧。',form:'rabbit',spot:'window',position:[-1.68,.79,-2.43],palette:['#d8c4ac','#b7a2bf','#a4b496']}
].map(r=>({...r,rotation:0,scale:1,parents:[],example:true,resident:'阿禾',personalEdition:1,paletteMethod:'authored',image:null}));

const homeOrigins=[
 ['lamp','floor-lamp','睡前只留这一盏','2026-09-04','顶灯太亮了。搬进来第二晚，把旧落地灯接好，晚上读书就只开它。屋子终于有了一小块熟悉的光。'],
 ['plant','shelf-plant','从小满家剪来的一枝','2026-04-21','小满说插在水里就能活，我将信将疑地拿回来了。后来真的长了根。搬家时专门用纸包住花盆，生怕把新叶碰坏。'],
 ['sofa','sofa','终于能把腿蜷起来','2026-09-02','二手转来的小沙发，比原来想买的小一点。和小满抬上来时在楼梯口歇了两次。现在觉得，小一点也刚刚好。'],
 ['shelf','bookcase','留了一层空位','2026-09-05','把几本旧书按读过的顺序放好。下面那层先空着，不急着买东西填满。也许以后会有想带回家的东西。'],
 ['rug','rug','冬天赤脚也不凉','2025-11-28','买的时候量错了尺寸，多出来一小截。后来搬到这里，反而正好铺在茶几下面。'],
 ['table','coffee-table','两碗面刚好放得下','2026-09-06','桌面上有一小圈旧杯印，擦不掉。小满说不用管，等我们在这里吃过几顿饭，它就不算别人的旧桌子了。']
].map(([key,prop,title,date,note])=>({prop:'living-room/'+prop,record:{id:'home-'+key,title,date,note,form:'card',spot:null,rotation:0,scale:1,parents:[],palette:['#a8b994','#c9ab88','#dcc9ad'],image:null,example:true,personalEdition:1,resident:'阿禾',paletteMethod:'authored'}}));

export const personalPhotoPaths=personalExamples.map(r=>r.image).filter(Boolean);
export function upgradePersonalHome(home,edition){
 if(edition===1)return home;
 const changed=new Set();
 for(const old of storyExamples){const r=home.records.find(x=>x.id===old.id);if(!r||!r.example||r.title!==old.title||r.note!==old.note||r.image!==old.image||r.spot||r.position||r.parentId||JSON.stringify(r.palette)!==JSON.stringify(old.palette)||r.parents?.length)continue;
  const bindings=Object.entries(home.bindings).filter(([,id])=>id===r.id);
  // An edited association is the user's choice, even when it still has the stock note.
  if(!bindings.length||bindings.some(([p,id])=>defaultBindings[p]!==id))continue;
  const fresh=personalExamples.find(x=>x.id===r.id);Object.assign(r,structuredClone(fresh));delete r.photoCredit;changed.add(r.id);
 }
 for(const [prop,id]of Object.entries(home.bindings))if(changed.has(id)&&defaultBindings[prop]===id)delete home.bindings[prop];
 for(const [prop,id]of Object.entries(personalBindings))if(changed.has(id)&&!home.bindings[prop])home.bindings[prop]=id;
 // Do not manufacture missing samples in a deliberately emptied personal home.
 if(changed.size){for(const r of extra)if(!home.records.some(x=>x.id===r.id))home.records.push(structuredClone(r));for(const {prop,record}of homeOrigins)if(!home.bindings[prop]&&!home.records.some(x=>x.id===record.id)){home.records.push(structuredClone(record));home.bindings[prop]=record.id;}}
 for(const r of home.records)if(['metro','sunset','note'].includes(r.id)&&r.example&&!r.personalEdition&&!r.parents?.length){
  // Preserve old captures; retire only the untouched supplied scenic examples.
  const titles={metro:'车窗里叠着另一个自己',sunset:'晚霞的一小块',note:'不必把每一天都填满'};
  const notes={metro:'昏黄的地铁灯光，橙绿的座位。那一下奇异的感觉，想把它留住。',sunset:'粉色慢慢退下去，蓝灰色的天还亮着。',note:'今天没有发生什么大事，只是坐了一会儿。这样也很好。'};
  if(r.title===titles[r.id]&&r.note===notes[r.id]&&!r.image&&!r.position){r.spot=null;r.retiredExample=true;}
 }
 return home;
}
export const residentLinks={
 'story-sunset':['story-picnic','story-coffee','home-tote'],
 'story-picnic':['story-sunset','story-forest'],
 'story-forest':['story-sea','story-picnic'],
 'story-sea':['story-forest'],
 'story-flowers':['story-autumn','story-lavender','story-coffee'],
 'story-autumn':['story-flowers'],
 'story-coffee':['story-flowers','story-sunset'],
 'story-lavender':['story-flowers'],
 'home-rabbit':['story-snow','story-sunset'],
 'home-tote':['story-sunset','story-city'], 'home-lamp':['story-forest','story-snow'], 'home-plant':['story-flowers'], 'home-sofa':['story-rain','story-flowers'], 'home-shelf':['story-city','story-sea'], 'home-table':['story-flowers','story-coffee'], 'home-rug':['story-rain','story-sunset']
};
