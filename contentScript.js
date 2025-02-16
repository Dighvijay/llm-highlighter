chrome.runtime.sendMessage({ action: "fetchFromOpenAI", prompt: "What is AI?" }, (response) => {
  if (response.error) {
      console.error("Error fetching response:", response.error);
  } else {
      console.log("Response:", response.response);
  }
});
