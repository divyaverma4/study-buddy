"use client";
import "./flashcards.css";
import Clock from "../components/Clock";
import React, { useEffect, useCallback } from "react";

// --- Shuffle helper ---
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// --- Save a word to localStorage seenCards ---
function addSeenCard(wordObj) {
  if (!wordObj) return; // <-- guard
  if (typeof window !== "undefined") {
    const seen = JSON.parse(localStorage.getItem("seenCards") || "[]");
    // Avoid duplicates
    if (!seen.some((w) => w.word === wordObj.word)) {
      seen.push(wordObj);
      localStorage.setItem("seenCards", JSON.stringify(seen));
    }
  }
}

function Flashcard() {
  const [words, setWords] = React.useState([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [showClock, setShowClock] = React.useState(false);

  // Load clock preference (SSR-safe)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedClockSetting = localStorage.getItem("showClock");
      if (savedClockSetting !== null) {
        setShowClock(savedClockSetting === "true");
      }
    }
  }, []);

  // Load words from public/words.json and shuffle
  useEffect(() => {
    async function loadWords() {
      try {
        const res = await fetch("/words.json");
        const data = await res.json();
        const shuffled = shuffleArray(data); // shuffle words
        setWords(shuffled);
        if (shuffled.length > 0) addSeenCard(shuffled[0]); // mark first card as seen
      } catch (err) {
        console.error("Failed to load words:", err);
      }
    }
    loadWords();
  }, []);

  // Flip handler
  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
    addSeenCard(words[currentIndex]);
  }, [words, currentIndex]);

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      addSeenCard(words[currentIndex + 1]); // mark next card as seen
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
      addSeenCard(words[currentIndex - 1]); // mark previous card as seen
    }
  };

  // Keyboard spacebar flips the card
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === "Space") {
        event.preventDefault();
        handleFlip();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleFlip]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 gap-4">
      {showClock && <Clock />}

      <div className="flex items-center gap-8 w-full max-w-5xl">
        {/* Previous Button */}
        <button
          className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl hover:bg-gray-50 flex items-center justify-center transition-all"
          onClick={handlePrev}
        >
          ◀
        </button>

        {/* Flashcard */}
        <div
          className="flashcard-container flex-1 h-96 bg-transparent cursor-pointer"
          onClick={handleFlip}
        >
          <div className={`flashcard ${isFlipped ? "flipped" : ""}`}>
            <div className="flashcard-front flex items-center justify-center rounded-2xl shadow-xl bg-white p-8">
              <p className="text-2xl text-gray-700">
                {words[currentIndex]?.word || "Loading..."}
              </p>
            </div>
            <div className="flashcard-back flex items-center justify-center rounded-2xl shadow-xl bg-white p-8">
              <p className="text-2xl text-gray-700">
                {words[currentIndex]?.definition || ""}
              </p>
            </div>
          </div>
        </div>

        {/* Next Button */}
        <button
          className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl hover:bg-gray-50 flex items-center justify-center transition-all"
          onClick={handleNext}
        >
          ▶
        </button>
      </div>
    </div>
  );
}

export default Flashcard;
