import Groq from 'groq-sdk';
import readline from 'readline';
import 'dotenv/config';
// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY,
// });

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Conversation memory
const memory = [
  {
    role: 'system',
    content: `
You are a helpful conversational AI agent.
You remember the conversation.
Be concise and clear.
    `,
  },
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function chat(userInput) {
  memory.push({ role: 'user', content: userInput });

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: memory,
  });

  const reply = response.choices[0].message.content;

  memory.push({ role: 'assistant', content: reply });

  console.log('\n🤖:', reply, '\n');
}

console.log("AI Agent started. Type 'exit' to quit.\n");

rl.on('line', async (input) => {
  if (input.toLowerCase() === 'exit') {
    rl.close();
    return;
  }

  await chat(input);
});
