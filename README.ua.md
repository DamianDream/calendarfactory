# CalendarFactory 🗓️

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.ru.md">Русский</a> ·
  <b>Українська</b> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.zh.md">简体中文</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a>
</p>

---

Простий, швидкий та безкоштовний сервіс для створення посилань на додавання подій у **Google Calendar**, **Apple Calendar**, **Microsoft Outlook** та завантаження універсальних файлів **.ICS**.

Уся інформація про подію передається безпосередньо через параметри в URL. Працює без реєстрації, серверів та баз даних.

👉 **Онлайн-генератор:** [https://calendarfactory.pages.dev](https://calendarfactory.pages.dev)

---

## 🚀 Як користуватися

Ви можете:
1. Відкрити [calendarfactory.pages.dev](https://calendarfactory.pages.dev) та створити посилання через зручну форму.
2. Сформувати потрібний URL вручну або автоматично за допомогою змінних вашого сервісу розсилок, чат-бота (ManyChat, Smart Sender) чи CRM.

При переході за сформованим посиланням відкривається чиста картка події з кнопками додавання в календар в 1 клік.

---

## 📋 Довідник параметрів URL

Усі параметри передаються у рядку запиту (`?параметр=значення`) через знак `&`.

| Параметр | Аліаси | Обов'язковий | Формат / Значення | Опис |
| :--- | :--- | :---: | :--- | :--- |
| **`title`** | `t`, `name`, `summary`, `event`, `subject` | **Так** | Текст | Назва події в календарі. Приклад: `title=Зустріч+команди` |
| **`start`** | `s`, `date`, `d`, `dt`, `dtstart`, `datetime` | **Так** | Будь-який популярний формат | Дата і час початку. Підтримує ISO 8601, RFC 2822, європейський формат, Unix Timestamp або лише дату для подій на весь день. |
| **`time`** | `tm`, `t_time`, `hour`, `event_time` | Ні | `14:30`, `14:30:00`, `2:30 PM` | Час початку при окремій передачі дати і часу (`?date=2026-11-20&time=14:30`). |
| **`duration`** | `dur`, `len` | Ні | Число або `allDay` | Тривалість у хвилинах (`15`, `30`, `45`, `60`, `90`, `120`) або `allDay`. За замовчуванням: `60`. |
| **`end`** | `e`, `dtend`, `finish` | Ні | Формат дати/часу | Точний час завершення події (якщо потрібно вказати час замість `duration`). |
| **`utc`** | `u`, `tz`, `timezone`, `zone` | Ні | Число (`3`, `+2`, `-5`) або місто | Зсув часового поясу щодо UTC (`Europe/Kyiv`, `UTC+03:00`, `London`). При передачі зсуву в самій даті (`+02:00` або `Z`) часовий пояс визначається автоматично. |
| **`desc`** | `d`, `details`, `text`, `body`, `notes` | Ні | Текст | Опис зустрічі або порядок денний. Підтримує перенесення рядків `\n`. |
| **`loc`** | `l`, `location`, `place`, `venue` | Ні | Текст або посилання | Місце зустрічі: посилання на Zoom/Google Meet або фізична адреса. |
| **`allDay`** | `allday` | Ні | `1` або `true` | Прапорець події на весь день. |
| **`theme`** | `m`, `mode` | Ні | `dark` \| `light` | Тема оформлення картки (`dark` для темної теми). |
| **`c`** | `color`, `bg` | Ні | HEX-код кольору | Довільний колір фону сторінки (`0f172a`, `ffffff`). |
| **`lang`** | — | Ні | `en` \| `ru` \| `ua` | Мова інтерфейсу картки події. |
| **`{змінні}`** | Будь-яка назва | Ні | Текст | Значення підставляється в `{ім'я}`, `{{ім'я}}` або `[ім'я]` всередині `title`, `desc` та `loc`. |

---

## 📅 Підтримувані формати дати та часу

Сервіс розпізнає дати в тому вигляді, в якому їх генерують сучасні платформи, боти та CRM:

1. **ISO 8601 (з часовим поясом або без):**
   - `2026-11-20T14:30`
   - `2026-11-20T14:30:00+02:00` (зсув таймзони зчитується автоматично)
   - `2026-11-20T14:30:00Z`
   - `2026-11-20 14:30` (пробіл або `+` між датою і часом)
2. **Окремі параметри дати і часу:**
   - `?date=2026-11-20&time=14:30`
   - `?date=20.11.2026&time=14:30`
   - `?date=2026-11-20&time=2:30 PM` (12-годинний формат AM/PM)
3. **Unix Timestamp:**
   - У секундах (10 цифр, стандарт PHP / Smart Sender `{date:U}`): `?start=1762086842`
   - У мілісекундах (13 цифр, стандарт JS / HubSpot / Make): `?start=1762086842000`
4. **Європейський формат із крапками:**
   - `20.11.2026 14:30`
   - `20.11.2026` (автоматично визначається як подія на весь день)
5. **RFC 2822 (стандарт Smart Sender `{date:r}`):**
   - `Fri, 12 Apr 2026 12:01:05 +0200`
6. **Подія на весь день:**
   - Вкажіть лише дату: `?start=2026-11-20` або параметр `&duration=allDay`.

---

## 🤖 Інтеграція з ManyChat, Smart Sender та чат-ботами

Ви можете генерувати персоналізовані посилання в кнопках повідомлень Telegram, Instagram, WhatsApp, Viber або у розсилках.

### 1. Smart Sender

У Smart Sender змінні дати можна виводити через вбудований синтаксис форматування `{date:...}` або використовувати кастомні змінні контакту `[appointment_date]`, `[first_name]`.

У конструкторі повідомлень створіть кнопку типу **URL** (Посилання) та вставте один із варіантів:

* **Варіант А: Стандартний формат ISO-8601 `{date:c}` (Рекомендовано):**
  ```text
  https://calendarfactory.pages.dev/?title=Консультація&start={date:c}&duration=45&desc=Привіт,+[first_name]!&loc=Zoom
  ```

* **Варіант Б: Формат Unix Timestamp `{date:U}`:**
  ```text
  https://calendarfactory.pages.dev/?title=Зустріч&start={date:U}&duration=60&desc=Привіт,+[first_name]!
  ```

* **Варіант В: Формат дати і часу через пробіл `{date:Y-m-d H:i}`:**
  ```text
  https://calendarfactory.pages.dev/?title=Вебінар&start={date:Y-m-d H:i}&utc=3&loc=https://zoom.us/j/123456
  ```

* **Варіант Г: Окремі змінні дати та часу:**
  ```text
  https://calendarfactory.pages.dev/?title=Запис&date=[appointment_date]&time=[appointment_time]&desc=Клієнт:+[full_name]
  ```

---

### 2. ManyChat

У ManyChat значення користувацьких полів підставляються через синтаксис `{{назва_поля}}`.

У Flow Builder додайте кнопку з типом **Open website**:

* **Варіант А: Поле типу Date & Time (CUF):**
  ManyChat зберігає дату у форматі ISO (`YYYY-MM-DDTHH:mm:ssZ`):
  ```text
  https://calendarfactory.pages.dev/?title=Консультація&start={{appointment_datetime}}&duration=60&desc=Привіт,+{{first_name}}!+Запис+підтверджено.&loc=Google+Meet
  ```

* **Вариант Б: Окремі поля дати і часу:**
  ```text
  https://calendarfactory.pages.dev/?title=Зустріч&date={{booking_date}}&time={{booking_time}}&duration=30&desc=Привіт,+{{first_name}}!
  ```

* **Вариант В: Передача даних клієнта:**
  ```text
  https://calendarfactory.pages.dev/?title=Консультація&start={{booking_datetime}}&desc=Учасник:+{name},+телефон:+{phone}&name={{first_name}}&phone={{phone}}
  ```

---

### 3. CRM та Webhook-платформи (Make / Zapier / n8n / HubSpot)

Передавайте мілісекундний або секундний Unix-timestamp:
```text
https://calendarfactory.pages.dev/?title=Демонстрація&start={{1762086842000}}&duration=45&utc=Europe/Kyiv
```

---

## 🧩 Динамічні змінні у тексті

У полях опису (`desc`), назви (`title`) та місця зустрічі (`loc`) можна використовувати плейсхолдери `{name}`, `{ticket}`, `{{user}}`, `[id]`.

Параметр в URL `&name=Олексій` автоматично підставляється в текст:

```text
https://calendarfactory.pages.dev/?title=Зустріч+з+{name}&start=2026-11-20T14:00&duration=45&loc={zoom}&desc=Привіт,+{name}!+Твій+квиток:+{ticket}&name=Олексій&ticket=VIP-777&zoom=https://zoom.us/j/123456
```

---

## 💡 Приклади готових посилань

### 1. Онлайн-вебінар у Zoom (тривалість 90 хв, UTC+3)
```text
https://calendarfactory.pages.dev/?title=Webinar+Sync&start=2026-11-25T19:00&duration=90&utc=3&loc=https://zoom.us/j/123456789&desc=Посилання+на+Zoom+всередині
```

### 2. Подія на весь день (Конференція / Свято)
```text
https://calendarfactory.pages.dev/?title=Design+Conference&start=2026-12-05&duration=allDay&loc=Online&desc=Щорічна+конференція
```

### 3. Посилання з темною темою та власним фоном
```text
https://calendarfactory.pages.dev/?title=Product+Launch&start=2026-11-30T17:00&duration=60&theme=dark&c=0f172a&loc=YouTube+Live
```

### 4. Пряме посилання на файл Apple Calendar (.ICS)
```text
https://calendarfactory.pages.dev/event.ics?title=Вебінар&start=2026-11-20T14:30&duration=60
```
