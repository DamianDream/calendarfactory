// Cloudflare Pages Function: /event.ics
// Timezone-aware iCal endpoint. Keeps absolute times identical to the client-side
// Google/Outlook/ICS builders (wall-clock + tz -> UTC with DST via Intl).

function pad(n) { return String(n).padStart(2, '0'); }

function formatIsoCompact(d) {
  return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) +
    'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';
}

function formatDayCompact(d) {
  return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate());
}

function escapeIcs(str) {
  if (!str) return '';
  return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r\n|\r|\n/g, '\\n').replace(/[\x00-\x08\x0B-\x1F\x7F]/g, '');
}

function foldIcsLine(line) {
  // RFC 5545: lines longer than 75 octets should be folded.
  if (line.length <= 73) return line;
  const chunks = [];
  let rest = line;
  chunks.push(rest.slice(0, 73));
  rest = rest.slice(73);
  while (rest.length > 72) {
    chunks.push(' ' + rest.slice(0, 72));
    rest = rest.slice(72);
  }
  if (rest.length) chunks.push(' ' + rest);
  return chunks.join('\r\n');
}

function parseFlexibleTime(timeStr) {
  if (!timeStr) return null;
  const m = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!m) return null;
  let hh = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  const ss = m[3] ? parseInt(m[3], 10) : 0;
  const mod = m[4] ? m[4].toLowerCase() : null;
  if (mod === 'pm' && hh < 12) hh += 12;
  if (mod === 'am' && hh === 12) hh = 0;
  return { hh, mm, ss };
}

