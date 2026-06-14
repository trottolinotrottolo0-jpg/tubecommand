// All AI functions work without any external API key.
// Content is generated using smart niche-aware templates.

// ─── BRAINSTORM EXPANSION ────────────────────────────────────────────────────

export interface BrainstormConcept {
  id: number;
  concept: string;
  angle: "shock" | "listicle" | "story" | "howto" | "curiosity";
  contentType: "🎬 Short (60s)" | "📹 Long-form (8-12 min)" | "📹 Medium (4-7 min)";
  researchHint: string;
  whyItWorks: string;
  hookIdea: string;
}

// Known Italian/global entities to expand intelligently
const ENTITIES: { keywords: string[]; name: string; context: string; type: "person" | "brand" | "topic" }[] = [
  { keywords: ["corona", "fabrizio corona"], name: "Fabrizio Corona", context: "personaggio controverso italiano, ex agente dei vip, ha fatto carcere, ora torna sulla scena mediatica", type: "person" },
  { keywords: ["gurulandia", "guru landia"], name: "Gurulandia", context: "canale podcast italiano con interviste a personaggi controversi", type: "brand" },
  { keywords: ["vale", "valentino rossi", "rossi"], name: "Valentino Rossi", context: "campione MotoGP italiano, leggenda dello sport", type: "person" },
  { keywords: ["chiara ferragni", "ferragni"], name: "Chiara Ferragni", context: "influencer italiana, caso giudiziario pandoro-gate", type: "person" },
  { keywords: ["fedez"], name: "Fedez", context: "rapper italiano, separazione da Ferragni, vicende personali pubbliche", type: "person" },
  { keywords: ["berlinguer", "bianca berlinguer"], name: "Bianca Berlinguer", context: "giornalista italiana, conduttrice televisiva", type: "person" },
  { keywords: ["striscia", "striscia la notizia"], name: "Striscia la Notizia", context: "programma satirico italiano, velina, tapiro", type: "brand" },
  { keywords: ["ali abdaal"], name: "Ali Abdaal", context: "YouTuber productività, ha guadagnato milioni online", type: "person" },
  { keywords: ["graham stephan"], name: "Graham Stephan", context: "finance YouTuber americano, real estate investor", type: "person" },
  { keywords: ["andy elliott"], name: "Andy Elliott", context: "sales trainer americano, contenuti motivazionali aggressivi", type: "person" },
  { keywords: ["passive income", "reddito passivo"], name: "passive income", context: "guadagnare soldi senza lavorare attivamente", type: "topic" },
  { keywords: ["investimenti", "investire", "invest"], name: "investire in borsa", context: "comprare azioni, ETF, crypto per far crescere i soldi", type: "topic" },
  { keywords: ["crypto", "bitcoin", "ethereum"], name: "crypto", context: "criptovalute, mercato volatile, bull run, bear market", type: "topic" },
  { keywords: ["corpo umano", "human body"], name: "corpo umano", context: "fatti incredibili sul corpo umano, record, curiosità scientifiche", type: "topic" },
  { keywords: ["animali", "animals"], name: "animali", context: "comportamenti estremi degli animali, predatori, record naturali", type: "topic" },
  { keywords: ["cervello", "brain"], name: "cervello umano", context: "neuroscienze, come funziona la mente, trucchi cognitivi", type: "topic" },
];

function detectEntity(input: string): typeof ENTITIES[0] | null {
  const lower = input.toLowerCase();
  for (const e of ENTITIES) {
    if (e.keywords.some(k => lower.includes(k))) return e;
  }
  return null;
}

