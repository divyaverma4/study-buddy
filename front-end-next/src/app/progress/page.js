"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

function ProgressPage() {
  const [seenCards, setSeenCards] = useState([]);
  const [accuracyMap, setAccuracyMap] = useState({});

  const loadProgress = () => {
    const savedSeen = localStorage.getItem("seenCards");
    if (savedSeen) setSeenCards(JSON.parse(savedSeen));

    const savedResults = JSON.parse(localStorage.getItem("quizResults") || "[]");
    const map = {};
    savedResults.forEach((res) => {
      if (!map[res.word]) map[res.word] = { correct: 0, total: 0 };
      map[res.word].total += 1;
      if (res.correct) map[res.word].correct += 1;
    });
    setAccuracyMap(map);
  };

  useEffect(() => {
    // Initial load
    loadProgress();

    // Listen for quizCompleted event
    const handleQuizCompleted = () => loadProgress();
    window.addEventListener("quizCompleted", handleQuizCompleted);

    return () => window.removeEventListener("quizCompleted", handleQuizCompleted);
  }, []);

  return (
    <div>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-start p-6 gap-4">
        <h1 className="text-2xl font-bold mb-4">Progress Page</h1>
        {seenCards.length === 0 ? (
          <p>No cards seen yet!</p>
        ) : (
          <div className="w-full max-w-xl">
            <h2 className="text-xl font-semibold mb-2">Seen Cards & Accuracy:</h2>
            <ul className="list-disc list-inside">
              {seenCards.map((card, index) => {
                const stats = accuracyMap[card.word] || { correct: 0, total: 0 };
                const percent =
                  stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                return (
                  <li key={index}>
                    <strong>{card.word}</strong>: {card.definition}{" "}
                    {stats.total > 0 && (
                      <span className="text-sm text-gray-600">
                        ({percent}% correct over {stats.total} quizzes)
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgressPage;
