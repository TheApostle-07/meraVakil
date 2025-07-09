import { openai } from "./openai";
import { getRelevantDocs } from "./retrival";

/**
 * Returns the assistant's answer.
 * Logs whether the answer is grounded on Pinecone context or falls back to a pure‑GPT response.
 */
export async function answerQuery(
  query: string,
): Promise<{ answer: string; grounded: boolean }> {
  // 1️⃣ fetch context from Pinecone
  const docs = await getRelevantDocs(query);
  const grounded = docs.length > 0;
  if (grounded) {
    console.log(`🔎 answerQuery: using ${docs.length} Pinecone matches.`);
  } else {
    console.log("⚠️  answerQuery: no Pinecone matches – using pure GPT.");
  }

  const context = docs.join("\n\n");
  const sys =
    "You are MeraVakil, a Bangalore‑focussed legal assistant. Cite relevant statutes when possible.";
  const user = docs.length
    ? `Question: "${query}"\nRelevant:\n${context}`
    : `Question: "${query}"`;

  // 2️⃣ chat completion
  const chat = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.0,
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
  });

  const answer = chat.choices[0].message.content ?? "";
  return { answer, grounded };
}