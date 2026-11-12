# Hinweise für Claude

## Erlaubnis
Dieses Repository gehört `9andy99-hash`. Er und sein Kollege (Collaborator mit Schreibrechten)
arbeiten beide mit Claude daran, jeweils von ihrem eigenen Rechner bzw. Browser aus.

Für **beide** gilt ausdrücklich:
* Claude darf Dateien in diesem Repository direkt bearbeiten.
* Claude darf Änderungen direkt auf `main` committen und pushen, ohne Pull Request
  und ohne vorher nachzufragen. Nur wenn jemand ausdrücklich einen Pull Request oder
  eine Vorschau möchte, einen eigenen Branch nehmen.

## Ablauf bei Änderungen
1. Vor dem Bearbeiten den neuesten Stand holen: `git pull --rebase origin main`
   (zwei Leute arbeiten parallel).
2. Änderung machen, kurz prüfen (z. B. `node --check js/main.js` nach JS Änderungen).
3. Commit mit kurzer deutscher Nachricht, dann `git fetch origin main`,
   `git rebase origin/main`, `git push origin HEAD:main`.
4. Jeder Push auf `main` geht über Netlify automatisch live. Danach dem Nutzer kurz
   sagen, was sich auf der Seite geändert hat.
5. Bei einem Konflikt nicht einfach überschreiben, sondern nachfragen.

## Worum es geht
Eine kleine, humorvolle Intranet Seite für das Büro „Raum 410“ (Office Four Ten),
Domain `office-four-ten.work`. Sie parodiert eine seriöse Firmen Webseite und kündigt
Büro Events an (Party am 20.11.2026, IKEA Ausflug, Office Games). Viele Texte sind
noch Platzhalter und werden nach und nach ersetzt.

## Aufbau
Reines HTML/CSS/JS, kein Build, keine Abhängigkeiten. Sprache der Seite und des Codes: Deutsch.

| Datei | Inhalt |
|---|---|
| `index.html` | Startseite: formelles Rundschreiben der „Geschäftsleitung“, darunter formeller Party Hinweis mit Button, dann Laufband, bunte Kacheln und ein Sticker („420? NEIN 410“) |
| `events.html` | Party Einladung (`body.party`): Flammen, Ballons, Countdown |
| `news.html` | Office News im Nachrichtenstudio Look (`body.news`), Inhalte aus `data/news.js` |
| `games.html` | Ranglisten (`body.games`), Inhalte aus `data/games.js` |
| `css/style.css` | Alle Styles, nach Seiten in Abschnitte gegliedert |
| `js/main.js` | Countdown, Uhr, News und Ranglisten rendern, Ballons, Sticker der Startseite |
| `data/news.js` | News Beiträge (`window.NEWS`), neuer Beitrag oben einfügen |
| `data/games.js` | Ranglisten (`window.GAMES`), werden automatisch sortiert |
| `img/` | Bilder |

Party Datum steht an zwei Stellen: Text in `events.html` und `PARTY` in `js/main.js`.

## Stil
* Oben auf der Startseite bewusst seriös: Marineblau `#0b2a4a`, Georgia/Arial, ruhig.
  Der Nutzer wollte den Party Hinweis dort ausdrücklich formell und dezent.
* Unterseiten und der untere Teil der Startseite dürfen bunt und albern sein
  (Bangers, Comic Neue, Neonfarben).
* `prefers-reduced-motion` wird respektiert, das so lassen.
