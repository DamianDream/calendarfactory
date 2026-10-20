# CalendarFactory 🗓️

Легкий и минималистичный одностраничный сервис для генерации и добавления событий в календари через URL-параметры. 100% Client-side, без бэкенда, без вебхуков и без сторонних трекеров.

Развернут на **Cloudflare** (Cloudflare Pages / Workers Static Assets).

---

## ⚡️ Быстрый старт

Откройте ссылку с параметрами события:
```text
https://<your-domain>/?title=Launch+Party&start=2026-10-25T18:00:00Z&duration=90&loc=Online+Stream&desc=Welcome+to+the+official+launch!
```

### Поддерживаемые календари
- **Google Calendar** (прямая ссылка с предзаполнением формы)
- **Apple Calendar** (генерация и загрузка `.ics` файла через Blob)
- **Microsoft Outlook & Office 365** (прямой deep-link)
- **Universal iCS** (стандарт RFC 5545 для любого мобильного или десктопного календаря)

---

## 📋 Минимальный и расширенный набор параметров URL

Сервис принимает параметры как через **Query String** (`?key=val`), так и через **Hash Fragment** (`#key=val`), что позволяет избежать серверных логов или проблем с экранированием.

### 1. Минимально обязательные параметры:
- `title` (или `t`, `summary`) — Название события (например: `Team+Sync`)
- `start` (или `s`, `dtstart`) — Время старта в формате ISO 8601 (`2026-10-25T15:00:00Z`) или компактном виде (`20261025T150000Z`)

### 2. Дополнительные параметры:
- `duration` (или `dur`, `d`) — Длительность в минутах (по умолчанию `60`)
- `end` (или `e`, `dtend`) — Конечное время события (если не указано, вычисляется из `duration`)
- `desc` (или `description`, `details`) — Описание встречи, план, ссылки на созвон
- `loc` (или `location`, `venue`) — Локация (Zoom, Google Meet, адрес)
- `tz` (или `timezone`) — Название таймзоны (например `Europe/Kyiv`, `America/New_York`)
- `allDay` (или `allday`) — Флаг события на весь день (`1` или `true`)

---

## 🛠 Разработка и Деплой на Cloudflare

### Локальный запуск
```bash
# Установка зависимостей
pnpm install

# Запуск локального сервера Cloudflare
pnpm dev
```

### Деплой
1. **Через Cloudflare Pages:**
   Подключите приватный репозиторий `DamianDream/calendarfactory` в панели Cloudflare Dashboard -> Pages. В качестве Build output directory укажите `public`.

2. **Или через CLI Wrangler:**
   ```bash
   pnpm deploy
   # или
   pnpm pages:deploy
   ```
