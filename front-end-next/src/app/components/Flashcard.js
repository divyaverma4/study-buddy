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

  // Load words from API or localStorage
  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    try {
      // Try to load from localStorage first
      const cachedWords = localStorage.getItem("vocabularyWords");
      if (cachedWords) {
        const parsed = JSON.parse(cachedWords);
        setWords(parsed);
        return;
      }

      // If no cached words, fetch from API
      const response = await fetch("/api/words?count=20");
      if (!response.ok) {
        throw new Error("Failed to fetch words");
      }

      const data = await response.json();
      const fetchedWords = data.words || [];

      // Cache the words in localStorage
      localStorage.setItem("vocabularyWords", JSON.stringify(fetchedWords));
      setWords(fetchedWords);
    } catch (error) {
      console.error("Error loading words:", error);
      // Fallback to demo words if API fails
      // Fallback to demo words if API fails
const demoWords = shuffleArray([
  { word: "Abate", definition: "To become less intense or widespread." },
  { word: "Aberration", definition: "A departure from what is normal." },
  { word: "Acrimonious", definition: "Angry and bitter." },
  { word: "Alacrity", definition: "Brisk and cheerful readiness." },
  { word: "Ambiguous", definition: "Open to more than one interpretation." },
  { word: "Anomaly", definition: "Something that deviates from the norm." },
  { word: "Apathy", definition: "Lack of interest or emotion." },
  { word: "Arduous", definition: "Involving great effort or difficulty." },
  { word: "Assiduous", definition: "Showing great care and perseverance." },
  { word: "Austere", definition: "Severe or strict in manner." },

  { word: "Benevolent", definition: "Well-meaning and kind." },
  { word: "Brazen", definition: "Bold and without shame." },
  { word: "Cacophony", definition: "A harsh mixture of sounds." },
  { word: "Callous", definition: "Emotionally insensitive." },
  { word: "Candid", definition: "Truthful and straightforward." },
  { word: "Capricious", definition: "Given to sudden changes in mood." },
  { word: "Clandestine", definition: "Kept secret." },
  { word: "Coerce", definition: "To force someone to act." },
  { word: "Complacent", definition: "Self-satisfied and unaware of danger." },
  { word: "Concur", definition: "To agree." },

  { word: "Debilitate", definition: "To weaken." },
  { word: "Deference", definition: "Polite respect." },
  { word: "Diligent", definition: "Hard-working and careful." },
  { word: "Discretion", definition: "The quality of being careful in speech." },
  { word: "Eloquent", definition: "Persuasive and expressive." },
  { word: "Empirical", definition: "Based on observation." },
  { word: "Enigma", definition: "Something mysterious." },
  { word: "Erudite", definition: "Very knowledgeable." },
  { word: "Exacerbate", definition: "To make worse." },
  { word: "Fallacy", definition: "A mistaken belief." },

  { word: "Frugal", definition: "Careful with money." },
  { word: "Futile", definition: "Pointless or ineffective." },
  { word: "Gregarious", definition: "Enjoys social interaction." },
  { word: "Hackneyed", definition: "Overused and unoriginal." },
  { word: "Hinder", definition: "To delay or obstruct." },
  { word: "Hypocrisy", definition: "Pretending to have morals you don’t." },
  { word: "Imminent", definition: "About to happen." },
  { word: "Impartial", definition: "Fair and unbiased." },
  { word: "Imperative", definition: "Absolutely necessary." },
  { word: "Incessant", definition: "Never stopping." },

  { word: "Indolent", definition: "Lazy." },
  { word: "Inevitable", definition: "Certain to happen." },
  { word: "Ingenuous", definition: "Innocent and trusting." },
  { word: "Insidious", definition: "Harmful in a sneaky way." },
  { word: "Intrepid", definition: "Fearless." },
  { word: "Judicious", definition: "Having good judgment." },
  { word: "Lucid", definition: "Clear and understandable." },
  { word: "Meticulous", definition: "Very careful and precise." },
  { word: "Mundane", definition: "Ordinary and boring." },
  { word: "Negligent", definition: "Failing to take proper care." },

  { word: "Obscure", definition: "Not well known or unclear." },
  { word: "Ostentatious", definition: "Showy and flashy." },
  { word: "Perilous", definition: "Dangerous." },
  { word: "Pragmatic", definition: "Practical and realistic." },
  { word: "Profound", definition: "Very deep or meaningful." },
  { word: "Resilient", definition: "Able to recover quickly." },
  { word: "Scrutiny", definition: "Close examination." },
  { word: "Subtle", definition: "Not obvious." },
  { word: "Tenacious", definition: "Persistent." },
  { word: "Vigilant", definition: "Alert and watchful." },

  { word: "Voracious", definition: "Having a huge appetite." },
  { word: "Wary", definition: "Cautious." },
  { word: "Zealous", definition: "Extremely enthusiastic." }
]);

setWords(demoWords);

    }
  };

  // Flip handler (memoized for useEffect)
  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
    addSeenCard(words[currentIndex]);
  }, [words, currentIndex]);

  // Mark current card as seen
  const markCardAsSeen = useCallback(() => {
    if (words.length === 0 || !words[currentIndex]) return;

    const currentWord = words[currentIndex];
    const seenCardsJson = localStorage.getItem("seenCards");
    const seenCards = seenCardsJson ? JSON.parse(seenCardsJson) : [];

    // Check if card is already marked as seen
    const alreadySeen = seenCards.some((card) => card.word === currentWord.word);

    if (!alreadySeen) {
      seenCards.push(currentWord);
      localStorage.setItem("seenCards", JSON.stringify(seenCards));
    }
  }, [words, currentIndex]);

  // Mark card as seen when user flips it
  useEffect(() => {
    if (isFlipped) {
      markCardAsSeen();
    }
  }, [isFlipped, markCardAsSeen]);

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
