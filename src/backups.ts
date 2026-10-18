import {validData} from './data';import type{Data}from'./data';
const key='graduate-os-backup-history-v1';
export type Backup={at:string;reason:string;data:Data};
export function backups(storage:Pick<Storage,'getItem'>):Backup[]{try{const x=JSON.parse(storage.getItem(key)||'[]');return Array.isArray(x)?x.filter(b=>typeof b.at==='string'&&typeof b.reason==='string'&&validData(b.data)):[]}catch{return []}}
export function checkpoint(storage:Pick<Storage,'getItem'|'setItem'>,data:Data,reason:string,force=false,now=new Date()):boolean{try{const items=backups(storage);if(!force&&items[0]&&new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai'}).format(new Date(items[0].at))===new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai'}).format(now))return true;storage.setItem(key,JSON.stringify([{at:now.toISOString(),reason,data},...items].slice(0,5)));return true}catch{return false}}
