import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { words } = await request.json();

    if (!words || !Array.isArray(words) || words.length === 0) {
      return NextResponse.json(
        { error: "Please provide an array of words with definitions" },
        { status: 400 }
      );
    }

    console.log(`[QUIZ API] Generating quiz for ${words.length} words...`);

    // Generate quiz questions using OpenAI
    const quizResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a quiz generator for SAT/ACT vocabulary. Create multiple-choice questions that test understanding of word definitions.",
        },
        {
          role: "user",
          content: `
Create a multiple-choice quiz for the following vocabulary words:
${words.map((w) => `- ${w.word}: ${w.definition}`).join("\n")}

For each word, create ONE question with:
- A clear question asking for the definition or usage
- Four answer options (A, B, C, D)
- The correct answer letter
- A brief explanation of why the answer is correct

Respond with ONLY valid JSON in this exact format:
[
  {
    "word": "word1",
    "question": "What does 'word1' mean?",
    "options": {
      "A": "incorrect definition",
      "B": "correct definition",
      "C": "incorrect definition",
      "D": "incorrect definition"
    },
    "correct": "B",
    "explanation": "Brief explanation of the correct answer"
  }
]
`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const quizText = quizResponse.choices[0]?.message?.content?.trim() || "";
    console.log("[QUIZ API] Raw quiz response received");

    let quiz;
    try {
      quiz = JSON.parse(quizText);
      if (!Array.isArray(quiz)) {
        throw new Error("Quiz response is not an array");
      }
    } catch (err) {
      console.error("[QUIZ API] Failed to parse quiz:", err);
      return NextResponse.json(
        { error: "Failed to parse quiz data", raw: quizText },
        { status: 500 }
      );
    }

    console.log(`[QUIZ API] Successfully generated ${quiz.length} questions`);

    return NextResponse.json({
      success: true,
      count: quiz.length,
      quiz,
    });
  } catch (error) {
    console.error("[QUIZ API] Error generating quiz:", error);
    return NextResponse.json(
      {
        error: "Failed to generate quiz",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
