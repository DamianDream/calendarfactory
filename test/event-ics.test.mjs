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

console.log(fails ? `\n${fails} FAILED` : '\nALL PASS');
process.exit(fails?1:0);
