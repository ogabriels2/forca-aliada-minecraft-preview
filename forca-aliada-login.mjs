const AUTH_START = 'https://forcaaliada.com/api/auth/minecraft-preview/authorize';
const PENDING_KEY = 'fa_minecraft_login_pending_v1';
const PROOF = /^[A-Za-z0-9_-]{43}$/;
const toBase64Url = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

function returnPath(hash) {
  return typeof hash === 'string' && /^#\/(?!entrar(?:\?|$))[^\s#]{0,800}$/.test(hash) ? hash : '#/';
}

export function createForcaAliadaLogin({ api, storage = sessionStorage, browser = location }) {
  return {
    async start({ linkUserId = null, createPage = false,community=false } = {}) {
      const verifier = toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
      const state = toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
      const challenge = toBase64Url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))));
      storage.setItem(PENDING_KEY, JSON.stringify({
        verifier, state, linkUserId, createPage, hash: returnPath(browser.hash), startedAt: Date.now(),
      }));
      const target = new URL(AUTH_START);
      target.search = new URLSearchParams({ challenge, state });
      if(community)target.searchParams.set('community','1');
      browser.assign(target.href);
    },
    async complete(hash, getCurrentUser) {
      if (hash.split('?')[0] !== '#/entrar') return null;
      const params = new URLSearchParams(hash.split('?')[1] || '');
      let pending = null;
      try { pending = JSON.parse(storage.getItem(PENDING_KEY) || 'null'); } catch {}
      storage.removeItem(PENDING_KEY);
      const result = { hash: returnPath(pending?.hash), createPage: pending?.createPage === true };
      history.replaceState(history.state, '', result.hash);
      const age = Date.now() - pending?.startedAt;
      if (!pending || !PROOF.test(pending.verifier) || !PROOF.test(pending.state) ||
          params.get('state') !== pending.state || !Number.isFinite(age) || age < 0 || age > 30 * 60_000) {
        return { ...result, error: 'Esta tentativa expirou. Inicie o acesso novamente.' };
      }
      if (params.get('cancelled') === '1') return { ...result, cancelled: true };
      try {
        const link = pending.linkUserId !== null;
        if (link) {
          const me = await getCurrentUser();
          if (String(me?.id) !== String(pending.linkUserId)) throw Error('Entre novamente no perfil que você deseja vincular.');
        }
        const code = params.get('code');
        if (!PROOF.test(code || '')) throw Error('A autorização não foi concluída. Tente novamente.');
        const { token } = await api.exchangeAccount({ code, verifier: pending.verifier, link });
        if (!token) throw Error('Não foi possível abrir sua sessão.');
        return { ...result, token };
      } catch (error) {
        return { ...result, error: error.message || 'Não foi possível entrar. Tente novamente.' };
      }
    },
  };
}
