// js/ui/popup.js

console.log("✅ [Popup] popup.js loaded");

// 1) “Open Side Panel” button
document.getElementById("openPanelBtn")?.addEventListener("click", () => {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    // Find the first tab whose URL starts with “http://” or “https://”
    const pageTab = tabs.find(
      (t) => t.url.startsWith("http://") || t.url.startsWith("https://")
    );
    if (!pageTab || !pageTab.id) {
      console.warn("⚠️ [Popup] No web page tab found to send openPanel to");
      return;
    }
    const tabId = pageTab.id;

    // Optionally inject jQuery + app.js. Since we already declared app.js in content_scripts,
    // it’s probably already there—so you can skip executeScript entirely and just send openPanel.
    // But if you need to force‐inject on demand, do it here:
    chrome.scripting
      .executeScript({
        target: { tabId: tabId },
        files: ["libs/jquery.min.js", "js/ui/app.js"],
      })
      .then(() => {
        console.log(
          "🛠 [Popup] executeScript(openPanel) resolved—now sending openPanel"
        );
        chrome.tabs.sendMessage(tabId, { action: "openPanel" }, (response) => {
          if (chrome.runtime.lastError) {
            console.warn(
              "⚠️ [Popup] sendMessage(openPanel) error:",
              chrome.runtime.lastError.message
            );
          } else {
            console.log("🛠 [Popup] sendMessage(openPanel) response:", response);
          }
        });
      })
      .catch((err) => {
        console.error("⚠️ [Popup] executeScript(openPanel) failed:", err);
      });
  });
});

// 2) “Close Side Panel” – find the first HTTP/HTTPS tab (skip chrome-extension:// tabs)
document.getElementById("closePanelBtn")?.addEventListener("click", () => {
  console.log(
    "🛠 [Popup] Close button clicked → finding main page tab to send closePanel"
  );
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    // Pick the first tab whose URL is not “chrome-extension://…”
    const pageTab = tabs.find(
      (t) => t.url.startsWith("http://") || t.url.startsWith("https://")
    );
    if (!pageTab || !pageTab.id) {
      console.warn("⚠️ [Popup] No web page tab found to send closePanel to");
      return;
    }
    chrome.tabs.sendMessage(
      pageTab.id,
      { action: "closePanel" },
      (response) => {
        if (chrome.runtime.lastError) {
          console.warn(
            "⚠️ [Popup] sendMessage(closePanel) error:",
            chrome.runtime.lastError.message
          );
        } else {
          console.log("🛠 [Popup] sendMessage(closePanel) response:", response);
        }
      }
    );
  });
});
