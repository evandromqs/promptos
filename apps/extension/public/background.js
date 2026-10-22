chrome.action.onClicked.addListener(async tab => {
  if (!tab.id) return;
  if (tab.url && /^https:\/\/(chatgpt\.com|chat\.openai\.com)(\/|$)/.test(tab.url)) {
    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'promptos:toggle' });
    } catch {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
      await chrome.tabs.sendMessage(tab.id, { type: 'promptos:toggle' });
    }
  } else {
    await chrome.tabs.create({ url: 'https://chatgpt.com/' });
  }
});
