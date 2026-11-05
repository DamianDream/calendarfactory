# CalendarFactory 🗓️

<p align="center">
  <b>English</b> ·
  <a href="README.ru.md">Русский</a> ·
  <a href="README.ua.md">Українська</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.zh.md">简体中文</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a>
</p>

---

Simple, fast, and free generator for **1-click Add to Calendar** links (**Google Calendar**, **Apple Calendar**, **Microsoft Outlook**) and universal **.ICS** calendar file downloads.

All event details are encoded directly in URL parameters. Zero registration, zero database, 100% client-side edge performance.

👉 **Online Generator:** [https://calendarfactory.pages.dev](https://calendarfactory.pages.dev)

---

## 🚀 How to Use

You can:
1. Visit [calendarfactory.pages.dev](https://calendarfactory.pages.dev) and create your link using the clean interactive form.
2. Build custom URLs manually or automatically with variables from your email service, CRM, or chatbot platform (**ManyChat**, **Smart Sender**, **HubSpot**, **Zapier**, **Make**).

Opening the generated URL presents attendees with an elegant, responsive event card featuring 1-click calendar buttons.

---

## 📋 URL Parameters Reference

Parameters are passed in query string (`?key=value`) separated by `&`.

| Parameter | Aliases | Required | Format / Values | Description |
| :--- | :--- | :---: | :--- | :--- |
| **`title`** | `t`, `name`, `summary`, `event`, `subject` | **Yes** | Text | Event title in calendar. Example: `title=Team+Sync` |
| **`start`** | `s`, `date`, `d`, `dt`, `dtstart`, `datetime` | **Yes** | Any popular date format | Event start time. Supports ISO 8601, RFC 2822, European format, Unix timestamps, or date-only for all-day events. |
| **`time`** | `tm`, `t_time`, `hour`, `event_time` | No | `14:30`, `14:30:00`, `2:30 PM` | Start time when passing date and time in separate query parameters (`?date=2026-11-20&time=14:30`). |
| **`duration`** | `dur`, `len` | No | Number or `allDay` | Duration in minutes (`15`, `30`, `45`, `60`, `90`, `120`) or `allDay`. Default: `60`. |
| **`end`** | `e`, `dtend`, `finish` | No | Date/time format | Explicit event end time (alternative to `duration`). |
| **`tz`** | `timezone`, `zone`, `utc`, `u` | No | IANA Zone (`Europe/Kyiv`, `America/New_York`) or numeric offset (`2`, `+3`, `-5`) | Event timezone. Passing canonical IANA zones automatically accounts for seasonal **Daylight Saving Time (DST)** changes on the event's date. Legacy simple offsets like `utc=2` or `u=3` remain 100% backward-compatible. |
| **`desc`** | `d`, `details`, `text`, `body`, `notes` | No | Text | Event agenda or description. Supports line breaks `\n`. |
| **`loc`** | `l`, `location`, `place`, `venue` | No | Text or URL | Meeting place: Zoom/Meet link or physical address. |
| **`bg`** | `style`, `gradient` | No | `cotton-candy`, `sunset`, `ocean`, `aurora`, `midnight`, `none` | Background 3D WebGL micro-shader gradient style. Default: `cotton-candy`. |
| **`card`** | `transparent` | No | `transparent`, `clear` | Set to `transparent` to remove card background and let the dynamic fluid gradient shine through. |
| **`allDay`** | `allday` | No | `1` or `true` | All-day event flag. |
| **`theme`** | `m`, `mode` | No | `dark` \| `light` | Visual card theme (`dark` for dark mode). |
| **`c`** | `color`, `bg` | No | HEX color code | Custom page background color (`0f172a`, `ffffff`). |
| **`banner`** | `b`, `img`, `image`, `cover` | No | Image URL | Event banner or cover image (~4:1 banner or 1:1 mobile cover up to 800x800). |
| **`lang`** | — | No | `en` \| `ru` \| `ua` \| `pl` \| `th` | Landing card interface language. |
| **`{variables}`** | Any name | No | Text | Replaces `{var}`, `{{var}}`, or `[var]` inside `title`, `desc`, and `loc`. |

---

## 📅 Supported Date & Time Formats

CalendarFactory natively recognizes formats produced by SaaS tools, CRMs, and bots:

1. **ISO 8601 (with or without timezone offset):**
   - `2026-11-20T14:30`
   - `2026-11-20T14:30:00+02:00` (timezone offset is auto-extracted)
   - `2026-11-20T14:30:00Z`
   - `2026-11-20 14:30` (space or `+` between date and time)
2. **Split Date & Time parameters:**
   - `?date=2026-11-20&time=14:30`
   - `?date=20.11.2026&time=14:30`
   - `?date=2026-11-20&time=2:30 PM` (12-hour AM/PM format)
3. **Unix Timestamp:**
   - In seconds (10 digits, PHP / Smart Sender `{date:U}`): `?start=1762086842`
   - In milliseconds (13 digits, JavaScript / HubSpot / Make): `?start=1762086842000`
4. **European dot format:**
   - `20.11.2026 14:30`
   - `20.11.2026` (auto-detected as all-day event)
5. **RFC 2822 format (Smart Sender `{date:r}`):**
   - `Fri, 12 Apr 2026 12:01:05 +0200`
6. **All-day event:**
   - Pass date only: `?start=2026-11-20` or parameter `&duration=allDay`.

---

## 🌍 Timezone Auto-Detection, IANA & Daylight Saving Time (DST)

Scheduling events across different countries is prone to timezone shifts, especially when countries switch between standard winter time and daylight saving summer time:

1. **Automatic Local Timezone Detection:**
   - When loading the generator at [calendarfactory.pages.dev](https://calendarfactory.pages.dev), the user's local timezone is automatically detected via the browser's native `Intl` API and pre-selected in the form without sending any network requests.
2. **True Wall-Clock to UTC Calculation (0 Dependencies):**
   - CalendarFactory converts the event's local wall-clock date and time into exact UTC timestamps using native browser `Intl.DateTimeFormat(..., { timeZone })`.
   - If an event is scheduled for `tz=Europe/Kyiv` at `14:30`:
     - In **Winter (UTC+2)**: calculated as `12:30:00Z`.
     - In **Summer (UTC+3)**: automatically calculated as `11:30:00Z`.
   - All calendar links (Google Calendar `dates=...Z`, Outlook `startdt=...Z`, Apple iCal `DTSTART:...Z`) receive the exact calculated UTC instant.
3. **Full Backward Compatibility (`utc=2` / `u=3`):**
   - Bots and CRMs can continue passing simple numeric offsets like `utc=2`, `u=3`, `utc=+3`, or `utc=-5`. They are fully supported.
4. **Cross-Timezone Attendee Helper Badge:**
   - When an attendee opens an event landing page from a different timezone (e.g. event is at 14:30 in New York, attendee is in London or Kyiv), CalendarFactory displays a secondary localized helper badge with the attendee's local time:
     `🕒 Your local time: 09:30 PM – 10:30 PM (Kiev)`.
   - If the viewer is in the same timezone or offset, the badge stays hidden to keep the card minimal.

---

## 🤖 Integrations: ManyChat, Smart Sender & Chatbots

Easily generate dynamic calendar invite links inside buttons for Telegram, WhatsApp, Instagram Direct, Viber, or email newsletters.

### 1. Smart Sender

In Smart Sender, dates can be formatted using PHP date syntax `{date:...}` or custom contact variables `[appointment_date]`, `[first_name]`.

In the message builder, create a **URL button** and paste one of the following patterns:

* **Pattern A: Standard ISO-8601 `{date:c}` (Recommended):**
  ```text
  https://calendarfactory.pages.dev/?title=Consultation&start={date:c}&duration=45&desc=Hello,+[first_name]!&loc=Zoom
  ```

* **Pattern B: Unix Timestamp `{date:U}`:**
  ```text
  https://calendarfactory.pages.dev/?title=Meeting&start={date:U}&duration=60&desc=Hi,+[first_name]!
  ```

* **Pattern C: Space-separated Date & Time `{date:Y-m-d H:i}`:**
  ```text
  https://calendarfactory.pages.dev/?title=Webinar&start={date:Y-m-d H:i}&utc=3&loc=https://zoom.us/j/123456
  ```

* **Pattern D: Separate Custom Variables for Date and Time:**
  ```text
  https://calendarfactory.pages.dev/?title=Appointment&date=[appointment_date]&time=[appointment_time]&desc=Client:+[full_name]
  ```

---

### 2. ManyChat

In ManyChat, custom user fields (CUF) are referenced using `{{field_name}}`.

In Flow Builder, add a button with type **Open website**:

* **Pattern A: Date & Time field (CUF):**
  ManyChat serializes date/time values in standard ISO format (`YYYY-MM-DDTHH:mm:ssZ`):
  ```text
  https://calendarfactory.pages.dev/?title=Online+Consultation&start={{appointment_datetime}}&duration=60&desc=Hi,+{{first_name}}!+Your+booking+is+confirmed.&loc=Google+Meet
  ```

* **Pattern B: Separate Date and Time fields:**
  If date and time are collected separately in your flow (`{{booking_date}}` and `{{booking_time}}`):
  ```text
  https://calendarfactory.pages.dev/?title=Meeting&date={{booking_date}}&time={{booking_time}}&duration=30&desc=Hi,+{{first_name}}!
  ```

* **Pattern C: Passing Dynamic Attendee Data:**
  Any user variable can be forwarded in the URL to fill placeholders in the event description:
  ```text
  https://calendarfactory.pages.dev/?title=Consultation&start={{booking_datetime}}&desc=Attendee:+{name},+Phone:+{phone}&name={{first_name}}&phone={{phone}}
  ```

---

### 3. CRMs & Webhook Platforms (Make / Zapier / n8n / HubSpot)

Pass millisecond or second Unix timestamps directly:
```text
https://calendarfactory.pages.dev/?title=Product+Demo&start={{1762086842000}}&duration=45&utc=Europe/Kyiv
```

---

## 🧩 Dynamic Text Placeholders

Placeholders `{name}`, `{ticket}`, `{{user}}`, `[id]` inside `title`, `desc`, and `loc` are automatically replaced by matching query parameters.

For example, appending `&name=Alex` replaces `{name}` dynamically:

```text
https://calendarfactory.pages.dev/?title=Meeting+with+{name}&start=2026-11-20T14:00&duration=45&loc={zoom}&desc=Hello,+{name}!+Ticket:+{ticket}&name=Alex&ticket=VIP-777&zoom=https://zoom.us/j/123456
```

---

## 💡 Quick Examples

### 1. Online Webinar via Zoom (90 min, UTC+3)
```text
https://calendarfactory.pages.dev/?title=Webinar+Sync&start=2026-11-25T19:00&duration=90&utc=3&loc=https://zoom.us/j/123456789&desc=Zoom+link+and+materials+inside
```

### 2. All-Day Event (Conference / Holiday)
```text
https://calendarfactory.pages.dev/?title=Design+Conference&start=2026-12-05&duration=allDay&loc=Online&desc=Annual+tech+conference
```

### 3. Dark Theme with Custom Hex Background
```text
https://calendarfactory.pages.dev/?title=Product+Launch&start=2026-11-30T17:00&duration=60&theme=dark&c=0f172a&loc=YouTube+Live
```

### 4. Direct Apple Calendar / iCal (.ICS) Stream
```text
https://calendarfactory.pages.dev/event.ics?title=Webinar&start=2026-11-20T14:30&duration=60
```

### 5. Event with Visual Banner or 1:1 Mobile Cover
```text
https://calendarfactory.pages.dev/?title=Design+Summit&start=2026-11-20T10:00&banner=https://i.ibb.co/sample/banner.png
```

---

## 🖼️ Event Banners & Square Mobile Covers

CalendarFactory supports visual header banners and mobile covers:
- **Formats & Ratios**:
  - **Wide Banner**: `970×250` px (~4:1) for desktop headers and card embeds.
  - **Square Mobile Cover**: `1:1` (up to `800×800` px) fills the top mobile screen edge-to-edge.
- **Adaptive Display**: The image container dynamically scales to fit any image up to 800 px in height.
- **Image Hosting**:
  - Direct URL via query parameter: `banner=https://...` (or `b=`, `img=`, `image=`, `cover=`).
  - Built-in generator upload powered by ImgBB API (stored up to 30 days, auto-scales images over 800 px, max 2 MB).

