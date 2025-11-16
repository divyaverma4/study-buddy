"use client";
import "./flashcards.css";
import Clock from "../components/Clock";
import React, { useEffect, useCallback } from "react";

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

  // Hardcoded demo words
  useEffect(() => {
    const demoWords = [
      { word: "Abate", definition: "To become less intense or widespread." },
      { word: "Benevolent", definition: "Well-meaning and kind." },
      { word: "Cacophony", definition: "A harsh, discordant mixture of sounds." },
      { word: "Debilitate", definition: "To weaken or make feeble." },
      { word: "Eloquent", definition: "Fluent or persuasive in speaking or writing." }
    ];
    setWords(demoWords);
  }, []);

  // Flip handler (memoized for useEffect)
  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

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

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    } else {
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 gap-4">
      {showClock && <Clock />}

      <div className="flex items-center gap-8 w-full max-w-5xl">
        {/* Previous Button */}
        <button
          className="w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl hover:bg-gray-50 flex items-center justify-center transition-all"
          onClick={handlePrev}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Flashcard;
