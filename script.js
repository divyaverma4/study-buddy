let loveMessages = [];

fetch('love_letters.json')
  .then(response => response.json())
  .then(data => {
    loveMessages = data;
  });

function getTodaysMessage() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  return loveMessages[dayOfYear % loveMessages.length];
}



function openEnvelope() {
  const envelope = document.querySelector('.envelope');
  const flap = document.querySelector('.flap');
  const message = document.getElementById('loveMessage');
  const resetButton = document.getElementById('resetButton');

  if (envelope.classList.contains('open')) return;

  envelope.classList.add('open');
  const flapHeight = flap.offsetHeight;
  message.textContent = getTodaysMessage();
  resetButton.style.display = 'block';
}


function resetEnvelope() {
  const envelope = document.querySelector('.envelope');
  const flap = document.querySelector('.flap');
  const message = document.getElementById('loveMessage');
  const resetButton = document.getElementById('resetButton');

  envelope.classList.remove('open');
  flap.style.transform = 'rotateX(0deg) translateY(0)';
  message.textContent = 'Click me for today\'s love letter 💖';
  resetButton.style.display = 'none';
}


