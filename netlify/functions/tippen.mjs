// Netlify Function für die Tippspiel Bestenliste. Erreichbar unter /api/tippen
//   GET  -> { bestenliste: [{ name, wpm, genauigkeit, versuche }], runs }
//   POST -> { name, richtig, falsch, anschlaege } Durchgang eintragen
// Gespeichert in Netlify Blobs (Store "tippen"), ein Eintrag pro Durchgang.
import { getStore } from "@netlify/blobs";
import { neuerRun, bestenliste } from "../tippen-logik.mjs";

const json = (daten, status = 200) =>
  new Response(JSON.stringify(daten), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });

async function alleRuns(store) {
  const { blobs } = await store.list({ prefix: "run-" });
  const liste = await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })));
  return liste.filter(Boolean);
}

const antwort = (runs, extra) => ({ bestenliste: bestenliste(runs), runs: runs.length, ...extra });

export default async (req) => {
  const store = getStore({ name: "tippen", consistency: "strong" });
  try {
    if (req.method === "GET") return json(antwort(await alleRuns(store)));
    if (req.method === "POST") {
      let body;
      try { body = await req.json(); } catch { return json({ fehler: "Ungültige Anfrage." }, 400); }
      const runs = await alleRuns(store);
      const jetzt = Date.now();
      const letzte = runs.reduce((m, r) => Math.max(m, r.zeit || 0), 0);
      const ergebnis = neuerRun(body, runs.length, letzte, jetzt);
      if (ergebnis.fehler) return json({ fehler: ergebnis.fehler }, ergebnis.status);
      await store.setJSON("run-" + jetzt + "-" + Math.random().toString(36).slice(2, 8), ergebnis.run);
      return json(antwort([...runs, ergebnis.run], { eingetragen: { name: ergebnis.run.name, wpm: ergebnis.run.wpm } }), 201);
    }
    return json({ fehler: "Methode nicht erlaubt." }, 405);
  } catch (e) {
    console.error(e);
    return json({ fehler: "Interner Fehler. Bitte später nochmal versuchen." }, 500);
  }
};

export const config = { path: "/api/tippen" };