function brainstormConceptsIT(input: string, _niche: string): BrainstormConcept[] {
  const entity = detectEntity(input);
  const name = entity ? entity.name : input;
  const isPerson = entity?.type === "person";
  const isTopic = entity?.type === "topic";

  const concepts: BrainstormConcept[] = [
    {
      id: 1,
      concept: isPerson
        ? `Le frasi più controverse di ${name} — quello che nessuno ha il coraggio di dire`
        : `${name}: la verità che i media non ti raccontano`,
      angle: "shock",
      contentType: "🎬 Short (60s)",
      researchHint: isPerson
        ? `Cerca le ultime interviste di ${name} su YouTube/Instagram degli ultimi 30 giorni. Cerca la clip più condivisa e il momento più controverso.`
        : `Cerca su YouTube "${name} facts" o "${name} segreti" — filtra per ultimi 6 mesi. Prendi il dato più sorprendente e costruisci il video su quello.`,
      whyItWorks: "I contenuti controversi di personaggi noti generano commenti e condivisioni automatiche. Il formato short cattura chi già conosce il nome.",
      hookIdea: `"Quello che ${name} ha detto ha fatto impazzire il web — e capisci subito perché."`,
    },
    {
      id: 2,
      concept: isPerson
        ? `${name} vs [rivale]: lo scontro che il web non dimentica`
        : `5 cose su ${name} che cambiano completamente la tua prospettiva`,
      angle: "listicle",
      contentType: "📹 Long-form (8-12 min)",
      researchHint: isPerson
        ? `Cerca "${name} litigio" o "${name} contro" su YouTube. Identifica il rival principale e racconta i momenti chiave dello scontro cronologicamente.`
        : `Fai una ricerca su Google Scholar o Wikipedia: cerca i 5 fatti meno noti su ${name}. Poi verifica quale è più sorprendente per un pubblico italiano.`,
      whyItWorks: "I listicle mantengono alta la retention: lo spettatore vuole vedere tutti i punti. Il conflitto tra persone genera curiosità narrativa naturale.",
      hookIdea: `"Punto numero 5 cambierà completamente come pensi a ${name}."`,
    },
    {
      id: 3,
      concept: isPerson
        ? `La storia vera di ${name}: dalla cima al crollo (e il ritorno)`
        : isTopic
        ? `Ho provato ${name} per 30 giorni: quello che è successo mi ha sconvolto`
        : `Come ${name} è diventato un fenomeno che nessuno si aspettava`,
      angle: "story",
      contentType: "📹 Long-form (8-12 min)",
      researchHint: isPerson
        ? `Cerca articoli e video su "${name} storia" e "${name} vita" — costruisci una timeline: cosa faceva prima, cosa successe, dove è adesso. Wikipedia + interviste YouTube.`
        : `Cerca case study o esperienze reali su Reddit o forum italiani. Trova 2-3 storie vere (anonimizzate) e costruisci il video attorno a quelle.`,
      whyItWorks: "I video storici/narrativi tengono le persone incollate fino alla fine. Chi conosce già il personaggio vuole dettagli che non sapeva.",
      hookIdea: `"Pochi sanno come è andata davvero. Questa è la storia vera di ${name}."`,
    },
    {
      id: 4,
      concept: isPerson
        ? `Cosa puoi imparare da ${name} — anche se non ti piace`
        : `Come usare ${name} per [risultato concreto] in meno di una settimana`,
      angle: "howto",
      contentType: "📹 Medium (4-7 min)",
      researchHint: isPerson
        ? `Cerca interviste dove ${name} parla della sua mentalità o strategia. Estrai 3-4 principi applicabili e costruisci il video come "lezioni pratiche da ${name}".`
        : `Cerca tutorial o guide pratiche su ${name}. Identifica i 3 errori più comuni che fanno i principianti e struttura il video come "cosa non fare + cosa fare invece".`,
      whyItWorks: "I video how-to sono i più cercati su YouTube. Collegare un personaggio noto a una lezione pratica aumenta il CTR del 40%+.",
      hookIdea: `"Non devi ammirare ${name} per rubargli le strategie. Eccole."`,
    },
    {
      id: 5,
      concept: isPerson
        ? `Perché tutti parlano di ${name} proprio adesso? (La risposta ti sorprenderà)`
        : `Il lato oscuro di ${name} che nessuno mostra`,
      angle: "curiosity",
      contentType: "🎬 Short (60s)",
      researchHint: isPerson
        ? `Vai su Google Trends e cerca "${name}" — vedi quando c'è stato il picco recente e perché. Costruisci il video spiegando quel momento specifico.`
        : `Cerca "${name} problemi" o "${name} rischi" — filtra per fonti attendibili. Il lato oscuro deve essere reale, non clickbait puro.`,
      whyItWorks: "Il format curiosity+domanda nel titolo spinge al click istintivo. La risposta 'sorprendente' crea aspettativa. Perfetto per Shorts virali.",
      hookIdea: `"Se ti stai chiedendo perché tutti parlano di ${name} — guarda fino alla fine."`,
    },
    {
      id: 6,
      concept: isPerson
        ? `${name} aveva ragione — ma nessuno lo ammette`
        : `${name}: il prima e il dopo che nessuno ti ha mai mostrato`,
      angle: "shock",
      contentType: "📹 Medium (4-7 min)",
      researchHint: isPerson
        ? `Cerca vecchie dichiarazioni/previsioni di ${name} che si sono avverate. Poi confrontale con quello che diceva l'opinione pubblica all'epoca. Usa clip YouTube + articoli.`
        : `Cerca dati storici: com'era ${name} 5-10 anni fa vs oggi. Usa grafici, statistiche, esempi concreti per mostrare l'evoluzione.`,
      whyItWorks: "Il format 'aveva ragione lui' è polarizzante: chi lo odia commenta, chi lo ama condivide. Entrambi aumentano le view.",
      hookIdea: `"Tutti lo criticavano. Ma aveva ragione lui. Eccola la prova."`,
    },
  ];

  return concepts;
}

function brainstormConceptsEN(input: string, _niche: string): BrainstormConcept[] {
  const entity = detectEntity(input);
  const name = entity ? entity.name : input;
  const isPerson = entity?.type === "person";
  const isTopic = entity?.type === "topic";

  return [
    {
      id: 1,
      concept: isPerson ? `${name}'s most controversial moments — ranked` : `${name}: the truth nobody tells you`,
      angle: "shock",
      contentType: "🎬 Short (60s)",
      researchHint: isPerson
        ? `Search YouTube for "${name} controversy" or "${name} reaction" in the last 30 days. Find the most shared clip and build around that moment.`
        : `Search Reddit and YouTube for "${name} exposed" or "${name} dark side". Find the most discussed angle and validate with multiple sources.`,
      whyItWorks: "Controversial content about known figures drives automatic shares and comments. Short format catches scrollers who already know the name.",
      hookIdea: `"What ${name} said broke the internet — and you'll see why immediately."`,
    },
    {
      id: 2,
      concept: isPerson ? `5 things ${name} did that nobody talks about` : `5 things about ${name} that will change your life`,
      angle: "listicle",
      contentType: "📹 Long-form (8-12 min)",
      researchHint: isPerson
        ? `Dig into ${name}'s Wikipedia, old interviews, and YouTube deep cuts. Find 5 facts that even fans don't know about.`
        : `Search for surprising stats and counterintuitive facts about ${name}. Rank them by how shocking they are to a general audience.`,
      whyItWorks: "Listicles hold retention — viewers stay to see all points. Numbered titles perform 35%+ higher CTR in this niche.",
      hookIdea: `"Number 5 will completely change how you see ${name}."`,
    },
    {
      id: 3,
      concept: isPerson ? `The untold story of ${name}: rise, fall, and return` : isTopic ? `I tried ${name} for 30 days — here's what happened` : `How ${name} became a phenomenon nobody predicted`,
      angle: "story",
      contentType: "📹 Long-form (8-12 min)",
      researchHint: isPerson
        ? `Build a timeline: where ${name} started, the peak, the controversy, where they are now. Use Wikipedia + YouTube interviews + news articles.`
        : `Find 2-3 real case studies or personal experiences from Reddit/forums. Build the video around real stories, anonymized if needed.`,
      whyItWorks: "Story-driven videos hold viewers to the end. People who know the subject want the details they've never heard.",
      hookIdea: `"Few people know the real story. This is what actually happened with ${name}."`,
    },
    {
      id: 4,
      concept: isPerson ? `What you can learn from ${name} — even if you hate them` : `How to use ${name} to achieve [result] in under a week`,
      angle: "howto",
      contentType: "📹 Medium (4-7 min)",
      researchHint: isPerson
        ? `Find interviews where ${name} talks about mindset or strategy. Extract 3-4 applicable principles and structure the video as "practical lessons from ${name}".`
        : `Find beginner guides and identify the 3 most common mistakes. Structure as "what NOT to do + what to do instead".`,
      whyItWorks: "How-to videos are the most searched on YouTube. Linking a well-known name to practical lessons boosts CTR by 40%+.",
      hookIdea: `"You don't have to like ${name} to steal their strategies. Here they are."`,
    },
    {
      id: 5,
      concept: isPerson ? `Why everyone is talking about ${name} right now` : `The dark side of ${name} nobody shows you`,
      angle: "curiosity",
      contentType: "🎬 Short (60s)",
      researchHint: isPerson
        ? `Check Google Trends for "${name}" — find the recent spike and WHY it happened. Build the video explaining that specific moment.`
        : `Search "${name} risks" or "${name} problems" — filter for credible sources. The dark side must be real, not pure clickbait.`,
      whyItWorks: "Curiosity + question in title drives instinctive clicks. 'Surprising answer' creates expectation. Perfect for viral Shorts.",
      hookIdea: `"If you're wondering why everyone is talking about ${name} — watch till the end."`,
    },
    {
      id: 6,
      concept: isPerson ? `${name} was right all along — and nobody admits it` : `${name}: before vs after nobody showed you`,
      angle: "shock",
      contentType: "📹 Medium (4-7 min)",
      researchHint: isPerson
        ? `Find old statements or predictions from ${name} that turned out to be true. Compare with what public opinion said at the time.`
        : `Find historical data: what was ${name} like 5-10 years ago vs today. Use charts and concrete examples to show the evolution.`,
      whyItWorks: "The 'they were right' format is polarizing: haters comment, fans share. Both drive views. High engagement rate.",
      hookIdea: `"Everyone laughed at ${name}. But they were right. Here's the proof."`,
    },
  ];
}

