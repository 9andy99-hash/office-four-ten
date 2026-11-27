# Hinweise für Claude

## Erlaubnis
Dieses Repository gehört `9andy99-hash`. Er und sein Kollege (Collaborator mit Schreibrechten)
arbeiten beide mit Claude daran, jeweils von ihrem eigenen Rechner bzw. Browser aus.

Für **beide** gilt ausdrücklich:
* Claude darf Dateien in diesem Repository direkt bearbeiten.
* Claude darf auf den Branch `sammeln` committen und pushen, ohne vorher nachzufragen.
* **Auf `main` wird NUR gepusht, wenn der Nutzer ausdrücklich sagt „push alle Änderungen“**
  (oder eindeutig dasselbe meint, z. B. „jetzt live schalten“). Sonst nie, auch nicht
  für kleine Korrekturen.

## Warum: Netlify Deploys kosten Credits
Jeder Push auf `main` löst ein Netlify Produktions Deploy aus, und jedes kostet 15 Credits.
Am 17.11.2026 waren die Gratis Credits nach rund 20 Einzel Pushes an einem Tag aufgebraucht
und die Seite ließ sich nicht mehr ändern. Deshalb werden Änderungen ab jetzt gesammelt
und nur gebündelt live geschaltet. Pushes auf `sammeln` lösen kein Produktions Deploy aus.

## Ablauf bei Änderungen
1. Neuesten Stand holen und auf `sammeln` arbeiten (zwei Leute arbeiten parallel):
   `git fetch origin` und `git checkout sammeln` (falls lokal noch nicht da:
   `git checkout -b sammeln origin/sammeln`), dann `git rebase origin/sammeln`.
   Falls `main` neuer ist: `git rebase origin/main`.
2. Änderung machen, kurz prüfen (z. B. `node --check js/main.js` nach JS Änderungen).
3. Commit mit kurzer deutscher Nachricht, dann `git push origin sammeln`.
   So sieht auch der Claude des Kollegen die Änderung.
4. Dem Nutzer sagen, was geändert wurde, und dass es noch **nicht live** ist, sondern
   gesammelt wird, bis jemand „push alle Änderungen“ sagt.
5. Erst bei „push alle Änderungen“: `git fetch origin`, `sammeln` auf `origin/main` rebasen,
   dann `git push origin sammeln:main` (ein einziges Deploy für alles). Danach kurz sagen,
   was jetzt live geht.
6. Bei einem Konflikt nicht einfach überschreiben, sondern nachfragen.
7. Wer eine Änderung in Netlify braucht (z. B. eine Umgebungsvariable), muss danach
   deployen, damit sie wirkt. Auch das nur gebündelt.

## Worum es geht
Eine kleine, humorvolle Intranet Seite für das Büro „Raum 410“ (Office Four Ten),
Domain `office-four-ten.work`. Sie parodiert eine seriöse Firmen Webseite und kündigt
Büro Events an (Party am 20.11.2026, IKEA Ausflug, Office Games). Viele Texte sind
noch Platzhalter und werden nach und nach ersetzt.

## Aufbau
Reines HTML/CSS/JS, kein Build. Ausnahme: eine Netlify Function fürs Ratespiel. Einzige Fremdbibliothek: PeerJS in `js/vendor/` (nur für Pingpong). Sprache der Seite und des Codes: Deutsch.

