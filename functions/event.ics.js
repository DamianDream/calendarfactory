// Cloudflare Pages Function: /event.ics
// Timezone-aware iCal endpoint. Shares all date/tz/ICS logic with the OG/IV
// middleware and mirrors the client builder (see functions/_shared/ical.js).

import {
  buildEvent, formatIsoCompact, formatDayCompact, escapeIcs, foldIcsLine, hashString
} from './_shared/ical.js';

const clampLen = (v, n) => (v && v.length > n ? v.slice(0, n) : v);

export function onRequestGet(context) {
  const q = new URL(context.request.url).searchParams;
  const ev = buildEvent(q);

  const title = ev.title;
  const loc = ev.loc;
  let desc = ev.desc;
  if (ev.url) desc = desc ? `${desc}\n\n${ev.url}` : ev.url;
  desc = clampLen(desc, 5000);

  const stamp = formatIsoCompact(new Date());
  const uidSeed = `${ev.isAllDay ? formatDayCompact(ev.startDate) : formatIsoCompact(ev.startDate)}|${ev.isAllDay ? formatDayCompact(ev.endDate) : formatIsoCompact(ev.endDate)}|${title}|${loc}`;
  const uid = `cf-${hashString(uidSeed)}@calendarfactory.pages.dev`;

  const dtStart = ev.isAllDay ? `DTSTART;VALUE=DATE:${formatDayCompact(ev.startDate)}` : `DTSTART:${formatIsoCompact(ev.startDate)}`;
  const dtEnd = ev.isAllDay ? `DTEND;VALUE=DATE:${formatDayCompact(ev.endDate)}` : `DTEND:${formatIsoCompact(ev.endDate)}`;

  const safeTitle = title.replace(/[^a-z0-9_-]/gi, '_').toLowerCase() || 'event';
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0',
    'PRODID:-//CalendarFactory//CalendarFactory Edge Link//EN',
    'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
    `UID:${uid}`, `DTSTAMP:${stamp}`, dtStart, dtEnd,
    `SUMMARY:${escapeIcs(title)}`,
    desc ? `DESCRIPTION:${escapeIcs(desc)}` : '',
    loc ? `LOCATION:${escapeIcs(loc)}` : '',
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