export function brainstormExpand(input: string, niche: string, language: string): BrainstormConcept[] {
  const isEn = language.toLowerCase().includes("english");
  return isEn ? brainstormConceptsEN(input, niche) : brainstormConceptsIT(input, niche);
}

// ─── THUMBNAIL GENERATOR ─────────────────────────────────────────────────────

export type ThumbnailLayout = "bigtext" | "split" | "arrow" | "number" | "minimal" | "gradient" | "highlight";

export interface ThumbnailConcept {
  id: number;
  name: string;
  layout: ThumbnailLayout;
  mainText: string;
  subText: string;
  bgColor: string;
  bgColor2?: string;
  textColor: string;
  accentColor: string;
  emoji: string;
  ctrScore: number;        // 1-5
  palette: string[];       // hex colours for the palette swatch
  canvaSteps: string[];    // step-by-step for Canva
  whyItWorks: string;
}

// Palette presets
const PALETTES = {
  fire:    ["#0a0a0a", "#ef4444", "#f97316", "#ffffff"],
  gold:    ["#111111", "#f59e0b", "#fbbf24", "#ffffff"],
  electric:["#050a14", "#3b82f6", "#60a5fa", "#ffffff"],
  viral:   ["#0f0f0f", "#a855f7", "#ec4899", "#ffffff"],
  clean:   ["#f8fafc", "#1e293b", "#3b82f6", "#ef4444"],
  contrast:["#111111", "#22c55e", "#16a34a", "#ffffff"],
};

function pickPalette(niche: string): typeof PALETTES[keyof typeof PALETTES] {
  const n = niche.toLowerCase();
  if (n.includes("finance") || n.includes("money") || n.includes("craft")) return PALETTES.gold;
  if (n.includes("science") || n.includes("human") || n.includes("hvman")) return PALETTES.electric;
  if (n.includes("podcast") || n.includes("clip") || n.includes("guru")) return PALETTES.viral;
  return PALETTES.fire;
}

