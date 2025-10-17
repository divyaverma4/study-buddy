"use client";

import React from "react";
import Navbar from "../components/Navbar";

// --- Clock Component ---
function Clock() {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval); // cleanup
  }, []);

  return (
    <div className="text-2xl font-bold text-[var(--foreground)]">
      {time.toLocaleTimeString()}
    </div>
  );
}

// --- Settings Page ---
function SettingsPage() {
  // --- STATES ---
  const [darkMode, setDarkMode] = React.useState(
    () => localStorage.getItem("darkMode") === "true" || false
  );
  const [showClock, setShowClock] = React.useState(
    () => localStorage.getItem("showClock") === "true" || false
  );
  const [shuffleCards, setShuffleCards] = React.useState(
    () => localStorage.getItem("shuffleCards") === "true" || false
  );

  // --- HANDLERS ---
  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);

    if (newDarkMode) {
      // Dark mode colors
      document.documentElement.style.setProperty("--background", "#0b1e3b");
      document.documentElement.style.setProperty("--foreground", "#fff4cc");
    } else {
      // Original light theme colors
      document.documentElement.style.setProperty("--background", "#b4d8e7"); // light blue
      document.documentElement.style.setProperty("--foreground", "#171717"); // black
    }
  };

  const handleClockToggle = () => {
    const newShowClock = !showClock;
    setShowClock(newShowClock);
    localStorage.setItem("showClock", newShowClock);
  };

  const handleShuffleToggle = () => {
    const newShuffle = !shuffleCards;
    setShuffleCards(newShuffle);
    localStorage.setItem("shuffleCards", newShuffle);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 gap-8">
        {/* Page title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Settings Page</h1>
          <p className="mb-6">Configure your study preferences here</p>
        </div>

        {/* --- TOGGLES --- */}
        <div className="flex flex-col gap-6">

          {/* Dark Mode */}
          <div className="flex items-center gap-4">
            <span className="font-medium text-lg">Dark Mode</span>
            <button
              onClick={handleDarkModeToggle}
              className={`w-16 h-9 flex items-center rounded-full p-1 transition-colors duration-300 ${
                darkMode ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`bg-white w-7 h-7 rounded-full shadow-md transform transition-transform duration-300 ${
                  darkMode ? "translate-x-7" : "translate-x-0"
                }`}
              ></div>
            </button>
          </div>

          {/* Show Clock */}
          <div className="flex items-center gap-4">
            <span className="font-medium text-lg">Show Clock</span>
            <button
              onClick={handleClockToggle}
              className={`w-16 h-9 flex items-center rounded-full p-1 transition-colors duration-300 ${
                showClock ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`bg-white w-7 h-7 rounded-full shadow-md transform transition-transform duration-300 ${
                  showClock ? "translate-x-7" : "translate-x-0"
                }`}
              ></div>
            </button>
          </div>

          {/* Shuffle Cards */}
          <div className="flex items-center gap-4">
            <span className="font-medium text-lg">Shuffle Cards</span>
            <button
              onClick={handleShuffleToggle}
              className={`w-16 h-9 flex items-center rounded-full p-1 transition-colors duration-300 ${
                shuffleCards ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`bg-white w-7 h-7 rounded-full shadow-md transform transition-transform duration-300 ${
                  shuffleCards ? "translate-x-7" : "translate-x-0"
                }`}
              ></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;

