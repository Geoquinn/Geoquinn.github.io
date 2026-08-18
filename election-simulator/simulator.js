const offices = [{key:'house',label:'U.S. House',short:'House',sub:'435 districts'},{key:'senate',label:'U.S. Senate',short:'Senate',sub:'State contests'},{key:'governors',label:'Governors',short:'Governors',sub:'State executives'}];
const models = {
  special:{number:'01',title:'Special & off-year elections',short:'Live model',description:'Model 1 now uses 94 qualifying 2025–26 results. This control adds an optional analyst adjustment to its data-derived national shift.',label:'Analyst shift adjustment',min:-5,max:5,step:.1,defaultValue:0},
  primary:{number:'02',title:'Primary election turnout',short:'Turnout intensity',description:'Use relative party participation to test enthusiasm and mobilization before November.',label:'Democratic turnout advantage',min:-5,max:5,step:.1,defaultValue:1.1},
  approval:{number:'03',title:'Presidential approval',short:'National climate',description:"Stress-test the historical relationship between approval and the president's party in a midterm.",label:'Presidential job approval',min:25,max:65,step:1,defaultValue:41},
  anes:{number:'04',title:'ANES panel studies',short:'Opinion movement',description:'Represent longitudinal coalition movement, issue salience, and partisan switching in the electorate.',label:'Net Democratic panel movement',min:-5,max:5,step:.1,defaultValue:1.3}
};
const modelOrder=['special','primary','approval','anes'];
const stateTiles=[["AK",1,1,-13],["ME",1,12,3],["WA",2,2,16],["ID",2,3,-28],["MT",2,4,-18],["ND",2,5,-34],["MN",2,6,7],["WI",2,7,1],["MI",2,8,2],["NY",2,10,13],["VT",2,11,25],["NH",2,12,4],["OR",3,2,12],["NV",3,3,0],["WY",3,4,-38],["SD",3,5,-29],["IA",3,6,-13],["IL",3,7,14],["IN",3,8,-19],["OH",3,9,-11],["PA",3,10,0],["NJ",3,11,7],["CT",3,12,13],["CA",4,2,20],["UT",4,3,-20],["CO",4,4,11],["NE",4,5,-20],["MO",4,6,-19],["KY",4,7,-25],["WV",4,8,-42],["VA",4,9,6],["MD",4,10,27],["DE",4,11,15],["RI",4,12,18],["AZ",5,3,0],["NM",5,4,10],["KS",5,5,-15],["AR",5,6,-30],["TN",5,7,-27],["NC",5,8,-1],["SC",5,9,-18],["MA",5,12,25],["HI",6,1,25],["TX",6,4,-14],["OK",6,5,-34],["LA",6,6,-22],["MS",6,7,-22],["AL",6,8,-27],["GA",6,9,-1],["FL",7,9,-13]];
const senateBallot=new Set(["AL","AK","AR","CO","DE","GA","ID","IL","IA","KS","KY","LA","ME","MA","MI","MN","MS","MT","NE","NH","NJ","NM","NC","OH","OK","OR","RI","SC","SD","TN","TX","VA","WV","WY"]);
const governorBallot=new Set(["AL","AK","AR","AZ","CA","CO","CT","FL","GA","HI","ID","IL","IA","KS","ME","MD","MA","MI","MN","NE","NV","NH","NM","NY","OH","OK","OR","PA","RI","SC","SD","TN","TX","VT","WI","WY"]);
const raceData={
  house:[['PA–07','Pennsylvania',49.6,.72],['NY–17','New York',49.1,.62],['AZ–06','Arizona',49.4,.78],['MI–07','Michigan',50,.69],['CA–13','California',49.3,.74],['NE–02','Nebraska',50.2,.58]],
  senate:[['Georgia','U.S. Senate',49.8,.68],['Michigan','U.S. Senate',50.1,.61],['North Carolina','U.S. Senate',49.4,.75],['Maine','U.S. Senate',49,.55],['Ohio','U.S. Senate',48.5,.7],['Texas','U.S. Senate',47.8,.66]],
  governors:[['Arizona','Governor',50.1,.7],['Michigan','Governor',49.9,.62],['Georgia','Governor',49.5,.72],['Nevada','Governor',50,.67],['Wisconsin','Governor',49.8,.74],['Kansas','Governor',48.8,.54]]
};
let office=document.body.dataset.office||'house';
let activeModel='special';
let values={special:0,primary:1.1,approval:41,anes:1.3};
let houseCollection=null;
let houseModelData=null;
let houseNomineeData=null;
let houseNomineesById=new Map();
let houseLoadInFlight=false;
let houseMode='blank';
let houseSeed=20261103;
let houseSimulations=1000;
let houseHalfLife=365;
let houseCalibration='historical';
let houseIncludeStatewide=true;
let selectedDistrict='';
let houseRevealTimer=null;
let houseRevealToken=0;
let houseBatchSize=100;
let houseBatchRunning=false;
let houseBatchProgress=0;
let houseBatchTarget=0;
let houseBatchResults=[];
let houseBatchHistory=[];
const nested=document.body.dataset.nested==='true';
const home=nested?'../':'./';
const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[character]));
const marginLabel=margin=>`${margin>=0?'D':'R'}+${Math.abs(margin).toFixed(1)}`;
const shift=()=>values.special*.34+values.primary*.24+(45-values.approval)*.14*.24+values.anes*.18;
const summary=()=>{const s=shift();if(office==='house'){const dem=clamp(Math.round(218+s*3.4),190,245);return{label:'Projected chamber',dem,gop:435-dem,total:435,threshold:'218 for control',title:'House delegation map',subtitle:'State tiles summarize the projected district delegation; the 435-seat matrix shows chamber control.'};}if(office==='senate'){const dem=clamp(Math.round(47+s*.8),45,53);return{label:'Projected chamber',dem,gop:100-dem,total:100,threshold:'51 for control',title:'2026 Senate map',subtitle:'States without a scheduled contest are muted. Active states respond to the four-model composite.'};}const dem=clamp(Math.round(17+s*.85),12,24);return{label:'Projected 2026 wins',dem,gop:36-dem,total:36,threshold:'36 scheduled races',title:'2026 governor map',subtitle:'Scheduled governor contests are colored by the prototype projected margin; other states are muted.'};};
const activeState=abbr=>office==='house'||(office==='senate'?senateBallot.has(abbr):governorBallot.has(abbr));

