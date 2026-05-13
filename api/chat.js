import Groq from "groq-sdk";
import fs from "fs";
import path from "path";
import "dotenv/config";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const filePath = path.join(process.cwd(), "knowledge.md");
const knowledgeRaw = fs.readFileSync(filePath, "utf8");
const chunks = knowledgeRaw
  .split("###")
  .map(c => c.trim())
  .filter(c => c.length > 0);

function findRelevantChunks(query, topN = 2) {
  const stopWords = new Set(["what", "how", "the", "is", "are", "do", "does", "can", "and", "for"]);
  const queryWords = new Set(
    query.toLowerCase().split(/\W+/).filter(w => w.length > 3 && !stopWords.has(w))
  );
  if (queryWords.size === 0) return [];
  return chunks
    .map(chunk => ({
      chunk,
      score: chunk.toLowerCase().split(/\W+/).filter(w => queryWords.has(w)).length
    }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map(s => s.chunk);
}

const memory = [
  {
    role: "system",
    content: `You are AI-chan, a playful and spicy anime assistant.
Be concise, friendly, and a little teasing.`
  }
];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { message } = req.body;

    const relevantChunks = findRelevantChunks(message, 2);
    const knowledgeContext = relevantChunks.length > 0
      ? `\n\nRelevant knowledge:\n${relevantChunks.join("\n\n---\n\n")}`
      : "";

    const messagesForThisCall = [
      ...memory,
      { role: "user", content: `${message}${knowledgeContext}` }
    ];

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: messagesForThisCall
    });

    const reply = response.choices[0].message.content;
    memory.push({ role: "user", content: message });
    memory.push({ role: "assistant", content: reply });

    res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI-chan failed 😭" });
  }
}
