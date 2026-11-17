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
* `pingpong.html`: Online Pingpong für zwei Spieler an zwei Rechnern (Pfeiltasten, bis 5 Punkte), mit Namen und dauerhafter Rangliste (Netlify Function `/api/pingpong`)
* `ratespiel.html`: Ratespiel zu den Kosten der Pflanzenexpedition. Die Tipps speichert eine Netlify Function
  (`netlify/functions/ratespiel.mjs`) in Netlify Blobs. Die richtige Lösung muss in Netlify als
  Umgebungsvariable `RATESPIEL_LOESUNG` hinterlegt sein, damit sie nicht im öffentlichen Repo steht.

## Inhalte ändern
* **Neuer News Beitrag:** in `data/news.js` einen Block oben einfügen, Bild nach `img/` legen.
* **Ranglisten:** Werte in `data/games.js` ändern, wird automatisch sortiert.
* **Party Datum:** in `events.html` (Text) und `js/main.js` (Countdown, Zeile mit `PARTY`).

## Zusammenarbeit
Wir arbeiten zu zweit daran (Besitzer plus ein Collaborator), beide auch mit Claude.
Die Seite ist mit Netlify verbunden, jeder Push auf `main` geht automatisch live und
kostet 15 Netlify Credits. Deshalb gilt seit dem 17.11.2026:

* Änderungen werden auf dem Branch **`sammeln`** gesammelt (committen und pushen dorthin ist
  jederzeit ok, das kostet nichts und beide sehen den Stand).
* Auf `main` (also live) kommt alles erst, wenn jemand ausdrücklich **„push alle Änderungen“**
  sagt. Dann wird `sammeln` in einem Rutsch nach `main` gepusht, das ist ein einziges Deploy.
* Vorher immer den neuesten Stand holen (`git fetch origin`).

Hinweise speziell für Claude stehen in [`CLAUDE.md`](CLAUDE.md).
