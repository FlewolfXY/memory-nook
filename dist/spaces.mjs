export const courtyardIds=['bench','table','pot-lavender','pot-sage','pot-rose','watering-can','lantern','seat-cushion'].map(s=>'courtyard/'+s);
export const gardenSpots=[{id:'garden-table',name:'院子石台',p:[-3.9,.79,1.98],space:'courtyard',owner:'courtyard/table'},{id:'garden-bench',name:'长凳',p:[-1.6,.67,-3.927],space:'courtyard',owner:'courtyard/bench'}];
export const spotSpace=id=>id==='pond'||id?.startsWith('garden-')?'courtyard':'living-room';
export const gardenBounds={x:5.95,z:4.85};
