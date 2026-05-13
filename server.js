import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import Groq from "groq-sdk";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, "")));
app.use(express.json());

const filePath = path.join(__dirname, "knowledge.md");
const knowledgeRaw = fs.readFileSync(filePath, "utf8");
const chunks = knowledgeRaw
  .split("###")
  .map(c => c.trim())
  .filter(c => c.length > 0);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Retrieval: find the top N chunks most relevant to the query ──────────────
function findRelevantChunks(query, topN = 2) {
  const stopWords = new Set(["what", "how", "the", "is", "are", "do", "does", "can", "and", "for"]);
  const queryWords = new Set(
    query.toLowerCase().split(/\W+/).filter(w => w.length > 3 && !stopWords.has(w))
  );

  if (queryWords.size === 0) return chunks.slice(0, topN);

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

// ── In-memory conversation histories ─────────────────────────────────────────
const aiChanHistory = [
  {
    role: "system",
    content: `You are AI-chan, a playful and spicy anime assistant.
Be concise, friendly, and a little teasing.`
  }
];

const brainyChanHistory = [
  {
    role: "system",
    content: `You are Brainy-chan, a helpful and knowledgeable AI assistant.
Be concise and clear.
You have access to a knowledge base — relevant sections will be provided with each question.
If no knowledge context is provided, answer from your general knowledge and say so.`
  }
];

// ── /api/chat — AI-chan with RAG retrieval ────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const relevantChunks = findRelevantChunks(message, 2);
    const knowledgeContext = relevantChunks.length > 0
      ? `\n\nRelevant knowledge:\n${relevantChunks.join("\n\n---\n\n")}`
      : "";

    const messagesForThisCall = [
      ...aiChanHistory,
      { role: "user", content: `${message}${knowledgeContext}` }
    ];

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: messagesForThisCall
    });

    const reply = response.choices[0].message.content;

    aiChanHistory.push({ role: "user", content: message });
    aiChanHistory.push({ role: "assistant", content: reply });

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI-chan failed 😭" });
  }
});

// ── /api/chat_brainy — Brainy-chan with RAG retrieval ────────────────────────
app.post("/api/chat_brainy", async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { message } = req.body;

    // Retrieve only relevant knowledge chunks for this specific question
    const relevantChunks = findRelevantChunks(message, 2);
    const knowledgeContext = relevantChunks.length > 0
      ? `\n\nRelevant knowledge:\n${relevantChunks.join("\n\n---\n\n")}`
      : "";

    // Inject retrieved context as a user-turn injection so history stays clean
    const messagesForThisCall = [
      ...brainyChanHistory,
      {
        role: "user",
        content: `${message}${knowledgeContext}`
      }
    ];

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: messagesForThisCall
    });

    const reply = response.choices[0].message.content;

    // Store clean history (without the injected knowledge, to keep future turns lean)
    brainyChanHistory.push({ role: "user", content: message });
    brainyChanHistory.push({ role: "assistant", content: reply });

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Brainy-chan failed 😭" });
  }
});

app.listen(PORT, () => {
  console.log(`Local server running: http://localhost:${PORT}`);
});
