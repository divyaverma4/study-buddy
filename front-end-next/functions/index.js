const { https } = require("firebase-functions/v2");   // ✅ v2 import
const { defineSecret } = require("firebase-functions/params");
const OpenAI = require("openai");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Define the secret
const openaiApiKey = defineSecret("OPENAI_API_KEY");

// POST /quiz
app.post("/quiz", async (req, res) => {
  try {
    const client = new OpenAI({
      apiKey: openaiApiKey.value(), // ✅ safe at runtime
    });

    const { words } = req.body;
    if (!words || words.length === 0) {
      return res.status(400).json({ error: "No words provided" });
    }

    const quizPromises = words.map(async (w) => {
      const prompt = `
You are creating SAT-style English vocabulary questions.

For the word "${w.word}" (definition: "${w.definition}"), generate one multiple-choice question with 4 options labeled A, B, C, D:
- Only one sentence uses the word correctly.
- The other 3 are plausible distractors.
- Include an explanation explaining why each option is correct or incorrect.

Format strictly as JSON:
{
  "question": "Which sentence correctly uses the word '${w.word}'?",
  "options": {
    "A": "sentence A",
    "B": "sentence B",
    "C": "sentence C",
    "D": "sentence D"
  },
  "correct": "A"|"B"|"C"|"D",
  "explanation": "Explanation for all options"
}
`;

      const response = await client.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const text = response.choices[0].message.content;

      try {
        const parsed = JSON.parse(text);
        parsed.word = w.word;
        parsed.definition = w.definition;
        return parsed;
      } catch {
        return {
          word: w.word,
          definition: w.definition,
          question: `Which sentence correctly uses the word "${w.word}"?`,
          options: { A: w.definition, B: "B", C: "C", D: "D" },
          correct: "A",
          explanation: "Default explanation due to parse error",
        };
      }
    });

    const quiz = await Promise.all(quizPromises);
    res.json({ quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Export with v2 API and secret dependency
exports.api = https.onRequest(
  { region: "us-central1", secrets: [openaiApiKey] },
  app
);