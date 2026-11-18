// Kommentare: anzeigen (chronologisch, ältester zuerst) und neue absenden.
// Daten kommen von /api/kommentare.
(function () {
  var API = "/api/kommentare";
  var el = function (id) { return document.getElementById(id); };
  var liste = el("kom-liste");
  var form = el("kom-formular");
  var meldung = el("kom-meldung");
  var zeichen = el("kom-zeichen");

  try { form.elements.name.value = localStorage.getItem("office410-name") || ""; } catch (e) {}

  function anzeigen(d, nachUnten) {
    el("kom-anzahl").textContent = "(" + d.anzahl + ")";
    liste.innerHTML = "";
    if (!d.kommentare.length) {
      liste.innerHTML = '<li class="leer">Noch keine Kommentare. Schreib den ersten!</li>';
      return;
    }
    d.kommentare.forEach(function (k) {
      var li = document.createElement("li");
      var n = document.createElement("b"); n.textContent = k.name;
      var t = document.createElement("p"); t.textContent = k.text;
      li.append(n, t);
      liste.appendChild(li);
    });
    if (nachUnten) liste.lastChild.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function laden() {
    return fetch(API, { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { anzeigen(d, false); })
      .catch(function () {
        liste.innerHTML = '<li class="leer">Die Kommentare sind gerade nicht erreichbar. Bitte später nochmal probieren.</li>';
      });
  }

  form.elements.text.addEventListener("input", function () {
    zeichen.textContent = form.elements.text.value.length + " / 500";
  });

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var knopf = form.querySelector("button");
    knopf.disabled = true;
    meldung.className = "rate-meldung";
    meldung.textContent = "Wird gesendet …";
    var name = form.elements.name.value;
    fetch(API, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: name, text: form.elements.text.value, webseite: form.elements.webseite.value })
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (x) {
        if (!x.ok) throw new Error(x.d.fehler || "Das hat leider nicht geklappt.");
        try { localStorage.setItem("office410-name", name.trim()); } catch (e) {}
        meldung.className = "rate-meldung ok";
        meldung.textContent = "Danke, " + name.trim() + "! Dein Kommentar ist online.";
        form.elements.text.value = "";
        zeichen.textContent = "0 / 500";
        anzeigen(x.d, true);
      })
      .catch(function (e) {
        meldung.className = "rate-meldung fehler";
        meldung.textContent = e.message && e.message !== "Failed to fetch" ? e.message : "Die Kommentare sind gerade nicht erreichbar.";
      })
      .then(function () { knopf.disabled = false; });
  });

  laden();
  setInterval(laden, 60000);
})();
