function formatContent(text) {
  const fragment = document.createDocumentFragment();
  const blocks = text.split(/(```[\s\S]*?```)/g);
  blocks.forEach((block) => {
    if (block.startsWith("```")) {
      const inner = block.slice(3, -3);
      const newline = inner.indexOf("\n");
      const lang = newline > -1 ? inner.slice(0, newline).trim() : "";
      const code = newline > -1 ? inner.slice(newline + 1) : inner;

      const wrapper = document.createElement("div");
      wrapper.className = "code-block";

      if (lang) {
        const label = document.createElement("span");
        label.className = "code-lang";
        label.textContent = lang;
        wrapper.appendChild(label);
      }

      const pre = document.createElement("pre");
      const codeEl = document.createElement("code");
      codeEl.textContent = code.replace(/\n$/, "");
      pre.appendChild(codeEl);
      wrapper.appendChild(pre);

      const btn = document.createElement("button");
      btn.className = "copy-btn";
      btn.textContent = "Copy";
      btn.onclick = () => {
        navigator.clipboard.writeText(codeEl.textContent).then(() => {
          btn.textContent = "Copied!";
          btn.classList.add("copied");
          setTimeout(() => {
            btn.textContent = "Copy";
            btn.classList.remove("copied");
          }, 2000);
        });
      };
      wrapper.appendChild(btn);
      fragment.appendChild(wrapper);
    } else {
      const parts = block.split(/(`[^`\n]+`)/g);
      parts.forEach((part) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          const code = document.createElement("code");
          code.className = "inline-code";
          code.textContent = part.slice(1, -1);
          fragment.appendChild(code);
        } else if (part) {
          fragment.appendChild(document.createTextNode(part));
        }
      });
    }
  });
  return fragment;
}
