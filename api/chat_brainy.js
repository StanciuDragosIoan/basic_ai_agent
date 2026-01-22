import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Memory persists per function instance (good enough for personal projects)
const memory = [
  {
    role: 'system',
    content: `
You are Your name is Brainy-chan, a playful and spicy anime assistant.
Be concise, friendly, and a little teasing.
    `,
  },
];

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
