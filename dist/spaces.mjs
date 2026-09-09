export const courtyardIds=['bench','table','pot-lavender','pot-sage','pot-rose','watering-can','lantern','seat-cushion'].map(s=>'courtyard/'+s);
export const gardenSpots=[{id:'garden-table',name:'院子石台',p:[-1.95,.79,1.2],space:'courtyard',owner:'courtyard/table'},{id:'garden-bench',name:'长凳',p:[-.8,.67,-2.38],space:'courtyard',owner:'courtyard/bench'}];
export const spotSpace=id=>id==='pond'||id?.startsWith('garden-')?'courtyard':'living-room';
