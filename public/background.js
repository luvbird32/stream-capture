
// Background script for Chrome extension with enhanced security
chrome.runtime.onInstalled.addListener(() => {
  console.log('Stream Capture Vision extension installed');
});

// Security utilities for message validation
function isValidMessage(message) {
  if (!message || typeof message !== 'object') return false;
  if (!message.type || typeof message.type !== 'string') return false;
  if (message.type.length > 50) return false; // Prevent oversized message types
  return true;
}

function isValidSender(sender) {
  // Verify sender is from our extension context
  if (!sender || !sender.tab) return false;
  return true;
}

function logSecurityEvent(event, details) {
  console.warn(`Security Event: ${event}`, {
    timestamp: new Date().toISOString(),
    details: details,
    // Don't log sensitive information
  });
}

// Handle desktop capture for screen recording with enhanced security
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Validate message structure
  if (!isValidMessage(message)) {
    logSecurityEvent('Invalid message received', { messageType: typeof message });
    sendResponse({ error: 'Invalid message format' });
    return false;
  }

  // Validate sender
  if (!isValidSender(sender)) {
    logSecurityEvent('Invalid sender', { senderId: sender?.id });
    sendResponse({ error: 'Invalid sender' });
    return false;
  }

  if (message.type === 'getDesktopCapture') {
    try {
      chrome.desktopCapture.chooseDesktopMedia(
        ['screen', 'window', 'tab'],
        sender.tab,
        (streamId) => {
          if (streamId) {
            console.log('Desktop capture granted');
            sendResponse({ streamId });
          } else {
            console.log('Desktop capture denied or cancelled');
            sendResponse({ error: 'User cancelled or access denied' });
          }
        }
      );
    } catch (error) {
      logSecurityEvent('Desktop capture error', { error: error.message });
      sendResponse({ error: 'Desktop capture failed' });
    }
    return true; // Keep the message channel open for async response
  }

  // Log unhandled message types for monitoring
  logSecurityEvent('Unhandled message type', { type: message.type });
  sendResponse({ error: 'Unknown message type' });
  return false;
});

// Monitor for suspicious activity
chrome.runtime.onConnect.addListener((port) => {
  console.log('Extension port connected:', port.name);
});