function buildThumbnails(keyword: string, isEn: boolean, niche: string): ThumbnailConcept[] {
  const pal = pickPalette(niche);
  const kUP = keyword.toUpperCase().split(" ").slice(0, 3).join(" ");
  const kShort = keyword.split(" ").slice(0, 2).join(" ");

  return [
    {
      id: 1,
      name: isEn ? "Big Text Impact" : "Testo Dominante",
      layout: "bigtext",
      mainText: kUP,
      subText: isEn ? "THE TRUTH" : "LA VERITÀ",
      bgColor: pal[0],
      textColor: pal[3],
      accentColor: pal[1],
      emoji: "🔥",
      ctrScore: 5,
      palette: pal,
      canvaSteps: isEn
        ? ["Open Canva → YouTube Thumbnail (1280×720)", "Background: black (#0a0a0a)", `Add bold text "${kUP}" — font Anton or Impact, size 180+, color ${pal[1]}`, "Add smaller subtext bottom-right in white", "Add red/orange accent rectangle behind the main text", "Export PNG, max quality"]
        : ["Apri Canva → Miniatura YouTube (1280×720)", "Sfondo: nero (#0a0a0a)", `Aggiungi testo "${kUP}" — font Anton o Impact, dimensione 180+, colore ${pal[1]}`, "Aggiungi sottotitolo in basso a destra in bianco", "Aggiungi rettangolo accentuato dietro al testo principale", "Esporta PNG, qualità massima"],
      whyItWorks: isEn ? "Text-dominant thumbnails work especially for Shorts — readable even at 120px on mobile. Bold single-color backgrounds cut through noise." : "Le thumbnail a testo dominante funzionano benissimo per gli Shorts — leggibili anche a 120px su mobile. Lo sfondo monocromatico bold taglia il rumore visivo del feed.",
    },
    {
      id: 2,
      name: isEn ? "Split Contrast" : "Split Contrasto",
      layout: "split",
      mainText: kShort.toUpperCase(),
      subText: isEn ? "vs" : "VS",
      bgColor: pal[0],
      bgColor2: pal[1],
      textColor: pal[3],
      accentColor: pal[2],
      emoji: "⚡",
      ctrScore: 4,
      palette: pal,
      canvaSteps: isEn
        ? ["Canvas 1280×720", "Left half: dark background, add icon/emoji large (200px)", `Right half: solid color ${pal[1]}`, `Big text "${kShort.toUpperCase()}" on right side, white, Impact font`, "Add diagonal separator between halves for dynamism", "Optional: arrow pointing from left to right"]
        : ["Canvas 1280×720", "Metà sinistra: sfondo scuro, aggiungi icona/emoji grande (200px)", `Metà destra: colore solido ${pal[1]}`, `Testo grande "${kShort.toUpperCase()}" sulla destra, bianco, font Impact`, "Aggiungi separatore diagonale tra le metà per dinamismo", "Opzionale: freccia che punta da sinistra a destra"],
      whyItWorks: isEn ? "Split creates visual tension and implies comparison/conflict — one of the highest-CTR patterns on YouTube. The contrast makes it pop even on cluttered feeds." : "Lo split crea tensione visiva e implica confronto/conflitto — uno dei pattern con CTR più alto su YouTube. Il contrasto fa risaltare la thumbnail anche in feed affollati.",
    },
    {
      id: 3,
      name: isEn ? "Number Hook" : "Numero Agganciatore",
      layout: "number",
      mainText: "5",
      subText: keyword.toUpperCase(),
      bgColor: "#111111",
      textColor: pal[1],
      accentColor: pal[3],
      emoji: "💣",
      ctrScore: 4,
      palette: pal,
      canvaSteps: isEn
        ? ["Canvas 1280×720, black background", `Place a GIANT number "5" center-left, font Impact, color ${pal[1]}, size 400+`, `Stack topic text "${keyword.toUpperCase()}" to the right, white, size 60`, "Add thin colored underline under the number for emphasis", "Bottom bar: solid accent color with channel name or emoji"]
        : ["Canvas 1280×720, sfondo nero", `Metti un numero GIGANTE "5" centro-sinistra, font Impact, colore ${pal[1]}, size 400+`, `Testo argomento "${keyword.toUpperCase()}" a destra, bianco, size 60`, "Aggiungi sottile linea colorata sotto il numero per enfasi", "Barra in basso: colore accent solido con nome canale o emoji"],
      whyItWorks: isEn ? "Numbers trigger a psychological pattern — viewers know exactly what they're getting. '5 things' consistently outperforms generic titles by 35-40% CTR on educational content." : "I numeri attivano un pattern psicologico — lo spettatore sa esattamente cosa riceverà. 'Le 5 cose' supera costantemente i titoli generici del 35-40% CTR nei contenuti educational.",
    },
    {
      id: 4,
      name: isEn ? "Arrow Reveal" : "Freccia Rivelazione",
      layout: "arrow",
      mainText: "?!",
      subText: keyword.toUpperCase(),
      bgColor: "#0a0a0a",
      textColor: "#ffffff",
      accentColor: "#ef4444",
      emoji: "👉",
      ctrScore: 4,
      palette: ["#0a0a0a", "#ef4444", "#ffffff", "#f97316"],
      canvaSteps: isEn
        ? ["Canvas 1280×720, very dark background", "Add large emoji or question mark left side (size 250)", "Red arrow (→) pointing right, center of canvas", `Bold text "${keyword.toUpperCase()}" right side, white`, "Add shocked/surprised icon below the arrow", "Thin red border around the entire thumbnail (8px)"]
        : ["Canvas 1280×720, sfondo molto scuro", "Aggiungi emoji grande o punto interrogativo lato sinistro (size 250)", "Freccia rossa (→) che punta a destra, centro del canvas", `Testo bold "${keyword.toUpperCase()}" lato destro, bianco`, "Aggiungi icona shock/sorpresa sotto la freccia", "Bordo rosso sottile intorno all'intera thumbnail (8px)"],
      whyItWorks: isEn ? "Arrows direct the eye and create movement — the brain follows the arrow automatically. Combined with a mystery element, it generates irresistible curiosity." : "Le frecce guidano l'occhio e creano movimento — il cervello segue la freccia automaticamente. Combinata con un elemento mistero, genera curiosità irresistibile.",
    },
    {
      id: 5,
      name: isEn ? "Gradient Minimal" : "Gradient Minimale",
      layout: "gradient",
      mainText: keyword.split(" ").slice(0, 2).join(" ").toUpperCase(),
      subText: isEn ? "Watch till the end" : "Guarda fino alla fine",
      bgColor: pal[0],
      bgColor2: pal[1] + "88",
      textColor: "#ffffff",
      accentColor: pal[2],
      emoji: "✨",
      ctrScore: 3,
      palette: pal,
      canvaSteps: isEn
        ? [`Canvas 1280×720, gradient background: ${pal[0]} → ${pal[1]}`, "Add large emoji top-center (size 150)", `Bold centered text "${keyword.toUpperCase()}", white, clean sans-serif font`, "Small subtext below: 'You won't believe this'", "No clutter — max 3 elements total", "Add subtle vignette effect at the edges"]
        : [`Canvas 1280×720, sfondo gradient: ${pal[0]} → ${pal[1]}`, "Aggiungi emoji grande top-center (size 150)", `Testo centrato bold "${keyword.toUpperCase()}", bianco, font sans-serif pulito`, "Piccolo sottotesto sotto: 'Non crederai mai'", "Nessun affollamento — max 3 elementi totali", "Aggiungi leggero effetto vignette ai bordi"],
      whyItWorks: isEn ? "Clean gradient thumbnails stand out among busy, cluttered competitors. Works especially well for educational/curiosity channels where credibility matters." : "Le thumbnail gradient pulite risaltano tra competitor affollati e caotici. Funziona benissimo per canali educational/curiosity dove conta la credibilità.",
    },
    {
      id: 6,
      name: isEn ? "Highlight Box" : "Box Evidenziato",
      layout: "highlight",
      mainText: kUP,
      subText: isEn ? "REVEALED" : "RIVELATO",
      bgColor: "#111111",
      textColor: "#ffffff",
      accentColor: pal[1],
      emoji: "🚨",
      ctrScore: 5,
      palette: pal,
      canvaSteps: isEn
        ? ["Canvas 1280×720, black background", `Add colored rectangle/box ${pal[1]} covering 60% of width, center-left`, `Bold text "${kUP}" inside the box, black or white for contrast`, "Add 'REVEALED' or 'SHOCKING' banner top-right, red background", "Emoji 🚨 or ⚠️ top-left corner, size 80", "Add bright frame/glow around the box"]
        : ["Canvas 1280×720, sfondo nero", `Aggiungi rettangolo colorato ${pal[1]} che copre 60% della larghezza, centro-sinistra`, `Testo bold "${kUP}" dentro il box, nero o bianco per contrasto`, "Aggiungi banner 'RIVELATO' o 'SHOCK' in alto a destra, sfondo rosso", "Emoji 🚨 o ⚠️ angolo in alto a sinistra, size 80", "Aggiungi bordo luminoso/glow intorno al box"],
      whyItWorks: isEn ? "The highlight box creates a visual hierarchy that the eye follows instantly. The combination of solid box + banner label is one of the most proven CTR patterns for viral content." : "Il box evidenziato crea una gerarchia visiva che l'occhio segue istantaneamente. La combinazione box solido + banner label è uno dei pattern CTR più collaudati per i contenuti virali.",
    },
  ];
}

