let words = [];

fetch('words.json')
  .then(response => response.json())
  .then(data => {
    words = data;
  });

function getTodaysWord() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  return words[dayOfYear % words.length];
}

function openEnvelope() {
  const envelope = document.querySelector('.envelope');
  const flap = document.querySelector('.flap');
  const message = document.getElementById('loveMessage');
  const resetButton = document.getElementById('resetButton');

  if (envelope.classList.contains('open')) return;

  envelope.classList.add('open');
  const flapHeight = flap.offsetHeight;
  flap.style.transform = `rotateX(180deg) translateY(${flapHeight}px)`;

  const wordData = getTodaysWord();
  message.innerHTML = `
    <h2>${wordData.word}</h2>
    <p><strong>Language:</strong> ${wordData.language}</p>
    <p><strong>Meaning:</strong> ${wordData.meaning}</p>
  `;

  resetButton.style.display = 'block';
}

function resetEnvelope() {
  const envelope = document.querySelector('.envelope');
  const flap = document.querySelector('.flap');
  const message = document.getElementById('loveMessage');
  const resetButton = document.getElementById('resetButton');

  envelope.classList.remove('open');
  flap.style.transform = 'rotateX(0deg) translateY(0)';
  message.textContent = 'Click me 🌍';
  resetButton.style.display = 'none';
}
