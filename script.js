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

function showTab(tabId) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  event.target.classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

// (Your existing openEnvelope function stays the same)


function openEnvelope() {
  const envelope = document.querySelector('.envelope');
  const flap = document.querySelector('.flap');
  const message = document.getElementById('loveMessage');

  envelope.classList.add('open');

  // Get flap height dynamically
  const flapHeight = flap.offsetHeight;

  // Apply rotateX + translateY upward by flap height
  flap.style.transform = `rotateX(180deg) translateY(${flapHeight}px)`;

  message.textContent = getTodaysMessage();
}