document.querySelector('#app').innerHTML=`
<a class="skip-link" href="#simulator">Skip to simulator</a><header class="site-header"><a class="brand" href="${home}" aria-label="RIPPL Election Simulator home"><span class="rippl-mark" aria-hidden="true"><i></i><i></i><i></i></span><span><strong>RIPPL</strong> Election Simulator</span></a><nav aria-label="Primary navigation"><a href="#simulator">Simulator</a><a href="#models">Four models</a><a href="#race-board">Race board</a><a href="#methodology">Methodology</a><a href="https://george-quinn.com/">George Quinn</a></nav></header>
<section class="masthead"><div class="masthead-grid" aria-hidden="true"></div><div class="masthead-copy"><p class="eyebrow"><span>2026 midterms</span> Research-informed political prediction lab</p><h1>Build the<br><em>national outcome.</em></h1><p>Test how four distinct electoral signals could reshape every House district, Senate contest, and governor race—then compare the map and the races that decide control.</p><a class="primary-action" href="#simulator">Start a simulation <span>↓</span></a></div><aside class="masthead-card"><div><span>Simulation structure</span><b>Prototype</b></div><strong>3 × 4</strong><p>Three nationwide race maps powered by four independently adjustable model lenses.</p><ul><li><span>01</span>Choose an office</li><li><span>02</span>Adjust the model signals</li><li><span>03</span>Read the map and race board</li></ul></aside></section>
<section class="office-switch" aria-label="Choose an office to simulate">${offices.map(item=>`<button type="button" data-office="${item.key}"><span>${item.short}</span><small>${item.sub}</small></button>`).join('')}</section>
<section class="simulator-section" id="simulator"><div class="section-intro"><div><p class="section-index">01 / Scenario lab</p><h2>Choose the signal.<br>Move the outcome.</h2></div><p>House Model 1 now uses observed special-election data, current district baselines, Census demographics, and repeated simulation. The remaining three model controls are still prototype inputs.</p></div><div class="prototype-notice"><strong>Research simulation</strong><span>Model 1 is data-backed but developmental—not a published election forecast. Models 2–4 remain interface prototypes.</span></div><div class="simulator-grid"><aside class="model-rail" id="models"><div class="rail-head"><span>Four-model composite</span><button type="button" id="reset">Reset</button></div><div class="model-tabs">${modelOrder.map(key=>`<button type="button" data-model="${key}"><span class="model-number">${models[key].number}</span><span><strong>${models[key].title}</strong><small>${models[key].short}</small></span><b data-model-value="${key}"></b></button>`).join('')}</div><div class="active-control"><div class="active-control-title"><span id="edit-number"></span><strong id="edit-title"></strong></div><p id="edit-description"></p><label for="model-value"><span id="edit-label"></span><output id="edit-output"></output></label><input id="model-value" type="range"><div class="range-ends"><span id="range-min"></span><span id="range-max"></span></div></div><div class="composite-readout"><span>Prototype national environment</span><strong id="composite"></strong><small>Temporary composite · all four models included</small></div></aside><div class="output-stage" aria-live="polite"><div class="output-head"><div><p class="section-index">Nationwide output</p><h3 id="map-title"></h3><p id="map-subtitle"></p></div><div class="office-chip" id="office-chip"></div></div><div class="balance-panel"><div class="balance-copy"><span id="balance-label"></span><strong><span id="dem-total"></span><i>D</i></strong><b>to</b><strong><span id="gop-total"></span><i>R</i></strong><small id="threshold"></small></div><div class="balance-track"><span class="dem" id="dem-track"></span><span class="gop" id="gop-track"></span></div></div><div class="map-frame"><div class="state-map" id="state-map" role="img"></div><div class="map-legend" id="map-legend"></div></div><div class="district-matrix" id="district-matrix"></div></div></div></section>
<section class="race-section" id="race-board"><div class="section-intro compact"><div><p class="section-index">02 / Race board</p><h2>Where control<br>gets decided.</h2></div><p>The table updates with the four-model composite. Candidate names, polling, fundraising, and validated local effects can be connected during the model-building stage.</p></div><div class="race-table" id="race-table" role="table"></div></section>
<section class="methodology" id="methodology"><div><p class="section-index">03 / Build path</p><h2>From interface<br>to validated model.</h2><p>RIPPL will keep observed data, model assumptions, office-specific adjustments, and simulation uncertainty separate and visible.</p></div><ol><li><span>01</span><div><strong>Connect each data stream</strong><p>Define recency, geography, comparison baselines, missing-data rules, and update cadence.</p></div></li><li><span>02</span><div><strong>Estimate independent signals</strong><p>Prevent one noisy indicator from silently determining the entire national environment.</p></div></li><li><span>03</span><div><strong>Calibrate by office</strong><p>Translate the national signal differently for House districts, Senate contests, and governor races.</p></div></li><li><span>04</span><div><strong>Validate and simulate</strong><p>Back-test weights, propagate uncertainty, and publish race-level outputs with auditable assumptions.</p></div></li></ol></section>
<footer><div><a class="footer-brand" href="#top">RIPPL Election Simulator</a><p>Research-informed, transparent election scenarios by George D. Quinn.</p></div><div class="footer-links"><a href="#simulator">Simulator</a><a href="#models">Models</a><a href="#methodology">Methodology</a><a href="https://george-quinn.com/">Academic site</a></div><div class="footer-meta"><span>george-quinn.com</span><span>Prototype for the 2026 cycle</span></div></footer>`;

