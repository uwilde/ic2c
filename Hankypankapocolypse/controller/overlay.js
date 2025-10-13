const CONTROLLER_URL = new URL('./controller.html', import.meta.url);

const injectOverlay = async () => {
  if (document.getElementById('controller')) return;
  try {
    const response = await fetch(CONTROLLER_URL, { credentials: 'same-origin' });
    if (!response.ok) {
      throw new Error(`Unexpected status ${response.status}`);
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const root = document.createDocumentFragment();
    doc.body.childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.COMMENT_NODE || (node.nodeType === Node.TEXT_NODE && node.textContent.trim())) {
        root.appendChild(node.cloneNode(true));
      }
    });

    doc.querySelectorAll('style').forEach((styleTag) => {
      document.head.appendChild(styleTag.cloneNode(true));
    });

    document.body.appendChild(root);

    doc.querySelectorAll('script').forEach((scriptTag) => {
      const script = document.createElement('script');
      if (scriptTag.src) {
        script.src = scriptTag.src;
      } else {
        script.textContent = scriptTag.textContent;
      }
      if (scriptTag.type) {
        script.type = scriptTag.type;
      }
      document.body.appendChild(script);
    });
  } catch (error) {
    console.error('Failed to inject controller overlay:', error);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectOverlay, { once: true });
} else {
  injectOverlay();
}
