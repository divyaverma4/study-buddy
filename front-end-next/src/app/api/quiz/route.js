import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const { words } = await req.json();
    if (!words || words.length === 0) {
      return new Response(JSON.stringify({ error: "No words provided" }), { status: 400 });
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

      const response = await openai.chat.completions.create({
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

    return new Response(JSON.stringify({ quiz }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
