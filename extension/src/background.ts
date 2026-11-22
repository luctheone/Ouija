// Service worker — routes messages between popup/sidebar/content scripts
// Holds cross-tab journey state in chrome.storage (survives worker sleep).

import type { ExtensionMessage } from '../../web/src/types';

// Allow content scripts (untrusted contexts) to read/write chrome.storage.session.
// Without this, session-storage calls FROM THE CONTENT SCRIPT silently never invoke
// their callback — which hangs loadClipboardFromStorage(), and with it the floating
// clipboard panel and clipboard-based step verification. Must be set from a trusted
// context (the service worker). Idempotent — safe to call on every worker wake.
function grantSessionAccess() {
  try {
    chrome.storage.session
      .setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' })
      .catch(() => {});
  } catch { /* older Chrome without setAccessLevel */ }
}
grantSessionAccess();

chrome.runtime.onInstalled.addListener((details) => {
  grantSessionAccess();
  if (details.reason === 'install') {
    chrome.action.openPopup().catch(() => {});
  }
});

chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, _sendResponse) => {
  const tabId = sender.tab?.id;

  switch (message.type) {
    case 'CAPTURE_SCREENSHOT': {
      if (tabId) {
        chrome.tabs.captureVisibleTab(undefined, { format: 'jpeg', quality: 60 })
          .then((dataUrl) => {
            chrome.tabs.sendMessage(tabId, { type: 'SCREENSHOT_RESULT', dataUrl }).catch(() => {});
          })
          .catch((e) => {
            chrome.tabs.sendMessage(tabId, { type: 'SCREENSHOT_RESULT', dataUrl: null, error: String(e) }).catch(() => {});
          });
      }
      break;
    }
    case 'AUTH_SUCCESS': {
      // Use payload from popup directly — avoids storage race
      const authMsg = {
        type: 'AUTH_SUCCESS',
        apiKey: (message as any).apiKey || '',
        backendUrl: (message as any).backendUrl || '',
      };
      chrome.tabs.query({}, (tabs) => {
        for (const tab of tabs) {
          if (tab.id && tab.url && !tab.url.startsWith('chrome://')) {
            injectAndNotify(tab.id, authMsg);
          }
        }
      });
      break;
    }

    case 'AUTH_CLEARED':
      chrome.tabs.query({}, (tabs) => {
        for (const tab of tabs) {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { type: 'AUTH_CLEARED' }).catch(() => {});
          }
        }
      });
      break;

    case 'TOGGLE_SIDEBAR':
    case 'STEP_UPDATE':
    case 'RESHOW_OVERLAY':
    case 'SHOW_BADGE':
    case 'THEME_OVERRIDE':
    case 'JOURNEY_UPDATE':
    case 'FORK_EVENT':
    case 'VERIFY_REQUEST':
      if (tabId) {
        chrome.tabs.sendMessage(tabId, message).catch(() => {});
      }
      break;

    // NOTE: the live clipboard flow runs entirely through window.postMessage
    // (page → content script → sidebar iframe) and chrome.storage.session's
    // 'ouija_clipboard_items' array. The old runtime CLIPBOARD_SAVE/RETRIEVE
    // path (singular 'ouija_clipboard') was dead and has been removed.
  }

  // Return true to keep the message channel open for async responses
  return true;
});

async function injectAndNotify(tabId: number, message: object) {
  try {
    // Try sending first — if content script is already there, this works
    await chrome.tabs.sendMessage(tabId, message);
  } catch {
    // Content script not loaded — inject it, then send
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['dist/content.js'],
      });
      // Small delay for script to initialize
      setTimeout(() => {
        chrome.tabs.sendMessage(tabId, message).catch(() => {});
      }, 300);
    } catch {
      // Tab may not allow injection (chrome:// pages, etc.)
    }
  }
}
