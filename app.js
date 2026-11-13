(() => {
  'use strict';

  const loading = document.getElementById('chat-loading');
  const welcome = document.getElementById('chat-welcome');
  const help = document.getElementById('connection-help');
  const status = document.getElementById('connection-status');
  const statusText = document.getElementById('status-text');
  const newChat = document.getElementById('new-chat');
  const configUrl = 'https://files.bpcontent.cloud/2026/06/03/07/20260603073144-4HN5XLI5.json';
  let ready = false;
  let hasMessages = false;
  let chatCss = '';
  let chatObserver;

  newChat.hidden = false;

  function setStatus(state, label) {
    status.dataset.state = state;
    statusText.textContent = label;
  }

  function showConnectionError() {
    window.clearTimeout(connectionTimeout);
    loading.hidden = true;
    welcome.hidden = true;
    help.hidden = false;
    ready = false;
    newChat.disabled = true;
    setStatus('error', navigator.onLine ? 'Kết nối đang gián đoạn' : 'Bạn đang ngoại tuyến');
  }

  const connectionTimeout = window.setTimeout(showConnectionError, 22000);
  document.getElementById('retry-chat').addEventListener('click', () => window.location.reload());
  window.addEventListener('offline', showConnectionError);

  function connectChatInterface() {
    const host = document.getElementById('webchat-root');
    const root = host?.shadowRoot;
    if (!root) return;
    host.removeAttribute('aria-hidden');
    const syncInterface = () => {
      hasMessages = Boolean(root.querySelector('.bpMessageBlocksBubble'));
      welcome.hidden = !ready || hasMessages;
      const input = root.querySelector('.bpComposerInput');
      const available = ready && input && !input.disabled;
      newChat.disabled = !available;
      const labels = {
        '.bpComposerInput': 'Tin nhắn gửi Bọ',
        '.bpComposerSendButton': 'Gửi tin nhắn',
        '.bpComposerUploadButton': 'Đính kèm tệp',
        '.bpComposerVoiceButton': 'Nhập bằng giọng nói',
      };
      for (const [selector, label] of Object.entries(labels)) {
        root.querySelector(selector)?.setAttribute('aria-label', label);
      }
    };
    syncInterface();
    chatObserver?.disconnect();
    chatObserver = new MutationObserver(syncInterface);
    chatObserver.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled'],
    });
  }

  newChat.addEventListener('click', async () => {
    if (!ready) return;
    newChat.disabled = true;
    try {
      await window.botpress.restartConversation();
      hasMessages = false;
      welcome.hidden = false;
    } catch {
      showConnectionError();
    } finally {
      newChat.disabled = !ready;
    }
  });

  async function initializeChat() {
    try {
      const [configResponse, cssResponse] = await Promise.all([
        fetch(configUrl, { signal: AbortSignal.timeout(15000) }),
        fetch('./chat-theme.css'),
      ]);
      if (!configResponse.ok || !cssResponse.ok) throw new Error('Chat configuration unavailable');
      const config = await configResponse.json();
      chatCss = await cssResponse.text();
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.botpress.cloud/webchat/v3.6/inject.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      window.botpress.on('webchat:initialized', () => window.botpress.open());
      window.botpress.on('webchat:ready', () => {
        window.clearTimeout(connectionTimeout);
        loading.hidden = true;
        help.hidden = true;
        ready = true;
        newChat.disabled = false;
        connectChatInterface();
        welcome.hidden = hasMessages;
        setStatus('ready', 'Đã kết nối');
      });
      window.botpress.on('message', () => {
        hasMessages = true;
        welcome.hidden = true;
      });
      window.botpress.on('error', showConnectionError);
      window.botpress.init({
        ...config,
        configuration: {
          ...config.configuration,
          botName: 'Bọ Chán',
          botDescription: '',
          botAvatar: new URL('./assets/chat/bo-chan-avatar.jpg', document.baseURI).href,
          composerPlaceholder: 'Nhắn tin cho Bọ…',
          embeddedChatId: 'bp-embedded-webchat',
          themeMode: 'light',
          fontFamily: 'inter',
          color: '#334155',
          variant: 'soft',
          headerVariant: 'solid',
          radius: 2,
          footer: '',
          additionalStylesheetUrl: '',
          additionalStylesheet: chatCss,
          soundEnabled: false,
          proactiveMessageEnabled: false,
        },
      });
    } catch {
      showConnectionError();
    }
  }

  initializeChat();
})();
