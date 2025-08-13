// TODO
// add subtitle like "your favorite ai flashcard assistant"
// add hover popups to show history and ai practice quiz buttons for small descriptions
// add previous card button with functionality, and put this directly to the left of the next card button
// when history list is shown, have the words clickable. when the user clicks on a certain word in the history list, the flashcard flips to that word
// finetune style 

let currentIndex = 0;
let flipped = false;
let history = [];
let satWords = [];

const PROXY_API_BASE = 'https://words-around-the-world-backend.onrender.com';

let quizWords = [];
let currentQuizIndex = 0;
let currentQuizData = null;

window.onload = async () => {
  await initWords();

  // Grab elements inside onload
  const favoriteBtn = document.getElementById('favoriteBtn');
  const toggleHistoryBtn = document.getElementById('toggleHistoryBtn');
  const practiceQuizBtn = document.getElementById('practiceQuizBtn');
  const flashcard = document.getElementById('flashcard');
  const nextBtn = document.getElementById('nextBtn');
  const nextQuizBtn = document.getElementById('next-quiz-btn');
  const exitQuizBtn = document.getElementById('exit-quiz-btn');

  // Quiz elements
  window.quizOverlay = document.getElementById('quizOverlay');
  window.quizSection = document.getElementById('quizSection');
  window.quizQuestionEl = document.getElementById('quiz-question');
  window.quizOptionsEl = document.getElementById('quiz-options');
  window.quizFeedbackEl = document.getElementById('quiz-feedback');
  window.loadingScreen = document.getElementById('quiz-loading');
  window.nextQuizBtn = nextQuizBtn;

  if (favoriteBtn) favoriteBtn.addEventListener('click', toggleFavorite);
  if (toggleHistoryBtn) toggleHistoryBtn.addEventListener('click', toggleHistory);
  if (practiceQuizBtn) practiceQuizBtn.addEventListener('click', startQuizFromHistory);
  if (flashcard) flashcard.addEventListener('click', flipCard);
  if (nextBtn) nextBtn.addEventListener('click', showNextCard);
  if (nextQuizBtn) nextQuizBtn.addEventListener('click', nextQuizQuestion);
  if (exitQuizBtn) exitQuizBtn.addEventListener('click', exitQuiz);

  const prevBtn = document.getElementById('prevBtn');
if (prevBtn) prevBtn.addEventListener('click', showPreviousCard);

  hideQuizSection();
};

// Shuffle array in-place
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function showQuizSection() {
  if (window.quizOverlay) window.quizOverlay.style.display = "flex";
}

function hideQuizSection() {
  if (window.quizOverlay) window.quizOverlay.style.display = "none";
}

function showPreviousCard() {
  if (!satWords || satWords.length === 0) {
    console.warn("[PREV] No words available to show previous.");
    return;
  }
  currentIndex = (currentIndex - 1 + satWords.length) % satWords.length;
  console.log(`[PREV] Showing previous card: index ${currentIndex}`);
  displayCard(currentIndex);
  // Optional: showSimilarWords();
}


function exitQuiz() {
  hideQuizSection();
  quizWords = [];
  currentQuizIndex = 0;
  currentQuizData = null;
  if (window.nextQuizBtn) window.nextQuizBtn.style.display = "inline-block";
  if (window.quizFeedbackEl) window.quizFeedbackEl.textContent = "";
}

// Start quiz from viewed words history
async function startQuizFromHistory() {
  if (!Array.isArray(history) || history.length === 0) {
    alert("No words in history to quiz!");
    return;
  }

  const shuffled = shuffleArray([...history]); // shuffle all history words
  quizWords = shuffled.slice(0, 5);  // take only first 5 words
  currentQuizIndex = 0;

  showQuizSection();
  await loadQuizQuestion();
}


async function loadQuizQuestion() {
  if (!window.quizFeedbackEl || !window.quizOptionsEl || !window.quizQuestionEl || !window.loadingScreen || !window.quizSection) return;

  window.quizFeedbackEl.textContent = "";
  window.quizOptionsEl.innerHTML = "";

  const word = quizWords[currentQuizIndex];
  if (!word) {
    window.quizQuestionEl.textContent = "🎉 Quiz complete!";
    window.quizOptionsEl.innerHTML = "";
    if (window.nextQuizBtn) window.nextQuizBtn.style.display = "none";
    return;
  }

  // Show loading screen, hide quiz content
  window.loadingScreen.style.display = "block";
  window.quizSection.style.display = "none";

  console.log(`Loading quiz question ${currentQuizIndex + 1} of ${quizWords.length} for word: "${word}"`);

  try {
    const response = await fetch(`${PROXY_API_BASE}/api/quiz/${encodeURIComponent(word)}`);
    if (!response.ok) throw new Error("Failed to load quiz question");

    currentQuizData = await response.json();
    console.log("Received quiz data:", currentQuizData);
    renderQuizQuestion();

  } catch (error) {
    console.error("Error fetching quiz:", error);
    window.quizQuestionEl.textContent = "⚠️ Failed to load question.";
  } finally {
    window.loadingScreen.style.display = "none";
    window.quizSection.style.display = "block";
  }
}