function buildSimilarThumbnails(description: string, isEn: boolean, niche: string): ThumbnailConcept[] {
  const pal = pickPalette(niche);
  const desc = description.toLowerCase();

  // Detect style from description
  const hasDark = desc.includes("nero") || desc.includes("scuro") || desc.includes("dark") || desc.includes("black");
  const hasRed = desc.includes("rosso") || desc.includes("red");
  const hasArrow = desc.includes("freccia") || desc.includes("arrow");
  const hasNumber = /\d/.test(desc);

  const bg1 = hasDark ? "#0a0a0a" : "#f8fafc";
  const txt1 = hasDark ? "#ffffff" : "#1e293b";
  const acc1 = hasRed ? "#ef4444" : pal[1];

  return [
    {
      id: 1,
      name: isEn ? "Exact Match Variation" : "Variazione Fedele",
      layout: "bigtext",
      mainText: isEn ? "YOUR TEXT" : "IL TUO TESTO",
      subText: isEn ? "Same style, tweaked" : "Stesso stile, ritoccato",
      bgColor: bg1,
      textColor: txt1,
      accentColor: acc1,
      emoji: hasArrow ? "👉" : hasNumber ? "💥" : "🔥",
      ctrScore: 4,
      palette: [bg1, acc1, txt1, pal[2]],
      canvaSteps: isEn
        ? ["Replicate your exact layout", "Change only: the main text and the top accent color", "Keep font, size, and positioning identical", "This is your A/B test version — minimal change, maximum data"]
        : ["Replica il tuo layout esatto", "Cambia solo: il testo principale e il colore accent superiore", "Mantieni font, size e posizionamento identici", "Questa è la tua versione A/B test — minima modifica, massimi dati"],
      whyItWorks: isEn ? "Keep what works. One variable change lets you A/B test effectively without rebuilding from scratch." : "Tieni ciò che funziona. Un solo cambiamento di variabile ti permette di fare A/B test efficace senza ricostruire da zero.",
    },
    {
      id: 2,
      name: isEn ? "Inverted Palette" : "Palette Invertita",
      layout: hasDark ? "minimal" : "bigtext",
      mainText: isEn ? "INVERTED" : "INVERTITO",
      subText: isEn ? "Swap bg & text colors" : "Scambia bg e colori testo",
      bgColor: hasDark ? "#f8fafc" : "#0a0a0a",
      textColor: hasDark ? "#1e293b" : "#ffffff",
      accentColor: acc1,
      emoji: "🔄",
      ctrScore: 4,
      palette: [hasDark ? "#f8fafc" : "#0a0a0a", acc1, hasDark ? "#1e293b" : "#ffffff", pal[2]],
      canvaSteps: isEn
        ? ["Take your existing thumbnail in Canva", "Select all elements, swap background color (dark→light or light→dark)", "Invert text colors accordingly", "Keep accent colors identical", "This creates a second version that performs differently in different contexts (dark mode vs light mode feeds)"]
        : ["Prendi la tua thumbnail esistente in Canva", "Seleziona tutti gli elementi, inverti il colore di sfondo (scuro→chiaro o chiaro→scuro)", "Inverti i colori del testo di conseguenza", "Mantieni i colori accent identici", "Questo crea una seconda versione che performa diversamente in contesti diversi (feed dark mode vs light mode)"],
      whyItWorks: isEn ? "Palette inversion often outperforms the original on different devices/feeds. Takes 2 minutes and gives you a completely different thumbnail to test." : "L'inversione di palette spesso supera l'originale su dispositivi/feed diversi. Richiede 2 minuti e ti dà una thumbnail completamente diversa da testare.",
    },
    {
      id: 3,
      name: isEn ? "Add Tension Element" : "Aggiungi Tensione",
      layout: "arrow",
      mainText: isEn ? "+ TENSION" : "+ TENSIONE",
      subText: isEn ? "Arrow + surprise emoji" : "Freccia + emoji sorpresa",
      bgColor: bg1,
      textColor: txt1,
      accentColor: "#ef4444",
      emoji: "😱",
      ctrScore: 5,
      palette: [bg1, "#ef4444", txt1, "#f97316"],
      canvaSteps: isEn
        ? ["Take your existing thumbnail", "Add a red pointing arrow (→) towards the main subject/text", "Add a shocked/surprised emoji (😱 or 🤯) in one corner", "Add a thin red border around the entire canvas (6-8px)", "These 3 elements added to any thumbnail increase CTR by ~20%"]
        : ["Prendi la tua thumbnail esistente", "Aggiungi una freccia rossa che punta (→) verso il soggetto/testo principale", "Aggiungi un emoji shock/sorpresa (😱 o 🤯) in un angolo", "Aggiungi un bordo rosso sottile intorno all'intero canvas (6-8px)", "Questi 3 elementi aggiunti a qualsiasi thumbnail aumentano il CTR del ~20%"],
      whyItWorks: isEn ? "Three high-CTR micro-elements combined: directional arrow (guides eye), shocked emoji (implies reward), red border (separates from feed background). Stack them on any existing thumbnail." : "Tre micro-elementi ad alto CTR combinati: freccia direzionale (guida l'occhio), emoji shock (implica ricompensa), bordo rosso (separa dal feed). Applicabili a qualsiasi thumbnail esistente.",
    },
    {
      id: 4,
      name: isEn ? "Text Size Upgrade" : "Testo Più Grande",
      layout: "bigtext",
      mainText: isEn ? "BIGGER = BETTER" : "PIÙ GRANDE = MEGLIO",
      subText: isEn ? "Mobile-first rule" : "Regola mobile-first",
      bgColor: bg1,
      textColor: acc1,
      accentColor: txt1,
      emoji: "📱",
      ctrScore: 4,
      palette: [bg1, acc1, txt1, "#f59e0b"],
      canvaSteps: isEn
        ? ["Take your existing thumbnail", "Increase main text size by 40-60%", "Remove any small decorative text that's unreadable at thumbnail size", "Simplify: keep only 2-3 elements max", "Check: can you read it at 120×68 pixels? If yes, it's ready"]
        : ["Prendi la tua thumbnail esistente", "Aumenta la dimensione del testo principale del 40-60%", "Rimuovi qualsiasi testo decorativo piccolo che non si legge in miniatura", "Semplifica: tieni solo 2-3 elementi massimo", "Check: si legge a 120×68 pixel? Se sì, è pronta"],
      whyItWorks: isEn ? "70%+ of YouTube traffic is mobile. Most thumbnails fail the '120px test' — they're designed on desktop but viewed on phones. Bigger text = more clicks on small screens." : "Il 70%+ del traffico YouTube è mobile. La maggior parte delle thumbnail fallisce il 'test 120px' — vengono progettate su desktop ma viste su telefoni. Testo più grande = più click su schermi piccoli.",
    },
    {
      id: 5,
      name: isEn ? "Color Pop Variant" : "Variante Pop",
      layout: "highlight",
      mainText: isEn ? "POP COLOR" : "COLORE POP",
      subText: isEn ? "One unexpected accent" : "Un accent inaspettato",
      bgColor: bg1,
      textColor: txt1,
      accentColor: pal[2],
      emoji: "🎨",
      ctrScore: 3,
      palette: [bg1, pal[2], txt1, pal[1]],
      canvaSteps: isEn
        ? ["Take your thumbnail", `Add ONE unexpected pop color: try ${pal[2]} (your channel accent) as a highlight bar or text shadow`, "This color should touch only the most important word or element", "The unexpected color creates visual surprise in the feed", "Don't change anything else — the contrast does all the work"]
        : ["Prendi la tua thumbnail", `Aggiungi UN colore pop inaspettato: prova ${pal[2]} (l'accent del tuo canale) come barra highlight o ombra testo`, "Questo colore deve toccare solo la parola o l'elemento più importante", "Il colore inaspettato crea sorpresa visiva nel feed", "Non cambiare nient'altro — il contrasto fa tutto il lavoro"],
      whyItWorks: isEn ? "One unexpected accent color in an otherwise consistent palette creates visual surprise. The eye is drawn to the anomaly — and that's exactly where you want it." : "Un colore accent inaspettato in una palette altrimenti coerente crea sorpresa visiva. L'occhio viene attratto dall'anomalia — ed è esattamente lì che vuoi che vada.",
    },
  ];
}

