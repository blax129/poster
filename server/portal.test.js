import {test} from 'node:test';
import {fields} from '../shared/application.js';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createServer} from 'node:http';
import {mkdtemp,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
test('application, authorization, three trials, and acceptance',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'tf-test-')); const port=18379;
 let received,formspreeStatus=200;
 const formspree=createServer((req,res)=>{let body='';req.on('data',chunk=>body+=chunk);req.on('end',()=>{received=JSON.parse(body);res.writeHead(formspreeStatus,{'Content-Type':'application/json'});res.end(JSON.stringify(formspreeStatus<300?{ok:true}:{error:'test failure'}))})});
 await new Promise(resolve=>formspree.listen(0,'127.0.0.1',resolve));
 const formspreeEndpoint=`http://127.0.0.1:${formspree.address().port}/f/test`;
 const child=spawn(process.execPath,['server/index.js'],{env:{...process.env,PORT:String(port),DATA_DIR:dir,ADMIN_TOKEN:'test-manager-key',FORMSPREE_ENDPOINT:formspreeEndpoint},stdio:['ignore','pipe','pipe']});
 try{
 await new Promise((resolve,reject)=>{child.stdout.once('data',resolve);child.once('error',reject);child.once('exit',code=>reject(Error('Server exited '+code)))});
 const call=async(p,method='GET',body,token)=>{const r=await fetch(`http://127.0.0.1:${port}/api`+p,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json()}};
 assert.equal((await call('/admin/applications')).status,401);
 assert.equal((await call('/applications','POST',{})).status,400);
 const answers=Object.fromEntries(fields.map(f=>[f.name,f.options?f.options[0]:'Test response']));Object.assign(answers,{name:'Test Applicant',email:'test@example.com',consent:true});
 assert.equal((await call('/applications','POST',{...answers,postingFrequency:''})).status,400);
 assert.equal((await call('/applications','POST',{...answers,employment:'invalid option'})).status,400);
 assert.equal((await call('/applications','POST',{...answers,paymentMethod:''})).status,400);
 formspreeStatus=503;assert.equal((await call('/applications','POST',answers)).status,502);assert.equal((await call('/admin/applications','GET',null,'test-manager-key')).data.length,0);
 formspreeStatus=200;const create=await call('/applications','POST',answers);assert.equal(create.status,201);assert.equal(received.name,'Test Applicant');assert.equal(received.email,'test@example.com');assert.equal(received._replyto,'test@example.com');assert.equal(received._subject,'New TenantFirst application');const token=create.data.token;
 assert.equal((await call('/me','GET',null,'wrong-key')).status,401);
 const me=await call('/me','GET',null,token);const id=me.data.application.id;
 assert.equal(me.data.application.name,'Test Applicant');assert.equal(me.data.application.paymentMethod,answers.paymentMethod);assert.equal(me.data.application.token,undefined);
 const admin='test-manager-key';assert.equal((await call('/admin/applications/'+id,'PATCH',{status:'Ready to start'},admin)).status,400);
 assert.equal(me.data.application.postingFrequency,answers.postingFrequency);
 assert.equal(me.data.application.employment,answers.employment);
 assert.equal((await call('/admin/applications/'+id+'/assignments','POST',{},admin)).status,409);
 assert.equal((await call('/admin/applications/'+id,'PATCH',{status:'Trial stage'},admin)).status,409);
 assert.equal((await call('/admin/applications/'+id,'PATCH',{status:'Approved for trials'},admin)).status,200);
 for(let i=0;i<3;i++){
 assert.equal((await call('/admin/applications/'+id+'/assignments','POST',{title:'Trial '+i,groupUrl:'https://www.facebook.com/groups/example',details:'Authorized listing content',compensation:'Terms confirmed for testing'},admin)).status,201);
 const task=(await call('/me','GET',null,token)).data.assignments[i];
 assert.equal((await call('/me/assignments/'+task.id,'POST',{postUrl:'javascript:alert(1)'},token)).status,400);
 assert.equal((await call('/admin/assignments/'+task.id,'PATCH',{status:'Approved'},admin)).status,400);
 assert.equal((await call('/me/assignments/'+task.id,'POST',{postUrl:'https://www.facebook.com/post/example',notes:'Posted'},token)).status,200);
 assert.equal((await call('/admin/assignments/'+task.id,'PATCH',{status:'Approved',feedback:'Good work'},admin)).status,200);
 }
 assert.equal((await call('/me','GET',null,token)).data.application.status,'Ready to start');
 assert.equal((await call('/admin/applications/'+id+'/assignments','POST',{},admin)).status,409);
 assert.equal((await call('/admin/applications/'+id,'PATCH',{status:'Ready to start'},admin)).status,200);
 assert.equal((await call('/me','GET',null,token)).data.application.status,'Ready to start');
 }finally{child.kill();await new Promise(r=>child.once('close',r));await new Promise(resolve=>formspree.close(resolve));await rm(dir,{recursive:true,force:true})}
});
