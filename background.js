const GROQ_API_KEY = "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";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

chrome.runtime.onInstalled.addListener(() => {
    console.log("LLM Task Highlighter extension installed.");
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.type === "FETCH_LLM_INSTRUCTIONS") {
        const { payload } = request;

        try {
            console.log("Sending request to Groq API:", payload);
            
            const response = await fetch(GROQ_API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify(payload)
            });

            console.log("Groq API response received.");

            if (!response.ok) {
                throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
            }

            // Read the response body as JSON
            const data = await response.json();
            console.log("Parsed data:", data);

            const content = data.choices?.[0]?.message?.content;
            if (!content) {
                throw new Error("No content found in Groq response.");
            }

            let instructions;
            try {
                instructions = JSON.parse(content);
                console.log("Parsed instructions:", instructions);
            } catch (parseErr) {
                throw new Error("Failed to parse LLM content as JSON:\n" + content);
            }

            sendResponse({ success: true, data: instructions });
        } catch (error) {
            console.error("Groq LLM error:", error);
            sendResponse({ success: false, error: error.message });
        }

        return true; // Keep the message port open for async response
    }
});