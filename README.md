# office-four-ten.work

Reine HTML/CSS/JS-Seite, kein Build nötig. `index.html` doppelklicken = Vorschau im Browser.

## Seiten
- `index.html` – Startseite (seriöses Memo → Chaos)
- `events.html` – Party-Einladung (Flammen, Ballons, Countdown)
- `news.html` – Office News im Nachrichtenstudio-Look
- `games.html` – Ranglisten (später)

## Inhalte ändern
- **Neuer News-Beitrag:** in `data/news.js` einen Block oben einfügen, Bild nach `img/` legen.
- **Ranglisten:** Werte in `data/games.js` ändern – wird automatisch sortiert.
- **Party-Datum:** in `events.html` (Text) und `js/main.js` (Countdown, Zeile mit `PARTY`).

## Online stellen (kostenlos)
1. https://app.netlify.com/drop öffnen und den ganzen Ordner reinziehen.
2. In Netlify: *Domain management → Add domain* → `office-four-ten.work`.
3. Beim Domain-Anbieter die DNS-Einträge eintragen, die Netlify anzeigt.
