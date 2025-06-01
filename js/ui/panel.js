// js/ui/panel.js

console.log("✅ [Panel iframe] panel.js loaded");

// When the user clicks “Close Panel” inside the iframe:
document.getElementById("closeBtn")?.addEventListener("click", () => {
  console.log(
    "🛠 [Panel iframe] Close button clicked → finding main page tab to send closePanel"
  );
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    const pageTab = tabs.find(
      (t) => t.url.startsWith("http://") || t.url.startsWith("https://")
    );
    if (!pageTab || !pageTab.id) {
      console.warn(
        "⚠️ [Panel iframe] No web page tab found to send closePanel to"
      );
      return;
    }
    chrome.tabs.sendMessage(
      pageTab.id,
      { action: "closePanel" },
      (response) => {
        if (chrome.runtime.lastError) {
          console.warn(
            "⚠️ [Panel iframe] sendMessage(closePanel) error:",
            chrome.runtime.lastError.message
          );
        } else {
          console.log(
            "🛠 [Panel iframe] sendMessage(closePanel) response:",
            response
          );
        }
      }
    );
  });
});
