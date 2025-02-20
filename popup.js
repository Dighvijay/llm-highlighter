document.getElementById("executeButton").addEventListener("click", () => {
  const task = document.getElementById("taskInput").value;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { 
          type: "TRIGGER_LLM_HIGHLIGHT",
          task: task 
      });
  });
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "LLM_RESPONSE") {
        console.log("Received response in popup:", request.data);
        const responseTextarea = document.getElementById('responseTextarea');
        if (responseTextarea) {
            responseTextarea.value = JSON.stringify(request.data, null, 2);
        } else {
            console.error("Textarea not found in popup.");
        }
    }
});


