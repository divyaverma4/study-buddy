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
    <button onclick="pronounceWord('${wordData.word}', '${wordData.language}')" class="speak-btn">🔊 Pronounce</button>
    <button onclick="toggleFavorite('${wordData.language}')" class="favorite-btn">⭐ Favorite ${wordData.language}</button>
  `;

  saveToHistory(wordData);
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

function pronounceWord(word, language) {
  const utterance = new SpeechSynthesisUtterance(word);

  const langMap = {
    French: 'fr-FR',
    Japanese: 'ja-JP',
    Spanish: 'es-ES',
    German: 'de-DE',
    Korean: 'ko-KR',
    Russian: 'ru-RU',
    Italian: 'it-IT',
    Arabic: 'ar-SA',
    Hindi: 'hi-IN'
  };

  if (langMap[language]) {
    utterance.lang = langMap[language];
  }

  speechSynthesis.speak(utterance);
}

function toggleFavorite(language) {
  const favorites = JSON.parse(localStorage.getItem('favoriteLanguages')) || [];

  const index = favorites.indexOf(language);
  if (index === -1) {
    favorites.push(language);
    alert(`${language} added to favorites!`);
  } else {
    favorites.splice(index, 1);
    alert(`${language} removed from favorites.`);
  }

  localStorage.setItem('favoriteLanguages', JSON.stringify(favorites));
}

function saveToHistory(wordData) {
  const history = JSON.parse(localStorage.getItem('wordHistory')) || [];

  // Only add if not already saved
  const alreadyExists = history.some(item => item.word === wordData.word && item.language === wordData.language);
  if (!alreadyExists) {
    history.push(wordData);
    localStorage.setItem('wordHistory', JSON.stringify(history));
  }
}

function showHistory() {
  const container = document.getElementById('historyContainer');
  const history = JSON.parse(localStorage.getItem('wordHistory')) || [];

  if (history.length === 0) {
    container.innerHTML = "<p>No words seen yet.</p>";
  } else {
    container.innerHTML = `<h3>Word History</h3><ul>${
      history.map(word => `<li><strong>${word.word}</strong> (${word.language}): ${word.meaning}</li>`).join('')
    }</ul>`;
  }

  container.style.display = 'block';

  document.getElementById('closeHistoryButton').style.display = 'inline-block';
  document.getElementById('clearHistoryButton').style.display = 'inline-block';
  document.getElementById('clearFavoritesButton').style.display = 'none';
}

function showFavorites() {
  const container = document.getElementById('historyContainer');
  const history = JSON.parse(localStorage.getItem('wordHistory')) || [];
  const favorites = JSON.parse(localStorage.getItem('favoriteLanguages')) || [];

  const filtered = history.filter(word => favorites.includes(word.language));

  if (filtered.length === 0) {
    container.innerHTML = "<p>No words from your favorite languages yet.</p>";
  } else {
    container.innerHTML = `<h3>Favorite Language Words</h3><ul>${
      filtered.map(word => `<li><strong>${word.word}</strong> (${word.language}): ${word.meaning}</li>`).join('')
    }</ul>`;
  }

  container.style.display = 'block';

  document.getElementById('closeHistoryButton').style.display = 'inline-block';
  document.getElementById('clearHistoryButton').style.display = 'none';
  document.getElementById('clearFavoritesButton').style.display = 'inline-block';
}

function closeHistory() {
  document.getElementById('historyContainer').style.display = 'none';

  // Hide close and clear buttons
  document.getElementById('closeHistoryButton').style.display = 'none';
  document.getElementById('clearHistoryButton').style.display = 'none';
  document.getElementById('clearFavoritesButton').style.display = 'none';
}

function clearHistory() {
  if (confirm('Are you sure you want to clear your word history?')) {
    localStorage.removeItem('wordHistory');
    closeHistory();
    alert('Word history cleared.');
  }
}

function clearFavorites() {
  if (confirm('Are you sure you want to clear your favorite languages?')) {
    localStorage.removeItem('favoriteLanguages');
    closeHistory();
    alert('Favorite languages cleared.');
  }
}
