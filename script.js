let words = [];

fetch('words.json')
  .then(response => response.json())
  .then(data => {
    words = data;
    displayWord();
  });

function getTodaysWord() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  return words[dayOfYear % words.length];
}

function displayWord() {
  const wordData = getTodaysWord();
  document.getElementById('cardFront').textContent = wordData.word;
  document.getElementById('cardBack').innerHTML = `
    <p><strong>Language:</strong> ${wordData.language}</p>
    <p><strong>Meaning:</strong> ${wordData.meaning}</p>
  `;
}

function flipCard() {
  const card = document.getElementById('cardInner');
  card.classList.add('flipped');
  document.getElementById('resetButton').style.display = 'block';
}

function unflipCard() {
  const card = document.getElementById('cardInner');
  card.classList.remove('flipped');
  document.getElementById('resetButton').style.display = 'none';
}