// Returns { isAllDay, hasExplicitOffset, date (absolute, if offset known), wallClock }
function parseFlexibleDateTime(rawDate, rawTime) {
  if (!rawDate && !rawTime) return null;
  let str = (rawDate || '').trim();
  const timeStr = (rawTime || '').trim();

  if (/^\d{10}$/.test(str)) return { date: new Date(parseInt(str, 10) * 1000), isAllDay: false, hasExplicitOffset: true, wallClock: null };
  if (/^\d{13}$/.test(str)) return { date: new Date(parseInt(str, 10)), isAllDay: false, hasExplicitOffset: true, wallClock: null };

  str = str.replace(/^(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})\+(\d{1,2}:\d{2})/, '$1 $2');
  str = str.replace(/^(\d{1,2}[-/.]\d{1,2}[-/.]\d{4})\+(\d{1,2}:\d{2})/, '$1 $2');

  if (timeStr && !/[:\s]/.test(str)) {
    const t = parseFlexibleTime(timeStr);
    if (t) str = `${str}T${pad(t.hh)}:${pad(t.mm)}:${pad(t.ss)}`;
  }

  const tzMatch = str.match(/([+-]\d{2}):?(\d{2})$/) || str.match(/(Z)$/i);
  if (tzMatch || /^[a-z]{3},\s/i.test(str)) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) return { date: d, isAllDay: false, hasExplicitOffset: true, wallClock: null };
  }

  const build = (y, mo, d, hh, mm, ss, allDay) => ({
    date: null, isAllDay: allDay, hasExplicitOffset: false,
    wallClock: { year: y, month: mo, day: d, hh: hh || 0, mm: mm || 0, ss: ss || 0 }
  });

  let m = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (m) return m[4] !== undefined
    ? build(+m[3], +m[2], +m[1], +m[4], +m[5], m[6] ? +m[6] : 0, false)
    : build(+m[3], +m[2], +m[1], 0, 0, 0, true);

  m = str.match(/^(\d{1,4})\/(\d{1,2})\/(\d{1,4})(?:[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (m) {
    let year, month, day;
    const p1 = +m[1], p2 = +m[2], p3 = +m[3];
    if (p1 > 1000) { year = p1; month = p2; day = p3; }
    else if (p3 > 1000) { year = p3; if (p1 > 12) { day = p1; month = p2; } else if (p2 > 12) { month = p1; day = p2; } else { day = p1; month = p2; } }
    else { year = new Date().getUTCFullYear(); day = p1; month = p2; }
    return m[4] !== undefined
      ? build(year, month, day, +m[4], +m[5], m[6] ? +m[6] : 0, false)
      : build(year, month, day, 0, 0, 0, true);
  }

  m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (m) return m[4] !== undefined
    ? build(+m[1], +m[2], +m[3], +m[4], +m[5], m[6] ? +m[6] : 0, false)
    : build(+m[1], +m[2], +m[3], 0, 0, 0, true);

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) return { date: parsed, isAllDay: false, hasExplicitOffset: true, wallClock: null };
  return null;
}

function tzToIana(tzStr) {
  if (!tzStr) return '';
  const s = tzStr.toLowerCase();
  const map = [
    [['kyiv', 'kiev'], 'Europe/Kyiv'], [['kaliningrad'], 'Europe/Kaliningrad'],
    [['moscow', 'saint petersburg', 'msk'], 'Europe/Moscow'], [['samara'], 'Europe/Samara'],
    [['yekaterinburg', 'ekaterinburg'], 'Asia/Yekaterinburg'], [['omsk'], 'Asia/Omsk'],
    [['novosibirsk'], 'Asia/Novosibirsk'], [['krasnoyarsk'], 'Asia/Krasnoyarsk'],
    [['irkutsk'], 'Asia/Irkutsk'], [['yakutsk'], 'Asia/Yakutsk'], [['vladivostok'], 'Asia/Vladivostok'],
    [['magadan'], 'Asia/Magadan'], [['kamchatka'], 'Asia/Kamchatka'],
    [['london'], 'Europe/London'], [['berlin'], 'Europe/Berlin'], [['paris'], 'Europe/Paris'],
    [['warsaw'], 'Europe/Warsaw'], [['new york'], 'America/New_York'], [['los angeles'], 'America/Los_Angeles'],
    [['chicago'], 'America/Chicago'], [['denver'], 'America/Denver'], [['tokyo'], 'Asia/Tokyo'],
    [['dubai'], 'Asia/Dubai'], [['istanbul'], 'Europe/Istanbul'], [['athens'], 'Europe/Athens'],
    [['delhi', 'mumbai', 'kolkata'], 'Asia/Kolkata'], [['bangkok'], 'Asia/Bangkok'],
    [['singapore'], 'Asia/Singapore'], [['sydney'], 'Australia/Sydney'],
    [['tehran'], 'Asia/Tehran'], [['kathmandu'], 'Asia/Kathmandu'],
    [['adelaide'], 'Australia/Adelaide'], [['darwin'], 'Australia/Darwin'],
    [['st. johns', 'st johns', 'newfoundland'], 'America/St_Johns'],
    [['chatham'], 'Pacific/Chatham'], [['marquesas'], 'Pacific/Marquesas'],
    [['eucla'], 'Australia/Eucla'], [['lord howe'], 'Australia/Lord_Howe']
  ];
  for (const [keys, zone] of map) { if (keys.some(k => s.includes(k))) return zone; }
  if (tzStr.includes('/')) return tzStr;
  const m = tzStr.match(/UTC\s*([+-]\d+)(?::(\d+))?/i);
  if (m) {
    if (m[2] && parseInt(m[2], 10) !== 0) return ''; // fractional offset: exact minute math, no Etc/GMT
    const n = parseInt(m[1], 10);
    return n === 0 ? 'UTC' : (n > 0 ? `Etc/GMT-${n}` : `Etc/GMT+${Math.abs(n)}`);
  }
  return tzStr;
}

function isValidIanaZone(zone) {
  if (!zone) return false;
  try { Intl.DateTimeFormat(undefined, { timeZone: zone }); return true; } catch (e) { return false; }
}

function wallClockToUtc(wc, tzStr) {
  const iana = tzToIana(tzStr);
  if (iana && isValidIanaZone(iana)) {
    try {
      const naiveUtc = new Date(Date.UTC(wc.year, wc.month - 1, wc.day, wc.hh, wc.mm, wc.ss || 0));
      const dtf = new Intl.DateTimeFormat('en-US', {
        timeZone: iana, year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false
      });
      const parts = Object.fromEntries(dtf.formatToParts(naiveUtc).map(p => [p.type, p.value]));
      let h = parseInt(parts.hour, 10); if (h === 24) h = 0;
      const targetUtc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, h, parts.minute, parts.second || 0));
      const offsetMs = targetUtc.getTime() - naiveUtc.getTime();
      return new Date(naiveUtc.getTime() - offsetMs);
    } catch (e) {}
  }
  let offsetMin = 0;
  const m = (tzStr || '').match(/UTC\s*([+-]\d+(?::\d+)?)/i);
  if (m) {
    const parts = m[1].split(':');
    const h = parseInt(parts[0], 10);
    const min = parts[1] ? parseInt(parts[1], 10) : 0;
    offsetMin = (h >= 0 ? 1 : -1) * (Math.abs(h) * 60 + min);
  }
  return new Date(Date.UTC(wc.year, wc.month - 1, wc.day, wc.hh, wc.mm - offsetMin, wc.ss || 0));
}

