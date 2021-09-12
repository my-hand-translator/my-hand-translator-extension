const injectTextSelectionComponent = () => {
  const div = document.createElement("div");
  div.id = "textSelection";
  document.body.appendChild(div);
};

chrome.runtime.onInstalled.addListener(() => {
  console.log("Chrome extension is successfully installed!");
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && /^http/.test(tab.url)) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        function: injectTextSelectionComponent,
      });
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["./textSelection.bundle.js"],
      });
    } catch (error) {
      console.log(error);
    }
  }
});

async function getCurrentTab() {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

chrome.tabs.onActivated.addListener(async () => {
  const { url: currentUrl } = await getCurrentTab();

  chrome.storage.sync.set({ currentUrl });
});
