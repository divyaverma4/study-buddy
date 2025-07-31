// TODO: DO NOT HARDCODE BEARER TOKEN. INSTEAD, MAKE SECURE PROXY BACKEND
// https://chatgpt.com/share/688bbeee-7738-8004-8c0b-25801a8bbfcf

let words = [];
let currentWord = "";


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
  currentWord = wordData.word;
  document.getElementById('cardFront').textContent = wordData.word;
  document.getElementById('cardBack').innerHTML = `
    <p><strong>Language:</strong> ${wordData.language}</p>
    <p><strong>Meaning:</strong> ${wordData.meaning}</p>
    <button onclick="pronounceWord('${wordData.word}', '${wordData.language}')" class="speak-btn">🔊 Pronounce</button>
    <button onclick="toggleFavorite('${wordData.language}')" class="favorite-btn">⭐ Favorite ${wordData.language}</button>
  `;

  saveToHistory(wordData);
}

function showNewWord(word) {
  const found = words.find(w => w.word.toLowerCase() === word.toLowerCase());
  if (found) {
    document.getElementById('cardFront').textContent = found.word;
    document.getElementById('cardBack').innerHTML = `
      <p><strong>Language:</strong> ${found.language}</p>
      <p><strong>Meaning:</strong> ${found.meaning}</p>
      <button onclick="pronounceWord('${found.word}', '${found.language}')" class="speak-btn">🔊 Pronounce</button>
      <button onclick="toggleFavorite('${found.language}')" class="favorite-btn">⭐ Favorite ${found.language}</button>
    `;
    currentWord = found.word;
    saveToHistory(found);
    unflipCard();
  } else {
    alert("Suggested word not found in your list.");
  }
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

async function suggestSimilarWords() {
  const similarWordsDiv = document.getElementById("similarWords");
  similarWordsDiv.innerHTML = "Loading suggestions...";

  const prompt = `Give me 5 vocabulary words similar to "${currentWord}" in meaning or theme. Just return a comma-separated list.`;

  try {
    const response = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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"
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 60,
        temperature: 0.7
      })
    });

    const data = await response.json();
    const words = data.choices[0].text.trim().split(/,\s*/);

    similarWordsDiv.innerHTML = "";
    words.forEach(word => {
      const card = document.createElement("div");
      card.className = "word-card";
      card.textContent = word;
      card.onclick = () => showNewWord(word);
      similarWordsDiv.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    similarWordsDiv.innerHTML = "Error fetching suggestions.";
  }
}

