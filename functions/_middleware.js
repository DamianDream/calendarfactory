// Cloudflare Pages middleware: server-render event content for crawlers.
// Telegram/WhatsApp/FB crawlers and Telegram Instant View do NOT run JS, so we
// inject (a) OpenGraph/Twitter meta for the rich link card and (b) a semantic
// <article id="tg-iv"> the Telegram Instant View template maps to a clean page.

import { buildEvent, formatDisplay, formatIsoCompact, formatDayCompact, tzToIana } from './_shared/ical.js';

const EVENT_KEYS = ['title', 't', 'name', 'summary', 'event', 'subject', 'start', 's', 'date', 'd', 'dt', 'dtstart', 'datetime'];

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function buildGoogleUrl(ev) {
  const p = new URLSearchParams();
  p.set('action', 'TEMPLATE');
  p.set('text', ev.title);
  if (ev.isAllDay) {
    const nd = new Date(ev.startDate.getTime() + 86400000);
    p.set('dates', `${formatDayCompact(ev.startDate)}/${formatDayCompact(nd)}`);
  } else {
    p.set('dates', `${formatIsoCompact(ev.startDate)}/${formatIsoCompact(ev.endDate)}`);
  }
  let details = ev.desc;
  if (ev.url) details = details ? `${details}\n\n${ev.url}` : ev.url;
  if (details) p.set('details', details);
  if (ev.loc) p.set('location', ev.loc);
  const iana = tzToIana(ev.tz);
  if (iana && !iana.startsWith('Etc/')) p.set('ctz', iana);
  return 'https://calendar.google.com/calendar/render?' + p.toString();
}

function buildOutlookUrl(ev) {
  const p = new URLSearchParams();
  p.set('path', '/calendar/action/compose');
  p.set('rru', 'addevent');
  p.set('subject', ev.title);

  if (ev.isAllDay) {
    p.set('allday', 'true');
    p.set('startdt', ev.startDate.toISOString().split('T')[0]);
    p.set('enddt', ev.endDate.toISOString().split('T')[0]);
  } else {
    p.set('startdt', ev.startDate.toISOString());
    p.set('enddt', ev.endDate.toISOString());
  }

  let body = ev.desc;
  if (ev.url) body = body ? `${body}\n\n${ev.url}` : ev.url;
  if (body) p.set('body', body);
  if (ev.loc) p.set('location', ev.loc);

  return 'https://outlook.live.com/calendar/0/deeplink/compose?' + p.toString();
}

