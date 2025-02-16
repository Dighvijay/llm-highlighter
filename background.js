chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchFromOpenAI") {
      fetch("https://api-inference.huggingface.co/models/google/gemma-2-2b-it", {
          method: "POST",
          headers: {
              "Authorization": "Bearer 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",
              "Content-Type": "application/json"
          },
          body: JSON.stringify({ inputs: message.prompt })  // Fix body format
      })
      .then(response => response.json())
      .then(data => {
          console.log("API Response:", data);
          sendResponse({ response: data[0]?.generated_text || "No response." }); // Fix response handling
      })
      .catch(error => {
          console.error("API Error:", error);
          sendResponse({ error: "Error fetching response." });
      });

      return true; // Keep messaging channel open for async response
  }
});
