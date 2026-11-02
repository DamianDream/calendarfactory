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
| **`utc`** | `u`, `tz`, `timezone`, `zone` | No | Number (`3`, `+2`, `-5`) or city | UTC timezone offset (`Europe/Kyiv`, `UTC+03:00`, `London`). Timezone offsets passed inside the start string (`+02:00`, `Z`) are auto-detected. |
| **`desc`** | `d`, `details`, `text`, `body`, `notes` | No | Text | Event agenda or description. Supports line breaks `\n`. |
| **`loc`** | `l`, `location`, `place`, `venue` | No | Text or URL | Meeting place: Zoom/Meet link or physical address. |
| **`allDay`** | `allday` | No | `1` or `true` | All-day event flag. |
| **`theme`** | `m`, `mode` | No | `dark` \| `light` | Visual card theme (`dark` for dark mode). |
| **`c`** | `color`, `bg` | No | HEX color code | Custom page background color (`0f172a`, `ffffff`). |
| **`lang`** | — | No | `en` \| `ru` \| `ua` | Landing card interface language. |
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
