let currentIndex = 0;
let flipped = false;
let history = [];
let satWords = [];

const PROXY_API_BASE = 'https://words-around-the-world-backend.onrender.com';

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
  console.log("[DEBUG] Shuffling array...");
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Fetch word data via proxy with caching
async function fetchWordData(word) {
  const cache = JSON.parse(localStorage.getItem("wordDataCache")) || {};
  if (cache[word]) {
    console.log(`[CACHE HIT] Returning cached data for "${word}"`);
    return cache[word];
  } else {
    console.log(`[CACHE MISS] No cached data for "${word}", fetching from API...`);
  }

  try {
    const res = await fetch(`${PROXY_API_BASE}/api/word/${word}`);
    if (!res.ok) {
      console.error(`[FETCH ERROR] Failed to fetch "${word}", status: ${res.status}`);
      return { word, definition: "Definition unavailable due to fetch error." };
    }
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      console.warn(`[FETCH WARNING] No definition found for "${word}" in API response`);
      return { word, definition: "No definition found." };
    }

    const wordObj = {
      word,
      definition: data.results[0].definition,
    };

    // Cache the fetched word object
    cache[word] = wordObj;
    localStorage.setItem("wordDataCache", JSON.stringify(cache));
    console.log(`[FETCH SUCCESS] Cached definition for "${word}"`);
    return wordObj;
  } catch (err) {
    console.error(`[FETCH EXCEPTION] Exception fetching "${word}":`, err);
    return {
      word,
      definition: "Definition unavailable due to network or server error.",
    };
  }
}

async function initWords() {
  console.log("[INIT] Fetching SAT/ACT vocab list from API...");
  try {
    // Step 1: Fetch the word list from your server
    const listRes = await fetch(`${PROXY_API_BASE}/api/vocab-list`);
    if (!listRes.ok) {
      throw new Error(`Failed to fetch vocab list, status: ${listRes.status}`);
    }
    const listData = await listRes.json();
    const wordsFromAPI = listData.words;
    if (!Array.isArray(wordsFromAPI) || wordsFromAPI.length === 0) {
      throw new Error("Received empty or invalid word list from API");
    }
    console.log(`[INIT] Received ${wordsFromAPI.length} words from API.`);

    // Step 2: Shuffle the list
    shuffleArray(wordsFromAPI);

    // Step 3: Fetch definitions for each word (with caching)
    const promises = wordsFromAPI.map(fetchWordData);
    satWords = await Promise.all(promises);
    console.log(`[INIT] Word definitions fetched, total: ${satWords.length}`);

  } catch (e) {
    console.error("[ERROR] initWords failed:", e);
    satWords = [];
  }

  history = JSON.parse(localStorage.getItem("history")) || [];
  currentIndex = 0;

  if (satWords.length > 0) {
    displayCard(currentIndex);
    showSimilarWords();
  } else {
    console.warn("[WARNING] No words fetched, showing fallback card");
    displayFallbackCard();
  }
  updateHistoryBox();
}


// Display current word card
function displayCard(index) {
  console.log(`[DISPLAY] Showing card index: ${index}`);
  if (!satWords || satWords.length === 0) {
    console.warn("[DISPLAY] No words loaded yet.");
    return;
  }
  if (index < 0 || index >= satWords.length) {
    console.warn(`[DISPLAY] Index out of range: ${index}`);
    return;
  }
  const wordObj = satWords[index];
  if (!wordObj) {
    console.warn("[DISPLAY] Word object is undefined at index", index);
    return;
  }

  const frontEl = document.getElementById('cardFront');
  const backEl = document.getElementById('cardBack');
  const innerEl = document.getElementById('cardInner');

  if (!frontEl || !backEl || !innerEl) {
    console.error("[DISPLAY] Required DOM elements missing (cardFront, cardBack, cardInner)");
    return;
  }

  frontEl.textContent = wordObj.word;
  backEl.innerHTML = `<strong>${wordObj.word}</strong><br><em>${wordObj.definition || "Definition unavailable."}</em><br><br>`;
  innerEl.classList.remove('flipped');
  flipped = false;

  if (!history.includes(wordObj.word)) {
    history.push(wordObj.word);
    localStorage.setItem("history", JSON.stringify(history));
  }
  updateHistoryBox();
}

