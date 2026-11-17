// Netlify Function für das Ratespiel. Erreichbar unter /api/ratespiel
//   GET  -> vor Fr 20 Uhr nur Teilnehmernamen, danach alle Tipps und Gewinner
//   POST -> { name, tipp } neuen Tipp abgeben
// Die Tipps liegen in Netlify Blobs (Store "ratespiel"), nicht im Repo.
// Die richtige Lösung steht NICHT im (öffentlichen) Repo, sondern in der
// Netlify Umgebungsvariable RATESPIEL_LOESUNG (z. B. 136).
import { getStore } from "@netlify/blobs";
import { ansicht, neuerTipp } from "../ratespiel-logik.mjs";

const json = (daten, status = 200) =>
  new Response(JSON.stringify(daten), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });

async function alleEintraege(store) {
  const { blobs } = await store.list({ prefix: "tipp-" });
  const liste = await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })));
  return liste.filter(Boolean);
}

export default async (req) => {
  const store = getStore({ name: "ratespiel", consistency: "strong" });
  const jetzt = Date.now();
  const loesungRoh = (typeof Netlify !== "undefined" ? Netlify.env.get("RATESPIEL_LOESUNG") : process.env.RATESPIEL_LOESUNG) || "";
  const loesung = loesungRoh.trim() === "" ? null : Number(loesungRoh.replace(",", "."));

  try {
    if (req.method === "GET") {
      return json(ansicht(await alleEintraege(store), jetzt, loesung));
    }
    if (req.method === "POST") {
      let body;
      try { body = await req.json(); } catch { return json({ fehler: "Ungültige Anfrage." }, 400); }
      const eintraege = await alleEintraege(store);
      const ergebnis = neuerTipp(body, eintraege, jetzt);
      if (ergebnis.fehler) return json({ fehler: ergebnis.fehler }, ergebnis.status);
      const key = "tipp-" + jetzt + "-" + Math.random().toString(36).slice(2, 8);
      await store.setJSON(key, ergebnis.eintrag);
      return json(ansicht([...eintraege, ergebnis.eintrag], jetzt, loesung), 201);
    }
    return json({ fehler: "Methode nicht erlaubt." }, 405);
  } catch (e) {
    console.error(e);
    return json({ fehler: "Interner Fehler. Bitte später nochmal versuchen." }, 500);
  }
};

export const config = { path: "/api/ratespiel" };
