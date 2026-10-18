import test from 'node:test';import assert from 'node:assert/strict';import {score,totals,competitionPreview} from './scoring';import type {Achievement} from './types';
const a=(x:Partial<Achievement>={}):Achievement=>({id:'test',category:'paper',title:'测试样本',date:'2026-10-11',note:'',level:'30',rank:1,authorMode:'solo',status:'published',hours:0,organizer:'approved',fund:false,used:false,material:false,...x});
test('单作者30与多人第一21、第二9',()=>{assert.equal(score(a()).value,30);assert.equal(score(a({authorMode:'multiple'})).value,21);assert.equal(score(a({authorMode:'multiple',rank:2})).value,9)});
test('仅录用多人第一10.5',()=>assert.equal(score(a({authorMode:'multiple',status:'accepted'})).value,10.5));
test('无效署名资料不自动算分',()=>assert.equal(score(a({rank:2,authorMode:'solo'})).value,null));
test('重复获奖使用排除',()=>assert.equal(score(a({used:true})).value,0));
test('竞赛排名预览',()=>{assert.equal(competitionPreview(a({level:'i0',rank:2})),18);assert.equal(competitionPreview(a({level:'d0',rank:8})),4)});
test('每日合并上限8小时与志愿累计8分',()=>{assert.equal(totals([a({category:'volunteer',hours:6}),a({category:'volunteer',hours:6,id:'2'})]).moral,.8);assert.equal(totals(Array.from({length:20},(_,i)=>a({category:'volunteer',hours:8,id:String(i),date:`2026-09-${i+1}`}))).moral,8)});
test('校外及专业活动不计志愿',()=>{assert.equal(score(a({category:'volunteer',organizer:'external',hours:8})).value,0)});
