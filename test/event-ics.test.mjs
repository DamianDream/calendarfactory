import { onRequestGet } from '../functions/event.ics.js';

async function ics(qs) {
  const req = new Request('https://x/event.ics?' + qs);
  const res = await onRequestGet({ request: req });
  return await res.text();
}
function dtstart(body){ return (body.match(/DTSTART[^\r\n]*/)||[])[0]; }

let fails = 0;
function check(name, actual, expected) {
  const ok = actual === expected;
  if (!ok) fails++;
  console.log(`${ok?'PASS':'FAIL'} ${name}: got "${actual}" want "${expected}"`);
}

// Kyiv summer = UTC+3 (DST) -> 14:00 local = 11:00Z
check('kyiv-summer', dtstart(await ics('title=t&start=2026-07-20T14:00&tz=Europe/Kyiv')), 'DTSTART:20260720T110000Z');
// Kyiv winter = UTC+2 -> 14:00 local = 12:00Z
check('kyiv-winter', dtstart(await ics('title=t&start=2026-01-20T14:00&tz=Europe/Kyiv')), 'DTSTART:20260120T120000Z');
// utc=3 numeric offset -> 14:00 -> 11:00Z
check('utc-numeric', dtstart(await ics('title=t&start=2026-07-20T14:00&utc=3')), 'DTSTART:20260720T110000Z');
// all-day
check('all-day', dtstart(await ics('title=t&start=2026-12-05&duration=allDay')), 'DTSTART;VALUE=DATE:20261205');
// explicit offset in string (no tz) -> absolute
check('explicit-offset', dtstart(await ics('title=t&start=2026-07-20T14:00:00%2B02:00')), 'DTSTART:20260720T120000Z');
// escaping/XSS-ish location does not break output & is escaped
const body = await ics('title=t&start=2026-07-20T14:00&tz=Europe/Kyiv&loc=A,B;C');
check('loc-escaped', (body.match(/LOCATION:[^\r\n]*/)||[])[0], 'LOCATION:A\\,B\\;C');

// CRLF/property injection: bare CR + newline must not create new ICS lines
{
  const body = await ics('title=' + encodeURIComponent('A\r\nSUMMARY:evil') + '&start=2026-07-20T14:00&tz=Europe/Kyiv');
  const summaryLines = (body.match(/^SUMMARY:/gm) || []).length;
  check('no-crlf-injection', summaryLines, 1);
}

// D1: fractional timezones must keep the :30/:45 minutes
check('kathmandu-iana', dtstart(await ics('title=t&start=2026-07-20T14:00&tz=Asia/Kathmandu')), 'DTSTART:20260720T081500Z');
check('kathmandu-offset', dtstart(await ics('title=t&start=2026-07-20T14:00&tz=' + encodeURIComponent('UTC+05:45 - Kathmandu'))), 'DTSTART:20260720T081500Z');
check('tehran-city', dtstart(await ics('title=t&start=2026-07-20T14:00&tz=' + encodeURIComponent('UTC+03:30 - Tehran'))), 'DTSTART:20260720T103000Z');
check('utc-decimal-5.75', dtstart(await ics('title=t&start=2026-07-20T14:00&utc=5.75')), 'DTSTART:20260720T081500Z');
check('newfoundland', dtstart(await ics('title=t&start=2026-07-20T14:00&tz=America/St_Johns')), 'DTSTART:20260720T163000Z');
// D4: oversized fields are truncated (SUMMARY stays within cap)
{
  const big = 'x'.repeat(5000);
  const body = await ics('title=' + big + '&start=2026-07-20T14:00&tz=Asia/Kathmandu');
  const sum = (body.match(/^SUMMARY:(.*)$/m) || [])[1] || '';
  check('title-capped', String(sum.length <= 300), 'true');
}

// D8: UID is deterministic for identical events, differs for different ones
{
  const u = async (qs) => ((await ics(qs)).match(/^UID:(.*)$/m) || [])[1];
  const a = await u('title=Meeting&start=2026-07-20T14:00&tz=Europe/Kyiv&loc=Zoom');
  const b = await u('title=Meeting&start=2026-07-20T14:00&tz=Europe/Kyiv&loc=Zoom');
  const c = await u('title=Other&start=2026-07-20T14:00&tz=Europe/Kyiv&loc=Zoom');
  check('uid-stable', String(a === b && !!a), 'true');
  check('uid-distinct', String(a !== c), 'true');
}

// Placeholder amplification must stay bounded (title cap 300, no blow-up)
{
  const tokens = '{a}'.repeat(2000);
  const big = 'y'.repeat(4000);
  const body = await ics('title=' + encodeURIComponent(tokens) + '&a=' + big + '&start=2026-07-20T14:00&tz=Europe/Kyiv');
  const sum = (body.match(/^SUMMARY:(.*)$/m) || [])[1] || '';
  check('amplification-bounded', String(sum.length <= 300), 'true');
}

console.log(fails ? `\n${fails} FAILED` : '\nALL PASS');
process.exit(fails?1:0);
