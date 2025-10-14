// Run this script ONCE to generate words: node scripts/generate-words.js
// This saves money by not calling OpenAI every time a user visits

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateWords(count = 50) {
  console.log(`Generating ${count} vocabulary words...`);

  // Step 1: Get vocabulary words
  const vocabPrompt = `
Return ONLY a valid JSON array of exactly ${count} diverse SAT or ACT vocabulary words.
Each word must be a string in the array.
Example format: ["abate", "acrimony", "benevolent"]
`;

  const vocabResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You provide clean JSON lists of vocabulary words only." },
      { role: "user", content: vocabPrompt },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  const wordList = JSON.parse(vocabResponse.choices[0]?.message?.content?.trim());

  // Step 2: Get definitions
  const definitionsPrompt = `
Provide clear, concise SAT-level definitions for the following words: ${wordList.join(', ')}.

Respond with ONLY valid JSON in this exact format:
[
  {"word": "word1", "definition": "definition here"},
  {"word": "word2", "definition": "definition here"}
]
`;

  const definitionsResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You provide dictionary definitions for SAT vocabulary words in JSON format." },
      { role: "user", content: definitionsPrompt },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });

  const wordsWithDefinitions = JSON.parse(definitionsResponse.choices[0]?.message?.content?.trim());

  // Save to JSON file
  const outputPath = path.join(process.cwd(), 'public', 'vocab-words.json');
  fs.writeFileSync(outputPath, JSON.stringify(wordsWithDefinitions, null, 2));

  console.log(`✅ Generated ${wordsWithDefinitions.length} words and saved to public/vocab-words.json`);
  console.log(`Cost estimate: ~$0.002 (one-time cost)`);
  return wordsWithDefinitions;
}

// Run the script
generateWords(50).catch(console.error);