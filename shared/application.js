export const sections = [
 {title:'Contact details',description:'Tell us how to address you and reach you about your application.',fields:[
  {name:'name',label:'Full name',type:'text',max:100,autocomplete:'name'},
  {name:'email',label:'Email address',type:'email',max:200,autocomplete:'email'},
  {name:'phone',label:'Phone number (optional)',type:'tel',max:50,autocomplete:'tel',optional:true},
 ]},
 {title:'Facebook experience',description:'We welcome different experience levels. Give us an accurate picture of how you use Facebook.',fields:[
  {name:'experience',label:'How familiar are you with Facebook groups?',options:['I regularly join groups and create posts','I have used groups a little','I am new to Facebook groups']},
  {name:'postingFrequency',label:'How often do you currently post in Facebook groups?',options:['Daily','Several times a week','About once a week','Less than once a week','I have not posted in groups before']},
  {name:'referral',label:'Where did you hear about this opportunity?',options:['Facebook group','Facebook post or advertisement','Referral from someone I know','Another website or platform','Other']},
  {name:'groupRules',label:'How comfortable are you checking and following group posting rules?',options:['Comfortable doing this independently','I can do this with initial guidance','I would need training']},
  {name:'listingSkills',label:'Can you add photos, format a post, edit it, and copy its link?',options:['Yes, I can do all of these','I can do some and would like guidance','I would need help learning these tasks']}
 ]},
 {title:'Availability & work',description:'This fully remote role requires work every day, Monday through Sunday, including weekends, with no scheduled days off. Working hours within each day are flexible. Tell us whether you can reliably meet this schedule alongside any other work.',fields:[
  {name:'employment',label:'What is your current work situation?',options:['Employed full-time','Employed part-time','Self-employed or freelance','Not currently working','Other']},
  {name:'sevenDayAvailability',label:'Can you work remotely every day, Monday through Sunday, with no scheduled days off?',options:['Yes, I can meet this seven-day schedule','No, I cannot work every day','I need to discuss my availability with Katherine']},
  {name:'dailyHours',label:'How much time can you reliably set aside each day?',options:['Less than 1 hour','1–2 hours','2–4 hours','More than 4 hours']},
    {name:'commitments',label:'How would you fit this role around your current work or other commitments?',type:'textarea',max:1500,placeholder:'Skip this question if you have no current work or other commitments.',optional:true},
  {name:'availability',label:'When can you start after passing the three trials?',options:['Immediately after passing','Within one week','Within two weeks','I would need to agree on a start date']},
  {name:'workload',label:'Can you consistently manage approximately 10–12 listings every day, including weekends, after the trials?',options:['Yes','Yes, with initial guidance','I would like to discuss the workload']}
 ]},
 {title:'Setup & approach',description:'Tell us about your tools and how you would handle the day-to-day work.',fields:[
  {name:'device',label:'What device will you use for Facebook?',options:['Phone','Computer','Phone and computer']},
  {name:'internet',label:'Do you have reliable internet access?',options:['Yes, consistently','Usually, with occasional interruptions','Not consistently']},
  {name:'updates',label:'How often can you check for assignment updates and feedback?',options:['Several times during my working hours','At the beginning and end of my working hours','Once a day','I would need to agree on a check-in schedule']},
  {name:'motivation',label:'Why are you interested in this role?',type:'textarea',max:1500},
  {name:'questions',label:'Questions for Katherine (optional)',type:'textarea',max:1500,optional:true}
 ]},
 {title:'Pay & temporary role',description:'The role pays $600 per week. Your first payday is seven days after you start the ongoing role following successful trials, with weekly pay after that. One or two days before payday, Katherine will contact you to confirm where to send your payment. Choose a preference below; Katherine will confirm the available method with you. Do not enter account numbers or payment details in this application. This is a temporary position, not a permanent one. Katherine will give you one to two weeks’ notice before your services are no longer required.',fields:[
  {name:'paymentMethod',label:'How would you prefer to receive your payment?',options:['Bank transfer / direct deposit','PayPal','Zelle','Cash App','Venmo','Another method — discuss with Katherine','I would like help choosing a method']}
 ]}
];
export const fields=sections.flatMap(s=>s.fields);
export function validateApplication(body){
 if(!body||typeof body!=='object')return {error:'Please complete the application.'};
 const data={};
 for(const f of fields){const value=typeof body[f.name]==='string'?body[f.name].trim():'';
 if(!f.optional&&!value)return {error:`Please complete: ${f.label}`};
 if(value.length>(f.max||300))return {error:`Please shorten: ${f.label}`};
 if(f.options&&!f.options.includes(value))return {error:`Please choose an option for: ${f.label}`};
 if(f.type==='email'&&!/^\S+@\S+\.\S+$/.test(value))return {error:'Please enter a valid email address.'};
 data[f.name]=value;
 }
 if(body.consent!==true)return {error:'Please acknowledge the application terms before submitting.'};
 data.consent=true;data.formVersion=5;return {data};
}