const updateModelControls=()=>{
  document.querySelectorAll('[data-office]').forEach(button=>button.classList.toggle('active',button.dataset.office===office));
  document.querySelectorAll('[data-model]').forEach(button=>button.classList.toggle('active',button.dataset.model===activeModel));
  modelOrder.forEach(key=>document.querySelector(`[data-model-value="${key}"]`).textContent=key==='approval'?`${values[key].toFixed(0)}%`:marginLabel(values[key]));
  const definition=models[activeModel],slider=document.querySelector('#model-value');
  document.querySelector('#edit-number').textContent=`Editing model ${definition.number}`;
  document.querySelector('#edit-title').textContent=definition.title;
  document.querySelector('#edit-description').textContent=definition.description;
  document.querySelector('#edit-label').textContent=definition.label;
  document.querySelector('#edit-output').textContent=activeModel==='approval'?`${values[activeModel].toFixed(0)}%`:marginLabel(values[activeModel]);
  slider.min=definition.min;slider.max=definition.max;slider.step=definition.step;slider.value=values[activeModel];slider.style.setProperty('--range-progress',`${(values[activeModel]-definition.min)/(definition.max-definition.min)*100}%`);
  document.querySelector('#range-min').textContent=activeModel==='approval'?`${definition.min}%`:`R+${Math.abs(definition.min)}`;
  document.querySelector('#range-max').textContent=activeModel==='approval'?`${definition.max}%`:`D+${definition.max}`;
  document.querySelector('#composite').textContent=marginLabel(shift());
};

const standardOutput=()=>`<div class="output-head"><div><p class="section-index">Nationwide output</p><h3 id="map-title"></h3><p id="map-subtitle"></p></div><div class="office-chip" id="office-chip"></div></div><div class="balance-panel"><div class="balance-copy"><span id="balance-label"></span><strong><span id="dem-total"></span><i>D</i></strong><b>to</b><strong><span id="gop-total"></span><i>R</i></strong><small id="threshold"></small></div><div class="balance-track"><span class="dem" id="dem-track"></span><span class="gop" id="gop-track"></span></div></div><div class="map-frame"><div class="state-map" id="state-map" role="img"></div><div class="map-legend" id="map-legend"></div></div>`;

const calibrationOptions={cautious:{value:.55,uncertainty:.2,note:'Stronger external-validity shrinkage'},historical:{value:.757,uncertainty:.25,note:'Fit to the 2018 and 2022 midterm cycles'},direct:{value:1,uncertainty:.2,note:'Applies more of the observed special-election shift'}};
const probabilityLabel=value=>`${Math.round(value*100)}%`;
const percentile=(sorted,share)=>sorted[Math.min(sorted.length-1,Math.max(0,Math.floor((sorted.length-1)*share)))]||0;
const mulberry32=seed=>()=>{let value=seed+=0x6D2B79F5;value=Math.imul(value^value>>>15,value|1);value^=value+Math.imul(value^value>>>7,value|61);return((value^value>>>14)>>>0)/4294967296;};
const normal=random=>Math.sqrt(-2*Math.log(Math.max(random(),1e-12)))*Math.cos(2*Math.PI*random());
const makeHouseSeed=()=>window.crypto&&crypto.getRandomValues?crypto.getRandomValues(new Uint32Array(1))[0]:Math.floor(Math.random()*4294967295);
const caseWeight=(row,halfLife)=>{const days=Math.max(0,(Date.parse('2026-11-03T00:00:00Z')-Date.parse(`${row.date}T00:00:00Z`))/86400000),typeWeight=row.type==='statewide'?2:row.type==='us-house'?1.65:1;return typeWeight*2**(-days/halfLife);};
const weightedSignal=(cases,halfLife,includeStatewide)=>{const rows=cases.filter(row=>includeStatewide||row.type!=='statewide'),weights=rows.map(row=>caseWeight(row,halfLife)),total=weights.reduce((sum,value)=>sum+value,0),signal=rows.reduce((sum,row,index)=>sum+row.shift2024*weights[index],0)/total,variance=rows.reduce((sum,row,index)=>sum+(row.shift2024-signal)**2*weights[index],0)/total,effectiveN=total**2/weights.reduce((sum,value)=>sum+value**2,0);return{signal,se:Math.sqrt(variance/effectiveN)};};
const probabilityRating=probability=>probability>=.95?['Solid D','solid-d']:probability>=.85?['Likely D','likely-d']:probability>=.65?['Lean D','lean-d']:probability>.35?['Toss-up','toss']:probability>.15?['Lean R','lean-r']:probability>.05?['Likely R','likely-r']:['Solid R','solid-r'];

const readHouseBatchHistory=()=>{try{const stored=JSON.parse(localStorage.getItem('rippl-special-election-batches-v1')||'[]');return Array.isArray(stored)?stored.slice(-5000):[];}catch{return[];}};
const saveHouseBatchHistory=()=>{try{localStorage.setItem('rippl-special-election-batches-v1',JSON.stringify(houseBatchHistory.slice(-5000)));}catch{}};
houseBatchHistory=readHouseBatchHistory();

const nomineeMarkup=district=>{
  const record=houseNomineesById.get(district.id),democratic=record&&record.democratic,republican=record&&record.republican,available=Boolean(democratic||republican),updated=houseNomineeData&&houseNomineeData.retrieved?new Date(`${houseNomineeData.retrieved}T12:00:00`).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'';
  return `<div class="model1-nominees"><span>2026 major-party matchup</span><div><b class="dem-text">Democratic</b><strong>${democratic?escapeHtml(democratic):'Nominee not yet available'}</strong></div><div><b class="gop-text">Republican</b><strong>${republican?escapeHtml(republican):'Nominee not yet available'}</strong></div><small>${available?'Public candidate snapshot':'Primary field remains unsettled'}${updated?` · updated ${updated}`:''}</small></div>`;
};

const wait=milliseconds=>new Promise(resolve=>setTimeout(resolve,milliseconds));
const fetchJsonWithRetry=async(url,attempts=4)=>{
  let lastError;
  for(let attempt=0;attempt<attempts;attempt++){
    try{const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw new Error(`${response.status} ${response.statusText}`);return await response.json();}
    catch(error){lastError=error;if(attempt<attempts-1)await wait([450,900,1800][Math.min(attempt,2)]);}
  }
  throw lastError;
};

const cancelDistrictReveal=()=>{houseRevealToken++;if(houseRevealTimer){clearTimeout(houseRevealTimer);houseRevealTimer=null;}};
const startDistrictReveal=()=>{
  cancelDistrictReveal();
  const paths=[...document.querySelectorAll('.district-shape.district-loading')],progress=document.querySelector('.district-load-progress'),counter=progress&&progress.querySelector('strong'),bar=progress&&progress.querySelector('b');
  if(!paths.length){if(progress)progress.hidden=true;return;}
  const token=houseRevealToken,batch=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches?paths.length:18;
  let revealed=0;
  const step=()=>{
    if(token!==houseRevealToken)return;
    paths.slice(revealed,revealed+batch).forEach(path=>path.classList.remove('district-loading'));
    revealed=Math.min(paths.length,revealed+batch);
    if(counter)counter.textContent=`${revealed} / ${paths.length}`;
    if(bar)bar.style.width=`${revealed/paths.length*100}%`;
    if(revealed<paths.length)houseRevealTimer=setTimeout(step,28);
    else if(progress)houseRevealTimer=setTimeout(()=>{if(token===houseRevealToken)progress.classList.add('complete');},180);
  };
  houseRevealTimer=setTimeout(step,180);
};

