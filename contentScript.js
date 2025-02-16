function getKeyDOMSnapshot() {
  // Get text content or attributes from key elements (this example extracts the innerText of elements with a specific class)
  const snapshot = Array.from(document.querySelectorAll('.aws-button, .aws-navigation'))
                        .map(el => ({ 
                          tag: el.tagName, 
                          text: el.innerText, 
                          id: el.id,
                          classes: el.className 
                        }));
  return snapshot;
}

function buildPromptForSteps(task) {
  const currentUrl = window.location.href;
  const pageTitle = document.title;
  const snapshot = JSON.stringify(getKeyDOMSnapshot());

  return [
    {
      role: "system",
      content: "You are an assistant that returns answers only in JSON format."
    },
    {
      role: "user",
      content: `On the AWS page with URL ${currentUrl} and title "${pageTitle}", given this snapshot of key DOM elements: ${snapshot}, explain how to ${task}. 
                Return your answer as JSON with each step containing "instruction" and "selector". 
                Example:
                {
                  "steps": [
                    {"instruction": "Click 'Launch Instance'", "selector": "#launchInstanceButton"}
                  ]
                }
                Do not include any text outside this JSON.`
    }
  ];
}


function highlightSteps(instructions) {
  console.log("Received instructions:", instructions);
  
  if (!instructions || !instructions.steps) {
      console.error("Invalid instructions format. Expected { steps: [...] }");
      return;
  }

  instructions.steps.forEach((step, index) => {
      console.log(`Step ${index + 1}:`);
      console.log("Instruction:", step.instruction);
      console.log("Selector:", step.selector);
      console.log("------------------------");
  });
}


function fetchInstructions() {
  const payload = {
      model: "llama-3.3-70b-versatile",
      messages: buildPromptForSteps(),
      temperature: 0.7
  };

  chrome.runtime.sendMessage(
      { type: "FETCH_LLM_INSTRUCTIONS", payload },
      (response) => {
          if (!response) {
              console.error("No response from background script.");
              return;
          }
          if (response.success) {
              console.log("Successfully received instructions:");
              console.log(response.data);
              highlightSteps(response.data);
          } else {
              console.error("LLM call failed:", response.error);
              // You can also display this error to the user
              alert(`Failed to get instructions: ${response.error}`);
          }
      }
  );
}


// Listen for a message from the popup to trigger fetching instructions
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "TRIGGER_LLM_HIGHLIGHT") {
      fetchInstructions(request.task);
      sendResponse({ success: true });
  }
});

function handleError(error) {
  console.error("Error:", error);
  // You can also display this to the user
  alert(`An error occurred: ${error.message}`);
}
