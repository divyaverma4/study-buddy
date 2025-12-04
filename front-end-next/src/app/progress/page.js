"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";

function ProgressPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [seenCards, setSeenCards] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [wordStats, setWordStats] = useState({});

  useEffect(() => {
    if (!authLoading && !isAuthenticated()) {
      router.push("/signin");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated()) {
      loadProgressData();
    }
  }, [isAuthenticated]);

  const loadProgressData = () => {
    // Load seen cards
    const seenCardsJson = localStorage.getItem("seenCards");
    const cards = seenCardsJson ? JSON.parse(seenCardsJson) : [];
    setSeenCards(cards);

    // Load quiz history
    const historyJson = localStorage.getItem("quizHistory");
    const history = historyJson ? JSON.parse(historyJson) : [];
    setQuizHistory(history);

    // Calculate word-level statistics
    const stats = {};
    cards.forEach((card) => {
      stats[card.word] = {
        word: card.word,
        definition: card.definition,
        timesQuizzed: 0,
        timesCorrect: 0,
        accuracy: 0,
      };
    });

    // Aggregate quiz results per word
    history.forEach((quiz) => {
      quiz.results.forEach((result) => {
        if (stats[result.word]) {
          stats[result.word].timesQuizzed++;
          if (result.correct) {
            stats[result.word].timesCorrect++;
          }
        }
      });
    });

    // Calculate accuracy percentages
    Object.keys(stats).forEach((word) => {
      if (stats[word].timesQuizzed > 0) {
        stats[word].accuracy = Math.round(
          (stats[word].timesCorrect / stats[word].timesQuizzed) * 100
        );
      }
    });

    setWordStats(stats);
  };

  const calculateOverallStats = () => {
    const totalWords = seenCards.length;
    const totalQuizzes = quizHistory.length;
    const totalQuestions = quizHistory.reduce(
      (sum, quiz) => sum + quiz.total,
      0
    );
    const totalCorrect = quizHistory.reduce(
      (sum, quiz) => sum + quiz.score,
      0
    );
    const overallAccuracy =
      totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    return {
      totalWords,
      totalQuizzes,
      totalQuestions,
      totalCorrect,
      overallAccuracy,
    };
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return "text-green-600";
    if (accuracy >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getAccuracyBgColor = (accuracy) => {
    if (accuracy >= 80) return "bg-green-100";
    if (accuracy >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  if (authLoading) {
    return <Loading />;
  }

  if (!isAuthenticated()) {
    return null;
  }

  const stats = calculateOverallStats();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-[var(--foreground)] mb-8">
            Your Progress
          </h1>

          {/* Overall Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {stats.totalWords}
              </div>
              <div className="text-gray-600 mt-2">Words Studied</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">
                {stats.totalQuizzes}
              </div>
              <div className="text-gray-600 mt-2">Quizzes Taken</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-indigo-600">
                {stats.totalQuestions}
              </div>
              <div className="text-gray-600 mt-2">Questions Answered</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-green-600">
                {stats.totalCorrect}
              </div>
              <div className="text-gray-600 mt-2">Correct Answers</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-orange-600">
                {stats.overallAccuracy}%
              </div>
              <div className="text-gray-600 mt-2">Overall Accuracy</div>
            </div>
          </div>

          {/* No Data Message */}
          {seenCards.length === 0 && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-6 py-4 rounded-lg mb-8">
              <p className="font-bold">No progress data yet!</p>
              <p className="mt-2">
                Start studying flashcards on the Home page to track your
                progress.
              </p>
              <button
                onClick={() => router.push("/")}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Go to Home
              </button>
            </div>
          )}

          {/* Word-Level Statistics */}
          {seenCards.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Word Statistics
              </h2>
              <p className="text-gray-600 mb-4">
                Track your performance on individual words
              </p>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 px-4 font-bold text-gray-700">
                        Word
                      </th>
                      <th className="text-left py-3 px-4 font-bold text-gray-700">
                        Definition
                      </th>
                      <th className="text-center py-3 px-4 font-bold text-gray-700">
                        Times Quizzed
                      </th>
                      <th className="text-center py-3 px-4 font-bold text-gray-700">
                        Correct
                      </th>
                      <th className="text-center py-3 px-4 font-bold text-gray-700">
                        Accuracy
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(wordStats)
                      .sort((a, b) => {
                        // Sort by times quizzed (descending), then by accuracy (ascending)
                        if (b.timesQuizzed !== a.timesQuizzed) {
                          return b.timesQuizzed - a.timesQuizzed;
                        }
                        return a.accuracy - b.accuracy;
                      })
                      .map((stat, index) => (
                        <tr
                          key={stat.word}
                          className={`border-b border-gray-200 hover:bg-gray-50 ${
                            stat.timesQuizzed > 0 && stat.accuracy < 60
                              ? "bg-red-50"
                              : ""
                          }`}
                        >
                          <td className="py-3 px-4 font-medium text-gray-800">
                            {stat.word}
                          </td>
                          <td className="py-3 px-4 text-gray-600 max-w-md truncate">
                            {stat.definition}
                          </td>
                          <td className="py-3 px-4 text-center text-gray-700">
                            {stat.timesQuizzed}
                          </td>
                          <td className="py-3 px-4 text-center text-gray-700">
                            {stat.timesCorrect}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {stat.timesQuizzed > 0 ? (
                              <span
                                className={`font-bold ${getAccuracyColor(
                                  stat.accuracy
                                )} ${getAccuracyBgColor(
                                  stat.accuracy
                                )} px-3 py-1 rounded-full`}
                              >
                                {stat.accuracy}%
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">
                                Not quizzed
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Quiz History */}
          {quizHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Quiz History
              </h2>
              <p className="text-gray-600 mb-4">
                Review your past quiz performances
              </p>

              <div className="space-y-4">
                {quizHistory
                  .slice()
                  .reverse()
                  .map((quiz, index) => {
                    const accuracy = Math.round(
                      (quiz.score / quiz.total) * 100
                    );
                    return (
                      <div
                        key={index}
                        className="border border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <span className="text-gray-600 text-sm">
                              {new Date(quiz.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-bold text-gray-700">
                              {quiz.score} / {quiz.total}
                            </span>
                            <span
                              className={`font-bold ${getAccuracyColor(
                                accuracy
                              )} ${getAccuracyBgColor(
                                accuracy
                              )} px-3 py-1 rounded-full`}
                            >
                              {accuracy}%
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          Words:{" "}
                          {quiz.results.map((r) => r.word).join(", ")}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center mt-8">
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold"
            >
              Study More Cards
            </button>
            <button
              onClick={() => router.push("/quiz")}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold"
            >
              Take a Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressPage;
