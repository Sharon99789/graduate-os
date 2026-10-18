import type{Data}from'./data';import{evidenceItems,evidenceReady}from'./evidence';
export type Conflict={path:string;local:unknown;remote:unknown};
const object=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
function canonical(x:unknown):string{if(x===undefined)return 'undefined';if(Array.isArray(x))return '['+x.map(canonical).join(',')+']';if(object(x))return '{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}';return JSON.stringify(x);}
export const equal=(a:unknown,b:unknown)=>canonical(a)===canonical(b);
export function mergeData(base:Data,local:Data,remote:Data,resolution?:'local'|'remote'){
 const conflicts:Conflict[]=[];
 function merge(b:unknown,l:unknown,r:unknown,path:string):unknown{
  if(equal(l,b))return r;if(equal(r,b)||equal(l,r))return l;
  if(object(l)&&object(r)&&(b===undefined||object(b))){const out:Record<string,unknown>={};const previous=object(b)?b:{};for(const k of new Set([...Object.keys(previous),...Object.keys(l),...Object.keys(r)])){if(['__proto__','constructor','prototype'].includes(k))continue;const value=merge(previous[k],l[k],r[k],path+'.'+k);if(value!==undefined)out[k]=value;}return out;}
  conflicts.push({path,local:l,remote:r});return resolution==='local'?l:r;
 }
 function records<T extends{id:string}>(b:T[],l:T[],r:T[],path:string):T[]{const bm=new Map(b.map(x=>[x.id,x])),lm=new Map(l.map(x=>[x.id,x])),rm=new Map(r.map(x=>[x.id,x]));const out:T[]=[];for(const id of new Set([...rm.keys(),...lm.keys(),...bm.keys()])){const value=merge(bm.get(id),lm.get(id),rm.get(id),path+'.'+id);if(value!==undefined)out.push(value as T);}return out;}
 const data:Data={version:1,achievements:records(base.achievements,local.achievements,remote.achievements,'成果').map(a=>a.evidence?{...a,material:evidenceItems(a).every(item=>evidenceReady(a,item))}:a),tasks:records(base.tasks,local.tasks,remote.tasks,'任务')};const scholarship=merge(base.scholarship,local.scholarship,remote.scholarship,'学业奖准备');if(scholarship!==undefined)data.scholarship=scholarship as Data['scholarship'];return {data,conflicts};
}