export function generateThumbnailIdeas(topic: string, niche: string, language: string): ThumbnailConcept[] {
  const isEn = language.toLowerCase().includes("english");
  return buildThumbnails(topic, isEn, niche);
}

export function findSimilarThumbnails(description: string, niche: string, language: string): ThumbnailConcept[] {
  const isEn = language.toLowerCase().includes("english");
  return buildSimilarThumbnails(description, isEn, niche);
}


export interface TitleIdea {
  title: string;
  angle: string;
  hook: string;
}

export interface SEOPackage {
  optimizedTitle: string;
  description: string;
  tags: string[];
  hashtags: string[];
  thumbnailConcept: string;
}

export interface FullBreakdown {
  titles: { title: string; angle: string }[];
  selectedTitle: string;
  hook: string;
  description: string;
  tags: string[];
  hashtags: string[];
  thumbnailConcept: string;
  thumbnailText: string;
  scriptOutline: string[];
  bestTimeToPost: string;
  estimatedViews: string;
}

// ─── Title generation ────────────────────────────────────────────────────────

const ANGLES = [
  { angle: "shock",     pattern: (k: string) => `${k}: La Verità Che Nessuno Ti Ha Mai Detto` },
  { angle: "listicle",  pattern: (k: string) => `5 Cose su ${k} Che Ti Cambieranno la Testa` },
  { angle: "curiosity", pattern: (k: string) => `Cosa Succede Davvero Quando ${k}? (Risposta Shock)` },
  { angle: "story",     pattern: (k: string) => `Ho Scoperto ${k} e Non Tornerò Indietro` },
  { angle: "howto",     pattern: (k: string) => `Come ${k} in Meno di 60 Secondi` },
  { angle: "shock",     pattern: (k: string) => `Perché Tutti Sbagliano su ${k}` },
  { angle: "listicle",  pattern: (k: string) => `${k}: I 7 Segreti Che I Grandi Non Vogliono Che Tu Sappia` },
  { angle: "curiosity", pattern: (k: string) => `Nessuno Parla di ${k} — Ecco Perché` },
  { angle: "story",     pattern: (k: string) => `Ho Provato ${k} per 30 Giorni: Ecco Cosa È Successo` },
  { angle: "howto",     pattern: (k: string) => `La Guida Definitiva a ${k} (2024)` },
];

