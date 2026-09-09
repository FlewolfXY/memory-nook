// Resolve legacy bundled photo paths at the app directory, including Pages subpaths.
export function assetURL(path,base=import.meta.url){
  return typeof path==='string'&&path.startsWith('/assets/memories/')?new URL('.'+path,base).href:path;
}
