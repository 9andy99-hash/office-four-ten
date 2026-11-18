// 10-Finger-Tippspiel: 60 Sekunden Wörter tippen, danach mit Namen in die Bestenliste.
// Bestenliste kommt von /api/tippen (netlify/functions/tippen.mjs).
(function () {
  var API = "/api/tippen";
  var DAUER = 60;
  var WOERTER = ("der die und in den von zu das mit sich des auf für ist im dem nicht ein eine als auch es an werden aus er hat dass sie nach wird bei einer um am sind noch wie einem über einen so zum war haben nur oder aber vor zur bis mehr durch man sein wurde sei hier ihr schon wenn sehr ohne alle immer zwei neue jetzt heute gut groß klein lang weit hoch erst dann denn weil doch etwas viel wenig unter wieder zwischen gegen also damit müssen können sollen wollen machen sagen gehen kommen sehen geben finden stehen bleiben liegen halten bringen denken nehmen tun dürfen glauben arbeiten spielen lernen schreiben lesen fragen hören laufen trinken essen kaufen zeigen Zeit Jahr Tag Woche Monat Abend Morgen Leben Mensch Frau Mann Kind Welt Hand Auge Haus Stadt Land Arbeit Geld Frage Teil Platz Name Wasser Weg Tür Tisch Stuhl Fenster Buch Bild Seite Wort Spiel Ende Anfang Zahl Grund Büro Kaffee Pflanze Party Raum Kollege Chef Pause Feierabend Rechner Tastatur Drucker Termin Projekt Besprechung Mittag Kuchen Bier Glühwein Brettspiel Freitag Montag Schreibtisch Sauerstoff Gießkanne Blumentopf Expedition Geschäftsleitung schnell langsam richtig falsch leicht schwer früh spät warm kalt neu alt jung schön wichtig möglich bekannt einfach wirklich besonders natürlich vielleicht gemeinsam deshalb trotzdem eigentlich ungefähr ja nein wo was wer wir ich du uns euch mir dir mal nun gern bald oft ganz kurz rot blau grün gelb weiß schwarz hell dunkel laut leise satt müde froh nett klar fest frei voll leer neun zehn drei vier fünf acht elf zwölf Hund Katze Maus Baum Blatt Blume Sonne Mond Stern Regen Schnee Wind Berg See Meer Brot Milch Tee Salz Obst Ei Bus Zug Rad Auto Ball Hut Ohr Bein Kopf Mund Nase Herz Bett Uhr Brief Stift Heft Lampe Glas Tasse Teller Gabel Löffel Messer Hose Schuh Jacke Mütze rufen sitzen legen holen bauen malen singen tanzen lachen weinen kochen backen waschen fahren fliegen schwimmen springen öffnen").split(" ");

  var el = function (id) { return document.getElementById(id); };
  var feld = el("tipp-woerter"), zeilen = el("tipp-zeilen"), eingabe = el("tipp-eingabe");
  var uhr = el("tipp-uhr"), ergebnisBox = el("tipp-ergebnis"), form = el("tipp-formular"), meldung = el("tipp-meldung");

  var woerter, spans, index, richtig, falsch, anschlaege, laeuft, fertig, ende, timer, ergebnis, eingetragen;

  try { form.elements.name.value = localStorage.getItem("office410-name") || ""; } catch (e) {}

  function zufallsWoerter(n) {
    var liste = [], letztes = "";
    while (liste.length < n) {
      var w = WOERTER[Math.floor(Math.random() * WOERTER.length)];
      if (w !== letztes) { liste.push(w); letztes = w; }
    }
    return liste;
  }

  function neu() {
    clearInterval(timer);
    woerter = zufallsWoerter(400);
    index = 0; richtig = 0; falsch = 0; anschlaege = 0;
    laeuft = false; fertig = false; ergebnis = null; eingetragen = false;
    zeilen.innerHTML = "";
    zeilen.style.transform = "";
    spans = woerter.map(function (w) {
      var s = document.createElement("span");
      s.textContent = w;
      zeilen.appendChild(s);
      zeilen.appendChild(document.createTextNode(" "));
      return s;
    });
    spans[0].className = "aktuell";
    eingabe.value = "";
    eingabe.disabled = false;
    uhr.textContent = "1:00";
    uhr.classList.remove("knapp");
    ergebnisBox.hidden = true;
    meldung.textContent = "";
    feld.classList.remove("vorbei");
    eingabe.focus();
  }

  function start() {
    laeuft = true;
    ende = Date.now() + DAUER * 1000;
    timer = setInterval(tick, 200);
  }

  function tick() {
    var rest = Math.max(0, Math.ceil((ende - Date.now()) / 1000));
    uhr.textContent = Math.floor(rest / 60) + ":" + ("0" + (rest % 60)).slice(-2);
    uhr.classList.toggle("knapp", rest <= 10);
    if (rest <= 0) stopp();
  }

  // Zeile mit dem aktuellen Wort nach oben schieben, wie bei 10fastfingers
  function scrollen() {
    var oben = spans[index].offsetTop - spans[0].offsetTop;
    zeilen.style.transform = "translateY(" + (-oben) + "px)";
  }

  function wortFertig() {
    var getippt = eingabe.value.trim();
    if (!getippt) { eingabe.value = ""; return; }
    var soll = woerter[index];
    if (getippt === soll) { richtig++; anschlaege += soll.length + 1; spans[index].className = "ok"; }
    else { falsch++; spans[index].className = "falsch"; }
    index++;
    eingabe.value = "";
    spans[index].className = "aktuell";
    if (spans[index].offsetTop !== spans[index - 1].offsetTop) scrollen();
  }

  eingabe.addEventListener("input", function () {
    if (fertig) return;
    if (!laeuft && eingabe.value.trim()) start();
    if (/\s/.test(eingabe.value)) {
      // Leerzeichen (auch mitten im Text, z. B. am Handy) beendet das Wort
      var teile = eingabe.value.split(/\s+/);
      var rest = teile.pop();
      teile.forEach(function (t) { eingabe.value = t; wortFertig(); });
      eingabe.value = rest;
    }
    var soll = woerter[index], ist = eingabe.value;
    spans[index].className = "aktuell" + (ist && soll.indexOf(ist) !== 0 ? " fehler" : "");
  });

  eingabe.addEventListener("paste", function (ev) { ev.preventDefault(); });

  function stopp() {
    clearInterval(timer);
    laeuft = false; fertig = true;
    eingabe.disabled = true;
    feld.classList.add("vorbei");
    uhr.textContent = "0:00";
    var gesamt = richtig + falsch;
    ergebnis = { richtig: richtig, falsch: falsch, anschlaege: anschlaege };
    el("tipp-wpm").textContent = Math.round(anschlaege / 5);
    el("tipp-anschlaege").textContent = anschlaege;
    el("tipp-genau").textContent = (gesamt ? Math.round(richtig / gesamt * 100) : 0) + " %";
    el("tipp-richtig").textContent = richtig;
    el("tipp-falsch").textContent = falsch;
    ergebnisBox.hidden = false;
    form.querySelector('button[type="submit"]').disabled = gesamt === 0;
    ergebnisBox.scrollIntoView({ block: "nearest", behavior: "smooth" });
    if (!form.elements.name.value) form.elements.name.focus();
  }

  el("tipp-neu").addEventListener("click", neu);
  el("tipp-nochmal").addEventListener("click", neu);
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") { ev.preventDefault(); neu(); }
  });
  feld.addEventListener("click", function () { if (!fertig) eingabe.focus(); });

  // ---------- Bestenliste ----------
  var tabelle = el("tipp-bestenliste");
  function zeigeListe(d, markiert) {
    tabelle.innerHTML = "";
    if (!d.bestenliste.length) { tabelle.innerHTML = "<tr><td>Noch keine Einträge. Sei die erste Person!</td></tr>"; return; }
    d.bestenliste.forEach(function (e, i) {
      var tr = tabelle.insertRow();
      if (markiert && e.name.toLocaleLowerCase("de") === markiert.toLocaleLowerCase("de")) tr.className = "markiert";
      tr.insertCell().textContent = ["🥇", "🥈", "🥉"][i] || (i + 1) + ".";
      tr.insertCell().textContent = e.name;
      tr.insertCell().textContent = e.genauigkeit + " %";
      tr.insertCell().textContent = e.wpm + " WPM";
    });
  }
  function laden() {
    fetch(API, { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { zeigeListe(d); })
      .catch(function () { tabelle.innerHTML = "<tr><td>Bestenliste gerade nicht erreichbar.</td></tr>"; });
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!ergebnis || eingetragen) return;
    var knopf = form.querySelector('button[type="submit"]');
    var name = form.elements.name.value;
    knopf.disabled = true;
    meldung.className = "rate-meldung";
    meldung.textContent = "Wird eingetragen …";
    fetch(API, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: name, richtig: ergebnis.richtig, falsch: ergebnis.falsch, anschlaege: ergebnis.anschlaege })
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (x) {
        if (!x.ok) throw new Error(x.d.fehler || "Das hat leider nicht geklappt.");
        eingetragen = true;
        try { localStorage.setItem("office410-name", name.trim()); } catch (e) {}
        meldung.className = "rate-meldung ok";
        meldung.textContent = "Eingetragen: " + x.d.eingetragen.name + " mit " + x.d.eingetragen.wpm + " WPM.";
        zeigeListe(x.d, x.d.eingetragen.name);
      })
      .catch(function (e) {
        knopf.disabled = false;
        meldung.className = "rate-meldung fehler";
        meldung.textContent = e.message && e.message !== "Failed to fetch" ? e.message : "Die Bestenliste ist gerade nicht erreichbar.";
      });
  });

  neu();
  laden();
})();