function normalizeUtcOffset(raw) {
  if (!raw) return '';
  const s = String(raw).trim();
  let num;
  if (/^[+-]?\d{1,2}:\d{2}$/.test(s)) {
    const [h, mm] = s.replace(/^\+/, '').split(':');
    const sign = h.startsWith('-') ? -1 : 1;
    num = sign * (Math.abs(parseInt(h, 10)) + parseInt(mm, 10) / 60);
  } else { num = parseFloat(s); }
  if (isNaN(num)) return /^utc/i.test(s) ? s : '';
  const sign = num >= 0 ? '+' : '-';
  const abs = Math.abs(num), hrs = Math.floor(abs), mins = Math.round((abs - hrs) * 60);
  return `UTC${sign}${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function replacePlaceholders(text, q) {
  if (!text) return '';
  let result = text;
  for (const [rawKey, val] of q.entries()) {
    if (val === undefined || val === null) continue;
    const escapedKey = rawKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`\\{\\{${escapedKey}\\}\\}|\\{${escapedKey}\\}|%${escapedKey}%|\\[${escapedKey}\\]|\\$\\{${escapedKey}\\}`, 'gi');
    result = result.replace(pattern, () => val);
  }
  return result;
}

export function onRequestGet(context) {
  const url = new URL(context.request.url);
  const q = url.searchParams;
  const getParam = (keys) => {
    for (const k of keys) { const v = q.get(k); if (v && v.trim()) return v.trim(); }
    return '';
  };

  const rawTitle = getParam(['title', 't', 'name', 'summary', 'event', 'subject']) || 'Event';
  const startVal = getParam(['start', 's', 'date', 'd', 'dt', 'dtstart', 'datetime', 'begin']);
  const timeVal = getParam(['time', 'tm', 't_time', 'time_start', 'hour', 'event_time']);
  const durVal = getParam(['duration', 'dur', 'len']) || '60';
  const rawLoc = getParam(['loc', 'location', 'place', 'venue']);
  const rawDesc = getParam(['desc', 'description', 'details', 'text', 'body', 'notes', 'info']);
  const rawUrl = getParam(['url', 'link']);
  const tz = getParam(['timezone', 'tz', 'zone']) || normalizeUtcOffset(getParam(['utc']));

  const title = replacePlaceholders(rawTitle, q);
  let desc = replacePlaceholders(rawDesc, q);
  const loc = replacePlaceholders(rawLoc, q);
  if (rawUrl) desc = desc ? `${desc}\n\n${rawUrl}` : rawUrl;
  const clampLen = (v, n) => (v && v.length > n ? v.slice(0, n) : v);
  // Server-side caps: direct GET /event.ics bypasses the client URL limit.
  const titleC = clampLen(title, 300);
  const descC = clampLen(desc, 5000);
  const locC = clampLen(loc, 500);

  const parsed = parseFlexibleDateTime(startVal, timeVal);
  let isAllDay = parsed ? parsed.isAllDay : false;
  if (durVal === 'allDay' || durVal === 'allday' || q.get('allDay') !== null || q.get('allday') !== null) isAllDay = true;

  let startDate = null;
  if (parsed) {
    if (parsed.hasExplicitOffset) startDate = parsed.date;
    else if (parsed.wallClock) startDate = isAllDay
      ? new Date(Date.UTC(parsed.wallClock.year, parsed.wallClock.month - 1, parsed.wallClock.day))
      : wallClockToUtc(parsed.wallClock, tz);
  }
  if (!startDate) { startDate = new Date(); startDate.setUTCMinutes(0, 0, 0); startDate.setUTCHours(startDate.getUTCHours() + 1); }

  const endVal = getParam(['end', 'e', 'dtend', 'time_end', 'finish']);
  const endTimeVal = getParam(['end_time', 'endtime', 'etm']);
  const endParsed = parseFlexibleDateTime(endVal, endTimeVal);
  let endDate = null;
  if (endParsed) {
    if (endParsed.hasExplicitOffset) endDate = endParsed.date;
    else if (endParsed.wallClock) endDate = wallClockToUtc(endParsed.wallClock, tz);
  }
  if (!endDate && durVal && durVal !== 'allDay' && durVal !== 'allday') {
    const mins = parseInt(durVal, 10);
    if (!isNaN(mins) && mins > 0) endDate = new Date(startDate.getTime() + mins * 60000);
  }
  if (!endDate) endDate = new Date(startDate.getTime() + (isAllDay ? 86400000 : 3600000));

  const stamp = formatIsoCompact(new Date());
  const rand = Array.from({ length: 7 }, () => Math.floor(Math.random() * 36).toString(36)).join('');
  const uid = `cf-${stamp}-${rand}@calendarfactory.pages.dev`;

  const dtStart = isAllDay ? `DTSTART;VALUE=DATE:${formatDayCompact(startDate)}` : `DTSTART:${formatIsoCompact(startDate)}`;
  const dtEnd = isAllDay ? `DTEND;VALUE=DATE:${formatDayCompact(endDate)}` : `DTEND:${formatIsoCompact(endDate)}`;

  const safeTitle = titleC.replace(/[^a-z0-9_-]/gi, '_').toLowerCase() || 'event';
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0',
    'PRODID:-//CalendarFactory//CalendarFactory Edge Link//EN',
    'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
    `UID:${uid}`, `DTSTAMP:${stamp}`, dtStart, dtEnd,
    `SUMMARY:${escapeIcs(titleC)}`,
    descC ? `DESCRIPTION:${escapeIcs(descC)}` : '',
    locC ? `LOCATION:${escapeIcs(locC)}` : '',
    'STATUS:CONFIRMED', 'END:VEVENT', 'END:VCALENDAR'
  ].filter(Boolean).map(foldIcsLine).join('\r\n') + '\r\n';

  return new Response(lines, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${safeTitle}.ics"`,
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

export function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
      'Access-Control-Max-Age': '86400'
    }
  });
}
