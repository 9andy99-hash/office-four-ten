// Gemeinsame Helfer für alle Seiten
(function () {
  var PARTY = new Date(2026, 10, 20, 18, 0, 0); // 20.11.2026, 18:00 (Monat ist 0-basiert!)

  // ---------- Countdown ----------
  var cd = document.getElementById("countdown");
  if (cd) {
    var tick = function () {
      var diff = PARTY - new Date();
      if (diff <= 0) {
        cd.innerHTML = '<div style="min-width:auto"><b>ES LÄUFT!!!</b>Schnell rein in 410</div>';
        return;
      }
      var t = Math.floor(diff / 86400000),
          h = Math.floor(diff / 3600000) % 24,
          m = Math.floor(diff / 60000) % 60,
          s = Math.floor(diff / 1000) % 60;
      cd.innerHTML =
        "<div><b>" + t + "</b>Tage</div><div><b>" + h + "</b>Std.</div>" +
        "<div><b>" + m + "</b>Min.</div><div><b>" + s + "</b>Sek.</div>";
    };
    tick(); setInterval(tick, 1000);
  }

  // ---------- Uhr (News-Studio) ----------
  var uhr = document.getElementById("uhr");
  if (uhr) {
    var u = function () {
      var d = new Date();
      uhr.textContent = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0") + ":" + String(d.getSeconds()).padStart(2, "0");
    };
    u(); setInterval(u, 1000);
  }

  // ---------- News rendern ----------
  var newsBox = document.getElementById("news-liste");
  if (newsBox && window.NEWS) {
    window.NEWS.forEach(function (n) {
      var art = document.createElement("article");
      art.className = "meldung";
      var img = document.createElement("img");
      img.src = n.bild; img.alt = n.titel;
      var inhalt = document.createElement("div");
      inhalt.className = "inhalt";
      var binde = document.createElement("div");
      binde.className = "bauchbinde";
      binde.innerHTML = '<span class="rubrik"></span><span class="datum"></span>';
      binde.querySelector(".rubrik").textContent = n.rubrik;
      binde.querySelector(".datum").textContent = n.datum;
      var h2 = document.createElement("h2"); h2.textContent = n.titel;
      var unter = document.createElement("p"); unter.className = "unter"; unter.textContent = n.untertitel;
      inhalt.append(binde, h2, unter);
      (n.text || []).forEach(function (absatz) {
        var p = document.createElement("p"); p.textContent = absatz; inhalt.appendChild(p);
      });
      art.append(img, inhalt);
      newsBox.appendChild(art);
    });
  }

  // ---------- Ranglisten ----------
  var gamesBox = document.getElementById("ranglisten");
  if (gamesBox && window.GAMES) {
    window.GAMES.forEach(function (g) {
      var sec = document.createElement("section");
      sec.className = "rangliste";
      var h2 = document.createElement("h2"); h2.textContent = "▶ " + g.disziplin;
      var table = document.createElement("table");
      g.ergebnisse.slice().sort(function (a, b) { return b.wert - a.wert; }).forEach(function (e, i) {
        var tr = table.insertRow();
        tr.insertCell().textContent = ["🥇", "🥈", "🥉"][i] || (i + 1) + ".";
        tr.insertCell().textContent = e.name;
        tr.insertCell().textContent = e.wert + " " + g.einheit;
      });
      sec.append(h2, table);
      gamesBox.appendChild(sec);
    });
  }

  // ---------- Ballons (Party-Seite) ----------
  var party = document.body.classList.contains("party");
  if (party && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var farben = ["#ff2d55", "#ffcc00", "#34c759", "#0a84ff", "#bf5af2", "#ff9500", "#00e5ff"];
    var ballon = function () {
      var f = farben[Math.floor(Math.random() * farben.length)];
      var b = document.createElement("div");
      b.className = "ballon";
      var gross = 50 + Math.random() * 40;
      b.style.left = Math.random() * 95 + "vw";
      b.style.animationDuration = 8 + Math.random() * 7 + "s";
      b.innerHTML =
        '<svg width="' + gross + '" height="' + gross * 2 + '" viewBox="0 0 50 100">' +
        '<ellipse cx="25" cy="28" rx="22" ry="27" fill="' + f + '"/>' +
        '<ellipse cx="17" cy="18" rx="5" ry="8" fill="#fff" opacity=".35"/>' +
        '<path d="M22 55 L28 55 L25 60 Z" fill="' + f + '"/>' +
        '<path d="M25 60 Q20 70 27 80 T24 100" stroke="#ddd" fill="none" stroke-width="1"/></svg>';
      document.body.appendChild(b);
      b.addEventListener("animationend", function () { b.remove(); });
    };
    for (var i = 0; i < 6; i++) setTimeout(ballon, i * 500);
    setInterval(ballon, 1400);
  }

  // ---------- Zufällige Sticker (Startseite) ----------
  var stickerZone = document.getElementById("sticker-zone");
  if (stickerZone) {
    var texte = ["PARTY!!!", "NICHT DEM BETRIEBSRAT ZEIGEN", "100% PRODUKTIV", "420? NEIN 410", "SYNERGIE", "WOW", "KPI: SPASS", "ISO 9001 ZERTIFIZIERT*"];
    var bg = ["#ff0", "#0ff", "#f0f", "#0f0", "#f80"];
    texte.forEach(function (t, i) {
      var s = document.createElement("div");
      s.className = "sticker";
      s.textContent = t;
      s.style.background = bg[i % bg.length];
      s.style.top = 5 + Math.random() * 85 + "%";
      s.style.left = Math.random() * 70 + "%";
      s.style.transform = "rotate(" + (Math.random() * 40 - 20) + "deg)";
      stickerZone.appendChild(s);
    });
  }
})();
