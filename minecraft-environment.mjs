export const CATALOG_PATH = '/minecraft/servidores';
export const BETA_ORIGIN = 'https://forca-aliada-minecraft-beta.onrender.com';
const publicId = /^(?:forca-aliada|[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})$/i;

export function minecraftEnvironment(location) {
  const underCatalog = location.pathname === CATALOG_PATH || location.pathname.startsWith(CATALOG_PATH + '/');
  const site = underCatalog && (location.hostname === 'forcaaliada.com' || location.hostname.endsWith('.pages.dev'));
  return { site, origin: site ? '' : BETA_ORIGIN };
}

export function prepareMinecraftPage(browser, history, document) {
  const { site } = minecraftEnvironment(browser);
  if (!site) return;
  document.querySelector('.prototype-note')?.remove();
  const footerNote = document.querySelector('.footer-bottom span');
  if (footerNote) footerNote.textContent = 'Força Aliada Minecraft';
  if (browser.hash.startsWith('#/')) return;
  const id = browser.pathname.slice(CATALOG_PATH.length + 1).replace(/\/$/, '');
  if (!publicId.test(id)) return;
  const edition = new URLSearchParams(browser.search).get('edition');
  const query = ['Java', 'Bedrock'].includes(edition) ? '?edition=' + edition : '';
  history.replaceState(history.state, '', browser.pathname + browser.search + '#/servidor/' + id.toLowerCase() + query);
}

export function serverShareUrl(browser, id, edition) {
  const url = new URL(browser.href);
  url.search = '';
  url.hash = '';
  if (minecraftEnvironment(browser).site && publicId.test(id)) {
    url.pathname = `${CATALOG_PATH}/${id.toLowerCase()}`;
    if (['Java', 'Bedrock'].includes(edition)) url.searchParams.set('edition', edition);
  } else {
    url.hash = '/servidor/' + encodeURIComponent(id);
  }
  return url.href;
}
