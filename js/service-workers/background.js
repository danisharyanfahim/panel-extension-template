console.log("✅ Background script is running");

chrome.runtime.onInstalled.addListener(() => {
  // default state goes here
  // this runs ONE TIME ONLY (unless the user reinstalls your extension)
  console.log("Background script installed");
});

// setting state
chrome.storage.local.set({
  name: "Jack",
});

// getting state
chrome.storage.local.get("name", (data) => console.log(data));
