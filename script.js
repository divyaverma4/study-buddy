// TODO: FIX CALL TO API SO THAT IT HITS PROPERLY
// INTEGRATE AI SOMEHOW

let currentIndex = 0;
let flipped = false;
let history = [];

const apiKey = WORDS_API_KEY; // Replace with your actual key
const wordList = ["ephemeral", "loquacious", "ubiquitous"]; // Expand this as needed
let satWords = [];

async function fetchWordData(word) {
  const cached = JSON.parse(localStorage.getItem("wordDataCache")) || {};
  if (cached[word]) {
    return cached[word];
  }

  try {
    const res = await fetch(`https://wordsapiv1.p.rapidapi.com/words/${word}`, {
      method: "GET",
      headers: {
        "X-RapidAPI-Host": "wordsapiv1.p.rapidapi.com",
        "X-RapidAPI-Key": apiKey
      }
    });
    const data = await res.json();
    const wordObj = {
      word: word,
      definition: data.results?.[0]?.definition || "No definition found.",
      sentence: data.results?.[0]?.examples?.[0] || "No example found."
    };
    cached[word] = wordObj;
    localStorage.setItem("wordDataCache", JSON.stringify(cached));
    return wordObj;
  } catch (e) {
    return {
      word: word,
      definition: "Definition unavailable.",
      sentence: "Example unavailable."
    };
  }
}

async function initWords() {
  const promises = wordList.map(fetchWordData);
  satWords = await Promise.all(promises);
  history = JSON.parse(localStorage.getItem("history")) || [];
  displayCard(currentIndex);
}

initWords();





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

  // Add to history if not already included
  if (!history.includes(wordObj.word)) {
    history.push(wordObj.word);
    localStorage.setItem("history", JSON.stringify(history));
  }
  updateHistoryBox();
}

function flipCard() {
  const card = document.getElementById('cardInner');
  card.classList.toggle('flipped');
  flipped = !flipped;
}

function showNextCard() {
  currentIndex = (currentIndex + 1) % satWords.length;
  displayCard(currentIndex);
  showSimilarWords();
}

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

function getSimilarWords(word) {
  //const aiSynonyms = {
  //  "Loquacious": ["chatty", "garrulous", "verbose"],
  //  "Ephemeral": ["brief", "transient", "fleeting"],
  //  "Ubiquitous": ["everywhere", "omnipresent", "pervasive"]
  //};
  //return aiSynonyms[word] || [];
}

function showSimilarWords() {
  const word = satWords[currentIndex].word;
  const similar = getSimilarWords(word);
  const container = document.getElementById("similarWords");
  container.innerHTML = similar.map(w => `<div class="word-card">${w}</div>`).join("");
}

function updateHistoryBox() {
  const box = document.getElementById("historyBox");
  const stored = JSON.parse(localStorage.getItem("history")) || [];
  box.innerHTML = `<strong>Seen Words:</strong><br><ul>${stored.map(w => `<li>${w}</li>`).join("")}</ul>`;
}

function toggleHistory() {
  const box = document.getElementById("historyBox");
  box.style.display = box.style.display === "none" ? "block" : "none";
}

// Initialize
history = JSON.parse(localStorage.getItem("history")) || [];
displayCard(currentIndex);
