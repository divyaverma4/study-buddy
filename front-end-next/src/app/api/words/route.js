import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request) {
  try {
    // get the count parameter from URL (default to 10 words)
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get("count") || "10", 10);

    console.log(
      `[API] Generating ${count} SAT/ACT vocab words with definitions...`
    );

    // list of vocab

    const vocabResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You provide clean JSON lists of vocabulary words only.",
        },
        {
          role: "user",
          content: `
Return ONLY a valid JSON array of exactly ${count} diverse SAT or ACT vocabulary words.
Each word must be a string in the array.
Example format: ["abate", "acrimony", "benevolent", "disdain", "dissonance"]
`,
        },
      ],
      temperature: 0.7, // more variety in word selection
      max_tokens: 500,
    });

    const vocabText = vocabResponse.choices[0]?.message?.content?.trim() || "";
    console.log("[API] Raw vocab response:", vocabText);

    let wordList;
    try {
      wordList = JSON.parse(vocabText);
      if (!Array.isArray(wordList)) {
        throw new Error("Response is not an array");
      }
    } catch (err) {
      console.error("[API] Failed to parse vocab list:", err);
      return NextResponse.json(
        { error: "Failed to parse vocabulary list", raw: vocabText },
        { status: 500 }
      );
    }

    // retrieve definition for all of the words at once
    const definitionsResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You provide dictionary definitions for SAT vocabulary words in JSON format.",
        },
        {
          role: "user",
          content: `
Provide clear, concise SAT-level definitions for the following words: ${wordList.join(
            ", "
          )}.

Respond with ONLY valid JSON in this exact format:
[
  {"word": "word1", "definition": "definition here"},
  {"word": "word2", "definition": "definition here"}
]
`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const definitionsText =
      definitionsResponse.choices[0]?.message?.content?.trim() || "";
    console.log("[API] Raw definitions response:", definitionsText);

    let wordsWithDefinitions;
    try {
      wordsWithDefinitions = JSON.parse(definitionsText);
      if (!Array.isArray(wordsWithDefinitions)) {
        throw new Error("Definitions response is not an array");
      }
    } catch (err) {
      console.error("[API] Failed to parse definitions:", err);
      return NextResponse.json(
        { error: "Failed to parse definitions", raw: definitionsText },
        { status: 500 }
      );
    }

    console.log(
      `[API] Successfully generated ${wordsWithDefinitions.length} words with definitions`
    );

    // return the words with definitions
    return NextResponse.json({
      success: true,
      count: wordsWithDefinitions.length,
      words: wordsWithDefinitions,
    });
  } catch (error) {
    console.error("[API] Error generating vocabulary:", error);
    return NextResponse.json(
      {
        error: "Failed to generate vocabulary",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
