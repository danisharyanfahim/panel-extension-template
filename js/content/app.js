console.log(
  "✅ [Content] content.js loaded; URL=",
  chrome.runtime.getURL("panel.html")
);

// 1) Listen for messages from popup (or anywhere else in the extension)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "closeMyExtensionPanel") {
    const panel = document.getElementById("myExtensionPanel");
    if (panel) {
      panel.remove();
      console.log("🛠 [Content] Received close message – panel removed");
      sendResponse({ result: "panel-removed" });
    } else {
      console.log("🛠 [Content] Received close message – no panel to remove");
      sendResponse({ result: "no-panel-found" });
    }
  }
  return true;
});

$(document).ready(() => {
  console.log("✅ jQuery content script is running");
  if ($("#myExtensionPanel").length === 0) {
    // Create a <div> that will hold our iframe
    const $panelContainer = $('<div id="myExtensionPanel"></div>');

    // Create an <iframe> whose src points to panel.html inside our extension
    const $iframe = $("<iframe>")
      .attr("src", chrome.runtime.getURL("panel.html"))
      .attr("id", "myExtensionIframe");

    // Append the iframe into the container
    $panelContainer.append($iframe);

    // Append the container to <body>
    $("body").append($panelContainer);

    console.log("✅ [Content Script] Side panel injected via jQuery");
  }
});
