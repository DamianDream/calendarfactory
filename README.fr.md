# CalendarFactory 🗓️

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.ru.md">Русский</a> ·
  <a href="README.ua.md">Українська</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.zh.md">简体中文</a> ·
  <b>Français</b> ·
  <a href="README.de.md">Deutsch</a>
</p>

---

Générateur simple, rapide et gratuit de liens en 1 clic pour **ajouter des événements aux calendriers** (**Google Agenda**, **Calendrier Apple**, **Microsoft Outlook**) et télécharger des fichiers **.ICS**.

Toutes les informations sur l'événement sont encodées directement dans les paramètres d'URL. Sans inscription, sans serveur et sans base de données.

👉 **Générateur en ligne :** [https://calendarfactory.pages.dev](https://calendarfactory.pages.dev)

---

## 🚀 Utilisation

Vous pouvez :
1. Vous rendre sur [calendarfactory.pages.dev](https://calendarfactory.pages.dev) et créer votre lien via le formulaire interactif.
2. Construire votre URL personnalisée manuellement ou automatiquement via les variables de votre plateforme d'e-mailing, de CRM ou de chatbot (**ManyChat**, **Smart Sender**, **HubSpot**, **Zapier**, etc.).

En ouvrant l'URL générée, le participant accède à une page sobre et épurée avec des boutons pour ajouter l'événement à son calendrier en un clic.

---

## 📋 Référence des paramètres d'URL

Les paramètres sont transmis dans la chaîne de requête (`?cle=valeur`) séparés par `&`.

| Paramètre | Alias | Requis | Format / Valeurs | Description |
| :--- | :--- | :---: | :--- | :--- |
| **`title`** | `t`, `name`, `summary`, `event`, `subject` | **Oui** | Texte | Titre de l'événement dans le calendrier. Exemple : `title=Reunion+d+equipe` |
| **`start`** | `s`, `date`, `d`, `dt`, `dtstart`, `datetime` | **Oui** | Format de date | Date et heure de début. Prend en charge ISO 8601, RFC 2822, format européen, Unix Timestamps ou date seule pour la journée entière. |
| **`time`** | `tm`, `t_time`, `hour`, `event_time` | Non | `14:30`, `14:30:00`, `2:30 PM` | Heure de début si la date est passée dans un paramètre distinct (`?date=2026-11-20&time=14:30`). |
| **`duration`** | `dur`, `len` | Non | Nombre ou `allDay` | Durée en minutes (`15`, `30`, `45`, `60`, `90`, `120`) ou `allDay`. Par défaut : `60`. |
| **`end`** | `e`, `dtend`, `finish` | Non | Date et heure | Heure de fin précise (alternative à `duration`). |
| **`utc`** | `u`, `tz`, `timezone`, `zone` | Non | Nombre (`1`, `+2`, `-5`) ou ville | Décalage horaire par rapport à UTC (`Europe/Paris`, `UTC+01:00`). Les décalages intégrés à la date (`+01:00`, `Z`) sont détectés automatiquement. |
| **`desc`** | `d`, `details`, `text`, `body`, `notes` | Non | Texte | Description ou ordre du jour. Prend en charge les retours à la ligne `\n`. |
| **`loc`** | `l`, `location`, `place`, `venue` | Non | Texte ou URL | Lieu : lien Zoom/Meet ou adresse physique. |
| **`allDay`** | `allday` | Non | `1` ou `true` | Événement sur toute la journée. |
| **`theme`** | `m`, `mode` | Non | `dark` \| `light` | Thème visuel de la page (`dark` pour le mode sombre). |
| **`c`** | `color`, `bg` | Non | Code couleur HEX | Couleur de fond personnalisée (`0f172a`, `ffffff`). |
| **`lang`** | — | Non | `en` \| `ru` \| `ua` | Langue de l'interface de la page. |
| **`{variables}`** | Tout nom | Non | Texte | Remplace `{var}`, `{{var}}` ou `[var]` dans `title`, `desc` et `loc`. |

---

## 📅 Formats de date et heure pris en charge

CalendarFactory prend en charge les formats générés par les outils SaaS et les bots :

1. **ISO 8601 (avec ou sans fuseau horaire) :**
   - `2026-11-20T14:30`
   - `2026-11-20T14:30:00+01:00`
   - `2026-11-20T14:30:00Z`
   - `2026-11-20 14:30` (espace ou `+`)
2. **Paramètres séparés de date et d'heure :**
   - `?date=2026-11-20&time=14:30`
   - `?date=20.11.2026&time=14:30`
3. **Unix Timestamp :**
   - En secondes (10 chiffres, PHP / Smart Sender `{date:U}`) : `?start=1762086842`
   - En millisecondes (13 chiffres, JS / HubSpot / Make) : `?start=1762086842000`
4. **Format européen :**
   - `20.11.2026 14:30`
   - `20.11.2026` (journée entière)
5. **Format RFC 2822 (Smart Sender `{date:r}`) :**
   - `Fri, 12 Apr 2026 12:01:05 +0200`

---

## 🤖 Intégration : ManyChat, Smart Sender et Chatbots

### 1. Smart Sender
Créez un bouton de type **URL** et insérez votre lien :
```text
https://calendarfactory.pages.dev/?title=Consultation&start={date:c}&duration=45&desc=Bonjour,+[first_name]!&loc=Zoom
```

### 2. ManyChat
Dans Flow Builder, ajoutez un bouton **Open website** :
```text
https://calendarfactory.pages.dev/?title=Webinaire&start={{appointment_datetime}}&duration=60&desc=Bonjour,+{{first_name}}!+Inscription+confirmee.&loc=Google+Meet
```

---

## 💡 Exemples prêts à l'emploi

### 1. Webinaire en ligne via Zoom (90 min, UTC+1)
```text
https://calendarfactory.pages.dev/?title=Webinar+Sync&start=2026-11-25T19:00&duration=90&utc=1&loc=https://zoom.us/j/123456789&desc=Lien+Zoom+inclus
```

### 2. Événement sur toute la journée (Conférence)
```text
https://calendarfactory.pages.dev/?title=Design+Conference&start=2026-12-05&duration=allDay&loc=Online
```

### 3. Lien direct vers le fichier Apple Calendar (.ICS)
```text
https://calendarfactory.pages.dev/event.ics?title=Webinaire&start=2026-11-20T14:30&duration=60
```
