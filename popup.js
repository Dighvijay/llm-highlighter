document.getElementById("fetch-instructions").addEventListener("click", async () => {
    // Send a message to the content script to fetch instructions
    // For Manifest V3, we can directly message the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { type: "FETCH_INSTRUCTIONS" });
    });
  });

// contentScript.js - add a listener for FETCH_INSTRUCTIONS
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "FETCH_INSTRUCTIONS") {
      fetchInstructions();
    }
  });