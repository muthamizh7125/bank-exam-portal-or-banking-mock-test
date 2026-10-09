"use strict";
var $ = function(id){return document.getElementById(id);};
var STORE={history:"banklab_history_v2",seen:"banklab_seen_v2",seq:"banklab_seq_v2"};
var TOPICS={
 english:["Reading Comprehension","Cloze Test","Para Jumbles","Error Spotting / Error Detection","Sentence Correction / Improvement","Phrase Replacement","Word Swap & Word Usage","Double Fillers / Fill in the Blanks","Idioms and Phrases","Vocabulary & Synonyms","Spelling","Grammar"],
 quant:["Simplification & Approximation","Number Series","Quadratic Equations","Quantity Comparison","Data Interpretation","Tabular DI","Bar Graph DI","Line Graph DI","Pie Chart DI","Caselet DI","Radar DI","Missing DI","Percentage & Average","Ratio & Proportion","Profit, Loss & Discount","Simple & Compound Interest","Time & Work / Pipes & Cisterns","Time, Speed & Distance / Trains / Boats","Mixtures & Alligations","Partnership & Ages","Probability & Permutation-Combination","Mensuration"],
 reasoning:["Seating Arrangements","Puzzles (Floor / Box / Scheduling / Month-Date / Variables)","Syllogism","Inequalities","Coding-Decoding","Blood Relations","Direction & Distance","Order & Ranking","Alphanumeric & Number Series","Data Sufficiency","Logical Reasoning","Only a Few Syllogism"],
 awareness:["Banking & Financial Awareness","RBI & Monetary Policy","Government Schemes","Economy & Reports","Static GK","Current Affairs Revision (static practice)"],
 computer:["Computer Fundamentals","Operating Systems","Hardware & Software","Networking & Internet","MS Office & Shortcuts","Database Basics","Cybersecurity"],
 data:["Tabular DI","Bar Graph DI","Line Graph DI","Pie Chart DI","Caselet DI","Missing DI","Radar DI","Data Sufficiency"]
};
var PROFILES={
 "sbi-clerk":{name:"SBI Junior Associate (Clerk)",prelims:[{id:"english",name:"English Language",count:30,marks:30,minutes:20},{id:"quant",name:"Numerical Ability",count:35,marks:35,minutes:20},{id:"reasoning",name:"Reasoning Ability",count:35,marks:35,minutes:20}],mains:[{id:"awareness",name:"General / Financial Awareness",count:50,marks:50,minutes:35},{id:"english",name:"General English",count:40,marks:40,minutes:35},{id:"quant",name:"Quantitative Aptitude",count:50,marks:50,minutes:45},{id:"reasonComp",name:"Reasoning & Computer Aptitude",count:50,marks:60,minutes:45}]},
 "sbi-po":{name:"SBI PO",prelims:[{id:"english",name:"English Language",count:40,marks:40,minutes:20},{id:"quant",name:"Quantitative Aptitude",count:30,marks:30,minutes:20},{id:"reasoning",name:"Reasoning Ability",count:30,marks:30,minutes:20}],mains:[{id:"reasonComp",name:"Reasoning & Computer Aptitude",count:40,marks:60,minutes:50},{id:"data",name:"Data Analysis & Interpretation",count:30,marks:60,minutes:45},{id:"awareness",name:"General / Economy / Banking Awareness",count:60,marks:60,minutes:45},{id:"english",name:"English Language",count:40,marks:20,minutes:40}]},
 "ibps-clerk":{name:"IBPS Customer Service Associate (Clerk)",prelims:[{id:"english",name:"English Language",count:30,marks:30,minutes:20},{id:"quant",name:"Numerical Ability",count:35,marks:35,minutes:20},{id:"reasoning",name:"Reasoning Ability",count:35,marks:35,minutes:20}],mains:[{id:"awareness",name:"General / Financial Awareness",count:40,marks:50,minutes:20},{id:"english",name:"General English",count:40,marks:40,minutes:35},{id:"reasoning",name:"Reasoning Ability",count:40,marks:60,minutes:35},{id:"quant",name:"Quantitative Aptitude",count:40,marks:50,minutes:35}]},
 "ibps-po":{name:"IBPS PO",prelims:[{id:"english",name:"English Language",count:30,marks:30,minutes:20},{id:"quant",name:"Quantitative Aptitude",count:35,marks:35,minutes:20},{id:"reasoning",name:"Reasoning Ability",count:35,marks:35,minutes:20}],mains:[{id:"reasoning",name:"Reasoning Ability",count:40,marks:60,minutes:50},{id:"awareness",name:"General / Economy / Banking Awareness",count:35,marks:50,minutes:25},{id:"english",name:"English Language",count:35,marks:40,minutes:40},{id:"data",name:"Data Analysis & Interpretation",count:35,marks:50,minutes:45}]},
 "rrb-office":{name:"RRB Office Assistant",prelims:[{id:"reasoning",name:"Reasoning Ability",count:40,marks:40,minutes:25},{id:"quant",name:"Numerical Ability",count:40,marks:40,minutes:20}],mains:[{id:"reasoning",name:"Reasoning Ability",count:40,marks:50,minutes:30},{id:"computer",name:"Computer Knowledge",count:40,marks:20,minutes:15},{id:"awareness",name:"General Awareness",count:40,marks:40,minutes:15},{id:"english",name:"English Language",count:40,marks:40,minutes:30},{id:"quant",name:"Numerical Ability",count:40,marks:50,minutes:30}],compositePrelims:true},
 "rrb-officer":{name:"RRB Officer Scale I",prelims:[{id:"reasoning",name:"Reasoning Ability",count:40,marks:40,minutes:25},{id:"quant",name:"Quantitative Aptitude",count:40,marks:40,minutes:20}],mains:[{id:"reasoning",name:"Reasoning Ability",count:40,marks:50,minutes:30},{id:"computer",name:"Computer Knowledge",count:40,marks:20,minutes:15},{id:"awareness",name:"General Awareness",count:40,marks:40,minutes:15},{id:"english",name:"English Language",count:40,marks:40,minutes:30},{id:"quant",name:"Quantitative Aptitude",count:40,marks:50,minutes:30}]}
};
PROFILES["rrb-officer"].compositePrelims=true;
var baseBank=[],activeTest=null,responses={},sectionIndex=0,questionIndex=0,sectionRemaining=0,overallRemaining=0,questionSeconds=0,tickHandle=null,paused=false,answerChecked=false,currentResult=null,selectedMode="full",selectedProfile=null;

