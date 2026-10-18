export type CheckValue='yes'|'no'|'unknown';
export type ScholarshipState={checks:Record<string,CheckValue>;materials:Record<string,boolean>;stage:string;courseNote:string;};
export const defaultScholarship:ScholarshipState={checks:{},materials:{},stage:'preparing',courseNote:''};
export const eligibilityChecks=[
{id:'scope',text:'已取得正式学籍，属于全日制且纳入全国研究生招生计划',source:'第二条'},
{id:'nationality',text:'具有中华人民共和国国籍，且无固定工资收入',source:'第二条'},
{id:'duration',text:'处于规定学制内，未延期',source:'第八条'},
{id:'values',text:'符合爱国、拥护党的领导、守法守规的基本条件',source:'第五条'},
{id:'discipline',text:'申请截止日不处于纪律处分期',source:'第七条（一）'},
{id:'honesty',text:'诚实守信，无经查证属实的学术不端行为',source:'第五条、第七条（二）'},
{id:'credits',text:'参评时没有积欠学分',source:'第七条（三）'},
{id:'registration',text:'参评学年没有休学或保留学籍',source:'第七条（四）'},
{id:'attendance',text:'未因因私出国、创业等原因离校不在校学习',source:'第七条（五）'},
{id:'tuition',text:'没有无故欠缴学费',source:'第七条（六）'},
{id:'participation',text:'积极参与科学研究与社会实践',source:'第五条（四）'},
];
export const scholarshipMaterials=[{id:'application',text:'学业奖学金申请表',source:'第十三条、附表1'},{id:'summary',text:'成果统计表（可使用下方共用档案导出）',source:'第十三条、附表2'},{id:'mentor',text:'导师批准与签字',source:'第十三条'},{id:'college',text:'确认学院当年度一等评审细则、金额、比例和提交要求',source:'第四条、第十二条'}];
export function eligibilityStatus(state:ScholarshipState){const values=eligibilityChecks.map(c=>state.checks[c.id]||'unknown');if(values.includes('no'))return{label:'存在资格不满足项',kind:'no'};if(values.includes('unknown'))return{label:`待完成自查 ${values.filter(v=>v==='unknown').length}项`,kind:'unknown'};return{label:'基本条件自查通过',kind:'yes'};}
export const stages:Record<string,string>={preparing:'准备中',submitted:'已提交',college:'学院公示',school:'学校公示',awarded:'已获奖',notAwarded:'本次未获奖'};
export function validScholarship(x:unknown):x is ScholarshipState{if(!x||typeof x!=='object')return false;const s=x as ScholarshipState;return !!s.checks&&typeof s.checks==='object'&&!Array.isArray(s.checks)&&Object.values(s.checks).every(v=>['yes','no','unknown'].includes(v))&&!!s.materials&&typeof s.materials==='object'&&!Array.isArray(s.materials)&&Object.values(s.materials).every(v=>typeof v==='boolean')&&typeof s.stage==='string'&&Object.hasOwn(stages,s.stage)&&typeof s.courseNote==='string';}
import type{Achievement}from'./types';import{categoryNames}from'./types';
export function scholarshipCsv(state:ScholarshipState,achievements:Achievement[]){
 const cell=(x:unknown)=>{let s=String(x??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'};
 const rows:unknown[][]=[['用途','类别','名称或项目','日期或任期','本人排序或职责','材料状态','备注','期刊或会议','发表状态','DOI','基金名称与编号'],['学业一等奖准备','申报进度',stages[state.stage],'','','',state.courseNote],...achievements.map(a=>['候选成果',categoryNames[a.category],a.title,a.termStart?`${a.termStart} 至 ${a.termEnd||'进行中'}`:a.date,a.roleName||a.rank,a.material?'已准备':'待准备',a.note,a.journalName||'',a.category==='paper'?({writing:'写作中',submitted:'已投稿',accepted:'已录用',published:'已发表'} as Record<string,string>)[a.status]||a.status:'',a.doi||'',`${a.fundName||''} ${a.fundNumber||''}`.trim()]),...eligibilityChecks.map(c=>['资格自查',c.source,c.text,'','',({yes:'符合',no:'不符合',unknown:'未确认'})[state.checks[c.id]||'unknown'],'']),...scholarshipMaterials.map(m=>['材料清单',m.source,m.text,'','',state.materials[m.id]?'已准备':'待准备',''])];
 return '\uFEFF'+rows.map(r=>[...r,...Array(Math.max(0,11-r.length)).fill('')].map(cell).join(',')).join('\r\n');
}
