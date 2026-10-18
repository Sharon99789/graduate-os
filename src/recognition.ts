/** Name-based personal planning suggestions, not a college recognition directory. */
export function suggestCompetition(name:string,currentLevel='d0'){
 const scope=/国际|全球|世界|international|global|world|\bUIA\b|\bIFLA\b/i.test(name)?'i':'d';
 const tier=suggestAward(name)??(/^[id][0-3]$/.test(currentLevel)?currentLevel[1]:'0');
 return {level:scope+tier,scope,reason:scope==='i'?'名称含国际 / 全球等关键词，建议按国际类模拟':'建议按国内类模拟；国内重要赛事可手动调整'};
}
export function suggestAward(text:string):string|undefined{
 if(/一等奖|一等獎|first\s+prize/i.test(text))return '0';
 if(/二等奖|二等獎|second\s+prize/i.test(text))return '1';
 if(/三等奖|三等獎|third\s+prize/i.test(text))return '2';
 if(/佳作|提名|honou?rable\s+mention/i.test(text))return '3';
 return undefined;
}
export function suggestStudentRole(text:string):{level:string;label:string}|null{
 const name=text.replace(/\s/g,'');
 if(/副班长|副班長|副书记|副書記|副部长|副部長|宣传委员|宣傳委員|组织委员|組織委員|学习委员|生活委员|文体委员|心理委员|纪律委员|团支书|團支書|团支部书记|部门干事|部門幹事|部长|部長|干事|骨干|其他班委/.test(name))return{level:'2',label:'其他干部 / 骨干'};
 if(/主席团|主席團|主席|班长|班長|党支部书记|黨支部書記|党支书/.test(name))return{level:'4',label:'指定主要岗位'};
 if(/宿舍长|宿舍長|寝室长|寢室長|安全员|安全員/.test(name))return{level:'0.5',label:'宿舍长 / 安全员'};
 if(/培训|培訓|论坛|論壇|结业|結業/.test(name))return{level:'1',label:'培训 / 论坛结业'};
 return null;
}
export function isMoralCategory(category:string){return ['student','volunteer','practice','activity'].includes(category);}