export async function onRequest(context) {
  const { request, next } = context;
  const response = await next();

  if (request.method !== 'GET') return response;
  const ct = response.headers.get('content-type') || '';
  if (!ct.includes('text/html')) return response;

  const url = new URL(request.url);
  const q = url.searchParams;
  if (!EVENT_KEYS.some((k) => q.has(k))) return response;

  const lang = (q.get('lang') || q.get('l') || q.get('locale') || 'en').toLowerCase();
  const ev = buildEvent(q);
  const dateLine = formatDisplay(ev, lang);
  const image = /^https?:\/\/.+/i.test(ev.banner) ? ev.banner : '';

  // --- OpenGraph / Twitter card ---
  const ogDesc = [dateLine, ev.loc, ev.desc].filter(Boolean).join(' · ').slice(0, 300);
  let meta =
    `<meta property="og:type" content="website">` +
    `<meta property="og:title" content="${esc(ev.title).slice(0, 200)}">` +
    `<meta property="og:url" content="${esc(url.href)}">` +
    `<meta property="og:site_name" content="CalendarFactory">` +
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">` +
    `<meta name="twitter:title" content="${esc(ev.title).slice(0, 200)}">`;
  if (ogDesc) {
    meta += `<meta property="og:description" content="${esc(ogDesc)}">` +
            `<meta name="twitter:description" content="${esc(ogDesc)}">`;
  }
  if (image) {
    meta += `<meta property="og:image" content="${esc(image)}">` +
            `<meta name="twitter:image" content="${esc(image)}">`;
  }
  // Signals Telegram to prefer Instant View for this page.
  meta += `<meta property="al:web:url" content="${esc(url.href)}">`;

  // --- Semantic article for Instant View / crawlers (hidden from browsers) ---
  const tzLabels = { ru: 'Часовой пояс', ua: 'Часовий пояс', uk: 'Часовий пояс', pl: 'Strefa czasowa', th: 'เขตเวลา', en: 'Timezone' };
  const locLabels = { ru: 'Локация / Место', ua: 'Локація / Місце', uk: 'Локація / Місце', pl: 'Lokalizacja', th: 'สถานที่', en: 'Location' };
  const linkLabels = { ru: 'Ссылка', ua: 'Посилання', uk: 'Посилання', pl: 'Link', th: 'ลิงก์', en: 'Link' };
  const descLabels = { ru: 'Описание события', ua: 'Опис події', uk: 'Опис події', pl: 'Opis wydarzenia', th: 'รายละเอียดกิจกรรม', en: 'Event description' };
  const addLabels = { ru: 'Добавить в календарь', ua: 'Додати в календар', uk: 'Додати в календар', pl: 'Dodaj do kalendarza', th: 'เพิ่มลงในปฏิทิน', en: 'Add to calendar' };
  const openLabels = { ru: 'Открыть полную страницу события', ua: 'Відкрити інтерактивну сторінку події', uk: 'Відкрити інтерактивну сторінку події', pl: 'Otwórz pełną stronę wydarzenia', th: 'เปิดหน้ากิจกรรมแบบเต็ม', en: 'Open interactive event page' };

  const tzLabel = tzLabels[lang] || tzLabels.en;
  const locLabel = locLabels[lang] || locLabels.en;
  const linkLabel = linkLabels[lang] || linkLabels.en;
  const descLabel = descLabels[lang] || descLabels.en;
  const addLabel = addLabels[lang] || addLabels.en;
  const openLabel = openLabels[lang] || openLabels.en;

  const googleHref = buildGoogleUrl(ev);
  const outlookHref = buildOutlookUrl(ev);
  const icsHref = url.origin + '/event.ics' + url.search;
  const coverHtml = image ? `<figure><img src="${esc(image)}" alt="${esc(ev.title)}"></figure>` : '';

  const metaRows = [];
  if (ev.tz) metaRows.push(`⏰ <strong>${tzLabel}:</strong> ${esc(ev.tz)}`);
  if (ev.loc) metaRows.push(`📍 <strong>${locLabel}:</strong> ${esc(ev.loc)}`);
  if (ev.url) metaRows.push(`🔗 <strong>${linkLabel}:</strong> <a href="${esc(ev.url)}">${esc(ev.url)}</a>`);

  const metaCard = metaRows.length ? `<blockquote>${metaRows.join('<br>\n')}</blockquote>` : '';
  const descCard = ev.desc ? `<h3>📝 ${descLabel}</h3>\n<p>${esc(ev.desc).replace(/\n/g, '<br>')}</p>` : '';

  const calendarCard =
    `<h3>⚡ ${addLabel}</h3>\n` +
    `<ul>\n` +
    `  <li><a href="${esc(googleHref)}"><strong>📅 Google Calendar</strong></a></li>\n` +
    `  <li><a href="${esc(icsHref)}"><strong>🍏 Apple Calendar / .ICS</strong></a></li>\n` +
    `  <li><a href="${esc(outlookHref)}"><strong>💼 Microsoft Outlook</strong></a></li>\n` +
    `</ul>`;

  const footerCard =
    `<hr>\n` +
    `<p>🌐 <a href="${esc(url.href)}"><strong>${openLabel} →</strong></a></p>`;

  const article =
    `<article id="tg-iv" class="tg-iv-hidden">\n` +
      `<h1>${esc(ev.title)}</h1>\n` +
      coverHtml + '\n' +
      `<address><time>🗓️ ${esc(dateLine)}</time></address>\n` +
      (metaCard ? metaCard + '\n' : '') +
      (descCard ? descCard + '\n' : '') +
      `<hr>\n` +
      calendarCard + '\n' +
      footerCard + '\n' +
    `</article>`;

  return new HTMLRewriter()
    .on('head', { element(el) { el.append(meta, { html: true }); } })
    .on('body', { element(el) { el.prepend(article, { html: true }); } })
    .transform(response);
}