const runOneSpecialElection=random=>{
  const observed=weightedSignal(houseModelData.cases,houseHalfLife,houseIncludeStatewide),definition=calibrationOptions[houseCalibration],raw=observed.signal+normal(random)*observed.se,translated=raw*clamp(definition.value+normal(random)*definition.uncertainty,.15,1.35)+values.special,national=translated+normal(random)*houseModelData.model.nationalElectionError;
  let demSeats=0;
  for(const district of houseModelData.districts){const margin=district.margin+national+district.demographicAdjustment+normal(random)*houseModelData.model.districtError;if(margin>0)demSeats++;}
  return{demSeats,gopSeats:435-demSeats,control:demSeats>=218?'D':'R',nationalShift:national};
};

const batchSummary=results=>{
  if(!results.length)return null;
  const seats=results.map(result=>result.demSeats).sort((a,b)=>a-b),demControl=results.filter(result=>result.control==='D').length;
  return{count:results.length,median:percentile(seats,.5),low:percentile(seats,.1),high:percentile(seats,.9),demControl:demControl/results.length};
};

const batchTrackerMarkup=()=>{
  const displayed=houseBatchResults.length?houseBatchResults:houseBatchHistory,summary=batchSummary(displayed),recent=displayed.slice(-10).reverse();
  if(!summary)return `<div class="batch-empty"><strong>No elections tracked yet</strong><p>Run a batch to record each simulated chamber result.</p></div>`;
  const seats=displayed.map(result=>result.demSeats),minimum=Math.min(...seats),maximum=Math.max(...seats),spread=Math.max(1,maximum-minimum),threshold=clamp((218-minimum)/spread*100,0,100),markers=seats.slice(-100).map(value=>`<i class="${value>=218?'dem':'gop'}" style="left:${(value-minimum)/spread*100}%" title="${value} Democratic seats"></i>`).join('');
  return `<div class="batch-summary"><div><span>Elections reported</span><strong>${summary.count.toLocaleString()}</strong></div><div><span>Democratic control</span><strong>${probabilityLabel(summary.demControl)}</strong></div><div><span>Median chamber</span><strong>${summary.median}D–${435-summary.median}R</strong></div><div><span>80% seat range</span><strong>${summary.low}–${summary.high} D</strong></div></div><div class="batch-distribution"><span>Last ${Math.min(100,seats.length)} outcomes · ${minimum}–${maximum} Democratic seats</span><div>${markers}<b style="left:${threshold}%">218</b></div></div><div class="batch-recent"><div><span>Run</span><span>House outcome</span><span>Control</span><span>National shift</span></div>${recent.map(result=>`<div><span>#${result.run.toLocaleString()}</span><strong>${result.demSeats}D–${result.gopSeats}R</strong><b class="${result.control==='D'?'dem-text':'gop-text'}">${result.control} control</b><span>${marginLabel(result.nationalShift)}</span></div>`).join('')}</div>`;
};

const renderBatchTracker=()=>{
  const tracker=document.querySelector('#batch-tracker'),button=document.querySelector('#run-house-batch'),progress=document.querySelector('#batch-run-progress'),exportButton=document.querySelector('#export-house-batch'),clearButton=document.querySelector('#clear-house-batch');
  if(tracker)tracker.innerHTML=batchTrackerMarkup();
  if(button){button.disabled=houseBatchRunning;button.textContent=houseBatchRunning?`Running ${houseBatchProgress} of ${houseBatchTarget}…`:`Run ${houseBatchSize} elections`;}
  if(progress){progress.hidden=!houseBatchRunning;progress.querySelector('span').textContent=houseBatchRunning?`${houseBatchProgress} of ${houseBatchTarget} elections complete`:'';progress.querySelector('b').style.width=houseBatchTarget?`${houseBatchProgress/houseBatchTarget*100}%`:'0%';}
  if(exportButton)exportButton.disabled=!(houseBatchResults.length||houseBatchHistory.length)||houseBatchRunning;
  if(clearButton)clearButton.disabled=!(houseBatchResults.length||houseBatchHistory.length)||houseBatchRunning;
};

const startHouseBatch=requestedSize=>{
  if(houseBatchRunning)return;
  if(houseMode!=='model1'){houseMode='model1';houseSeed=makeHouseSeed();renderHouse();setTimeout(()=>startHouseBatch(requestedSize),80);return;}
  houseBatchTarget=requestedSize||houseBatchSize;houseBatchProgress=0;houseBatchResults=[];houseBatchRunning=true;
  const batchId=Date.now(),random=mulberry32(makeHouseSeed()),startingRun=houseBatchHistory.length;
  renderBatchTracker();
  const processChunk=()=>{
    const stop=Math.min(houseBatchTarget,houseBatchProgress+10);
    while(houseBatchProgress<stop){const outcome=runOneSpecialElection(random);houseBatchProgress++;houseBatchResults.push({...outcome,batchId,run:startingRun+houseBatchProgress,calibration:houseCalibration,halfLife:houseHalfLife,includeStatewide:houseIncludeStatewide});}
    renderBatchTracker();
    if(houseBatchProgress<houseBatchTarget)setTimeout(processChunk,18);
    else{houseBatchRunning=false;houseBatchHistory=[...houseBatchHistory,...houseBatchResults].slice(-5000);saveHouseBatchHistory();renderBatchTracker();}
  };
  setTimeout(processChunk,120);
};

const exportHouseBatch=()=>{
  const rows=houseBatchResults.length?houseBatchResults:houseBatchHistory;if(!rows.length)return;
  const header='run,democratic_seats,republican_seats,chamber_control,national_shift,calibration,half_life_days,include_statewide';
  const csv=[header,...rows.map(result=>[result.run,result.demSeats,result.gopSeats,result.control,result.nationalShift.toFixed(3),result.calibration,result.halfLife,result.includeStatewide].join(','))].join('\n'),url=URL.createObjectURL(new Blob([csv],{type:'text/csv'})),link=document.createElement('a');
  link.href=url;link.download='rippl-special-election-batch-results.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),0);
};