const ANGLES_EN = [
  { angle: "shock",     pattern: (k: string) => `${k}: The Truth Nobody Tells You` },
  { angle: "listicle",  pattern: (k: string) => `5 Things About ${k} That Will Change Your Life` },
  { angle: "curiosity", pattern: (k: string) => `What Really Happens When ${k}? (Shocking Answer)` },
  { angle: "story",     pattern: (k: string) => `I Tried ${k} and Here's What Happened` },
  { angle: "howto",     pattern: (k: string) => `How To ${k} in 60 Seconds` },
  { angle: "shock",     pattern: (k: string) => `Why Everyone Is Wrong About ${k}` },
  { angle: "listicle",  pattern: (k: string) => `${k}: 7 Secrets The Experts Don't Want You To Know` },
  { angle: "curiosity", pattern: (k: string) => `Nobody Talks About ${k} — Here's Why` },
  { angle: "story",     pattern: (k: string) => `I Did ${k} for 30 Days — Shocking Results` },
  { angle: "howto",     pattern: (k: string) => `The Ultimate ${k} Guide (2024)` },
];

const HOOKS_IT = [
  (k: string) => `"Quello che sto per dirti su ${k} ha cambiato tutto. E probabilmente non l'hai mai sentito prima."`,
  (k: string) => `"${k} — tutti ne parlano, ma nessuno dice la verità. Io sì."`,
  (k: string) => `"Fermati. Quello che sai su ${k} è probabilmente sbagliato."`,
  (k: string) => `"In questo video ti svelo il lato oscuro di ${k} che nessuno mostra."`,
];

const HOOKS_EN = [
  (k: string) => `"What I'm about to tell you about ${k} changed everything. You've never heard this before."`,
  (k: string) => `"${k} — everyone talks about it, but nobody tells the truth. I will."`,
  (k: string) => `"Stop. What you know about ${k} is probably wrong."`,
  (k: string) => `"In this video I expose the dark side of ${k} nobody shows you."`,
];

export async function generateTitleIdeas(keyword: string, _niche: string, language: string): Promise<TitleIdea[]> {
  const isEn = language.toLowerCase().includes("english");
  const pool = isEn ? ANGLES_EN : ANGLES;
  const hookPool = isEn ? HOOKS_EN : HOOKS_IT;
  return pool.map((a, i) => ({
    title: a.pattern(keyword),
    angle: a.angle,
    hook: hookPool[i % hookPool.length](keyword),
  }));
}

export interface SourceVideoContext {
  title: string;
  description: string;
  channelTitle: string;
  tags: string[];
}

