# How Code Generation Saves Tokens in AI Agents

## The Core Problem: Context Bloat

When you build an AI agent that has tools or knowledge, the naive approach is to dump everything
into the system prompt upfront. The model reads it all before it even sees the user's message.

This is exactly what **Brainy-chan** was doing:

```js
// BEFORE — entire knowledge.md blasted into system prompt every single request
const memory = [{
  role: "system",
  content: `You are Brainy-chan. Use the following knowledge: ${chunks}` // 300+ lines always
}];
```

And what happens with MCP tools when not optimized:

```
Tool schemas in context → 150,000 tokens per request
```

Even if the user asks "what is 2+2", the agent still processes your entire knowledge base /
every tool schema before answering.

---

## The Blog Post Insight (Anthropic Engineering)

> Source: https://www.anthropic.com/engineering/code-execution-with-mcp

The breakthrough is deceptively simple:

**Instead of telling the agent WHAT the tools/knowledge are, give the agent CODE to FIND what it needs.**

### Old way (direct tool calls):
```
User message → [All 150k tokens of tool schemas] → LLM → Tool call → Result
```

### New way (code generation):
```
User message → [Tiny catalog: tool names only] → LLM writes code → Code executes → Relevant data → LLM → Answer
```

Measured result from the blog: **150,000 tokens → 2,000 tokens. A 98.7% reduction.**

For a 2-hour meeting transcript attached to Salesforce, the transcript was flowing through the
model **twice** in the old approach (once retrieved, once sent back). With code generation, the
transcript stays in the execution environment — the model only sees the final filtered output.

---

## The Three Principles

### 1. Progressive Disclosure
Don't load everything upfront. The agent navigates a filesystem of tool definitions and loads
only what it actually needs for the current task.

```
servers/
├── google-drive/   ← agent reads this README only if it needs Drive
├── salesforce/     ← agent reads this README only if it needs Salesforce
└── calendar/       ← agent reads this README only if it needs Calendar
```

### 2. In-Environment Data Processing
Large data gets filtered BEFORE reaching the model. If there are 10,000 spreadsheet rows,
the code runs a filter and hands the model 5 relevant rows, not 10,000.

```js
// Agent writes this code, it executes in a sandbox:
const rows = await readSpreadsheet("sales.csv");
const q4Sales = rows.filter(r => r.quarter === "Q4" && r.amount > 10000);
return q4Sales; // 5 rows, not 10,000
```

### 3. Code-Based Control Flow
Loops, retries, conditionals — all happen in the execution environment. The agent doesn't
have to ping-pong back and forth through the model loop for each iteration.

```js
// Agent writes this once, code handles the loop:
for (const contact of contacts) {
  await salesforce.updateRecord(contact.id, { status: "contacted" });
}
// Model sees one result, not N round-trips
```

---

## How This Applies to This Project

### Brainy-chan (knowledge base agent)

**Before:** `knowledge.md` (~320 lines, ~800 tokens) injected every request regardless of question.

**After:** A retrieval function finds the 1-2 relevant chunks (~50-100 tokens), only those are injected.

If Brainy has 100 knowledge entries someday, the savings become enormous. The agent effectively
"writes code" by generating a search query, the code executes the search, only the hit comes back.

```
Before: 800 tokens/request × 1000 requests = 800,000 tokens
After:  100 tokens/request × 1000 requests = 100,000 tokens
Savings: 87.5%
```

### AI-chan (tool-use agent)

**Before (if done naively):** All tool schemas in system prompt, every message, even for "hi".

**After:** Compact catalog (tool names + one-line descriptions) in system prompt. Model writes
a tool call (code). Only the called tool's schema is used, and only the tool's result comes back.

```
Before: 3 tools × 200 tokens each = 600 extra tokens every message
After:  Model calls 1 tool when needed, 0 tokens overhead when not needed
```

---

## The Pattern in Code

### Step 1: Retrieval instead of injection (Brainy-chan)

```js
function findRelevantChunks(query, chunks, topN = 2) {
  const queryWords = new Set(
    query.toLowerCase().split(/\W+/).filter(w => w.length > 3)
  );
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

// Usage:
const relevant = findRelevantChunks(userMessage, chunks);
// Inject only `relevant` into context, not all chunks
```

### Step 2: Tool use as "code generation" (AI-chan)

The model generates a tool call — this IS the code generation step. The model decides which
tool to invoke and with what arguments. Your server executes it and returns only the result.

```js
// Tool catalog in system prompt: compact, just names + descriptions
// Full schemas only sent when Groq's tool_choice activates them

const tools = [{
  type: "function",
  function: {
    name: "search_knowledge",
    description: "Search the knowledge base for a topic",
    parameters: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"]
    }
  }
}];

// Model "writes": { tool: "search_knowledge", args: { query: "kill process" } }
// Server executes: findRelevantChunks("kill process", chunks)
// Model sees: only the 1-2 matching knowledge chunks
```

### Step 3: Agentic loop (the full pattern)

```
1. User sends message
2. Agent sees: system prompt + message + compact tool list
3. Agent writes a tool call (code generation)
4. Server executes the tool call (code execution)
5. Result injected back, agent produces final answer
6. Total tokens used: system prompt + message + 1 tool schema + 1 result
   NOT: system prompt + all tool schemas + all knowledge
```

---

## Privacy Bonus

Because data stays in the execution environment and only filtered output reaches the model,
sensitive data (PII, passwords, internal IDs) never has to flow through the LLM. The MCP client
can tokenize or redact before handing results back to the model.

---

## Trade-offs

| | Direct injection | Code generation / lazy loading |
|---|---|---|
| Token cost | High (always pays full cost) | Low (pays only for what's used) |
| Latency | One round-trip | Sometimes two (retrieve then answer) |
| Complexity | Simple | Needs retrieval logic or sandbox |
| Privacy | Data flows through model | Data can stay in env |
| Scalability | Breaks with large knowledge/tools | Scales to thousands of tools |

The two-step latency is almost always worth it at scale. For small knowledge bases (<50 entries)
the savings are modest. For large ones (hundreds of tools / thousands of KB entries), the
difference is night and day.

---

## Practical Note: Not All Models Support Structured Tool Calling

When we implemented tool calling for AI-chan using Groq's `llama-3.1-8b-instant`, we hit a real
gotcha: the model does not properly implement the structured tool call response format. Instead of
returning `finish_reason: "tool_calls"` with a parsed tool call object, it embeds the call as raw
text in the content field — something like:

```
Simple math, I've got this. <function=search_knowledge>{"query": "1 + 1"}<function>
```

Because `finish_reason` was always `"stop"`, the tool-execution branch in the server never fired,
and that raw function syntax leaked straight to the user.

**The fix:** fall back to proactive RAG (retrieve relevant chunks before the LLM call) rather than
reactive tool calling. The token savings are identical — only relevant knowledge reaches the model —
but it works reliably regardless of whether the model supports structured tool use.

**Rule of thumb:** structured tool calling (`tool_choice: "auto"`, `finish_reason: "tool_calls"`)
is reliable with Claude, GPT-4-class models, and larger open-source models (llama-3.3-70b+).
Smaller/faster models (8b instant variants) often fake it in plain text. Always test with a query
that should trigger a tool call and inspect `finish_reason` before shipping.

---

## Key Takeaway

> The model should navigate to what it needs, not be handed everything it might ever need.

That one shift — from **push all context** to **agent pulls relevant context via code** — is
the entire insight of the blog post, and it maps directly to retrieval-augmented generation (RAG)
and MCP's code-execution pattern. The "code" is the bridge: it runs in the environment, keeps
data local, and only surfaces what the model actually needs.