const simulateHouse=()=>{
  const random=mulberry32(houseSeed),observed=weightedSignal(houseModelData.cases,houseHalfLife,houseIncludeStatewide),calibration=houseMode==='model1'?calibrationOptions[houseCalibration].value:1,calibrationUncertainty=houseMode==='model1'?calibrationOptions[houseCalibration].uncertainty:.08,count=houseModelData.districts.length,sums=Array(count).fill(0),squares=Array(count).fill(0),wins=Array(count).fill(0),seatCounts=[];
  let control=0;
  for(let simulation=0;simulation<houseSimulations;simulation++){
    const raw=houseMode==='model1'?observed.signal+normal(random)*observed.se:shift(),translated=houseMode==='model1'?raw*clamp(calibration+normal(random)*calibrationUncertainty,.15,1.35)+values.special:raw,national=translated+normal(random)*(houseMode==='model1'?houseModelData.model.nationalElectionError:1.5);
    let seats=0;
    for(let index=0;index<count;index++){const district=houseModelData.districts[index],margin=district.margin+national+(houseMode==='model1'?district.demographicAdjustment:0)+normal(random)*houseModelData.model.districtError;sums[index]+=margin;squares[index]+=margin**2;if(margin>0){wins[index]++;seats++;}}
    seatCounts.push(seats);if(seats>=218)control++;
  }
  const results=houseModelData.districts.map((district,index)=>{const projectedMargin=sums[index]/houseSimulations,marginSd=Math.sqrt(Math.max(0,squares[index]/houseSimulations-projectedMargin**2)),demWinProbability=wins[index]/houseSimulations,[rating,ratingClass]=probabilityRating(demWinProbability),otherShare=2,demShare=clamp((98+projectedMargin)/2,1,97),gopShare=98-demShare,totalVotes=Math.round(district.total*houseModelData.model.turnoutMeanVs2024),demVotes=Math.round(totalVotes*demShare/100),gopVotes=Math.round(totalVotes*gopShare/100);return{...district,projectedMargin,marginSd,demWinProbability,rating,ratingClass,otherShare,demShare,gopShare,totalVotes,demVotes,gopVotes,otherVotes:totalVotes-demVotes-gopVotes};});
  seatCounts.sort((a,b)=>a-b);
  return{results,medianDem:percentile(seatCounts,.5),lowDem:percentile(seatCounts,.1),highDem:percentile(seatCounts,.9),controlProbability:control/houseSimulations,signal:observed.signal,expectedShift:houseMode==='model1'?observed.signal*calibration+values.special:shift()};
};

const loadHouseData=()=>{
  if(houseCollection&&houseModelData||houseLoadInFlight)return;
  houseLoadInFlight=true;
  Promise.all([fetchJsonWithRetry(`${home}house-districts-120.geojson`),fetchJsonWithRetry(`${home}model1-special-elections.json`),fetchJsonWithRetry(`${home}house-nominees-2026.json`).catch(()=>null)]).then(([map,data,nominees])=>{houseCollection=map;houseModelData=data;houseNomineeData=nominees;houseNomineesById=new Map((nominees&&nominees.districts||[]).map(record=>[record.id,record]));houseLoadInFlight=false;setTimeout(renderHouse,240);}).catch(()=>{houseLoadInFlight=false;const status=document.querySelector('.map-status');if(status)status.textContent='The district geometry or model data could not be loaded. Retrying the page usually resolves a recent deployment.';});
};

