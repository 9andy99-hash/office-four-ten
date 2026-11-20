// Ratespiel: Tipps abgeben, Teilnehmende anzeigen, Auflösung mit großer Show.
// Daten kommen von der Netlify Function unter /api/ratespiel (netlify/functions/ratespiel.mjs).
// Testlauf: ratespiel.html?test=20  -> Countdown von 20 Sekunden mit Beispielgewinner.
(function () {
  var API = "/api/ratespiel";
  var LOESUNG = 136.56;
  var aufloesung = Date.parse("2026-11-20T19:00:00+01:00"); // wird vom Server bestätigt
  var zeitVersatz = 0; // Serverzeit minus Gerätezeit
  var aufgeloest = false;
  var konfettiGezeigt = false;
  var holtGerade = false;
  var letzteDaten = null;

  var testSek = parseInt(new URLSearchParams(location.search).get("test"), 10);
  var TEST = testSek > 0;
  if (TEST) aufloesung = Date.now() + testSek * 1000;

  var el = function (id) { return document.getElementById(id); };
  var euro = function (n) { return n.toLocaleString("de-DE", { style: "currency", currency: "EUR" }); };
  var jetzt = function () { return Date.now() + zeitVersatz; };
  var warte = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var ruhig = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Daten holen ----------
  function laden() {
    if (holtGerade) return Promise.resolve(letzteDaten);
    holtGerade = true;
    return fetch(API, { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { anzeigen(d); return d; })
      .catch(function () {
        el("rate-teilnehmer").innerHTML = '<li class="leer">Das Ratespiel ist gerade nicht erreichbar. Bitte später nochmal probieren.</li>';
        return null;
      })
      .then(function (d) { holtGerade = false; return d; });
  }

  function anzeigen(d) {
    letzteDaten = d;
    if (!TEST) {
      if (d.aufloesung) aufloesung = Date.parse(d.aufloesung);
      if (d.serverZeit) zeitVersatz = d.serverZeit - Date.now();
    }
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
    var l = document.createElement("p"); l.className = "rate-loesung";
    l.innerHTML = "Die Pflanzenexpedition hat gekostet: <b></b>";
    l.querySelector("b").textContent = euro(d.loesung === null ? LOESUNG : d.loesung);
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
    var s = document.createElement("button"); s.type = "button"; s.className = "rate-knopf"; s.textContent = "🎬 Show nochmal abspielen";
    s.style.marginLeft = "10px";
    s.addEventListener("click", function () { audio(); vollbild(); aufloesungsShow(d); });
    box.appendChild(s);
  }

  // ---------- Kleiner Countdown auf der Seite ----------
  var cd = el("rate-countdown");
  var letzterVersuch = 0;
  function tick() {
    var diff = aufloesung - jetzt();
    if (diff <= 0) {
      if (!aufgeloest) {
        cd.innerHTML = "<div><b>JETZT!</b>Auflösung läuft …</div>";
        if (!TEST && !showGestartet && Date.now() - letzterVersuch > 4000) { letzterVersuch = Date.now(); laden(); }
      } else {
        cd.innerHTML = "<div><b>AUFGELÖST</b>Fr, 20.11. 19:00 Uhr</div>";
      }
      return;
    }
    var t = Math.floor(diff / 86400000), h = Math.floor(diff / 3600000) % 24,
        m = Math.floor(diff / 60000) % 60, s = Math.floor(diff / 1000) % 60;
    cd.innerHTML = '<p>Auflösung in</p>' + (t ? '<div><b>' + t + "</b>Tage</div>" : "") + "<div><b>" + h + "</b>Std.</div>" +
      "<div><b>" + m + "</b>Min.</div><div><b>" + s + "</b>Sek.</div>";
  }

  // ---------- Sound (WebAudio, alles selbst erzeugt) ----------
  var ac = null;
  function audio() {
    if (!ac) {
      var A = window.AudioContext || window.webkitAudioContext;
      if (!A) return null;
      ac = new A();
    }
    if (ac.state === "suspended") ac.resume();
    setTimeout(soundKnopf, 100);
    return ac;
  }
  function bereit() { return ac && ac.state === "running"; }
  function ton(f, start, dauer, typ, laut, fEnde) {
    if (!bereit()) return;
    var t = ac.currentTime + (start || 0);
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = typ || "square";
    o.frequency.setValueAtTime(f, t);
    if (fEnde) o.frequency.exponentialRampToValueAtTime(fEnde, t + dauer);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(laut || 0.2, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
    o.connect(g); g.connect(ac.destination);
    o.start(t); o.stop(t + dauer + 0.05);
  }
  var rauschPuffer = null;
  function rauschen(start, dauer, laut, filterF) {
    if (!bereit()) return;
    if (!rauschPuffer) {
      rauschPuffer = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
      var d = rauschPuffer.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    var t = ac.currentTime + (start || 0);
    var q = ac.createBufferSource(); q.buffer = rauschPuffer;
    var f = ac.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = filterF || 2000;
    var g = ac.createGain();
    g.gain.setValueAtTime(laut, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
    q.connect(f); f.connect(g); g.connect(ac.destination);
    q.start(t); q.stop(t + dauer + 0.05);
  }
  function piep(rest) {
    if (rest > 10) { ton(880, 0, 0.08, "square", 0.12); return; }
    if (rest > 3) { ton(1000 + (10 - rest) * 90, 0, 0.12, "square", 0.2); ton(500 + (10 - rest) * 45, 0, 0.12, "sawtooth", 0.1); return; }
    ton(1600 + (3 - rest) * 300, 0, 0.35, "sawtooth", 0.3); ton(400, 0, 0.35, "square", 0.2); rauschen(0, 0.15, 0.4, 3000);
  }
  function trommelwirbel(sek) {
    for (var t = 0; t < sek; t += 0.045) rauschen(t, 0.04, 0.08 + 0.5 * (t / sek), 1400);
    rauschen(sek, 0.6, 0.9, 900); ton(90, sek, 0.5, "sine", 0.8, 40);
  }
  function explosion() {
    rauschen(0, 1.8, 1, 700);
    ton(120, 0, 1.2, "sine", 0.9, 30);
  }
  function fanfare() {
    [[523, 0, 0.14], [523, 0.17, 0.14], [523, 0.34, 0.14], [698, 0.51, 0.5], [523, 1.05, 0.14], [698, 1.22, 0.14], [880, 1.39, 1.1]]
      .forEach(function (n) {
        ton(n[0], n[1], n[2], "sawtooth", 0.18);
        ton(n[0] / 2, n[1], n[2], "square", 0.1);
        ton(n[0] * 1.5, n[1], n[2], "triangle", 0.08);
      });
  }
  function klick() { ton(1800 + Math.random() * 600, 0, 0.03, "square", 0.08); }

  // ---------- Große Show (Vollbild Overlay) ----------
  var show = document.createElement("div");
  show.className = "show";
  show.hidden = true;
  show.innerHTML =
    '<div class="show-knoepfe"><button type="button" class="show-sound">🔇 Sound an</button><button type="button" class="show-zu" aria-label="Schließen">✕</button></div>' +
    '<p class="show-oben"></p><div class="show-zahl"></div><p class="show-unten"></p>';
  document.body.appendChild(show);
  var oben = show.querySelector(".show-oben"), zahl = show.querySelector(".show-zahl"), unten = show.querySelector(".show-unten");
  var soundBtn = show.querySelector(".show-sound");
  var showOffen = false, showLaeuft = false, showGestartet = false, letzteSek = null, manuellZu = false;

  function soundKnopf() {
    var an = bereit();
    soundBtn.textContent = an ? "🔊 Sound an" : "🔇 Klick hier für Sound!";
    soundBtn.classList.toggle("aus", !an);
  }
  soundBtn.addEventListener("click", function () { audio(); ton(880, 0, 0.1, "square", 0.15); });
  show.querySelector(".show-zu").addEventListener("click", function () {
    show.hidden = true; showOffen = false; manuellZu = true;
    if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
  });
  // Jeder Klick auf der Seite schaltet den Sound frei (Browser erlauben Ton erst nach einer Interaktion)
  document.addEventListener("pointerdown", function () { audio(); }, { once: true });

  function vollbild() {
    if (show.requestFullscreen && !document.fullscreenElement) show.requestFullscreen().catch(function () {});
  }
  function oeffneShow() {
    show.hidden = false; showOffen = true;
    soundKnopf();
  }
  function neuStart(knoten, klasse) {
    knoten.classList.remove(klasse); void knoten.offsetWidth; knoten.classList.add(klasse);
  }
  function phase(name) { show.className = "show " + name; }
  function blitz() { if (!ruhig) neuStart(show, "blitz"); }
  function wackeln() { if (!ruhig) neuStart(show, "wackeln"); }

  el("show-start").addEventListener("click", function () {
    audio(); manuellZu = false; oeffneShow(); vollbild();
    if (aufgeloest && letzteDaten) aufloesungsShow(letzteDaten);
    else showTick();
  });

  function showTick() {
    var diff = aufloesung - jetzt();
    if (!aufgeloest && !showGestartet && !manuellZu && diff <= 60000 && diff > -30000) oeffneShow();
    if (!showOffen || showLaeuft) return;
    if (diff <= 0) {
      if (!showGestartet) { showGestartet = true; aufloesungsShow(null); }
      return;
    }
    var sek = Math.ceil(diff / 1000);
    if (sek === letzteSek) return;
    letzteSek = sek;
    if (sek > 60) {
      phase("warten");
      oben.textContent = "AUFLÖSUNG DES GROSSEN RATESPIELS IN";
      var h = Math.floor(sek / 3600), m = Math.floor(sek / 60) % 60, s = sek % 60;
      zahl.textContent = (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(s).padStart(2, "0");
      unten.textContent = "Was hat die Pflanzenexpedition gekostet? 🪴";
      return;
    }
    phase(sek <= 10 ? "final" : "countdown");
    oben.textContent = sek <= 10 ? "🚨 GLEICH IST ES SOWEIT 🚨" : "AUFLÖSUNG IN";
    zahl.textContent = sek;
    unten.textContent = sek <= 3 ? ["", "EINS!!!", "ZWEI!!", "DREI!"][sek] : "Sekunden";
    neuStart(zahl, "pop");
    if (sek <= 10) { blitz(); wackeln(); }
    piep(sek);
  }

  function testDaten() {
    return { aufgeloest: true, loesung: LOESUNG, gewinner: "Testperson",
      eintraege: [{ name: "Testperson", tipp: 130, abstand: 6.56 }] };
  }

  // Holt so lange, bis der Server aufgelöst hat (max. ~45 s)
  function holeAufgeloest() {
    if (TEST) return warte(500).then(testDaten);
    var versuche = 0;
    function versuch() {
      return laden().then(function (d) {
        if (d && d.aufgeloest) return d;
        if (++versuche > 30) return null;
        return warte(1500).then(versuch);
      });
    }
    return versuch();
  }

  function walze(dauer, ziel) {
    return new Promise(function (fertig) {
      var start = Date.now();
      (function dreh() {
        var p = (Date.now() - start) / dauer;
        if (p >= 1) { zahl.textContent = euro(ziel); fertig(); return; }
        zahl.textContent = euro(Math.round(Math.random() * 40000) / 100);
        klick();
        setTimeout(dreh, 30 + 320 * p * p);
      })();
    });
  }

  var dauerFeuer = null;
  async function aufloesungsShow(daten) {
    if (showLaeuft) return;
    showLaeuft = true; showGestartet = true; konfettiGezeigt = true;
    clearInterval(dauerFeuer);
    oeffneShow();
    var datenP = daten ? Promise.resolve(daten) : holeAufgeloest();

    phase("knall");
    oben.textContent = ""; zahl.textContent = "💥"; unten.textContent = "";
    explosion(); blitz(); wackeln();
    await warte(1400);

    phase("trommel");
    oben.textContent = "DIE PFLANZENEXPEDITION HAT GEKOSTET …";
    zahl.textContent = "🥁"; unten.textContent = "";
    trommelwirbel(2.5);
    await warte(2500);
    var d = await Promise.race([datenP, warte(1)]);
    var preis = d && typeof d.loesung === "number" ? d.loesung : LOESUNG;
    await walze(3200, preis);

    phase("preis");
    unten.textContent = "inkl. Proviant, Strohhüten und emotionaler Bindung";
    explosion(); fanfare(); blitz(); wackeln(); konfetti();
    await warte(4500);

    phase("trommel");
    oben.textContent = "AM NÄCHSTEN DRAN WAR …";
    zahl.textContent = "🥁"; unten.textContent = "";
    trommelwirbel(3);
    var ergebnis = await Promise.all([datenP, warte(3000)]);
    d = ergebnis[0];

    if (d && d.gewinner && d.eintraege && d.eintraege.length) {
      var e = d.eintraege[0];
      phase("sieger");
      oben.textContent = "🏆 HERZLICHEN GLÜCKWUNSCH 🏆";
      zahl.textContent = e.name;
      unten.textContent = "Tipp: " + euro(e.tipp) + (e.abstand !== null ? "  ·  nur " + euro(e.abstand) + " daneben" : "");
      explosion(); fanfare(); blitz(); wackeln(); konfetti();
      setTimeout(fanfare, 2600);
      var runden = 0;
      dauerFeuer = setInterval(function () { konfetti(); if (++runden >= 6) clearInterval(dauerFeuer); }, 2500);
    } else if (d && d.eintraege && !d.eintraege.length) {
      phase("sieger");
      oben.textContent = "";
      zahl.textContent = "Niemand 😢";
      unten.textContent = "Es hat leider keiner getippt.";
    } else {
      phase("sieger");
      oben.textContent = "";
      zahl.textContent = "🤷";
      unten.textContent = "Der Server ziert sich noch. Gewinner gleich unten in der Liste!";
      laden();
    }
    showLaeuft = false;
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
    if (ruhig) return;
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
  setInterval(showTick, 150);
  setInterval(function () { if (!aufgeloest) laden(); }, 30000);
})();
