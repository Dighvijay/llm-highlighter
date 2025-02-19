chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "highlightKeywords") {
      highlightKeywords(message.keywords);
  }
});

function highlightKeywords(keywords) {
  if (!keywords || keywords.length === 0) return;
  
  document.body.innerHTML = document.body.innerHTML.replace(
      new RegExp(`\\b(${keywords.join("|")})\\b`, "gi"),
      '<span style="background-color: yellow; font-weight: bold;">$1</span>'
  );
}
