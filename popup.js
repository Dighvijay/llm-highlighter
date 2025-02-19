const input = document.getElementById("prompt");
const suggestionsDiv = document.getElementById("suggestions");
const submitBtn = document.getElementById("submit");
const responseDiv = document.getElementById("response");

// Mock auto-suggestions
const suggestions = ["What is AI?", "How does JavaScript work?", "Explain LLMs"];

input.addEventListener("input", () => {
    const value = input.value.toLowerCase();
    suggestionsDiv.innerHTML = "";
    if (value) {
        const filtered = suggestions.filter(s => s.toLowerCase().includes(value));
        filtered.forEach(s => {
            const div = document.createElement("div");
            div.classList.add("suggestion-item");
            div.textContent = s;
            div.onclick = () => {
                input.value = s;
                suggestionsDiv.style.display = "none";
            };
            suggestionsDiv.appendChild(div);
        });
        suggestionsDiv.style.display = filtered.length ? "block" : "none";
    } else {
        suggestionsDiv.style.display = "none";
    }
});

// Extract keywords from response
function extractKeywords(text) {
    const words = text.match(/\b\w{5,}\b/g); // Get words with 5+ letters
    return [...new Set(words)].slice(0, 18); // Remove duplicates & pick top 18
}

// Handle submit button click
submitBtn.addEventListener("click", () => {
    const prompt = input.value.trim();
    if (!prompt) return;

    responseDiv.innerText = "Fetching response...";
    
    chrome.runtime.sendMessage({ action: "fetchFromModel", prompt }, (response) => {
        if (response.error) {
            responseDiv.innerText = "Error fetching response.";
            console.error(response.error);
        } else {
            const responseText = response.response;
            responseDiv.innerText = responseText;

            // Extract keywords and send to content script
            const keywords = extractKeywords(responseText);
            console.log("Highlighting keywords:", keywords);
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: highlightKeywordsOnPage,
                    args: [keywords]
                });
            });
        }
    });
});

// Function to highlight keywords (must be self-contained)
function highlightKeywordsOnPage(keywords) {
    if (!keywords || keywords.length === 0) return;

    function walkAndHighlight(node) {
        if (node.nodeType === 3) { // Text node
            let text = node.nodeValue;
            keywords.forEach(keyword => {
                let regex = new RegExp(`\\b(${keyword})\\b`, "gi");
                if (regex.test(text)) {
                    let span = document.createElement("span");
                    span.innerHTML = text.replace(regex, `<span style="background-color: yellow; font-weight: bold;">$1</span>`);
                    node.replaceWith(span);
                }
            });
        } else if (node.nodeType === 1 && node.childNodes) { // Element node
            for (let i = 0; i < node.childNodes.length; i++) {
                walkAndHighlight(node.childNodes[i]);
            }
        }
    }

    walkAndHighlight(document.body);
}
