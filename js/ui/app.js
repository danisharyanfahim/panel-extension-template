// js/ui/app.js
// (Make sure "libs/jquery.min.js" appears before this in manifest.json)
console.log("✅ [Content] app.js injected; listening for openPanel/closePanel");

// Listen for “openPanel” → inject panel, “closePanel” → remove it
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openPanel") {
    // If panel already exists, skip
    if ($("#myExtensionPanel").length) {
      console.log("🛠 [Content] openPanel received but panel already exists");
      sendResponse({ result: "already-injected" });
      return;
    }

    console.log("🛠 [Content] openPanel received → injecting side panel");

    // Create <div id="myExtensionPanel"></div> via jQuery
    const $panelContainer = $("<div>", { id: "myExtensionPanel" });

    // Create <iframe id="myExtensionIframe" src="chrome-extension://…/panel.html"></iframe>
    const $iframe = $("<iframe>", {
      id: "myExtensionIframe",
      src: chrome.runtime.getURL("panel.html"),
    });

    // Append the iframe into the panel, and attach the panel to <body>
    $panelContainer.append($iframe).appendTo("body");

    console.log("✅ [Content] Side panel injected");
    sendResponse({ result: "panel-injected" });
    return;
  }

  if (message.action === "closePanel") {
    // Simply remove the entire #myExtensionPanel, if it exists
    if ($("#myExtensionPanel").length) {
      $("#myExtensionPanel").remove();
      console.log("🛠 [Content] closePanel received → panel removed");
      sendResponse({ result: "panel-removed" });
    } else {
      console.log("🛠 [Content] closePanel received → no panel to remove");
      sendResponse({ result: "no-panel-found" });
    }
    return;
  }

  // If no action matched, do nothing
  return true;
});
