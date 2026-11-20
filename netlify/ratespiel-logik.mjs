// Reine Spiellogik des Ratespiels (ohne Netlify), damit sie mit Node testbar ist.

// Fr, 20.11.2026, 19:00 Uhr deutscher Zeit
export const AUFLOESUNG = Date.parse("2026-11-20T19:00:00+01:00");
// Der echte Betrag der Pflanzenexpedition (wird ab der Auflösung angezeigt)
export const LOESUNG = 136.56;
export const MAX_TEILNEHMER = 300;

export function normName(roh) {
  if (typeof roh !== "string") return "";
  return roh.replace(/[\u0000-\u001f\u007f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 30);
}

// Erlaubt "99", "99,50", "99.5", "99 €"
export function parseTipp(roh) {
  if (typeof roh === "number") roh = String(roh);
  if (typeof roh !== "string") return null;
  const s = roh.replace(/€|eur|euro/gi, "").replace(/\s/g, "").replace(",", ".");
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(s)) return null;
  const n = Math.round(Number(s) * 100) / 100;
  return n >= 0 && n <= 100000 ? n : null;
}

// Prüft einen neuen Tipp gegen die bisherigen Einträge. Gibt { fehler } oder { eintrag } zurück.
export function neuerTipp(body, eintraege, jetzt) {
  if (jetzt >= AUFLOESUNG) return { status: 403, fehler: "Zu spät! Die Auflösung ist schon gelaufen." };
  const name = normName(body && body.name);
  if (name.length < 2) return { status: 400, fehler: "Bitte einen Namen mit mindestens 2 Zeichen eingeben." };
  const tipp = parseTipp(body && body.tipp);
  if (tipp === null) return { status: 400, fehler: "Bitte eine gültige Zahl in Euro eingeben (z. B. 99,50)." };
  if (eintraege.length >= MAX_TEILNEHMER) return { status: 409, fehler: "Das Ratespiel ist voll." };
  const klein = name.toLocaleLowerCase("de");
  if (eintraege.some((e) => e.name.toLocaleLowerCase("de") === klein)) {
    return { status: 409, fehler: "Diesen Namen gibt es schon. Bitte einen anderen nehmen (z. B. mit Nachnamen)." };
  }
  return { eintrag: { name, tipp, zeit: jetzt } };
}

// Was die Seite zu sehen bekommt. Vor der Auflösung nur Namen, danach alles.
export function ansicht(eintraege, jetzt, loesung) {
  const sortiert = eintraege.slice().sort((a, b) => a.zeit - b.zeit);
  const basis = { aufloesung: new Date(AUFLOESUNG).toISOString(), serverZeit: jetzt, anzahl: sortiert.length };
  if (jetzt < AUFLOESUNG) {
    return { ...basis, aufgeloest: false, teilnehmer: sortiert.map((e) => e.name) };
  }
  if (typeof loesung !== "number" || !isFinite(loesung)) {
    // Lösung ist (noch) nicht hinterlegt: Tipps zeigen, aber keinen Gewinner küren
    return { ...basis, aufgeloest: true, loesung: null, gewinner: null,
      eintraege: sortiert.map((e) => ({ name: e.name, tipp: e.tipp, abstand: null })) };
  }
  // Bei Gleichstand gewinnt, wer zuerst getippt hat
  const mitAbstand = sortiert
    .map((e) => ({ name: e.name, tipp: e.tipp, abstand: Math.round(Math.abs(e.tipp - loesung) * 100) / 100, zeit: e.zeit }))
    .sort((a, b) => a.abstand - b.abstand || a.zeit - b.zeit)
    .map(({ zeit, ...rest }) => rest);
  return { ...basis, aufgeloest: true, loesung, gewinner: mitAbstand.length ? mitAbstand[0].name : null, eintraege: mitAbstand };
}
