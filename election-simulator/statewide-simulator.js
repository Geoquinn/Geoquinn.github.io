(() => {
  'use strict';

  const office = document.body.dataset.office === 'governors' ? 'governors' : 'senate';
  const root = document.querySelector('#statewide-app');
  const officeConfig = {
    senate: {
      label: 'U.S. Senate',
      short: 'Senate',
      raceCount: 35,
      nonUpD: 34,
      nonUpR: 31,
      totalSeats: 100,
      threshold: 51,
      officeShock: 2.5,
      raceError: 6.5,
      noun: 'seats',
      controlLabel: 'Democratic control',
      majorityLabel: '51 seats for control'
    },
    governors: {
      label: 'Governors',
      short: 'Governor',
      raceCount: 36,
      nonUpD: 6,
      nonUpR: 8,
      totalSeats: 50,
      threshold: 26,
      officeShock: 3.5,
      raceError: 7.5,
      noun: 'governorships',
      controlLabel: 'Democratic majority',
      majorityLabel: '26 governorships for a majority'
    }
  }[office];

  const stateNames = {
    AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming'
  };

  const stateTiles = [
    ['AK',1,1],['ME',1,12],['WA',2,2],['ID',2,3],['MT',2,4],['ND',2,5],['MN',2,6],['WI',2,7],['MI',2,8],['NY',2,10],['VT',2,11],['NH',2,12],
    ['OR',3,2],['NV',3,3],['WY',3,4],['SD',3,5],['IA',3,6],['IL',3,7],['IN',3,8],['OH',3,9],['PA',3,10],['NJ',3,11],['CT',3,12],
    ['CA',4,2],['UT',4,3],['CO',4,4],['NE',4,5],['MO',4,6],['KY',4,7],['WV',4,8],['VA',4,9],['MD',4,10],['DE',4,11],['RI',4,12],
    ['AZ',5,3],['NM',5,4],['KS',5,5],['AR',5,6],['TN',5,7],['NC',5,8],['SC',5,9],['MA',5,12],
    ['HI',6,1],['TX',6,4],['OK',6,5],['LA',6,6],['MS',6,7],['AL',6,8],['GA',6,9],['FL',7,9]
  ];

  const senateRaces = [
    ['AL','Tommy Tuberville','R',false,false,'Democratic nominee','Republican nominee'],
    ['AK','Dan Sullivan','R',true,false,'Democratic nominee','Dan Sullivan'],
    ['AR','Tom Cotton','R',true,false,'Democratic nominee','Tom Cotton'],
    ['CO','John Hickenlooper','D',true,false,'John Hickenlooper','Republican nominee'],
    ['DE','Chris Coons','D',true,false,'Chris Coons','Republican nominee'],
    ['FL','Ashley Moody','R',true,true,'Democratic nominee','Ashley Moody'],
    ['GA','Jon Ossoff','D',true,false,'Jon Ossoff','Republican nominee'],
    ['ID','Jim Risch','R',true,false,'Democratic nominee','Jim Risch'],
    ['IL','Dick Durbin','D',false,false,'Democratic nominee','Republican nominee'],
    ['IA','Joni Ernst','R',false,false,'Democratic nominee','Republican nominee'],
    ['KS','Roger Marshall','R',true,false,'Democratic nominee','Roger Marshall'],
    ['KY','Mitch McConnell','R',false,false,'Democratic nominee','Republican nominee'],
    ['LA','Bill Cassidy','R',true,false,'Democratic nominee','Bill Cassidy'],
    ['ME','Susan Collins','R',true,false,'Democratic nominee','Susan Collins'],
    ['MA','Ed Markey','D',true,false,'Ed Markey','Republican nominee'],
    ['MI','Gary Peters','D',false,false,'Democratic nominee','Republican nominee'],
    ['MN','Tina Smith','D',false,false,'Democratic nominee','Republican nominee'],
    ['MS','Cindy Hyde-Smith','R',true,false,'Democratic nominee','Cindy Hyde-Smith'],
    ['MT','Steve Daines','R',true,false,'Democratic nominee','Steve Daines'],
    ['NE','Pete Ricketts','R',true,false,'Democratic nominee','Pete Ricketts'],
    ['NH','Jeanne Shaheen','D',false,false,'Democratic nominee','Republican nominee'],
    ['NJ','Cory Booker','D',true,false,'Cory Booker','Republican nominee'],
    ['NM','Ben Ray Lujan','D',true,false,'Ben Ray Lujan','Republican nominee'],
    ['NC','Thom Tillis','R',false,false,'Democratic nominee','Republican nominee'],
    ['OH','Jon Husted','R',true,true,'Democratic nominee','Jon Husted'],
    ['OK','Markwayne Mullin','R',true,false,'Democratic nominee','Markwayne Mullin'],
    ['OR','Jeff Merkley','D',true,false,'Jeff Merkley','Republican nominee'],
    ['RI','Jack Reed','D',true,false,'Jack Reed','Republican nominee'],
    ['SC','Lindsey Graham','R',true,false,'Democratic nominee','Lindsey Graham'],
    ['SD','Mike Rounds','R',true,false,'Democratic nominee','Mike Rounds'],
    ['TN','Bill Hagerty','R',true,false,'Democratic nominee','Bill Hagerty'],
    ['TX','John Cornyn','R',true,false,'Democratic nominee','John Cornyn'],
    ['VA','Mark Warner','D',true,false,'Mark Warner','Republican nominee'],
    ['WV','Shelley Moore Capito','R',true,false,'Democratic nominee','Shelley Moore Capito'],
    ['WY','Cynthia Lummis','R',false,false,'Democratic nominee','Republican nominee']
  ].map(([abbr,incumbent,incumbentParty,incumbentRunning,specialElection,demCandidate,repCandidate]) => ({abbr,incumbent,incumbentParty,incumbentRunning,specialElection,demCandidate,repCandidate}));

  const governorRaces = [
    ['AL','Kay Ivey','R',false,'Doug Jones','Tommy Tuberville'],['AK','Mike Dunleavy','R',false,'Democratic primary winner','Republican primary winner'],
    ['AZ','Katie Hobbs','D',true,'Katie Hobbs','Andy Biggs'],['AR','Sarah Huckabee Sanders','R',true,'Fredrick Love','Sarah Huckabee Sanders'],
    ['CA','Gavin Newsom','D',false,'Xavier Becerra','Steve Hilton'],['CO','Jared Polis','D',false,'Phil Weiser','Victor Marx'],
    ['CT','Ned Lamont','D',true,'Ned Lamont','Ryan Fazio'],['FL','Ron DeSantis','R',false,'Democratic primary winner','Republican primary winner'],
    ['GA','Brian Kemp','R',false,'Keisha Lance Bottoms','Rick Jackson'],['HI','Josh Green','D',true,'Josh Green','Gary Cordery'],
    ['ID','Brad Little','R',true,'Terri Pickens','Brad Little'],['IL','JB Pritzker','D',true,'JB Pritzker','Darren Bailey'],
    ['IA','Kim Reynolds','R',false,'Rob Sand','Zach Lahn'],['KS','Laura Kelly','D',false,'Cindy Holscher','Ty Masterson'],
    ['ME','Janet Mills','D',false,'Hannah Pingree','Bobby Charles'],['MD','Wes Moore','D',true,'Wes Moore','Dan Cox'],
    ['MA','Maura Healey','D',true,'Maura Healey','Republican nominee'],['MI','Gretchen Whitmer','D',false,'Jocelyn Benson','John James'],
    ['MN','Tim Walz','D',false,'Amy Klobuchar','Lisa Demuth'],['NE','Jim Pillen','R',true,'Lynne Walz','Jim Pillen'],
    ['NV','Joe Lombardo','R',true,'Aaron Ford','Joe Lombardo'],['NH','Kelly Ayotte','R',true,'Democratic nominee','Kelly Ayotte'],
    ['NM','Michelle Lujan Grisham','D',false,'Deb Haaland','Greggory Hull'],['NY','Kathy Hochul','D',true,'Kathy Hochul','Bruce Blakeman'],
    ['OH','Mike DeWine','R',false,'Amy Acton','Vivek Ramaswamy'],['OK','Kevin Stitt','R',false,'Cydni Munson','Republican runoff winner'],
    ['OR','Tina Kotek','D',true,'Tina Kotek','Christine Drazan'],['PA','Josh Shapiro','D',true,'Josh Shapiro','Stacy Garrity'],
    ['RI','Dan McKee','D',true,'Democratic nominee','Republican nominee'],['SC','Henry McMaster','R',false,'Jermaine Johnson','Republican nominee'],
    ['SD','Larry Rhoden','R',true,'Dan Ahlers','Larry Rhoden'],['TN','Bill Lee','R',false,'Jerri Green','Marsha Blackburn'],
    ['TX','Greg Abbott','R',true,'Gina Hinojosa','Greg Abbott'],['VT','Phil Scott','R',true,'Democratic nominee','Phil Scott'],
    ['WI','Tony Evers','D',false,'David Crowley','Tom Tiffany'],['WY','Mark Gordon','R',false,'Democratic primary winner','Republican primary winner']
  ].map(([abbr,incumbent,incumbentParty,incumbentRunning,demCandidate,repCandidate]) => ({abbr,incumbent,incumbentParty,incumbentRunning,specialElection:false,demCandidate,repCandidate}));

  const raceRoster = office === 'senate' ? senateRaces : governorRaces;
  const rosterByState = new Map(raceRoster.map(race => [race.abbr, race]));
  const calibrationOptions = {
    cautious:{label:'Cautious',value:.55,uncertainty:.20,note:'Stronger shrinkage toward no national shift'},
    historical:{label:'History-calibrated',value:.757,uncertainty:.25,note:'Prior centered on reconstructed 2018 and 2022 translation'},
    direct:{label:'Direct signal',value:1,uncertainty:.20,note:'Applies nearly the full measured special-election signal'}
  };

  let modelData = null;
  let raceRows = [];
  let results = null;
  let selectedState = raceRoster[0].abbr;
  let simulationCount = 1000;
  let halfLife = 365;
  let calibration = 'historical';
  let includeStatewide = true;
  let running = false;
  let completed = 0;
  let batchState = null;

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[character]));
  const clamp = (value,min,max) => Math.min(max,Math.max(min,value));
  const percentile = (sorted,share) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * share)))] ?? 0;
  const probabilityLabel = value => `${Math.round(value * 100)}%`;
  const marginLabel = margin => `${margin >= 0 ? 'D' : 'R'}+${Math.abs(margin).toFixed(1)}`;
  const mulberry32 = seed => () => {let value = seed += 0x6D2B79F5; value = Math.imul(value ^ value >>> 15,value | 1); value ^= value + Math.imul(value ^ value >>> 7,value | 61); return ((value ^ value >>> 14) >>> 0) / 4294967296;};
  const normal = random => Math.sqrt(-2 * Math.log(Math.max(random(),1e-12))) * Math.cos(2 * Math.PI * random());
  const studentT = (random,df) => {let chiSquare = 0; for(let index = 0; index < df; index++) chiSquare += normal(random) ** 2; return normal(random) / Math.sqrt(Math.max(chiSquare / df,1e-8));};
  const makeSeed = () => window.crypto && crypto.getRandomValues ? crypto.getRandomValues(new Uint32Array(1))[0] : Math.floor(Math.random() * 4294967295);
  const ratingFromProbability = probability => probability >= .95 ? ['Solid D','solid-d'] : probability >= .85 ? ['Likely D','likely-d'] : probability >= .65 ? ['Lean D','lean-d'] : probability > .35 ? ['Toss-up','toss'] : probability > .15 ? ['Lean R','lean-r'] : probability > .05 ? ['Likely R','likely-r'] : ['Solid R','solid-r'];
  const raceStatus = race => /nominee|winner/i.test(`${race.demCandidate} ${race.repCandidate}`) ? 'Provisional candidate roster' : 'Named matchup in cycle snapshot';
  const caseWeight = (row,days) => {const age = Math.max(0,(Date.parse('2026-11-03T00:00:00Z') - Date.parse(`${row.date}T00:00:00Z`)) / 86400000); const typeWeight = row.type === 'statewide' ? 2 : row.type === 'us-house' ? 1.65 : 1; return typeWeight * 2 ** (-age / days);};
  const weightedSignal = () => {
    const rows = modelData.cases.filter(row => includeStatewide || row.type !== 'statewide');
    const weights = rows.map(row => caseWeight(row,halfLife));
    const total = weights.reduce((sum,value) => sum + value,0);
    const mean = rows.reduce((sum,row,index) => sum + row.shift2024 * weights[index],0) / total;
    const variance = rows.reduce((sum,row,index) => sum + (row.shift2024 - mean) ** 2 * weights[index],0) / total;
    const effectiveN = total ** 2 / weights.reduce((sum,value) => sum + value ** 2,0);
    return {mean,se:Math.sqrt(variance / effectiveN),effectiveN,df:Math.max(3,Math.min(30,Math.round(effectiveN - 1))),cases:rows.length};
  };

  const aggregateStateBaselines = districts => {
    const totals = new Map();
    districts.forEach(district => {
      const row = totals.get(district.abbr) || {harris:0,trump:0,total:0};
      row.harris += Number(district.harrisVotes || 0);
      row.trump += Number(district.trumpVotes || 0);
      row.total += Number(district.total || 0);
      totals.set(district.abbr,row);
    });
    return totals;
  };

  const buildRaceRows = () => {
    const baselines = aggregateStateBaselines(modelData.districts);
    raceRows = raceRoster.map(race => {
      const votes = baselines.get(race.abbr) || {harris:0,trump:0,total:0};
      const baselineMargin = votes.total ? 100 * (votes.harris - votes.trump) / votes.total : 0;
      const incumbencyAdjustment = race.incumbentRunning ? (race.incumbentParty === 'D' ? 2 : -2) : 0;
      return {...race,state:stateNames[race.abbr],baselineMargin,baselineVotes:votes.total,incumbencyAdjustment};
    });
    if(!rosterByState.has(selectedState)) selectedState = raceRows[0].abbr;
  };

  const initializeBatch = random => {
    const signal = weightedSignal();
    return {
      random,
      signal,
      demTotals:[],
      controlWins:0,
      nationalShifts:[],
      raceMargins:raceRows.map(() => []),
      raceWins:Array(raceRows.length).fill(0)
    };
  };

  const simulateElection = state => {
    const {random,signal} = state;
    const specialSignal = signal.mean + studentT(random,signal.df) * signal.se;
    const translationSetting = calibrationOptions[calibration];
    const translation = clamp(translationSetting.value + normal(random) * translationSetting.uncertainty,.15,1.35);
    const nationalShift = specialSignal * translation + normal(random) * Number(modelData.model.nationalElectionError || 2.5);
    const officeShift = nationalShift + normal(random) * officeConfig.officeShock;
    let democraticWins = 0;
    raceRows.forEach((race,index) => {
      const margin = race.baselineMargin + race.incumbencyAdjustment + officeShift + normal(random) * officeConfig.raceError;
      state.raceMargins[index].push(margin);
      if(margin > 0){state.raceWins[index]++; democraticWins++;}
    });
    const democraticTotal = officeConfig.nonUpD + democraticWins;
    state.demTotals.push(democraticTotal);
    state.nationalShifts.push(nationalShift);
    if(democraticTotal >= officeConfig.threshold) state.controlWins++;
  };

  const finalizeBatch = state => {
    const totals = [...state.demTotals].sort((a,b) => a - b);
    const shifts = [...state.nationalShifts].sort((a,b) => a - b);
    const turnoutRatio = Number(modelData.model.turnoutMeanVs2024 || .72);
    const races = raceRows.map((race,index) => {
      const margins = [...state.raceMargins[index]].sort((a,b) => a - b);
      const medianMargin = percentile(margins,.5);
      const probability = state.raceWins[index] / simulationCount;
      const [rating,ratingClass] = ratingFromProbability(probability);
      const otherShare = 2;
      const demShare = clamp((98 + medianMargin) / 2,1,97);
      const repShare = 98 - demShare;
      const totalVotes = Math.round(race.baselineVotes * turnoutRatio);
      return {...race,probability,rating,ratingClass,medianMargin,lower80:percentile(margins,.1),upper80:percentile(margins,.9),demShare,repShare,otherShare,totalVotes,demVotes:Math.round(totalVotes * demShare / 100),repVotes:Math.round(totalVotes * repShare / 100),otherVotes:Math.round(totalVotes * otherShare / 100)};
    });
    return {
      simulations:simulationCount,
      races,
      medianD:percentile(totals,.5),
      lowerD:percentile(totals,.1),
      upperD:percentile(totals,.9),
      controlProbability:state.controlWins / simulationCount,
      medianShift:percentile(shifts,.5),
      lowerShift:percentile(shifts,.1),
      upperShift:percentile(shifts,.9),
      totals,
      signal:state.signal,
      seed:state.seed
    };
  };

  const siteHeader = () => `
    <a class="skip-link" href="#statewide-model">Skip to simulator</a>
    <header class="site-header"><a class="brand" href="../" aria-label="RIPPL Election Simulator home"><span class="rippl-mark" aria-hidden="true"><i></i><i></i><i></i></span><span><strong>RIPPL</strong> Election Simulator</span></a><nav aria-label="Primary navigation"><a href="../house/">House</a><a href="../senate/">Senate</a><a href="../governors/">Governors</a><a href="#methodology">Methodology</a><a href="https://george-quinn.com/">George Quinn</a></nav></header>
    <section class="statewide-hero"><div><p class="eyebrow"><span>Model 1</span> Special &amp; off-year elections</p><h1>2026 ${officeConfig.short}<br><em>Bayesian simulator.</em></h1><p>Translate observed 2025–26 special-election overperformance into correlated statewide outcomes. Run the election at least 100 times, inspect every race, and read the posterior distribution—not just one map.</p></div><aside><span>${officeConfig.raceCount} races</span><strong>${officeConfig.majorityLabel}</strong><p>All estimates are developmental simulations anchored to 2024 presidential baselines. Candidate names are display metadata and do not yet create candidate-quality effects.</p></aside></section>
    <section class="office-switch statewide-office-switch" aria-label="Choose an office"><a href="../house/"><span>House</span><small>435 districts</small></a><a class="${office === 'senate' ? 'active' : ''}" href="../senate/"><span>Senate</span><small>35 contests</small></a><a class="${office === 'governors' ? 'active' : ''}" href="../governors/"><span>Governors</span><small>36 contests</small></a></section>`;

  const appShell = () => {
    root.innerHTML = `${siteHeader()}
      <section class="statewide-section" id="statewide-model">
        <div class="section-intro compact"><div><p class="section-index">01 / Posterior election lab</p><h2>Run the cycle.<br>Read the range.</h2></div><p>Each simulated election shares one national draw across every state, adds an office-specific shock, and then draws race-specific uncertainty. That correlation makes the chamber and governorship distributions more realistic than treating races independently.</p></div>
        <div class="prototype-notice"><strong>Developmental forecast</strong><span>This is a transparent research model, not a published prediction. The special-election bank is non-random and candidate rosters remain provisional where a nominee is not named.</span></div>
        <div class="statewide-lab">
          <aside class="statewide-controls"><div class="rail-head"><span>Special Elections model</span><b>Bayesian simulation</b></div>
            <div class="statewide-setting"><label for="statewide-simulations">Number of elections</label><select id="statewide-simulations"><option value="100">100</option><option value="500">500</option><option value="1000" selected>1,000</option><option value="2500">2,500</option><option value="5000">5,000</option></select><small>Every run redraws the national, office, and race-level effects.</small></div>
            <div class="statewide-setting"><label for="statewide-half-life">Recency half-life</label><select id="statewide-half-life"><option value="180">180 days</option><option value="365" selected>365 days</option><option value="540">540 days</option></select><small>Shorter half-lives give newer special elections more influence.</small></div>
            <div class="statewide-setting"><label for="statewide-calibration">Historical translation</label><select id="statewide-calibration">${Object.entries(calibrationOptions).map(([key,value]) => `<option value="${key}" ${key === 'historical' ? 'selected' : ''}>${value.label}</option>`).join('')}</select><small id="calibration-note">${calibrationOptions.historical.note}</small></div>
            <label class="statewide-checkbox"><input id="statewide-cases" type="checkbox" checked><span>Include 2025 NJ and VA statewide elections</span></label>
            <button class="statewide-run" id="run-statewide-model" type="button">Run 1,000 simulations</button>
            <div class="statewide-progress" id="statewide-progress" hidden><span>Preparing posterior draws…</span><i><b></b></i></div>
            <div class="statewide-assumptions"><span>Core assumptions</span><ul><li>Student-t approximation for the latent special-election signal</li><li>${officeConfig.officeShock.toFixed(1)}-point office shock</li><li>${officeConfig.raceError.toFixed(1)}-point race error</li><li>2-point incumbency adjustment when the incumbent runs</li></ul></div>
          </aside>
          <div class="statewide-output" id="statewide-output" aria-live="polite"></div>
        </div>
      </section>
      <section class="statewide-race-section" id="competitive-races"><div class="section-intro compact"><div><p class="section-index">02 / Competitive races</p><h2>Races inside<br>the uncertainty.</h2></div><p>The scroll prioritizes the states closest to 50% Democratic win probability. Click any state tile or race card to open its candidates, vote estimate, and 80% predictive interval.</p></div><div id="statewide-competitive-list"></div></section>
      <section class="methodology statewide-methodology" id="methodology"><div><p class="section-index">03 / Model structure</p><h2>One signal.<br>Three uncertainty levels.</h2><p>The browser model mirrors the paper’s architecture with a fast posterior approximation suitable for repeated public simulations.</p></div><ol><li><span>01</span><div><strong>Measure the cycle signal</strong><p>Weight 2025–26 special and off-year shifts by election type and recency, then draw the latent signal with heavy tails.</p></div></li><li><span>02</span><div><strong>Translate to November</strong><p>Apply a posterior translation coefficient centered on the reconstructed 2018 and 2022 calibration cycles.</p></div></li><li><span>03</span><div><strong>Preserve correlated outcomes</strong><p>All races share the same national and office draws within an election; only the final race error is independent.</p></div></li><li><span>04</span><div><strong>Summarize the distribution</strong><p>Report medians, 80% intervals, win probabilities, and the chance of chamber control or a governorship majority.</p></div></li></ol></section>
      <footer><div><a class="footer-brand" href="../">RIPPL Election Simulator</a><p>Research-informed, transparent election scenarios by George D. Quinn.</p></div><div class="footer-links"><a href="../house/">House</a><a href="../senate/">Senate</a><a href="../governors/">Governors</a><a href="#methodology">Methodology</a></div><div class="footer-meta"><span>george-quinn.com</span><span>Special Elections Model · 2026 cycle</span></div></footer>`;
  };

  const emptyOutput = message => `
    <div class="output-head"><div><p class="section-index">Nationwide ${officeConfig.short} output</p><h3>${officeConfig.raceCount}-race map</h3><p>${message}</p></div><div class="office-chip">${officeConfig.label}</div></div>
    <div class="statewide-empty"><span>Awaiting posterior simulation</span><strong>Choose 100 or more elections and run Model 1.</strong><p>The map, race explorer, seat distribution, and probability summary will populate together.</p></div>`;

  const histogramMarkup = totals => {
    const counts = new Map(); totals.forEach(value => counts.set(value,(counts.get(value) || 0) + 1));
    const values = [...counts.keys()].sort((a,b) => a - b), maximum = Math.max(...counts.values());
    return `<div class="statewide-histogram" aria-label="Distribution of Democratic ${officeConfig.noun}">${values.map(value => `<div><i class="${value >= officeConfig.threshold ? 'dem' : 'gop'}" style="height:${Math.max(4,counts.get(value) / maximum * 100)}%"></i><span>${value}</span><b>${counts.get(value)}</b></div>`).join('')}<em style="left:${values.length > 1 ? clamp((officeConfig.threshold - values[0]) / (values[values.length - 1] - values[0]) * 100,0,100) : 50}%">${officeConfig.threshold}</em></div>`;
  };

  const mapMarkup = () => {
    const raceResults = new Map(results.races.map(race => [race.abbr,race]));
    return `<div class="statewide-map" role="group" aria-label="Clickable ${officeConfig.label} race map">${stateTiles.map(([abbr,row,column]) => {
      const race = raceResults.get(abbr);
      return race ? `<button type="button" data-state="${abbr}" class="${race.ratingClass} ${selectedState === abbr ? 'selected' : ''}" style="grid-row:${row};grid-column:${column}" title="${stateNames[abbr]}: ${race.rating}, ${probabilityLabel(race.probability)} Democratic win probability"><span>${abbr}</span><small>${probabilityLabel(race.probability)}</small></button>` : `<span class="not-up" style="grid-row:${row};grid-column:${column}" title="${stateNames[abbr]}: no 2026 ${officeConfig.short.toLowerCase()} race">${abbr}</span>`;
    }).join('')}</div>`;
  };

  const detailMarkup = race => `
    <aside class="statewide-detail"><span>${race.specialElection ? 'Special election · ' : ''}${race.state}</span><h4>${officeConfig.short} race</h4><div class="detail-rating ${race.ratingClass}">${race.rating}</div>
      <div class="statewide-candidate"><i class="dem-text">D</i><div><strong>${escapeHtml(race.demCandidate)}</strong><small>${race.demShare.toFixed(1)}% · ${race.demVotes.toLocaleString()} votes</small></div></div>
      <div class="statewide-candidate"><i class="gop-text">R</i><div><strong>${escapeHtml(race.repCandidate)}</strong><small>${race.repShare.toFixed(1)}% · ${race.repVotes.toLocaleString()} votes</small></div></div>
      <div class="statewide-detail-grid"><div><span>Democratic win</span><strong>${probabilityLabel(race.probability)}</strong></div><div><span>Median margin</span><strong>${marginLabel(race.medianMargin)}</strong></div><div><span>80% interval</span><strong>${marginLabel(race.lower80)} to ${marginLabel(race.upper80)}</strong></div><div><span>2024 baseline</span><strong>${marginLabel(race.baselineMargin)}</strong></div><div><span>Projected turnout</span><strong>${race.totalVotes.toLocaleString()}</strong></div><div><span>Other vote</span><strong>${race.otherShare.toFixed(1)}%</strong></div></div>
      <p>${raceStatus(race)}. Candidate names do not yet alter the probability estimate.</p></aside>`;

  const renderResults = () => {
    const output = document.querySelector('#statewide-output');
    const list = document.querySelector('#statewide-competitive-list');
    if(!results){output.innerHTML = emptyOutput('Start with a blank map, then run the Bayesian Special Elections model.'); list.innerHTML = '<div class="statewide-list-empty">Competitive race summaries will appear after the model runs.</div>'; return;}
    const selected = results.races.find(race => race.abbr === selectedState) || results.races[0];
    const medianR = officeConfig.totalSeats - results.medianD;
    output.innerHTML = `
      <div class="output-head"><div><p class="section-index">Bayesian summary · ${results.simulations.toLocaleString()} elections</p><h3>${officeConfig.raceCount}-race posterior map</h3><p>State colors are based on simulated Democratic win probability. Click a state for the matchup and predictive interval.</p></div><div class="office-chip">${officeConfig.label}</div></div>
      <div class="statewide-summary-grid"><div><span>Median outcome</span><strong>${results.medianD}D–${medianR}R</strong><small>${officeConfig.totalSeats} total ${officeConfig.noun}</small></div><div><span>80% outcome range</span><strong>${results.lowerD}–${results.upperD} D</strong><small>${officeConfig.noun} after the election</small></div><div><span>${officeConfig.controlLabel}</span><strong>${probabilityLabel(results.controlProbability)}</strong><small>threshold: ${officeConfig.threshold}</small></div><div><span>Median national shift</span><strong>${marginLabel(results.medianShift)}</strong><small>80%: ${marginLabel(results.lowerShift)} to ${marginLabel(results.upperShift)}</small></div></div>
      <div class="statewide-distribution"><div><span>Posterior outcome distribution</span><small>Bars count simulated elections · dashed line is the control threshold</small></div>${histogramMarkup(results.totals)}</div>
      <div class="statewide-map-layout"><div><div class="statewide-map-head"><strong>Interactive state map</strong><span>${results.signal.cases} qualifying cases · effective n ${results.signal.effectiveN.toFixed(1)} · latent signal ${marginLabel(results.signal.mean)}</span></div>${mapMarkup()}<div class="house-map-legend"><span><i class="solid-d"></i>Solid D</span><span><i class="likely-d"></i>Likely D</span><span><i class="lean-d"></i>Lean D</span><span><i class="toss"></i>Toss-up</span><span><i class="lean-r"></i>Lean R</span><span><i class="likely-r"></i>Likely R</span><span><i class="solid-r"></i>Solid R</span><span><i class="not-up"></i>Not up</span></div></div>${detailMarkup(selected)}</div>
      <p class="map-source-note">Baselines aggregate the site’s 2024 presidential vote data to the state level. The browser uses a Student-t posterior approximation for the measured special-election signal, a translated national shock, an office shock, and race-specific predictive error. Vote totals apply the model’s expected midterm turnout ratio. Results are simulations, not certified forecasts.</p>`;
    output.querySelectorAll('[data-state]').forEach(button => button.addEventListener('click',() => {selectedState = button.dataset.state; renderResults();}));

    const competitive = [...results.races].sort((a,b) => Math.abs(a.probability - .5) - Math.abs(b.probability - .5));
    list.innerHTML = `<div class="statewide-race-track" tabindex="0" aria-label="Scrollable competitive ${officeConfig.short} races">${competitive.map(race => `<button type="button" data-race-card="${race.abbr}" class="statewide-race-card ${selectedState === race.abbr ? 'active' : ''}"><span><strong>${race.state}</strong><b class="${race.medianMargin >= 0 ? 'dem-text' : 'gop-text'}">${marginLabel(race.medianMargin)}</b></span><small>${race.rating} · ${probabilityLabel(race.probability)} Democratic win</small><i><em class="dem-text">D</em>${escapeHtml(race.demCandidate)}</i><i><em class="gop-text">R</em>${escapeHtml(race.repCandidate)}</i><span class="race-card-interval">80% margin: ${marginLabel(race.lower80)} to ${marginLabel(race.upper80)}</span></button>`).join('')}</div>`;
    list.querySelectorAll('[data-race-card]').forEach(button => button.addEventListener('click',() => {selectedState = button.dataset.raceCard; renderResults(); document.querySelector('#statewide-output').scrollIntoView({behavior:'smooth',block:'start'});}));
  };

  const updateControls = () => {
    const button = document.querySelector('#run-statewide-model');
    const progress = document.querySelector('#statewide-progress');
    button.disabled = running;
    button.textContent = running ? `Running ${completed.toLocaleString()} of ${simulationCount.toLocaleString()}…` : `Run ${simulationCount.toLocaleString()} simulations`;
    progress.hidden = !running;
    if(running){progress.querySelector('span').textContent = `${completed.toLocaleString()} of ${simulationCount.toLocaleString()} posterior elections complete`; progress.querySelector('b').style.width = `${completed / simulationCount * 100}%`;}
  };

  const startSimulation = () => {
    if(running || !modelData) return;
    running = true; completed = 0; results = null;
    const seed = makeSeed(), random = mulberry32(seed);
    batchState = initializeBatch(random); batchState.seed = seed;
    renderResults(); updateControls();
    const processChunk = () => {
      const stop = Math.min(simulationCount,completed + 25);
      while(completed < stop){simulateElection(batchState); completed++;}
      updateControls();
      if(completed < simulationCount) setTimeout(processChunk,8);
      else {results = finalizeBatch(batchState); running = false; updateControls(); renderResults();}
    };
    setTimeout(processChunk,120);
  };

  const bindControls = () => {
    document.querySelector('#statewide-simulations').addEventListener('change',event => {simulationCount = Number(event.target.value); updateControls();});
    document.querySelector('#statewide-half-life').addEventListener('change',event => {halfLife = Number(event.target.value); results = null; renderResults();});
    document.querySelector('#statewide-calibration').addEventListener('change',event => {calibration = event.target.value; document.querySelector('#calibration-note').textContent = calibrationOptions[calibration].note; results = null; renderResults();});
    document.querySelector('#statewide-cases').addEventListener('change',event => {includeStatewide = event.target.checked; results = null; renderResults();});
    document.querySelector('#run-statewide-model').addEventListener('click',startSimulation);
  };

  const load = async () => {
    appShell(); bindControls(); renderResults();
    try {
      const response = await fetch('../model1-special-elections.json',{cache:'no-store'});
      if(!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      modelData = await response.json();
      buildRaceRows();
      document.querySelector('.statewide-empty strong').textContent = 'Model data loaded. Choose 100 or more elections and run Model 1.';
    } catch(error) {
      document.querySelector('#statewide-output').innerHTML = emptyOutput('The special-election data could not be loaded. Confirm model1-special-elections.json is in the election-simulator folder, then refresh.');
      document.querySelector('#run-statewide-model').disabled = true;
    }
  };

  window.RIPPLStatewide = {
    office,
    modelReady:() => Boolean(modelData),
    getRaceRows:() => raceRows.map(row => ({...row})),
    getResults:() => results,
    run:count => {
      if(Number.isFinite(Number(count))) simulationCount = clamp(Math.round(Number(count)),100,5000);
      startSimulation();
    }
  };

  load();
})();
