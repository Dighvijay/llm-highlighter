// contentScript.js

// Prepare a prompt that tells the LLM to output JSON
function buildPromptForSteps() {
    return [
      {
        role: "system",
        content: "You are an assistant that returns answers only in JSON format."
      },
      {
        role: "user",
        content: `Explain how to launch an EC2 instance in AWS. 
                  Return your answer as JSON with each step containing: 
                  "instruction" and "selector". 
                  Example:
                  {
                    "steps": [
                      {"instruction": "Click 'Launch Instance'","selector": "#launchInstanceButton"}
                    ]
                  }
                  Do not include any text outside this JSON.`
      }
    ];
  }
  
  function fetchInstructions() {
    // Build the request payload
    const payload = {
      model: "llama-3.3-70b-versatile",
      messages: buildPromptForSteps(),
      temperature: 0.7,
      // Add other parameters if needed (top_p, max_tokens, etc.)
    };
  
    chrome.runtime.sendMessage(
      { type: "FETCH_LLM_INSTRUCTIONS", payload },
      (response) => {
        if (!response) {
          console.error("No response from background script.");
          return;
        }
        if (response.success) {
          // response.data should be the parsed JSON from the LLM
          highlightSteps(response.data);
        } else {
          console.error("LLM call failed:", response.error);
        }
      }
    );
  }
  
  function highlightSteps(instructions) {
    // Expecting instructions = { steps: [ { instruction, selector }, ... ] }
    const steps = instructions.steps || [];
  
    steps.forEach((step, index) => {
      const { instruction, selector } = step;
      const el = document.querySelector(selector);
      if (el) {
        highlightElement(el, index + 1, instruction);
      }
    });
  }
  
  function highlightElement(element, stepNumber, text) {
    element.style.outline = "2px solid red";
    element.style.position = "relative";
  
    const label = document.createElement("div");
    label.textContent = `Step ${stepNumber}: ${text}`;
    label.style.position = "absolute";
    label.style.top = "0";
    label.style.left = "0";
    label.style.backgroundColor = "red";
    label.style.color = "white";
    label.style.padding = "2px 4px";
    label.style.fontSize = "12px";
    label.style.zIndex = "9999";
  
    element.appendChild(label);
  }
  
  // Listen for a message from the popup to trigger fetching instructions
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "TRIGGER_LLM_HIGHLIGHT") {
      fetchInstructions();
      sendResponse({ success: true });
    }
  });