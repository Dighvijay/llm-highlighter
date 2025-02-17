const GROQ_API_KEY = "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";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

chrome.runtime.onInstalled.addListener(() => {
  console.log("LLM Task Highlighter extension installed.");
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type === "FETCH_LLM_INSTRUCTIONS") {
    const { payload } = request;
    try {
      console.log("Sending request to Groq API:", payload);
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
      }

      // Get the raw text response and trim any extra whitespace.
      const rawText = (await response.text()).trim();
      console.log("Raw Groq API response:", rawText);

      // Extract the candidate JSON block using a regular expression.
      const jsonMatch = rawText.match(/{[\s\S]*}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON block found in the response.");
      }
      const candidate = jsonMatch[0];
      console.log("Candidate JSON:", candidate);

      // Parse the candidate string. This should yield the full response object.
      const data = JSON.parse(candidate);

      // Extract the content field which contains the LLM answer.
      let rawContent = data.choices?.[0]?.message?.content;
      if (!rawContent) {
        throw new Error("No content found in Groq response.");
      }
      console.log("Raw content from LLM:", rawContent);

      // Remove Markdown code fences (```), if any, from the content.
      const cleanedContent = rawContent
        .trim()
        .replace(/^```[\s\n]*/, "")
        .replace(/[\s\n]*```$/, "")
        .trim();
      console.log("Cleaned content:", cleanedContent);

      // Parse the cleaned content as JSON.
      let instructions;
      try {
        instructions = JSON.parse(cleanedContent);
        console.log("Parsed instructions:", instructions);
      } catch (parseErr) {
        throw new Error("Failed to parse LLM response as JSON:\n" + cleanedContent);
      }

      sendResponse({ success: true, data: instructions });
    } catch (error) {
      console.error("Groq LLM error:", error);
      sendResponse({ success: false, error: error.message });
    }
    return true;
  }
});
