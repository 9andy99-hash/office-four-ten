// Sprachumschalter DEUTSCH / ENGLISH oben in der Navigation, auf allen Seiten.
// Übersetzt wird mit dem Google Translate Website Widget. Die Wahl steht im Cookie
// "googtrans" (das liest Google selbst aus), dadurch bleibt sie auf allen Seiten erhalten.
// Bereiche, die nicht übersetzt werden sollen: class="notranslate" bzw. translate="no".
(function () {
  var englisch = /(^|;\s*)googtrans=\/de\/en/.test(document.cookie);

  function setzeCookie(wert, maxAlter) {
    var basis = "googtrans=" + wert + "; path=/; max-age=" + maxAlter;
    document.cookie = basis;
    // Google setzt das Cookie teils auch für die Hauptdomain, daher beide Varianten pflegen
    var teile = location.hostname.split(".");
    if (teile.length >= 2) document.cookie = basis + "; domain=." + teile.slice(-2).join(".");
  }

  var knopf = document.createElement("button");
  knopf.type = "button";
  knopf.className = "sprache-knopf notranslate";
  knopf.setAttribute("translate", "no");
  knopf.textContent = englisch ? "🇩🇪 DEUTSCH" : "🇬🇧 ENGLISH";
  knopf.title = englisch ? "Zurück auf Deutsch" : "Translate this page to English (Google Translate)";
  knopf.addEventListener("click", function () {
    if (englisch) setzeCookie("", 0);
    else setzeCookie("/de/en", 31536000);
    location.reload();
  });

  var leiste = document.querySelector(".topbar");
  if (leiste) leiste.appendChild(knopf);
  else { knopf.classList.add("frei"); document.body.appendChild(knopf); }

  if (!englisch) return;
  var ziel = document.createElement("div");
  ziel.id = "google_translate_element";
  ziel.hidden = true;
  document.body.appendChild(ziel);
  window.googleTranslateElementInit = function () {
    new google.translate.TranslateElement({ pageLanguage: "de", includedLanguages: "en,de", autoDisplay: false }, "google_translate_element");
  };
  var s = document.createElement("script");
  s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  document.body.appendChild(s);
})();
