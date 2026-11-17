// Reine Logik der Pingpong Rangliste (ohne Netlify), mit Node testbar.

export const SIEG_PUNKTE = 5;
export const MIN_ABSTAND_MS = 10000; // ein echtes Spiel bis 5 dauert länger

export function normSpielerName(roh) {
  if (typeof roh !== "string") return "";
  return roh.replace(/[\u0000-\u001f\u007f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 16);
}

// Prüft ein gemeldetes Spielergebnis. Gibt { status, fehler } oder { spiel } zurück.
export function neuesSpiel(body, letzteZeit, jetzt) {
  const sieger = normSpielerName(body && body.sieger);
  const verlierer = normSpielerName(body && body.verlierer);
  if (!sieger || !verlierer) return { status: 400, fehler: "Namen fehlen." };
  if (sieger.toLocaleLowerCase("de") === verlierer.toLocaleLowerCase("de")) {
    return { status: 400, fehler: "Gegen sich selbst zählt nicht." };
  }
  const stand = body && body.stand;
  if (!Array.isArray(stand) || stand.length !== 2 || stand[0] !== SIEG_PUNKTE ||
      !Number.isInteger(stand[1]) || stand[1] < 0 || stand[1] >= SIEG_PUNKTE) {
    return { status: 400, fehler: "Ungültiger Spielstand." };
  }
  if (letzteZeit && jetzt - letzteZeit < MIN_ABSTAND_MS) return { status: 429, fehler: "Zu schnell." };
  return { spiel: { sieger, verlierer, stand, zeit: jetzt } };
}

// Aus allen Spielen die Rangliste bauen. Namen ohne Groß/Kleinschreibung zusammenfassen.
export function rangliste(spiele) {
  const tabelle = new Map();
  const eintrag = (name) => {
    const k = name.toLocaleLowerCase("de");
    if (!tabelle.has(k)) tabelle.set(k, { name, siege: 0, niederlagen: 0 });
    return tabelle.get(k);
  };
  spiele.slice().sort((a, b) => a.zeit - b.zeit).forEach((s) => {
    eintrag(s.sieger).siege++;
    eintrag(s.verlierer).niederlagen++;
  });
  return [...tabelle.values()].sort((a, b) =>
    b.siege - a.siege || a.niederlagen - b.niederlagen || a.name.localeCompare(b.name, "de"));
}
