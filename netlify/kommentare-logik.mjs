// Reine Logik der Kommentare (ohne Netlify), mit Node testbar.

export const MAX_NAME = 30;
export const MAX_TEXT = 500;
export const MAX_KOMMENTARE = 2000;
export const MIN_ABSTAND_MS = 3000; // gegen Doppelklicks und einfaches Zuspammen

export function normName(roh) {
  if (typeof roh !== "string") return "";
  return roh.replace(/[\u0000-\u001f\u007f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, MAX_NAME);
}

// Zeilenumbrüche bleiben erhalten, höchstens zwei Leerzeilen am Stück.
export function normText(roh) {
  if (typeof roh !== "string") return "";
  return roh.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, "")
    .replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, MAX_TEXT);
}

// Prüft einen neuen Kommentar. Gibt { status, fehler } oder { kommentar } zurück.
export function neuerKommentar(body, anzahl, letzteZeit, jetzt) {
  const name = normName(body && body.name);
  if (name.length < 2) return { status: 400, fehler: "Bitte einen Namen mit mindestens 2 Zeichen eingeben." };
  const text = normText(body && body.text);
  if (!text) return { status: 400, fehler: "Bitte einen Kommentar schreiben." };
  if (anzahl >= MAX_KOMMENTARE) return { status: 409, fehler: "Das Kommentarbuch ist voll." };
  if (letzteZeit && jetzt - letzteZeit < MIN_ABSTAND_MS) return { status: 429, fehler: "Moment, nicht so schnell. Bitte gleich nochmal." };
  return { kommentar: { name, text, zeit: jetzt } };
}

// Chronologisch, ältester zuerst. Die Uhrzeit wird nicht angezeigt und nicht ausgeliefert.
export function ansicht(kommentare) {
  return {
    anzahl: kommentare.length,
    kommentare: kommentare.slice().sort((a, b) => a.zeit - b.zeit).map((k) => ({ name: k.name, text: k.text }))
  };
}
