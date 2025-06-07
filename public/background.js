
// Background script for Chrome extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Stream Capture Vision extension installed');
});

// Handle desktop capture for screen recording
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getDesktopCapture') {
    chrome.desktopCapture.chooseDesktopMedia(
      ['screen', 'window', 'tab'],
      sender.tab,
      (streamId) => {
        if (streamId) {
          sendResponse({ streamId });
        } else {
          sendResponse({ error: 'User cancelled or access denied' });
        }
      }
    );
    return true; // Keep the message channel open for async response
  }
});
