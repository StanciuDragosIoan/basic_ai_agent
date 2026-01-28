import Groq from 'groq-sdk';
import fs from 'fs';

import 'dotenv/config';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'knowledge.md');



const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const knowledgeRaw = fs.readFileSync(filePath, 'utf8');

const chunks = knowledgeRaw.split('###');
// Memory persists per function instance (good enough for personal projects)
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

console.log('test', JSON.stringify(memory, null, 2));
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message } = req.body;
    memory.push({ role: 'user', content: message });

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: memory,
    });

    const reply = response.choices[0].message.content;
    memory.push({ role: 'assistant', content: reply });

    res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI-chan failed 😭' });
  }
}
