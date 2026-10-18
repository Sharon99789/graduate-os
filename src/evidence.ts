import type{Achievement}from'./types';import{categoryNames}from'./types';
export type EvidenceItem={id:string;label:string;hint:string};
export function evidenceItems(a:Achievement):EvidenceItem[]{let items:EvidenceItem[]=[];const add=(id:string,label:string,hint:string)=>items.push({id,label,hint});
 if(a.category==='paper'){add('paper','论文全文或录用通知',a.status==='accepted'?'保存正式录用通知，以及论文标题和作者页。':'保存论文全文、作者署名和单位页；写作中先留空。');add('index','期刊 / 检索类别证明','保存对应期刊、检索或认定依据。');if(a.authorMode!=='solo')add('consent','共同作者书面同意','国奖多作者成果需要其他作者的书面同意。');if(a.fund)add('fund','基金号页面和负责人签字','保存论文标注基金号的页面及基金负责人签字。');}
 if(a.category==='competition'){add('award','获奖证书或获奖公示','保存能对应奖项、时间、获奖者的证书或正式公示。');add('ranking','作品与团队排名证明','保留作品、名单与原获奖排序；不得改动排名。');add('consent','团队成员书面同意','国奖团队成果按多作者要求保存书面同意。');}
 if(a.category==='patent'){add('patent','受理 / 授权证书','按录入状态保存受理通知书或授权证书。');add('owners','权利人和署名页','保留权利人、本人排名和相关单位信息。');}
 if(a.category==='student'){add('appointment','任职或结业证明','保存岗位、组织和任职时间；培训保存结业证明。');add('workload','A4工作量说明及主管签字','校级社团由负责老师签字；宿舍工作需核定分配。');}
 if(a.category==='volunteer'){add('service','志愿服务证明','包含活动名称、日期、实际时长与负责老师确认。');}
 if(a.category==='practice'){add('completion','实践结项 / 挂职完成证明','有优秀认定时保留对应公示。');add('roster','成员名单与本人分工','多队长分配时保存所有相关人员签字。');}
 if(a.category==='activity'){add('result','参与 / 立项 / 结项 / 获奖认定','保存与所选活动结果一致的正式认定。');add('role','负责人或职责分工证明','多个负责人需要保留工作量分配与签字。');}
 if(['paper','competition','patent'].includes(a.category))add('signature','导师逐项每页签字','学术证明按2026要求逐项每页签字；电子签附沟通截图。');
 return items;
}
export function suggestedName(a:Achievement,item:EvidenceItem){return `${a.date}_${a.title}_${item.label}`.replace(/[<>:"/\\|?*\u0000-\u001f]/g,'_').slice(0,140)+'.pdf';}
export function evidenceReady(a:Achievement,item:EvidenceItem){return a.evidence?.[item.id]?.ready??!!a.material;}
export function evidenceChecklistText(as:Achievement[]){return '# Graduate OS 证明材料保存清单\n\n文件由本人保存在电脑；工作台只保存清单、文件名和准备状态。\n\n'+as.map(a=>'## '+a.title+'\n\n类别：'+categoryNames[a.category]+'；日期：'+a.date+'\n\n'+evidenceItems(a).map(item=>`- [${evidenceReady(a,item)?'x':' '}] ${item.label}\n  文件名：${a.evidence?.[item.id]?.fileName||suggestedName(a,item)}\n  文件夹：${a.evidence?.[item.id]?.folder||'GraduateOS材料/2027申报/'+categoryNames[a.category]}\n  要点：${item.hint}`).join('\n')+'\n').join('\n');}
