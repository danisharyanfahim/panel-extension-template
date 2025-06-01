console.log("✅ [Panel iframe] panel.js loaded successfully");

document.getElementById("closeBtn")?.addEventListener("click", () => {
  // Query the active tab in the current window
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;
    if (!tabId) {
      console.warn(
        "⚠️ [Panel iframe] Could not find active tab to send close message"
      );
      return;
    }
    chrome.tabs.sendMessage(
      tabId,
      { action: "closeMyExtensionPanel" },
      (response) => {
        if (chrome.runtime.lastError) {
          console.warn(
            "⚠️ [Panel iframe] sendMessage error:",
            chrome.runtime.lastError.message
          );
        } else {
          console.log("🛠 [Panel iframe] sendMessage close response:", response);
        }
      }
    );
  });
});