const renderHouse=()=>{
  cancelDistrictReveal();
  const stage=document.querySelector('.output-stage');
  document.querySelector('.race-section').hidden=true;
  if(!houseCollection||!houseModelData){stage.innerHTML=`<div class="output-head"><div><p class="section-index">Model 1 / Special elections</p><h3>Run the national House model</h3><p>Loading district baselines, demographics, and boundaries.</p></div><div class="office-chip">U.S. House</div></div><div class="map-status">Loading Model 1 data…</div>`;loadHouseData();return;}
  const output=houseMode==='blank'?null:simulateHouse(),results=output?output.results:[],resultById=new Map(results.map(result=>[result.id,result])),districtById=new Map(houseModelData.districts.map(district=>[district.id,district])),selected=selectedDistrict?resultById.get(selectedDistrict):null,selectedBase=selectedDistrict?districtById.get(selectedDistrict):null,signal=weightedSignal(houseModelData.cases,houseHalfLife,houseIncludeStatewide),medianGop=output?435-output.medianDem:0;
  const projection=d3.geoAlbersUsa().fitExtent([[18,18],[942,582]],houseCollection),path=d3.geoPath(projection);
  const mapPaths=houseCollection.features.map(feature=>{const id=feature.properties.GEOID,result=resultById.get(id),district=districtById.get(id);return`<path d="${path(feature)||''}" class="district-shape ${result?result.ratingClass:'unrated'} ${output?'district-loading':''} ${selectedDistrict===id?'selected':''}" data-district="${id}"><title>${result?`${result.label}: ${result.rating}, ${probabilityLabel(result.demWinProbability)} D win, ${marginLabel(result.projectedMargin)}`:`${district?district.label:id}: run the model`}</title></path>`;}).join('');
  const options=[...houseModelData.districts].sort((a,b)=>a.label.localeCompare(b.label,undefined,{numeric:true})).map(district=>`<option value="${district.id}" ${district.id===selectedDistrict?'selected':''}>${district.label}</option>`).join('');
  const closest=[...results].sort((a,b)=>Math.abs(a.demWinProbability-.5)-Math.abs(b.demWinProbability-.5)).slice(0,10);
  const detail=!selectedDistrict?`<div class="detail-empty"><strong>Click any district</strong><p>Its baseline, simulated vote, uncertainty, and demographic inputs will appear here.</p></div>`:!output?`<div class="detail-empty"><span>${selectedBase.state}</span><strong>${selectedBase.label}</strong><p>The map is blank. Run Model 1 to produce this district's probability estimate.</p></div>`:`<div class="detail-result model1-detail"><span>${selected.state} · ${selected.incumbent?`${selected.incumbent} (${selected.incumbentParty||'?'})`:'Open seat'}</span><h4>${selected.label}</h4><div class="detail-rating ${selected.ratingClass}">${selected.rating}</div><div class="model1-probability"><span>Democratic win probability</span><strong>${probabilityLabel(selected.demWinProbability)}</strong><i><b style="width:${selected.demWinProbability*100}%"></b></i></div><dl><div><dt>Democratic</dt><dd>${selected.demShare.toFixed(1)}% <small>${selected.demVotes.toLocaleString()}</small></dd></div><div><dt>Republican</dt><dd>${selected.gopShare.toFixed(1)}% <small>${selected.gopVotes.toLocaleString()}</small></dd></div><div><dt>Other</dt><dd>${selected.otherShare.toFixed(1)}% <small>${selected.otherVotes.toLocaleString()}</small></dd></div></dl><div class="detail-margin"><span>Mean simulated margin</span><strong>${marginLabel(selected.projectedMargin)}</strong></div><div class="model1-interval"><span>Approx. 80% district interval</span><strong>${marginLabel(selected.projectedMargin-1.282*selected.marginSd)} to ${marginLabel(selected.projectedMargin+1.282*selected.marginSd)}</strong></div><div class="model1-baselines"><div><span>2024 president</span><strong>${marginLabel(selected.margin)}</strong></div><div><span>2022 House</span><strong>${selected.house2022?marginLabel(selected.house2022.margin):'Not comparable'}</strong></div><div><span>Demographic adjustment</span><strong>${selected.demographicsComparable?marginLabel(selected.demographicAdjustment):'National effect only'}</strong></div></div>${selected.demographicsComparable&&selected.demographics?`<div class="model1-demographics"><span>${selected.demographicsMethod==='2024-ACS-small-area-reaggregation'?'2020–2024 ACS · rebuilt for 120th lines':'2020–2024 ACS district profile'}</span><div><b>${selected.demographics.age65.toFixed(1)}%<small>Age 65+</small></b><b>${selected.demographics.seniorBachelors.toFixed(1)}%<small>Senior BA+</small></b><b>${selected.demographics.whiteNH.toFixed(1)}%<small>White, non-Hisp.</small></b><b>${selected.demographics.hispanic.toFixed(1)}%<small>Hispanic</small></b></div></div>`:`<p class="provisional-note">A usable ACS profile is unavailable for this district, so the model applies only the national effect.</p>`}<p>Expected turnout ${selected.totalVotes.toLocaleString()} · about 72% of the district's 2024 presidential vote.</p></div>`;
  const statewide=houseModelData.summary.statewide2025.map(race=>`<article><span>${race.state} governor · 2025</span><strong>${marginLabel(race.specialMargin)}</strong><div><p><b>2024 president</b><em>${marginLabel(race.baseline2024Margin)}</em></p><p><b>Shift</b><em class="dem-text">${marginLabel(race.shift2024)}</em></p><p><b>2022 House</b><em>${marginLabel(race.baseline2022Margin)}</em></p></div></article>`).join('');
  const houseSpecials=houseModelData.summary.houseSpecials.map(race=>`<div><span><strong>${race.district}</strong><small>${race.date}</small></span><span>${race.specialD.toFixed(1)}% D · ${race.specialR.toFixed(1)}% R</span><b class="${race.included?'dem-text':'muted-text'}">${race.shift2024===null?'Excluded':marginLabel(race.shift2024)}</b><small>${race.reason}</small></div>`).join('');
  stage.innerHTML=`<div class="house-output model1-output"><div class="output-head"><div><p class="section-index">Model 1 / Special elections</p><h3>Run the national House model</h3><p>Start blank, then translate 2025–26 special and off-year results into 435 district probability estimates. Every run redraws national and district uncertainty.</p></div><div class="office-chip">U.S. House</div></div><div class="model1-case-strip"><div><span>Qualifying cases</span><strong>${houseModelData.model.qualifyingCases}</strong><small>85 state legislative · 7 House · 2 statewide</small></div><div><span>Observed signal</span><strong class="dem-text">${marginLabel(signal.signal)}</strong><small>Against 2024 presidential baselines</small></div><div><span>Historical translation</span><strong>${calibrationOptions[houseCalibration].value.toFixed(2)}×</strong><small>${calibrationOptions[houseCalibration].note}</small></div><div><span>Demographic fit</span><strong>${houseModelData.model.demographicTrainingCases}</strong><small>Ridge-shrunk qualifying cases</small></div></div><div class="model1-controls"><div class="model1-run-buttons"><button type="button" class="model1-primary" data-house-run="model1">${houseMode==='model1'?'Restart Model 1':'Run Model 1'}</button><button type="button" data-house-run="repeat" ${houseMode==='blank'?'disabled':''}>Run again</button><button type="button" class="${houseMode==='blank'?'active':''}" data-house-run="blank">Blank map</button><button type="button" class="${houseMode==='composite'?'active':''}" data-house-run="composite">Four-model prototype</button></div><div class="model1-settings"><label>Simulations<select id="house-simulations"><option value="500" ${houseSimulations===500?'selected':''}>500</option><option value="1000" ${houseSimulations===1000?'selected':''}>1,000</option><option value="2500" ${houseSimulations===2500?'selected':''}>2,500</option></select></label><label>Recency half-life<select id="house-half-life"><option value="180" ${houseHalfLife===180?'selected':''}>180 days</option><option value="365" ${houseHalfLife===365?'selected':''}>365 days</option><option value="540" ${houseHalfLife===540?'selected':''}>540 days</option></select></label><label>Translation<select id="house-calibration"><option value="cautious" ${houseCalibration==='cautious'?'selected':''}>Cautious</option><option value="historical" ${houseCalibration==='historical'?'selected':''}>History-calibrated</option><option value="direct" ${houseCalibration==='direct'?'selected':''}>Direct signal</option></select></label><label class="model1-check"><input id="house-statewide" type="checkbox" ${houseIncludeStatewide?'checked':''}><span>Include NJ &amp; VA statewide</span></label></div></div><div class="house-balance ${output?'':'blank'}"><div><span>${output?'Median simulated chamber':'Simulation not run'}</span><strong class="dem-text">${output?output.medianDem:'—'}<i>D</i></strong><b>${output?`${output.lowDem}–${output.highDem} D 80% range`:'Run Model 1'}</b><strong class="gop-text">${output?medianGop:'—'}<i>R</i></strong></div><div class="balance-track">${output?`<span class="dem" style="width:${output.medianDem/435*100}%"></span><span class="gop" style="width:${medianGop/435*100}%"></span>`:''}</div>${output?`<div class="model1-balance-meta"><span>Democratic control <strong>${probabilityLabel(output.controlProbability)}</strong></span><span>Expected national shift <strong>${marginLabel(output.expectedShift)}</strong></span><span>Run seed <strong>${houseSeed}</strong></span></div>`:''}</div><div class="house-map-layout"><div class="district-map-wrap"><svg class="district-map" viewBox="0 0 960 600" role="img"><title>RIPPL Model 1 national House simulation</title><desc>Districts are rated from simulated Democratic win probability.</desc>${mapPaths}</svg><div class="house-map-legend"><span><i class="solid-d"></i>Solid D</span><span><i class="likely-d"></i>Likely D</span><span><i class="lean-d"></i>Lean D</span><span><i class="toss"></i>Toss-up</span><span><i class="lean-r"></i>Lean R</span><span><i class="likely-r"></i>Likely R</span><span><i class="solid-r"></i>Solid R</span></div></div><aside class="district-detail"><label for="district-select">District explorer</label><select id="district-select"><option value="">Select a district</option>${options}</select>${detail}</aside></div>${output?`<div class="house-close-races" id="race-board"><div><span>Most competitive simulated races</span><b>Ranked by proximity to 50% win probability</b></div><div class="close-race-grid">${closest.map(race=>`<button type="button" data-close-race="${race.id}"><span><strong>${race.label}</strong><small>${race.rating} · ${probabilityLabel(race.demWinProbability)} D</small></span><b class="${race.projectedMargin>=0?'dem-text':'gop-text'}">${marginLabel(race.projectedMargin)}</b></button>`).join('')}</div></div>`:''}<section class="model1-evidence"><div class="model1-evidence-head"><div><p class="section-index">Observed evidence</p><h4>NJ and VA anchor the statewide check.</h4></div><p>The larger special-election bank estimates the cycle signal. Statewide and U.S. House contests receive more weight; recency decays according to the selected half-life.</p></div><div class="statewide-comparison">${statewide}</div><details class="house-special-bank"><summary>Review the completed U.S. House special-election audit</summary><div>${houseSpecials}</div></details></section><p class="map-source-note">District lines: U.S. Census Bureau official 120th-Congress geography, released August 2026. Election baselines: The Downballot calculations for the 2026 lines. Demographics: U.S. Census Bureau 2020–2024 ACS, with block-group and tract estimates reaggregated in the ten redrawn states. 2022 comparison: Office of the House Clerk. The special-election bank is descriptive and non-random; demographic relationships are ecological, ridge-shrunk, and not claims about individual voters.</p></div>`;
  const nomineeTarget=document.querySelector(selectedDistrict&&output?'.model1-detail':selectedDistrict?'.detail-empty':'.detail-empty');
  if(selectedDistrict&&nomineeTarget)nomineeTarget.insertAdjacentHTML('beforeend',nomineeMarkup(output?selected:selectedBase));
  const controls=document.querySelector('.model1-controls');
  if(controls)controls.insertAdjacentHTML('afterend',`<section class="model1-batch-lab" aria-labelledby="batch-lab-title"><div class="batch-lab-head"><div><span>Special Elections model · repeated elections</span><h4 id="batch-lab-title">Run and track 100+ national outcomes</h4><p>Each reported election redraws the national environment and every district result. The tracker keeps the individual chamber outcome rather than averaging it away.</p></div><div class="batch-lab-controls"><label>Batch size<select id="house-batch-size"><option value="100" ${houseBatchSize===100?'selected':''}>100 elections</option><option value="250" ${houseBatchSize===250?'selected':''}>250 elections</option><option value="500" ${houseBatchSize===500?'selected':''}>500 elections</option><option value="1000" ${houseBatchSize===1000?'selected':''}>1,000 elections</option></select></label><button type="button" class="model1-primary" id="run-house-batch">Run ${houseBatchSize} elections</button><button type="button" id="export-house-batch">Download results</button><button type="button" id="clear-house-batch">Clear tracked runs</button></div></div><div class="batch-run-progress" id="batch-run-progress" hidden><span></span><i><b></b></i></div><div id="batch-tracker" aria-live="polite"></div><p class="batch-storage-note">Tracked outcomes are stored only in this browser. Every row records the translation setting, recency half-life, and statewide-case choice used for that run.</p></section>`);
  const sourceNote=document.querySelector('.map-source-note');
  if(sourceNote&&houseNomineeData)sourceNote.textContent+=` Candidate names: public 2026 House race tables, retrieved ${houseNomineeData.retrieved}; unresolved primaries remain explicitly unavailable and should be checked against state certification.`;
  if(output){const mapWrap=document.querySelector('.district-map-wrap');if(mapWrap)mapWrap.insertAdjacentHTML('afterbegin',`<div class="district-load-progress" role="status"><span>Loading district outcomes</span><strong>0 / ${houseCollection.features.length}</strong><i><b></b></i></div>`);}
  document.querySelectorAll('[data-house-run]').forEach(button=>button.addEventListener('click',()=>{const action=button.dataset.houseRun;if(action==='blank')houseMode='blank';else if(action==='composite'){houseMode='composite';houseSeed=makeHouseSeed();}else{houseMode='model1';houseSeed=makeHouseSeed();}renderHouse();}));
  document.querySelector('#house-batch-size').addEventListener('change',event=>{houseBatchSize=Number(event.target.value);renderBatchTracker();});
  document.querySelector('#run-house-batch').addEventListener('click',()=>startHouseBatch(houseBatchSize));
  document.querySelector('#export-house-batch').addEventListener('click',exportHouseBatch);
  document.querySelector('#clear-house-batch').addEventListener('click',()=>{houseBatchResults=[];houseBatchHistory=[];saveHouseBatchHistory();renderBatchTracker();});
  document.querySelector('#house-simulations').addEventListener('change',event=>{houseSimulations=Number(event.target.value);houseSeed=makeHouseSeed();renderHouse();});
  document.querySelector('#house-half-life').addEventListener('change',event=>{houseHalfLife=Number(event.target.value);houseSeed=makeHouseSeed();renderHouse();});
  document.querySelector('#house-calibration').addEventListener('change',event=>{houseCalibration=event.target.value;houseSeed=makeHouseSeed();renderHouse();});
  document.querySelector('#house-statewide').addEventListener('change',event=>{houseIncludeStatewide=event.target.checked;houseSeed=makeHouseSeed();renderHouse();});
  document.querySelectorAll('[data-district]').forEach(element=>element.addEventListener('click',()=>{selectedDistrict=element.dataset.district;renderHouse();}));
  document.querySelector('#district-select').addEventListener('change',event=>{selectedDistrict=event.target.value;renderHouse();});
  document.querySelectorAll('[data-close-race]').forEach(button=>button.addEventListener('click',()=>{selectedDistrict=button.dataset.closeRace;renderHouse();}));
  renderBatchTracker();
  if(output)startDistrictReveal();
};

