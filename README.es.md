# CalendarFactory 🗓️

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.ru.md">Русский</a> ·
  <a href="README.ua.md">Українська</a> ·
  <b>Español</b> ·
  <a href="README.zh.md">简体中文</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a>
</p>

---

Generador sencillo, rápido y gratuito de enlaces en 1 clic para **añadir eventos a calendarios** (**Google Calendar**, **Apple Calendar**, **Microsoft Outlook**) y descargar archivos **.ICS**.

Toda la información del evento se codifica directamente en los parámetros de la URL. Sin registro, sin servidores y sin bases de datos.

👉 **Generador en línea:** [https://calendarfactory.pages.dev](https://calendarfactory.pages.dev)

---

## 🚀 Cómo usarlo

Puedes:
1. Entrar en [calendarfactory.pages.dev](https://calendarfactory.pages.dev) y crear el enlace usando el formulario interactivo.
2. Generar la URL personalizada manualmente o mediante variables de tu plataforma de email marketing, chatbot (**ManyChat**, **Smart Sender**) o CRM.

Al abrir el enlace generado, el usuario ve una tarjeta de evento limpia y adaptable con botones para añadirlo al calendario en 1 clic.

---

## 📋 Parámetros de URL

Los parámetros se pasan en la cadena de consulta (`?clave=valor`) separados por `&`.

| Parámetro | Alias | Obligatorio | Formato / Valores | Descripción |
| :--- | :--- | :---: | :--- | :--- |
| **`title`** | `t`, `name`, `summary`, `event`, `subject` | **Sí** | Texto | Título del evento en el calendario. Ejemplo: `title=Reunion+de+equipo` |
| **`start`** | `s`, `date`, `d`, `dt`, `dtstart`, `datetime` | **Sí** | Formato de fecha | Fecha y hora de inicio. Admite ISO 8601, RFC 2822, formato europeo, Unix Timestamps o solo fecha para eventos de día completo. |
| **`time`** | `tm`, `t_time`, `hour`, `event_time` | No | `14:30`, `14:30:00`, `2:30 PM` | Hora de inicio si la fecha se pasa por separado (`?date=2026-11-20&time=14:30`). |
| **`duration`** | `dur`, `len` | No | Número o `allDay` | Duración en minutos (`15`, `30`, `45`, `60`, `90`, `120`) o `allDay`. Por defecto: `60`. |
| **`end`** | `e`, `dtend`, `finish` | No | Fecha/hora | Hora exacta de finalización (alternativa a `duration`). |
| **`utc`** | `u`, `tz`, `timezone`, `zone` | No | Número (`3`, `+2`, `-5`) o ciudad | Zona horaria respecto a UTC (`Europe/Madrid`, `UTC+01:00`). Los desfases pasados en la fecha (`+02:00`, `Z`) se detectan automáticamente. |
| **`desc`** | `d`, `details`, `text`, `body`, `notes` | No | Texto | Descripción o agenda del evento. Soporta saltos de línea `\n`. |
| **`loc`** | `l`, `location`, `place`, `venue` | No | Texto o URL | Lugar: enlace de Zoom/Google Meet o dirección física. |
| **`allDay`** | `allday` | No | `1` o `true` | Evento de día completo. |
| **`theme`** | `m`, `mode` | No | `dark` \| `light` | Tema visual (`dark` para modo oscuro). |
| **`c`** | `color`, `bg` | No | Código HEX | Color de fondo personalizado (`0f172a`, `ffffff`). |
| **`lang`** | — | No | `en` \| `ru` \| `ua` | Idioma de la interfaz de la tarjeta. |
| **`{variables}`** | Cualquier nombre | No | Texto | Reemplaza `{var}`, `{{var}}` o `[var]` en `title`, `desc` y `loc`. |

---

## 📅 Formatos de fecha y hora compatibles

CalendarFactory reconoce de forma nativa los formatos habituales de plataformas SaaS y bots:

1. **ISO 8601 (con o sin zona horaria):**
   - `2026-11-20T14:30`
   - `2026-11-20T14:30:00+02:00`
   - `2026-11-20T14:30:00Z`
   - `2026-11-20 14:30` (espacio o `+`)
2. **Parámetros separados de fecha y hora:**
   - `?date=2026-11-20&time=14:30`
   - `?date=20.11.2026&time=14:30`
   - `?date=2026-11-20&time=2:30 PM` (formato 12 horas AM/PM)
3. **Unix Timestamp:**
   - En segundos (10 dígitos, PHP / Smart Sender `{date:U}`): `?start=1762086842`
   - En milisegundos (13 dígitos, JS / HubSpot / Make): `?start=1762086842000`
4. **Formato europeo con puntos:**
   - `20.11.2026 14:30`
   - `20.11.2026` (se detecta como evento de día completo)
5. **Formato RFC 2822 (Smart Sender `{date:r}`):**
   - `Fri, 12 Apr 2026 12:01:05 +0200`

---

## 🤖 Integración con ManyChat, Smart Sender y Chatbots

Genera enlaces dinámicos para botones de Telegram, WhatsApp, Instagram Direct, Viber o boletines de correo.

### 1. Smart Sender
Crea un botón de tipo **URL** y usa una de las siguientes opciones:

* **Opción A: Estándar ISO-8601 `{date:c}` (Recomendado):**
  ```text
  https://calendarfactory.pages.dev/?title=Consulta&start={date:c}&duration=45&desc=Hola,+[first_name]!&loc=Zoom
  ```
* **Opción B: Unix Timestamp `{date:U}`:**
  ```text
  https://calendarfactory.pages.dev/?title=Reunion&start={date:U}&duration=60&desc=Hola,+[first_name]!
  ```
* **Opción C: Variables separadas de fecha y hora:**
  ```text
  https://calendarfactory.pages.dev/?title=Cita&date=[appointment_date]&time=[appointment_time]&desc=Cliente:+[full_name]
  ```

---

### 2. ManyChat
En Flow Builder, añade un botón de tipo **Open website**:

* **Opción A: Campo Date & Time (CUF):**
  ```text
  https://calendarfactory.pages.dev/?title=Consulta+Online&start={{appointment_datetime}}&duration=60&desc=Hola,+{{first_name}}!+Cita+confirmada.&loc=Google+Meet
  ```
* **Opción B: Campos separados de fecha y hora:**
  ```text
  https://calendarfactory.pages.dev/?title=Reunion&date={{booking_date}}&time={{booking_time}}&duration=30&desc=Hola,+{{first_name}}!
  ```

---

## 💡 Ejemplos listos para usar

### 1. Seminario web en Zoom (90 min, UTC+1)
```text
https://calendarfactory.pages.dev/?title=Webinar+Sync&start=2026-11-25T19:00&duration=90&utc=1&loc=https://zoom.us/j/123456789&desc=Enlace+de+acceso+dentro
```

### 2. Evento de día completo (Conferencia)
```text
https://calendarfactory.pages.dev/?title=Design+Conference&start=2026-12-05&duration=allDay&loc=Online
```

### 3. Enlace directo a archivo de Apple Calendar (.ICS)
```text
https://calendarfactory.pages.dev/event.ics?title=Webinar&start=2026-11-20T14:30&duration=60
```
