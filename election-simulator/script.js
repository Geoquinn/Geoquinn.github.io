const slider = document.querySelector('#swing-slider');
const swingOutput = document.querySelector('#swing-output');
const result = document.querySelector('#projected-result');
const turnoutOutput = document.querySelector('#projected-turnout');
const jollyVotes = document.querySelector('#jolly-votes');
const donaldsVotes = document.querySelector('#donalds-votes');
const standardButton = document.querySelector('#standard-turnout');
const highButton = document.querySelector('#high-turnout');
const resetButton = document.querySelector('#reset-model');
const heroBalance = document.querySelector('#hero-balance');

let turnoutMode = 'high';

function updateModel() {
  const swing = Number(slider.value);
  const margin = -13.1 + swing;
  const other = 1.1;
  const jolly = (100 - other + margin) / 2;
  const donalds = 100 - other - jolly;
  const turnout = turnoutMode === 'high' ? 10.49 : 9.82;
  const leader = margin >= 0 ? 'Jolly' : 'Donalds';

  swingOutput.textContent = `${swing.toFixed(1)} pts`;
  result.textContent = `${leader} +${Math.abs(margin).toFixed(1)}`;
  result.className = leader === 'Jolly' ? 'dem-text' : 'gop-text';
  turnoutOutput.textContent = `${turnout.toFixed(2)}M`;
  jollyVotes.textContent = `${(turnout * jolly / 100).toFixed(2)}M votes`;
  donaldsVotes.textContent = `${(turnout * donalds / 100).toFixed(2)}M votes`;
  document.querySelectorAll('[data-jolly-share]').forEach((node) => node.textContent = `${jolly.toFixed(1)}%`);
  document.querySelectorAll('[data-donalds-share]').forEach((node) => node.textContent = `${donalds.toFixed(1)}%`);
  heroBalance.children[0].style.width = `${jolly}%`;
  heroBalance.children[1].style.width = `${other}%`;
  heroBalance.children[2].style.width = `${donalds}%`;
  heroBalance.setAttribute('aria-label', `Jolly ${jolly.toFixed(1)} percent, Donalds ${donalds.toFixed(1)} percent`);
  slider.style.setProperty('--progress', `${((swing - 4) / 16) * 100}%`);
}

slider.addEventListener('input', updateModel);
standardButton.addEventListener('click', () => { turnoutMode = 'standard'; standardButton.classList.add('active'); highButton.classList.remove('active'); updateModel(); });
highButton.addEventListener('click', () => { turnoutMode = 'high'; highButton.classList.add('active'); standardButton.classList.remove('active'); updateModel(); });
resetButton.addEventListener('click', () => { slider.value = '15.2'; turnoutMode = 'high'; highButton.classList.add('active'); standardButton.classList.remove('active'); updateModel(); });
updateModel();
