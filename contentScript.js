// contentScript.js

// Extract the snapshot of key DOM elements.
function getKeyDOMSnapshot() {
  // Adjust the selector as needed to capture key buttons/navigation items.
  const elements = document.querySelectorAll('.aws-button, .aws-navigation');
  const snapshot = Array.from(elements).map(el => ({
    tag: el.tagName,
    text: el.innerText.trim(),
    id: el.id,
    classes: el.className
  }));
  return snapshot;
}

function buildPromptForSteps(task) {
  const currentUrl = window.location.href;
  const pageTitle = document.title;
  const snapshot = JSON.stringify(getKeyDOMSnapshot()); // Providing a JSON snapshot

  return [
    {
      role: "system",
      content: "You are an assistant that returns answers only in JSON format."
    },
    {
      role: "user",
      content: `On the AWS page with URL: ${currentUrl} and title: "${pageTitle}", given this DOM snapshot: ${snapshot},
                explain how to ${task}. 
                Return your answer as JSON with each step containing "instruction" and "selector". 
                Example:
                {
                  "steps": [
                    {"instruction": "Click 'Launch Instance'", "selector": "#launchInstanceButton"}
                  ]
                }
                Do not include any extra text.`
    }
  ];
}

function fetchInstructions(task) {
  const payload = {
    model: "llama-3.3-70b-versatile",
    messages: buildPromptForSteps(task),
    temperature: 0.7
  };

  chrome.runtime.sendMessage({ type: "FETCH_LLM_INSTRUCTIONS", payload }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Error sending message:", chrome.runtime.lastError.message);
      return;
    }
  
    if (!response) {
      console.error("No response from background script.");
      return;
    }
  
    if (response.success) {
      console.log("LLM instructions received:", response.data);
      // Send the response back to the popup.js
      chrome.runtime.sendMessage({ 
      type: "LLM_RESPONSE", 
      data: response.data 
      });

    } else {
      console.error("LLM call failed:", response.error);
      alert(`Failed to get instructions: ${response.error}`);
    }
  });  
}

// Listen for a message from the popup to trigger instruction fetching.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "TRIGGER_LLM_HIGHLIGHT") {
    // Use request.task passed from the popup.
    fetchInstructions(request.task);
    sendResponse({ success: true });
  }
});
