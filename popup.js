document.getElementById("executeButton").addEventListener("click", () => {
  const task = document.getElementById("taskInput").value;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { 
          type: "TRIGGER_LLM_HIGHLIGHT",
          task: task 
      });
  });
});
