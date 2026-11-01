function pad(n) {
  return String(n).padStart(2, '0');
}

function formatIsoCompact(d) {
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}

function formatDayCompact(d) {
  return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate());
}

function escapeIcs(str) {
  if (!str) return '';
  return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Direct Apple Calendar / iCal endpoint: /event.ics or /api/event.ics
    if (pathname === '/event.ics' || pathname === '/api/event.ics' || pathname.endsWith('.ics')) {
      const q = url.searchParams;
      const title = q.get('title') || q.get('t') || 'Event';
      const startVal = q.get('start') || q.get('s') || q.get('date') || q.get('dt');
      const durVal = q.get('duration') || q.get('dur') || '60';
      const loc = q.get('loc') || q.get('l') || '';
      const desc = q.get('desc') || q.get('d') || '';

      const isAllDay = durVal === 'allDay';
      let startDate = null;
      let endDate = null;

      if (startVal) {
        if (startVal.includes('T')) {
          const [dPart, tPart] = startVal.split('T');
          const [y, m, d] = dPart.split('-').map(x => parseInt(x, 10));
          const [hh, mm] = tPart.split(':').map(x => parseInt(x, 10));
          startDate = new Date(Date.UTC(y, m - 1, d, hh || 0, mm || 0, 0));
          const durMins = parseInt(durVal, 10) || 60;
          endDate = new Date(startDate.getTime() + durMins * 60000);
        } else {
          const [y, m, d] = startVal.split('-').map(x => parseInt(x, 10));
          if (isAllDay) {
            startDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
            endDate = new Date(Date.UTC(y, m - 1, d + 1, 0, 0, 0));
          } else {
            startDate = new Date(Date.UTC(y, m - 1, d, 10, 0, 0));
            const durMins = parseInt(durVal, 10) || 60;
            endDate = new Date(startDate.getTime() + durMins * 60000);
          }
        }
      } else {
        startDate = new Date();
        endDate = new Date(startDate.getTime() + 3600000);
      }

      const stamp = formatIsoCompact(new Date());
      const uid = `cf-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@calendarfactory.pages.dev`;

      let dtStart = '';
      let dtEnd = '';
      if (isAllDay) {
        dtStart = `DTSTART;VALUE=DATE:${formatDayCompact(startDate)}`;
        dtEnd = `DTEND;VALUE=DATE:${formatDayCompact(endDate)}`;
      } else {
        dtStart = `DTSTART:${formatIsoCompact(startDate)}`;
        dtEnd = `DTEND:${formatIsoCompact(endDate)}`;
      }

      const safeTitle = title.replace(/[^a-z0-9_-]/gi, '_').toLowerCase() || 'event';
      const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//CalendarFactory//CalendarFactory Edge Link//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${stamp}`,
        dtStart,
        dtEnd,
        `SUMMARY:${escapeIcs(title)}`,
        desc ? `DESCRIPTION:${escapeIcs(desc)}` : '',
        loc ? `LOCATION:${escapeIcs(loc)}` : '',
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
      ].filter(Boolean).join('\r\n') + '\r\n';

      return new Response(lines, {
        headers: {
          'Content-Type': 'text/calendar; charset=utf-8',
          'Content-Disposition': `attachment; filename="${safeTitle}.ics"`,
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    if (env && env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response("CalendarFactory is running", {
      headers: { "content-type": "text/plain;charset=UTF-8" }
    });
  }
};
