"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";

function QuizPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated()) {
      router.push("/signin");
    }
  }, [authLoading, isAuthenticated, router]);

  // Load quiz on component mount
  useEffect(() => {
    if (isAuthenticated()) {
      loadQuiz();
    }
  }, [isAuthenticated]);

  const loadQuiz = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get seen cards from localStorage
      const seenCardsJson = localStorage.getItem("seenCards");
      let seenCards = seenCardsJson ? JSON.parse(seenCardsJson) : [];

      if (seenCards.length === 0) {
        setError(
          "You haven't studied any flashcards yet! Go to the Home page to study some cards first."
        );
        setLoading(false);
        return;
      }

      // Take up to 5 random words for the quiz
      const shuffled = [...seenCards].sort(() => Math.random() - 0.5);
      const quizWords = shuffled.slice(0, Math.min(5, seenCards.length));

      // Call the quiz API
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ words: quizWords }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate quiz");
      }

      const data = await response.json();
      setQuizData(data.quiz);
      setCurrentQuestion(0);
      setSelectedAnswers({});
      setShowResults(false);
    } catch (err) {
      console.error("Error loading quiz:", err);
      setError(err.message || "Failed to load quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, answer) => {
    if (showResults) return; // Don't allow changing answers after submission

    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answer,
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = () => {
    // Check if all questions are answered
    const unanswered = quizData.filter(
      (_, index) => !selectedAnswers[index]
    ).length;

    if (unanswered > 0) {
      if (
        !confirm(
          `You have ${unanswered} unanswered question(s). Submit anyway?`
        )
      ) {
        return;
      }
    }

    // Calculate score
    let correctCount = 0;
    const results = quizData.map((question, index) => {
      const isCorrect = selectedAnswers[index] === question.correct;
      if (isCorrect) correctCount++;

      return {
        word: question.word,
        correct: isCorrect,
        selectedAnswer: selectedAnswers[index] || "Not answered",
        correctAnswer: question.correct,
      };
    });

    // Save results to localStorage
    const quizResults = {
      timestamp: new Date().toISOString(),
      score: correctCount,
      total: quizData.length,
      results,
    };

    // Append to quiz history
    const historyJson = localStorage.getItem("quizHistory");
    const history = historyJson ? JSON.parse(historyJson) : [];
    history.push(quizResults);
    localStorage.setItem("quizHistory", JSON.stringify(history));

    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    quizData.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct) {
        correct++;
      }
    });
    return { correct, total: quizData.length };
  };

  if (authLoading) {
    return <Loading />;
  }

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6">
        {loading && (
          <div className="text-center">
            <Loading />
            <p className="mt-4 text-[var(--foreground)]">
              Generating your quiz...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-2xl">
            <p className="font-bold">Error</p>
            <p>{error}</p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Go to Home
            </button>
          </div>
        )}

        {!loading && !error && !quizData && (
          <div className="text-center">
            <p className="text-[var(--foreground)] mb-4">
              Ready to test your knowledge?
            </p>
            <button
              onClick={loadQuiz}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-bold"
            >
              Start Quiz
            </button>
          </div>
        )}

        {!loading && !error && quizData && !showResults && (
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl p-8">
            {/* Progress indicator */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>
                  Question {currentQuestion + 1} of {quizData.length}
                </span>
                <span>
                  {Object.keys(selectedAnswers).length}/{quizData.length}{" "}
                  answered
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${((currentQuestion + 1) / quizData.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Question */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {quizData[currentQuestion].question}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {Object.entries(quizData[currentQuestion].options).map(
                  ([letter, option]) => (
                    <button
                      key={letter}
                      onClick={() => handleAnswerSelect(currentQuestion, letter)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedAnswers[currentQuestion] === letter
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <span className="font-bold text-blue-600">{letter}.</span>{" "}
                      {option}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentQuestion === quizData.length - 1 ? (
                <button
                  onClick={handleSubmitQuiz}
                  className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-bold"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}

        {!loading && !error && quizData && showResults && (
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl p-8">
            {/* Score Summary */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Quiz Complete!
              </h2>
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {calculateScore().correct} / {calculateScore().total}
              </div>
              <p className="text-gray-600">
                {Math.round(
                  (calculateScore().correct / calculateScore().total) * 100
                )}
                % Correct
              </p>
            </div>

            {/* Detailed Results */}
            <div className="space-y-4 mb-6">
              {quizData.map((question, index) => {
                const isCorrect =
                  selectedAnswers[index] === question.correct;
                const userAnswer = selectedAnswers[index] || "Not answered";

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      isCorrect
                        ? "border-green-500 bg-green-50"
                        : "border-red-500 bg-red-50"
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-2xl">
                        {isCorrect ? "✓" : "✗"}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 mb-1">
                          {question.word}
                        </h3>
                        <p className="text-gray-700 mb-2">
                          {question.question}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Your answer:</span>{" "}
                          {userAnswer} -{" "}
                          {question.options[userAnswer] || "N/A"}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Correct answer:</span>{" "}
                            {question.correct} -{" "}
                            {question.options[question.correct]}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 mt-2 italic">
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={loadQuiz}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold"
              >
                Take Another Quiz
              </button>
              <button
                onClick={() => router.push("/progress")}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-bold"
              >
                View Progress
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizPage;
