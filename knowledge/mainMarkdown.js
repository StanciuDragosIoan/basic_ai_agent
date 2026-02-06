function markdownToHTML(markdown) {
  // Convert headings
  markdown = markdown.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
  markdown = markdown.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  markdown = markdown.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  markdown = markdown.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  markdown = markdown.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Convert bold
  markdown = markdown.replace(/\*\*(.*)\*\*/gim, '<b>$1</b>');
  markdown = markdown.replace(/\*\*(.*)\*\*/gim, '<b>$1</b>');

  // Convert italic
  markdown = markdown.replace(/\*(.*)\*/gim, '<i>$1</i>');

  // Convert italic with underscores
  markdown = markdown.replace(/_(.*?)_/gim, '<i class="snippet">$1</i>');

  // Convert line breaks only if we type \nl
  markdown = markdown.replace(/\\nl/g, '<br><br>');

  // Convert pre.code syntax to <pre class="code">...</pre> for code we want to run
  markdown = markdown.replace(
    /pre\.code\s*([\s\S]*?)\s*pre\.code/gim,
    `<pre class="code">$1 <br> <button onClick="runCode(this.parentElement.textContent, this.parentElement)" class="runCode">RUN</button>
        <button onClick="copyCode(this.parentElement.textContent)" class="copyCode"><i class="fa-regular fa-copy"></i></button>
        </pre>`,
  );

  //covnert pre.conr to  <pre class="code">...</pre> for code we DO NOT want to run
  markdown = markdown.replace(
    /pre\.conr\s*([\s\S]*?)\s*pre\.conr/gim,
    `<pre class="code">$1
    <button onClick="copyCode(this.parentElement.textContent)" class="copyCode"><i class="fa-regular fa-copy"></i></button>
    </pre>`,
  );

  // Convert images with Markdown syntax ![alt](src) correctly
  markdown = markdown.replace(
    /!\[(.*?)\]\((.*?)\)/g,
    '<img class="center-img" src="$2" alt="$1" />',
  );

  // Convert anchor links that contain images correctly
  // Only replace anchor tags if they link to an image
  markdown = markdown.replace(
    /\[([^\[]+)\]\(([^)]+\.(?:jpg|jpeg|png|gif|svg))\)/gim,
    '<img class="center-img" src="$2" alt="$1" />',
  );

  // Match code blocks in <pre class="code"> tags and store them temporarily
  const codeBlocks = [];
  markdown = markdown.replace(/<pre class="code">[\s\S]*?<\/pre>/g, (match) => {
    codeBlocks.push(match);
    return `{{CODE_BLOCK_${codeBlocks.length - 1}}}`;
  });

  markdown = markdown.replace(
    /<pre class="noLink">[\s\S]*?<\/pre>/g,
    (match) => {
      codeBlocks.push(match);
      return `{{CODE_BLOCK_${codeBlocks.length - 1}}}`;
    },
  );

  // Convert links outside of <pre class="code"> blocks
  markdown = markdown.replace(
    /\[(.*?)\]\((.*?)\)/gim,
    '<a href="$2" target="_blank">$1</a>',
  );

  // Restore <pre class="code"> blocks
  markdown = markdown.replace(/{{CODE_BLOCK_(\d+)}}/g, (match, index) => {
    return codeBlocks[index];
  });

  //support for table

  return markdown.trim(); // Remove any extra spaces or lines
}

async function copyCode(code) {
  const codeClean = code.split('RUN')[0].trim();
  try {
    await navigator.clipboard.writeText(codeClean);
  } catch (err) {
    console.error('Failed to copy code: ', err);
  }
}

//optionalCode param that we want to be able to run without explicitly defining in the notes
async function runCode(code, parent) {
  const outputLogs = [];
  const originalConsoleLog = console.log;

  console.log = (...args) => {
    const logArgs = args.map((arg) =>
      typeof arg === 'object' && arg !== null
        ? JSON.stringify(arg, null, 2)
        : arg,
    );
    outputLogs.push(logArgs.join(' '));
    originalConsoleLog(...logArgs);
  };

  try {
    let codeToRun = code.split('RUN')[0].trim();

    eval(codeToRun);
    displayOutput(outputLogs.join('\n'), parent);
  } catch (error) {
    displayOutput(`Error: ${error.message}`, parent);
  } finally {
    console.log = originalConsoleLog;
  }
}

function displayOutput(output, parent) {
  let outputArea = parent.querySelector('.output-area');
  if (!outputArea) {
    outputArea = document.createElement('div');
    outputArea.className = 'output-area';
    parent.appendChild(outputArea);
  }

  const outputElement = document.createElement('pre');
  outputElement.textContent = output;
  outputArea.appendChild(outputElement);
}

//sticky btn
function createStickyScrollButton() {
  // Create button element
  const button = document.createElement('button');
  button.textContent = 'Scroll to Bottom';
  button.className = 'sticky-scroll-button';

  // Append button to the body
  document.body.appendChild(button);

  // Add click event listener to scroll to bottom
  button.addEventListener('click', () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  });
}
createStickyScrollButton();
