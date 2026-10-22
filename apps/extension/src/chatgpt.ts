export type InsertResult = 'inserted' | 'unavailable' | 'wrong-tab' | 'composer-missing' | 'failed';

export function isChatGPTUrl(url?: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && (parsed.hostname === 'chatgpt.com' || parsed.hostname === 'chat.openai.com');
  } catch {
    return false;
  }
}

export async function insertIntoChatGPT(text: string): Promise<InsertResult> {
  if (typeof chrome === 'undefined' || !chrome.tabs?.query || !chrome.scripting?.executeScript) return 'unavailable';
  try {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (!tab?.id || !isChatGPTUrl(tab.url)) return 'wrong-tab';
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      args: [text],
      func: (content: string): boolean => {
        const selectors = [
          '#prompt-textarea',
          '[data-testid="composer-input"]',
          'form [contenteditable="true"][role="textbox"]',
          'form textarea'
        ];
        const candidate = selectors.flatMap(selector => Array.from(document.querySelectorAll<HTMLElement>(selector)))
          .find(element => element.getClientRects().length > 0 && (element instanceof HTMLTextAreaElement || element.isContentEditable));
        if (!candidate) return false;
        candidate.focus();
        if (candidate instanceof HTMLTextAreaElement) {
          const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;
          if (!setter) return false;
          const prefix = candidate.value ? `${candidate.value}\n` : '';
          setter.call(candidate, `${prefix}${content}`);
          candidate.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: content }));
          return true;
        }
        if (!candidate.isContentEditable) return false;
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(candidate);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
        if (candidate.textContent?.trim()) document.execCommand('insertText', false, '\n');
        const inserted = document.execCommand('insertText', false, content);
        return inserted && (candidate.textContent?.includes(content) ?? false);
      }
    });
    return result[0]?.result ? 'inserted' : 'composer-missing';
  } catch {
    return 'failed';
  }
}
