const GROQ_API_KEY = "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";

const GROQ_API_URL = "https://api.groq.com/v1/chat/completions";

chrome.runtime.onInstalled.addListener(() => {
    console.log("LLM Task Highlighter extension installed.");
  });

// Optional: Listen for messages from content script to call the LLM API
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.type === "FETCH_LLM_INSTRUCTIONS") {
      const { prompt } = request;
  
      // Call your LLM API or external service here
      try {
        const response = await fetch(GROQ_ENDPOINT, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify(payload)
          });
    
          if (!response.ok) {
            throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
          }
    
          // Response is your JSON object (similar to the example you provided)
          const data = await response.json();
    
          // The text we want is typically: data.choices[0].message.content
          const content = data.choices?.[0]?.message?.content;
          if (!content) {
            throw new Error("No content found in Groq response.");
          }
    
          // If your LLM was instructed to return a JSON object, `content` is a JSON string. 
          // We need to parse it:
          let instructions;
          try {
            instructions = JSON.parse(content); 
            // Expected format: { steps: [ {instruction, selector}, ... ] }
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