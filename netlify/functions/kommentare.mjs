// Netlify Function für die Kommentare. Erreichbar unter /api/kommentare
//   GET  -> { anzahl, kommentare: [{ name, text }] } chronologisch, ältester zuerst
//   POST -> { name, text } neuen Kommentar speichern
// Gespeichert in Netlify Blobs (Store "kommentare"), ein Eintrag pro Kommentar.
import { getStore } from "@netlify/blobs";
import { neuerKommentar, ansicht } from "../kommentare-logik.mjs";

const json = (daten, status = 200) =>
  new Response(JSON.stringify(daten), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });

async function alleKommentare(store) {
  const { blobs } = await store.list({ prefix: "kommentar-" });
  const liste = await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })));
  return liste.filter(Boolean);
}

export default async (req) => {
  const store = getStore({ name: "kommentare", consistency: "strong" });
  try {
    if (req.method === "GET") return json(ansicht(await alleKommentare(store)));
    if (req.method === "POST") {
      let body;
      try { body = await req.json(); } catch { return json({ fehler: "Ungültige Anfrage." }, 400); }
      const kommentare = await alleKommentare(store);
      // Verstecktes Feld, das nur Bots ausfüllen: so tun, als ob es geklappt hätte
      if (body && body.webseite) return json(ansicht(kommentare), 201);
      const jetzt = Date.now();
      const letzte = kommentare.reduce((m, k) => Math.max(m, k.zeit || 0), 0);
      const ergebnis = neuerKommentar(body, kommentare.length, letzte, jetzt);
      if (ergebnis.fehler) return json({ fehler: ergebnis.fehler }, ergebnis.status);
      await store.setJSON("kommentar-" + jetzt + "-" + Math.random().toString(36).slice(2, 8), ergebnis.kommentar);
      return json(ansicht([...kommentare, ergebnis.kommentar]), 201);
    }
    return json({ fehler: "Methode nicht erlaubt." }, 405);
  } catch (e) {
    console.error(e);
    return json({ fehler: "Interner Fehler. Bitte später nochmal versuchen." }, 500);
  }
};

export const config = { path: "/api/kommentare" };
