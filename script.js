// Added subtitle, hover popups, previous button, clickable history, and style tweaks

let currentIndex = 0;
let flipped = false;
let history = [];
let satWords = [];

const PROXY_API_BASE = 'https://words-around-the-world-backend.onrender.com';

let quizWords = [];
let currentQuizIndex = 0;
let currentQuizData = null;

window.onload = async () => {
  // Add subtitle below main title
  const header = document.getElementById('header');
  if (header) {
    const subtitle = document.createElement('div');
    subtitle.id = 'subtitle';
    subtitle.textContent = 'Your next favorite AI flashcard assistant!';
    subtitle.style.fontStyle = 'italic';
    subtitle.style.fontSize = '1rem';
    subtitle.style.color = '#555';
    subtitle.style.marginTop = '4px';
    header.appendChild(subtitle);
  }

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

  // Add previous button functionality
  const prevBtn = document.getElementById('prevBtn');
  if (prevBtn) prevBtn.addEventListener('click', showPreviousCard);

  // Add hover tooltips for history and quiz buttons
  if (toggleHistoryBtn) {
    toggleHistoryBtn.title = "Show or hide your history of viewed words";
  }
  if (practiceQuizBtn) {
    practiceQuizBtn.title = "Start a quick AI-generated practice quiz based on your history";
  }

  // Make history words clickable to flip to that word
  setupClickableHistory();

  // Initial hide quiz section
  hideQuizSection();

  showAboutModal();
};

// Setup click handlers on history words
function setupClickableHistory() {
  const box = document.getElementById("historyBox");
  if (!box) return;

  box.addEventListener('click', (event) => {
    const clicked = event.target;
    if (clicked.tagName.toLowerCase() === 'li') {
      const wordClicked = clicked.textContent;
      // Find index of this word in satWords
      const foundIndex = satWords.findIndex(w => w.word === wordClicked);
      if (foundIndex !== -1) {
        currentIndex = foundIndex;
        displayCard(currentIndex);
        // If card was flipped, reset flip
        const innerEl = document.getElementById('cardInner');
        if (innerEl && innerEl.classList.contains('flipped')) {
          innerEl.classList.remove('flipped');
          flipped = false;
        }
        console.log(`[HISTORY CLICK] Flipped to word: ${wordClicked} at index ${foundIndex}`);
      }
    }
  });
}

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
      const response = await fetch(`${PROXY_API_BASE}/api/word/${encodeURIComponent(word)}`);
      if (!response.ok) {
        console.warn(`Failed to fetch word data for "${word}", skipping.`);
        continue;
      }
      const wordData = await response.json();
      satWords.push(wordData);
      // For demo or limited initial loading, break early
      if (i >= 49) break;
    }
    console.log(`[INIT] Loaded ${satWords.length} word entries.`);

    displayCard(currentIndex);
  } catch (error) {
    console.error("Error during word initialization:", error);
    alert("Failed to initialize words. Please try reloading the page.");
  }
}

function displayCard(index) {
  if (!satWords || satWords.length === 0) {
    console.warn("No words to display.");
    return;
  }
  const wordEntry = satWords[index];
  if (!wordEntry) {
    console.warn(`No word found at index ${index}`);
    return;
  }

  const front = document.getElementById('cardFront');
  const back = document.getElementById('cardBack');
  const inner = document.getElementById('cardInner');

  if (!front || !back || !inner) {
    console.warn("Missing flashcard elements.");
    return;
  }

  // Reset flip state
  if (flipped) {
    inner.classList.remove('flipped');
    flipped = false;
  }

  front.textContent = wordEntry.word || "";
  back.innerHTML = `
    <strong>Definition:</strong> ${wordEntry.definition || "N/A"}
  `;

  // Add current word to history if not already there
  if (!history.includes(wordEntry.word)) {
    history.push(wordEntry.word);
  }

  updateHistoryUI();

  console.log(`[DISPLAY] Showing word "${wordEntry.word}" at index ${index}`);
}

function flipCard() {
  const inner = document.getElementById('cardInner');
  if (!inner) return;
  if (flipped) {
    inner.classList.remove('flipped');
  } else {
    inner.classList.add('flipped');
  }
  flipped = !flipped;
}

function showNextCard() {
  if (!satWords || satWords.length === 0) {
    console.warn("[NEXT] No words loaded.");
    return;
  }
  currentIndex = (currentIndex + 1) % satWords.length;
  displayCard(currentIndex);
}

function toggleHistory() {
  const box = document.getElementById('historyBox');
  const toggleBtn = document.getElementById('toggleHistoryBtn');
  if (!box || !toggleBtn) return;

  if (box.style.display === "none") {
    box.style.display = "block";
    toggleBtn.textContent = "Hide History";
  } else {
    box.style.display = "none";
    toggleBtn.textContent = "Show History";
  }
}

function updateHistoryUI() {
  const box = document.getElementById('historyBox');
  if (!box) return;

  box.innerHTML = "<ul>" + history.map(w => `<li title="Click to jump to this word">${w}</li>`).join('') + "</ul>";
}

// Optional toggle favorite function placeholder
function toggleFavorite() {
  alert("Favorite feature coming soon!");
}

// --- About/How-To Modal ---
function showAboutModal() {
  const modal = document.getElementById('aboutModal');
  const closeBtn = document.getElementById('closeAbout');
  if (!modal || !closeBtn) return;

  modal.style.display = "block";

  closeBtn.onclick = () => {
    modal.style.display = "none";
  };

  // Close modal if user clicks outside content
  window.onclick = event => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };
}

