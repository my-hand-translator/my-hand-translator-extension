const handleMouseDragEnd = () => {
  const div = document.createElement("div");
  div.id = "mouseDrag";
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
        function: handleMouseDragEnd,
      });
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["./mouseDrag.bundle.js"],
      });
    } catch (error) {
      console.log(error);
    }
  }
});
