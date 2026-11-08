# Telegram Instant View (telegra.ph-style) for CalendarFactory

Event links open as an instant, rendered page inside Telegram. The server side is
already done; the only step that must be done in a Telegram account is publishing
the Instant View (IV) template.

## What the code already does

- `functions/_middleware.js` server-renders every event URL (`/?title=...&start=...`)
  with:
  - OpenGraph/Twitter meta (rich link card in any messenger), and
  - a hidden `<article id="tg-iv">` (title, cover image, date/time, timezone,
    location, description, calendar links) that Telegram IV maps to a clean page.
    Crawlers and IV do not run JS, so this content is produced on the edge.
- `public/index.html` has a `TELEGRAM_IV_RHASH` constant and a Telegram share
  button that will open Instant View directly once the hash is filled.

## Steps you perform (one-time)

1. Open https://instantview.telegram.org and log in with your Telegram account.
2. "My Templates" -> enter domain `calendarfactory.pages.dev` -> create template.
3. Paste the contents of `telegram/iv-template.txt` into the editor.
4. In the "URL" box at the top, paste a real event link, e.g.
   `https://calendarfactory.pages.dev/?title=Webinar&start=2026-11-20T14:00&tz=Europe/Kyiv&banner=https://i.ibb.co/<some>.jpg&desc=Details+inside`
   The right pane should show the instant page (title, cover, date, description).
5. If it renders correctly, note the template hash. The quick test/share link is:
   `https://t.me/iv?url=<encoded event url>&rhash=<RHASH>`
   Copy the `rhash` value.
6. Send me the `rhash`. I will paste it into `TELEGRAM_IV_RHASH` in
   `public/index.html`, so the "Share to Telegram" button opens Instant View for
   everyone immediately (even before Telegram's global template approval).
7. (Optional, for automatic IV on any shared link) Submit the template for review
   in the IV editor. Once approved, plain links trigger IV without the rhash.

## If the IV editor shows "no content"

The article is `display:none` to keep it invisible to normal browsers. If the IV
parser ignores it, tell me — I will switch it to a visible block that the client
JS removes on load (keeps users from seeing it, keeps it visible to IV).
