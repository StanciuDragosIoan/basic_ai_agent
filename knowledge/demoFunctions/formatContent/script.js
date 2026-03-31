//v1 (create fragment)
// function formatContent(text) {
//   const fragment = document.createDocumentFragment();

//   fragment.appendChild(document.createTextNode(text));

//   return fragment;
// }

// const text = 'test';
// document.getElementById('output').appendChild(formatContent(text));

//v2 (create pre tag from string between `` e.g. "`test`")
// function formatContent(text) {
//   const fragment = document.createDocumentFragment();

//   const parts = text.split(/(`[^`\n]+`)/g);

//   parts.forEach((part) => {
//     if (part.startsWith('`') && part.endsWith('`')) {
//       const code = document.createElement('code');
//       code.className = 'inline-code';
//       code.textContent = part.slice(1, -1);
//       fragment.appendChild(code);
//     } else {
//       fragment.appendChild(document.createTextNode(part));
//     }
//   });

//   return fragment;
// }

// const text = '`test`';
// document.getElementById('output').appendChild(formatContent(text));

//v3 (bigger code blocks)

// function formatContent(text) {
//   const fragment = document.createDocumentFragment();
//   const blocks = text.split(/(```[\s\S]*?```)/g);

//   blocks.forEach((block) => {
//     if (block.startsWith('```')) {
//       const codeText = block.slice(3, -3);

//       const pre = document.createElement('pre');
//       const code = document.createElement('code');
//       code.className = 'code-block';
//       code.textContent = codeText;
//       pre.appendChild(code);

//       fragment.appendChild(pre);
//     } else {
//       fragment.appendChild(document.createTextNode(block));
//     }
//   });

//   return fragment;
// }

// const text = `
// Hello

// \`\`\`
// console.log("hi")
// \`\`\`
// `;
// document.getElementById('output').appendChild(formatContent(text));

//4 combine inline and block parsing

// function formatContent(text) {
//   const fragment = document.createDocumentFragment();
//   const blocks = text.split(/(```[\s\S]*?```)/g);

//   blocks.forEach((block) => {
//       if (block.startsWith('```')) {
//           const inner = block.slice(3, -3); // remove opening/closing ```
//           const newline = inner.indexOf('\n'); // find first newline
//           const lang = newline > -1 ? inner.slice(0, newline).trim() : '';
//           const code = newline > -1 ? inner.slice(newline + 1) : inner;
//       const codeText = block.slice(3, -3);

//       const pre = document.createElement('pre');

//       code.className = 'code-block';
//       code.textContent = codeText;
//       pre.appendChild(code);

//       fragment.appendChild(pre);
//     } else {
//       const parts = block.split(/(`[^`\n]+`)/g);

//       parts.forEach((part) => {
//         if (part.startsWith('`') && part.endsWith('`')) {
//           const code = document.createElement('code');
//           code.className = 'inline-code';
//           code.textContent = part.slice(1, -1);
//           fragment.appendChild(code);
//         } else {
//           fragment.appendChild(document.createTextNode(part));
//         }
//       });
//     }
//   });

//   return fragment;
// }

// const text =
//   `
// Hello ` +
//   '`inline code`' +
//   `

// \`\`\`js
// console.log('Hello world')
// \`\`\`

// Back to ` +
//   '`another inline`' +
//   ` text
// `;
//  document.getElementById('output').appendChild(formatContent(text));

//5 add language label

// function formatContent(text) {
//   const fragment = document.createDocumentFragment();

//   // Step 1: split text into code blocks or normal text
//   const blocks = text.split(/(```[\s\S]*?```)/g);

//   blocks.forEach((block) => {
//     // If this is a code block
//     if (block.startsWith('```')) {
//       // Remove opening/closing ```
//       const inner = block.slice(3, -3);

//       // Find first newline to separate language from code
//       const newline = inner.indexOf('\n');
//       const lang = newline > -1 ? inner.slice(0, newline).trim() : '';
//       const codeText = newline > -1 ? inner.slice(newline + 1) : inner;

//       // Build the code block wrapper
//       const wrapper = document.createElement('div');
//       wrapper.className = 'code-block';

//       // Add language label if exists
//       if (lang) {
//         const label = document.createElement('span');
//         label.className = 'code-lang';
//         label.textContent = lang;
//         wrapper.appendChild(label);
//       }

//       // Create pre/code elements
//       const pre = document.createElement('pre');
//       const codeEl = document.createElement('code');
//       codeEl.textContent = codeText.replace(/\n$/, '');
//       pre.appendChild(codeEl);
//       wrapper.appendChild(pre);

//       fragment.appendChild(wrapper);
//     } else {
//       // Normal text: handle inline code
//       const parts = block.split(/(`[^`\n]+`)/g);
//       parts.forEach((part) => {
//         if (part.startsWith('`') && part.endsWith('`')) {
//           const code = document.createElement('code');
//           code.className = 'inline-code';
//           code.textContent = part.slice(1, -1);
//           fragment.appendChild(code);
//         } else if (part) {
//           fragment.appendChild(document.createTextNode(part));
//         }
//       });
//     }
//   });

//   return fragment;
// }

// // Example usage
// const text = `
// Hello, this is \`inline code\`.

// \`\`\`js
// console.log('Hello world');
// \`\`\`

// Back to \`another inline\` code example.
// `;

// document.getElementById('output').appendChild(formatContent(text));

//6 add copy btn

function formatContent(text) {
  const fragment = document.createDocumentFragment();

  // Step 1: split text into code blocks or normal text
  const blocks = text.split(/(```[\s\S]*?```)/g);

  blocks.forEach((block) => {
    // If this is a code block
    if (block.startsWith('```')) {
      // Remove opening/closing ```
      const inner = block.slice(3, -3);

      // Find first newline to separate language from code
      const newline = inner.indexOf('\n');
      const lang = newline > -1 ? inner.slice(0, newline).trim() : '';
      const codeText = newline > -1 ? inner.slice(newline + 1) : inner;

      // Build the code block wrapper
        const wrapper = document.createElement('div');
        const btn = document.createElement('button');
        btn.className
        btn.textContent = 'Copy';

        btn.onclick = () => {
          navigator.clipboard.writeText(codeText);
        };

        wrapper.appendChild(btn);
      wrapper.className = 'code-block';

      // Add language label if exists
      if (lang) {
        const label = document.createElement('span');
        label.className = 'code-lang';
        label.textContent = lang;
        wrapper.appendChild(label);
      }

      // Create pre/code elements
      const pre = document.createElement('pre');
      const codeEl = document.createElement('code');
      codeEl.textContent = codeText.replace(/\n$/, '');
      pre.appendChild(codeEl);
      wrapper.appendChild(pre);

      fragment.appendChild(wrapper);
    } else {
      // Normal text: handle inline code
      const parts = block.split(/(`[^`\n]+`)/g);
      parts.forEach((part) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          const code = document.createElement('code');
          code.className = 'inline-code';
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

// Example usage
const text = `
Hello, this is \`inline code\`.

\`\`\`js
console.log('Hello world');
\`\`\`

Back to \`another inline\` code example.
`;

document.getElementById('output').appendChild(formatContent(text));
