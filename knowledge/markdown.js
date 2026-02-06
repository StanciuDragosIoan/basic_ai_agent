
// Fetch the markdown file
fetch('../knowledge.md')
    .then((response) => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then((markdownContent) => {
        document.getElementById('html-output').innerHTML =
            markdownToHTML(markdownContent);
    })
    .catch((error) => {
        console.error('There was a problem with the fetch operation:', error);
    });