function readStore(k,d){try{var x=JSON.parse(localStorage.getItem(k));return x===null||x===undefined?d:x;}catch(e){return d;}}
function writeStore(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function strip(s){return String(s||"").replace(/<[^>]*>/g," ").replace(/&nbsp;/g," ").replace(/\s+/g," ").trim().toLowerCase();}
function fp(q){return strip(q.question)+"|"+(q.options||[]).map(strip).sort().join("|")+"|"+String(q.topic||"").toLowerCase();}
function hash(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function rng(seed){var a=(seed>>>0)||1;return function(){a=(Math.imul(a,1664525)+1013904223)>>>0;return a/4294967296;};}
function ri(r,a,b){return Math.floor(r()*(b-a+1))+a;}
function pick(r,a){return a[ri(r,0,a.length-1)];}
function eh(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");}
function fmt(n){return Number(n).toLocaleString("en-IN",{maximumFractionDigits:2});}
function labelSection(id){return {english:"English Language",quant:"Quantitative Aptitude",reasoning:"Reasoning Ability",reasonComp:"Reasoning & Computer Aptitude",awareness:"General / Financial Awareness",computer:"Computer Knowledge",data:"Data Analysis & Interpretation"}[id]||id;}
function topicsFor(id){if(id==="reasonComp")return TOPICS.reasoning.concat(TOPICS.computer);if(id==="data")return TOPICS.data;return TOPICS[id]||TOPICS.reasoning;}
function groupTopic(t){t=String(t).toLowerCase();if(/rbi|banking|financial awareness|government schemes|economy|reports|static gk|current affairs/.test(t))return "awareness";if(/computer|operating systems|hardware|network|office|database|cybersecurity/.test(t))return "computer";if(/data interpretation|tabular di|bar graph|line graph|pie chart|caselet|missing di|radar di/.test(t))return "data";if(/reading comprehension|cloze|para jumble|error|sentence correction|phrase replacement|word swap|fillers|idioms|vocabulary|spelling|grammar/.test(t))return "english";if(/simplification|approximation|quadratic|quantity comparison|percentage|average|ratio|profit|interest|work|pipes|speed|boats|mixtures|partnership|ages|probability|permutation|mensuration/.test(t))return "quant";return "reasoning";}
function modeValue(){return document.querySelector('input[name="practiceMode"]:checked').value;}
function updateMode(){
 selectedMode=modeValue();selectedProfile=PROFILES[$("examSelect").value];var secs=selectedProfile[$("stageSelect").value];
 $("sectionField").hidden=selectedMode==="full";$("topicField").hidden=selectedMode!=="topic";$("difficultyField").hidden=selectedMode==="full";$("paperField").hidden=selectedMode!=="full";$("countField").hidden=selectedMode!=="topic";$("timerModeField").hidden=selectedMode!=="topic";
 $("sectionSelect").innerHTML=secs.map(function(s,i){return '<option value="'+i+'">'+eh(s.name)+' ('+s.count+' questions)</option>';}).join("");
 updateTopics();document.querySelectorAll(".mode-option").forEach(function(el){el.classList.toggle("selected",el.querySelector("input").checked);});updatePattern();
}
function updateTopics(){var p=PROFILES[$("examSelect").value],sec=p[$("stageSelect").value][Number($("sectionSelect").value)||0];var opts=topicsFor(sec?sec.id:"reasoning");$("topicSelect").innerHTML=opts.map(function(t){return '<option value="'+eh(t)+'">'+eh(t)+'</option>';}).join("");}
function updatePattern(){var p=PROFILES[$("examSelect").value],stage=$("stageSelect").value,secs=p[stage],count=secs.reduce(function(a,s){return a+s.count;},0),mins=secs.reduce(function(a,s){return a+s.minutes;},0),title=p.name+" "+(stage==="prelims"?"Prelims":"Mains"),desc;
 if(selectedMode==="full")desc=count+" questions · "+mins+" minutes"+(p.compositePrelims&&stage==="prelims"?" · composite timer":" · separately timed sections");
 else if(selectedMode==="section"){var s=secs[Number($("sectionSelect").value)||0];desc=s.count+" questions · "+s.minutes+" minutes · one complete section";}
 else desc=$("questionCount").value+" questions · "+$("difficultySelect").value+" · "+($("timerMode").value==="untimed"?"untimed practice":"timed topic drill");
 if(selectedMode==="full"&&stage==="mains"&&( $("examSelect").value==="sbi-po"||$("examSelect").value==="ibps-po"))desc+=" · objective section simulation; descriptive writing is not included yet";
 $("patternTitle").textContent=title;$("patternDescription").textContent=desc;
}
function renderPaperOptions(){$("paperSelectLobby").innerHTML=Array.from({length:50},function(_,i){return '<option value="'+(i+1)+'">Mock Paper '+String(i+1).padStart(2,"0")+'</option>';}).join("");}
function getSecQs(sec){return activeTest.questions.filter(function(q){return q.section===sec.id;});}
function fingerprintSeen(){return new Set(readStore(STORE.seen,[]));}
function pickLevel(i,count,r){var part=i/Math.max(1,count);if(part<.25)return "Easy";if(part<.72)return "Moderate";return r()<.6?"Moderate":"Hard";}
function sectionQuestion(sec,topic,diff,seed,qtext,answer,wrong,explain,bench){
 var rr=rng(seed^0x9e3779b9),opts=[String(answer)];wrong.forEach(function(x){if(!opts.includes(String(x)))opts.push(String(x));});
 var j=1,guard=0,num=Number(answer);while(opts.length<4&&guard<50){var alt=Number.isFinite(num)?String(num+j*7):"Alternative "+String.fromCharCode(65+opts.length);if(!opts.includes(alt))opts.push(alt);j++;guard++;}
 var letters=["Option A","Option B","Option C","Option D"];while(opts.length<4){var filler=letters.find(function(x){return !opts.includes(x);});if(!filler)break;opts.push(filler);}
 opts=opts.slice(0,4);for(var i=opts.length-1;i>0;i--){var k=ri(rr,0,i);var z=opts[i];opts[i]=opts[k];opts[k]=z;}
 return {id:"BL_"+hash(topic+"|"+seed).toString(36)+"_"+seed,section:sec.id,section_name:sec.name,topic:topic,difficulty:diff,question:qtext,options:opts,correct_index:opts.indexOf(String(answer)),explanation:explain,benchmark_seconds:bench||40,marks:sec.marks/sec.count,negative_mark:(sec.marks/sec.count)*.25};
}
function genQ(section,topic,diff,seed){
 var prompts=["Choose the most appropriate option.","Read carefully and select the correct answer.","Banking exam practice: choose the best response.","Select one answer.","For this practice item, identify the correct option.","Read the question and choose the best answer.","Select the option that best answers the question.","Choose the option that fits the information given.","Evaluate the item and select the correct response.","Check the details before answering.","Choose the most accurate answer.","Select the best available response.","Answer the following practice question.","Use the given information to select one option.","Which option correctly answers the question?","Review the prompt below and choose an answer.","Select the most suitable option from those below.","Pick the correct response from the alternatives.","Consider the question and mark one answer.","For exam practice, select the correct alternative.","Choose an answer using the details provided.","Find the option that fits the question.","Read the prompt and select a response.","Select the answer that follows from the information.","Identify the correct alternative.","Choose the response supported by the question.","Answer this item by selecting the best option.","Select the option you judge to be correct.","Consider the following and choose your answer.","From the options below, choose one answer.","Decide which option is the best answer.","Select the correct choice.","Read the statement carefully; then choose an answer.","Select the answer that best fits the problem.","Use careful reasoning to choose an option.","Choose the correct response from the listed alternatives.","Answer by selecting one of the four options.","Apply the relevant rule and choose a response.","Identify which option is supported by the prompt.","Pick the most suitable answer below.","Examine the given information before responding.","Choose the best alternative for the item.","Select the answer most consistent with the statement.","Read the prompt fully before making a selection.","Find the alternative that completes the task correctly.","Choose the response that follows logically.","Review the item and mark the appropriate choice.","Use the given details to work out the answer.","Which alternative best fits the prompt?","Select one option to answer the item.","Choose a correct response based on the facts given.","Pick the option that matches the required result.","Work through the question and select an answer.","Find the answer that satisfies the stated conditions.","Consider each option and choose the correct one.","Identify the most suitable response to the question.","Select an answer after considering the details.","Choose the option that agrees with the stated rule.","Answer using the information in the question.","Select the alternative that is logically consistent.","Which answer best matches the information provided?","Choose the response that solves the given problem.","Carefully assess the item and choose one option.","Make the best selection from the options listed."],r=rng(seed),n=function(a,b){return ri(r,a,b);},p=function(a){return pick(r,a);},mk=function(q,a,w,e,b){return sectionQuestion({id:section,name:labelSection(section),marks:1,count:1},topic,diff,seed,q,a,w,e,b);},letters=["A","B","C","D","E","F","G","H","J","K","L","M","N","P","Q","R","S","T","V","W"];
 if(section==="reasonComp"&&/computer|network|database|software|hardware|operating|office|cyber/i.test(topic))section="computer";
 if(section==="quant"||section==="data")return genAdvancedQuant(section,topic,diff,seed,mk);
 if(section==="quant"||section==="data"){
  if(/simplification|approximation/i.test(topic)){
   if(/approximation/i.test(topic)){
    var ap=pick(r,[{q:"(799.6 ÷ 19.9) × 24.8 + 48.9",a:1050,rule:"800 ÷ 20 × 25 + 50 ≈ 1,050"},{q:"(1,248 ÷ 31.2) × 18.9 − 52.1",a:700,rule:"1,250 ÷ 31 × 19 − 50 ≈ 716, nearest option 700"},{q:"(1,598 ÷ 39.8) × 15.2 + 61.1",a:650,rule:"1,600 ÷ 40 × 15 + 50 = 650"}]);
    return mk("Approximate: "+ap.q+" = ?",ap.a,[ap.a+50,Math.max(1,ap.a-50),ap.a+100],"Round to convenient values: "+ap.rule+".",25);
   }
   var ex=pick(r,diff==="Hard"?[{q:"(35% of 840) + (5/8 of 640) − √625 × 4",a:594,e:"35% of 840 = 294; 5/8 of 640 = 400; √625 × 4 = 100. Result = 594."},{q:"18² ÷ 9 + 32% of 750 − 3³",a:249,e:"18² ÷ 9 = 36; 32% of 750 = 240; 3³ = 27. Result = 249."},{q:"(7/12 of 864) ÷ 7 + 45% of 360",a:234,e:"7/12 of 864 = 504; 504 ÷ 7 = 72; 45% of 360 = 162. Result = 234."}]:[{q:"(48% of 625) + (7/9 of 729) − √1296",a:831,e:"48% of 625 = 300; 7/9 of 729 = 567; √1296 = 36. Result = 831."},{q:"√2025 + 28% of 850 − 3² × 7",a:220,e:"√2025 = 45; 28% of 850 = 238; 3² × 7 = 63. Result = 220."},{q:"(25% of 640) + (3/5 of 450) − √400",a:410,e:"25% of 640 = 160; 3/5 of 450 = 270; √400 = 20. Result = 410."}]);
   return mk("Simplify: "+ex.q+" = ?",ex.a,[ex.a+17,Math.max(1,ex.a-19),ex.a+31],ex.e,30);
  }
  if(/number series/i.test(topic)){
   var mode=diff==="Hard"?ri(r,0,3):ri(r,0,2),vals=[],answer,explain;
   if(mode===0){var first=n(18,75),step=n(5,18),inc=n(2,6);vals=[first];for(var si=0;si<5;si++)vals.push(vals[si]+step+si*inc);answer=vals[5];explain="Successive differences are "+[step,step+inc,step+2*inc,step+3*inc].join(", ")+". The next difference is "+(step+4*inc)+", so the answer is "+answer+".";}
   else if(mode===1){var f=n(3,12),mult=n(2,3),add=n(1,8);vals=[f];for(var sj=0;sj<5;sj++)vals.push(vals[sj]*mult+add);answer=vals[5];explain="Each term is multiplied by "+mult+" and then "+add+" is added. "+vals[4]+" × "+mult+" + "+add+" = "+answer+".";}
   else if(mode===2){var base=n(4,12),offset=n(2,17);vals=[];for(var sk=0;sk<6;sk++)vals.push((base+sk)*(base+sk)+offset);answer=vals[5];explain="The terms follow consecutive squares plus "+offset+". Next term = "+(base+5)+"² + "+offset+" = "+answer+".";}
   else{var b=n(3,14),plus=n(4,12),minus=n(2,9);vals=[b];for(var sl=1;sl<6;sl++){if(sl%2===1)vals.push(vals[sl-1]+plus);else vals.push(vals[sl-1]*2-minus);}answer=vals[5];explain="The sequence alternates +"+plus+" and ×2 − "+minus+". Apply the next operation to "+vals[4]+" to get "+answer+".";}
   return mk("Find the missing term: "+vals.slice(0,5).join(", ")+", ?",answer,[answer+Math.max(7,Math.round(answer*.08)),Math.max(1,answer-Math.max(5,Math.round(answer*.07))),answer+Math.max(13,Math.round(answer*.15))],explain,35);
  }
  if(/quadratic/i.test(topic)){
   var xl=n(3,24),xh=xl+n(2,12),yl,yh;
   if(diff==="Hard"&&r()<.5){yl=Math.max(1,xl-n(2,6));yh=xh+n(1,6);}
   else if(r()<.5){yl=xh+n(1,5);yh=yl+n(2,10);}
   else{yh=Math.max(2,xl-n(1,6));yl=Math.max(1,yh-n(1,4));if(yl>yh){var sw=yh;yh=yl;yl=sw;}}
   var xs=xl+xh,xp=xl*xh,ys=yl+yh,yp=yl*yh,rel;
   if(xh<yl)rel="x < y";else if(yh<xl)rel="x > y";else if(xl===yl&&xh===yh)rel="x = y";else rel="Relationship cannot be established";
   return mk("Solve and compare:<br><br>I. x² − "+xs+"x + "+xp+" = 0<br>II. y² − "+ys+"y + "+yp+" = 0",rel,["x > y","x < y","x = y","Relationship cannot be established"].filter(function(v){return v!==rel;}),"Equation I gives roots "+xl+" and "+xh+"; equation II gives roots "+yl+" and "+yh+". "+(rel==="Relationship cannot be established"?"Possible roots overlap, so one definite relationship cannot be established.":"Every possible value of x is "+(rel==="x < y"?"smaller than":"greater than")+" every possible value of y."),45);
  }
  if(/quantity comparison/i.test(topic)){var qa=n(12,120),qb=n(2,15),qc=n(10,100),v1=qa*qb,v2=qc+qb*5,rel=v1>v2?"Quantity I is greater":v1<v2?"Quantity II is greater":"Both quantities are equal";return mk("Compare: Quantity I = "+qa+" × "+qb+"; Quantity II = "+qc+" + (5 × "+qb+").",rel,["Quantity I is greater","Quantity II is greater","Both quantities are equal","Relationship cannot be established"].filter(function(z){return z!==rel;}).slice(0,3),"Quantity I = "+v1+" and Quantity II = "+v2+".",30);}
  if(/data interpretation|tabular di|bar graph|line graph|pie chart|caselet|missing di|radar di/i.test(topic)){var A=n(40,220),B=n(40,240),C=n(35,180),D=n(25,160),which=n(0,2),answer=which===0?A+B:which===1?Math.abs(A-B):Math.round(A/(A+B)*100);var tbl='<table><tr><th>Branch</th><th>Deposits (₹ lakh)</th></tr><tr><td>North</td><td>'+A+'</td></tr><tr><td>South</td><td>'+B+'</td></tr><tr><td>East</td><td>'+C+'</td></tr><tr><td>West</td><td>'+D+'</td></tr></table>';var ques=which===0?"What is the combined deposit of North and South?":which===1?"What is the difference between the North and South deposits?":"What percentage of the North and South total is contributed by North (nearest whole %)?";return mk(tbl+ques,answer,[Math.max(1,answer+7),Math.max(1,answer-4),Math.max(1,answer+15)],which===0?A+" + "+B+" = "+answer+" lakh.":which===1?"Difference = |"+A+" − "+B+"| = "+answer+" lakh.":"North share = "+A+"/("+A+"+"+B+") × 100 ≈ "+answer+"%.",45);}
  if(/percentage & average|percentage|average/i.test(topic)){if(r()<.5){var pc=p([10,12,15,20,25,30,35,40,45]),base=n(80,900),ans2=base*pc/100;return mk("What is "+pc+"% of "+base+"?",fmt(ans2),[fmt(ans2+pc),fmt(ans2-pc),fmt(ans2*2)],pc+"% = "+pc+"/100, so "+base+" × "+pc+"/100 = "+fmt(ans2)+".",25);}var vals=[n(15,100),n(15,100),n(15,100),n(15,100)],avg=Math.round(vals.reduce(function(s,v){return s+v;},0)/4);return mk("Find the average of "+vals.join(", ")+".",avg,[avg+2,avg-3,avg+5],"Sum = "+vals.reduce(function(s,v){return s+v;},0)+"; divide by 4 to obtain "+avg+".",30);}
  if(/ratio & proportion/i.test(topic)){var ra=n(2,9),rb=n(3,12),tot=(ra+rb)*n(8,24),share=tot*ra/(ra+rb);return mk("₹"+tot+" is divided in the ratio "+ra+":"+rb+". What is the first share?",fmt(share),[fmt(share+ra+rb),fmt(share-ra),fmt(tot*rb/(ra+rb))],"Total parts = "+(ra+rb)+". First share = "+ra+"/"+(ra+rb)+" × "+tot+" = ₹"+fmt(share)+".",35);}
  if(/profit|loss|discount/i.test(topic)){var cp=n(180,1800),pct=p([10,12,15,20,25,30]),sp=cp*(100+pct)/100;return mk("An item costs ₹"+cp+" and is sold at a profit of "+pct+"%. Find its selling price.",fmt(sp),[fmt(sp+cp*.05),fmt(cp*(100-pct)/100),fmt(sp-20)],"Selling price = "+cp+" × (100 + "+pct+")/100 = ₹"+fmt(sp)+".",35);}
  if(/interest/i.test(topic)){var pr=n(1000,12000),rate=p([5,6,8,10,12]),yrs=n(2,5),si=pr*rate*yrs/100;return mk("Find the simple interest on ₹"+pr+" at "+rate+"% per annum for "+yrs+" years.",fmt(si),[fmt(si+rate*10),fmt(pr*rate/100),fmt(si*2)],"SI = P × R × T / 100 = ₹"+fmt(si)+".",35);}
  if(/time & work|pipes/i.test(topic)){var da=n(4,18),db=n(5,22),together=Number((da*db/(da+db)).toFixed(2));return mk("A completes a job in "+da+" days and B in "+db+" days. How long will they take working together?",together,[Number((together+1).toFixed(2)),Number((together-1).toFixed(2)),da+db],"Combined rate = 1/"+da+" + 1/"+db+". Time = "+da+" × "+db+"/"+(da+db)+" ≈ "+together+" days.",40);}
  if(/speed|trains|boats/i.test(topic)){var spd=n(36,90),hrs=n(2,6),dst=spd*hrs;return mk("A train travels at "+spd+" km/h for "+hrs+" hours. How far does it travel?",dst,[dst+spd,dst-spd,dst+hrs*5],"Distance = speed × time = "+spd+" × "+hrs+" = "+dst+" km.",30);}
  if(/mixtures|alligation/i.test(topic)){var ca=n(10,35),cb=n(50,90),conc=(ca+cb)/2;return mk("Equal quantities of a "+ca+"% solution and a "+cb+"% solution are mixed. Find the concentration.",conc,[conc+5,conc-10,cb-ca],"For equal quantities, concentration = ("+ca+" + "+cb+")/2 = "+conc+"%.",30);}
  if(/partnership|ages/i.test(topic)){if(r()<.5){var aa=n(2,8),bb=n(3,9),profit=(aa+bb)*n(100,300),piece=profit*aa/(aa+bb);return mk("A and B invest in the ratio "+aa+":"+bb+". If total profit is ₹"+profit+", find A's share.",piece,[piece+100,profit*bb/(aa+bb),piece-50],"A's share = "+aa+"/"+(aa+bb)+" × "+profit+" = ₹"+piece+".",35);}var age=n(18,50),gap=n(4,18),parent=age*2+gap*2;return mk("A parent is "+(gap*2)+" years older than twice a child's age. The child is "+age+". How old is the parent?",parent,[parent+4,age+gap*2,parent-2],"Parent's age = 2 × "+age+" + "+(gap*2)+" = "+parent+".",35);}
  if(/probability|permutation/i.test(topic)){var red=n(2,7),blue=n(3,9),ans3=red+"/"+(red+blue);return mk("A bag contains "+red+" red balls and "+blue+" blue balls. Find the probability of drawing a red ball.",ans3,[blue+"/"+(red+blue),red+"/"+blue,"1/"+(red+blue)],"Favourable outcomes / total outcomes = "+red+"/"+(red+blue)+".",35);}
  if(/mensuration/i.test(topic)){var len=n(8,45),wid=n(4,25),area=len*wid;return mk("Find the area of a rectangle with length "+len+" cm and breadth "+wid+" cm.",area,[2*(len+wid),area+len,area-wid],"Area = length × breadth = "+len+" × "+wid+" = "+area+" cm².",25);}
 }
 if(section==="awareness"){
  var facts=[
   ["The Reserve Bank of India commenced operations in which year?","1935",["1947","1949","1955"],"RBI commenced operations on 1 April 1935."],
   ["Which organisation operates UPI?","NPCI",["SEBI","NABARD","IRDAI"],"NPCI operates UPI and other retail payment systems."],
   ["Which institution is India's central bank?","Reserve Bank of India",["State Bank of India","NABARD","SIDBI"],"The Reserve Bank of India is India's central bank."],
   ["DICGC deposit insurance is generally capped at how much per depositor per bank?","₹5 lakh",["₹1 lakh","₹2 lakh","₹10 lakh"],"DICGC cover is up to ₹5 lakh per depositor per bank."],
   ["NABARD primarily focuses on which area?","Agriculture and rural development",["Stock-market regulation","Insurance regulation","Telecom licensing"],"NABARD is the apex development institution for agriculture and rural development."],
   ["What does KYC stand for?","Know Your Customer",["Keep Your Cash","Know Your Credit","Key Yield Calculation"],"KYC is a customer-identification process."],
   ["Which system settles high-value transfers individually in real time?","RTGS",["Cheque truncation","ATM switching","Batch-only clearing"],"RTGS means Real Time Gross Settlement."],
   ["What does CRR stand for?","Cash Reserve Ratio",["Credit Recovery Rate","Current Repo Return","Capital Risk Reserve"],"CRR is the cash reserve ratio maintained with RBI."],
   ["Which regulator oversees India's securities market?","SEBI",["IRDAI","PFRDA","NABARD"],"SEBI regulates India's securities market."],
   ["Which regulator oversees insurance companies in India?","IRDAI",["SEBI","NPCI","SIDBI"],"IRDAI regulates and develops the insurance sector."],
   ["What does NEFT stand for?","National Electronic Funds Transfer",["National Equity Finance Trade","New Electronic Foreign Transfer","National Exchange for Fixed Tenure"],"NEFT is a nationwide electronic funds-transfer system."],
   ["RuPay is a card payment network developed by which organisation?","NPCI",["SEBI","NABARD","IRDAI"],"RuPay was developed by NPCI."],
   ["What does NPA mean in banking?","Non-Performing Asset",["Net Payment Advice","National Pension Account","New Priority Allocation"],"NPA stands for Non-Performing Asset."],
   ["Which organisation provides deposit insurance in India?","DICGC",["SEBI","NPCI","PFRDA"],"DICGC provides eligible deposit insurance."],
   ["Which body regulates the pension sector in India?","PFRDA",["IRDAI","SEBI","NPCI"],"PFRDA regulates and develops India's pension sector."],
   ["What is financial inclusion intended to improve?","Access to useful and affordable financial services",["Only stock trading access","Only lending to large firms","Elimination of all branches"],"Financial inclusion expands access to appropriate formal financial services."],
   ["What does SLR stand for?","Statutory Liquidity Ratio",["Secure Lending Return","Standard Liability Register","Savings Leverage Rate"],"SLR concerns specified liquid assets held against bank liabilities."],
   ["Which code identifies a bank branch for electronic transfers?","IFSC",["CVV","PAN","PIN"],"IFSC identifies a bank branch for electronic payment systems."],
   ["What does UPI enable users to do?","Make instant interoperable payments between bank accounts",["Only withdraw cash","Only trade securities","Only open fixed deposits"],"UPI facilitates real-time payments using linked bank accounts."],
   ["What is phishing?","A deceptive attempt to obtain sensitive information",["A reconciliation method","A deposit insurance type","An interest formula"],"Phishing uses deceptive messages or websites to steal information."],
   ["Which institution is a development financial institution for MSMEs?","SIDBI",["IRDAI","SEBI","NPCI"],"SIDBI supports financing and development of MSMEs."],
   ["A fixed deposit generally offers which feature?","A stated tenure and agreed interest terms",["Unlimited overdraft","A bank ownership share","Guaranteed stock returns"],"A fixed deposit is held for an agreed tenure with specified interest terms."],
   ["Which system is commonly used for immediate interbank electronic transfers?","IMPS",["Paper-only clearing","Demand draft clearing","Treasury bill auction"],"IMPS supports immediate interbank electronic fund transfers."],
   ["What is the usual purpose of a credit score?","To summarise a borrower's credit history and risk profile",["Set the repo rate","Measure account balance only","Calculate tax directly"],"Credit scores help lenders assess credit history and risk."]
  ];
  var topicFacts=[];
  if(/government schemes/i.test(topic))topicFacts=[
   ["Which scheme aims to provide basic bank accounts and wider financial inclusion?","Pradhan Mantri Jan-Dhan Yojana",["Pradhan Mantri Fasal Bima Yojana","Stand-Up India only","Atal Innovation Mission"],"PMJDY promotes access to basic banking services."],
   ["Pradhan Mantri Jeevan Jyoti Bima Yojana primarily provides what?","Life insurance cover",["Crop procurement","Housing loans only","Pension fund supervision"],"PMJJBY is a life-insurance scheme."],
   ["Pradhan Mantri Suraksha Bima Yojana primarily provides what?","Accident insurance cover",["A savings account","Education loans","Crop price support"],"PMSBY provides eligible accident insurance cover."],
   ["Atal Pension Yojana is focused on what?","Pension support in old age",["Securities trading","Export insurance only","Agricultural procurement"],"APY is a pension scheme."],
   ["The MUDRA initiative is primarily intended to support which borrowers?","Micro and small non-corporate businesses",["Only large listed companies","Only central banks","Only foreign governments"],"MUDRA supports eligible micro-enterprise lending."],
   ["PM SVANidhi was designed mainly to support which group?","Street vendors",["Large exporters","Insurance brokers","Stock exchanges"],"PM SVANidhi supports street vendors with working-capital assistance."],
   ["Stand-Up India supports eligible entrepreneurs from which groups?","Women and SC/ST entrepreneurs",["Only central-bank employees","Only listed companies","Only overseas banks"],"Stand-Up India promotes entrepreneurship among women and SC/ST borrowers."],
   ["PM-KISAN provides eligible farmers with what type of support?","Income support",["Deposit insurance","Stock-market credit","Pension-regulator licensing"],"PM-KISAN provides income support to eligible farmer families."],
   ["Which scheme is associated with affordable life insurance for eligible bank-account holders?","Pradhan Mantri Jeevan Jyoti Bima Yojana",["PM SVANidhi","MUDRA only","Atal Innovation Mission"],"PMJJBY is a life-insurance scheme."],
   ["Which scheme is specifically associated with accident insurance?","Pradhan Mantri Suraksha Bima Yojana",["Pradhan Mantri Jan-Dhan Yojana","PM-KISAN","Stand-Up India"],"PMSBY provides eligible accident insurance cover."],
   ["Which scheme encourages savings for a girl child's future?","Sukanya Samriddhi Yojana",["PM SVANidhi","PMJJBY","PM-KISAN"],"Sukanya Samriddhi Yojana is a small-savings scheme for a girl child."],
   ["Which scheme is associated with health assurance for eligible beneficiaries?","Ayushman Bharat PM-JAY",["MUDRA","APY","PMSBY"],"PM-JAY is a health-assurance component of Ayushman Bharat."]
  ];
  else if(/rbi|monetary policy/i.test(topic))topicFacts=[
   ["Which RBI committee decides the policy repo rate?","Monetary Policy Committee",["SEBI Board","DICGC Board","NPCI Council"],"The RBI's Monetary Policy Committee determines the policy repo rate."],
   ["What does an open-market operation generally involve?","RBI purchases or sales of government securities",["Banks changing account passwords","SEBI approving insurance policies","Customers opening savings accounts"],"Open-market operations use securities transactions to manage liquidity."],
   ["The Cash Reserve Ratio requires banks to maintain a specified cash balance with which institution?","Reserve Bank of India",["SEBI","NABARD only","NPCI"],"CRR is maintained as a cash balance with RBI."],
   ["What is the main purpose of monetary policy?","Influence liquidity, interest conditions and inflation",["Set school curricula","Regulate road transport","Approve every company merger"],"Monetary policy influences financial conditions and price stability."],
   ["What is the repo rate in general terms?","The rate at which RBI lends short-term funds to banks against eligible securities",["The rate a customer pays on every savings account","The GST rate on insurance","The exchange rate fixed by an individual bank"],"The policy repo rate is associated with RBI lending to banks against eligible collateral."],
   ["Which report discusses risks to India's financial system and is published by RBI?","Financial Stability Report",["Human Development Report","Global Innovation Index","World Economic Outlook only"],"RBI publishes the Financial Stability Report."],
   ["What does SLR require banks to maintain?","Specified liquid assets against their liabilities",["Only cash at ATMs","Only foreign shares","Only physical gold in branches"],"SLR concerns prescribed liquid assets held by banks."],
   ["Which institution is responsible for India's central-bank monetary policy?","Reserve Bank of India",["IRDAI","SEBI","PFRDA"],"RBI is India's central bank."]
  ];
  else if(/economy|reports/i.test(topic))topicFacts=[
   ["GDP at market prices measures what in an economy?","The value of final goods and services produced within a period",["Only exports","Only intermediate goods","Only government salaries"],"GDP measures the value of final output produced in an economy."],
   ["The Consumer Price Index primarily tracks changes in what?","Prices of a basket of goods and services consumed by households",["Only stock prices","Only export volumes","Only tax collections"],"CPI tracks consumer-level price changes."],
   ["Fiscal deficit broadly reflects what?","Total expenditure minus total receipts excluding borrowings",["Exports minus imports only","Bank deposits minus bank loans","Tax refunds alone"],"Fiscal deficit measures the government's funding gap before borrowing."],
   ["Which organisation compiles India's official Consumer Price Index statistics?","National Statistical Office",["NPCI","DICGC","IRDAI"],"The NSO compiles major official price statistics."],
   ["Which department in the Ministry of Finance prepares the Economic Survey?","Department of Economic Affairs",["Department of Telecommunications","Department of School Education","Department of Atomic Energy"],"The Economic Survey is prepared by the Department of Economic Affairs."],
   ["A current-account balance includes which broad categories?","Trade in goods and services, income and current transfers",["Only government borrowings","Only foreign direct investment","Only gold reserves"],"The current account covers goods, services, primary income and current transfers."],
   ["What does a country's balance of payments record?","Economic transactions between residents and the rest of the world",["Only domestic ATM withdrawals","Only one bank's deposits","Only local property sales"],"The balance of payments records transactions between residents and non-residents."],
   ["What does inflation generally mean?","A sustained increase in the general price level",["A fall in every price","An increase in bank branch count only","A fall in GDP by definition"],"Inflation is a sustained rise in the general price level."],
   ["Which institution publishes the World Economic Outlook?","International Monetary Fund",["NPCI","DICGC","IRDAI"],"The IMF publishes the World Economic Outlook."],
   ["Which institution publishes the Human Development Report?","United Nations Development Programme",["RBI","SEBI","NABARD"],"UNDP publishes the Human Development Report."]
  ];
  else if(/current affairs/i.test(topic))topicFacts=[
   ["Which city hosted the G20 Leaders' Summit in India in September 2023?","New Delhi",["Mumbai","Chennai","Hyderabad"],"The 2023 G20 Leaders' Summit in India was held in New Delhi."],
   ["India held the G20 presidency in which year?","2023",["2020","2021","2025"],"India held the G20 presidency in 2023."],
   ["Chandrayaan-3 achieved its lunar soft landing on which date?","23 August 2023",["15 August 2022","26 January 2024","2 October 2023"],"Chandrayaan-3 landed on the Moon on 23 August 2023."],
   ["What was the name of Chandrayaan-3's lander?","Vikram",["Pragyan","Aditya","Gaganyaan"],"Vikram was the Chandrayaan-3 lander; Pragyan was the rover."],
   ["Aditya-L1 is a mission designed to study which object?","The Sun",["Mars","Venus","Saturn"],"Aditya-L1 is India's solar-observation mission."],
   ["Which city hosted the 2024 Summer Olympic Games?","Paris",["Rome","Tokyo","Madrid"],"Paris hosted the 2024 Summer Olympics."],
   ["Which country hosted COP29 in 2024?","Azerbaijan",["Brazil","India","Canada"],"COP29 was held in Baku, Azerbaijan."],
   ["Which organisation won the 2024 Nobel Peace Prize?","Nihon Hidankyo",["World Food Programme","International Committee of the Red Cross","UNICEF"],"The 2024 Nobel Peace Prize was awarded to Nihon Hidankyo."],
   ["Which country won the ICC Men's T20 World Cup in 2024?","India",["Australia","England","New Zealand"],"India won the 2024 ICC Men's T20 World Cup."],
   ["What is the name of India's first solar observatory mission?","Aditya-L1",["Chandrayaan-2","Mangalyaan-2","INSAT-1A"],"Aditya-L1 is India's solar observatory mission."]
  ];
  else if(/static gk/i.test(topic))topicFacts=[
   ["Which organisation is India's central bank?","Reserve Bank of India",["SEBI","IRDAI","NPCI"],"RBI is India's central bank."],
   ["Where is the headquarters of NABARD?","Mumbai",["New Delhi","Chennai","Kolkata"],"NABARD's headquarters are in Mumbai."],
   ["Which city is the headquarters of SEBI?","Mumbai",["Chennai","Jaipur","Lucknow"],"SEBI is headquartered in Mumbai."],
   ["Which organisation operates the UPI payment system?","NPCI",["IRDAI","PFRDA","NABARD"],"NPCI operates UPI."],
   ["Which body regulates India's insurance sector?","IRDAI",["SEBI","NPCI","DICGC"],"IRDAI regulates the insurance sector."],
   ["Which institution insures eligible bank deposits in India?","DICGC",["SEBI","NPCI","PFRDA"],"DICGC provides deposit insurance."],
   ["Which regulator is associated with the pension sector in India?","PFRDA",["IRDAI","NPCI","DICGC"],"PFRDA regulates and develops the pension sector."],
   ["Which institution is a development financial institution for MSMEs?","SIDBI",["SEBI","IRDAI","NPCI"],"SIDBI supports the MSME sector."]
  ];
  var fact=pick(r,topicFacts.length?topicFacts:facts),phrases=[fact[0],"For an Indian banking-awareness quiz: "+fact[0].charAt(0).toLowerCase()+fact[0].slice(1),"Choose the correct banking fact. "+fact[0]];
  return mk(p(phrases),fact[1],fact[2],fact[3],25);
 }
 if(section==="computer"||section==="reasonComp"&&/computer|network|database|software|hardware|operating|office|cyber/i.test(topic)){
  var cf=[
   ["Which component is commonly called the computer's main processor?","CPU",["RAM","SSD","NIC"],"The CPU executes instructions."],
   ["Which memory is volatile?","RAM",["ROM","Optical disc","Flash drive"],"RAM usually loses its contents when power is removed."],
   ["What does URL stand for?","Uniform Resource Locator",["Universal Routing Link","Unified Record Location","User Reference Label"],"A URL identifies a web resource."],
   ["Which protocol is commonly used to browse websites securely?","HTTPS",["Telnet","FTP without security","HTTP only"],"HTTPS protects web traffic using TLS."],
   ["What is a firewall's primary purpose?","Filter network traffic using security rules",["Increase screen brightness","Store spreadsheet formulas","Cool the CPU"],"A firewall controls allowed and blocked network traffic."],
   ["Which of these is an operating system?","Linux",["SQL","HTML","DNS"],"Linux is an operating system."],
   ["What does DNS do?","Maps domain names to network addresses",["Formats spreadsheets","Encrypts every local file","Checks printer ink"],"DNS resolves domain names to IP addresses."],
   ["Which shortcut usually copies selected text in Windows?","Ctrl + C",["Ctrl + V","Ctrl + X","Ctrl + P"],"Ctrl+C copies selected content."],
   ["Which is a relational database management system?","MySQL",["Bluetooth","JPEG","SMTP"],"MySQL is a relational database system."],
   ["What is malware?","Software intended to harm, exploit or gain unauthorised access",["A backup schedule","A printer driver only","A public-key standard"],"Malware is malicious software."],
   ["Which unit measures CPU clock rate?","Hertz",["Pixels per inch","Litres","Decibels"],"Clock rate is expressed in hertz, often gigahertz."],
   ["What does LAN stand for?","Local Area Network",["Large Access Number","Logical Application Node","Linked Account Name"],"A LAN connects devices in a limited area."],
   ["Which is an input device?","Keyboard",["Monitor","Speaker","Projector"],"A keyboard sends input to a computer."],
   ["In a spreadsheet, what does B4 usually mean?","Column B, row 4",["Workbook 4","Four sheets named B","Row B, column 4"],"Cell references name the column then the row."],
   ["What does CPU stand for?","Central Processing Unit",["Computer Power Utility","Central Program Upload","Control Processing User"],"CPU stands for Central Processing Unit."],
   ["Which number system uses only the digits 0 and 1?","Binary",["Decimal","Octal","Hexadecimal"],"Binary is base 2 and uses 0 and 1."],
   ["How many bits are in one byte?","8",["4","16","32"],"A byte contains 8 bits."],
   ["What does GUI stand for?","Graphical User Interface",["General Utility Internet","Global User Index","Graphic Unit Instruction"],"A GUI lets users interact through visual elements such as windows and icons."],
   ["Which device is primarily used to produce a hard copy of a document?","Printer",["Scanner","Microphone","Webcam"],"A printer produces physical output on paper."],
   ["What does USB stand for?","Universal Serial Bus",["Unified System Board","Universal Storage Base","User Signal Bridge"],"USB is Universal Serial Bus."],
   ["Which application is designed primarily to access and display web pages?","Web browser",["Compiler","Device driver","Disk defragmenter"],"A web browser requests and displays web content."],
   ["What is the primary purpose of a backup?","Recover data after loss or corruption",["Increase CPU frequency","Guarantee a faster internet connection","Replace antivirus protection"],"Backups provide copies that can be used for recovery."],
   ["Which of these is a portable non-volatile storage device?","USB flash drive",["CPU register","L1 cache","ALU"],"A USB flash drive retains stored data without power."],
   ["What does PDF commonly stand for?","Portable Document Format",["Program Data File","Printed Document Folder","Personal Display Function"],"PDF stands for Portable Document Format."],
   ["Which of these is primarily used to scan and digitise a paper document?","Scanner",["Plotter","Speaker","Router"],"A scanner converts a physical document into digital form."],
   ["Which component temporarily stores frequently used data to speed up processing?","Cache memory",["Power supply","Optical drive tray","Keyboard controller"],"Cache stores frequently used instructions or data for faster access."]

  ];
  var cfChoice=cf;
  if(/operating systems/i.test(topic))cfChoice=[
   ["Which of these is an operating system?","Linux",["SQL","HTML","DNS"],"Linux is an operating system."],
   ["What is the primary role of an operating system?","Manage hardware resources and provide services for applications",["Only edit photographs","Only transmit electricity","Only create web addresses"],"An operating system manages resources and provides common services to applications."],
   ["Which of these is a desktop operating system?","Microsoft Windows",["MySQL","SMTP","JPEG"],"Microsoft Windows is a desktop operating system."],
   ["What is a kernel?","The core part of an operating system",["A spreadsheet formula","A network cable","A database row"],"The kernel manages essential system resources."],
   ["Which feature lets an operating system handle multiple tasks in overlapping periods?","Multitasking",["Formatting","Phishing","Defragmenting only"],"Multitasking supports the execution or scheduling of multiple tasks."],
   ["Which file system is commonly used by Windows?","NTFS",["DNS","SMTP","HTML"],"NTFS is a file system used by Windows."],
   ["Which interface accepts typed commands?","Command-line interface",["Touchscreen glass","Printer queue","Graphical wallpaper"],"A command-line interface accepts text commands."],
   ["What is the purpose of a device driver?","Allow the operating system to communicate with hardware",["Create a bank account","Encrypt every website automatically","Replace the CPU"],"Drivers let the OS work with specific hardware devices."],
   ["What is virtual memory used for?","Use storage space to extend the memory available to processes",["Increase the physical CPU clock rate","Replace every file on the SSD","Print documents faster"],"Virtual memory lets an operating system use disk storage as an extension of main memory."],
   ["What is a process in an operating system?","A program in execution",["A file that has never been opened","A physical network cable","A spreadsheet cell"],"A process is an executing instance of a program."],
   ["Which scheduling algorithm assigns a fixed time slice to each ready process in turn?","Round Robin",["First In First Out printer only","Binary search","Disk mirroring"],"Round Robin uses a time quantum for each process."],
   ["What is a deadlock?","A state in which processes wait indefinitely for resources held by one another",["A successful file backup","A screen-resolution setting","A completed software update"],"A deadlock occurs when processes remain blocked waiting for resources."],
   ["What does booting mean?","Starting a computer and loading its operating system",["Removing a database index","Deleting temporary internet files","Changing the display language"],"Booting loads the operating system and prepares the computer for use."],
   ["Which type of operating system is designed to respond within strict timing constraints?","Real-time operating system",["Batch-only operating system","Word processor","Database server only"],"Real-time operating systems are designed to meet timing requirements."],
   ["What is paging in memory management?","Dividing virtual memory into fixed-size pages",["Splitting a monitor into screens","Separating email attachments","Sorting a spreadsheet alphabetically"],"Paging divides memory into fixed-size blocks called pages."],
   ["What is the purpose of a file system?","Organise and track files on storage devices",["Set the bank repo rate","Route all internet packets","Measure processor temperature"],"A file system organises data and metadata on a storage device."],
   ["Which software coordinates access to the processor, memory and devices?","Operating system",["Presentation file","Image codec","Spreadsheet chart"],"The operating system manages system resources."],
   ["What is open-source software?","Software whose source code is made available under a licence permitting inspection and use",["Software that never needs updates","Software that can only run offline","Hardware sold without a warranty"],"Open-source licences permit access to source code and defined rights to use or modify it."],
   ["Which operation moves a process from main memory to disk temporarily to free memory?","Swapping",["Rasterising","Mail merge","Defragmenting a paragraph"],"Swapping moves a process between main memory and secondary storage."],
   ["What is a thread?","A unit of execution within a process",["A type of display cable","A database table key","A printed report"],"A thread is a schedulable sequence of execution within a process."],
   ["Which part of an operating system commonly manages files and directories?","File-system component",["Spreadsheet formula engine","Router antenna","Monitor backlight"],"The file-system component manages files, folders and access to stored data."],
   ["What is the main benefit of user accounts and permissions?","Control access to system resources",["Increase disk capacity physically","Guarantee internet availability","Eliminate the need for backups"],"Permissions help restrict actions and resources to authorised users."],
   ["What does an interrupt allow a computer to do?","Respond to an event that needs processor attention",["Increase file size automatically","Convert every document to PDF","Create a second CPU"],"Interrupts notify the processor that an event requires attention."],
   ["Which technique keeps recently used data in fast memory for quicker access?","Caching",["Spooling only","Formatting","Encryption alone"],"Caching stores copies of frequently accessed data in faster memory."]
  ];
  else if(/hardware|software/i.test(topic))cfChoice=[
   ["Which component is commonly called the computer's main processor?","CPU",["RAM","SSD","NIC"],"The CPU executes instructions."],
   ["Which memory is volatile?","RAM",["ROM","Optical disc","Flash drive when unplugged"],"RAM usually loses its contents when power is removed."],
   ["Which component stores data persistently in a modern computer?","SSD",["CPU register only","ALU","Cache that clears on shutdown"],"An SSD is non-volatile storage."],
   ["Which is an example of application software?","A spreadsheet program",["CPU microcode only","A physical keyboard","An Ethernet cable"],"Application software helps users perform tasks."],
   ["Which type of software manages the computer's resources?","System software",["Presentation theme only","Printed manual","Desk accessory"],"System software includes operating systems and utilities."],
   ["Which unit is commonly used to measure CPU clock rate?","Hertz",["Pixels per inch","Litres","Decibels"],"Clock rate is measured in hertz, commonly gigahertz."],
   ["Which of these is an input device?","Keyboard",["Monitor","Speaker","Projector"],"A keyboard sends input to a computer."],
   ["What is the role of a compiler?","Translate source code into another form such as machine code",["Route packets between networks","Measure screen size","Store a web address"],"A compiler translates source code."],
   ["Which CPU component performs arithmetic and logical operations?","ALU",["Power supply","SSD controller only","Display panel"],"The arithmetic logic unit handles arithmetic and logical operations."],
   ["What is firmware?","Low-level software stored in non-volatile memory that controls a device",["A spreadsheet cell style","A kind of optical cable","A temporary clipboard item"],"Firmware provides low-level control for hardware."],
   ["What is cache memory designed to do?","Provide faster access to frequently used data or instructions",["Archive files for decades","Replace the power supply","Print colour documents"],"Cache reduces average access time for frequently used information."],
   ["Which component renders many graphics operations in parallel?","GPU",["Keyboard controller","Optical drive","Sound card only"],"A GPU accelerates graphics and parallel workloads."],
   ["What does ROM generally retain when power is switched off?","Its stored instructions or data",["All current RAM contents","Every unsaved document","Only network packets"],"Read-only memory is non-volatile."],
   ["Which device converts a printed document into a digital image?","Scanner",["Plotter","Speaker","Projector"],"A scanner captures a physical document as digital data."],
   ["Which component provides power to a desktop computer's internal parts?","Power supply unit",["Graphics driver","Operating system","Keyboard firmware"],"The PSU converts and supplies electrical power to components."],
   ["What is secondary storage used for?","Keep data when the computer is powered off",["Execute every CPU instruction directly","Replace the operating system kernel","Display images without a monitor"],"Secondary storage is non-volatile storage."],
   ["Which of the following is system software?","Device driver",["A bank statement PDF","A presentation slide deck","A photograph"],"A device driver is system software that supports hardware communication."],
   ["Which hardware component connects a computer to a wired network?","Network interface card",["ALU","Heat sink only","Web browser"],"A network interface card provides network connectivity."],
   ["What is the primary purpose of a heat sink?","Dissipate heat from an electronic component",["Store permanent files","Manage user permissions","Resolve domain names"],"A heat sink transfers heat away from components."],
   ["Which component is commonly used for long-term mass storage?","Hard disk drive",["CPU cache","Register","ALU"],"A hard disk provides persistent mass storage."],
   ["What does the motherboard do?","Connects and allows communication among major computer components",["Only prints output","Only stores browser history","Only secures a web session"],"The motherboard hosts and connects key components."],
   ["Which of these is an output device?","Monitor",["Keyboard","Barcode reader","Microphone"],"A monitor displays visual output."],
   ["What is the purpose of a UPS?","Provide temporary power and protection during power interruptions",["Increase RAM size","Translate source code","Filter phishing emails only"],"A UPS provides backup power for a limited time."],
   ["Which technology is commonly used for short-range wireless peripheral connections?","Bluetooth",["NTFS","SQL","HDMI only"],"Bluetooth connects nearby devices wirelessly."]
  ];
  else if(/network|internet/i.test(topic))cfChoice=[
   ["What does URL stand for?","Uniform Resource Locator",["Universal Routing Link","Unified Record Location","User Reference Label"],"A URL identifies a resource location on the web."],
   ["Which protocol is commonly used to browse websites securely?","HTTPS",["Telnet","FTP without security","HTTP only"],"HTTPS protects web traffic using TLS."],
   ["What does DNS do?","Maps domain names to network addresses",["Formats spreadsheets","Encrypts every local file","Checks printer ink"],"DNS resolves domain names to IP addresses."],
   ["What does LAN stand for?","Local Area Network",["Large Access Number","Logical Application Node","Linked Account Name"],"A LAN connects devices within a limited area."],
   ["What is the main role of a router?","Forward data packets between networks",["Print documents","Calculate spreadsheet sums","Store passwords as a database"],"Routers forward packets between networks."],
   ["Which protocol is commonly used to send email between mail servers?","SMTP",["HTML","JPEG","USB"],"SMTP is used to send email."],
   ["What is an IP address used for?","Identify a network interface for IP communication",["Measure CPU temperature","Format a paragraph","Identify a spreadsheet tab"],"IP addresses identify interfaces on IP networks."],
   ["Which protocol suite underpins most internet communication?","TCP/IP",["NTFS","DOCX","BIOS"],"TCP/IP is the core protocol suite used on the internet."],
   ["Which service assigns IP configuration automatically to clients?","DHCP",["DNSSEC only","SMTP","HTML"],"DHCP automatically provides network configuration such as IP addresses."],
   ["Which transport protocol provides ordered, reliable delivery?","TCP",["UDP","ARP","ICMP only"],"TCP provides reliable, ordered byte-stream delivery."],
   ["Which protocol is connectionless and does not guarantee delivery?","UDP",["TCP","HTTPS","SFTP"],"UDP has low overhead but does not guarantee delivery or order."],
   ["What is the standard purpose of a subnet mask?","Separate network and host portions of an IP address",["Encrypt the network password","Assign email folders","Translate HTML to SQL"],"A subnet mask identifies which address bits represent the network."],
   ["Which device commonly connects devices within the same local Ethernet network?","Switch",["Modem only","Scanner","Projector"],"A switch forwards frames within a local network."],
   ["What does bandwidth usually measure in a data network?","The capacity to transfer data per unit time",["Physical cable length","Password strength","Number of website pages"],"Bandwidth expresses data-transfer capacity, often in bits per second."],
   ["Which protocol translates a local IP address to a hardware address on a LAN?","ARP",["SMTP","FTP","SNMP only"],"ARP resolves IPv4 addresses to link-layer addresses on a local network."],
   ["What is a VPN commonly used for?","Create an encrypted tunnel across an untrusted network",["Increase the monitor refresh rate","Replace every firewall","Compress a spreadsheet"],"A VPN can protect traffic between a device and a VPN endpoint."],
   ["Which port is commonly associated with HTTPS?","443",["25","110","21"],"HTTPS conventionally uses TCP port 443."],
   ["Which email protocol synchronises messages and folders across multiple devices?","IMAP",["SMTP alone","ARP","DHCP"],"IMAP synchronises mailbox content with a mail server."],
   ["What is latency in networking?","The time taken for data to travel from source to destination",["The maximum disk capacity","The number of keyboard keys","A type of file system"],"Latency is the delay in communication."],
   ["Which network topology connects each device to a central switch or hub?","Star topology",["Ring only","Bus only","Mesh with every pair directly connected"],"Star topology uses a central connection point."],
   ["What is packet loss?","Failure of data packets to reach their destination",["A type of file compression","A monitor calibration method","An Excel function"],"Packet loss occurs when packets fail to arrive."],
   ["Which protocol is commonly used to transfer files securely over SSH?","SFTP",["FTP without encryption","HTTP only","POP3"],"SFTP transfers files over the SSH protocol."],
   ["What does a MAC address identify?","A network interface at the link layer",["An account's bank balance","A web page's title","A file extension"],"A MAC address is a link-layer identifier for an interface."],
   ["What is the function of a modem?","Modulate and demodulate signals to connect to a communications service",["Create database tables","Run arithmetic instructions","Manage spreadsheet formulas"],"A modem adapts signals for a communication link."]
  ];
  else if(/office|shortcuts/i.test(topic))cfChoice=[
   ["Which keyboard shortcut usually copies selected text in Windows?","Ctrl + C",["Ctrl + V","Ctrl + X","Ctrl + P"],"Ctrl+C copies selected content."],
   ["Which keyboard shortcut usually pastes copied content in Windows?","Ctrl + V",["Ctrl + C","Ctrl + X","Ctrl + Z"],"Ctrl+V pastes clipboard content."],
   ["In a spreadsheet, what does B4 usually mean?","Column B, row 4",["Workbook number 4","Four sheets named B","Row B, column 4"],"A cell reference uses a column label followed by a row number."],
   ["Which spreadsheet function adds a range of numbers?","SUM",["COUNTIF only","LEFT","NOW"],"SUM adds values in selected cells or ranges."],
   ["What is a workbook in spreadsheet software?","A file that can contain multiple worksheets",["A single keyboard key","A network packet","A printer driver"],"A workbook can contain multiple worksheets."],
   ["Which shortcut commonly undoes the last action in Windows applications?","Ctrl + Z",["Ctrl + P","Ctrl + A","Ctrl + S"],"Ctrl+Z typically undoes the last action."],
   ["Which shortcut commonly saves the current document?","Ctrl + S",["Ctrl + F","Ctrl + W","Ctrl + D"],"Ctrl+S saves the current file."],
   ["In word processing, what is a header?","Content displayed in the top margin of a page",["A computer cable","A database password","A network address"],"A header appears in the top margin."],
   ["Which spreadsheet function calculates the arithmetic mean?","AVERAGE",["SUMIF only","CONCAT","ROUNDUP only"],"AVERAGE returns the arithmetic mean of numeric arguments."],
   ["Which spreadsheet function counts cells that contain numbers?","COUNT",["COUNTA only","LEFT","TODAY"],"COUNT counts numeric values in a range."],
   ["In a spreadsheet formula, what does $A$1 represent?","An absolute reference to column A and row 1",["A relative reference that always changes","A worksheet name only","A named chart"],"The dollar signs lock both column and row when copying the formula."],
   ["What does the Freeze Panes feature do?","Keeps selected rows or columns visible while scrolling",["Encrypts the workbook","Deletes duplicate records","Sorts text alphabetically"],"Freeze Panes keeps headers or selected rows/columns visible."],
   ["Which feature is used to display only rows that meet criteria?","Filter",["Mail merge","Track Changes","WordArt"],"Filters show records that satisfy selected conditions."],
   ["What is mail merge used for?","Create personalised documents using a data source",["Compress image files","Build a network route","Protect a database table"],"Mail merge combines a template with records such as names and addresses."],
   ["Which shortcut usually opens the Print dialog in Windows applications?","Ctrl + P",["Ctrl + B","Ctrl + I","Ctrl + H"],"Ctrl+P commonly opens Print."],
   ["Which file extension is standard for modern Excel workbooks?"," .xlsx",[".pptx",".docx",".html"],"Modern Excel workbooks normally use the .xlsx extension."],
   ["Which feature helps identify cells that meet rules by changing their appearance?","Conditional formatting",["Page numbering","Mail merge","Track Changes"],"Conditional formatting formats cells according to rules."],
   ["Which PowerPoint view displays slides as small thumbnails for reordering?","Slide Sorter",["Reading Pane","Outline Print","Formula View"],"Slide Sorter makes it easy to reorder slides."],
   ["Which Word feature records edits for later review?","Track Changes",["Freeze Panes","Goal Seek","Pivot Chart"],"Track Changes records edits and comments for review."],
   ["Which shortcut usually selects all content in the current document or field?","Ctrl + A",["Ctrl + D","Ctrl + R","Ctrl + E"],"Ctrl+A selects all in many Windows applications."],
   ["In a spreadsheet, what does a PivotTable help do?","Summarise and analyse data by categories",["Encrypt a workbook automatically","Change the operating system","Send email between servers"],"PivotTables aggregate and reorganise data for analysis."],
   ["Which Word feature automatically checks text for likely spelling mistakes?","Spell check",["Data validation","Mail merge","Page break preview"],"Spell check flags likely spelling errors."],
   ["Which shortcut commonly finds text in a document?","Ctrl + F",["Ctrl + L","Ctrl + Y","Ctrl + N"],"Ctrl+F opens a find/search function in many applications."],
   ["What is a slide transition in PowerPoint?","An effect used when moving from one slide to another",["A formula copied between cells","A database relation","A printer connection"],"Transitions control how one slide changes to the next."]
  ];
  else if(/database/i.test(topic))cfChoice=[
   ["Which of these is a relational database management system?","MySQL",["Bluetooth","JPEG","SMTP"],"MySQL is a relational database system."],
   ["What is a primary key used for?","Uniquely identify each row in a table",["Format the monitor","Encrypt every browser request","Increase CPU clock speed"],"A primary key uniquely identifies records."],
   ["What does SQL stand for?","Structured Query Language",["Secure Queue Link","System Quality Log","Standard Query Layout"],"SQL is Structured Query Language."],
   ["In a relational database, data is commonly organised into what?","Tables made up of rows and columns",["Only audio tracks","Router antennas","Slides only"],"Relational databases store data in tables."],
   ["What is a database query used for?","Retrieve or manipulate data according to specified criteria",["Cool the CPU","Change screen brightness","Replace a keyboard"],"A query requests or changes database information."],
   ["Which SQL command is commonly used to retrieve records?","SELECT",["PAINT","ROUTE","PRINTSCREEN"],"SELECT retrieves data."],
   ["What is a foreign key used for?","Link records between related tables",["Measure website speed","Encrypt a hard drive by itself","Print a report automatically"],"A foreign key references a key in another table."],
   ["Which property helps reduce duplicate and inconsistent data in database design?","Normalisation",["Phishing","Defragmentation","Screen mirroring"],"Normalisation structures tables to reduce redundancy."],
   ["What is a candidate key?","A minimal set of attributes that uniquely identifies a row",["A duplicate record","A chart title","A network packet"],"A candidate key uniquely identifies records and has no unnecessary attributes."],
   ["What does the SQL INSERT command do?","Adds new rows to a table",["Deletes a table","Renames the operating system","Encrypts the network"],"INSERT adds records."],
   ["What does the SQL UPDATE command do?","Changes existing records",["Creates a new monitor","Starts a browser","Deletes every database automatically"],"UPDATE changes selected rows in a table."],
   ["Which SQL command removes selected rows from a table?","DELETE",["SELECT","JOIN","GRANT only"],"DELETE removes rows that meet a condition."],
   ["What is an index used for in a database?","Speed up retrieval for suitable queries",["Replace all table keys","Store a web page's images","Automatically validate every business rule"],"Indexes can improve data retrieval speed."],
   ["What does a JOIN do in SQL?","Combines related rows from two or more tables",["Changes the screen resolution","Formats a document paragraph","Sends packets to a router"],"JOIN combines rows based on a related column or condition."],
   ["What does database normalisation aim to reduce?","Data redundancy and update anomalies",["Every form of access control","All query execution","Use of primary keys"],"Normalisation reduces redundant storage and anomalies."],
   ["What does ACID consistency mean in transactions?","A transaction preserves defined integrity constraints",["Every transaction must take one second","All data must be public","Tables cannot contain keys"],"Consistency keeps database constraints satisfied across transactions."],
   ["What is a database transaction?","A logical unit of work that is committed or rolled back",["A type of keyboard","A slide transition","A physical network cable"],"Transactions group database operations into a unit."],
   ["What is a NULL value usually used to represent?","A missing, unknown or not-applicable value",["The number zero in every case","An empty string in every system","A unique primary key"],"NULL denotes unavailable or unknown data, not necessarily zero."],
   ["What is referential integrity intended to ensure?","References between related tables remain valid",["Every column must contain text","All queries run without indexes","The database has no users"],"Referential integrity prevents invalid references between tables."],
   ["Which SQL clause filters rows before grouping results?","WHERE",["ORDER BY","HAVING only","CREATE"],"WHERE filters rows before grouping."],
   ["Which SQL clause filters groups after aggregation?","HAVING",["WHERE only","INSERT","DROP"],"HAVING filters aggregated groups."],
   ["What is a view in a relational database?","A virtual table defined by a query",["A physical RAM module","A backup power unit","A network topology"],"A view presents query results like a virtual table."],
   ["What is a database backup for?","Restore data after loss or corruption",["Increase CPU clock rate","Create a new keyboard layout","Route packets more quickly"],"Backups support recovery."],
   ["Which command is commonly used to create a new table in SQL?","CREATE TABLE",["ALTER SCREEN","SELECT TABLE only","OPEN NETWORK"],"CREATE TABLE defines a new table."]
  ];
  else if(/cybersecurity/i.test(topic))cfChoice=[
   ["What is phishing?","A deceptive attempt to obtain sensitive information",["A reconciliation method","A deposit insurance type","An interest formula"],"Phishing uses deceptive messages or websites."],
   ["What is malware?","Software intended to harm, exploit or gain unauthorised access",["A backup schedule","A printer driver only","A public-key standard"],"Malware is malicious software."],
   ["What is multi-factor authentication?","Using two or more different types of verification",["Using the same password twice","Disabling all account checks","A way to compress files"],"MFA combines different verification factors."],
   ["What is ransomware?","Malware that blocks access or encrypts data and demands payment",["A normal software update","A spreadsheet function","A wireless router"],"Ransomware commonly demands payment after restricting access to data."],
   ["Why is encryption used?","To make information unreadable without the required key",["Increase screen resolution","Guarantee that a device never fails","Remove every software bug"],"Encryption protects data confidentiality."],
   ["What is social engineering in cybersecurity?","Manipulating people into revealing information or taking unsafe actions",["A database indexing method","A graphics format","A CPU scheduling method"],"Social engineering targets human behaviour."],
   ["What is a firewall's primary purpose?","Filter network traffic using security rules",["Increase screen brightness","Store spreadsheet formulas","Cool the CPU"],"A firewall controls permitted and blocked traffic."],
   ["Which practice improves password security?","Use a unique long password and a password manager",["Reuse one short password everywhere","Share passwords in public messages","Disable account recovery"],"Unique passwords reduce the risk from credential reuse."],
   ["What is two-factor authentication?","A form of MFA that uses two different verification factors",["Entering the same password twice","Disabling a second check","A type of file compression"],"Two-factor authentication combines two factors."],
   ["What is a zero-day vulnerability?","A software flaw unknown to the party responsible for fixing it or without an available patch",["A vulnerability that has already been fully patched everywhere","A zero-byte attachment","A password with zero characters"],"Zero-day refers to an unpatched or newly discovered vulnerability."],
   ["Why are software security patches important?","They correct known vulnerabilities and other defects",["They always add more memory","They replace the need for backups","They disable all user accounts"],"Patches remediate known weaknesses."],
   ["What is spyware designed to do?","Secretly monitor activity or collect information",["Improve keyboard ergonomics","Format a spreadsheet","Back up files by definition"],"Spyware secretly gathers information."],
   ["What is the principle of least privilege?","Give users only the access necessary for their duties",["Give every user administrator rights","Share one account among all staff","Disable audit records"],"Least privilege limits access to what is needed."],
   ["Why should a bank test its backups?","To confirm data can be restored when needed",["To remove access control","To reduce password length","To disable encryption"],"A successful backup is useful only if recovery works."],
   ["What is a brute-force attack?","Repeatedly trying possible passwords or keys",["Checking a spelling mistake","Creating a database view","Blocking a physical door"],"Brute-force attacks attempt many guesses."],
   ["What is a data breach?","Unauthorised access to or disclosure of protected information",["A scheduled software update","A normal login attempt","A successful backup"],"A breach involves unauthorised exposure or access."],
   ["Which is a safer response to an unexpected attachment from an unknown sender?","Verify the sender through a trusted channel before opening it",["Open it to see what it contains","Disable antivirus first","Forward it to every colleague"],"Unexpected attachments can carry malicious content; verify before opening."],
   ["What is a digital certificate commonly used to help establish?","The identity of a website or entity in a public-key system",["A customer's bank balance","The capacity of an SSD","A spreadsheet average"],"Certificates bind a public key to an identified entity."],
   ["What is a common sign of a phishing message?","Urgent pressure to disclose credentials through an unfamiliar link",["A known official address verified independently","A message expected from a trusted system","An ordinary calendar notice"],"Urgency and credential requests through suspicious links are common phishing signals."],
   ["What does a secure hash function provide?","A fixed-length digest used to check data integrity",["A reversible encryption of any file","A replacement for every password","A way to route network packets"],"Hashes produce digests useful for integrity checks, though they are not encryption."],
   ["Why should employees lock their screens when leaving a workstation?","To reduce the chance of unauthorised use",["To increase monitor brightness","To speed up internet routing","To encrypt all backups automatically"],"Screen locking protects against opportunistic access."],
   ["What is a botnet?","A group of compromised devices controlled for coordinated activity",["A type of database key","A backup device","A spreadsheet add-in"],"A botnet is a network of compromised devices."],
   ["What is the safest way to handle an unexpected request to change a vendor's bank details?","Verify the request independently using a known contact",["Reply to the same suspicious email only","Change the details immediately","Share the approval password"],"Independent verification helps prevent payment-redirection fraud."],
   ["What is data minimisation?","Collecting and retaining only information needed for a stated purpose",["Keeping every record forever","Allowing public access to all records","Duplicating every customer field"],"Data minimisation reduces unnecessary collection and retention."]
  ];
    var f=pick(r,cfChoice.length?cfChoice:cf);return mk(f[0],f[1],f[2],f[3],25);
 }
 if(section==="english"){
  if(/error|sentence correction|phrase replacement|grammar/i.test(topic)){
   var es=pick(r,[
    {a:"Neither the branch manager",b:"nor the clerks was available",c:"to verify the records",fix:"nor the clerks were available",exp:"With neither…nor, the verb agrees with the nearer subject “clerks”, which is plural. Use “were available”."},
    {a:"Each of the loan applications",b:"have been scrutinised",c:"by the credit team",fix:"has been scrutinised",exp:"“Each” is singular and takes “has”, not “have”."},
    {a:"The report, along with the supporting documents,",b:"were submitted yesterday",c:"to the regional office",fix:"was submitted yesterday",exp:"The subject is the singular “report”; “along with...” does not change its number."},
    {a:"No sooner had the audit begun",b:"when the system failed",c:"without warning",fix:"than the system failed",exp:"The standard construction is “no sooner…than”."},
    {a:"The number of unresolved complaints",b:"have declined sharply",c:"since the new process began",fix:"has declined sharply",exp:"“The number” is singular and takes “has”."},
    {a:"A number of customers",b:"has raised concerns",c:"about the revised charges",fix:"have raised concerns",exp:"“A number of” takes a plural verb: “have raised”."},
    {a:"The candidate is senior",b:"than me in the department",c:"by three years",fix:"to me in the department",exp:"“Senior” is followed by “to”, not “than”."},
    {a:"The officer insisted",b:"to verify the original documents",c:"before releasing the funds",fix:"on verifying the original documents",exp:"“Insist” is followed by “on” + gerund."},
    {a:"Despite of the delay",b:"the team completed the reconciliation",c:"before the deadline",fix:"Despite the delay",exp:"Use “despite” directly before a noun phrase; do not add “of”."},
    {a:"If the bank had received the form earlier",b:"it will have processed the request",c:"before the weekend",fix:"it would have processed the request",exp:"A past unreal condition uses “if + past perfect” and “would have + past participle”."},
    {a:"The manager asked the cashier",b:"why was the cash balance short",c:"at the end of the shift",fix:"why the cash balance was short",exp:"Indirect questions use statement word order: subject before verb."},
    {a:"The documents must be submitted",b:"before Monday next week",c:"to avoid rejection",fix:"by next Monday",exp:"“By next Monday” is the concise and natural deadline expression."},
    {a:"Every one of the applicants",b:"were informed of the result",c:"through the registered email address",fix:"was informed of the result",exp:"“Every one” is singular and takes “was”."},
    {a:"The audit team has completed",b:"its work and submitted their report",c:"to the finance controller",fix:"its report",exp:"The singular team is referred to as “its”; keep the pronoun consistent."},
    {a:"The new policy is more effective",b:"then the earlier procedure",c:"for handling disputed transactions",fix:"than the earlier procedure",exp:"Use “than” for comparisons; “then” refers to time or sequence."},
    {a:"Hardly had the customer entered",b:"than the service desk closed",c:"for the scheduled break",fix:"when the service desk closed",exp:"The correct pair is “hardly…when”."},
    {a:"The data collected from the branches",b:"indicates a rise in overdue accounts",c:"during the quarter",fix:"indicate a rise in overdue accounts",exp:"In formal exam grammar, “data” is treated as a plural noun in this construction."},
    {a:"One of the officers who",b:"has attended the training",c:"will lead the new team",fix:"have attended the training",exp:"“Who” refers to the plural “officers”, so use “have”."},
    {a:"Neither the chief manager nor the clerks",b:"was willing to sign",c:"the incomplete register",fix:"were willing to sign",exp:"With neither…nor, the verb agrees with the nearer plural subject “clerks”."},
    {a:"The bank is looking forward",b:"to expand its rural outreach",c:"in the coming year",fix:"to expanding its rural outreach",exp:"In “look forward to”, “to” is a preposition and is followed by a gerund."},
    {a:"Having checked the ledger carefully",b:"the discrepancy was identified by the officer",c:"before the branch closed",fix:"the officer identified the discrepancy",exp:"The opening participial phrase must describe the person performing the check."},
    {a:"The amount of cash withdrawn",b:"were higher than expected",c:"during the festival period",fix:"was higher than expected",exp:"“Amount” is singular and takes “was”."},
    {a:"She is one of the analysts who",b:"prepares the monthly risk report",c:"for the committee",fix:"prepare the monthly risk report",exp:"“Who” refers to “analysts”, so the relative clause uses plural “prepare”."},
    {a:"The officer gave me",b:"an useful explanation",c:"of the revised procedure",fix:"a useful explanation",exp:"“Useful” begins with a consonant /y/ sound, so use “a”."},
    {a:"The branch has operated",b:"here since ten years",c:"without a major incident",fix:"here for ten years",exp:"Use “for” with a duration and “since” with a starting point."},
    {a:"The committee discussed",b:"about the proposed merger",c:"at length yesterday",fix:"the proposed merger",exp:"“Discuss” takes a direct object; do not add “about”."},
    {a:"Unless you do not submit the form",b:"your application will be rejected",c:"after the closing date",fix:"Unless you submit the form",exp:"“Unless” already means “if not”; avoid the additional negative."},
    {a:"The financial statements",b:"has been reviewed by the auditors",c:"and approved by management",fix:"have been reviewed by the auditors",exp:"“Statements” is plural and takes “have”."},
    {a:"The more carefully the figures are checked",b:"the fewer errors are likely to occur",c:"in the final report",fix:"No error",exp:"This comparative construction is grammatically correct: “the more…, the fewer…”."},
    {a:"The bank not only reduced processing time",b:"but also improved customer satisfaction",c:"across its branches",fix:"No error",exp:"“Not only…but also” correctly links the two parallel verb phrases."}
   ]);
   var opts=["Part A: "+es.a,"Part B: "+es.b,"Part C: "+es.c,"No error"],correct=es.fix==="No error"?"No error":opts[1];
   return mk("Identify the part containing the grammatical error.<br><br>"+es.a+" / "+es.b+" / "+es.c+".",correct,[opts[0],opts[2],opts[3]].filter(function(z){return z!==correct;}),es.exp+(es.fix==="No error"?"":" Correction: “"+es.fix+"”."),30);
  }
  if(/reading comprehension/i.test(topic)){
   var items=[
    {p:"Digital banking has reduced the time customers spend on routine transactions. However, convenience alone does not guarantee safety. Banks must invest in secure authentication and timely fraud detection, while customers should verify payment requests through official channels. Effective grievance redressal is equally important because trust can be damaged when complaints remain unresolved.",q:"Which statement best captures the central idea?",c:"Digital banking is useful when supported by security and responsive customer service",w:["Digital services should replace every bank employee","Convenience is the only measure of banking quality","Customers should avoid all electronic transactions"],e:"The passage balances digital convenience with security and complaint resolution."},
    {p:"Financial inclusion is not achieved merely by opening bank accounts. Customers must also be able to use savings, payment, credit and insurance services affordably and confidently. Local-language guidance, suitable products and reliable infrastructure help convert account ownership into meaningful participation in the formal financial system.",q:"What can be inferred from the passage?",c:"Account ownership alone may not ensure meaningful access to financial services",w:["Every account holder needs a loan","Financial inclusion applies only to urban customers","Insurance services are unrelated to inclusion"],e:"The passage explicitly distinguishes account opening from confident and affordable use of services."},
    {p:"A bank evaluates credit risk by examining repayment capacity, existing obligations and the reliability of information supplied by the applicant. A high income may be reassuring, but it does not eliminate risk if liabilities are also high or cash flows are unstable. Responsible lending therefore requires an assessment of the overall financial position.",q:"Why might a high-income applicant still present credit risk?",c:"The applicant may have high liabilities or unstable cash flows",w:["High income always prevents repayment","Banks cannot examine liabilities","Credit risk depends only on age"],e:"The passage says income must be assessed alongside obligations and cash-flow stability."},
    {p:"Customer complaints can reveal weaknesses that routine performance metrics fail to detect. When a bank classifies complaints by cause, resolution time and repeat occurrence, managers can identify recurring process failures rather than treating every case as an isolated event. The resulting changes may improve both efficiency and customer confidence.",q:"What is the main benefit of analysing complaint patterns?",c:"It helps identify recurring process failures and target improvements",w:["It removes the need to respond to customers","It guarantees that no complaint will arise","It replaces all operational performance measures"],e:"The passage highlights pattern analysis as a way to identify systemic problems."},
    {p:"In data interpretation, an average can conceal substantial variation. Two branches may report the same average recovery rate even though one has a large number of consistently performing accounts and the other has a small sample with extreme results. A weighted average can be more appropriate when the groups differ in size.",q:"When is a weighted average especially useful?",c:"When the groups contributing to the average differ in size",w:["When every observation must count equally regardless of scale","When no numerical information is available","When the values are all identical"],e:"The passage explains that different group sizes can make a weighted average more appropriate."},
    {p:"Internal controls are most effective when responsibility is clearly assigned and exceptions are documented. A control that exists only on paper may fail if staff routinely bypass it or if the same person initiates, authorises and reconciles a transaction. Periodic review helps determine whether controls operate as intended.",q:"Which weakness could undermine internal controls?",c:"Allowing one person to initiate, authorise and reconcile the same transaction",w:["Documenting exceptions","Assigning responsibilities clearly","Periodically reviewing control performance"],e:"The passage identifies segregation of duties as essential and warns against one person controlling all stages."},
    {p:"A sudden increase in digital payments may create both business opportunities and operational pressures. Transaction systems need sufficient capacity, fraud monitoring must remain responsive, and customers need clear instructions when a payment fails. Planning for peak volumes is therefore part of service reliability, not merely a technical concern.",q:"The passage suggests that peak-volume planning is important because…",c:"It supports reliable service while managing operational and fraud risks",w:["Payment volume never changes","Customers should not use digital channels during busy periods","Fraud monitoring can be suspended during peaks"],e:"The passage links volume planning with capacity, fraud monitoring and reliable customer support."},
    {p:"Compound interest reflects interest earned on both the original principal and previously accumulated interest. Its effect becomes more pronounced over longer periods because each period's interest can itself generate further interest. When comparing products, customers should also examine compounding frequency, fees and the stated annual rate.",q:"Why can compound interest grow faster over a longer period?",c:"Previously earned interest can itself generate additional interest",w:["The principal is always doubled each year","Fees are added to the interest rate automatically","The rate must increase every period"],e:"The passage explains that accumulated interest becomes part of the amount earning future interest."},
    {p:"A well-designed recruitment test measures more than raw knowledge. Time limits test prioritisation, distractors reveal common misconceptions, and post-test analysis helps candidates decide which topics deserve additional practice. Reviewing every mistake is usually more useful than repeatedly attempting new tests without examining the reasons for errors.",q:"Which study practice is recommended by the passage?",c:"Analyse mistakes after a test before attempting more tests",w:["Ignore incorrect answers if the score is acceptable","Study only the easiest topics","Use speed as the only measure of preparation"],e:"The passage recommends post-test analysis to identify misconceptions and focus practice."},
    {p:"A bank's liquidity position influences its ability to meet withdrawal demands and other payment obligations. Holding liquid assets provides a buffer, but excessive idle liquidity can reduce returns. Treasury managers therefore balance safety, regulatory requirements and profitability while considering possible stress scenarios.",q:"What trade-off is highlighted in the passage?",c:"Liquidity safety must be balanced against the opportunity cost of idle funds",w:["Profitability always takes priority over safety","Liquid assets eliminate every financial risk","Regulations are irrelevant to treasury decisions"],e:"The passage describes balancing safety, requirements and profitability."},
    {p:"An effective audit trail records who performed an action, what changed and when the change occurred. Such records support accountability and make it easier to reconstruct events after an error or suspected fraud. Nevertheless, an audit trail is valuable only if access is controlled and records are protected against alteration.",q:"What condition is necessary for an audit trail to remain useful?",c:"Its records must be protected from unauthorised alteration",w:["It should avoid recording timestamps","Every employee should be able to change any record","It must replace independent audits"],e:"The passage notes that controlled access and protection from alteration are essential."},
    {p:"Financial literacy helps customers compare products, recognise misleading claims and understand the cost of borrowing. It does not remove every risk, but it can improve the quality of decisions. Clear disclosures by banks remain important because even informed customers may struggle when charges or conditions are presented ambiguously.",q:"Which conclusion is best supported?",c:"Financial literacy and clear product disclosures complement one another",w:["Disclosures are unnecessary for informed customers","Financial literacy removes all financial risks","Only borrowers need financial information"],e:"The passage says literacy helps decision-making but clear disclosures remain important."},
    {p:"A branch's productivity should not be judged solely by the number of transactions it processes. Error rates, customer waiting time, compliance quality and the complexity of the transactions also matter. A rise in volume can look positive while concealing a deterioration in service quality.",q:"Why may transaction volume alone be misleading?",c:"It does not show whether accuracy, waiting time or compliance quality changed",w:["Transaction counts cannot be measured","High volume always indicates poor service","Compliance matters only at small branches"],e:"The passage lists additional measures needed for a balanced assessment."},
    {p:"When interest rates change, the effect on borrowers and savers depends on product terms. A floating-rate loan may reprice according to its benchmark, while a fixed-rate deposit generally follows its agreed terms for the specified period. Customers should review the contract rather than assuming that every rate changes immediately.",q:"What should a customer do when market rates change?",c:"Check the product terms to understand how and when the rate can change",w:["Assume every financial product reprices immediately","Ignore the benchmark on a floating-rate loan","Assume all deposits become floating-rate products"],e:"The passage says repricing depends on the contract and product type."},
    {p:"In a ratio problem, transferring an amount from one account to another changes both balances while preserving their combined total. The new ratio cannot be found by changing only one term of the original ratio; the actual balances must first be calculated and then adjusted by the transfer amount.",q:"What is the correct method for a ratio-transfer problem?",c:"Find the original balances, apply the transfer, then reduce the new ratio",w:["Add the transfer to both balances","Change only the first ratio term","Assume the combined total has doubled"],e:"The passage outlines the proper sequence for solving account-transfer ratios."},
    {p:"A bank's cybersecurity policy needs both technical safeguards and staff awareness. Multi-factor authentication can reduce the damage caused by stolen passwords, while careful verification of unusual instructions can help counter social engineering. Neither measure is sufficient if suspicious incidents are not reported and investigated promptly.",q:"Which conclusion follows from the passage?",c:"Security requires layered safeguards and timely incident handling",w:["Multi-factor authentication prevents every attack","Staff awareness makes technical safeguards unnecessary","Incidents should be investigated only after financial loss"],e:"The passage explains that several complementary measures are needed."},
    {p:"A monetary policy decision can influence borrowing costs, spending and inflation, but the effect is not instantaneous. Banks and markets respond over time, and the eventual outcome also depends on demand, supply conditions and expectations. This is why analysts distinguish a policy action from its later economic effects.",q:"Why should policy effects not be assessed immediately?",c:"Their transmission to borrowing, spending and prices takes time",w:["Policy has no relationship with the economy","Supply conditions never affect inflation","Banks do not respond to policy changes"],e:"The passage describes time lags and other factors that shape outcomes."},
    {p:"A candidate preparing for timed reasoning sets should first translate each clue into a precise relationship, then reject arrangements that violate any condition. Guessing a full order too early often causes repeated work. A structured table or position grid can make constraints easier to track and verify.",q:"Which approach is advised for solving a multi-clue puzzle?",c:"Translate clues into constraints and verify each arrangement systematically",w:["Commit to the first plausible order","Ignore clues that are hard to place","Use trial and error without checking all conditions"],e:"The passage recommends structured representation and checking every condition."},
    {p:"A weighted recovery rate differs from a simple average because each branch's rate is multiplied by the relevant account volume. A branch with many accounts therefore has a larger influence on the combined figure than a small branch. Mixing these two averages can lead to incorrect comparisons.",q:"Why might a simple average misrepresent combined recovery performance?",c:"It gives equal weight to branches despite different account volumes",w:["It always produces a higher value","It uses no percentages","It cannot be calculated from branch figures"],e:"The passage explains that different account volumes should affect each branch's contribution."},
    {p:"A credit score is one input into a lending decision, not a complete description of a borrower's present circumstances. Lenders may also consider income stability, current obligations, collateral and the purpose of the loan. Responsible decisions combine relevant evidence instead of treating one number as conclusive.",q:"What does the passage say about credit scores?",c:"They are useful but should be considered alongside other relevant evidence",w:["They alone determine every lending decision","They measure only a customer's income","They make review of existing obligations unnecessary"],e:"The passage clearly describes the score as one input among several."}
   ];
   var item=pick(r,items);
   return mk("<b>Read the passage and answer the question.</b><br><br>"+item.p+"<br><br>"+item.q,item.c,item.w,item.e,50);
  }
  if(/cloze|fill in|double fillers/i.test(topic)){
   var f=pick(r,[
    ["The auditor asked the team to ___ every adjustment with supporting evidence.","substantiate",["postpone","dilute","overlook"],"Substantiate means support a claim with evidence."],
    ["The committee reached a ___ decision after reviewing the risk report.","unanimous",["ambiguous","reluctant","sporadic"],"Unanimous means agreed by all members."],
    ["The new reconciliation process is expected to ___ the number of manual errors.","reduce",["amplify","suspend","disperse"],"Reduce is the only option that fits the intended outcome."],
    ["The officer remained ___ despite pressure to approve the incomplete file.","impartial",["impulsive","partial","erratic"],"Impartial means fair and unbiased."],
    ["A prudent borrower should ___ the repayment schedule before accepting the loan.","scrutinise",["conceal","evade","diminish"],"Scrutinise means examine closely."],
    ["The circular was issued to ___ the procedure across all regional offices.","standardise",["contradict","fragment","postpone"],"Standardise means make consistent."],
    ["The evidence was not sufficient to ___ the customer's allegation.","corroborate",["prolong","undermine","disregard"],"Corroborate means confirm or support with evidence."],
    ["The bank introduced additional checks to ___ the risk of identity fraud.","mitigate",["intensify","displace","compile"],"Mitigate means make less severe."],
    ["The officer's explanation was clear and ___, leaving little room for doubt.","unambiguous",["arbitrary","ambivalent","superfluous"],"Unambiguous means having one clear meaning."],
    ["The recovery team acted quickly to ___ the overdue balance.","regularise",["escalate","conceal","fragment"],"Regularise means bring into proper or acceptable status."],
    ["The proposed merger remains ___ on regulatory approval.","contingent",["resistant","immune","redundant"],"Contingent on means dependent on."],
    ["The manager advised staff not to ___ confidential customer information.","disclose",["reconcile","accrue","endorse"],"Disclose means reveal information."],
    ["The policy aims to ___ access to formal credit for small enterprises.","facilitate",["obstruct","withdraw","invalidate"],"Facilitate means make easier."],
    ["The figures were cross-checked to ensure the report was ___ and complete.","accurate",["volatile","arbitrary","reluctant"],"Accurate and complete is the logical collocation."],
    ["A delay in reporting the incident could ___ the eventual investigation.","complicate",["simplify","validate","endorse"],"Complicate means make more difficult."],
    ["The lender requested additional documents to ___ the source of the funds.","verify",["postpone","dilute","divert"],"Verify means establish truth or authenticity."],
    ["The committee rejected the proposal because the projected benefits were ___ by the costs.","outweighed",["preceded","inferred","facilitated"],"Outweighed means exceeded in importance or value."],
    ["Management asked the branches to ___ the new compliance checklist without delay.","implement",["misplace","evade","defer"],"Implement means put into effect."],
    ["The analyst warned that the conclusion was based on ___ evidence.","insufficient",["conclusive","unanimous","inevitable"],"Insufficient means not enough."],
    ["The customer was asked to ___ the discrepancy through the official grievance channel.","report",["conceal","suppress","withdraw"],"Report is the suitable action in a grievance process."],
    ["The risk officer recommended a more ___ assessment of the applicant's liabilities.","comprehensive",["superficial","sporadic","negligent"],"Comprehensive means complete and wide-ranging."],
    ["The revised controls are designed to ___ unauthorised transactions.","prevent",["facilitate","endorse","accelerate"],"Prevent means stop something from happening."],
    ["The branch must retain records so that the transaction can be ___ later.","traced",["forgotten","distorted","abandoned"],"Trace means follow a record or event back through its history."],
    ["The terms were explained in plain language to avoid any ___ about the charges.","misunderstanding",["consensus","compliance","proficiency"],"Misunderstanding fits the context of unclear charges."],
    ["The central office asked each branch to ___ its figures before consolidation.","validate",["obscure","diminish","suspend"],"Validate means check that data is sound."],
    ["The borrower requested a revised repayment plan after a temporary ___ in cash flow.","shortfall",["surplus","consensus","proficiency"],"Shortfall means a shortage."],
    ["The panel found the explanation plausible but not fully ___.","convincing",["convenient","conventional","contingent"],"Convincing means persuasive."],
    ["The bank will not ___ a payment until the beneficiary details are confirmed.","release",["retract","conceal","compile"],"Release is appropriate for a verified payment."],
    ["The regulator expects institutions to maintain ___ records of customer consent.","verifiable",["ambiguous","irrelevant","sporadic"],"Verifiable means able to be checked."],
    ["The officer was commended for handling the complaint with tact and ___.","discretion",["disruption","derision","defiance"],"Discretion means careful, appropriate judgement."],
    ["The programme seeks to ___ financial awareness among first-time account holders.","promote",["obstruct","curtail","invalidate"],"Promote means support or encourage."],
    ["The branch's performance improved once the redundant approval step was ___.","eliminated",["multiplied","retained","concealed"],"Eliminated means removed."],
    ["The figures from the two ledgers did not ___, so the team initiated a review.","correspond",["deteriorate","proliferate","hesitate"],"Correspond means match or agree."]
   ]);
   return mk(f[0],f[1],f[2],f[3],30);
  }
  if(/idioms/i.test(topic)){var idi=pick(r,[
["“A blessing in disguise” means…","something good that first seemed bad",["an obvious warning","a promise never kept","a costly mistake"],"It refers to a benefit that was not apparent at first."],
["“At the eleventh hour” means…","at the last possible moment",["very early","after a full year","without preparation"],"It means at the last moment."],
["“Break the ice” means…","make people feel more comfortable",["damage something valuable","end a business deal","avoid conversation"],"It means easing initial social tension."],
["“A piece of cake” means…","something very easy",["an expensive purchase","a difficult argument","an unknown fact"],"The idiom means easy to do."],
["“Hit the nail on the head” means…","describe something exactly right",["make a careless mistake","delay a decision","avoid the main issue"],"It means identify the exact point."],
["“Once in a blue moon” means…","very rarely",["every day","at the last moment","twice a week"],"It describes something that happens infrequently."],
["“Spill the beans” means…","reveal a secret",["prepare a meal","lose a document","make a payment"],"It means disclose information that was meant to remain secret."],
["“Under the weather” means…","feeling unwell",["working outdoors","feeling successful","travelling abroad"],"The expression means feeling ill."],
["“Burn the midnight oil” means…","work or study late into the night",["waste money quickly","finish work early","avoid an assignment"],"It refers to working late."],
["“Cost an arm and a leg” means…","be very expensive",["be completely free","take very little time","be easy to repair"],"It describes something that costs a great deal."],
["“The ball is in your court” means…","it is your turn or responsibility to act",["the game is cancelled","the task is finished","someone has lost a document"],"It means the next decision or action is yours."],
["“Call it a day” means…","stop working for the day",["start a new project","make a phone call","postpone a meeting indefinitely"],"It means stop the current activity."],
["“Bite the bullet” means…","face a difficult situation bravely",["avoid every responsibility","celebrate too early","spend without planning"],"It means endure an unpleasant task with courage."],
["“Cut corners” means…","do something cheaply or quickly by sacrificing quality",["measure something accurately","follow every rule","review all the details"],"It means take shortcuts, often at the expense of quality."],
["“Back to square one” means…","start again from the beginning",["finish successfully","move to the next stage","make a final payment"],"It means return to the starting point."],
["“Get cold feet” means…","become nervous and hesitate",["become physically cold only","finish a race quickly","make a confident decision"],"It means lose courage just before an action."],
["“On the same page” means…","share the same understanding",["read the same book silently","disagree on every point","work in separate offices"],"It means understand or agree about something."],
["“In hot water” means…","in trouble",["in a comfortable situation","working efficiently","waiting for approval"],"It means being in difficulty or trouble."],
["“Keep an eye on” means…","watch carefully",["ignore completely","write a report","close an account"],"It means monitor something."],
["“Pull someone’s leg” means…","tease or joke with someone",["help someone walk","criticise formally","ask for directions"],"It means tease someone, often playfully."],
["“Make ends meet” means…","manage to cover basic expenses",["finish a meeting early","join two cables","avoid all costs"],"It means have enough money for ordinary needs."],
["“By the book” means…","according to the rules",["without any records","in a hurry","based on rumours"],"It means follow established procedures or rules."],
["“Leave no stone unturned” means…","search or investigate very thoroughly",["stop looking immediately","hide the evidence","repeat the same mistake"],"It means make every possible effort to find something."],
["“A storm in a teacup” means…","a small problem made to seem much bigger",["a serious natural disaster","a successful business plan","an unexpected benefit"],"It describes exaggerated concern about a minor issue."],
["“Beat around the bush” means…","avoid speaking about the main point directly",["work in a garden","answer immediately","complete a task carefully"],"It means avoid getting to the point."],
["“Bite off more than you can chew” means…","take on more work than you can manage",["eat a balanced meal","finish a small task","delegate responsibilities wisely"],"It means accept more than your capacity allows."],
["“In the long run” means…","over an extended period of time",["in the next few seconds","before starting","at the last minute"],"It refers to the eventual or long-term outcome."],
["“Take it with a grain of salt” means…","do not accept it as completely true without question",["add flavour to food","believe every detail immediately","reject all evidence"],"It means treat a claim with some scepticism."],
["“The tip of the iceberg” means…","a small visible part of a much larger issue",["the final stage of a project","a simple complete solution","a small task with no impact"],"It describes a visible part that hints at a much larger whole."],
["“Go the extra mile” means…","make more effort than is expected",["travel without a destination","stop before completion","repeat work unnecessarily"],"It means do more than the minimum required."],
["“A hard nut to crack” means…","a difficult problem to solve",["an easy task","a friendly conversation","a financial bonus"],"It describes something difficult to understand or solve."],
["“Add fuel to the fire” means…","make a bad situation worse",["resolve a dispute calmly","finish a task quickly","provide useful evidence"],"It means intensify an existing problem."],
["“The best of both worlds” means…","enjoy the benefits of two different things",["choose neither option","experience two problems","make a compromise with no benefit"],"It describes a situation with advantages from both alternatives."]
]);return mk(idi[0],idi[1],idi[2],idi[3],20);}
  if(/vocabulary|word swap|spelling/i.test(topic)){
   var vocab=pick(r,[
    ["Choose the closest meaning of “mitigate”.","lessen",["intensify","postpone","duplicate"],"Mitigate means make less severe."],
    ["Choose the closest meaning of “prudent”.","wise and careful",["reckless","uncertain","extravagant"],"Prudent means acting with care and good judgement."],
    ["Choose the closest meaning of “ubiquitous”.","widespread",["rare","temporary","hidden"],"Ubiquitous means present or found everywhere."],
    ["Choose the antonym of “scarce”.","abundant",["limited","rare","insufficient"],"Abundant is the opposite of scarce."],
    ["Choose the correctly spelled word.","accommodation",["accomodation","acommodation","accommadation"],"The correct spelling is accommodation."],
    ["Choose the closest meaning of “austere”.","strict or unadorned",["luxurious","uncertain","talkative"],"Austere can mean severe, simple or without luxury."],
    ["Choose the antonym of “benevolent”.","malevolent",["charitable","generous","compassionate"],"Malevolent is the opposite of benevolent."],
    ["Choose the closest meaning of “concur”.","agree",["object","delay","conceal"],"Concur means agree."],
    ["Choose the closest meaning of “diligent”.","hard-working and careful",["careless","indifferent","unreliable"],"Diligent describes careful, persistent effort."],
    ["Choose the antonym of “explicit”.","implicit",["precise","direct","clear"],"Implicit is the opposite of explicit."],
    ["Choose the closest meaning of “frugal”.","economical",["wasteful","extravagant","lavish"],"Frugal means careful with money or resources."],
    ["Choose the closest meaning of “impartial”.","unbiased",["prejudiced","hostile","uncertain"],"Impartial means not favouring one side."],
    ["Choose the antonym of “inevitable”.","avoidable",["certain","unavoidable","inescapable"],"Avoidable is the opposite of inevitable."],
    ["Choose the closest meaning of “lucid”.","clear and easy to understand",["confusing","obscure","complicated"],"Lucid means clear."],
    ["Choose the closest meaning of “obsolete”.","outdated",["modern","current","innovative"],"Obsolete means no longer in use."],
    ["Choose the antonym of “opaque”.","transparent",["cloudy","obscure","unclear"],"Transparent is the opposite of opaque."],
    ["Choose the closest meaning of “reconcile”.","bring into agreement",["separate","contradict","exaggerate"],"Reconcile means make consistent or resolve a difference."],
    ["Choose the closest meaning of “scrutinise”.","examine closely",["ignore","summarise","approve automatically"],"Scrutinise means inspect carefully."],
    ["Choose the antonym of “transient”.","permanent",["temporary","brief","fleeting"],"Permanent is the opposite of transient."],
    ["Choose the closest meaning of “viable”.","capable of working successfully",["impossible","unprofitable by definition","irrelevant"],"Viable means workable or feasible."],
    ["Choose the closest meaning of “candid”.","frank and honest",["evasive","deceptive","reserved by necessity"],"Candid means truthful and direct."],
    ["Choose the closest meaning of “deteriorate”.","become worse",["improve","stabilise","accelerate"],"Deteriorate means decline in quality or condition."],
    ["Choose the antonym of “dormant”.","active",["inactive","sleeping","latent"],"Active is the opposite of dormant."],
    ["Choose the closest meaning of “exacerbate”.","make worse",["alleviate","clarify","prevent"],"Exacerbate means aggravate or intensify a problem."],
    ["Choose the closest meaning of “feasible”.","practicable",["impossible","uncertain","irrelevant"],"Feasible means possible and practical."],
    ["Choose the antonym of “hostile”.","friendly",["aggressive","antagonistic","unfavourable"],"Friendly is the opposite of hostile."],
    ["Choose the closest meaning of “imminent”.","about to happen",["remote","unlikely","long past"],"Imminent describes something near in time."],
    ["Choose the closest meaning of “meticulous”.","very careful about details",["careless","rushed","indifferent"],"Meticulous means extremely attentive to detail."],
    ["Choose the antonym of “novice”.","expert",["beginner","learner","trainee"],"Expert is the opposite of novice."],
    ["Choose the closest meaning of “resilient”.","able to recover quickly",["fragile","rigid","unresponsive"],"Resilient means able to recover from difficulty."],
    ["Choose the closest meaning of “substantiate”.","support with evidence",["undermine","invent","postpone"],"Substantiate means provide evidence for a claim."],
    ["Choose the antonym of “tentative”.","definite",["provisional","uncertain","hesitant"],"Definite is the opposite of tentative."],
    ["Choose the closest meaning of “vindicate”.","clear from blame or suspicion",["accuse","condemn","obstruct"],"Vindicate means show someone or something to be right or justified."],
    ["Choose the correctly spelled word.","entrepreneur",["entreprenuer","enterpreneur","entreprenur"],"The correct spelling is entrepreneur."],
    ["Choose the correctly spelled word.","embarrassment",["embarassment","embarrasment","embarrasement"],"The correct spelling is embarrassment."],
    ["Choose the closest meaning of “arbitrary”.","based on random choice rather than reason",["systematic","evidence-based","mandatory"],"Arbitrary means based on whim or random choice."],
    ["Choose the antonym of “concise”.","verbose",["brief","succinct","compact"],"Verbose is the opposite of concise."],
    ["Choose the closest meaning of “deference”.","respectful submission",["defiance","disregard","hostility"],"Deference means respectful regard for another's judgement or position."],
    ["Choose the closest meaning of “scrupulous”.","very attentive to ethics and accuracy",["careless","dishonest","indifferent"],"Scrupulous means conscientious and careful."],
    ["Choose the antonym of “plausible”.","implausible",["credible","reasonable","believable"],"Implausible is the opposite of plausible."]
   ]);
   return mk(vocab[0],vocab[1],vocab[2],vocab[3],25);
  }
  if(/para jumbles/i.test(topic)){var sets=[
["The applicant submits the loan form.","The bank verifies the supporting documents.","The credit team reviews the application.","The bank communicates its decision."],
["The bank launches a mobile application.","Customers can check balances remotely.","Routine branch visits decline.","Staff can focus more on complex enquiries."],
["A customer notices a suspicious transaction.","The customer reports it through an official channel.","The bank reviews the transaction records.","The bank communicates the outcome."],
["The customer completes the account form.","The bank verifies the KYC details.","The account is activated.","A confirmation message is sent to the customer."],
["The audit plan is approved.","The team samples the relevant records.","The auditors document exceptions.","The final findings are reported."],
["The monthly figures are collected.","The data is checked for errors.","The analyst compares the results.","The report is submitted to management."],
["A customer raises a complaint.","A reference number is issued.","The case is investigated.","The resolution is communicated to the customer."],
["Employees attend the training session.","They practise the updated procedure.","Their understanding is assessed.","Successful participants receive completion certificates."],
["An ATM transaction fails.","The customer files a complaint.","The transaction logs are checked.","The eligible reversal is processed."],
["The bank collects income documents.","The credit history is reviewed.","Repayment capacity is assessed.","Suitable loan terms are offered."],
["A new policy is announced.","Banks examine its implications.","Internal procedures are updated.","Customers are informed of relevant changes."],
["The customer initiates an online payment.","The bank validates the transaction details.","The transfer is processed.","A receipt appears on the screen."],
["The committee drafts the proposal.","Members review the recommendations.","The draft is revised.","The final version is approved."],
["The system detects an unusual login.","A security alert is raised.","The event is investigated.","Additional safeguards are introduced if needed."],
["The bank calculates the interest.","Applicable deductions are considered.","The net amount is credited.","The transaction appears in the statement."]
];var seq=pick(r,sets).slice(),shown=seq.slice();for(var si=shown.length-1;si>0;si--){var sj=ri(r,0,si),sv=shown[si];shown[si]=shown[sj];shown[sj]=sv;}var ansOrder=seq.join(" → "),wrong1=seq.slice().reverse().join(" → "),wrong2=[seq[1],seq[0],seq[2],seq[3]].join(" → "),wrong3=[seq[0],seq[2],seq[1],seq[3]].join(" → ");return mk("Arrange these sentences into a coherent paragraph:<br><br>"+shown.map(function(x,i){return String.fromCharCode(65+i)+". "+x;}).join("<br>"),ansOrder,[wrong1,wrong2,wrong3],"Follow the logical sequence of events. The correct order begins with the initiating action and ends with its outcome.",45);}
  return mk("Choose the best word to complete the sentence: A clear explanation can ___ misunderstandings between the customer and the bank.","reduce",["worsen","conceal","multiply"],"“Reduce” fits the sentence's meaning.",25);
 }
 if(section==="reasoning"||section==="reasonComp"){
  if(/only a few/i.test(topic)||/syllogism/i.test(topic)){
   var nouns=["clerks","borrowers","depositors","auditors","managers","employees","customers","officers","cashiers","trainees","applicants","investors","pensioners","policyholders","account holders","loan officers","credit analysts","branch managers"],a=pick(r,nouns),b=pick(r,nouns.filter(function(x){return x!==a;})),c=pick(r,nouns.filter(function(x){return x!==a&&x!==b;})),sy;
   var choose=ri(r,0,7);
   if(/only a few/i.test(topic)||choose===0)sy={s:"Only a few "+a+" are "+b+".",c:"Both conclusions I and II follow",w:["Only conclusion I follows","Only conclusion II follows","Neither conclusion follows"],cns:"I. Some "+a+" are "+b+". II. Some "+a+" are not "+b+".",e:"“Only a few A are B” means some A are B and some A are not B; both conclusions follow."};
   else if(choose===1)sy={s:"All "+a+" are "+b+". All "+b+" are "+c+".",c:"Only conclusion I follows",w:["Only conclusion II follows","Both conclusions I and II follow","Neither conclusion follows"],cns:"I. All "+a+" are "+c+". II. All "+c+" are "+a+".",e:"The inclusion A ⊆ B ⊆ C establishes conclusion I. The reverse conclusion does not follow."};
   else if(choose===2)sy={s:"Some "+a+" are "+b+". All "+b+" are "+c+".",c:"Both conclusions I and II follow",w:["Only conclusion I follows","Only conclusion II follows","Neither conclusion follows"],cns:"I. Some "+a+" are "+c+". II. Some "+c+" are "+b+".",e:"The members that are both A and B must be C. Thus some A are C, and some C are B."};
   else if(choose===3)sy={s:"No "+a+" is "+b+". Some "+c+" are "+a+".",c:"Only conclusion I follows",w:["Only conclusion II follows","Both conclusions I and II follow","Neither conclusion follows"],cns:"I. Some "+c+" are not "+b+". II. Some "+c+" are "+b+".",e:"The C members that are A cannot be B, so conclusion I follows. Conclusion II is not established."};
   else if(choose===4)sy={s:"Some "+a+" are "+b+". Some "+b+" are "+c+".",c:"Only conclusion II follows",w:["Only conclusion I follows","Both conclusions I and II follow","Neither conclusion follows"],cns:"I. Some "+a+" are "+c+". II. Some "+b+" are "+a+".",e:"Conclusion I does not follow from two separate “some” groups. Conclusion II follows by converting “Some A are B” to “Some B are A”."};
   else if(choose===5)sy={s:"All "+a+" are "+b+". No "+b+" is "+c+".",c:"Both conclusions I and II follow",w:["Only conclusion I follows","Only conclusion II follows","Neither conclusion follows"],cns:"I. No "+a+" is "+c+". II. No "+c+" is "+a+".",e:"A is inside B, and B has no overlap with C. Therefore A and C do not overlap; the no-overlap relation is reversible."};
   else if(choose===6)sy={s:"Some "+a+" are "+b+". No "+b+" is "+c+".",c:"Only conclusion I follows",w:["Only conclusion II follows","Both conclusions I and II follow","Neither conclusion follows"],cns:"I. Some "+a+" are not "+c+". II. Some "+a+" are "+c+".",e:"The A members that are B cannot be C, so some A are not C. A's other members may or may not be C."};
   else sy={s:"All "+a+" are "+b+". Some "+a+" are "+c+".",c:"Both conclusions I and II follow",w:["Only conclusion I follows","Only conclusion II follows","Neither conclusion follows"],cns:"I. Some "+b+" are "+c+". II. Some "+c+" are "+b+".",e:"The people who are both A and C must also be B. Therefore some B are C, and the relation converts to some C are B."};
   return mk("Statements: "+sy.s+"<br><br>Conclusions: "+sy.cns+"<br><br>Which conclusion(s) follow?",sy.c,sy.w,sy.e,diff==="Hard"?50:40);
  }
  if(/inequalities/i.test(topic)){
   var vars=[];while(vars.length<4){var candidate=pick(r,["A","B","C","D","P","Q","R","S","K","L","M","N","X","Y","Z"]);if(!vars.includes(candidate))vars.push(candidate);}
   var patterns=[
    {s:[">",">",">"],rel:"gt",why:"The chain is strictly descending from the first variable to the last."},
    {s:["<","<","<"],rel:"lt",why:"The chain is strictly ascending from the first variable to the last."},
    {s:[">=",">",">="],rel:"gt",why:"Every link is greater-than-or-equal, and at least one is strict; therefore the first variable is strictly greater than the last."},
    {s:["<=","<","<="],rel:"lt",why:"Every link is less-than-or-equal, and at least one is strict; therefore the first variable is strictly less than the last."},
    {s:[">","<",">"],rel:"unknown",why:"The directions change, so the given links do not establish a definite relation between the first and last variables."},
    {s:["<",">","<"],rel:"unknown",why:"The directions change, so the given links do not establish a definite relation between the first and last variables."},
    {s:[">","=","<"],rel:"unknown",why:"The first variable is greater than the middle value, which is greater than the last in reverse direction; the relationship between the endpoints is not fixed."},
    {s:["=","<","="],rel:"lt",why:"The equalities preserve the value at the endpoints of the two outer links, and the strict less-than link establishes the relation."}
   ],pat=pick(r,patterns),relation=pat.rel==="gt"?vars[0]+" > "+vars[3]:pat.rel==="lt"?vars[0]+" < "+vars[3]:"Relationship cannot be determined";
   var statement="Given "+vars[0]+" "+pat.s[0]+" "+vars[1]+", "+vars[1]+" "+pat.s[1]+" "+vars[2]+" and "+vars[2]+" "+pat.s[2]+" "+vars[3]+", which relation is definitely true between "+vars[0]+" and "+vars[3]+"?";
   return mk(statement,relation,[vars[0]+" < "+vars[3],vars[0]+" > "+vars[3],vars[0]+" = "+vars[3],"Relationship cannot be determined"].filter(function(z){return z!==relation;}).slice(0,3),pat.why,25);
  }
  if(/coding/i.test(topic)){
   var words=["BANK","LOAN","CASH","FUND","RATE","MINT","GOLD","RISK","DEBT","CRED","LOAN","BOND","SAVE","CARD","LEND","VAULT","AUDIT","TRUST","ASSET","CLAIM","TRADE","PROOF"],word=pick(r,words),mode=diff==="Hard"?ri(r,0,3):ri(r,0,2),shift=ri(r,1,3),code,ex,wrong=[];
   function move(ch,n){return String.fromCharCode(65+(ch.charCodeAt(0)-65+n+26)%26);}
   if(mode===0){
    code=word.split("").reverse().map(function(ch){return move(ch,shift);}).join("");
    ex="Reverse the word and move each letter "+shift+" place(s) forward. "+word+" → "+word.split("").reverse().join("")+" → "+code+".";
    wrong=[word.split("").map(function(ch){return move(ch,shift);}).join(""),word.split("").reverse().map(function(ch){return move(ch,shift+1);}).join(""),word];
    return mk("In a code, a word is first written in reverse order and then each letter is moved "+shift+" place(s) forward. How is “"+word+"” coded?",code,wrong,ex,35);
   }
   if(mode===1){
    code=word.split("").map(function(ch,i){return move(ch,i%2===0?shift:-shift);}).join("");
    ex="Move letters in odd positions forward by "+shift+" and letters in even positions backward by "+shift+". "+word+" → "+code+".";
    wrong=[word.split("").map(function(ch){return move(ch,shift);}).join(""),word.split("").map(function(ch,i){return move(ch,i%2===0?-shift:shift);}).join(""),word.split("").reverse().join("")];
    return mk("In a code, letters in odd positions are moved "+shift+" place(s) forward and letters in even positions "+shift+" place(s) backward. How is “"+word+"” coded?",code,wrong,ex,40);
   }
   if(mode===2){
    code=word.split("").map(function(ch){return ch.charCodeAt(0)-64;}).join("");
    ex="Write each letter's alphabet position in order: "+word.split("").map(function(ch){return ch+"="+(ch.charCodeAt(0)-64);}).join(", ")+". Code = "+code+".";
    wrong=[word.split("").reverse().map(function(ch){return ch.charCodeAt(0)-64;}).join(""),word.split("").map(function(ch){return ch.charCodeAt(0)-63;}).join(""),String(word.split("").reduce(function(a,ch){return a+ch.charCodeAt(0)-64;},0))];
    return mk("A word is coded by replacing each letter with its alphabet position (A=1, B=2, …, Z=26) and joining the numbers. What is the code for “"+word+"”?",code,wrong,ex,35);
   }
   var encoded=word.split("").map(function(ch,i){return move(ch,(i+1)*shift);}).join("");
   ex="Move the first letter forward "+shift+", the second "+(2*shift)+", the third "+(3*shift)+", and so on. "+word+" → "+encoded+".";
   wrong=[word.split("").map(function(ch){return move(ch,shift);}).join(""),word.split("").reverse().join(""),word.split("").map(function(ch,i){return move(ch,(i+1)*shift+1);}).join("")];
   return mk("A code shifts successive letters forward by "+shift+", "+(2*shift)+", "+(3*shift)+" and "+(4*shift)+" positions respectively. How is “"+word+"” coded?",encoded,wrong,ex,45);
  }
  if(/blood/i.test(topic)){
   var people=["A","B","C","D","E","F"],pickPeople=function(count){var arr=people.slice();for(var i=arr.length-1;i>0;i--){var j=ri(r,0,i),tmp=arr[i];arr[i]=arr[j];arr[j]=tmp;}return arr.slice(0,count);},kind=ri(r,0,7),p=pickPeople(4),item;
   if(kind===0)item={q:p[0]+" is the sister of "+p[1]+". "+p[1]+" is the son of "+p[2]+". How is "+p[0]+" related to "+p[2]+"?",a:"Daughter",w:["Sister","Mother","Aunt"],e:p[0]+" and "+p[1]+" are children of "+p[2]+". "+p[0]+" is the daughter."};
   else if(kind===1)item={q:p[0]+" is the father of "+p[1]+". "+p[1]+" is the sister of "+p[2]+". How is "+p[0]+" related to "+p[2]+"?",a:"Father",w:["Uncle","Brother","Grandfather"],e:p[1]+" and "+p[2]+" are siblings; "+p[0]+" is their father."};
   else if(kind===2)item={q:p[0]+" is the mother of "+p[1]+". "+p[1]+" is the father of "+p[2]+". How is "+p[0]+" related to "+p[2]+"?",a:"Grandmother",w:["Aunt","Sister","Mother"],e:p[0]+" is the mother of the child's father, so she is the grandmother."};
   else if(kind===3)item={q:p[0]+" is the brother of "+p[1]+". "+p[1]+" is the mother of "+p[2]+". How is "+p[0]+" related to "+p[2]+"?",a:"Maternal uncle",w:["Father","Brother","Grandfather"],e:p[0]+" is the brother of "+p[2]+"'s mother, so he is the maternal uncle."};
   else if(kind===4)item={q:p[0]+" is the daughter of "+p[1]+". "+p[1]+" is the son of "+p[2]+". How is "+p[0]+" related to "+p[2]+"?",a:"Granddaughter",w:["Niece","Sister","Aunt"],e:p[1]+" is "+p[2]+"'s son; therefore "+p[0]+" is "+p[2]+"'s granddaughter."};
   else if(kind===5)item={q:p[0]+" is the father of "+p[1]+". "+p[1]+" is the wife of "+p[2]+". How is "+p[0]+" related to "+p[2]+"?",a:"Father-in-law",w:["Brother-in-law","Uncle","Grandfather"],e:p[0]+" is the father of "+p[2]+"'s wife, so he is the father-in-law."};
   else if(kind===6)item={q:p[0]+" is the mother of "+p[1]+". "+p[1]+" is the sister of "+p[2]+". "+p[2]+" is the father of "+p[3]+". How is "+p[0]+" related to "+p[3]+"?",a:"Grandmother",w:["Aunt","Mother","Sister"],e:p[0]+" is the mother of "+p[2]+", who is "+p[3]+"'s father. Thus "+p[0]+" is the grandmother."};
   else item={q:p[0]+" is the son of "+p[1]+". "+p[1]+" is the sister of "+p[2]+". "+p[2]+" is the father of "+p[3]+". How is "+p[0]+" related to "+p[3]+"?",a:"Cousin",w:["Uncle","Brother","Nephew"],e:p[0]+" and "+p[3]+" are children of siblings, so they are cousins."};
   return mk(item.q,item.a,item.w,item.e,diff==="Hard"?45:30);
  }
  if(/direction|distance/i.test(topic)){
   if(diff==="Easy"){
    var north=ri(r,8,22),east=ri(r,6,18);
    return mk("A field officer walks "+north+" km north from a branch and then "+east+" km east. In which direction is the officer from the branch?", "North-East",["North-West","South-East","South-West"],"The final position is north and east of the starting point, so the direction is North-East.",25);
   }
   var eastA=ri(r,18,35),westA=ri(r,4,Math.max(5,eastA-4)),northA=ri(r,20,40),southA=ri(r,3,Math.max(4,northA-3)),dx=eastA-westA,dy=northA-southA,dist=Math.sqrt(dx*dx+dy*dy),dir=dx>0?(dy>0?"North-East":"South-East"):dx<0?(dy>0?"North-West":"South-West"):(dy>0?"North":"South");
   if(diff==="Hard"&&r()<.5){
    var d1=ri(r,12,30),d2=ri(r,5,17),d3=ri(r,4,34),d4=ri(r,3,14);if(d3===d1)d3=d3===34?d3-1:d3+1;var netNorth=d1-d3,netEast=d2+d4,answerDir=netNorth>0?"North-East":netNorth<0?"South-East":"East";
    return mk("An officer walks "+d1+" m north, turns right and walks "+d2+" m, turns right again and walks "+d3+" m, then turns left and walks "+d4+" m. In which direction is the officer from the starting point?",answerDir,["North-East","South-East","East","North"].filter(function(x){return x!==answerDir;}).concat(["South-West"]).slice(0,3),"Net northward displacement = "+d1+" − "+d3+" = "+netNorth+" m. Net eastward displacement = "+d2+" + "+d4+" = "+netEast+" m. The final position is "+answerDir+".",45);
   }
   return mk("An officer walks "+eastA+" km east, "+northA+" km north, "+westA+" km west and "+southA+" km south. What is the shortest distance from the starting point (nearest 0.1 km)?",Number(dist.toFixed(1)),[Number((dist+4).toFixed(1)),Number(Math.max(0.1,dist-3).toFixed(1)),Number((dx+dy).toFixed(1))],"Net eastward displacement = "+eastA+" − "+westA+" = "+dx+" km. Net northward displacement = "+northA+" − "+southA+" = "+dy+" km. Shortest distance = √("+dx+"² + "+dy+"²) = "+dist.toFixed(1)+" km.",45);
  }
  if(/ranking|order/i.test(topic)){
   if(diff==="Easy"){
    var tot=ri(r,35,75),top=ri(r,6,Math.floor(tot/2)),bot=tot-top+1;
    return mk("In a class of "+tot+" candidates, Meena ranks "+top+"th from the top. What is her rank from the bottom?",bot,[bot+1,bot-1,top],"Rank from bottom = total − rank from top + 1 = "+tot+" − "+top+" + 1 = "+bot+".",20);
   }
   if(diff==="Moderate"){
    var total=ri(r,55,90),leftRank=ri(r,10,24),rightRank=ri(r,12,25),between=total-leftRank-rightRank;
    return mk("In a row of "+total+" candidates, Arun is "+leftRank+"th from the left and Bala is "+rightRank+"th from the right. How many candidates are sitting between them if Arun is to the left of Bala?",between,[between+1,between-1,total-leftRank+rightRank],"Bala's position from the left = "+total+" − "+rightRank+" + 1 = "+(total-rightRank+1)+". People between them = "+(total-rightRank+1)+" − "+leftRank+" − 1 = "+between+".",35);
   }
   var totalH=ri(r,60,95),aRank=ri(r,12,24),bRight=ri(r,12,24),bLeft=totalH-bRight+1,mid=(aRank+bLeft)/2;
   if((aRank+bLeft)%2!==0){bLeft=aRank+2*ri(r,5,15);bRight=totalH-bLeft+1;}
   var midRank=(aRank+bLeft)/2;
   return mk("In a row of "+totalH+" candidates, P is "+aRank+"th from the left and Q is "+bRight+"th from the right. R sits exactly midway between P and Q. What is R's rank from the left?",midRank,[midRank-1,midRank+1,bLeft-aRank],"Q's rank from the left = "+totalH+" − "+bRight+" + 1 = "+bLeft+". R is midway between positions "+aRank+" and "+bLeft+": ("+aRank+" + "+bLeft+")/2 = "+midRank+".",40);
  }
  if(/alphanumeric|number series|logical sequence/i.test(topic)){
   var mode=ri(r,0,4),q,ans,w,ex;
   if(mode===0){
    var a=ri(r,3,14),mul=ri(r,2,3),add=ri(r,2,9),v=[a];for(var i=0;i<4;i++)v.push(v[i]*mul+add);ans=v[4]*mul+add;
    q="Find the next term in the series: "+v.join(", ")+", ?";w=[ans+mul*3,Math.max(1,ans-add),ans+add*4];ex="Each term is multiplied by "+mul+" and then "+add+" is added. "+v[4]+" × "+mul+" + "+add+" = "+ans+".";
   }else if(mode===1){
    var base=ri(r,3,10),offset=ri(r,2,15),sq=[];for(var j=0;j<5;j++)sq.push((base+j)*(base+j)+offset);ans=(base+5)*(base+5)+offset;
    q="Find the missing number: "+sq.join(", ")+", ?";w=[ans+2*(base+5),ans-2*(base+5),ans+offset];ex="The terms are consecutive squares plus "+offset+". The next term is "+(base+5)+"² + "+offset+" = "+ans+".";
   }else if(mode===2){
    var first=ri(r,2,12),step=ri(r,3,8),increase=ri(r,1,4),nums=[first];for(var k=0;k<4;k++)nums.push(nums[k]+step+k*increase);ans=nums[4]+step+4*increase;
    q="Find the missing term: "+nums.join(", ")+", ?";w=[ans+increase,Math.max(1,ans-step),ans+step];ex="The differences increase by "+increase+": "+[step,step+increase,step+2*increase,step+3*increase].join(", ")+". Next difference = "+(step+4*increase)+"; answer = "+ans+".";
   }else if(mode===3){
    var stride=ri(r,2,4),basePos=ri(r,0,25-4*stride),baseLetter=String.fromCharCode(65+basePos),startNo=ri(r,2,15),numStep=ri(r,2,6),terms=[];
    for(var nidx=0;nidx<4;nidx++)terms.push(String.fromCharCode(65+basePos+nidx*stride)+(startNo+nidx*numStep));
    ans=String.fromCharCode(65+basePos+4*stride)+(startNo+4*numStep);q="Find the next pair in the alphanumeric sequence: "+terms.join(", ")+", ?";
    w=[String.fromCharCode(65+basePos+4*stride)+(startNo+3*numStep),String.fromCharCode(65+basePos+3*stride)+(startNo+4*numStep),String.fromCharCode(65+basePos+4*stride+1)+(startNo+4*numStep)];
    ex="The letters advance "+stride+" places and the numbers advance "+numStep+" each term. The next pair is "+ans+".";
   }else{
    var stride2=ri(r,2,4),pos2=ri(r,0,24-3*stride2),pairs=[];
    for(var pidx=0;pidx<3;pidx++)pairs.push(String.fromCharCode(65+pos2+pidx*stride2)+String.fromCharCode(66+pos2+pidx*stride2));
    ans=String.fromCharCode(65+pos2+3*stride2)+String.fromCharCode(66+pos2+3*stride2);
    q="Each letter pair advances "+stride2+" positions in the alphabet. Find the next pair: "+pairs.join(", ")+", ?";
    w=[ans.split("").reverse().join(""),String.fromCharCode(65+pos2+2*stride2)+String.fromCharCode(66+pos2+3*stride2),String.fromCharCode(65+pos2+4*stride2)+String.fromCharCode(66+pos2+4*stride2)];
    ex="Both letters in every pair advance "+stride2+" alphabet positions. The next pair is "+ans+".";
   }
   return mk(q,ans,w,ex,35);
  }
  if(/data sufficiency/i.test(topic)){var yy=ri(r,4,25),xx=ri(r,2,18);return mk("What is x?<br><br>I. x + "+yy+" = "+(xx+yy)+".<br>II. x − "+yy+" = "+(xx-yy)+".<br><br>Choose the conclusion.", "Either statement alone is sufficient",["Both statements are required","Statement I alone is sufficient but II is not","Statement II alone is sufficient but I is not"],"Statement I alone gives x = "+xx+". Statement II alone also gives x = "+xx+".",35);}
  if(/seating|puzzles|floor|box|scheduling/i.test(topic)){return bankLabPuzzleQuestion(topic,r,mk,diff);}
  if(/logical reasoning/i.test(topic)){var subject=pick(r,["an applicant","a transaction","a branch","a loan file","a payment","an employee","a customer","an account"]),action=pick(r,["is flagged for review","has complete documents","passes verification","is overdue","has a valid signature","completes required training","has an expired credential","is approved by the manager"]),result=pick(r,["is reviewed by a specialist","moves to the next stage","cannot be approved automatically","is recorded in the audit log","receives a confirmation message","is escalated to the supervisor","is included in the report","is held for further checks"]);var logical=pick(r,[{q:"Rule: Every case that "+action+" "+result+". Case: "+subject+" "+action+". Which conclusion follows?",a:"The case "+result,w:["The case must be rejected permanently","The case was never submitted","No conclusion can be drawn"],e:"The stated rule applies to the described case, so the consequent follows."},{q:"Rule: If a record has an expired credential, it is not approved automatically. Record "+subject+" has an expired credential. What follows?",a:"The record is not approved automatically",w:["The record is approved immediately","The credential is valid","The record does not exist"],e:"The given condition directly implies that automatic approval is not allowed."},{q:"A bank reviews every payment that triggers a fraud alert. Payment "+subject+" triggered a fraud alert. Which conclusion follows?",a:"The payment is reviewed by the bank",w:["The payment is definitely fraudulent","The payment must be refunded","The payment was never attempted"],e:"The rule requires review after an alert; it does not prove the payment is fraudulent."},{q:"All reports that contain verified figures are sent to the audit team. This report contains verified figures. What follows?",a:"This report is sent to the audit team",w:["The report is deleted","The figures are unverified","No report exists"],e:"The report meets the condition in the rule, so it is sent to the audit team."}]);return mk(logical.q,logical.a,logical.w,logical.e,35);}
  return mk("If P > Q, Q = R and R > S, which relation is definitely true?","P > S",["P < S","P = S","Cannot be determined"],"P > Q = R > S, therefore P > S.",25);
 }
 return mk("A practice scenario uses "+ri(r,12,95)+" units in each of "+ri(r,3,20)+" equal groups. How should the total be found?","Multiply the units by the number of groups",["Add the groups only","Subtract the units from the groups","Divide the units by zero"],"For equal groups, multiply the quantity in one group by the number of groups.",25);
}

function genAdvancedQuant(section,topic,diff,seed,mk){
 var r=rng(seed^0x71a5c39),n=function(a,b){return ri(r,a,b);},p=function(a){return pick(r,a);},hard=diff==="Hard";
 var gcd=function(a,b){return b?gcd(b,a%b):Math.abs(a);};
 if(/data sufficiency/i.test(topic)){
  var xx=n(20,150),yy=n(4,50);
  return mk("What is the value of x?<br><br>I. x + "+yy+" = "+(xx+yy)+".<br>II. 2x = "+(2*xx)+".<br><br>Choose the correct data-sufficiency conclusion.","Each statement alone is sufficient",["Only statement I is sufficient","Only statement II is sufficient","Both statements together are required"],"Statement I gives x = "+xx+". Statement II gives 2x = "+(2*xx)+", so x = "+xx+". Either statement alone is sufficient.",40);
 }
 if(/data interpretation|tabular di|bar graph|line graph|pie chart|caselet|missing di|radar di/i.test(topic)){
  var names=["SBI","PNB","BOB","Canara"],rates=[60,65,70,75,80,85,90],ratios=["2:3","3:2","4:3","5:2","7:3","5:5"],rows=[];
  names.forEach(function(name){var apps=1400*n(5,12),rate=p(rates),ratio=p(ratios);rows.push({name:name,apps:apps,rate:rate,ratio:ratio,approved:apps*rate/100});});
  var table='<table><tr><th>Bank</th><th>Applications</th><th>% Approved</th><th>Home : Auto</th></tr>'+rows.map(function(z){return '<tr><td>'+z.name+'</td><td>'+z.apps+'</td><td>'+z.rate+'%</td><td>'+z.ratio+'</td></tr>';}).join("")+'</table>';
  var kind=n(0,5),i=n(0,3),j=(i+n(1,3))%4,A=rows[i],B=rows[j],ans,q,e,w,parts;
  function home(z){var v=z.ratio.split(":").map(Number);return z.approved*v[0]/(v[0]+v[1]);}
  if(kind===0){ans=A.apps-A.approved;q="How many applications were not approved by "+A.name+"?";e="Rejected = "+A.apps+" × "+(100-A.rate)+"% = "+ans+".";w=[ans+A.apps*.05,Math.max(0,ans-A.apps*.05),A.approved];}
  else if(kind===1){ans=Math.abs(A.approved-B.approved);q="What is the difference between approved applications at "+A.name+" and "+B.name+"?";e=A.name+" approvals = "+A.approved+"; "+B.name+" approvals = "+B.approved+". Difference = "+ans+".";w=[ans+140,Math.max(0,ans-140),Math.abs(A.apps-B.apps)];}
  else if(kind===2){ans=Math.round(rows.reduce(function(a,z){return a+z.approved;},0)/4);q="What is the average number of approved applications across the four banks (nearest whole number)?";e="Add the four approved totals and divide by 4. Average = "+ans+".";w=[ans+350,Math.max(0,ans-350),Math.round(ans*4/3)];}
  else if(kind===3){ans=home(A);parts=A.ratio.split(":").map(Number);q="If the Home : Auto ratio applies to approved applications, how many Home Loans were approved by "+A.name+"?";e="Approvals = "+A.apps+" × "+A.rate+"% = "+A.approved+". Home share = "+A.approved+" × "+parts[0]+"/"+(parts[0]+parts[1])+" = "+ans+".";w=[ans+A.approved*.1,Math.max(0,ans-A.approved*.1),A.approved-ans];}
  else if(kind===4){var hA=home(A),hB=home(B);ans=Math.round(hA/hB*100);q="Home-loan approvals at "+A.name+" are approximately what percentage of those at "+B.name+"?";e=hA+"/"+hB+" × 100 ≈ "+ans+"%.";w=[ans+10,Math.max(1,ans-10),Math.round(hB/hA*100)];}
  else{ans=Math.abs(A.rate-B.rate);q="What is the absolute difference, in percentage points, between approval rates at "+A.name+" and "+B.name+"?";e=Math.max(A.rate,B.rate)+"% − "+Math.min(A.rate,B.rate)+"% = "+ans+" percentage points.";w=[ans+5,Math.max(0,ans-5),ans+10];}
  return mk(table+q,ans,w,e,hard?60:50);
 }
 if(/simplification|approximation/i.test(topic)){
  if(/approximation/i.test(topic)){
   var baseSets=[{v:498.6,b:500,d:24.9,bd:25},{v:598.3,b:600,d:29.8,bd:30},{v:798.9,b:800,d:39.7,bd:40},{v:748.4,b:750,d:24.8,bd:25},{v:898.7,b:900,d:29.9,bd:30},{v:998.5,b:1000,d:24.9,bd:25},{v:1198.8,b:1200,d:29.8,bd:30}],bs=p(baseSets),ma=p([15,20,25,30,35]),mv=ma+p([-0.4,-0.3,-0.2,-0.1,0.1,0.2,0.3,0.4]),aa=p([30,40,50,60,70]),av=aa+p([-0.5,-0.4,-0.3,-0.2,0.2,0.3,0.4,0.5]),approxAnswer=bs.b/bs.bd*ma+aa;
   return mk("Approximate: ("+bs.v+" ÷ "+bs.d+") × "+mv+" + "+av+" = ?",approxAnswer,[approxAnswer+50,Math.max(1,approxAnswer-50),approxAnswer+100],"Round to convenient values: ("+bs.b+" ÷ "+bs.bd+") × "+ma+" + "+aa+" = "+approxAnswer+".",25);
  }
  var pct=p([15,20,25,30,35,40,45]),base=100*n(4,12),den=p([5,6,8,10]),num=n(2,den-1),fracBase=den*n(30,90),root=n(18,32),mult=p([2,3,4]),square=root*root,first=base*pct/100,second=fracBase*num/den,third=root*mult,ans=first+second-third;
  return mk("Simplify: ("+pct+"% of "+base+") + ("+num+"/"+den+" of "+fracBase+") − √"+square+" × "+mult+" = ?",ans,[ans+19,Math.max(1,ans-23),ans+31],"("+pct+"% of "+base+") = "+first+"; ("+num+"/"+den+" of "+fracBase+") = "+second+"; √"+square+" × "+mult+" = "+third+". Final value = "+ans+".",30);
 }

 if(/number series/i.test(topic)){
  var mode=hard?n(0,3):n(0,2),v=[],ans,ex;
  if(mode===0){var first=n(18,75),step=n(5,18),inc=n(2,6);v=[first];for(var si=0;si<5;si++)v.push(v[si]+step+si*inc);ans=v[5];ex="Differences are "+[step,step+inc,step+2*inc,step+3*inc].join(", ")+". The next difference is "+(step+4*inc)+", giving "+ans+".";}
  else if(mode===1){var f=n(3,12),m=n(2,3),add=n(1,8);v=[f];for(var sj=0;sj<5;sj++)v.push(v[sj]*m+add);ans=v[5];ex="Each term is multiplied by "+m+" and then "+add+" is added: "+v[4]+" × "+m+" + "+add+" = "+ans+".";}
  else if(mode===2){var base=n(4,12),off=n(2,17);v=[];for(var sk=0;sk<6;sk++)v.push((base+sk)*(base+sk)+off);ans=v[5];ex="The terms follow consecutive squares plus "+off+". Next = "+(base+5)+"² + "+off+" = "+ans+".";}
  else{var b=n(3,14),plus=n(4,12),minus=n(2,9);v=[b];for(var sl=1;sl<6;sl++){if(sl%2===1)v.push(v[sl-1]+plus);else v.push(v[sl-1]*2-minus);}ans=v[5];ex="Operations alternate +"+plus+" and ×2 − "+minus+". Apply the next operation to "+v[4]+" to get "+ans+".";}
  return mk("Find the missing term: "+v.slice(0,5).join(", ")+", ?",ans,[ans+Math.max(7,Math.round(ans*.08)),Math.max(1,ans-Math.max(5,Math.round(ans*.07))),ans+Math.max(13,Math.round(ans*.15))],ex,35);
 }
 if(/quadratic/i.test(topic)){
  var xl=n(3,24),xh=xl+n(2,12),yl,yh;
  if(hard&&r()<.5){yl=Math.max(1,xl-n(2,6));yh=xh+n(1,6);}
  else if(r()<.5){yl=xh+n(1,5);yh=yl+n(2,10);}
  else{yh=Math.max(2,xl-n(1,6));yl=Math.max(1,yh-n(1,4));if(yl>yh){var sw=yh;yh=yl;yl=sw;}}
  var rel=xh<yl?"x < y":yh<xl?"x > y":xl===yl&&xh===yh?"x = y":"Relationship cannot be established";
  return mk("Solve and compare:<br><br>I. x² − "+(xl+xh)+"x + "+(xl*xh)+" = 0<br>II. y² − "+(yl+yh)+"y + "+(yl*yh)+" = 0",rel,["x > y","x < y","x = y","Relationship cannot be established"].filter(function(z){return z!==rel;}),"Equation I has roots "+xl+" and "+xh+"; equation II has roots "+yl+" and "+yh+". "+(rel==="Relationship cannot be established"?"The possible roots overlap, so a single relationship cannot be fixed.":"Every possible x-root is "+(rel==="x < y"?"smaller than":"greater than")+" every possible y-root."),45);
 }
 if(/quantity comparison/i.test(topic)){
  var a=n(18,85),b=n(4,18),c=n(16,74),d=n(3,16),one=a*b+a,two=c*d-d,relq=one>two?"Quantity I is greater":one<two?"Quantity II is greater":"Both quantities are equal";
  return mk("Compare:<br><br>Quantity I = "+a+" × "+b+" + "+a+"<br>Quantity II = "+c+" × "+d+" − "+d,relq,["Quantity I is greater","Quantity II is greater","Both quantities are equal","Relationship cannot be established"].filter(function(z){return z!==relq;}),"Quantity I = "+one+"; Quantity II = "+two+". Therefore, "+relq.toLowerCase()+".",30);
 }
 if(/percentage & average|percentage|average/i.test(topic)){
  var m=ri(r,0,hard?3:2);
  if(m===0){var count=n(800,4500),rise=p([12,15,18,20,25,30]),cut=p([8,10,12,15,20]),fin=count*(100+rise)*(100-cut)/10000;return mk("A bank branch processes "+count+" applications. The number rises by "+rise+"% in one quarter and then falls by "+cut+"% in the next. What is the final number (nearest whole application)?",Math.round(fin),[Math.round(count*(1+(rise-cut)/100)),Math.round(fin+count*.05),Math.round(fin-count*.08)],"Final count = "+count+" × "+(100+rise)+"/100 × "+(100-cut)+"/100 = "+Math.round(fin)+". Apply percentage changes successively.",40);}
  if(m===1){var vals=[n(54,91),n(55,93),n(48,86),n(61,95),n(45,88)],weights=[n(20,55),n(25,60),n(18,45),n(25,65),n(15,40)],weighted=vals.reduce(function(a,v,i){return a+v*weights[i];},0)/weights.reduce(function(a,v){return a+v;},0);return mk("Five branches reported recovery rates of "+vals.map(function(v,i){return v+"% on "+weights[i]+" thousand accounts";}).join(", ")+". Find the weighted-average recovery rate (nearest whole percentage).",Math.round(weighted),[Math.round(vals.reduce(function(a,v){return a+v;},0)/5),Math.round(weighted+4),Math.max(1,Math.round(weighted-5))],"Weighted average = sum of (rate × account count) / total accounts = "+weighted.toFixed(2)+"%, approximately "+Math.round(weighted)+"%.",50);}
  if(m===2){var total=n(240,950),pass=p([36,40,44,48,52,56,60]),extra=p([4,6,8,10,12]),additional=Math.round(total*extra/100);return mk("In a recruitment test, "+pass+"% of "+total+" candidates passed. If the pass percentage had been "+extra+" percentage points higher, how many additional candidates would have passed (nearest whole candidate)?",additional,[Math.round(total*(extra+2)/100),additional+extra,Math.max(0,additional-2)],"An increase of "+extra+" percentage points = "+total+" × "+extra+"/100 ≈ "+additional+" additional candidates.",35);}
  var daily=[n(500,850),n(600,900),n(550,950),n(650,1000)],avg=daily.reduce(function(a,b){return a+b;},0)/4,fifth=Math.round(avg*1.25),ansAvg=Math.round((avg*4+fifth)/5);return mk("A bank branch handles "+daily.join(", ")+" transactions over four days. On the fifth day, it handles "+fifth+" transactions. What is the average daily volume over all five days?",ansAvg,[Math.round(avg),Math.round(avg*1.1),Math.round(avg*1.2)],"Four-day total = "+daily.reduce(function(a,b){return a+b;},0)+". Add fifth-day volume "+fifth+" and divide by 5 = "+ansAvg+".",45);
 }
 if(/ratio & proportion/i.test(topic)){
  var rm=n(0,2);
  if(rm===0){var ra=n(4,9),rb=n(3,8),unit=n(12,30),transfer=n(1,Math.min(3,rb-1))*unit,total=(ra+rb)*unit,newA=ra*unit+transfer,newB=rb*unit-transfer,g=gcd(newA,newB);return mk("Two account balances are in the ratio "+ra+":"+rb+" and together total ₹"+total+". ₹"+transfer+" is transferred from the second account to the first. What is the new ratio?",(newA/g)+":"+(newB/g),[ra+":"+rb,(newA+transfer)+":"+(newB-transfer),(newA/g+1)+":"+(newB/g)],"One ratio part = ₹"+unit+". Balances after transfer are ₹"+newA+" and ₹"+newB+". Reduce by common factor "+g+".",45);}
  if(rm===1){var a=n(5,9),b=n(3,7),third=n(2,6),total2=(a+b)*n(20,80)*100,share=total2*a/(a+b);return mk("A fund is divided among three teams in the ratio "+a+":"+b+":"+third+". The first two teams together receive ₹"+total2+". How much does the first team receive?",share,[share+total2*.1,total2*b/(a+b),Math.max(0,share-total2*.08)],"The first two teams account for "+(a+b)+" parts. One part = ₹"+total2/(a+b)+". First team's share = "+a+" parts = ₹"+share+".",40);}
  var ratioA=n(5,9),ratioB=n(3,7),incomeA=ratioA*n(4000,12000),incomeB=ratioB*n(4000,12000),increase=n(10,30),newInc=incomeA*(100+increase)/100,percentDiff=Math.round((newInc-incomeB)/incomeB*100);return mk("A's monthly income is ₹"+incomeA+" and B's is ₹"+incomeB+". A receives a "+increase+"% raise while B's income is unchanged. By what percentage is A's new income higher or lower than B's?",percentDiff,[Math.round((incomeA-incomeB)/incomeB*100),Math.round((newInc-incomeB)/newInc*100),increase+5],"A's new income = ₹"+newInc+". Percentage difference relative to B = ("+newInc+" − "+incomeB+")/"+incomeB+" × 100 = "+percentDiff+"%.",45);
 }
 if(/profit|loss|discount/i.test(topic)){
  if(hard&&r()<.45){
   var cp=n(900,8500),markup=p([18,20,25,30,35,40]),d1=p([10,12,15,20]),d2=p([5,8,10,12]),mp=cp*(100+markup)/100,sp=mp*(100-d1)*(100-d2)/10000,net=(sp/cp-1)*100;
   return mk("A shopkeeper marks an item "+markup+"% above cost price, then gives successive discounts of "+d1+"% and "+d2+"%. Find the final profit percentage (nearest 0.1%).",Number(net.toFixed(1)),[Number((markup-d1-d2).toFixed(1)),Number((net+4).toFixed(1)),Number((net-4).toFixed(1))],"Let CP = ₹"+cp+". Final SP = "+cp+" × "+(100+markup)+"/100 × "+(100-d1)+"/100 × "+(100-d2)+"/100 = ₹"+sp.toFixed(2)+". Net profit = "+net.toFixed(1)+"%.",50);
  }
  var cp2=n(800,hard?6500:4000),markup2=p([12,15,20,25,30,35,40]),discount2=p([10,12,15,20,25]),mp2=cp2*(100+markup2)/100,sp2=mp2*(100-discount2)/100,profit2=sp2-cp2,net2=profit2/cp2*100;
  return mk("An item costs ₹"+cp2+". The seller marks it "+markup2+"% above cost and offers a "+discount2+"% discount on the marked price. What is the final selling price?",Math.round(sp2),[Math.round(cp2*(1+(markup2-discount2)/100)),Math.round(sp2+cp2*.05),Math.round(sp2-cp2*.08)],"Marked price = ₹"+cp2+" × "+(100+markup2)+"/100 = ₹"+mp2+". Discounted selling price = ₹"+mp2+" × "+(100-discount2)+"/100 = ₹"+Math.round(sp2)+". Net profit margin = "+net2.toFixed(2)+"%.",45);
 }

 if(/interest/i.test(topic)){
  var principal=n(5000,hard?50000:25000),rate=p([8,10,12,15]),years=n(2,hard?5:3),ci=principal*(Math.pow(1+rate/100,years)-1),si=principal*rate*years/100;return mk("Find the difference between compound interest and simple interest on ₹"+principal+" at "+rate+"% p.a. for "+years+" years, compounded annually.",Number((ci-si).toFixed(2)),[Number(ci.toFixed(2)),Number(si.toFixed(2)),Number((ci-si+principal*.02).toFixed(2))],"Compound interest = ₹"+ci.toFixed(2)+". Simple interest = ₹"+si.toFixed(2)+". Difference = ₹"+(ci-si).toFixed(2)+".",50);
 }
 if(/time & work|pipes/i.test(topic)){
  var ad=n(12,hard?45:30),bd=n(15,hard?50:34),combined=1/ad+1/bd,days=n(2,Math.max(2,Math.floor(1/combined)-1)),completed=days*combined,remaining=Math.max(0,1-completed),extraDays=remaining*bd;return mk("A can complete a job in "+ad+" days and B in "+bd+" days. They work together for "+days+" days, after which A leaves. How many additional days will B need to finish the remaining work?",Number(extraDays.toFixed(2)),[Number((remaining*ad).toFixed(2)),Number((bd-days).toFixed(2)),Number((extraDays+days).toFixed(2))],"Combined daily work = 1/"+ad+" + 1/"+bd+" = "+combined.toFixed(4)+". In "+days+" days they finish "+completed.toFixed(4)+" of the job. Remaining fraction = "+remaining.toFixed(4)+". B alone needs "+extraDays.toFixed(2)+" more days.",50);
 }
 if(/speed|trains|boats/i.test(topic)){
  if(/boats/i.test(topic)||r()<.45){var still=n(10,22),stream=n(2,6),dist=n(80,220),down=still+stream,up=still-stream,td=dist/down,tu=dist/up,delta=tu-td;return mk("A boat covers "+dist+" km downstream and the same distance upstream. Its speed in still water is "+still+" km/h and the stream speed is "+stream+" km/h. How much longer does the upstream trip take?",Number(delta.toFixed(2)),[Number(td.toFixed(2)),Number((tu+td).toFixed(2)),Number((delta+2).toFixed(2))],"Downstream time = "+dist+"/"+down+" = "+td.toFixed(2)+" h. Upstream time = "+dist+"/"+up+" = "+tu.toFixed(2)+" h. Difference = "+delta.toFixed(2)+" h.",50);}
  var speed=n(54,90),platform=n(180,hard?450:300),train=n(120,hard?300:220),ms=speed*5/18,time=(train+platform)/ms;return mk("A train "+train+" m long passes a platform "+platform+" m long at "+speed+" km/h. How many seconds does it take to clear the platform?",Number(time.toFixed(2)),[Number((platform/ms).toFixed(2)),Number((train/ms).toFixed(2)),Number((time+10).toFixed(2))],"Distance = train + platform = "+(train+platform)+" m. Speed = "+speed+" × 5/18 = "+ms.toFixed(2)+" m/s. Time = "+time.toFixed(2)+" seconds.",45);
 }
 if(/mixtures|alligation/i.test(topic)){
  if(r()<.5){var low=n(10,35),high=n(60,90),target=n(low+5,high-5),left=high-target,right=target-low,g=gcd(left,right);return mk("In what ratio should solutions containing "+low+"% and "+high+"% of an ingredient be mixed to obtain a "+target+"% solution?",(left/g)+":"+(right/g),[(right/g)+":"+(left/g),low+":"+high,(left+1)+":"+(right+1)],"Alligation ratio = ("+high+" − "+target+") : ("+target+" − "+low+") = "+left+":"+right+" = "+(left/g)+":"+(right/g)+".",35);}
  var litres=140*n(1,10),draw=n(5,50),pct=p([60,70,75,80]),added=n(10,80),milk=litres*pct/100,remain=milk*(litres-draw)/litres,finalMilk=remain+added,finalVolume=litres-draw+added,finalPct=finalMilk/finalVolume*100;return mk("A "+litres+" L mixture contains "+pct+"% milk. "+draw+" L is removed and replaced with "+added+" L of pure milk. What is the final milk percentage?",Number(finalPct.toFixed(2)),[Number((pct+added/litres*100).toFixed(2)),Number((finalPct-5).toFixed(2)),Number((finalPct+4).toFixed(2))],"Milk remaining after removal = "+milk+" × ("+litres+" − "+draw+")/"+litres+" = "+remain+" L. Add "+added+" L milk: final milk = "+finalMilk+" L and final volume = "+finalVolume+" L. Percentage = "+finalPct.toFixed(2)+"%.",50);
 }
 if(/partnership|ages/i.test(topic)){
  if(/partnership/i.test(topic)){var ca=n(16,45)*1000,cb=n(18,50)*1000,cc=n(20,55)*1000,ma=n(4,12),mb=n(4,12),mc=n(4,12),wa=ca/1000*ma,wb=cb/1000*mb,wc=cc/1000*mc,totalW=wa+wb+wc,unitProfit=n(500,1800),totalProfit=totalW*unitProfit,share=wa*unitProfit;return mk("A invests ₹"+ca+" for "+ma+" months, B invests ₹"+cb+" for "+mb+" months and C invests ₹"+cc+" for "+mc+" months. If total profit is ₹"+totalProfit+", what is A's share?",share,[Math.round(totalProfit*ca/(ca+cb+cc)),Math.round(share+unitProfit*3),Math.max(0,Math.round(share-unitProfit*3))],"Profit is divided by capital × time. Weights are "+wa+", "+wb+" and "+wc+". A's share = ₹"+totalProfit+" × "+wa+"/"+totalW+" = ₹"+share+".",55);}
  if(r()<.5){var u=n(4,10),yearsAgo=2*u,ageA=5*u,ageB=3*u;return mk("The present age ratio of A to B is 5:3. "+yearsAgo+" years ago, their age ratio was 3:1. What is A's present age?",ageA,[ageA+u,ageA-u,ageB+yearsAgo],"Let present ages be 5x and 3x. ("+ageA+" − "+yearsAgo+") : ("+ageB+" − "+yearsAgo+") = 3:1, so x = "+u+" and A is "+ageA+" years old.",50);}
  var ageB=n(15,28),gap=ageB+n(3,12),wait=gap-ageB;return mk("B is "+ageB+" years old. A is "+gap+" years older than B. In how many years will A be twice B's age?",wait,[gap,ageB-wait,wait+ageB],"Let t be the number of years. A's age in t years = "+(ageB+gap)+" + t and B's age = "+ageB+" + t. Solve "+(ageB+gap)+" + t = 2("+ageB+" + t), giving t = "+wait+" years.",45);
 }
 if(/probability|permutation/i.test(topic)){
  var kind=n(0,3);
  if(kind===0){var red=n(4,12),blue=n(5,18),drawn=n(2,hard?4:3),prob=1;for(var i=0;i<drawn;i++)prob*=((red-i)/(red+blue-i));return mk("A bag contains "+red+" red and "+blue+" blue balls. "+drawn+" balls are drawn successively without replacement. What is the probability that all drawn balls are red?",Number(prob.toFixed(4)),[Number((red/(red+blue)).toFixed(4)),Number((prob+.05).toFixed(4)),Number(Math.max(0,prob-.04).toFixed(4))],"Probability = "+Array.from({length:drawn},function(_,i){return (red-i)+"/"+(red+blue-i);}).join(" × ")+" = "+prob.toFixed(4)+".",45);}
  if(kind===1){var men=n(5,20),women=n(4,16),k=n(2,hard?5:3),pw=1;for(var j=0;j<k;j++)pw*=(women-j)/(men+women-j);return mk("A committee of "+k+" people is selected from "+men+" men and "+women+" women. What is the probability that all selected members are women?",Number(pw.toFixed(4)),[Number((women/(men+women)).toFixed(4)),Number((pw+.06).toFixed(4)),Number(Math.max(0,pw-.05).toFixed(4))],"Probability = C("+women+","+k+") / C("+(men+women)+","+k+") = "+pw.toFixed(4)+".",50);}
  if(kind===2){var candidates=n(7,20),chosen=n(3,hard?6:5),ways=1;for(var z=1;z<=chosen;z++)ways=ways*(candidates-z+1)/z;return mk("A committee of "+chosen+" people is selected from "+candidates+" candidates. How many different committees are possible?",Math.round(ways),[Math.round(Math.pow(candidates,chosen)),Math.round(ways+candidates),Math.max(1,Math.round(ways-chosen))],"Order does not matter. C("+candidates+","+chosen+") = "+Math.round(ways)+" different committees.",35);}
  var rr=n(3,10),bb=n(5,16),pAtLeast=1-(bb/(rr+bb))*((bb-1)/(rr+bb-1));return mk("A bag contains "+rr+" red and "+bb+" blue balls. Two are drawn without replacement. Find the probability of getting at least one red ball.",Number(pAtLeast.toFixed(4)),[Number((rr/(rr+bb)).toFixed(4)),Number((1-pAtLeast).toFixed(4)),Number((pAtLeast+.08).toFixed(4))],"P(at least one red) = 1 − P(both blue) = 1 − ("+bb+"/"+(rr+bb)+") × ("+(bb-1)+"/"+(rr+bb-1)+") = "+pAtLeast.toFixed(4)+".",45);
 }
 if(/mensuration/i.test(topic)){
  var kindM=n(0,2);
  if(kindM===0){var radius=p([7,14,21]),height=n(12,45),vol=22/7*radius*radius*height;return mk("A cylindrical water tank has radius "+radius+" m and height "+height+" m. Find its capacity in cubic metres (use π = 22/7).",Number(vol.toFixed(2)),[Number((22/7*radius*height).toFixed(2)),Number((2*vol).toFixed(2)),Number((vol+22/7*radius*height).toFixed(2))],"Volume = πr²h = 22/7 × "+radius+"² × "+height+" = "+vol+" m³.",45);}
  if(kindM===1){var len=n(30,90),wid=n(18,60),path=n(2,8),outer=(len+2*path)*(wid+2*path),inner=len*wid,area=outer-inner;return mk("A rectangular garden is "+len+" m by "+wid+" m. A path "+path+" m wide runs uniformly outside the garden. Find the area of the path.",area,[outer,inner,2*path*(len+wid)],"Outer area = ("+len+" + 2×"+path+")("+wid+" + 2×"+path+") = "+outer+" m². Garden area = "+inner+" m². Path area = "+area+" m².",45);}
  var l=n(10,30),w=n(8,24),h=n(5,20),sa=2*(l*w+w*h+h*l);return mk("A closed rectangular storage box measures "+l+" cm × "+w+" cm × "+h+" cm. Find its total surface area.",sa,[l*w+w*h+h*l,2*l*w,2*(l*w+h*l)],"Total surface area = 2(lw + wh + hl) = 2("+l*w+" + "+w*h+" + "+h*l+") = "+sa+" cm².",40);
 }
 return mk("A bank branch processes "+n(1200,9500)+" digital transactions each day. If volumes increase by "+n(8,24)+"% for two successive months, calculate the final volume using compound growth.",n(12000,24000),[n(24001,30000),n(30001,36000),n(36001,42000)],"Apply the percentage increase successively: final volume = initial volume × (1 + rate/100)².",40);
}


var BANKLAB_ORDER_CACHE={};
function bankLabOrders(n){
 if(BANKLAB_ORDER_CACHE[n])return BANKLAB_ORDER_CACHE[n];
 var base=["Asha","Bala","Charan","Divya","Eshan","Farah","Gopal"].slice(0,n),out=[];
 function build(prefix,remaining){
  if(!remaining.length){out.push(prefix.slice());return;}
  for(var i=0;i<remaining.length;i++){var item=remaining[i];prefix.push(item);build(prefix,remaining.slice(0,i).concat(remaining.slice(i+1)));prefix.pop();}
 }
 build([],base);BANKLAB_ORDER_CACHE[n]=out;return out;
}
function bankLabPuzzleQuestion(topic,r,mk,diff){
 var base=["Asha","Bala","Charan","Divya","Eshan","Farah","Gopal"],days=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],size=diff==="Easy"?5:diff==="Moderate"?6:7,kind;
 if(/seating arrangements/i.test(topic))kind=0;
 else if(/puzzles \(/i.test(topic))kind=ri(r,0,2);
 else if(/floor|box/i.test(topic))kind=1;
 else if(/scheduling|month|date/i.test(topic))kind=2;
 else kind=ri(r,0,2);
 var names=base.slice(0,size),orders=bankLabOrders(size),target=orders[ri(r,0,orders.length-1)].slice(),clues=[],chosen=[],solutionCount=orders.length;
 function add(text,obj){obj.text=text;clues.push(obj);}
 for(var i=0;i<size;i++)for(var j=i+1;j<size;j++){
  var left=target[i],right=target[j],gap=j-i,text;
  if(kind===0)text=gap===1?left+" sits immediately to the left of "+right+".":(gap-1===1?"There is one person between "+left+" and "+right+", with "+left+" to the left of "+right+".":"There are "+(gap-1)+" people between "+left+" and "+right+", with "+left+" to the left of "+right+".");
  else if(kind===1)text=gap===1?left+" lives immediately below "+right+".":(gap-1===1?"There is one floor between "+left+" and "+right+", and "+left+" lives below "+right+".":"There are "+(gap-1)+" floors between "+left+" and "+right+", and "+left+" lives below "+right+".");
  else text=gap===1?left+"'s appointment is the day before "+right+"'s.":left+"'s appointment is scheduled "+gap+" days before "+right+"'s.";
  add(text,{type:"gap",left:left,right:right,gap:gap});
 }
 add(kind===0?target[0]+" sits at the left end.":kind===1?target[0]+" lives on the lowest floor.":target[0]+"'s appointment is first in the week.",{type:"first",person:target[0]});
 add(kind===0?target[size-1]+" sits at the right end.":kind===1?target[size-1]+" lives on the highest floor.":target[size-1]+"'s appointment is last in the week.",{type:"last",person:target[size-1]});
 for(var a=0;a<size;a++)for(var b=a+2;b<size;b++){
  var one=target[a],two=target[b],txt=kind===0?one+" and "+two+" do not sit next to each other.":kind===1?one+" and "+two+" do not live on adjacent floors.":one+"'s and "+two+"'s appointments are not on consecutive days.";
  add(txt,{type:"nonadjacent",one:one,two:two});
 }
 for(var c=clues.length-1;c>0;c--){var ci=ri(r,0,c),tmp=clues[c];clues[c]=clues[ci];clues[ci]=tmp;}
 function matches(clue,order){
  if(clue.type==="gap")return order.indexOf(clue.right)-order.indexOf(clue.left)===clue.gap;
  if(clue.type==="first")return order[0]===clue.person;
  if(clue.type==="last")return order[order.length-1]===clue.person;
  if(clue.type==="nonadjacent")return Math.abs(order.indexOf(clue.one)-order.indexOf(clue.two))>1;
  return false;
 }
 for(var k=0;k<clues.length;k++){
  chosen.push(clues[k]);
  var matchesFound=orders.filter(function(o){return chosen.every(function(cl){return matches(cl,o);});});
  solutionCount=matchesFound.length;
  if(solutionCount===1)break;
 }
 var subject,answer,distractors,question,explanation;
 if(kind===0){
  var asker=target[ri(r,0,size-3)];answer=target[target.indexOf(asker)+2];subject="Who sits second to the right of "+asker+"?";distractors=target.filter(function(x){return x!==answer;});
  explanation="The clues determine the unique left-to-right order: "+target.join(" — ")+". The second person to the right of "+asker+" is "+answer+".";
 }else if(kind===1){
  var resident=pick(r,target),floorNo=target.indexOf(resident)+1;answer="Floor "+floorNo;subject="Counting the lowest floor as Floor 1, on which floor does "+resident+" live?";distractors=[];while(distractors.length<3){var f=ri(r,1,size),v="Floor "+f;if(v!==answer&&!distractors.includes(v))distractors.push(v);}
  explanation="The unique order from lowest to highest floor is "+target.join(" → ")+". "+resident+" is "+floorNo+(floorNo===1?"st":floorNo===2?"nd":floorNo===3?"rd":"th")+" from the bottom, so the answer is "+answer+".";
 }else{
  var scheduled=pick(r,target);answer=days[target.indexOf(scheduled)];subject="On which day is "+scheduled+"'s appointment scheduled?";distractors=[];while(distractors.length<3){var day=pick(r,days.slice(0,size));if(day!==answer&&!distractors.includes(day))distractors.push(day);}
  explanation="The clues establish the weekly schedule from Monday onward: "+target.map(function(person,i){return days[i]+": "+person;}).join("; ")+". "+scheduled+"'s appointment falls on "+answer+".";
 }
 var allParticipants=kind===0?"People: "+names.join(", ")+".":kind===1?"Residents: "+names.join(", ")+".":"Appointments belong to: "+names.join(", ")+".";
 question=allParticipants+"<br><br>"+(kind===0?"They sit in a row facing north.":kind===1?"They live on different floors of a building.":"Each person is scheduled on a different day, Monday onward.")+"<br><br>"+chosen.map(function(x){return x.text;}).join("<br>")+"<br><br>"+subject;
 return mk(question,answer,distractors,explanation,hardPuzzleTime(diff));
}
function hardPuzzleTime(diff){return diff==="Hard"?75:diff==="Moderate"?60:45;}

function matchesBank(q,topic,section){var a=String(q.topic||"").toLowerCase(),b=topic.toLowerCase(),wanted=section==="reasonComp"?(q.section==="reasoning"||q.section==="computer"):section==="data"?(q.section==="quant"||q.section==="data"):q.section===section;var aliases={"syllogism":["syllogisms"],"simplification & approximation":["simplification","approximation"],"error spotting / error detection":["error detection"],"percentage & average":["averages"],"profit, loss & discount":["profit & loss"],"time & work / pipes & cisterns":["time & work","pipes & cisterns"],"time, speed & distance / trains / boats":["speed, time & distance","boats & streams"],"order & ranking":["ranking & order"],"seating arrangements":["seating arrangement","circular seating","linear seating"],"puzzles (floor / box / scheduling)":["floor puzzle","box puzzle"]};return wanted&&(a===b||a.includes(b)||b.includes(a)||(aliases[b]||[]).some(function(x){return a.includes(x);}));}
function makeUnique(sec,topic,diff,seed,used,runSet){var q,tries=0;while(tries<100){q=genQ(sec.id,topic,diff,(seed+tries*104729)>>>0);var f=fp(q);if(!used.has(f)&&!runSet.has(f)){runSet.add(f);used.add(f);q.section=sec.id;q.section_name=sec.name;q.marks=sec.marks/sec.count;q.negative_mark=q.marks*.25;return q;}tries++;}q=genQ(sec.id,topic,diff,(seed+tries*104729)>>>0);q.question+=" <small>Practice variant "+seed+"</small>";runSet.add(fp(q));used.add(fp(q));q.section=sec.id;q.section_name=sec.name;q.marks=sec.marks/sec.count;q.negative_mark=q.marks*.25;return q;}
function launchTest(){
 var exam=$("examSelect").value,stage=$("stageSelect").value,mode=modeValue(),prof=PROFILES[exam],all=prof[stage].map(function(s){return Object.assign({},s);}),secIndex=Number($("sectionSelect").value)||0,section=all[secIndex],topic=$("topicSelect").value,paperNo=Number($("paperSelectLobby").value)||1,used=fingerprintSeen(),runSet=new Set(),seq=(Number(localStorage.getItem(STORE.seq))||0)+1;
 try{localStorage.setItem(STORE.seq,String(seq));}catch(e){}
 var chosen=all;if(mode==="section")chosen=[section];if(mode==="topic")chosen=[Object.assign({},section,{count:Number($("questionCount").value)||20,minutes:$("timerMode").value==="untimed"?0:Math.max(5,Math.ceil((Number($("questionCount").value)||20)*.55)),marks:Number($("questionCount").value)||20})];
 var baseSeed=hash([exam,stage,mode,section.id,topic,paperNo,seq,Date.now()].join("|")),items=[];
 chosen.forEach(function(sec,si){var tps=mode==="topic"?[topic]:topicsFor(sec.id);var pool=mode==="topic"?baseBank.filter(function(q){return matchesBank(q,topic,sec.id)&&!used.has(fp(q));}):[];
  for(var i=0;i<sec.count;i++){var lev=mode==="topic"?$("difficultySelect").value:(mode==="section"&&$("difficultySelect").value!=="Mixed"?$("difficultySelect").value:pickLevel(i,sec.count,rng(baseSeed+si*997+i*7))),q=null;
   // Always generate a self-contained topic item. Legacy bank questions may depend on a 5-question passage and carry old paper numbers (e.g. Q55).
   var topicPick=mode==="topic"?topic:pick(rng(baseSeed+si*3001+i*19),tps);q=makeUnique(sec,topicPick,lev,baseSeed+si*13007+i*7919,used,runSet);
   if(/topic practice|section mock|full mock/.test(q.title||"")){}items.push(q);
  }
 });
 chosen.forEach(function(sec){var secItems=items.filter(function(q){return q.section===sec.id;});var average=sec.marks/sec.count;var base=average>=1?Math.floor(average):average;var extra=average>=1?sec.marks-base*sec.count:0;secItems.forEach(function(q,j){q.marks=average>=1?base+(j<extra?1:0):average;q.negative_mark=q.marks*.25;});});
 writeStore(STORE.seen,Array.from(used).slice(-15000));
 activeTest={exam:exam,stage:stage,mode:mode,profile:prof,sections:chosen,allProfileSections:all,paperNo:paperNo,topic:topic,seed:baseSeed,questions:items,title:mode==="full"?prof.name+" · "+(stage==="prelims"?"Prelims":"Mains")+" · Mock "+String(paperNo).padStart(2,"0"):mode==="section"?prof.name+" · "+section.name+" Sectional Mock":prof.name+" · "+topic+" Practice",untimed:mode==="topic"&&$("timerMode").value==="untimed",composite:!!prof.compositePrelims&&stage==="prelims"&&mode==="full",separatelyTimed:!(!!prof.compositePrelims&&stage==="prelims"&&mode==="full")};
 responses={};items.forEach(function(q){responses[q.id]={selected:null,marked:false,timeSpent:0,visited:false};});sectionIndex=0;questionIndex=0;questionSeconds=0;paused=false;answerChecked=false;renderTestSetup();showScreen("exam");enterSection(0);window.scrollTo(0,0);
}
function renderTestSetup(){$("examChip").textContent=(activeTest.profile.name+" · "+activeTest.stage).toUpperCase();$("examPaperTitle").textContent=activeTest.title;$("timerCaption").textContent=activeTest.untimed?"PRACTICE MODE":activeTest.composite?"TOTAL TIME LEFT":"SECTION TIME LEFT";$("sectionTabs").hidden=activeTest.sections.length<=1;$("sectionTabs").innerHTML=activeTest.sections.map(function(s,i){return '<button class="section-tab" data-i="'+i+'">'+eh(s.name)+' <small>'+s.count+'</small></button>';}).join("");$("sectionTabs").querySelectorAll("button").forEach(function(b){b.addEventListener("click",function(){var i=Number(b.dataset.i);if(!activeTest.separatelyTimed||i===sectionIndex)enterSection(i);});});$("pausedBanner").hidden=true;$("pauseButton").textContent="Ⅱ Pause";}
function showScreen(name){$("lobbyScreen").hidden=name!=="lobby";$("examScreen").hidden=name!=="exam";$("resultScreen").hidden=name!=="result";window.scrollTo(0,0);}
function secQs(){return activeTest.questions.filter(function(q){return q.section===activeTest.sections[sectionIndex].id;});}
function curQ(){return secQs()[questionIndex];}
function enterSection(i){if(tickHandle){clearInterval(tickHandle);tickHandle=null;}sectionIndex=i;questionIndex=0;questionSeconds=0;answerChecked=false;sectionRemaining=activeTest.sections[i].minutes*60;if(activeTest.untimed)sectionRemaining=0;if(activeTest.composite&&i===0)overallRemaining=activeTest.sections.reduce(function(s,x){return s+x.minutes*60;},0);var q=curQ();if(q)responses[q.id].visited=true;renderAll();if(!paused)startClock();}
function startClock(){if(tickHandle)clearInterval(tickHandle);tickHandle=setInterval(function(){if(paused)return;if(activeTest.composite){overallRemaining--;if(overallRemaining<=0){updateTimer();submitNow();return;}}else if(!activeTest.untimed){sectionRemaining--;if(sectionRemaining<=0){sectionRemaining=0;updateTimer();timeUp();return;}}var q=curQ();if(q&&responses[q.id])responses[q.id].timeSpent++;questionSeconds++;updateTimer();updateQTime();},1000);updateTimer();}
function updateTimer(){var v=activeTest.composite?overallRemaining:sectionRemaining;if(activeTest.untimed){$("timerDisplay").textContent="∞";return;}v=Math.max(0,v);$("timerDisplay").textContent=String(Math.floor(v/60)).padStart(2,"0")+":"+String(v%60).padStart(2,"0");$("timerDisplay").style.color=v<180?"var(--red)":"var(--cyan)";}
function updateQTime(){$("questionTime").textContent=String(Math.floor(questionSeconds/60)).padStart(2,"0")+":"+String(questionSeconds%60).padStart(2,"0");}
function timeUp(){if(tickHandle){clearInterval(tickHandle);tickHandle=null;}if(sectionIndex<activeTest.sections.length-1){enterSection(sectionIndex+1);}else submitNow();}
function renderAll(){renderTabs();renderQuestion();renderPalette();renderCounts();updateTimer();}
function renderTabs(){document.querySelectorAll(".section-tab").forEach(function(b,i){b.classList.toggle("active",i===sectionIndex);b.classList.toggle("locked",activeTest.separatelyTimed&&i!==sectionIndex);b.disabled=paused||(activeTest.separatelyTimed&&i!==sectionIndex);});$("currentSectionTitle").textContent=activeTest.sections[sectionIndex].name;$("progressBar").style.width=((questionIndex+1)/Math.max(1,secQs().length)*100)+"%";$("questionProgressLabel").textContent="Question "+(questionIndex+1)+" of "+secQs().length;}
function renderQuestion(){var q=curQ();if(!q)return;var r=responses[q.id];$("questionNumber").textContent="QUESTION "+String(questionIndex+1).padStart(2,"0");$("topicChip").textContent=q.topic;$("questionText").innerHTML=q.question;$("passageBox").hidden=true;$("optionsBox").innerHTML="";
 q.options.forEach(function(opt,i){var lab=document.createElement("label");lab.className="option-label"+(r.selected===i?" selected":"");var radio=document.createElement("input");radio.type="radio";radio.name="answer";radio.checked=r.selected===i;radio.disabled=paused;radio.addEventListener("change",function(){r.selected=i;r.visited=true;answerChecked=false;renderQuestion();renderPalette();renderCounts();});var letter=document.createElement("span");letter.className="option-letter";letter.textContent=String.fromCharCode(65+i);var tx=document.createElement("span");tx.className="option-text";tx.textContent=String(opt);lab.append(radio,letter,tx);$("optionsBox").appendChild(lab);});
 $("markButton").classList.toggle("active",r.marked);$("markButton").disabled=paused;$("submitButton").disabled=paused;$("markButton").textContent=r.marked?"⚑ Marked for review":"⚑ Mark for review";$("prevButton").disabled=paused||questionIndex===0;$("clearButton").disabled=paused||r.selected===null;$("nextButton").disabled=paused;$("nextButton").textContent=questionIndex===secQs().length-1?(sectionIndex===activeTest.sections.length-1?"Review / submit →":"Next section →"):"Save & next →";$("questionTime").textContent=String(Math.floor((r.timeSpent||0)/60)).padStart(2,"0")+":"+String((r.timeSpent||0)%60).padStart(2,"0");$("feedbackBox").hidden=true;
 // Correct answers and explanations are deliberately hidden during every active test. They appear only in the submitted results review.
 renderTabs();}
function renderPalette(){var qs=secQs();$("questionPalette").innerHTML="";qs.forEach(function(q,i){var r=responses[q.id],b=document.createElement("button");b.className="palette-item"+(r.selected!==null?" answered":"")+(r.marked?" review":"")+(i===questionIndex?" current":"");b.textContent=i+1;b.disabled=paused;b.addEventListener("click",function(){gotoQ(i);});$("questionPalette").appendChild(b);});}
function renderCounts(){var rs=secQs().map(function(q){return responses[q.id];});$("answeredCount").textContent=rs.filter(function(r){return r.selected!==null;}).length;$("reviewCount").textContent=rs.filter(function(r){return r.marked;}).length;$("unansweredCount").textContent=rs.filter(function(r){return r.selected===null;}).length;$("paletteProgress").textContent=rs.filter(function(r){return r.selected!==null;}).length+"/"+rs.length;}
function gotoQ(i){if(paused)return;questionIndex=Math.max(0,Math.min(i,secQs().length-1));questionSeconds=0;answerChecked=false;var q=curQ();if(q)responses[q.id].visited=true;renderAll();}
function nextQ(){if(paused)return;var q=curQ();if(q)responses[q.id].visited=true;answerChecked=false;if(questionIndex<secQs().length-1){gotoQ(questionIndex+1);return;}if(sectionIndex<activeTest.sections.length-1){if(activeTest.separatelyTimed){alert("This section has its own timer. It will advance when its time ends.");return;}enterSection(sectionIndex+1);return;}openSubmit();}
function prevQ(){if(paused)return;if(questionIndex>0)gotoQ(questionIndex-1);else if(!activeTest.separatelyTimed&&sectionIndex>0)enterSection(sectionIndex-1);}
function toggleMark(){if(paused)return;var q=curQ();responses[q.id].marked=!responses[q.id].marked;renderQuestion();renderPalette();}
function clearAnswer(){if(paused)return;responses[curQ().id].selected=null;answerChecked=false;renderAll();}
function pauseToggle(){if(!activeTest)return;paused=!paused;$("pausedBanner").hidden=!paused;$("pauseButton").textContent=paused?"▶ Resume":"Ⅱ Pause";if(paused){if(tickHandle)clearInterval(tickHandle);tickHandle=null;renderAll();}else{renderAll();startClock();}}
function openSubmit(){var qs=activeTest.questions,answered=qs.filter(function(q){return responses[q.id].selected!==null;}).length;$("confirmText").textContent="You have answered "+answered+" of "+qs.length+" questions. Submit to see marks, accuracy and question-level time analysis?";$("confirmModal").hidden=false;}
function submitNow(){if(tickHandle)clearInterval(tickHandle);tickHandle=null;paused=false;$("confirmModal").hidden=true;var qs=activeTest.questions,correct=0,wrong=0,skip=0,score=0,time=0,sections={},topics={};activeTest.sections.forEach(function(s){sections[s.id]={name:s.name,total:0,correct:0,wrong:0,skipped:0,score:0,marks:s.marks,time:0};});
 qs.forEach(function(q){var r=responses[q.id],attempt=r.selected!==null,ok=attempt&&r.selected===q.correct_index,t=r.timeSpent||0;time+=t;var s=sections[q.section]||(sections[q.section]={name:q.section_name,total:0,correct:0,wrong:0,skipped:0,score:0,marks:q.marks,time:0});s.total++;s.time+=t;var ts=topics[q.topic]||(topics[q.topic]={total:0,correct:0,wrong:0,skipped:0,time:0});ts.total++;ts.time+=t;
 if(!attempt){skip++;s.skipped++;ts.skipped++;}else if(ok){correct++;var val=q.marks===undefined?1:q.marks;score+=val;s.correct++;s.score+=val;ts.correct++;}else{wrong++;var pen=q.negative_mark===undefined?(q.marks===undefined?.25:q.marks*.25):q.negative_mark;score-=pen;s.wrong++;s.score-=pen;ts.wrong++;}});
 var attempted=correct+wrong,acc=attempted?correct/attempted*100:0,max=qs.reduce(function(a,q){return a+(q.marks===undefined?1:q.marks);},0);currentResult={title:activeTest.title,exam:activeTest.profile.name,stage:activeTest.stage,mode:activeTest.mode,paperNo:activeTest.paperNo,score:score,maxMarks:max,correct:correct,wrong:wrong,skip:skip,accuracy:acc,time:time,sectionStats:sections,topicStats:topics,questions:cloneData(qs),responses:cloneData(responses),savedAt:Date.now()};
 var hist=readStore(STORE.history,[]);hist.unshift({title:currentResult.title,exam:currentResult.exam,stage:currentResult.stage,mode:currentResult.mode,paperNo:currentResult.paperNo,score:score,maxMarks:max,correct:correct,wrong:wrong,skip:skip,accuracy:acc,time:time,savedAt:Date.now(),topicStats:topics});writeStore(STORE.history,hist.slice(0,80));showResults(currentResult);showScreen("result");initHistory();}
function cloneData(x){return JSON.parse(JSON.stringify(x));}
function showResults(res){$("resultSubtitle").textContent=res.title+" · "+new Date(res.savedAt).toLocaleString();$("scoreValue").textContent=Number(res.score).toFixed(1).replace(/\.0$/,"");$("scoreDenominator").textContent="/ "+Number(res.maxMarks).toFixed(0);$("resultTitle").textContent=res.accuracy>=85?"Strong accuracy — now improve speed":res.accuracy>=65?"Good base — tighten your weak areas":"Build accuracy with focused topic drills";$("resultDescription").textContent=res.correct+" correct · "+res.wrong+" incorrect · "+res.skip+" unanswered. Negative marking is included in the net score.";$("accuracyValue").textContent=res.accuracy.toFixed(1)+"%";$("correctValue").textContent=res.correct;$("wrongValue").textContent=res.wrong;$("skippedValue").textContent=res.skip;$("timeValue").textContent=Math.floor(res.time/60)+"m";
 $("sectionAnalysis").innerHTML=Object.values(res.sectionStats).map(function(s){var a=s.total?s.correct/s.total*100:0;return '<div><div class="analysis-row-head"><b>'+eh(s.name)+'</b><span>'+s.correct+'/'+s.total+' · '+a.toFixed(0)+'% · '+s.score.toFixed(1)+' marks</span></div><div class="analysis-bar"><span style="width:'+a+'%"></span></div><div class="analysis-insight">'+Math.floor(s.time/60)+'m '+s.time%60+'s spent · '+s.wrong+' incorrect · '+s.skipped+' skipped</div></div>';}).join("");
 var tps=Object.entries(res.topicStats).sort(function(a,b){return a[1].correct/Math.max(1,a[1].total)-b[1].correct/Math.max(1,b[1].total);});$("topicAnalysis").innerHTML=tps.slice(0,8).map(function(pair){var t=pair[0],s=pair[1],a=s.correct/Math.max(1,s.total)*100;return '<div><div class="analysis-row-head"><b>'+eh(t)+'</b><span>'+a.toFixed(0)+'% · '+s.correct+'/'+s.total+'</span></div><div class="analysis-bar"><span style="width:'+a+'%;background:'+(a<50?"linear-gradient(90deg,#ff7985,#ffb47a)":"")+'"></span></div><div class="analysis-insight">'+Math.round(s.time/Math.max(1,s.total))+' sec per question · '+s.wrong+' wrong / '+s.skipped+' skipped</div></div>';}).join("");
 var weak=tps.length?tps[0][0]:"Syllogism";$("nextStepsTitle").textContent="Next: practise "+weak+".";$("nextStepsText").textContent="Start at Easy, review each explanation, then attempt a Moderate timed topic set. If accuracy is already high but time is slow, practise solving shortcuts before the next full mock.";$("practiceWeakButton").dataset.topic=weak;renderReview("all");}
function renderReview(filter){if(!currentResult)return;var qs=currentResult.questions.filter(function(q){var r=currentResult.responses[q.id],ok=r.selected!==null&&r.selected===q.correct_index;if(filter==="wrong")return r.selected!==null&&!ok;if(filter==="skipped")return r.selected===null;if(filter==="correct")return ok;if(filter==="slow")return (r.timeSpent||0)>=60;return true;});$("questionReviewList").innerHTML=qs.slice(0,180).map(function(q){var r=currentResult.responses[q.id],ok=r.selected!==null&&r.selected===q.correct_index,status=r.selected===null?"skipped":ok?"correct":"wrong";return '<article class="review-item"><div class="review-item-top"><span class="review-status '+status+'">'+status+'</span><span class="topic-chip">'+eh(q.topic)+'</span><span class="muted" style="font-size:10px">'+Math.round(r.timeSpent||0)+' sec</span></div><div class="review-question">'+q.question+'</div><div class="review-meta">Your answer: '+(r.selected===null?"Not answered":eh(q.options[r.selected]))+' · Correct: '+eh(q.options[q.correct_index])+'</div><div class="review-explanation">'+eh(q.explanation||"Review this question type and retry a fresh variant.")+'</div></article>';}).join("")||'<p class="muted">No questions match this filter.</p>';}
function initHistory(){var hist=readStore(STORE.history,[]);$("attemptStat").textContent=hist.length;var c=hist.reduce(function(a,h){return a+(h.correct||0);},0),att=hist.reduce(function(a,h){return a+(h.correct||0)+(h.wrong||0);},0);$("accuracyStat").textContent=att?Math.round(c/att*100)+"%":"—";var topicAgg={};hist.slice(0,20).forEach(function(h){Object.keys(h.topicStats||{}).forEach(function(t){var z=h.topicStats[t],a=topicAgg[t]||(topicAgg[t]={total:0,correct:0});a.total+=z.total||0;a.correct+=z.correct||0;});});$("streakStat").textContent=Object.keys(topicAgg).filter(function(t){return topicAgg[t].total>0&&topicAgg[t].correct/topicAgg[t].total<.7;}).length;renderHistory();}
function renderHistory(){var hist=readStore(STORE.history,[]);$("recentSection").hidden=!hist.length;if(!hist.length)return;$("recentList").innerHTML=hist.slice(0,6).map(function(h){return '<article class="recent-card"><b>'+eh(h.title)+'</b><span>'+new Date(h.savedAt).toLocaleDateString()+' · '+Number(h.score).toFixed(1)+'/'+Number(h.maxMarks).toFixed(0)+' · '+Number(h.accuracy).toFixed(0)+'% accuracy</span></article>';}).join("");}
function startTopicDirect(topic,section){
 showScreen("lobby");
 var mode=document.querySelector('input[name="practiceMode"][value="topic"]');mode.checked=true;
 var target=section||groupTopic(topic),exam="sbi-clerk",stage="prelims";
 if(target==="awareness"||target==="computer"||target==="reasonComp")stage="mains";
 if(target==="data"){exam="sbi-po";stage="mains";}
 $("examSelect").value=exam;$("stageSelect").value=stage;updateMode();
 var targetSection=target==="computer"?"reasonComp":target;
 var list=selectedProfile[stage],idx=list.findIndex(function(x){return x.id===targetSection;});
 if(idx<0)idx=0;
 $("sectionSelect").value=String(idx);updateTopics();
 var options=[].slice.call($("topicSelect").options);
 var exact=options.find(function(o){return o.value.toLowerCase()===String(topic).toLowerCase();});
 if(!exact){var first=String(topic).toLowerCase().split(" ")[0];exact=options.find(function(o){return o.value.toLowerCase().indexOf(first)>=0;});}
 if(exact)$("topicSelect").value=exact.value;
 $("difficultySelect").value="Easy";$("questionCount").value="20";$("timerMode").value="timed";updatePattern();
 window.scrollTo({top:0,behavior:"smooth"});
}
function init(){
 renderPaperOptions();
 fetch("questions_bank.json").then(function(r){if(!r.ok)throw new Error("question bank not available");return r.json();}).then(function(d){baseBank=Object.keys(d||{}).reduce(function(a,k){return a.concat(d[k].questions||[]);},[]);}).catch(function(){baseBank=[];});
 selectedProfile=PROFILES[$("examSelect").value];updateMode();initHistory();showScreen("lobby");
 $("examSelect").addEventListener("change",updateMode);$("stageSelect").addEventListener("change",updateMode);$("questionCount").addEventListener("change",updatePattern);$("difficultySelect").addEventListener("change",updatePattern);$("timerMode").addEventListener("change",updatePattern);$("sectionSelect").addEventListener("change",function(){updateTopics();updatePattern();});document.querySelectorAll('input[name="practiceMode"]').forEach(function(el){el.addEventListener("change",updateMode);});
 $("startButton").addEventListener("click",launchTest);$("startWeakTopic").addEventListener("click",function(){var hist=readStore(STORE.history,[]),weak=null;if(hist.length){var tps=[];hist.slice(0,5).forEach(function(h){Object.keys(h.topicStats||{}).forEach(function(t){var z=h.topicStats[t];tps.push({topic:t,acc:(z.correct||0)/Math.max(1,z.total||0)});});});tps.sort(function(a,b){return a.acc-b.acc;});weak=tps[0]&&tps[0].topic;}startTopicDirect(weak||"Syllogism");});
 $("historyButton").addEventListener("click",function(){if($("recentSection").hidden){alert("Complete a test to build your progress history.");return;}$("recentSection").scrollIntoView({behavior:"smooth"});});
 $("brandHome").addEventListener("click",function(e){e.preventDefault();if(!$("examScreen").hidden&&!confirm("Leave this attempt? It will not be saved as a completed test."))return;if(tickHandle)clearInterval(tickHandle);showScreen("lobby");initHistory();});
 $("backToLobby").addEventListener("click",function(){if(confirm("Exit this attempt? The score won't be added to completed history.")){if(tickHandle)clearInterval(tickHandle);showScreen("lobby");initHistory();}});
 $("pauseButton").addEventListener("click",pauseToggle);$("resumeButton").addEventListener("click",pauseToggle);$("prevButton").addEventListener("click",prevQ);$("nextButton").addEventListener("click",nextQ);$("markButton").addEventListener("click",toggleMark);$("clearButton").addEventListener("click",clearAnswer);$("submitButton").addEventListener("click",openSubmit);$("cancelConfirm").addEventListener("click",function(){$("confirmModal").hidden=true;});$("confirmSubmit").addEventListener("click",submitNow);
 $("reviewFilter").addEventListener("change",function(e){renderReview(e.target.value);});$("resultHomeButton").addEventListener("click",function(){showScreen("lobby");initHistory();});$("resultHomeButtonBottom").addEventListener("click",function(){showScreen("lobby");initHistory();});$("practiceWeakButton").addEventListener("click",function(){startTopicDirect($("practiceWeakButton").dataset.topic);});$("newVariantButton").addEventListener("click",function(){showScreen("lobby");document.querySelector('input[name="practiceMode"][value="full"]').checked=true;$("examSelect").value=activeTest.exam;$("stageSelect").value=activeTest.stage;updateMode();$("paperSelectLobby").value=String(activeTest.paperNo);});
 $("clearHistoryButton").addEventListener("click",function(){if(confirm("Clear saved test history on this device?")){writeStore(STORE.history,[]);initHistory();}});
 document.querySelectorAll("[data-fast-topic]").forEach(function(b){b.addEventListener("click",function(){var x=b.dataset.fastTopic.split("|");startTopicDirect(x[1],x[0]);});});
 window.addEventListener("beforeunload",function(){if(tickHandle)clearInterval(tickHandle);});
}
document.addEventListener("DOMContentLoaded",init);
