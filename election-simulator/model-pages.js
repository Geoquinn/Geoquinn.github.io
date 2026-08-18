const modelConfigs = {
  overview: {
    eyebrow: 'National midterm environment',
    title: 'The 2026 national model.',
    deck: 'A transparent framework for combining electoral behavior, turnout intensity, presidential approval, and longitudinal public opinion before translating the national climate into race-level forecasts.',
    unit: 'National political environment',
    geography: 'Nation → state → district',
    baseline: '2024 results and prior midterms',
    outputTitle: 'National environment index',
    outputs: ['Estimated national House vote environment', 'Presidential-party penalty or advantage', 'Turnout intensity by party', 'Uncertainty and indicator sensitivity']
  },
  house: {
    eyebrow: 'U.S. House forecast',
    title: 'Model every district.',
    deck: 'A district-by-district simulation workspace designed to turn the national midterm environment into seat probabilities, a chamber range, and a transparent path to the majority.',
    unit: 'Congressional district',
    geography: '435 House districts',
    baseline: '2024 presidential and House vote',
    outputTitle: 'House control simulation',
    outputs: ['District win probabilities', 'Expected Democratic and Republican seats', 'Majority-control probability', 'Tipping-point district and seat range']
  },
  senate: {
    eyebrow: 'U.S. Senate forecast',
    title: 'Model every Senate contest.',
    deck: 'A state-by-state simulation workspace for combining the national environment with incumbency, candidate strength, state partisanship, and the smaller universe of competitive races.',
    unit: 'Senate contest',
    geography: 'States with 2026 races',
    baseline: '2024 presidential and recent Senate vote',
    outputTitle: 'Senate control simulation',
    outputs: ['Race-level win probabilities', 'Expected Democratic and Republican seats', 'Majority-control probability', 'Most likely tipping-point state']
  },
  governors: {
    eyebrow: 'Governor forecast',
    title: 'Model every governor race.',
    deck: 'A nationwide state-level workspace that combines the shared midterm environment with incumbency, candidate crossover, state political conditions, and election-specific turnout.',
    unit: 'Governor contest',
    geography: 'States with 2026 elections',
    baseline: '2024 presidential and recent governor vote',
    outputTitle: 'Governor race simulation',
    outputs: ['State-level win probabilities', 'Projected party control by state', 'Competitive-race ranking', 'Candidate and turnout sensitivity']
  }
};

const indicators = [
  ['01', 'Special & off-year elections', 'Observed vote', 'Measure party overperformance against recent presidential and legislative baselines, with greater weight on newer contests.'],
  ['02', 'Primary election turnout', 'Enthusiasm', 'Compare participation, partisan composition, registration, and contestedness to estimate mobilization before November.'],
  ['03', 'Presidential approval', 'National climate', "Translate approval, disapproval, and intensity into the historical midterm environment facing the president's party."],
  ['04', 'ANES panel opinion data', 'Voter movement', 'Use repeated interviews to observe durable attitude change, issue priorities, partisan mobility, and likely coalition shifts.']
];

const offices = [
  ['overview', 'Overview', '../national-model/'],
  ['house', 'House', '../house/'],
  ['senate', 'Senate', '../senate/'],
  ['governors', 'Governors', '../governors/']
];

const active = document.body.dataset.model;
const config = modelConfigs[active] || modelConfigs.overview;
const root = document.querySelector('#model-root');

root.innerHTML = `
  <a class="skip-link" href="#model-main">Skip to main content</a>
  <header class="site-header">
    <a class="brand" href="../" aria-label="Election Simulator home"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span><span><strong>Election</strong> Simulator</span></a>
    <nav aria-label="Primary navigation"><a href="../national-model/">National model</a><a href="../house/">House</a><a href="../senate/">Senate</a><a href="../governors/">Governors</a><a href="https://george-quinn.com/">George Quinn</a></nav>
  </header>
  <div class="model-subnav" aria-label="Forecast model pages"><span>2026 National Forecast</span><div>${offices.map(([key,label,href]) => `<a class="${active === key ? 'active' : ''}" href="${href}">${label}</a>`).join('')}</div></div>
  <section class="model-hero" id="model-main">
    <div class="hero-grid" aria-hidden="true"></div>
    <div class="model-hero-copy"><p class="kicker"><span>Framework stage</span>${config.eyebrow}</p><h1>${config.title}</h1><p>${config.deck}</p><div class="model-hero-meta"><span>Unit: ${config.unit}</span><span>Geography: ${config.geography}</span><span>Cycle: 2026</span></div></div>
    <aside class="framework-status" aria-label="Model development status"><div class="board-topline"><span>Model status</span><span class="pulse">Pages ready</span></div><strong>4</strong><p>national indicators reserved in the model architecture</p><div class="status-rule"><span>Data ingestion</span><b>Next</b></div><div class="status-rule"><span>Weight calibration</span><b>Next</b></div><div class="status-rule"><span>Simulation engine</span><b>Planned</b></div></aside>
  </section>
  <section class="model-page-section indicator-section"><div class="model-section-title"><div><p class="section-index">01 / Shared national inputs</p><h2>Four signals,<br>kept visible.</h2></div><p>Each input will be estimated independently before weights are calibrated. That keeps the model explainable and makes it possible to test how much each signal changes the forecast.</p></div><div class="indicator-grid">${indicators.map(([number,title,short,description]) => `<article><div class="indicator-top"><span>${number}</span><b>${short}</b></div><h3>${title}</h3><p>${description}</p><div class="data-state"><i></i>Data connection pending</div></article>`).join('')}</div></section>
  <section class="model-page-section architecture-section"><div class="model-section-title"><div><p class="section-index">02 / Model architecture</p><h2>From signal<br>to forecast.</h2></div><p>The office-specific model will add structural fundamentals after the national environment is calculated. No weights or probabilities are displayed until the underlying data and validation rules are set.</p></div><div class="architecture-flow" aria-label="Planned model sequence"><article><span>1</span><small>Baseline</small><strong>${config.baseline}</strong></article><b>→</b><article><span>2</span><small>National layer</small><strong>Four indicators</strong></article><b>→</b><article><span>3</span><small>Geographic layer</small><strong>${config.geography}</strong></article><b>→</b><article><span>4</span><small>Simulation</small><strong>${config.outputTitle}</strong></article></div></section>
  <section class="model-page-section workspace-section"><div class="workspace-shell"><div class="workspace-copy"><p class="section-index">03 / Reserved workspace</p><h2>${config.outputTitle}</h2><p>This is the home for the interactive model. Controls, uncertainty intervals, maps, and downloadable results will be added here as the four inputs are specified.</p><span class="stage-chip">Structure complete · model pending</span></div><div class="workspace-output"><div class="workspace-head"><span>Planned outputs</span><span>Not yet estimated</span></div>${config.outputs.map((output,index) => `<div class="output-row"><span>${String(index + 1).padStart(2,'0')}</span><strong>${output}</strong><i></i></div>`).join('')}</div></div></section>
  <section class="next-models"><p>Move between model workspaces</p><div>${offices.filter(([key]) => key !== active).map(([,label,href]) => `<a href="${href}">${label}<span>↗</span></a>`).join('')}</div></section>
  <footer><div><a class="footer-brand" href="../">Election Simulator</a><p>Transparent election scenarios by George D. Quinn.</p></div><div class="footer-links"><a href="../national-model/">National model</a><a href="../#florida-model">Florida lab</a><a href="https://george-quinn.com/">Academic site</a></div><div class="footer-meta"><span>george-quinn.com</span><span>2026 model framework</span></div></footer>
`;
