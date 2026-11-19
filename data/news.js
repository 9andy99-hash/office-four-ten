// ============================================================
//  OFFICE NEWS – hier kommen neue Beiträge rein.
//  Neuer Beitrag = neuen Block oben in die Liste kopieren.
//  Bilder in den Ordner img/ legen und den Dateinamen bei "bild" eintragen.
//
//  "bild" ist das Titelbild (optional). Mit gross: true steht es groß über dem Text.
//  In "text" darf statt eines Absatzes auch stehen:
//    { bild: "img/x.webp", unterschrift: "..." }            -> Bild im Text
//    { bilder: ["img/a.webp", "img/b.webp"], unterschrift }  -> Bilder nebeneinander
//    { text: "...", link: "seite.html", linktext: "..." }    -> Absatz mit Link
// ============================================================
window.NEWS = [
  {
    datum: "Mi, 18.11.2026",
    rubrik: "AUSLANDSKORRESPONDENZ",
    titel: "Live aus Heidelberg: Im Regen der Wehmut",
    untertitel: "Auslandskorrespondent Andy trifft Ex IBT Mitarbeiterin Heli zum Exklusivinterview",
    text: [
      "Der Arbeitstag unseres Auslandskorrespondenten begann mit dem Institutsmeeting. Im Anschluss gönnte er sich eine kleine Stärkung sowie mehrere tiefe Atemzüge frisch O₂ angereicherter Büroluft aus eigener Produktion (siehe Bericht „Operation Grüne Lunge“). Die Pflanzen leisteten damit ihren ersten nachweisbaren Beitrag zur Leistungseffizienz von Raum 410. Mit freiem Kopf trat er die Reise ins ferne Heidelberg an.",
      "Heli, ehemalige IBT Mitarbeiterin und heute in den dortigen Laboren tätig, erwies sich als so großzügig, unserem Newsportal ein Exklusivinterview zu geben. Das Gespräch fand unter streng journalistischen Bedingungen in einem Café statt. Erst nach dem gemeinsamen Verzehr mehrerer Kuchenköstlichkeiten (Anzahl unbekannt, Quittung unauffindbar) war die Interviewpartnerin zu einer Aussage bereit. Ihre Arbeit in den Laboren befinde sich derzeit in einer höchst instabilen, fast schon kippenden Lage.",
      { bild: "img/heidelberg-410.webp", unterschrift: "Abb. 1. Andy und Heli bekennen sich per Handzeichen zu Raum 410. Witterung erneut suboptimal." },
      "Besonders schwer wiegt auf dem Herzen unseres Korrespondenten jedoch das Schicksal der aktuellen Masterandin, deren Qualen er vor Ort aus nächster Nähe dokumentieren musste. Einzelheiten sind dieser Redaktion bekannt, werden aus Rücksicht auf zartbesaitete Leserinnen und Leser jedoch nicht veröffentlicht.",
      "In tief nachdenklicher Stimmung befindet sich unser Mann im Ausland nun auf dem Heimweg ins geliebte Karlsruhe, um sich zu erholen und morgen erneut einen Arbeitstag zu bestreiten. Trost spendet ihm vor allem eines, nämlich der Blick auf den kommenden Freitagabend.",
      { text: "", link: "events.html", linktext: "Zur Office Party am Freitag, 20.11. um 18 Uhr →" }
    ]
  },
  {
    datum: "Mo, 16.11.2026",
    rubrik: "EXPEDITIONSBERICHT",
    titel: "Operation Grüne Lunge: Die IKEA Expedition",
    untertitel: "Wie zwei Mitarbeitende auszogen, um die Sauerstoffversorgung von Raum 410 nachhaltig zu sichern",
    bild: "img/ikea-titel.webp",
    bildAlt: "Andy und JJ mit Strohhüten im Geschäft, beide grinsen in die Kamera",
    gross: true,
    text: [
      "Am 16.11.2026 um 16:23 Uhr erfolgte der offizielle Startschuss zur Beschaffungsmaßnahme „Begrünung Raum 410“. Gegenstand der Mission war die Ausstattung der Büroräumlichkeiten mit photosynthetisch aktiven Organismen (umgangssprachlich: Pflanzen).",
      "Grundlage des Vorhabens bildete die wissenschaftlich fundierte Hypothese von Andy und JJ, wonach eine Anreicherung der Büroluft mit Sauerstoff (O₂) die zerebrale Verarbeitungskapazität der Belegschaft langfristig erhöht und somit eine signifikante Steigerung der Leistungseffizienz hervorruft. Eine Ethikkommission wurde nicht befragt.",
      "JJ erwies sich als außerordentlich gut vorbereitet und führte ein eigens maßgefertigtes Transportgerät der Bauart „Karton, unbeschichtet“ mit sich.",
      { bild: "img/ikea-1-transportgeraet.webp", unterschrift: "Abb. 1: Das maßgefertigte Transportgerät im Feldeinsatz. Witterungsbedingungen: suboptimal." },
      "Im Rahmen eines spontan einberufenen Brainstormings wurde der nordische Möbelgroßkonzern als Pflanzenbeschaffungsort einstimmig (2 zu 0) verworfen und stattdessen der Gartenfachmarkt Dehner als Lieferant auserkoren. Infolgedessen war JJ gezwungen, seine fahrzeugführerischen Kompetenzen unter Extrembedingungen nachzuweisen und das Expeditionsfahrzeug durch die engen Gassen Karlsruhes zu manövrieren.",
      "Um die anstehende Pflanzenauswahl in physisch wie mental gestärktem Zustand vornehmen zu können, wurde zunächst entgeltlich Proviant im örtlichen Lebensmitteleinzelhandelsfachgeschäft erworben. Der Kassenautomat äußerte dabei zwischenzeitlich Bedenken hinsichtlich der Verkaufsfähigkeit des Artikels.",
      { bild: "img/ikea-2-proviant.webp", unterschrift: "Abb. 2: Proviantbeschaffung. Der Automat zeigt sich skeptisch." },
      "Im Fachgeschäft angekommen, wurden die Expeditionsteilnehmer von der Vielfalt des Sortiments regelrecht überrumpelt. Um sicherzustellen, dass die Gewächse mit den inneren spirituellen Chakren sowie dem persönlichen Wertekompass von Andy und JJ harmonieren, wurden verschiedenste Exemplare zunächst am Körper anprobiert.",
      { bilder: ["img/ikea-3-anprobe.webp", "img/ikea-4-anprobe.webp"], unterschrift: "Abb. 3 und 4: Anprobe. Passform und Aura wurden als zufriedenstellend bewertet." },
      "Besonderes Interesse zeigte JJ an einem sehr speziellen Gerät unbekannter Bestimmung. Der Nutzen dieses seltsamen Apparates konnte bis Redaktionsschluss nicht abschließend geklärt werden und wird weiterhin investigativ erforscht. Sachdienliche Hinweise werden vertraulich behandelt.",
      { bild: "img/ikea-5-apparat.webp", unterschrift: "Abb. 5: Das Objekt. Zweck: unbekannt. Form: Birne." },
      "Mit vollbeladenem Fahrzeug erfolgte anschließend unter höchster Vorsicht die Rückführung auf das KIT Gelände. Die verfügbare Parkzeit von 30 Minuten wurde konsequent genutzt, um Raum 410 aufzuwerten und die Räumlichkeiten für große wissenschaftliche Durchbrüche bereitzumachen.",
      { text: "Kommt vorbei und seht es euch selbst an:", link: "events.html", linktext: "Zur Office Party am Freitag, 20.11. um 18 Uhr →" },
      { text: "Die Kosten waren bei solch prächtigen Pflanzen selbstverständlich irrelevant. Wer trotzdem wissen will, was der Spaß gekostet hat, darf mitraten:", link: "ratespiel.html", linktext: "Zum großen Ratespiel →" }
    ]
  },
  {
    datum: "Mi, 11.11.2026",
    rubrik: "INTERN",
    titel: "Raum 410 jetzt im Internet",
    untertitel: "Neue Website geht online, niemand weiß warum",
    bild: "img/team.webp",
    bildAlt: "Andy und JJ im Büro, einer mit Schmollmund, der andere mit einer Birne im Mund",
    text: [
      "Die Abteilung 410 verfügt ab sofort über eine eigene Internetpräsenz.",
      "Ein Sprecher wollte sich nicht äußern, da er gerade eine Birne im Mund hatte."
    ]
  },
  {
    datum: "Di, 10.11.2026",
    rubrik: "WETTER",
    titel: "Wetterbericht für Raum 410",
    untertitel: "Raumtemperatur in 410: entweder Sauna oder Tiefkühltruhe",
    text: [
      "Die Heizung bleibt weiterhin ein ungelöstes Rätsel. Fachleute empfehlen den Zwiebellook.",
      "Ausblick: Dank neuer Begrünung ab dem 16.11. erstmals Sauerstoff im Raum. Leichte Bewölkung durch Kaffeedampf."
    ]
  }
];
