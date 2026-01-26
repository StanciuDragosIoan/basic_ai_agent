import express from 'express';
import Groq from 'groq-sdk';
import 'dotenv/config';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 5000;

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// const knowledge = JSON.parse(fs.readFileSync('knowledge.json', 'utf8'));

// const knowledgeText = knowledge
//   .map((fact) => `Q: ${fact.question}\nA: ${fact.answer}`)
//   .join('\n');

const knowledgeRaw = fs.readFileSync('knowledge.md', 'utf8');

const chunks = knowledgeRaw.split("###");


console.log('test', JSON.stringify(chunks));

// Conversation memory (per server instance)
const memory = [
  {
    role: 'system',
    content: `
You are a helpful conversational AI agent.
Your name is Brainy-chan.
You remember the conversation.
Be concise and clear.
Use the following knowledge:
  ${chunks}
    `,
  },
];

// Middleware
app.use(express.json());
app.use(express.static('public')); // make sure folder exists

// Chat endpoint
app.post('/api/chat_brainy', async (req, res) => {
  try {
    const { message } = req.body;

    memory.push({ role: 'user', content: message });

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant', // ✅ fixed model name
      messages: memory,
    });

    const reply = response.choices[0].message.content;

    memory.push({ role: 'assistant', content: reply });

    res.json({ reply });
  } catch (err) {
    console.error('Error in /chat:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(port, () => {
  console.log(`🤖 AI Agent running at http://localhost:${port}`);
});
