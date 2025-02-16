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

// Handle submit button click
submitBtn.addEventListener("click", async () => {
    const prompt = input.value.trim();
    if (!prompt) return;

    responseDiv.innerText = "Fetching response...";
    
    chrome.runtime.sendMessage({ action: "fetchFromOpenAI", prompt }, (response) => {
        if (response.error) {
            responseDiv.innerText = "Error fetching response.";
            console.error(response.error);
        } else {
            responseDiv.innerText = response.response;
        }
    });
});
