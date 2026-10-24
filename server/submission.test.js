import {test} from 'node:test';
import assert from 'node:assert/strict';
import {api,submitApplication} from '../src/api.js';
const answers={name:'Test Applicant',email:'test@example.com'};
function mockFetch(t,responses){const calls=[];t.mock.method(globalThis,'fetch',async(...args)=>{calls.push(args);const response=responses.shift();if(response instanceof Error)throw response;assert.ok(response,'Unexpected extra request');return response;});return calls;}
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
test('keeps existing server submission and token flow',async t=>{const calls=mockFetch(t,[json({token:'private-key'},201)]);assert.deepEqual(await submitApplication(answers),{token:'private-key'});assert.equal(calls.length,1)});
for(const status of [200,404,405])test(`static HTML response ${status} submits to Formspree`,async t=>{const calls=mockFetch(t,[new Response('<!doctype html><html>Static host</html>',{status,headers:{'Content-Type':'text/html'}}),json({ok:true})]);assert.deepEqual(await submitApplication(answers),{delivered:true});assert.equal(calls[1][0],'https://formspree.io/f/mnjeolkq');assert.equal(JSON.parse(calls[1][1].body).email,answers.email)});
test('does not send twice after server or network failures',async t=>{let calls=mockFetch(t,[json({error:'Delivery failed'},502)]);await assert.rejects(submitApplication(answers),/Delivery failed/);assert.equal(calls.length,1);t.mock.restoreAll();calls=mockFetch(t,[new TypeError('Network failed')]);await assert.rejects(submitApplication(answers),/Network failed/);assert.equal(calls.length,1)});
test('shows Formspree validation errors without claiming success',async t=>{mockFetch(t,[new Response('',{status:404}),json({errors:[{message:'Please complete verification'}]},422)]);await assert.rejects(submitApplication(answers),/Please complete verification/)});
test('non-JSON errors get readable messages instead of Safari parse errors',async t=>{mockFetch(t,[new Response('Bad gateway',{status:502})]);await assert.rejects(api('/applications','POST',answers),/unexpected response/)});