function renderQuizQuestion() {
  if (!currentQuizData) return;

  window.quizQuestionEl.textContent = currentQuizData.question;
  window.quizOptionsEl.innerHTML = "";

  // Convert options object to array of [letter, text]
  const optionsArr = Object.entries(currentQuizData.options);

  // Find the text of the original correct answer
  const correctAnswerText = currentQuizData.options[currentQuizData.correctAnswer];

  // Shuffle the options array
  shuffleArray(optionsArr);

  // Reassign letters A, B, C, D to shuffled options
  const letters = ['A', 'B', 'C', 'D'];

  let newCorrectLetter = null;

  optionsArr.forEach(([_, text], idx) => {
    const letter = letters[idx];
    if (text === correctAnswerText) {
      newCorrectLetter = letter;  // Update correct answer letter
    }
    const btn = document.createElement("button");
    btn.textContent = `${letter}) ${text}`;
    btn.className = "quiz-option";
    btn.onclick = () => checkAnswer(letter);
    window.quizOptionsEl.appendChild(btn);
  });

  // Update correct answer letter to new shuffled letter
  currentQuizData.correctAnswer = newCorrectLetter;
}


function checkAnswer(selectedLetter) {
  const correct = selectedLetter === currentQuizData.correctAnswer;
  window.quizFeedbackEl.textContent = correct ? "✅ Correct!" : `❌ Wrong! Correct: ${currentQuizData.correctAnswer}`;
}

async function nextQuizQuestion() {
  currentQuizIndex++;
  if (currentQuizIndex >= quizWords.length) {
    window.quizQuestionEl.textContent = "🎉 Quiz complete!";
    window.quizOptionsEl.innerHTML = "";
    if (window.nextQuizBtn) window.nextQuizBtn.style.display = "none";
    return;
  }
  await loadQuizQuestion();
}

async function initWords() {
  console.log("[INIT] Fetching SAT/ACT vocab list from API...");
  try {
    const listRes = await fetch(`${PROXY_API_BASE}/api/vocab`);
    if (!listRes.ok) {
      throw new Error(`Failed to fetch vocab list, status: ${listRes.status}`);
    }
    const listData = await listRes.json();
    const wordsFromAPI = listData.words;
    if (!Array.isArray(wordsFromAPI) || wordsFromAPI.length === 0) {
      throw new Error("Received empty or invalid word list from API");
    }
    console.log(`[INIT] Received ${wordsFromAPI.length} words from API.`);

    shuffleArray(wordsFromAPI);

    satWords = [];
    for (const [i, word] of wordsFromAPI.entries()) {
      const wordData = await fetchWordData(word);
      satWords.push(wordData);

      if (i === 0) {
        displayCard(0);
      }

      console.log(`[INIT] Fetched definition ${i + 1}/${wordsFromAPI.length}`);
    }
    console.log(`[INIT] Word definitions fetched, total: ${satWords.length}`);

  } catch (e) {
    console.error("[ERROR] initWords failed:", e);
    satWords = [];
  }

  history = JSON.parse(localStorage.getItem("history")) || [];
  currentIndex = 0;

  if (satWords.length > 0 && currentIndex !== 0) {
    displayCard(currentIndex);
  } else if (satWords.length === 0) {
    console.warn("[WARNING] No words fetched, showing fallback card");
    displayFallbackCard();
  }
  updateHistoryBox();
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

    if (data.word && data.definition) {
      const wordObj = { word: data.word, definition: data.definition };
      cache[word] = wordObj;
      localStorage.setItem("wordDataCache", JSON.stringify(cache));
      console.log(`[FETCH SUCCESS] Cached definition for "${word}"`);
      return wordObj;
    }

    if (data.results && data.results.length > 0) {
      const wordObj = { word, definition: data.results[0].definition };
      cache[word] = wordObj;
      localStorage.setItem("wordDataCache", JSON.stringify(cache));
      console.log(`[FETCH SUCCESS] Cached definition for "${word}"`);
      return wordObj;
    }

    console.warn(`[FETCH WARNING] No definition found for "${word}" in API response`);
    return { word, definition: "No definition found." };
  } catch (err) {
    console.error(`[FETCH EXCEPTION] Exception fetching "${word}":`, err);
    return { word, definition: "Definition unavailable due to network or server error." };
  }
}

function displayFallbackCard() {
  const frontEl = document.getElementById('cardFront');
  const backEl = document.getElementById('cardBack');
  if (frontEl && backEl) {
    frontEl.textContent = "Test Word";
    backEl.textContent = "This is a fallback test definition.";
  }
}

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

function showNextCard() {
  if (!satWords || satWords.length === 0) {
    console.warn("[NEXT] No words available to show next.");
    return;
  }
  currentIndex = (currentIndex + 1) % satWords.length;
  console.log(`[NEXT] Showing next card: index ${currentIndex}`);
  displayCard(currentIndex);
}

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
}

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
