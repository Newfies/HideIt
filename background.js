chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    blacklist: ["John Doe", "123 Main St"]
  });
});