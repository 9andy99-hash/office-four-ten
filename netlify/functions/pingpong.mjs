// Netlify Function für die Pingpong Rangliste. Erreichbar unter /api/pingpong
//   GET  -> { rangliste: [{ name, siege, niederlagen }], spiele }
//   POST -> { sieger, verlierer, stand: [5, x] } Ergebnis melden (macht der Gastgeber Browser)
// Gespeichert in Netlify Blobs (Store "pingpong"), ein Eintrag pro Spiel.
import { getStore } from "@netlify/blobs";
import { neuesSpiel, rangliste } from "../pingpong-logik.mjs";

const json = (daten, status = 200) =>
  new Response(JSON.stringify(daten), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });

async function alleSpiele(store) {
  const { blobs } = await store.list({ prefix: "spiel-" });
  const liste = await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })));
  return liste.filter(Boolean);
}

const antwort = (spiele) => ({ rangliste: rangliste(spiele), spiele: spiele.length });

export default async (req) => {
  const store = getStore({ name: "pingpong", consistency: "strong" });
  try {
    if (req.method === "GET") return json(antwort(await alleSpiele(store)));
    if (req.method === "POST") {
      let body;
      try { body = await req.json(); } catch { return json({ fehler: "Ungültige Anfrage." }, 400); }
      const spiele = await alleSpiele(store);
      const jetzt = Date.now();
      const letzte = spiele.reduce((m, s) => Math.max(m, s.zeit || 0), 0);
      const ergebnis = neuesSpiel(body, letzte, jetzt);
      if (ergebnis.fehler) return json({ fehler: ergebnis.fehler }, ergebnis.status);
      await store.setJSON("spiel-" + jetzt + "-" + Math.random().toString(36).slice(2, 8), ergebnis.spiel);
      return json(antwort([...spiele, ergebnis.spiel]), 201);
    }
    return json({ fehler: "Methode nicht erlaubt." }, 405);
  } catch (e) {
    console.error(e);
    return json({ fehler: "Interner Fehler." }, 500);
  }
};

export const config = { path: "/api/pingpong" };
