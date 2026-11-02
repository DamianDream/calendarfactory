# CalendarFactory 🗓️

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.ru.md">Русский</a> ·
  <a href="README.ua.md">Українська</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.zh.md">简体中文</a> ·
  <a href="README.fr.md">Français</a> ·
  <b>Deutsch</b>
</p>

---

Einfacher, schneller und kostenloser Generator für 1-Klick-Links zum **Hinzufügen von Terminen zu Kalendern** (**Google Kalender**, **Apple Kalender**, **Microsoft Outlook**) und zum Herunterladen universeller **.ICS**-Kalenderdateien.

Alle Veranstaltungsdaten werden direkt in den URL-Parametern übergeben. Keine Registrierung, keine Server und keine Datenbanken.

👉 **Online-Generator:** [https://calendarfactory.pages.dev](https://calendarfactory.pages.dev)

---

## 🚀 Verwendung

Sie können:
1. [calendarfactory.pages.dev](https://calendarfactory.pages.dev) aufrufen und den Link über das interaktive Formular erstellen.
2. Ihren Link manuell oder dynamisch über Variablen in Ihrer Newsletter-Software, Ihrem Chatbot (**ManyChat**, **Smart Sender**) oder CRM erstellen.

Beim Öffnen der generierten URL sieht der Teilnehmer eine übersichtliche, responsive Event-Karte mit 1-Klick-Schaltflächen für den gewünschten Kalender.

---

## 📋 Übersicht der URL-Parameter

Parameter werden im Query-String (`?schluessel=wert`) durch `&` getrennt übergeben.

| Parameter | Aliase | Erforderlich | Format / Werte | Beschreibung |
| :--- | :--- | :---: | :--- | :--- |
| **`title`** | `t`, `name`, `summary`, `event`, `subject` | **Ja** | Text | Titel des Termins im Kalender. Beispiel: `title=Team+Meeting` |
| **`start`** | `s`, `date`, `d`, `dt`, `dtstart`, `datetime` | **Ja** | Datumsformat | Beginn des Termins. Unterstützt ISO 8601, RFC 2822, europäisches Format, Unix-Timestamp oder nur Datum für ganztägige Events. |
| **`time`** | `tm`, `t_time`, `hour`, `event_time` | Nein | `14:30`, `14:30:00`, `2:30 PM` | Startzeit, falls Datum und Uhrzeit getrennt übergeben werden (`?date=2026-11-20&time=14:30`). |
| **`duration`** | `dur`, `len` | Nein | Zahl oder `allDay` | Dauer in Minuten (`15`, `30`, `45`, `60`, `90`, `120`) oder `allDay`. Standard: `60`. |
| **`end`** | `e`, `dtend`, `finish` | Nein | Datumsformat | Exakte Endzeit (Alternative zu `duration`). |
| **`utc`** | `u`, `tz`, `timezone`, `zone` | Nein | Zahl (`1`, `+2`, `-5`) oder Stadt | Zeitzonenverschiebung zu UTC (`Europe/Berlin`, `UTC+01:00`). Offsets im Startwert (`+01:00`, `Z`) werden automatisch erkannt. |
| **`desc`** | `d`, `details`, `text`, `body`, `notes` | Nein | Text | Beschreibung oder Agenda des Termins. Unterstützt Zeilenumbrüche `\n`. |
| **`loc`** | `l`, `location`, `place`, `venue` | Nein | Text oder URL | Veranstaltungsort: Zoom/Google Meet-Link oder Adresse. |
| **`allDay`** | `allday` | Nein | `1` oder `true` | Ganztägiges Ereignis. |
| **`theme`** | `m`, `mode` | Nein | `dark` \| `light` | Design der Landingpage (`dark` für Dunkelmodus). |
| **`c`** | `color`, `bg` | Nein | HEX-Farbcode | Benutzerdefinierte Hintergrundfarbe (`0f172a`, `ffffff`). |
| **`lang`** | — | Nein | `en` \| `ru` \| `ua` | Sprache der Eventkarten-Oberfläche. |
| **`{variablen}`** | Beliebiger Name | Nein | Text | Ersetzt `{var}`, `{{var}}` oder `[var]` in `title`, `desc` und `loc`. |

---

## 📅 Unterstützte Datums- und Uhrzeitformate

CalendarFactory verarbeitet Datumsformate aus SaaS-Diensten und Bots nativ:

1. **ISO 8601 (mit oder ohne Zeitzone):**
   - `2026-11-20T14:30`
   - `2026-11-20T14:30:00+01:00`
   - `2026-11-20T14:30:00Z`
   - `2026-11-20 14:30` (Leerzeichen oder `+`)
2. **Getrennte Datums- und Zeit-Parameter:**
   - `?date=2026-11-20&time=14:30`
   - `?date=20.11.2026&time=14:30`
3. **Unix-Timestamp:**
   - In Sekunden (10 Ziffern, PHP / Smart Sender `{date:U}`): `?start=1762086842`
   - In Millisekunden (13 Ziffern, JS / HubSpot / Make): `?start=1762086842000`
4. **Europäisches Format:**
   - `20.11.2026 14:30`
   - `20.11.2026` (Ganztägig)
5. **RFC 2822 (Smart Sender `{date:r}`):**
   - `Fri, 12 Apr 2026 12:01:05 +0200`

---

## 🤖 Chatbot- & CRM-Integration (ManyChat, Smart Sender)

### 1. Smart Sender
Erstellen Sie eine Schaltfläche vom Typ **URL** mit Ihren Parametern:
```text
https://calendarfactory.pages.dev/?title=Beratung&start={date:c}&duration=45&desc=Hallo,+[first_name]!&loc=Zoom
```

### 2. ManyChat
Fügen Sie im Flow Builder eine Schaltfläche **Open website** ein:
```text
https://calendarfactory.pages.dev/?title=Webinar&start={{appointment_datetime}}&duration=60&desc=Hallo,+{{first_name}}!+Termin+bestaetigt.&loc=Google+Meet
```

---

## 💡 Beispiele für fertige Links

### 1. Online-Webinar via Zoom (90 Min., UTC+1)
```text
https://calendarfactory.pages.dev/?title=Webinar+Sync&start=2026-11-25T19:00&duration=90&utc=1&loc=https://zoom.us/j/123456789&desc=Zoom-Link+enthalten
```

### 2. Ganztägiges Event (Konferenz)
```text
https://calendarfactory.pages.dev/?title=Design+Conference&start=2026-12-05&duration=allDay&loc=Online
```

### 3. Direkter Download der Apple Kalender-Datei (.ICS)
```text
https://calendarfactory.pages.dev/event.ics?title=Webinar&start=2026-11-20T14:30&duration=60
```
