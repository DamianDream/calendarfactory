# CalendarFactory 🗓️

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.ru.md">Русский</a> ·
  <a href="README.ua.md">Українська</a> ·
  <a href="README.es.md">Español</a> ·
  <b>简体中文</b> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a>
</p>

---

极简、快速且完全免费的日历事件链接生成器，一键生成 **添加到日历** 链接（**Google 日历**、**Apple 日历**、**Outlook**）并下载通用 **.ICS** 日历文件。

所有活动信息直接通过 URL 参数传输。无需注册、无需服务器、无需数据库，100% 客户端边缘计算。

👉 **在线生成器：** [https://calendarfactory.pages.dev](https://calendarfactory.pages.dev)

---

## 🚀 如何使用

您可以：
1. 访问 [calendarfactory.pages.dev](https://calendarfactory.pages.dev)，通过交互式表单创建链接。
2. 在邮件营销平台、CRM 或聊天机器人（**ManyChat**、**Smart Sender**、**HubSpot**、**Zapier** 等）中，利用动态变量直接拼接生成链接。

打开生成的 URL 后，用户将看到简洁清晰的活动卡片，并可一键将其添加到所需的日历中。

---

## 📋 URL 参数参考

所有参数均通过 URL 查询字符串（`?key=value`）以 `&` 分隔传递。

| 参数 | 别名 | 必填 | 格式 / 取值 | 说明 |
| :--- | :--- | :---: | :--- | :--- |
| **`title`** | `t`, `name`, `summary`, `event`, `subject` | **是** | 文本 | 日历中的活动名称。例如：`title=团队例会` |
| **`start`** | `s`, `date`, `d`, `dt`, `dtstart`, `datetime` | **是** | 常见日期时间格式 | 活动开始时间。支持 ISO 8601、RFC 2822、欧洲日期格式、Unix 时间戳或仅日期（全天活动）。 |
| **`time`** | `tm`, `t_time`, `hour`, `event_time` | 否 | `14:30`, `14:30:00`, `2:30 PM` | 当日期与时间分列两个参数时的时间参数（`?date=2026-11-20&time=14:30`）。 |
| **`duration`** | `dur`, `len` | 否 | 数字 或 `allDay` | 活动时长（分钟），如 `15`, `30`, `45`, `60`, `90`, `120` 或 `allDay`。默认值：`60`。 |
| **`end`** | `e`, `dtend`, `finish` | 否 | 日期时间格式 | 活动结束时间（替代 `duration`）。 |
| **`utc`** | `u`, `tz`, `timezone`, `zone` | 否 | 数字（`8`, `+8`, `-5`）或城市名 | 相对于 UTC 的时区偏移（例如 `Asia/Shanghai`, `UTC+08:00`）。若开始时间自带偏移（如 `+08:00` 或 `Z`），则自动识别。 |
| **`desc`** | `d`, `details`, `text`, `body`, `notes` | 否 | 文本 | 活动描述或议程。支持换行符 `\n`。 |
| **`loc`** | `l`, `location`, `place`, `venue` | 否 | 文本或 URL | 会议地点：腾讯会议/Zoom/Google Meet 链接或线下地址。 |
| **`allDay`** | `allday` | 否 | `1` 或 `true` | 全天活动标志。 |
| **`theme`** | `m`, `mode` | 否 | `dark` \| `light` | 活动页面主题风格（`dark` 为深色主题）。 |
| **`c`** | `color`, `bg` | 否 | HEX 颜色代码 | 自定义网页背景色（`0f172a`, `ffffff`）。 |
| **`lang`** | — | 否 | `en` \| `ru` \| `ua` | 活动落地页语言。 |
| **`{变量}`** | 任意名称 | 否 | 文本 | 动态替换 `title`、`desc` 和 `loc` 中的 `{变量}`、`{{变量}}` 或 `[变量]`。 |

---

## 📅 支持的日期与时间格式

CalendarFactory 原生兼容各类 SaaS、CRM 与机器人生成的日期格式：

1. **ISO 8601（带或不带时区）：**
   - `2026-11-20T14:30`
   - `2026-11-20T14:30:00+08:00`（自动提取时区）
   - `2026-11-20T14:30:00Z`
   - `2026-11-20 14:30`（空格或 `+`）
2. **日期与时间分列参数：**
   - `?date=2026-11-20&time=14:30`
   - `?date=2026-11-20&time=2:30 PM`（12小时制）
3. **Unix 时间戳：**
   - 秒级（10 位，PHP / Smart Sender `{date:U}`）：`?start=1762086842`
   - 毫秒级（13 位，JavaScript / HubSpot / Make）：`?start=1762086842000`
4. **全天活动：**
   - 仅输入日期即可：`?start=2026-11-20` 或添加参数 `&duration=allDay`。

---

## 🤖 营销与聊天机器人集成（ManyChat、Smart Sender）

### 1. Smart Sender
在按钮中设置类型为 **URL** 并拼接动态参数：
```text
https://calendarfactory.pages.dev/?title=在线咨询&start={date:c}&duration=45&desc=你好，[first_name]！&loc=Zoom
```

### 2. ManyChat
在 Flow Builder 中添加 **Open website** 按钮：
```text
https://calendarfactory.pages.dev/?title=线上讲座&start={{appointment_datetime}}&duration=60&desc=你好，{{first_name}}！预约已确认。&loc=Google+Meet
```

---

## 💡 示例链接

### 1. 线上 Zoom 会议（时长 90 分钟，UTC+8）
```text
https://calendarfactory.pages.dev/?title=产品发布同步会&start=2026-11-25T19:00&duration=90&utc=8&loc=https://zoom.us/j/123456789&desc=会议议程与链接见内
```

### 2. 全天活动（技术大会）
```text
https://calendarfactory.pages.dev/?title=开发者大会&start=2026-12-05&duration=allDay&loc=Online
```

### 3. Apple 日历 (.ICS) 直接下载链接
```text
https://calendarfactory.pages.dev/event.ics?title=讲座&start=2026-11-20T14:30&duration=60
```