export async function generateSEOPackage(title: string, niche: string, language: string, sourceVideo?: SourceVideoContext, channel?: string): Promise<SEOPackage> {
  const isEn = language.toLowerCase().includes("english");
  const nicheWords = niche.toLowerCase().split(/[\s/,]+/).filter(Boolean);

  const stopIT = new Set(["il","lo","la","i","gli","le","un","una","uno","di","da","in","su","per","con","tra","fra","e","o","ma","che","non","si","è","al","del","della","dei","degli","delle","nel","nella","nei","nelle","quello","questa","questo","anche","già","poi","più","meno","come","quando","dove","chi","cosa","perché","però","quindi","così","solo","tutto","tutti","tutte","tutta","ogni","altro","altri","altre","altra","suo","sua","loro","mio","tuo","via","ha","ho","hai","hanno","era","sono","fare","fatto","può","vuole"]);
  const stopEN = new Set(["the","a","an","of","in","on","at","to","for","with","and","or","but","that","this","these","those","is","are","was","were","be","been","have","has","had","do","does","did","will","would","could","should","may","might","from","by","about","into","through","during","before","after","above","below","between","out","off","over","under","then","once","here","there","when","where","why","how","all","both","each","few","more","most","other","some","such","no","not","only","same","so","than","too","very","just","because","as","until","while"]);
  const stop = isEn ? stopEN : stopIT;

  const keywords = title
    .replace(/[:#\-\(\)\.!?,&']/g, " ")
    .replace(/dell['\s]+/gi, " ")
    .replace(/dell['']/gi, " ")
    .split(/\s+/)
    .map(w => w.toLowerCase().trim().replace(/[^a-z0-9àèéìòùÀÈÉÌÒÙ]/g, ""))
    .filter(w => w.length > 3 && !stop.has(w) && /[a-z]/i.test(w));

  const sourceKeywords: string[] = sourceVideo
    ? sourceVideo.title
        .replace(/[:#\-\(\)\.!?,&']/g, " ")
        .split(/\s+/)
        .map(w => w.toLowerCase().trim().replace(/[^a-z0-9àèéìòùÀÈÉÌÒÙ]/g, ""))
        .filter(w => w.length > 3 && !stop.has(w) && /[a-z]/i.test(w))
    : [];

  const uniqueKeywords = [...new Set([...keywords, ...sourceKeywords, ...nicheWords])].slice(0, 10);

  const sourceRef = sourceVideo ? ` (tratto da "${sourceVideo.channelTitle || "podcast originale"}")` : "";
  const metaParagraph = isEn
    ? `In this video we dive into ${title.replace(/[:#]/g, "—").trim()}. We cover everything you need to know about ${uniqueKeywords.slice(0, 3).join(", ")} — from the basics to the advanced insights that most people miss.`
    : `In questo video parliamo di ${title.replace(/[:#]/g, "—").trim()}${sourceRef}. Scopriamo tutto su ${uniqueKeywords.slice(0, 3).join(", ")}: come funziona, perché è rilevante oggi e cosa cambia per chi lavora nel settore.`;

  const hashtags = [
    "#gurulandia", "#startup", "#intelligenzaartificiale", "#AI", "#innovazione", "#tecnologia", "#podcast", "#italia",
    ...uniqueKeywords.slice(0, 4).map(k => `#${k.replace(/\s+/g, "")}`),
  ].slice(0, 12);

  const optimizedTitle = isEn ? `${title} (Full Breakdown)` : title;

  const description = isEn
    ? `${metaParagraph}\n\n🔔 Subscribe for more content like this!\n👍 Like if you found it useful\n💬 Comment your thoughts below\n\n${hashtags.join(" ")}`
    : `Benvenuti su Gurulandia Records! 🎙️\n\n${metaParagraph}\n\n📌 Segui il canale per non perderti i prossimi contenuti.\n👍 Metti like se il video ti è stato utile.\n💬 Commenta la tua opinione — ci interessa sapere cosa ne pensi.\n\n${hashtags.join(" ")}\n\n---\n⚠️ Tutti i diritti sui contenuti appartengono al podcast originale citato nel video. Gurulandia Records non rivendica alcun diritto sulle opere originali.`;

  const tags = uniqueKeywords.concat(["gurulandia", "startup", "AI", "podcast", "innovazione", "tecnologia"]).slice(0, 20);

  const thumbnailConcept = isEn
    ? `Dark background. Bold text: "${title.split(" ").slice(0, 4).join(" ").toUpperCase()}". High contrast red/yellow on black.`
    : `Sfondo scuro. Testo bold: "${title.split(" ").slice(0, 4).join(" ").toUpperCase()}". Colori ad alto contrasto rosso/giallo su nero.`;

  // Try AI-powered SEO if server has Anthropic key
  try {
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL || "http://localhost:3001"}/api/seo/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, channel: channel || "gurulandia", sourceVideo }),
    });
    if (res.ok) return await res.json();
  } catch { /* fallback to template */ }

  return { optimizedTitle, description, tags, hashtags, thumbnailConcept };
}

export async function generateFullBreakdown(idea: string, niche: string, language: string): Promise<FullBreakdown> {
  const isEn = language.toLowerCase().includes("english");
  const nicheWords = niche.toLowerCase().split(/[\s/,]+/).filter(Boolean);
  const pool = isEn ? ANGLES_EN : ANGLES;
  const hookPool = isEn ? HOOKS_EN : HOOKS_IT;

  const titles = pool.slice(0, 3).map((a) => ({
    title: a.pattern(idea),
    angle: a.angle,
  }));

  const selectedTitle = titles[0].title;
  const hook = hookPool[0](idea);

  const tags = [
    idea.toLowerCase(), ...nicheWords, "youtube", "viral", "trending", "2024",
    "shorts", "faceless", "educational", "tips", "guide", "howto",
    "explained", "facts", "secrets", "motivation", "success", "learn", "knowledge",
  ].slice(0, 20);

  const hashtags = [
    "#viral", "#youtube", "#shorts", "#trending",
    `#${nicheWords[0] || "educational"}`,
    "#mindblowing", "#facts", "#motivation", "#success", "#learn",
  ];

  const thumbnailText = idea.split(" ").slice(0, 4).join(" ").toUpperCase();

  const thumbnailConcept = isEn
    ? `Dark/black background. Bold text overlay: "${thumbnailText}". Red arrow pointing right. High contrast (red & yellow on black). No faces needed. Font: Impact or Anton. Keep it minimal — max 2 elements.`
    : `Sfondo nero/scuro. Testo bold: "${thumbnailText}". Freccia rossa a destra. Colori accesi (rosso/giallo su nero). Nessun volto necessario. Font: Impact o Anton. Massimo 2 elementi grafici.`;

  const scriptOutline = isEn
    ? [
        `Intro (0:00): Hook — "${hook.slice(0, 80)}…"`,
        `Problem (1:00): Why ${idea} matters to your audience right now`,
        `Development (3:00): 3 key points about ${idea} with concrete examples`,
        `Proof (6:00): Data, stories, or stats that support the main claim`,
        `CTA (8:00): "Comment below if you want more on this" + subscribe`,
      ]
    : [
        `Intro (0:00): Hook — "${hook.slice(0, 80)}…"`,
        `Problema (1:00): Perché ${idea} è rilevante per il tuo pubblico adesso`,
        `Sviluppo (3:00): 3 punti chiave su ${idea} con esempi concreti`,
        `Prova (6:00): Dati, storie o statistiche a supporto`,
        `CTA (8:00): "Commenta se vuoi saperne di più" + invito iscrizione`,
      ];

  const description = isEn
    ? `In this video, we dive deep into ${idea}.\n\n⏱ TIMESTAMPS\n0:00 - Intro\n1:00 - The Problem\n3:00 - Key Points\n6:00 - Proof\n8:00 - Conclusion\n\n🔔 Subscribe!\n👍 Like if helpful\n💬 Comment your experience\n\n${hashtags.join(" ")}`
    : `In questo video parliamo di ${idea} — uno degli argomenti più importanti del momento.\n\n⏱ TIMESTAMPS\n0:00 - Intro\n1:00 - Il problema\n3:00 - I punti chiave\n6:00 - Prove e dati\n8:00 - Conclusione\n\n🔔 Iscriviti!\n👍 Like se ti è utile\n💬 Commenta la tua esperienza\n\n${hashtags.join(" ")}`;

  const bestTimeToPost = isEn
    ? "Tuesday or Thursday, 6–8 PM (EST peak)"
    : "Martedì o Giovedì, ore 18:00–20:00 (picco italiano)";

  const estimatedViews = isEn
    ? "300–1.5K views (first 48h, growing channel)"
    : "200–800 views (prime 48h, canale in crescita)";

  return {
    titles, selectedTitle, hook, description,
    tags, hashtags, thumbnailConcept, thumbnailText,
    scriptOutline, bestTimeToPost, estimatedViews,
  };
}
