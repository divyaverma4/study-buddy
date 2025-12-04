"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function Quiz() {
  const [quiz, setQuiz] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState("");
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    async function loadQuiz() {
      const seenWords = JSON.parse(localStorage.getItem("seenCards") || "[]");
      if (!seenWords.length) {
        setLoading(false);
        return;
      }

      const shuffled = [...seenWords].sort(() => Math.random() - 0.5).slice(0, 5);

      try {
        const res = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ words: shuffled }),
        });

        if (!res.ok) throw new Error("Failed to fetch quiz");
        const data = await res.json();
        setQuiz(data.quiz || []);
      } catch (err) {
        console.error("Quiz fetch error:", err);
        setQuiz([]);
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, []);

  const handleSubmit = () => {
    if (!quiz[current] || !selected) return;

    const isCorrect = selected === quiz[current].correct;
    if (isCorrect) setScore((s) => s + 1);

    // Save results to localStorage for progress tracking
    const results = JSON.parse(localStorage.getItem("quizResults") || "[]");
    results.push({
      word: quiz[current].word,
      correct: isCorrect,
      selected,
      explanation: quiz[current].explanation || "No explanation available",
    });
    localStorage.setItem("quizResults", JSON.stringify(results));

    setShowAnswer(true);
  };

  const handleNext = () => {
    setShowAnswer(false);
    setSelected("");
    if (current < quiz.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setQuiz([]);
    setCurrent(0);
    setSelected("");
    setScore(0);
    setFinished(false);
    setShowAnswer(false);
    setLoading(true);

    window.location.reload();
  };

  if (loading) return <p>Loading quiz...</p>;
  if (!quiz.length) return <p>No seen words to generate quiz.</p>;

  const q = quiz[current];

  return (
    <div>
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 gap-4 w-full">
        <div className="w-full max-w-xl bg-white p-6 rounded-lg shadow-md">
          {finished ? (
            <div className="text-center">
              <h2 className="text-xl font-bold mb-4">Quiz Complete!</h2>
              <p className="mb-4">Your score: {score}/{quiz.length}</p>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleRestart}
              >
                Take Another Quiz
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-4">
                Question {current + 1}/{quiz.length}
              </h2>
              <p className="mb-4">{q.question}</p>

              <div className="flex flex-col gap-2 w-full">
                {Object.entries(q.options).map(([key, val]) => (
                  <button
                    key={key}
                    className={`p-2 border rounded w-full ${
                      selected === key ? "bg-blue-500 text-white" : "bg-white"
                    }`}
                    onClick={() => setSelected(key)}
                    disabled={showAnswer}
                  >
                    {key}: {val}
                  </button>
                ))}
              </div>

              {!showAnswer ? (
                <button
                  className="mt-4 px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
                  disabled={!selected}
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              ) : (
                <div className="mt-4">
                  <p>
                    Correct answer:{" "}
                    <strong>
                      {q.correct}: {q.options[q.correct]}
                    </strong>
                  </p>
                  <p className="mt-2 text-gray-700">{q.explanation}</p>
                  <button
                    className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
                    onClick={handleNext}
                  >
                    Next Question
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
