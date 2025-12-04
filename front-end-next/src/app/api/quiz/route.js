import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { words } = await req.json(); // array of {word, definition}

    if (!words || words.length === 0) {
      return new Response(JSON.stringify({ error: "No words provided" }), { status: 400 });
    }

    // For simplicity, generate one question per word
    const quizPromises = words.map(async (w) => {
      const prompt = `
You are creating SAT-style English vocabulary questions. 

For the word "${w.word}" (definition: "${w.definition}"), generate one multiple-choice question where the student must choose the sentence that correctly uses the word in context.

Create 4 sentences labeled A, B, C, D:
- Only one sentence (the correct answer) must use the word correctly according to its meaning.
- The other three sentences (distractors) should use the word incorrectly or in a misleading way, but still sound plausible in context, similar to SAT reading/writing questions.

Make the sentences realistic, natural, and challenging.

Format your output strictly as JSON:
{
  "question": "Which sentence correctly uses the word '${w.word}'?",
  "options": {
    "A": "sentence A",
    "B": "sentence B",
    "C": "sentence C",
    "D": "sentence D"
  },
  "correct": "A"|"B"|"C"|"D"
}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });
      const text = response.choices[0].message.content;

      // Parse JSON safely
      try {
        return JSON.parse(text);
      } catch {
        return { question: `${w.word}: ${w.definition}`, options: { A: "N/A", B: "N/A", C: "N/A", D: "N/A" }, correct: "A" };
      }
    });

    const quiz = await Promise.all(quizPromises);

    return new Response(JSON.stringify({ quiz }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
