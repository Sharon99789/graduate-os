import type {Achievement,Score} from './types';
// 个人规划模拟分：未公布或有歧义的口径在规则页披露，不冒充学校核定。
export function score(a:Achievement):Score{
 const kind=['student','volunteer','practice','activity'].includes(a.category)?'moral':'academic';
 const out=(value:number|null,reason:string,source:string):Score=>({value,reason,source,kind,blocked:value===null});
 if(a.used)return out(0,'已用于获奖申报，本次不重复计分。','2026国奖通知 参评说明③');
 if(a.category==='paper'){
  if(['writing','submitted'].includes(a.status))return out(0,'写作 / 投稿阶段，先记录进度；录用后开始计分。','学术细则（二）10');
  const base=a.paperVenue==='conference'?2:Number(a.level);if(![30,20,15,10,2].includes(base))return out(null,'请选择论文类别。','学术细则（二）1–6');
  if(a.rank>=4&&a.authorMode!=='mentor'&&a.authorMode!=='cofirst')return out(0,'第4作者及以后不计分。','学术细则（二）12');
  if(a.authorMode==='solo'&&a.rank!==1)return out(null,'单一作者请选第1作者。','学术细则（二）11–12');
  const count=a.cofirstCount??2;
  if(a.authorMode==='cofirst'&&(!Number.isInteger(count)||count<1))return out(null,'请填写共同一作人数。','学术细则（二）11');
  const half=a.status==='accepted'?.5:1;
  const factor=a.authorMode==='solo'?1:a.authorMode==='cofirst'?1/count:a.authorMode==='mentor'?.7:a.rank===1?.7:a.rank===2?.3:.2;
  const contribution=a.authorMode==='cofirst'?` ÷ ${count}（共同一作均分）`:a.authorMode==='mentor'?' × 70%（等同多人第一作者）':` × ${Math.round(factor*100)}%`;
  return out(base*factor*half*(a.fund?1.5:1),`${base}${a.paperVenue==='conference'?'（会议论文按一般类）':''}${contribution}${half===.5?' × 50%（仅录用）':''}${a.fund?' × 150%（基金附加）':''}`,'学术细则（二）1–13、（四）3');
 }
 if(a.category==='competition'){
  const bases=a.level.startsWith('i')?[30,20,10,5]:[20,10,5,2];const base=bases[Number(a.level.slice(1))];
  if(base===undefined||!Number.isInteger(a.rank)||a.rank<1)return out(null,'请选择等级与团队排名。','学术细则（六）1–3');
  const factor=a.rank===1?1:a.rank===2?.6:a.rank===3?.4:.2;
  return out(base*factor,`${base} × ${factor*100}%（团队第${a.rank}名）`,'学术细则（六）1–3');
 }
 if(a.category==='patent'){
  const base=a.level==='authorized'?30:10;const factor=a.authorMode==='solo'?1:a.authorMode==='mentor'?.7:a.rank===1?.7:a.rank===2?.3:0;
  return out(base*factor,`${base} × ${factor*100}%${a.authorMode==='mentor'?'（按多人第一位模拟）':''}`,'学术细则（五）1–3');
 }
 if(a.category==='student'){
  const base=Number(a.level);if(![4,2,.5,1].includes(base))return out(null,'请选择岗位类别。','德育细则1');
  return out(base,base===.5?'按宿舍共0.5分模拟。':`${base}分${base!==1?'（按完整学年模拟）':'（结业）'}`,'德育细则1');
 }
 if(a.category==='practice'){
  if(a.level==='placement')return out(5,'规定范围挂职完成：5分。','2026德育细则4');
  const base=({completed:1,college:2,school:4} as Record<string,number>)[a.level];
  if(base===undefined)return out(null,'请选择实践结果。','2026德育细则4');
  return out(base*(a.rank===1?1:.5),`${base} × ${a.rank===1?'100%（队长）':'50%（队员）'}`,'2026德育细则4');
 }
 if(a.category==='activity'){
  const base=({basic:1,'basic-excellent':2,key:2,'key-excellent':4,'project-college':1,'project-school':2,participation:.5,'award-college':1,'award-school':2,'award-city':5,'award-national':10} as Record<string,number>)[a.level];
  return out(base??null,base===undefined?'请选择活动结果。':`${base}分（单项最高结果，负责人份额按个人模拟）`,'2026德育细则2');
 }
 if(a.organizer!=='approved')return out(0,'校外或专业系所活动不计德育志愿分。','德育细则5及证明要求');
 if(a.hours<0||!Number.isFinite(a.hours))return out(null,'请填写有效服务时长。','德育细则5');
 return out(Math.min(a.hours,8)*.1,`${Math.min(a.hours,8)}小时 × 0.1${a.hours>8?'（每日上限8小时）':''}`,'德育细则5');
}
export function competitionPreview(a:Achievement){return score({...a,category:'competition',used:false}).value??0;}
export function totals(as:Achievement[]){
 let academic=0,moralOther=0,blocked=0;const days=new Map<string,number>();
 for(const a of as){const s=score(a);if(s.value===null){blocked++;continue;}if(s.kind==='academic')academic+=s.value;else if(a.category==='volunteer'&&!a.used&&a.organizer==='approved')days.set(a.date,(days.get(a.date)??0)+a.hours);else moralOther+=s.value;}
 const volunteer=Math.min(8,[...days.values()].reduce((n,h)=>n+Math.min(h,8)*.1,0));const moral=Math.min(15,moralOther+volunteer);
 return {academic,moral,total:academic+moral,blocked};
}
