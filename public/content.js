
// Content script for Chrome extension
console.log('Stream Capture Vision content script loaded');

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ping') {
    sendResponse({ status: 'pong' });
  }
});
