// Reine Logik der Tippspiel Bestenliste (ohne Netlify), mit Node testbar.

export const DAUER_S = 60;
export const MAX_WPM = 250;        // alles darüber ist kein Mensch
export const MIN_ABSTAND_MS = 3000;
export const MAX_RUNS = 5000;

export function normName(roh) {
  if (typeof roh !== "string") return "";
  return roh.replace(/[\u0000-\u001f\u007f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 20);
}

const ganz = (x, max) => Number.isInteger(x) && x >= 0 && x <= max;

// Prüft einen gemeldeten Durchgang. Gibt { status, fehler } oder { run } zurück.
// wpm = richtige Anschläge (inkl. Leerzeichen) / 5, bei 60 Sekunden
export function neuerRun(body, anzahl, letzteZeit, jetzt) {
  const name = normName(body && body.name);
  if (name.length < 2) return { status: 400, fehler: "Bitte einen Namen mit mindestens 2 Zeichen eingeben." };
  const { richtig, falsch, anschlaege } = body || {};
  if (!ganz(richtig, 400) || !ganz(falsch, 400) || !ganz(anschlaege, MAX_WPM * 5)) {
    return { status: 400, fehler: "Ungültiges Ergebnis." };
  }
  if (richtig + falsch === 0) return { status: 400, fehler: "Ohne Tippen keine Bestenliste." };
  const wpm = Math.round(anschlaege / 5);
  if (wpm > MAX_WPM) return { status: 400, fehler: "Das ist leider zu schnell, um wahr zu sein." };
  if (anzahl >= MAX_RUNS) return { status: 409, fehler: "Die Bestenliste ist voll." };
  if (letzteZeit && jetzt - letzteZeit < MIN_ABSTAND_MS) return { status: 429, fehler: "Moment, bitte gleich nochmal." };
  const genauigkeit = Math.round((richtig / (richtig + falsch)) * 100);
  return { run: { name, wpm, richtig, falsch, genauigkeit, zeit: jetzt } };
}

// Bestleistung pro Name (ohne Groß/Kleinschreibung). Bei Gleichstand zählt die Genauigkeit, dann wer zuerst.
export function bestenliste(runs, max = 50) {
  const beste = new Map();
  runs.forEach((r) => {
    const k = r.name.toLocaleLowerCase("de");
    const alt = beste.get(k);
    const besser = !alt || r.wpm > alt.wpm || (r.wpm === alt.wpm && r.genauigkeit > alt.genauigkeit) ||
      (r.wpm === alt.wpm && r.genauigkeit === alt.genauigkeit && r.zeit < alt.zeit);
    const versuche = (alt ? alt.versuche : 0) + 1;
    beste.set(k, besser ? { ...r, versuche } : { ...alt, versuche });
  });
  return [...beste.values()]
    .sort((a, b) => b.wpm - a.wpm || b.genauigkeit - a.genauigkeit || a.zeit - b.zeit)
    .slice(0, max)
    .map(({ name, wpm, genauigkeit, versuche }) => ({ name, wpm, genauigkeit, versuche }));
}
