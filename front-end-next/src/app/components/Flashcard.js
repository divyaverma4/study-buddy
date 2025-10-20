"use client";
import "./flashcards.css";
import Clock from "../components/Clock";
import React, { useEffect } from "react";

function Flashcard() {
  const [words, setWords] = React.useState([]);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);
  // const [loading, setLoading] = React.useState(true);

  //check for clock
  const [showClock, setShowClock] = React.useState(false);
  React.useEffect(() => {
    const savedClockSetting = localStorage.getItem("showClock");
    if (savedClockSetting !== null) {
      setShowClock(savedClockSetting === "true");
    }
  }, []);


  useEffect(() => {
    // fetch words from the API
    const fetchWords = async () => {
      try {
        const response = await fetch("/api/words");
        const data = await response.json();
        if (data.success) {
          setWords(data.words);
        } else {
          console.error("Failed to fetch words:", data.error);
        }
      } catch (error) {
        console.error("Error fetching words:", error);
      }
    };
    fetchWords();
  }, []); // empty array -> run only once on mount

  // add keyboard event listener for spacebar
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === 'Space') {
        event.preventDefault(); 
        handleFlip();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    // cleanup function to remove event listener
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isFlipped]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

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
    {/* Show clock above flashcards if enabled */}
    {showClock && <Clock />}

    <div className="flex items-center gap-8 w-full max-w-5xl">
      {/* previous button */}
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

      {/* flashcard */}
      <div
        className={`flashcard-container flex-1 h-96 bg-transparent cursor-pointer`}
        onClick={handleFlip}
      >
        <div className={`flashcard ${isFlipped ? "flipped" : ""}`}>
          <div className="flashcard-front flex items-center justify-center rounded-2xl shadow-xl bg-white p-8">
            <p className="text-2xl text-gray-700">{words[currentIndex]?.word}</p>
          </div>
          <div className="flashcard-back flex items-center justify-center rounded-2xl shadow-xl bg-white p-8">
            <p className="text-2xl text-gray-700">{words[currentIndex]?.definition}</p>
          </div>
        </div>
      </div>

      {/* next button */}
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
