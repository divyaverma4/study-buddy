// script.js

let currentIndex = 0;
let flipped = false;
let history = [];
let satWords = [];

const PROXY_API_BASE = 'https://words-around-the-world-backend.onrender.com'; // <-- Replace with your Render proxy URL
const wordList = ["ephemeral", "loquacious", "ubiquitous"]; // Add more words here if you want

// Fetch word data via your proxy, with caching in localStorage
async function fetchWordData(word) {
  const cache = JSON.parse(localStorage.getItem("wordDataCache")) || {};
  if (cache[word]) {
    return cache[word];
  }

  try {
    const res = await fetch(`${PROXY_API_BASE}/${word}`);
    const data = await res.json();

    const wordObj = {
      word: word,
      definition: data.results?.[0]?.definition || "No definition found.",
      sentence: data.results?.[0]?.examples?.[0] || "No example found."
    };

    cache[word] = wordObj;
    localStorage.setItem("wordDataCache", JSON.stringify(cache));
    return wordObj;
  } catch (err) {
    console.error(`Error fetching data for ${word}:`, err);
    return {
      word: word,
      definition: "Definition unavailable.",
      sentence: "Example unavailable."
    };
  }
}

// Initialize all words data
async function initWords() {
  const promises = wordList.map(fetchWordData);
  satWords = await Promise.all(promises);
  history = JSON.parse(localStorage.getItem("history")) || [];
  displayCard(currentIndex);
  showSimilarWords();
  updateHistoryBox();
}

// Show the current card content
function displayCard(index) {
  const wordObj = satWords[index];
  document.getElementById('cardFront').textContent = wordObj.word;
  document.getElementById('cardBack').innerHTML = `
    <strong>${wordObj.word}</strong><br>
    <em>${wordObj.definition}</em><br><br>
    <span>"${wordObj.sentence}"</span>
  `;
  document.getElementById('cardInner').classList.remove('flipped');
  flipped = false;

  // Update history
  if (!history.includes(wordObj.word)) {
    history.push(wordObj.word);
    localStorage.setItem("history", JSON.stringify(history));
  }
  updateHistoryBox();
}

// Flip the card front/back
function flipCard() {
  const card = document.getElementById('cardInner');
  card.classList.toggle('flipped');
  flipped = !flipped;
}

// Show next word card
function showNextCard() {
  currentIndex = (currentIndex + 1) % satWords.length;
  displayCard(currentIndex);
  showSimilarWords();
}

// Add or remove favorite
function toggleFavorite() {
  const word = satWords[currentIndex].word;
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (!favorites.includes(word)) {
    favorites.push(word);
    alert(`⭐ ${word} added to favorites!`);
  } else {
    alert(`${word} is already in favorites.`);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  showSimilarWords();
}

// Simple AI-simulated similar words
function getSimilarWords(word) {
  const aiSynonyms = {
    "loquacious": ["chatty", "garrulous", "verbose"],
    "ephemeral": ["brief", "transient", "fleeting"],
    "ubiquitous": ["everywhere", "omnipresent", "pervasive"]
  };
  return aiSynonyms[word.toLowerCase()] || [];
}

// Display similar words container
function showSimilarWords() {
  const word = satWords[currentIndex].word;
  const similar = getSimilarWords(word);
  const container = document.getElementById("similarWords");
  container.innerHTML = similar.length
    ? similar.map(w => `<div class="word-card">${w}</div>`).join("")
    : "<em>No similar words found.</em>";
}

// Update the history box content
function updateHistoryBox() {
  const box = document.getElementById("historyBox");
  if (history.length === 0) {
    box.innerHTML = "<em>No words viewed yet.</em>";
    return;
  }
  box.innerHTML = `<strong>Seen Words:</strong><br><ul>${history.map(w => `<li>${w}</li>`).join("")}</ul>`;
}

// Toggle history box visibility
function toggleHistory() {
  const box = document.getElementById("historyBox");
  box.style.display = box.style.display === "none" ? "block" : "none";
}

// Initialize app on page load
window.onload = () => {
  initWords();

  // Optional: hook flipCard to card click (if not already in your HTML)
  const flashcard = document.querySelector('.flashcard');
  if (flashcard) {
    flashcard.addEventListener('click', flipCard);
  }
};
