// Cloudflare Pages middleware: inject OpenGraph/Twitter meta for event links.
// Messenger crawlers (Telegram/WhatsApp/FB/X) do not run JS, so the client-side
// title/banner never reach them. Here we rewrite the served HTML for event URLs.

const EVENT_KEYS = ['title', 't', 'name', 'summary', 'event', 'subject', 'start', 's', 'date', 'd', 'dt', 'dtstart', 'datetime'];

function firstParam(q, keys) {
  for (const k of keys) { const v = q.get(k); if (v && v.trim()) return v.trim(); }
  return '';
}

// Single-pass, length-bounded token substitution (no re-scan of replacements).
const PLACEHOLDER_TOKEN = /\{\{([^{}]+)\}\}|\{([^{}]+)\}|%([^%]+)%|\[([^\]]+)\]|\$\{([^{}]+)\}/g;
function replacePlaceholders(text, q, maxOut = 5000) {
  if (!text) return '';
  const src = text.length > maxOut ? text.slice(0, maxOut) : text;
  let count = 0;
  const out = src.replace(PLACEHOLDER_TOKEN, (m, a, b, c, d, e) => {
    if (++count > 100) return m;
    const key = (a || b || c || d || e || '').trim();
    const v = q.get(key);
    return v == null ? m : String(v).slice(0, 500);
  });
  return out.length > maxOut ? out.slice(0, maxOut) : out;
}

function attr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;').slice(0, 500);
}

export async function onRequest(context) {
  const { request, next } = context;
  const response = await next();

  if (request.method !== 'GET') return response;
  const ct = response.headers.get('content-type') || '';
  if (!ct.includes('text/html')) return response;

  const url = new URL(request.url);
  const q = url.searchParams;
  const isEvent = EVENT_KEYS.some((k) => q.has(k));
  if (!isEvent) return response;

  const rawTitle = firstParam(q, ['title', 't', 'name', 'summary', 'event', 'subject']) || 'Calendar Event';
  const rawDesc = firstParam(q, ['description', 'desc', 'details', 'text', 'body', 'notes', 'info']);
  const banner = firstParam(q, ['banner', 'img', 'image', 'b', 'pic', 'photo']);

  const title = replacePlaceholders(rawTitle, q).slice(0, 200);
  const desc = replacePlaceholders(rawDesc, q).slice(0, 300);
  const image = /^https?:\/\/.+/i.test(banner) ? banner : '';

  let meta =
    `<meta property="og:type" content="website">` +
    `<meta property="og:title" content="${attr(title)}">` +
    `<meta property="og:url" content="${attr(url.href)}">` +
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">` +
    `<meta name="twitter:title" content="${attr(title)}">`;
  if (desc) {
    meta += `<meta property="og:description" content="${attr(desc)}">` +
            `<meta name="twitter:description" content="${attr(desc)}">`;
  }
  if (image) {
    meta += `<meta property="og:image" content="${attr(image)}">` +
            `<meta name="twitter:image" content="${attr(image)}">`;
  }

  return new HTMLRewriter()
    .on('head', { element(el) { el.append(meta, { html: true }); } })
    .transform(response);
}
