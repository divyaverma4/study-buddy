let currentIndex = 0;
let flipped = false;
let history = [];
let satWords = [];

const PROXY_API_BASE = 'https://words-around-the-world-backend.onrender.com';

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://words-around-the-world-backend.onrender.com"
    : "http://localhost:3001";

// Example WordsAPI call
fetch(`${API_BASE_URL}/api/word/${word}`)
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error("Error:", err));



const wordList = ["abase", "abate", "abdicate", "abduct", "aberration", "abet",
  "abhor", "abide", "abject", "abjure", "abnegation", "abort",
  "abridge", "abrogate", "abscond", "absolution", "abstain",
  "abstruse", "accede", "accentuate", "accessible", "acclaim",
  "accolade", "accommodating", "accord", "accost", "accretion",
  "acerbic", "acquiesce", "acrimony", "acumen", "acute", "adamant",
  "adept", "adhere", "admonish", "adorn", "adroit", "adulation",
  "adumbrate", "adverse", "advocate", "aggrandize", "aggregate",
  "allay", "allege", "alleviate", "allocate", "aloof", "altercation"
];

// Shuffle Array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Fetch word data via proxy with caching
async function fetchWordData(word) {
  const cache = JSON.parse(localStorage.getItem("wordDataCache")) || {};
  if (cache[word]) {
    return cache[word];
  }

  try {
    const res = await fetch(`${PROXY_API_BASE}/api/word/${word}`);
    const data = await res.json();

    const wordObj = {
      word: word,
      definition: data.results?.[0]?.definition || "No definition found."
    };

    cache[word] = wordObj;
    localStorage.setItem("wordDataCache", JSON.stringify(cache));
    return wordObj;
  } catch (err) {
    console.error(`Error fetching data for ${word}:`, err);
    return {
      word: word,
      definition: "Definition unavailable."
    };
  }
}

// Initialize Words (Shuffle + Fetch + Load History)
async function initWords() {
  shuffleArray(wordList); // Shuffle on every load
  const promises = wordList.map(fetchWordData);
  satWords = await Promise.all(promises);

  history = JSON.parse(localStorage.getItem("history")) || [];
  currentIndex = 0;
  displayCard(currentIndex);
  showSimilarWords();
  updateHistoryBox();
}

// Display current word card
function displayCard(index) {
  const wordObj = satWords[index];
  document.getElementById('cardFront').textContent = wordObj.word;
  document.getElementById('cardBack').innerHTML = `
    <strong>${wordObj.word}</strong><br>
    <em>${wordObj.definition}</em><br><br>
  `;
  document.getElementById('cardInner').classList.remove('flipped');
  flipped = false;

  if (!history.includes(wordObj.word)) {
    history.push(wordObj.word);
    localStorage.setItem("history", JSON.stringify(history));
  }
  updateHistoryBox();
}

// Flip Card
function flipCard() {
  const card = document.getElementById('cardInner');
  card.classList.toggle('flipped');
  flipped = !flipped;
}

// Next Card
function showNextCard() {
  currentIndex = (currentIndex + 1) % satWords.length;
  displayCard(currentIndex);
  showSimilarWords();
}

// Toggle Favorite
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

// Update History Box
function updateHistoryBox() {
  const box = document.getElementById("historyBox");
  if (history.length === 0) {
    box.innerHTML = "<em>No words viewed yet.</em>";
    return;
  }
  box.innerHTML = `<strong>Seen Words:</strong><br><ul>${history.map(w => `<li>${w}</li>`).join("")}</ul>`;
}

// Toggle History Button Text and Visibility
function toggleHistory() {
  const box = document.getElementById("historyBox");
  const btn = document.getElementById("toggleHistoryBtn");

  if (box.style.display === "none" || box.style.display === "") {
    box.style.display = "block";
    btn.textContent = "Close History";
  } else {
    box.style.display = "none";
    btn.textContent = "Show History";
  }
}

// Optional: Shuffle & Restart Button
function reshuffleAndRestart() {
  shuffleArray(satWords);
  currentIndex = 0;
  history = [];
  localStorage.setItem("history", JSON.stringify(history));
  displayCard(currentIndex);
  updateHistoryBox();
}

// Placeholder for similar words logic
function showSimilarWords() {
  // Implement your similar words logic here.
}

// Quiz Functions (unchanged)
function getQuizPool() {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  let pool = [...favorites];

  favorites.forEach(word => {
    const similar = getSimilarWords(word);
    pool = pool.concat(similar);
  });

  pool = [...new Set(pool)];
  return pool;
}

async function fetchQuizQuestion(word) {
  try {
    const res = await fetch(`${PROXY_API_BASE}/api/quiz/${word}`);
    if (!res.ok) throw new Error(`Failed to fetch quiz for ${word}: ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error("Error fetching quiz question:", error);
    return null;
  }
}

async function startQuiz() {
  const pool = getQuizPool();
  if (pool.length === 0) {
    alert("No favorited words to quiz on.");
    return;
  }

  const randomWord = pool[Math.floor(Math.random() * pool.length)];
  const quiz = await fetchQuizQuestion(randomWord);

  if (!quiz) {
    alert("Failed to load quiz question.");
    return;
  }

  renderQuizQuestion(quiz);
}

function renderQuizQuestion(quiz) {
  const quizContainer = document.getElementById('quizContainer');
  quizContainer.innerHTML = `
    <div class="quiz-question">${quiz.question}</div>
    <div class="quiz-options">
      ${Object.entries(quiz.options).map(([letter, option]) => `
        <button onclick="checkAnswer('${letter}', '${quiz.correctAnswer}')">${letter}: ${option}</button>
      `).join('')}
    </div>
  `;
}

function checkAnswer(selected, correct) {
  if (selected === correct) {
    alert("✅ Correct!");
  } else {
    alert(`❌ Incorrect. The correct answer is ${correct}.`);
  }
}

function showQuizSection() {
  document.getElementById('quizSection').style.display = 'block';
  document.getElementById('practiceQuizBtn').style.display = 'none';
  startQuiz();
}

function exitQuiz() {
  document.getElementById('quizSection').style.display = 'none';
  document.getElementById('practiceQuizBtn').style.display = 'inline-block';
}

// Initialize on Load
window.onload = () => {
  initWords();
};