| Datei | Inhalt |
|---|---|
| `index.html` | Startseite: formelles Rundschreiben der „Geschäftsleitung“, darunter formeller Party Hinweis mit Button, dann Laufband, bunte Kacheln und ein Sticker („420? NEIN 410“) |
| `events.html` | Party Einladung (`body.party`): Flammen, Ballons, Countdown |
| `news.html` | Office News im Nachrichtenstudio Look (`body.news`), Inhalte aus `data/news.js` |
| `games.html` | Ranglisten (`body.games`), Inhalte aus `data/games.js`, Kacheln zu den Disziplinen (z. B. Pingpong) |
| `pingpong.html` + `js/pingpong.js` | Online Pingpong für 2 Spieler an 2 Rechnern. Kein eigener Server: der erste Browser auf der Seite wird per PeerJS (WebRTC, öffentlicher Broker 0.peerjs.com) automatisch Gastgeber und rechnet das Spiel, die anderen verbinden sich mit ihm. Spiellogik in `Spiel` (testbar mit Node über `require`). Spieler geben nach Klick auf den Schläger einen Namen ein. Nach jedem Sieg meldet der Gastgeber Browser das Ergebnis an `/api/pingpong` (`netlify/functions/pingpong.mjs`, Logik in `netlify/pingpong-logik.mjs`), die Rangliste (gewonnene Spiele) liegt in Netlify Blobs. |
| `js/vendor/peerjs.min.js` | PeerJS 1.5.4 (MIT), lokal abgelegt statt CDN |
| `css/style.css` | Alle Styles, nach Seiten in Abschnitte gegliedert |
| `js/main.js` | Countdown, Uhr, News und Ranglisten rendern, Ballons, Sticker der Startseite |
| `data/news.js` | News Beiträge (`window.NEWS`), neuer Beitrag oben einfügen. Die Laufbänder (News unten, Startseite) bauen sich in `js/main.js` automatisch aus den 5 neuesten Titeln plus `window.TICKER_EXTRA` |
| `data/games.js` | Ranglisten (`window.GAMES`), werden automatisch sortiert |
| `ratespiel.html` + `js/ratespiel.js` | Ratespiel (Kosten der Pflanzenexpedition). Namen sofort sichtbar, Tipps erst ab Fr 20.11.2026 19:00 Uhr. Großer Vollbild Countdown mit WebAudio Sound (letzte 60 s automatisch), dann Auflösungsshow: Preis, Gewinner, Konfetti. Testlauf mit `ratespiel.html?test=20` (Sekunden) |
| `netlify/functions/ratespiel.mjs` | Netlify Function `/api/ratespiel`, speichert Tipps in Netlify Blobs. Logik in `netlify/ratespiel-logik.mjs` (mit Node testbar). Die Lösung (136,56 €) steht dort als `LOESUNG`, auf Wunsch der Nutzer öffentlich |
| `kommentare.html` + `js/kommentare.js` | Kommentare (eigener Tab in der Navigation). Name + Text, chronologisch (ältester zuerst), ohne Datum/Uhrzeit. Function `/api/kommentare` (`netlify/functions/kommentare.mjs`, Logik in `netlify/kommentare-logik.mjs`), gespeichert in Netlify Blobs |
| `tippen.html` + `js/tippen.js` | 10 Finger Tippspiel (unter Office Games), 60 Sekunden, WPM = richtige Anschläge / 5. Nach jeder Runde Name eintragen, Bestenliste zeigt die beste Runde pro Name. Function `/api/tippen` (`netlify/functions/tippen.mjs`, Logik in `netlify/tippen-logik.mjs`) |
| `netlify.toml` | Sperrt interne Dateien (`/netlify/*`, `README.md`, `CLAUDE.md`, `package*.json`) für Besucher der Webseite. Keine Lösungen oder Beispielwerte dafür in Kommentare schreiben, das Repo ist öffentlich |
| `package.json` | Nur für `@netlify/blobs` (Function). Kein Build für die Seite selbst |
| `img/` | Bilder |

Party Datum steht an zwei Stellen: Text in `events.html` und `PARTY` in `js/main.js`.

## Stil
* Oben auf der Startseite bewusst seriös: Marineblau `#0b2a4a`, Georgia/Arial, ruhig.
  Der Nutzer wollte den Party Hinweis dort ausdrücklich formell und dezent.
* Unterseiten und der untere Teil der Startseite dürfen bunt und albern sein
  (Bangers, Comic Neue, Neonfarben).
* `prefers-reduced-motion` wird respektiert, das so lassen.
