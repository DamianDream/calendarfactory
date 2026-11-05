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

function parseFlexibleTime(timeStr) {
  if (!timeStr) return null;
  const t = timeStr.trim();
  const ampmMatch = t.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!ampmMatch) return null;
  let hh = parseInt(ampmMatch[1], 10);
  const mm = parseInt(ampmMatch[2], 10);
  const ss = ampmMatch[3] ? parseInt(ampmMatch[3], 10) : 0;
  const modifier = ampmMatch[4] ? ampmMatch[4].toLowerCase() : null;
  if (modifier === 'pm' && hh < 12) hh += 12;
  if (modifier === 'am' && hh === 12) hh = 0;
  return { hh, mm, ss };
}

function parseFlexibleDateTime(rawDate, rawTime) {
  if (!rawDate && !rawTime) return null;
  let str = (rawDate || '').trim();
  const timeStr = (rawTime || '').trim();

  // 1. Unix timestamp (seconds: 10 digits, milliseconds: 13 digits)
  if (/^\d{10}$/.test(str)) {
    return { date: new Date(parseInt(str, 10) * 1000), isAllDay: false };
  }
  if (/^\d{13}$/.test(str)) {
    return { date: new Date(parseInt(str, 10)), isAllDay: false };
  }

  // 2. Decode "+" between date and time (e.g. "2026-11-20+14:30")
  str = str.replace(/^(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})\+(\d{1,2}:\d{2})/, '$1 $2');
  str = str.replace(/^(\d{1,2}[-/.]\d{1,2}[-/.]\d{4})\+(\d{1,2}:\d{2})/, '$1 $2');

  // 3. Merge separate time parameter if str does not already contain a time component
  if (timeStr && !/[:\s]/.test(str)) {
    const tParsed = parseFlexibleTime(timeStr);
    if (tParsed) {
      const hh = String(tParsed.hh).padStart(2, '0');
      const mm = String(tParsed.mm).padStart(2, '0');
      const ss = String(tParsed.ss).padStart(2, '0');
      str = `${str}T${hh}:${mm}:${ss}`;
    }
  }

  // 4. Timezone offset or RFC 2822
  const tzMatch = str.match(/([+-]\d{2}):?(\d{2})$/) || str.match(/(Z)$/i);
  if (tzMatch || /^[a-z]{3},\s/i.test(str)) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return { date: d, isAllDay: false };
    }
  }

  // 5. European dot format: DD.MM.YYYY [HH:mm[:ss]]
  const euroMatch = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (euroMatch) {
    const day = parseInt(euroMatch[1], 10);
    const month = parseInt(euroMatch[2], 10);
    const year = parseInt(euroMatch[3], 10);
    if (euroMatch[4] !== undefined) {
      const hh = parseInt(euroMatch[4], 10);
      const mm = parseInt(euroMatch[5], 10);
      const ss = euroMatch[6] ? parseInt(euroMatch[6], 10) : 0;
      return { date: new Date(Date.UTC(year, month - 1, day, hh, mm, ss)), isAllDay: false };
    }
    return { date: new Date(Date.UTC(year, month - 1, day, 0, 0, 0)), isAllDay: true };
  }

  // 6. Slash format: DD/MM/YYYY or MM/DD/YYYY or YYYY/MM/DD
  const slashMatch = str.match(/^(\d{1,4})\/(\d{1,2})\/(\d{1,4})(?:[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (slashMatch) {
    let year, month, day;
    const p1 = parseInt(slashMatch[1], 10);
    const p2 = parseInt(slashMatch[2], 10);
    const p3 = parseInt(slashMatch[3], 10);
    if (p1 > 1000) {
      year = p1; month = p2; day = p3;
    } else if (p3 > 1000) {
      year = p3;
      if (p1 > 12) { day = p1; month = p2; }
      else if (p2 > 12) { month = p1; day = p2; }
      else { day = p1; month = p2; }
    } else {
      year = new Date().getUTCFullYear(); day = p1; month = p2;
    }
    if (slashMatch[4] !== undefined) {
      const hh = parseInt(slashMatch[4], 10);
      const mm = parseInt(slashMatch[5], 10);
      const ss = slashMatch[6] ? parseInt(slashMatch[6], 10) : 0;
      return { date: new Date(Date.UTC(year, month - 1, day, hh, mm, ss)), isAllDay: false };
    }
    return { date: new Date(Date.UTC(year, month - 1, day, 0, 0, 0)), isAllDay: true };
  }

  // 7. Standard ISO without timezone offset: YYYY-MM-DD [T/space HH:mm[:ss]]
  const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);
    if (isoMatch[4] !== undefined) {
      const hh = parseInt(isoMatch[4], 10);
      const mm = parseInt(isoMatch[5], 10);
      const ss = isoMatch[6] ? parseInt(isoMatch[6], 10) : 0;
      return { date: new Date(Date.UTC(year, month - 1, day, hh, mm, ss)), isAllDay: false };
    }
    return { date: new Date(Date.UTC(year, month - 1, day, 0, 0, 0)), isAllDay: true };
  }

  // 8. Fallback native Date
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return { date: parsed, isAllDay: false };
  }

  return null;
}

function replacePlaceholders(text, q) {
  if (!text) return '';
  let result = text;
  for (const [rawKey, val] of q.entries()) {
    if (val === undefined || val === null) continue;
    const escapedKey = rawKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`\\{\\{${escapedKey}\\}\\}|\\{${escapedKey}\\}|%${escapedKey}%|\\[${escapedKey}\\]|\\$\\{${escapedKey}\\}`, 'gi');
    result = result.replace(pattern, val);
  }
  return result;
}

