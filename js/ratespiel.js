// Ratespiel: Tipps abgeben, Teilnehmende anzeigen, Auflösung mit Konfetti.
// Daten kommen von der Netlify Function unter /api/ratespiel (netlify/functions/ratespiel.mjs).
(function () {
  var API = "/api/ratespiel";
  var aufloesung = Date.parse("2026-11-20T20:00:00+01:00"); // wird vom Server bestätigt
  var zeitVersatz = 0; // Serverzeit minus Gerätezeit
  var aufgeloest = false;
  var konfettiGezeigt = false;
  var holtGerade = false;

  var el = function (id) { return document.getElementById(id); };
  var euro = function (n) { return n.toLocaleString("de-DE", { style: "currency", currency: "EUR" }); };
  var jetzt = function () { return Date.now() + zeitVersatz; };

  // ---------- Daten holen ----------
  function laden() {
    if (holtGerade) return Promise.resolve();
    holtGerade = true;
    return fetch(API, { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(anzeigen)
      .catch(function () {
        el("rate-teilnehmer").innerHTML = '<li class="leer">Das Ratespiel ist gerade nicht erreichbar. Bitte später nochmal probieren.</li>';
      })
      .then(function () { holtGerade = false; });
  }

  function anzeigen(d) {
    if (d.aufloesung) aufloesung = Date.parse(d.aufloesung);
    if (d.serverZeit) zeitVersatz = d.serverZeit - Date.now();
    el("rate-anzahl").textContent = "(" + d.anzahl + ")";
    var liste = el("rate-teilnehmer");
    liste.innerHTML = "";
    if (!d.aufgeloest) {
      if (!d.teilnehmer.length) liste.innerHTML = '<li class="leer">Noch niemand. Sei die erste Person!</li>';
      d.teilnehmer.forEach(function (name) {
        var li = document.createElement("li");
        var n = document.createElement("span"); n.textContent = name;
        var t = document.createElement("span"); t.className = "versiegelt"; t.textContent = "✉️ versiegelt";
        li.append(n, t);
        liste.appendChild(li);
      });
      return;
    }
    aufgeloest = true;
    el("rate-formular-box").hidden = true;
    zeigeErgebnis(d);
    if (!d.eintraege.length) liste.innerHTML = '<li class="leer">Niemand hat getippt. Schade!</li>';
    d.eintraege.forEach(function (e, i) {
      var li = document.createElement("li");
      if (d.gewinner && i === 0) li.className = "sieger";
      var n = document.createElement("span");
      n.textContent = (d.gewinner ? (["🥇 ", "🥈 ", "🥉 "][i] || (i + 1) + ". ") : "") + e.name;
      var t = document.createElement("span");
      t.textContent = euro(e.tipp) + (e.abstand !== null ? "  (±" + euro(e.abstand) + ")" : "");
      li.append(n, t);
      liste.appendChild(li);
    });
  }

  function zeigeErgebnis(d) {
    var box = el("rate-ergebnis");
    box.hidden = false;
    box.innerHTML = "";
    var h = document.createElement("h2"); h.textContent = "▶ Auflösung";
    box.appendChild(h);
    if (d.loesung === null) {
      var p = document.createElement("p"); p.className = "rate-loesung";
      p.textContent = "Die Tipps sind aufgedeckt! Den echten Betrag verkündet die Geschäftsleitung jetzt live auf der Party.";
      box.appendChild(p);
      return;
    }
    var l = document.createElement("p"); l.className = "rate-loesung";
    l.innerHTML = "Die Pflanzenexpedition hat gekostet: <b></b>";
    l.querySelector("b").textContent = euro(d.loesung);
    box.appendChild(l);
    if (d.gewinner) {
      var g = document.createElement("div"); g.className = "rate-gewinner";
      g.innerHTML = '<small>🎉 Herzlichen Glückwunsch! 🎉<br>Die beste Schätzung kam von:</small><b></b>';
      g.querySelector("b").textContent = d.gewinner;
      box.appendChild(g);
      var k = document.createElement("button"); k.type = "button"; k.className = "rate-knopf"; k.textContent = "Nochmal Konfetti! 🎊";
      k.addEventListener("click", konfetti);
      box.appendChild(k);
      if (!konfettiGezeigt) { konfettiGezeigt = true; konfetti(); }
    }
  }

  // ---------- Countdown ----------
  var cd = el("rate-countdown");
  var letzterVersuch = 0;
  function tick() {
    var diff = aufloesung - jetzt();
    if (diff <= 0) {
      if (!aufgeloest) {
        cd.innerHTML = "<div><b>JETZT!</b>Auflösung läuft …</div>";
        if (Date.now() - letzterVersuch > 4000) { letzterVersuch = Date.now(); laden(); }
      } else {
        cd.innerHTML = "<div><b>AUFGELÖST</b>Fr, 20.11. 20:00 Uhr</div>";
      }
      return;
    }
    var t = Math.floor(diff / 86400000), h = Math.floor(diff / 3600000) % 24,
        m = Math.floor(diff / 60000) % 60, s = Math.floor(diff / 1000) % 60;
    cd.innerHTML = '<p>Auflösung in</p><div><b>' + t + "</b>Tage</div><div><b>" + h + "</b>Std.</div>" +
      "<div><b>" + m + "</b>Min.</div><div><b>" + s + "</b>Sek.</div>";
  }

  // ---------- Formular ----------
  var form = el("rate-formular");
  var meldung = el("rate-meldung");
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var knopf = form.querySelector("button");
    knopf.disabled = true;
    meldung.className = "rate-meldung";
    meldung.textContent = "Wird versiegelt …";
    fetch(API, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: form.elements.name.value, tipp: form.elements.tipp.value })
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (x) {
        if (!x.ok) throw new Error(x.d.fehler || "Das hat leider nicht geklappt.");
        meldung.className = "rate-meldung ok";
        meldung.textContent = "Danke, " + form.elements.name.value.trim() + "! Dein Tipp liegt versiegelt im Tresor der Geschäftsleitung.";
        form.reset();
        anzeigen(x.d);
      })
      .catch(function (e) {
        meldung.className = "rate-meldung fehler";
        meldung.textContent = e.message && e.message !== "Failed to fetch" ? e.message : "Das Ratespiel ist gerade nicht erreichbar.";
      })
      .then(function () { knopf.disabled = false; });
  });

  // ---------- Konfetti Kanonen ----------
  var canvas = el("konfetti");
  var ctx = canvas.getContext("2d");
  var teile = [];
  var laeuft = false;
  var farben = ["#ff0", "#0f0", "#f0f", "#0ff", "#f60", "#ff2d55", "#fff"];
  function konfetti() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    canvas.width = innerWidth; canvas.height = innerHeight;
    var kanone = function (x, richtung, anzahl) {
      for (var i = 0; i < anzahl; i++) {
        teile.push({
          x: x, y: canvas.height,
          vx: richtung * (3 + Math.random() * 10), vy: -(14 + Math.random() * 14),
          w: 6 + Math.random() * 8, h: 4 + Math.random() * 6,
          r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
          f: farben[Math.floor(Math.random() * farben.length)]
        });
      }
    };
    [0, 450, 900].forEach(function (verz) {
      setTimeout(function () { kanone(0, 1, 90); kanone(canvas.width, -1, 90); }, verz);
    });
    if (!laeuft) { laeuft = true; requestAnimationFrame(schritt); }
  }
  function schritt() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    teile = teile.filter(function (t) { return t.y < canvas.height + 40; });
    teile.forEach(function (t) {
      t.vy += 0.35; t.vx *= 0.99; t.x += t.vx; t.y += t.vy; t.r += t.vr;
      ctx.save(); ctx.translate(t.x, t.y); ctx.rotate(t.r);
      ctx.fillStyle = t.f; ctx.fillRect(-t.w / 2, -t.h / 2, t.w, t.h * Math.abs(Math.cos(t.r * 2)) + 1);
      ctx.restore();
    });
    if (teile.length) requestAnimationFrame(schritt);
    else { laeuft = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }

  laden();
  tick();
  setInterval(tick, 1000);
  setInterval(function () { if (!aufgeloest) laden(); }, 30000);
})();
