// This function is an example that extracts context from the current page.
function gatherPageContext() {
    // For AWS, you could gather the path, the AWS service name, etc.
    // Example: ["/ec2", "/s3", ...]
    const urlPath = window.location.pathname;
    // Or use the document title
    const title = document.title;
  
    // You can gather user selections, DOM elements, etc.
    return `The user is on the page: ${title}, URL path: ${urlPath}`;
  }
  
  // This function highlights a DOM element (just an example).
  function highlightElement(element) {
    element.style.outline = "2px solid #ff0000";
  }
  
  // Listen for messages from the background or popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "HIGHLIGHT_STEPS") {
      const steps = request.data;
      // `steps` might be an array of instructions describing which selectors to highlight
      steps.forEach(step => {
        // If your LLM returns a selector or some reference
        const element = document.querySelector(step.selector);
        if (element) {
          highlightElement(element);
        }
      });
      sendResponse({ success: true });
    }
  });
  
  // You could also provide a function to send a request to the background script
  async function fetchInstructions() {
    const context = gatherPageContext();
  
    // Build the prompt for the LLM
    const prompt = `
      I'm on an AWS console page. The context is: ${context}.
      Give me step-by-step instructions to perform a common task.
      Return a structured JSON with each step, a short description, and a CSS selector if relevant.
    `;
  
    chrome.runtime.sendMessage({
      type: "FETCH_LLM_INSTRUCTIONS",
      prompt
    }, response => {
      if (response.success) {
        const data = response.data;
        // The LLM might return a structured object with steps
        // For simplicity, let's assume the LLM returned something like:
        // {
        //    steps: [
        //       { instruction: "Click Launch Instance", selector: "#launchInstanceButton" },
        //       ...
        //    ]
        // }
        if (data.steps) {
          // Tell the content script to highlight steps
          chrome.runtime.sendMessage({
            type: "HIGHLIGHT_STEPS",
            data: data.steps
          });
        }
      } else {
        console.error("Failed to fetch LLM instructions:", response.error);
      }
    });
  }
  
  // Optionally, you can automatically trigger instructions on certain pages
  // or wait for the user to click the extension’s popup button.
  // E.g., fetchInstructions();