async function handleUpload(request, env) {
  try {
    const apiKey = env && env.IMGBB_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({
        error: 'IMGBB_API_KEY is not configured in Cloudflare Settings -> Variables and secrets'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const clientIp = request.headers.get('cf-connecting-ip') || 'unknown';
    const cache = (typeof caches !== 'undefined' && caches.default) ? caches.default : null;
    const rateLimitUrl = `https://rate-limit.internal/${encodeURIComponent(clientIp)}`;
    if (cache) {
      const existing = await cache.match(rateLimitUrl);
      if (existing) {
        return new Response(JSON.stringify({
          error: 'Please wait 10 seconds before uploading another banner'
        }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Retry-After': '10',
          },
        });
      }
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return new Response(JSON.stringify({ error: 'Expected multipart/form-data' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const formData = await request.formData();
    const file = formData.get('file') || formData.get('image') || formData.get('fileToUpload');
    if (!file || typeof file === 'string') {
      return new Response(JSON.stringify({ error: 'No image file uploaded' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const MAX_SIZE = 1 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return new Response(JSON.stringify({ error: 'File size exceeds 1 MB limit' }), {
        status: 413,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml'
    ];
    if (file.type && !allowedTypes.includes(file.type.toLowerCase())) {
      return new Response(JSON.stringify({
        error: 'Unsupported image type. Allowed: JPG, PNG, WebP, GIF, SVG'
      }), {
        status: 415,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const imgbbForm = new FormData();
    imgbbForm.append('image', file, file.name || 'banner.png');
    if (env.IMGBB_EXPIRATION) {
      imgbbForm.append('expiration', env.IMGBB_EXPIRATION);
    }

    let imgbbUrl = `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`;
    const imgbbRes = await fetch(imgbbUrl, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'X-Forwarded-For': clientIp,
        'CF-Connecting-IP': clientIp,
      },
      body: imgbbForm,
    });

    const data = await imgbbRes.json().catch(() => null);

    if (!imgbbRes.ok || !data || !data.success) {
      const errMsg = (data && data.error && data.error.message)
        ? data.error.message
        : 'ImgBB upload failed';
      return new Response(JSON.stringify({ error: errMsg }), {
        status: 502,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    if (cache) {
      const rlResp = new Response('1', {
        headers: {
          'Cache-Control': 'max-age=10',
          'Content-Type': 'text/plain',
        },
      });
      await cache.put(rateLimitUrl, rlResp);
    }

    const directUrl = (data.data && (data.data.url || data.data.display_url)) || '';
    return new Response(JSON.stringify({
      success: true,
      url: directUrl,
      id: data.data ? data.data.id : null,
      title: data.data ? data.data.title : '',
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Accept',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    // Proxy image upload to ImgBB via Cloudflare Worker
    if (pathname === '/api/upload') {
      if (request.method === 'GET') {
        const apiKey = env && env.IMGBB_API_KEY;
        if (!apiKey) {
          return new Response(JSON.stringify({
            error: 'IMGBB_API_KEY is not configured in Cloudflare Settings -> Variables and secrets'
          }), {
            status: 500,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
        return new Response(JSON.stringify({ key: apiKey }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-store',
          },
        });
      }
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
      return handleUpload(request, env);
    }

    // Direct Apple Calendar / iCal endpoint: /event.ics or /api/event.ics
    if (pathname === '/event.ics' || pathname === '/api/event.ics' || pathname.endsWith('.ics')) {
      const q = url.searchParams;
      const getParam = (keys) => {
        for (const k of keys) {
          const v = q.get(k);
          if (v && v.trim()) return v.trim();
        }
        return '';
      };

      const rawTitle = getParam(['title', 't', 'name', 'summary', 'event', 'subject']) || 'Event';
      const startVal = getParam(['start', 's', 'date', 'd', 'dt', 'dtstart', 'datetime', 'begin']);
      const timeVal = getParam(['time', 'tm', 't_time', 'time_start', 'hour', 'event_time']);
      const durVal = getParam(['duration', 'dur', 'len']) || '60';
      const rawLoc = getParam(['loc', 'l', 'location', 'place', 'venue']);
      const rawDesc = getParam(['desc', 'description', 'details', 'text', 'body', 'notes', 'info']);
      const rawUrl = getParam(['url', 'link', 'u']);

      const title = replacePlaceholders(rawTitle, q);
      let desc = replacePlaceholders(rawDesc, q);
      const loc = replacePlaceholders(rawLoc, q);
      if (rawUrl) {
        desc = desc ? `${desc}\n\n${rawUrl}` : rawUrl;
      }

      const parsed = parseFlexibleDateTime(startVal, timeVal);
      let startDate = parsed ? parsed.date : null;
      let isAllDay = parsed ? parsed.isAllDay : false;

      if (durVal === 'allDay' || durVal === 'allday' || q.get('allDay') !== null || q.get('allday') !== null) {
        isAllDay = true;
      }

      if (!startDate) {
        startDate = new Date();
        startDate.setMinutes(0, 0, 0);
        startDate.setHours(startDate.getHours() + 1);
      }

      const endVal = getParam(['end', 'e', 'dtend', 'time_end', 'finish']);
      const endTimeVal = getParam(['end_time', 'endtime', 'etm']);
      const endParsed = parseFlexibleDateTime(endVal, endTimeVal);

      let endDate = endParsed ? endParsed.date : null;
      if (!endDate && durVal && durVal !== 'allDay' && durVal !== 'allday') {
        const mins = parseInt(durVal, 10);
        if (!isNaN(mins) && mins > 0) {
          endDate = new Date(startDate.getTime() + mins * 60000);
        }
      }

      if (!endDate) {
        if (isAllDay) {
          endDate = new Date(startDate.getTime() + 86400000);
        } else {
          endDate = new Date(startDate.getTime() + 3600000);
        }
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
