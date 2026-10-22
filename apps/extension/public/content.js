(() => {
  if (window.top !== window || document.getElementById('promptos-overlay-host')) return;

  const host = document.createElement('div');
  host.id = 'promptos-overlay-host';
  const shadow = host.attachShadow({ mode: 'closed' });
  const style = document.createElement('style');
  style.textContent = `
    :host { all: initial; position: fixed; z-index: 2147483647; font-family: Arial, sans-serif; }
    *, *::before, *::after { box-sizing: border-box; }
    #launcher { position: fixed; top: var(--launcher-top, 52%); right: 0; width: 42px; height: 48px; display: flex; align-items: center; justify-content: center; padding: 0; border: 1px solid #4e7a9e; border-right: 0; border-radius: 13px 0 0 13px; color: #fff; background: linear-gradient(145deg, #326d9d, #123a5e); box-shadow: 0 4px 16px #071a3266, inset 0 1px #ffffff77; cursor: pointer; touch-action: none; user-select: none; }
    #launcher:hover, #launcher:focus-visible { width: 48px; outline: 2px solid #91bddf; outline-offset: 2px; }
    #launcher svg { width: 22px; height: 22px; pointer-events: none; }
    #panel { position: fixed; top: 50%; right: 14px; width: min(390px, calc(100vw - 28px)); height: min(650px, calc(100dvh - 28px)); transform: translateY(-50%); overflow: hidden; border: 1px solid #52708b; border-radius: 15px; background: #f5f7f9; box-shadow: 0 18px 50px #06172888, inset 0 1px #fff; }
    #panel iframe { display: block; width: 100%; height: 100%; border: 0; background: #f5f7f9; }
    [hidden] { display: none !important; }
    @media (max-width: 480px) { #panel { right: 6px; width: calc(100vw - 12px); height: min(650px, calc(100dvh - 12px)); } }
  `;
  const launcher = document.createElement('button');
  launcher.id = 'launcher';
  launcher.type = 'button';
  const language = navigator.language.toLowerCase();
  const openLabel = language.startsWith('es') ? 'Abrir PromptOS · arrastra para mover' : language.startsWith('en') ? 'Open PromptOS · drag to move' : 'Abrir PromptOS · arraste para mover';
  launcher.title = openLabel;
  launcher.setAttribute('aria-label', openLabel);
  launcher.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></svg>';
  const panel = document.createElement('div');
  panel.id = 'panel';
  panel.hidden = true;
  const frame = document.createElement('iframe');
  frame.title = 'PromptOS';
  frame.setAttribute('allow', 'clipboard-write');
  frame.src = chrome.runtime.getURL('index.html?embedded=1');
  panel.appendChild(frame);
  shadow.append(style, launcher, panel);
  document.documentElement.appendChild(host);

  const layoutStyle = document.createElement('style');
  layoutStyle.id = 'promptos-layout-style';
  layoutStyle.textContent = `
    @media (min-width: 980px) {
      html.promptos-split { width: calc(100vw - var(--promptos-reserved-width)) !important; max-width: calc(100vw - var(--promptos-reserved-width)) !important; }
      html.promptos-split body { width: 100% !important; max-width: 100% !important; overflow-x: hidden !important; }
      html.promptos-split .promptos-page-root { width: 100% !important; max-width: 100% !important; }
      html.promptos-split .promptos-chat-main { flex: 0 1 auto !important; flex-grow: 0 !important; min-width: 0 !important; width: calc(100vw - var(--promptos-reserved-width) - var(--promptos-chat-left)) !important; max-width: calc(100vw - var(--promptos-reserved-width) - var(--promptos-chat-left)) !important; }
    }
  `;
  document.head.appendChild(layoutStyle);

  let chatMain = null;
  let pageObserver = null;

  function syncPageRoot() {
    const main = document.querySelector('main');
    if (!main) return;
    let root = main;
    while (root.parentElement && root.parentElement !== document.body) root = root.parentElement;
    if (root.parentElement === document.body) root.classList.add('promptos-page-root');
  }

  function syncReservedWidth() {
    const panelWidth = panel.getBoundingClientRect().width;
    document.documentElement.style.setProperty('--promptos-reserved-width', `${Math.ceil(panelWidth + 28)}px`);
  }

  function syncChatMain() {
    if (chatMain?.isConnected) return;
    const composer = document.querySelector('#prompt-textarea, [data-testid="composer-input"], textarea[placeholder]');
    if (!composer) return;
    const reserved = document.documentElement.classList.contains('promptos-split') ? parseFloat(document.documentElement.style.getPropertyValue('--promptos-reserved-width')) || 0 : 0;
    const expectedRight = window.innerWidth - reserved;
    let candidate = null;
    for (let node = composer.parentElement; node && node !== document.body; node = node.parentElement) {
      const rect = node.getBoundingClientRect();
      if (rect.left >= 120 && rect.right >= expectedRight - 24 && rect.width >= 300) candidate = node;
    }
    if (!candidate) return;
    chatMain = candidate;
    document.documentElement.style.setProperty('--promptos-chat-left', `${Math.round(candidate.getBoundingClientRect().left)}px`);
    candidate.classList.add('promptos-chat-main');
  }

  function setOpen(open) {
    panel.hidden = !open;
    launcher.hidden = open;
    if (open) {
      syncPageRoot();
      syncReservedWidth();
      syncChatMain();
      document.documentElement.classList.add('promptos-split');
      pageObserver = new MutationObserver(() => {
        if (!chatMain?.isConnected) { chatMain = null; syncPageRoot(); syncChatMain(); }
      });
      pageObserver.observe(document.body, { childList: true, subtree: true });
    } else {
      pageObserver?.disconnect();
      pageObserver = null;
      document.documentElement.classList.remove('promptos-split');
      document.documentElement.style.removeProperty('--promptos-reserved-width');
      document.documentElement.style.removeProperty('--promptos-chat-left');
      chatMain?.classList.remove('promptos-chat-main');
      chatMain = null;
    }
  }

  window.addEventListener('resize', () => { if (!panel.hidden) { syncReservedWidth(); syncPageRoot(); } });

  let dragStart = null;
  launcher.addEventListener('pointerdown', event => {
    dragStart = { y: event.clientY, top: launcher.getBoundingClientRect().top, moved: false };
    launcher.setPointerCapture(event.pointerId);
  });
  launcher.addEventListener('pointermove', event => {
    if (!dragStart) return;
    const delta = event.clientY - dragStart.y;
    if (Math.abs(delta) > 5) dragStart.moved = true;
    if (dragStart.moved) launcher.style.setProperty('--launcher-top', `${Math.max(8, Math.min(window.innerHeight - 56, dragStart.top + delta))}px`);
  });
  launcher.addEventListener('pointerup', () => {
    if (!dragStart) return;
    const moved = dragStart.moved;
    dragStart = null;
    if (!moved) setOpen(true);
  });
  launcher.addEventListener('pointercancel', () => { dragStart = null; });
  launcher.addEventListener('click', event => { if (event.detail === 0) setOpen(true); });

  window.addEventListener('message', event => {
    if (event.source === frame.contentWindow && event.origin === new URL(chrome.runtime.getURL('/')).origin && event.data?.type === 'promptos:collapse') setOpen(false);
  });
  chrome.runtime.onMessage.addListener(message => {
    if (message?.type === 'promptos:toggle') setOpen(panel.hidden);
  });
})();
