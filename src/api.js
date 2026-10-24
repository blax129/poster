export class ApiUnavailableError extends Error {}
export async function api(path,method='GET',body,token){
 const response=await fetch('/api'+path,{method,headers:{Accept:'application/json','Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const raw=await response.text();
 const isHtml=/^\s*(?:<!doctype html|<html)/i.test(raw)||response.headers.get('content-type')?.includes('text/html');
 if(response.status===404||response.status===405||(response.ok&&isHtml))throw new ApiUnavailableError('The application portal is not available on this deployment.');
 let data;try{data=JSON.parse(raw)}catch{throw new Error('The server returned an unexpected response. Please try again later or contact Katherine.');}
 if(!response.ok)throw new Error(data?.error||'Unable to complete the request. Please try again.');
 if(!data||typeof data!=='object')throw new Error('The server returned an unexpected response. Please contact Katherine.');
 return data;
}
export async function submitApplication(answers){
 try{
  const result=await api('/applications','POST',answers);
  if(typeof result.token!=='string'||!result.token)throw new Error('The server did not confirm your application. Please contact Katherine before submitting again.');
  return {token:result.token};
 }catch(error){
  // Only fall back when the API route is absent. Never resend after a network
  // failure or server error: the first request may already have been delivered.
  if(!(error instanceof ApiUnavailableError))throw error;
 }
 const response=await fetch('https://formspree.io/f/mnjeolkq',{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify({...answers,_subject:'New TenantFirst application',_replyto:answers.email})});
 let data;try{data=await response.json()}catch{throw new Error('Unable to confirm delivery. Please contact Katherine before submitting again.');}
 if(!response.ok||data?.ok!==true)throw new Error(data?.errors?.map(e=>e.message).filter(Boolean).join(' ')||'Your application could not be delivered. Please try again or contact Katherine.');
 return {delivered:true};
}