// Fallback card if no words loaded
function displayFallbackCard() {
  const frontEl = document.getElementById('cardFront');
  const backEl = document.getElementById('cardBack');
  if (frontEl && backEl) {
    frontEl.textContent = "Test Word";
    backEl.textContent = "This is a fallback test definition.";
  }
}

// Flip Card
function flipCard() {
  const card = document.getElementById('cardInner');
  if (!card) {
    console.error("[FLIP] cardInner element not found");
    return;
  }
  card.classList.toggle('flipped');
  flipped = !flipped;
  console.log(`[FLIP] Card flipped? ${flipped}`);
}

// Next Card
function showNextCard() {
  if (!satWords || satWords.length === 0) {
    console.warn("[NEXT] No words available to show next.");
    return;
  }
  currentIndex = (currentIndex + 1) % satWords.length;
  console.log(`[NEXT] Showing next card: index ${currentIndex}`);
  displayCard(currentIndex);
  showSimilarWords();
}

// Toggle Favorite
function toggleFavorite() {
  const word = satWords[currentIndex]?.word;
  if (!word) {
    alert("No word selected!");
    console.warn("[FAVORITE] No word at current index");
    return;
  }
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (!favorites.includes(word)) {
    favorites.push(word);
    alert(`⭐ ${word} added to favorites!`);
    console.log(`[FAVORITE] Added ${word} to favorites`);
  } else {
    alert(`${word} is already in favorites.`);
    console.log(`[FAVORITE] ${word} already in favorites`);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  showSimilarWords();
}

// Update History Box
function updateHistoryBox() {
  const box = document.getElementById("historyBox");
  if (!box) {
    console.warn("[HISTORY] historyBox element not found");
    return;
  }
  if (history.length === 0) {
    box.innerHTML = "<em>No words viewed yet.</em>";
    return;
  }
  box.innerHTML = `<strong>Seen Words:</strong><br><ul>${history.map(w => `<li>${w}</li>`).join("")}</ul>`;
  console.log(`[HISTORY] Updated history box with ${history.length} words`);
}

// Toggle History Button Text and Visibility
function toggleHistory() {
  const box = document.getElementById("historyBox");
  const btn = document.getElementById("toggleHistoryBtn");

  if (!box || !btn) {
    console.warn("[TOGGLE HISTORY] Elements missing");
    return;
  }

  if (box.style.display === "none" || box.style.display === "") {
    box.style.display = "block";
    btn.textContent = "Close History";
    console.log("[TOGGLE HISTORY] History shown");
  } else {
    box.style.display = "none";
    btn.textContent = "Show History";
    console.log("[TOGGLE HISTORY] History hidden");
  }
}

// Placeholder for similar words
function showSimilarWords() {
  // Implement your logic here or leave empty for now
}

// Quiz-related functions (just stubs here)
function showQuizSection() {
  document.getElementById('quizSection').style.display = 'block';
  document.getElementById('practiceQuizBtn').style.display = 'none';
  // Implement your quiz start logic here if needed
}

function startQuiz() {
  // Your existing quiz start logic here
  console.log("Starting quiz (not implemented here)");
}

function exitQuiz() {
  document.getElementById('quizSection').style.display = 'none';
  document.getElementById('practiceQuizBtn').style.display = 'inline-block';
}

// --- Export functions globally for inline onclick handlers ---
window.toggleFavorite = toggleFavorite;
window.toggleHistory = toggleHistory;
window.showQuizSection = showQuizSection;
window.flipCard = flipCard;
window.showNextCard = showNextCard;
window.startQuiz = startQuiz;
window.exitQuiz = exitQuiz;

// Initialize on Load
window.onload = async () => {
  console.log("[WINDOW LOAD] Starting app initialization...");
  try {
    await initWords();
    console.log("[WINDOW LOAD] Initialization complete");
  } catch (e) {
    console.error("[WINDOW LOAD] initWords failed, showing fallback card", e);
    displayFallbackCard();
  }
};
