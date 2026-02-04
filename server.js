import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Groq from 'groq-sdk';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files
app.use(express.static(path.join(__dirname, '')));

// Parse JSON
app.use(express.json());

// Load knowledge
const filePath = path.join(__dirname, 'knowledge.md');
const knowledgeRaw = fs.readFileSync(filePath, 'utf8');
const chunks = knowledgeRaw.split('###');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Simple in-memory memory
const memoryBase = [
  {
    role: 'system',
    content: `
You are a helpful AI.
Your name is Ai-chan.
    `,
  },
];

const memory = [
  {
    role: 'system',
    content: `
You are a helpful AI.
Your name is Brainy-chan.
Use the following knowledge:
${chunks}
    `,
  },
];

// API route
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    memory.push({ role: 'user', content: message });

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: memoryBase,
    });

    const reply = response.choices[0].message.content;
    memory.push({ role: 'assistant', content: reply });

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI-chan failed 😭' });
  }
});

app.post('/api/chat_brainy', async (req, res) => {
  try {
    const { message } = req.body;
    memory.push({ role: 'user', content: message });

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: memory,
    });

    const reply = response.choices[0].message.content;
    memory.push({ role: 'assistant', content: reply });

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI-chan failed 😭' });
  }
});

app.listen(PORT, () => {
  console.log(`Local server running: http://localhost:${PORT}`);
});
