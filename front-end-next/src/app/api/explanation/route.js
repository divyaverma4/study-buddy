// src/app/api/explanation/route.js
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { word, definition, options, correctOption } = await req.json();

    if (!word || !definition || !options || !correctOption) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const prompt = `
You are a tutor preparing a student for the SAT English section.

Explain a multiple-choice question for the word "${word}" (definition: "${definition}").

Question options:
${Object.entries(options)
  .map(([key, val]) => `${key}: ${val}`)
  .join("\n")}

Correct answer: ${correctOption}

Explain in detail:
- Why the correct answer is correct.
- Why each incorrect option is incorrect.
- Make it concise but clear for SAT prep.
Return only the explanation as text.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    const explanation = completion.choices[0].message.content.trim();

    return NextResponse.json({ explanation }, { status: 200 });
  } catch (err) {
    console.error("API /explanation error:", err);
    return NextResponse.json(
      { error: "Failed to generate explanation" },
      { status: 500 }
    );
  }
}
