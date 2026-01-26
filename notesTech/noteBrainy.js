/*


You do NOT train the model.

    You:

    Keep the model general

    Inject your knowledge at runtime

    This is called RAG (Retrieval-Augmented Generation).

    Think of your agent as:

    🧠 Reasoning engine + 📚 personal notebook

1️⃣ Teaching domain knowledge (3 levels)

    Level 1 — System prompt (fast, limited)

    Good for:

    principles

    opinions

    style

    rules

    You are a senior software architect.
    You prefer clean architecture, DDD, and explicit boundaries.
    When answering, relate concepts to real systems.


    ✅ Easy
    ❌ Limited memory
    ❌ Not factual-heavy



    Level 2 — Inject documents into context (manual)

    Good for:

    small docs

    short notes

    const ARCH_NOTES = `
    Hexagonal architecture:
    - Ports define intent
    - Adapters implement infrastructure
    - Domain has no dependencies
    `;


    Then prepend to messages.

    ❌ Doesn’t scale
    ❌ Token limits


    ⭐ Level 3 — RAG (what you actually want)

        This is how you:

        teach architecture

        connect your notes

        revise knowledge conversationally


    2️⃣ RAG in simple terms

        Flow

        You write notes (Markdown / txt / docs)

        You embed them once

        Store embeddings locally

        On each question:

        find relevant notes

        inject them into the prompt

        📌 The model answers using your notes, not guessing.

    Minimal RAG architecture (local & free)

        /notes
        clean-architecture.md
        microservices.md
        caching.md

        embed_notes.js   ← run once
        chat.js          ← your agent
        vector_store.json

    4️⃣ Step-by-step implementation (Node.js)
        A) Write notes (Markdown is perfect)
        # Clean Architecture

        - Domain layer has no dependencies
        - Use cases orchestrate business rules
        - Infrastructure is replaceable

    B) Embed your notes (run once)
        Install
        npm install groq-sdk fs

*/
