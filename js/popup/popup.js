// js/popup.js
console.log("✅ [Popup] popup.js loaded and ready");

// 1) “Open Side Panel” — broadcast to all content scripts
document.getElementById("openPanelBtn")?.addEventListener("click", () => {
  console.log("🛠 [Popup] Open button clicked → sending openMyExtensionPanel");
  chrome.runtime.sendMessage({ action: "openMyExtensionPanel" }, (response) => {
    if (chrome.runtime.lastError) {
      console.warn(
        "⚠️ [Popup] sendMessage(open) error:",
        chrome.runtime.lastError.message
      );
    } else {
      console.log("🛠 [Popup] sendMessage(open) response:", response);
    }
  });
});

// 2) “Close Side Panel” — broadcast to all content scripts
document.getElementById("closePanelBtn")?.addEventListener("click", () => {
  console.log("🛠 [Popup] Close button clicked → sending closeMyExtensionPanel");
  chrome.runtime.sendMessage(
    { action: "closeMyExtensionPanel" },
    (response) => {
      if (chrome.runtime.lastError) {
        console.warn(
          "⚠️ [Popup] sendMessage(close) error:",
          chrome.runtime.lastError.message
        );
      } else {
        console.log("🛠 [Popup] sendMessage(close) response:", response);
      }
    }
  );
});
