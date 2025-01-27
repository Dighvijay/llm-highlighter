document.getElementById("btn-highlight").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs.length) return;
    const tabId = tabs[0].id;
    chrome.tabs.sendMessage(tabId, { type: "TRIGGER_LLM_HIGHLIGHT" }, (response) => {
      if (response && response.success) {
        console.log("Highlight triggered.");
      } else {
        console.error("Failed to trigger highlight.");
      }
    });
  });
});