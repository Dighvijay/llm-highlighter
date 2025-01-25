chrome.runtime.onInstalled.addListener(() => {
    console.log("LLM Task Highlighter extension installed.");
  });

// Optional: Listen for messages from content script to call the LLM API
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.type === "FETCH_LLM_INSTRUCTIONS") {
      const { prompt } = request;
  
      // Call your LLM API or external service here
      try {
        const response = await fetch("https://your-llm-endpoint.com/v1/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Include authorization header if needed
          },
          body: JSON.stringify({
            prompt: prompt,
            // model or parameters needed by your LLM service
          })
        });
  
        const data = await response.json();
        // Send instructions back to content script
        sendResponse({ success: true, data: data });
      } catch (error) {
        console.error(error);
        sendResponse({ success: false, error: error.message });
      }
  
      // Return true to indicate we will send a response asynchronously
      return true;
    }
  }); 