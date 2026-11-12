// ============================================================
//  OFFICE GAMES – Pingpong für zwei Spieler an zwei Rechnern
//
//  Kein eigener Server nötig: Der erste Browser, der die Seite öffnet,
//  wird automatisch "Gastgeber" (rechnet das Spiel), alle anderen
//  verbinden sich per WebRTC (PeerJS) mit ihm und schicken nur ihre
//  Tasten. Schließt der Gastgeber die Seite, übernimmt ein anderer.
// ============================================================
(function () {
  "use strict";

  // ---------- Einstellungen ----------
  var RAUM_ID = "office-four-ten-pingpong-v1"; // feste Adresse des Gastgebers
  var W = 800, H = 500;
  var SCHLAEGER_B = 12, SCHLAEGER_H = 84, RAND = 26;
  var BALL_R = 7;
  var SCHLAEGER_TEMPO = 460;    // Pixel pro Sekunde
  var BALL_START = 320;         // Pixel pro Sekunde
  var BALL_FAKTOR = 1.07;       // pro Treffer schneller
  var BALL_MAX = 1300;
  var SIEG_PUNKTE = 5;
  var COUNTDOWN = 3, SIEG_ANZEIGE = 5, AUFSCHLAG_PAUSE = 0.8;
  var FARBE = { links: "#ff2d55", rechts: "#0a84ff" };
  var NAME = { links: "PLAYER RED", rechts: "PLAYER BLUE" };

  // ============================================================
  //  SPIEL-LOGIK (läuft nur beim Gastgeber)
  // ============================================================
  function Spiel() { this.zuruecksetzen(); this.meldung = ""; this.meldungZeit = 0; }

  Spiel.prototype.zuruecksetzen = function () {
    this.phase = "warten";        // warten | countdown | spiel | sieg
    this.besitzer = { links: null, rechts: null };
    this.y = { links: H / 2, rechts: H / 2 };
    this.punkte = { links: 0, rechts: 0 };
    this.ball = { x: W / 2, y: H / 2, vx: 0, vy: 0 };
    this.timer = 0;
    this.pause = 0;
    this.sieger = null;
    this.eingabe = {};
  };

  Spiel.prototype.melde = function (text) { this.meldung = text; this.meldungZeit = 3; };

  Spiel.prototype.seiteVon = function (id) {
    if (this.besitzer.links === id) return "links";
    if (this.besitzer.rechts === id) return "rechts";
    return null;
  };

  Spiel.prototype.abbrechen = function (text) {
    this.zuruecksetzen();
    this.melde(text);
  };

  // Nachricht eines Spielers verarbeiten
  Spiel.prototype.nachricht = function (id, m) {
    if (!m || typeof m !== "object") return;
    if (m.typ === "waehle" && (m.seite === "links" || m.seite === "rechts")) {
      if (this.phase === "sieg") return;
      var laeuft = this.phase === "countdown" || this.phase === "spiel";
      var meine = this.seiteVon(id);
      if (this.besitzer[m.seite] === id) {
        // zweiter Klick: Schläger wieder abgeben
        if (laeuft) { this.abbrechen(NAME[m.seite] + " hat aufgegeben. Spiel abgebrochen."); return; }
        this.besitzer[m.seite] = null;
        return;
      }
      if (this.besitzer[m.seite] !== null) return; // schon vergeben, Pech gehabt
      if (meine) {
        if (laeuft) return;                         // mitten im Spiel nicht wechseln
        this.besitzer[meine] = null;                // Seite wechseln
      }
      this.besitzer[m.seite] = id;
      this.eingabe[id] = { hoch: false, runter: false };
      if (this.besitzer.links && this.besitzer.rechts && this.phase === "warten") {
        this.phase = "countdown";
        this.timer = COUNTDOWN;
        this.punkte = { links: 0, rechts: 0 };
        this.y = { links: H / 2, rechts: H / 2 };
        this.ball = { x: W / 2, y: H / 2, vx: 0, vy: 0 };
      }
    } else if (m.typ === "taste") {
      if (!this.seiteVon(id)) return;
      this.eingabe[id] = { hoch: !!m.hoch, runter: !!m.runter };
    }
  };

  // Ein Spieler hat die Seite verlassen
  Spiel.prototype.trennen = function (id) {
    var seite = this.seiteVon(id);
    delete this.eingabe[id];
    if (!seite) return;
    if (this.phase === "countdown" || this.phase === "spiel") {
      this.abbrechen(NAME[seite] + " ist weg. Spiel abgebrochen.");
    } else if (this.phase === "warten") {
      this.besitzer[seite] = null;
    }
  };

  Spiel.prototype.aufschlag = function (richtung) {
    var winkel = (Math.random() * 0.8 - 0.4); // ca. ±23°
    this.ball = {
      x: W / 2, y: H / 2,
      vx: Math.cos(winkel) * BALL_START * richtung,
      vy: Math.sin(winkel) * BALL_START
    };
    this.pause = AUFSCHLAG_PAUSE;
  };

  Spiel.prototype.tick = function (dt) {
    if (this.meldungZeit > 0) { this.meldungZeit -= dt; if (this.meldungZeit <= 0) this.meldung = ""; }

    if (this.phase === "warten") {
      this.bewegeSchlaeger(dt); // schon mal warmlaufen
    } else if (this.phase === "countdown") {
      this.bewegeSchlaeger(dt);
      this.timer -= dt;
      if (this.timer <= 0) {
        this.phase = "spiel";
        this.aufschlag(Math.random() < 0.5 ? -1 : 1);
      }
    } else if (this.phase === "spiel") {
      // kleine Teilschritte, damit der schnelle Ball nicht durch den Schläger rutscht
      var schritte = Math.ceil(dt / (1 / 240));
      for (var i = 0; i < schritte && this.phase === "spiel"; i++) this.schritt(dt / schritte);
    } else if (this.phase === "sieg") {
      this.timer -= dt;
      if (this.timer <= 0) {
        var s = this.sieger;
        this.zuruecksetzen();
        this.melde(NAME[s] + " hat gewonnen. Schläger sind wieder frei!");
      }
    }
  };

  Spiel.prototype.bewegeSchlaeger = function (dt) {
    var self = this;
    ["links", "rechts"].forEach(function (seite) {
      var e = self.eingabe[self.besitzer[seite]];
      if (!e) return;
      var v = (e.runter ? 1 : 0) - (e.hoch ? 1 : 0);
      var halb = SCHLAEGER_H / 2;
      self.y[seite] = Math.max(halb, Math.min(H - halb, self.y[seite] + v * SCHLAEGER_TEMPO * dt));
    });
  };

  Spiel.prototype.schritt = function (dt) {
    this.bewegeSchlaeger(dt);
    if (this.pause > 0) { this.pause -= dt; return; }

    var b = this.ball;
    b.x += b.vx * dt;
    b.y += b.vy * dt;

    // Wände oben/unten
    if (b.y < BALL_R) { b.y = BALL_R; b.vy = Math.abs(b.vy); }
    if (b.y > H - BALL_R) { b.y = H - BALL_R; b.vy = -Math.abs(b.vy); }

    // Schläger
    var linkerX = RAND + SCHLAEGER_B;     // Vorderkante links
    var rechterX = W - RAND - SCHLAEGER_B; // Vorderkante rechts
    if (b.vx < 0 && b.x - BALL_R <= linkerX && b.x - BALL_R >= RAND - 6 &&
        Math.abs(b.y - this.y.links) <= SCHLAEGER_H / 2 + BALL_R) {
      this.abprallen("links", 1);
      b.x = linkerX + BALL_R;
    } else if (b.vx > 0 && b.x + BALL_R >= rechterX && b.x + BALL_R <= W - RAND + 6 &&
        Math.abs(b.y - this.y.rechts) <= SCHLAEGER_H / 2 + BALL_R) {
      this.abprallen("rechts", -1);
      b.x = rechterX - BALL_R;
    }

    // Punkt
    if (b.x < -BALL_R * 2) this.punkt("rechts");
    else if (b.x > W + BALL_R * 2) this.punkt("links");
  };

  Spiel.prototype.abprallen = function (seite, richtung) {
    var b = this.ball;
    var tempo = Math.min(BALL_MAX, Math.hypot(b.vx, b.vy) * BALL_FAKTOR);
    // Wo der Ball trifft, bestimmt den Winkel (Rand = steiler)
    var versatz = (b.y - this.y[seite]) / (SCHLAEGER_H / 2 + BALL_R);
    versatz = Math.max(-1, Math.min(1, versatz));
    var winkel = versatz * (Math.PI / 3.2); // max. ca. 56°
    b.vx = Math.cos(winkel) * tempo * richtung;
    b.vy = Math.sin(winkel) * tempo;
  };

  Spiel.prototype.punkt = function (seite) {
    this.punkte[seite]++;
    if (this.punkte[seite] >= SIEG_PUNKTE) {
      this.phase = "sieg";
      this.sieger = seite;
      this.timer = SIEG_ANZEIGE;
      this.ball = { x: W / 2, y: H / 2, vx: 0, vy: 0 };
      this.eingabe = {};
    } else {
      // Aufschlag geht zu dem, der den Punkt kassiert hat
      this.aufschlag(seite === "links" ? 1 : -1);
    }
  };

  Spiel.prototype.zustand = function (zuschauer) {
    return {
      p: this.phase,
      b: this.besitzer,
      y: [Math.round(this.y.links), Math.round(this.y.rechts)],
      ball: [Math.round(this.ball.x), Math.round(this.ball.y)],
      pause: this.pause > 0,
      pk: [this.punkte.links, this.punkte.rechts],
      t: Math.ceil(this.timer),
      w: this.sieger,
      m: this.meldung,
      z: zuschauer
    };
  };

  // Für Tests in Node
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { Spiel: Spiel, W: W, H: H, SIEG_PUNKTE: SIEG_PUNKTE };
    return;
  }

  var canvas = document.getElementById("pong");
  if (!canvas) return;

  // ============================================================
  //  NETZWERK
  // ============================================================
  var ich = null;          // meine Peer ID
  var peer = null;
  var gastgeber = null;    // { spiel, verbindungen } wenn ich Gastgeber bin
  var hostVerbindung = null;
  var zustand = null;
  var online = false;
  var versuche = 0;

  function senden(m) {
    if (gastgeber) gastgeber.spiel.nachricht(ich, m);
    else if (hostVerbindung && hostVerbindung.open) hostVerbindung.send(m);
  }

  function aufraeumen() {
    online = false;
    hostVerbindung = null;
    if (gastgeber) { clearInterval(gastgeber.notTakt); if (gastgeber.worker) gastgeber.worker.terminate(); }
    gastgeber = null;
    if (peer) { try { peer.destroy(); } catch (e) {} }
    peer = null;
  }

  function neuVerbinden(verzoegerung) {
    aufraeumen();
    zustand = null;
    setTimeout(verbinden, verzoegerung == null ? 300 + Math.random() * 1500 : verzoegerung);
  }

  function verbinden() {
    if (typeof Peer === "undefined") { statusText("Spielserver konnte nicht geladen werden."); return; }
    versuche++;
    statusText(versuche > 3 ? "Verbinde … (Versuch " + versuche + ")" : "Verbinde …");
    // Versuch 1: selbst Gastgeber werden
    var p = new Peer(RAUM_ID, { debug: 0 });
    peer = p;
    p.on("open", function (id) {
      if (peer !== p) return;
      ich = id;
      werdeGastgeber(p);
    });
    p.on("error", function (err) {
      if (peer !== p) return;
      if (err && err.type === "unavailable-id") {
        // Es gibt schon einen Gastgeber, also als Gast verbinden
        try { p.destroy(); } catch (e) {}
        peer = null;
        alsGast();
      } else {
        neuVerbinden(2000 + Math.random() * 2000);
      }
    });
  }

  function werdeGastgeber(p) {
    var g = { spiel: new Spiel(), verbindungen: {} };
    gastgeber = g;
    online = true;
    versuche = 0;

    p.on("connection", function (conn) {
      conn.on("open", function () { g.verbindungen[conn.peer] = conn; });
      conn.on("data", function (m) { g.spiel.nachricht(conn.peer, m); });
      var weg = function () {
        if (g.verbindungen[conn.peer] !== conn) return;
        delete g.verbindungen[conn.peer];
        g.spiel.trennen(conn.peer);
      };
      conn.on("close", weg);
      conn.on("error", weg);
    });
    p.on("disconnected", function () { if (peer === p && !p.destroyed) p.reconnect(); });

    // Takt: über einen Worker, damit das Spiel auch in einem
    // Hintergrund Tab des Gastgebers flüssig weiterläuft.
    var zuletzt = performance.now();
    var takt = function () {
      if (gastgeber !== g) return;
      var jetzt = performance.now();
      var dt = Math.min(0.05, (jetzt - zuletzt) / 1000);
      zuletzt = jetzt;
      g.spiel.tick(dt);
      var ids = Object.keys(g.verbindungen);
      var z = g.spiel.zustand(ids.length + 1);
      ids.forEach(function (id) {
        var c = g.verbindungen[id];
        if (c.open) { try { c.send(z); } catch (e) {} }
      });
      zustand = z;
    };
    try {
      var code = "setInterval(function(){postMessage(0)}," + (1000 / 60) + ")";
      g.worker = new Worker(URL.createObjectURL(new Blob([code], { type: "text/javascript" })));
      g.worker.onmessage = takt;
    } catch (e) {
      g.notTakt = setInterval(takt, 1000 / 60);
    }
  }

  function alsGast() {
    var p = new Peer({ debug: 0 });
    peer = p;
    var geoeffnet = false;
    var frist = setTimeout(function () { if (peer === p && !geoeffnet) neuVerbinden(); }, 10000);
    p.on("open", function (id) {
      if (peer !== p) return;
      ich = id;
      var conn = p.connect(RAUM_ID, { reliable: true, serialization: "json" });
      conn.on("open", function () {
        if (peer !== p) return;
        geoeffnet = true;
        clearTimeout(frist);
        hostVerbindung = conn;
        online = true;
        versuche = 0;
      });
      conn.on("data", function (z) { if (peer === p) zustand = z; });
      conn.on("close", function () { if (peer === p) neuVerbinden(); });
      conn.on("error", function () { if (peer === p) neuVerbinden(); });
    });
    p.on("error", function () { if (peer === p) { clearTimeout(frist); neuVerbinden(); } });
    p.on("disconnected", function () { if (peer === p && !p.destroyed) p.reconnect(); });
  }

  window.addEventListener("pagehide", aufraeumen);

  // ============================================================
  //  EINGABE
  // ============================================================
  function meineSeite() {
    if (!zustand || !ich) return null;
    if (zustand.b.links === ich) return "links";
    if (zustand.b.rechts === ich) return "rechts";
    return null;
  }

  function punktImCanvas(ev) {
    var r = canvas.getBoundingClientRect();
    return { x: (ev.clientX - r.left) * W / r.width, y: (ev.clientY - r.top) * H / r.height };
  }

  function seiteUnter(pt) {
    // großzügige Klickzone rund um den Schläger
    if (pt.x < RAND + SCHLAEGER_B + 70) return "links";
    if (pt.x > W - RAND - SCHLAEGER_B - 70) return "rechts";
    return null;
  }

  var hover = null;
  canvas.addEventListener("mousemove", function (ev) {
    hover = seiteUnter(punktImCanvas(ev));
    var klickbar = hover && zustand && zustand.p !== "sieg" &&
      (zustand.b[hover] === null || zustand.b[hover] === ich);
    canvas.style.cursor = klickbar ? "pointer" : "default";
  });
  canvas.addEventListener("mouseleave", function () { hover = null; });
  canvas.addEventListener("click", function (ev) {
    var seite = seiteUnter(punktImCanvas(ev));
    if (seite && online) senden({ typ: "waehle", seite: seite });
  });

  var tasten = { hoch: false, runter: false };
  function tasteGeaendert(ev, gedrueckt) {
    var k = ev.key === "ArrowUp" ? "hoch" : ev.key === "ArrowDown" ? "runter" : null;
    if (!k || !meineSeite()) return;
    ev.preventDefault(); // Seite soll nicht scrollen
    if (tasten[k] === gedrueckt) return;
    tasten[k] = gedrueckt;
    senden({ typ: "taste", hoch: tasten.hoch, runter: tasten.runter });
  }
  window.addEventListener("keydown", function (ev) { tasteGeaendert(ev, true); });
  window.addEventListener("keyup", function (ev) { tasteGeaendert(ev, false); });
  window.addEventListener("blur", function () {
    if (tasten.hoch || tasten.runter) {
      tasten = { hoch: false, runter: false };
      senden({ typ: "taste", hoch: false, runter: false });
    }
  });

  // ============================================================
  //  ZEICHNEN
  // ============================================================
  var ctx = canvas.getContext("2d");
  var statusEl = document.getElementById("pong-status");
  var infoEl = document.getElementById("pong-info");
  var letzterStatus = "";

  function statusText(t) {
    if (t !== letzterStatus) { letzterStatus = t; if (statusEl) statusEl.textContent = t; }
  }

  function setzeInfo(html) {
    if (infoEl && infoEl.dataset.html !== html) { infoEl.dataset.html = html; infoEl.innerHTML = html; }
  }

  function text(t, x, y, groesse, farbe) {
    ctx.font = groesse + "px Bangers, Impact, sans-serif";
    ctx.fillStyle = farbe;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(t, x, y);
  }

  function zeichneSchlaeger(seite, y, z) {
    var x = seite === "links" ? RAND : W - RAND - SCHLAEGER_B;
    var besitzer = z ? z.b[seite] : null;
    ctx.fillStyle = besitzer ? FARBE[seite] : "#fff";
    if (besitzer) { ctx.shadowColor = FARBE[seite]; ctx.shadowBlur = 18; }
    ctx.fillRect(x, y - SCHLAEGER_H / 2, SCHLAEGER_B, SCHLAEGER_H);
    ctx.shadowBlur = 0;
    // Hover Rahmen, wenn der Schläger frei ist oder mir gehört
    if (hover === seite && z && z.p !== "sieg" && (besitzer === null || besitzer === ich)) {
      ctx.strokeStyle = "rgba(255,255,255,.5)";
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x - 6, y - SCHLAEGER_H / 2 - 6, SCHLAEGER_B + 12, SCHLAEGER_H + 12);
      ctx.setLineDash([]);
    }
    if (besitzer === ich) text("DU", x + SCHLAEGER_B / 2, y - SCHLAEGER_H / 2 - 16, 18, FARBE[seite]);
  }

  function zeichnen() {
    var z = zustand;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    // Mittellinie
    ctx.fillStyle = "#333";
    for (var yy = 10; yy < H; yy += 28) ctx.fillRect(W / 2 - 2, yy, 4, 16);

    var yL = z ? z.y[0] : H / 2, yR = z ? z.y[1] : H / 2;
    zeichneSchlaeger("links", yL, z);
    zeichneSchlaeger("rechts", yR, z);

    if (!z) {
      text(online ? "…" : "VERBINDE …", W / 2, H / 2, 44, "#666");
      statusText(online ? "Verbunden" : (letzterStatus || "Verbinde …"));
      requestAnimationFrame(zeichnen);
      return;
    }

    // Punkte
    if (z.p !== "warten") {
      text(String(z.pk[0]), W / 2 - 70, 50, 64, FARBE.links);
      text(String(z.pk[1]), W / 2 + 70, 50, 64, FARBE.rechts);
    }

    // Ball
    if (z.p === "spiel" && !(z.pause && Math.floor(performance.now() / 120) % 2)) {
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(z.ball[0], z.ball[1], BALL_R, 0, Math.PI * 2);
      ctx.fill();
    }

    // Statuszeilen
    var mein = meineSeite();
    var bereit = [];
    if (z.b.links) bereit.push('<span style="color:' + FARBE.links + '">PLAYER RED READY</span>');
    if (z.b.rechts) bereit.push('<span style="color:' + FARBE.rechts + '">PLAYER BLUE READY</span>');

    if (z.p === "warten") {
      if (z.b.links && !z.b.rechts) text("PLAYER RED READY", W / 2, H / 2 - 20, 46, FARBE.links);
      else if (z.b.rechts && !z.b.links) text("PLAYER BLUE READY", W / 2, H / 2 - 20, 46, FARBE.rechts);
      else text("KLICK AUF EINEN SCHLÄGER", W / 2, H / 2 - 20, 40, "#fff");
      text(mein ? "Warte auf Gegner …" : "Freien Schläger anklicken zum Mitspielen", W / 2, H / 2 + 30, 22, "#aaa");
    } else if (z.p === "countdown") {
      text("BOTH PLAYERS READY", W / 2, H / 2 - 50, 46, "#ff0");
      text(String(Math.max(1, z.t)), W / 2, H / 2 + 30, 110, "#fff");
    } else if (z.p === "sieg") {
      text(NAME[z.w] + " WINS!", W / 2, H / 2 - 20, 70, FARBE[z.w]);
      text(z.pk[0] + " : " + z.pk[1], W / 2, H / 2 + 45, 40, "#fff");
    }
    if (z.m) text(z.m, W / 2, H - 30, 22, "#ff0");

    // HTML Info unter dem Spielfeld
    var info;
    if (z.p === "countdown" || z.p === "spiel") info = '<span style="color:#ff0">BOTH PLAYERS READY</span>';
    else if (z.p === "sieg") info = '<span style="color:' + FARBE[z.w] + '">' + NAME[z.w] + " WINS! Gleich sind die Schläger wieder frei …</span>";
    else info = bereit.join(" · ") || "Niemand bereit";
    if (mein) info += ' · Du bist <b style="color:' + FARBE[mein] + '">' + NAME[mein] + "</b>, lenken mit ⬆️ ⬇️";
    setzeInfo(info);
    statusText("🟢 online · " + z.z + (z.z === 1 ? " Person" : " Personen") + " auf der Seite");

    requestAnimationFrame(zeichnen);
  }

  requestAnimationFrame(zeichnen);
  verbinden();
})();
