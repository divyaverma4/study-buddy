let loveMessages = [];

fetch("love_letters.json")
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

  envelope.classList.add('open');

  // Get flap height dynamically
  const flapHeight = flap.offsetHeight;

  // Apply rotateX + translateY upward by flap height
  flap.style.transform = `rotateX(180deg) translateY(${flapHeight}px)`;

  message.textContent = getTodaysMessage();
}

