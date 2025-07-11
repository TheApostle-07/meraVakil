import { openai } from "./openai";
import { getRelevantDocs } from "./retrival";

/**
 * Returns the assistant's answer.
 * Logs whether the answer is grounded on Pinecone context or falls back to a pure‑GPT response.
 */
export async function answerQuery(
  query: string
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

  const sys = grounded
    ? `You are MeraVakil, a specialized legal assistant focused on Bangalore and Karnataka law. You have access to relevant legal documents and precedents.

    INSTRUCTIONS:
- Answer questions using the provided legal context
- Cite specific statutes, sections, and case law when available
- If the context doesn't fully answer the question, clearly state what information is available vs. what requires additional research
- Use clear, professional language accessible to non-lawyers
- Structure responses with descriptive headings and bullet points
- Provide practical next steps or recommendations when appropriate
- Always mention if consultation with a qualified lawyer is advisable

FORMAT: Use clear Markdown formatting with headings, bullet points, and short paragraphs.`
    : `You are MeraVakil, a legal assistant focused on Bangalore and Karnataka law. You're answering without access to specific legal documents.

INSTRUCTIONS:
- Provide general legal guidance based on common Indian legal principles
- Clearly state that this is general information and not specific legal advice
- Recommend consulting with a qualified lawyer for specific situations
- Focus on Bangalore/Karnataka context when possible
- Use clear, professional language accessible to non-lawyers
- Structure responses with descriptive headings and bullet points

IMPORTANT: Always emphasize that specific legal advice requires consultation with a qualified attorney.` +
      "FORMAT: Use clear Markdown formatting with headings, bullet points, and short paragraphs.";

  const user = grounded
    ? `Based on the legal context provided, please answer this question:

**Question:** ${query}

**Relevant Legal Context:**
${context}

Please provide a comprehensive answer based on this context.`
    : `Please provide general legal guidance for this question:
      **Question:** ${query}`;

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
