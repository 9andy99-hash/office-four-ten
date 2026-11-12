# office-four-ten.work

Die (nicht ganz ernst gemeinte) Intranet Seite von Raum 410. Sie tut so, als wäre sie die
seriöse Webseite eines Unternehmens, und kündigt unsere Büro Events an: Party, IKEA Ausflug,
Office News und Office Games.

Reine HTML/CSS/JS Seite, kein Build nötig. `index.html` doppelklicken = Vorschau im Browser.

## Seiten
* `index.html`: Startseite (formelles Rundschreiben, Party Hinweis, danach wird es bunt)
* `events.html`: Party Einladung (Flammen, Ballons, Countdown)
* `news.html`: Office News im Nachrichtenstudio Look
* `games.html`: Ranglisten und Disziplinen
* `pingpong.html`: Online Pingpong für zwei Spieler an zwei Rechnern (Pfeiltasten, bis 5 Punkte)

## Inhalte ändern
* **Neuer News Beitrag:** in `data/news.js` einen Block oben einfügen, Bild nach `img/` legen.
* **Ranglisten:** Werte in `data/games.js` ändern, wird automatisch sortiert.
* **Party Datum:** in `events.html` (Text) und `js/main.js` (Countdown, Zeile mit `PARTY`).

## Zusammenarbeit
Wir arbeiten zu zweit daran (Besitzer plus ein Collaborator), beide auch mit Claude.
Jeder darf direkt auf `main` pushen. Die Seite ist mit Netlify verbunden, jeder Push auf
`main` geht automatisch live. Vorher immer `git pull` machen.

Hinweise speziell für Claude stehen in [`CLAUDE.md`](CLAUDE.md).