const update=()=>{
  updateModelControls();
  if(office==='house'){renderHouse();return;}
  document.querySelector('.race-section').hidden=false;
  document.querySelector('.output-stage').innerHTML=standardOutput();
  document.querySelectorAll('[data-office]').forEach(button=>button.classList.toggle('active',button.dataset.office===office));
  document.querySelectorAll('[data-model]').forEach(button=>button.classList.toggle('active',button.dataset.model===activeModel));
  modelOrder.forEach(key=>document.querySelector(`[data-model-value="${key}"]`).textContent=key==='approval'?`${values[key].toFixed(0)}%`:marginLabel(values[key]));
  const definition=models[activeModel],slider=document.querySelector('#model-value');
  document.querySelector('#edit-number').textContent=`Editing model ${definition.number}`;document.querySelector('#edit-title').textContent=definition.title;document.querySelector('#edit-description').textContent=definition.description;document.querySelector('#edit-label').textContent=definition.label;document.querySelector('#edit-output').textContent=activeModel==='approval'?`${values[activeModel].toFixed(0)}%`:marginLabel(values[activeModel]);
  slider.min=definition.min;slider.max=definition.max;slider.step=definition.step;slider.value=values[activeModel];slider.style.setProperty('--range-progress',`${(values[activeModel]-definition.min)/(definition.max-definition.min)*100}%`);document.querySelector('#range-min').textContent=activeModel==='approval'?`${definition.min}%`:`R+${Math.abs(definition.min)}`;document.querySelector('#range-max').textContent=activeModel==='approval'?`${definition.max}%`:`D+${definition.max}`;document.querySelector('#composite').textContent=marginLabel(shift());
  const sum=summary();document.querySelector('#map-title').textContent=sum.title;document.querySelector('#map-subtitle').textContent=sum.subtitle;document.querySelector('#office-chip').textContent=offices.find(item=>item.key===office).label;document.querySelector('#balance-label').textContent=sum.label;document.querySelector('#dem-total').textContent=sum.dem;document.querySelector('#gop-total').textContent=sum.gop;document.querySelector('#threshold').textContent=sum.threshold;document.querySelector('#dem-track').style.width=`${sum.dem/sum.total*100}%`;document.querySelector('#gop-track').style.width=`${sum.gop/sum.total*100}%`;
  document.querySelector('#state-map').innerHTML=stateTiles.map(([abbr,row,col,base])=>{const active=activeState(abbr),adjusted=base+shift(),rating=!active?'not-up':adjusted>=12?'solid-d':adjusted>=4?'lean-d':adjusted>-4?'toss':adjusted>-12?'lean-r':'solid-r';return`<span class="${rating}" style="grid-row:${row};grid-column:${col}" title="${active?`${abbr}: ${marginLabel(adjusted)}`:`${abbr}: no scheduled contest`}">${abbr}</span>`;}).join('');
  document.querySelector('#map-legend').innerHTML=`<span><i class="solid-d"></i>Solid D</span><span><i class="lean-d"></i>Lean D</span><span><i class="toss"></i>Toss-up</span><span><i class="lean-r"></i>Lean R</span><span><i class="solid-r"></i>Solid R</span>${office==='house'?'':'<span><i class="not-up"></i>Not on ballot</span>'}`;
  document.querySelector('#district-matrix').innerHTML=office==='house'?`<div><span>435-seat matrix</span><b>Majority line: 218</b></div><div aria-hidden="true">${Array.from({length:435},(_,index)=>`<i class="${index<sum.dem?'dem':'gop'}"></i>`).join('')}</div>`:'';
  const races=raceData[office].map(([race,place,baseD,sensitivity])=>{const dem=clamp(baseD+shift()*sensitivity,35,64),gop=99-dem,margin=dem-gop;return{race,place,dem,gop,margin};}).sort((a,b)=>Math.abs(a.margin)-Math.abs(b.margin));
  document.querySelector('#race-table').innerHTML=`<div class="race-table-head"><span>Race</span><span>Projected vote</span><span>Margin</span><span>Rating</span></div>${races.map(race=>{const rating=Math.abs(race.margin)<1?'Toss-up':Math.abs(race.margin)<3?`Tilt ${race.margin>0?'D':'R'}`:`Lean ${race.margin>0?'D':'R'}`;return`<div class="race-row"><div><strong>${race.race}</strong><small>${race.place}</small></div><div class="vote-split"><span class="dem"><i style="width:${race.dem}%"></i>D ${race.dem.toFixed(1)}%</span><span class="gop"><i style="width:${race.gop}%"></i>R ${race.gop.toFixed(1)}%</span></div><strong class="${race.margin>=0?'dem-text':'gop-text'}">${marginLabel(race.margin)}</strong><span class="rating ${race.margin>=0?'dem-rating':'gop-rating'}">${rating}</span></div>`;}).join('')}`;
};
document.querySelectorAll('[data-office]').forEach(button=>button.addEventListener('click',()=>{office=button.dataset.office;update();}));document.querySelectorAll('[data-model]').forEach(button=>button.addEventListener('click',()=>{activeModel=button.dataset.model;update();}));document.querySelector('#model-value').addEventListener('input',event=>{values[activeModel]=Number(event.target.value);update();});document.querySelector('#reset').addEventListener('click',()=>{values={special:0,primary:1.1,approval:41,anes:1.3};update();});update();
