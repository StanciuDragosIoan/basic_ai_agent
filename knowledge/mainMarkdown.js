function markdownToHTML(markdown) {
  // Headings
  markdown = markdown.replace(/^##### (.*$)/gim, "<h5>$1</h5>");
  markdown = markdown.replace(/^#### (.*$)/gim, "<h4>$1</h4>");
  markdown = markdown.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  markdown = markdown.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  markdown = markdown.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Bold
  markdown = markdown.replace(/\*\*(.*?)\*\*/gim, "<b>$1</b>");

  // Italic
  markdown = markdown.replace(/\*(.*?)\*/gim, "<i>$1</i>");

  // Underscores → inline snippet
  markdown = markdown.replace(/_(.*?)_/gim, '<code class="snippet">$1</code>');

  // Line breaks
  markdown = markdown.replace(/\\nl/g, "<br><br>");

  // pre.code (runnable)
  markdown = markdown.replace(
    /pre\.code\s*([\s\S]*?)\s*pre\.code/gim,
    (_, code) =>
      `<div class="code-block"><pre><code>${code.trim()}</code></pre>` +
      `<button class="run-btn" onclick="runCode(this)">Run</button>` +
      `<button class="copy-btn" onclick="copyCode(this)">Copy</button></div>`,
  );

  // pre.conr (copy only)
  markdown = markdown.replace(
    /pre\.conr\s*([\s\S]*?)\s*pre\.conr/gim,
    (_, code) =>
      `<div class="code-block"><pre><code>${code.trim()}</code></pre>` +
      `<button class="copy-btn" onclick="copyCode(this)">Copy</button></div>`,
  );

  // Images
  markdown = markdown.replace(
    /!\[(.*?)\]\((.*?)\)/g,
    '<img class="center-img" src="$2" alt="$1" />',
  );

  // Image links
  markdown = markdown.replace(
    /\[([^\[]+)\]\(([^)]+\.(?:jpg|jpeg|png|gif|svg))\)/gim,
    '<img class="center-img" src="$2" alt="$1" />',
  );

  // Protect code blocks from link conversion
  const codeBlocks = [];
  markdown = markdown.replace(
    /<div class="code-block">[\s\S]*?<\/div>/g,
    (match) => {
      codeBlocks.push(match);
      return `{{CODE_BLOCK_${codeBlocks.length - 1}}}`;
    },
  );

  // Links
  markdown = markdown.replace(
    /\[(.*?)\]\((.*?)\)/gim,
    '<a href="$2" target="_blank">$1</a>',
  );

  // Restore code blocks
  markdown = markdown.replace(
    /{{CODE_BLOCK_(\d+)}}/g,
    (_, i) => codeBlocks[i],
  );

  return markdown.trim();
}

async function copyCode(btn) {
  const code = btn.closest(".code-block").querySelector("code").textContent;
  try {
    await navigator.clipboard.writeText(code);
    btn.textContent = "Copied!";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = "Copy";
      btn.classList.remove("copied");
    }, 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
}

async function runCode(btn) {
  const codeEl = btn.closest(".code-block").querySelector("code");
  const parent = btn.closest(".code-block");
  const outputLogs = [];
  const originalConsoleLog = console.log;

  console.log = (...args) => {
    const logArgs = args.map((arg) =>
      typeof arg === "object" && arg !== null
        ? JSON.stringify(arg, null, 2)
        : arg,
    );
    outputLogs.push(logArgs.join(" "));
    originalConsoleLog(...logArgs);
  };

  try {
    eval(codeEl.textContent);
    displayOutput(outputLogs.join("\n") || "(no output)", parent);
  } catch (error) {
    displayOutput(`Error: ${error.message}`, parent);
  } finally {
    console.log = originalConsoleLog;
  }
}

function displayOutput(output, parent) {
  let outputArea = parent.querySelector(".output-area");
  if (!outputArea) {
    outputArea = document.createElement("div");
    outputArea.className = "output-area";
    parent.appendChild(outputArea);
  }
  const outputElement = document.createElement("pre");
  outputElement.textContent = output;
  outputArea.appendChild(outputElement);
}

function createStickyScrollButton() {
  const button = document.createElement("button");
  button.textContent = "Scroll to Bottom";
  button.className = "sticky-scroll-button";
  document.body.appendChild(button);
  button.addEventListener("click", () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  });
}
createStickyScrollButton();
