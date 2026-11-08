// Reuses the Community chat with a local transport on this prototype only.
const people = [
  { id: 1, username: 'Lara', skin: 'ocean', is_online: true },
  { id: 2, username: 'Davi', skin: 'explorer', is_online: true },
  { id: 3, username: 'Bia', skin: 'plum', is_online: true },
  { id: 4, username: 'Gabriel', profile_photo_url: './shared/images/fundacao/gabriel.webp' },
  { id: 5, username: 'Nina', profile_photo_url: './assets/catalog/mundo-29.webp' },
  { id: 6, username: 'Caio', skin: 'ocean' },
].map(person => ({ ...person, is_friend: true, avatar_url: new URL(person.profile_photo_url || `./assets/skins/showcase-${person.skin}.png`, location.href).href }));
const ids = { lara: 1, davi: 2, bia: 3, leo: 4, nina: 5, caio: 6 };
const storageKey = 'fa-community-chat-preview-v1';
let saved = {};
try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch {}
const storedMessages = Array.isArray(saved.messages) ? saved.messages.filter(message => message && typeof message.body === 'string').slice(-100) : [];
let messages = storedMessages.length ? storedMessages : [
  { id: 1001, conversation_id: 1, sender_id: 1, username: 'Lara', body: 'Vamos escolher um servidor para jogar?', created_at: new Date().toISOString() },
  { id: 1002, conversation_id: 2, sender_id: 2, username: 'Davi', body: 'Achei algumas construções legais no catálogo.', created_at: new Date().toISOString() },
];
const groups = Array.isArray(saved.groups) ? saved.groups.filter(group => group && typeof group.name === 'string').slice(-10) : [];
function persist() {
  localStorage.setItem(storageKey, JSON.stringify({ messages: messages.slice(-100), groups }));
}
function conversation(person) {
  const latest = messages.filter(message => message.conversation_id === person.id && !message.group).at(-1);
  return { ...person, other_id: person.id, other_username: person.username, unread_count: 0, last_message_body: latest?.body || '', last_message_at: latest?.created_at };
}
window.FA_CHAT_ADAPTER = async (path, options = {}) => {
  await new Promise(resolve => setTimeout(resolve, 140));
  const url = new URL(path, location.origin);
  const route = url.pathname;
  const method = options.method || 'GET';
  const body = typeof options.body === 'string' ? JSON.parse(options.body) : {};
  if (route === '/api/me') return { id: 999, username: 'Você', avatar_url: new URL('./assets/skins/showcase-explorer.png', location.href).href };
  if (route.endsWith('/unread-count')) return { count: 0 };
  if (route.endsWith('/friends')) return { rows: people };
  if (route.endsWith('/friend-requests')) return { rows: [] };
  if (route === '/api/community/players') return people.filter(person => person.username.toLowerCase().includes((url.searchParams.get('search') || '').toLowerCase()));
  if (route.endsWith('/status')) return { peer_is_online: false, peer_last_read_at: null };
  if (route === '/api/me/conversations') {
    if (method === 'POST') {
      const person = people.find(person => person.id === Number(body.target_id));
      if (!person) throw new Error('Perfil indisponível nesta prévia.');
      return conversation(person);
    }
    return { rows: people.slice(0, 4).map(conversation) };
  }
  if (route === '/api/me/group-conversations') {
    if (method === 'POST') {
      const group = { id: Date.now(), name: String(body.name).slice(0, 80), member_count: (body.member_ids || []).length + 1 };
      groups.push(group); persist(); return group;
    }
    return { rows: groups };
  }
  const match = route.match(/^\/api\/me\/(group-conversations|conversations)\/(\d+)\/messages(?:\/([^/]+))?(?:\/reactions(?:\/.*)?)?$/);
  if (match) {
    const group = match[1] === 'group-conversations';
    const conversationId = Number(match[2]);
    const messageId = match[3];
    if (messageId) {
      const message = messages.find(message => String(message.id) === messageId);
      if (!message) throw new Error('Mensagem indisponível.');
      if (route.includes('/reactions')) {
        message.reactions = method === 'DELETE' ? [] : [{ emoji: body.emoji, count: 1 }];
        message.my_reactions = method === 'DELETE' ? [] : [body.emoji];
      } else if (method === 'PATCH') {
        message.body = String(body.body).slice(0, 500); message.edited_at = new Date().toISOString();
      } else if (method === 'DELETE') { message.is_deleted = true; message.body = ''; }
      persist(); return { ...message };
    }
    if (method === 'POST') {
      const message = { id: Date.now(), conversation_id: conversationId, group, sender_id: 999, username: 'Você', body: String(body.body || '').slice(0, 500), created_at: new Date().toISOString(), client_ref: body.client_ref, reply_to_message_id: body.reply_to_message_id, attachments: [] };
      const previous = messages;
      messages = [...messages, message].slice(-100);
      try { persist(); } catch { messages = previous; throw new Error('Não foi possível salvar neste navegador.'); }
      return { ...message };
    }
    return { rows: messages.filter(message => message.conversation_id === conversationId && Boolean(message.group) === group).map(message => ({ ...message, avatar_url: people.find(person => person.id === message.sender_id)?.avatar_url || new URL('./assets/skins/showcase-explorer.png', location.href).href })) };
  }
  if (route.includes('/follows/')) return { ok: true };
  throw new Error('Esse recurso fica disponível no Community. A prévia permite testar conversas de texto.');
};
const ready = new Promise((resolve, reject) => {
  const script = document.createElement('script');
  script.src = './shared/js/social-chat.js?v=community-shell-1';
  script.onload = resolve;
  script.onerror = () => reject(new Error('Não foi possível carregar as mensagens.'));
  document.head.append(script);
});
ready.then(() => {
  const root = document.querySelector('#fa-chat-root');
  if (!root) return;
  let previousOpen = false;
  let returnFocus;
  const sync = () => {
    const panel = root.querySelector('.fa-chat-panel');
    const open = Boolean(panel?.classList.contains('is-open'));
    panel?.setAttribute('role', 'dialog');
    panel?.setAttribute('aria-label', 'Community — mensagens de demonstração');
    if (panel && !panel.querySelector('.community-demo-note')) {
      const note = document.createElement('div');
      note.className = 'community-demo-note';
      note.textContent = 'Prévia · mensagens salvas só neste navegador';
      panel.prepend(note);
    }
    root.querySelectorAll('[data-chat-attach], [data-chat-camera], [data-chat-mic]').forEach(button => {
      button.disabled = true;
      button.title = 'Disponível no Community. Nesta prévia, experimente mensagens de texto.';
    });
    root.querySelectorAll('[data-chat-profile]').forEach(button => {
      button.disabled = true;
      button.title = 'Perfil demonstrativo; nenhuma conta real está associada.';
    });
    if (open && !previousOpen) {
      returnFocus = document.activeElement;
      panel.querySelector('[data-chat-close]')?.focus();
      document.querySelector('.catalog-help')?.removeAttribute('open');
    }
    if (!open && previousOpen && returnFocus?.isConnected) returnFocus.focus();
    if (open && innerWidth <= 768 && !panel.contains(document.activeElement)) panel.querySelector('[data-chat-close]')?.focus();
    panel?.setAttribute('aria-modal', String(open && innerWidth <= 768));
    previousOpen = open;
  };
  new MutationObserver(sync).observe(root, { childList: true, subtree: true });
  sync();
  document.addEventListener('keydown', event => {
    const panel = root.querySelector('.fa-chat-panel.is-open');
    if (!panel) return;
    if (event.key === 'Escape') { event.preventDefault(); window.FAChat.close(); }
    if (event.key === 'Tab' && innerWidth <= 768) {
      const elements = [...panel.querySelectorAll('button:not([disabled]),input,textarea,a[href],select')].filter(element => element.getClientRects().length);
      const edge = event.shiftKey ? elements[0] : elements.at(-1);
      if (document.activeElement === edge) { event.preventDefault(); (event.shiftKey ? elements.at(-1) : elements[0])?.focus(); }
    }
  });
}).catch(() => {
  const button = document.createElement('a');
  button.className = 'community-chat-fallback';
  button.href = 'https://forcaaliada.com/community';
  button.textContent = 'Abrir mensagens no Community';
  document.body.append(button);
});
export async function openCommunityChat(person) {
  try { await ready; } catch { return; }
  const user = people.find(user => user.id === ids[person?.id]);
  if (user) return window.FAChat.openWithUser(user);
  return window.FAChat.open();
}
