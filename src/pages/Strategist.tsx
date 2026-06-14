import { useState } from "react";
import { Lightbulb, Search, Zap, Copy, Check, Sparkles, ArrowLeft, FlaskConical, ImageIcon, Star } from "lucide-react";
import type { ChannelData } from "../hooks/useChannels";
import { generateTitleIdeas, generateSEOPackage, generateFullBreakdown, brainstormExpand, generateThumbnailIdeas, findSimilarThumbnails } from "../services/ai";
import type { FullBreakdown, BrainstormConcept, ThumbnailConcept, ThumbnailLayout } from "../services/ai";

const ANGLE_COLORS: Record<string, string> = {
  curiosity: "#3b82f6",
  howto: "#10b981",
  listicle: "#f59e0b",
  shock: "#ef4444",
  story: "#a855f7",
};

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-gray-700"
    >
      {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
      {label && <span>{copied ? "Copiato!" : label}</span>}
    </button>
  );
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── FULL BREAKDOWN TAB ─────────────────────────────────────────────────────

type Step = "input" | "brainstorm" | "breakdown";

function FullBreakdownTab({ channel: ch }: { channel: ChannelData }) {
  const [step, setStep] = useState<Step>("input");
  const [rawIdea, setRawIdea] = useState("");
  const [concepts, setConcepts] = useState<BrainstormConcept[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<BrainstormConcept | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FullBreakdown | null>(null);

  const runBrainstorm = () => {
    if (!rawIdea.trim()) return;
    const expanded = brainstormExpand(rawIdea, ch.niche, ch.lang);
    setConcepts(expanded);
    setStep("brainstorm");
    setResult(null);
    setSelectedConcept(null);
  };

  const runBreakdown = async (concept: BrainstormConcept) => {
    setSelectedConcept(concept);
    setStep("breakdown");
    setLoading(true);
    try {
      const data = await generateFullBreakdown(concept.concept, ch.niche, ch.lang);
      setResult(data);
    } catch {
      // fallback still works since generateFullBreakdown is template-based
    }
    setLoading(false);
  };

  const reset = () => { setStep("input"); setRawIdea(""); setConcepts([]); setResult(null); setSelectedConcept(null); };

  // ── STEP 1: INPUT ───────────────────────────────────────────────────────────
  if (step === "input") return (
    <div>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: ch.color + "22" }}>
            <FlaskConical size={16} style={{ color: ch.color }} />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Lancia il brainstorming</div>
            <div className="text-xs text-gray-500">Anche solo 2-3 parole — il tool espande l'idea in 6 concetti video specifici</div>
          </div>
        </div>
        <div className="flex gap-3">
          <input
            value={rawIdea}
            onChange={(e) => setRawIdea(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runBrainstorm()}
            placeholder={`Es: "short su corona", "passive income", "corpo umano record"`}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gray-600"
            autoFocus
          />
          <button
            onClick={runBrainstorm}
            disabled={!rawIdea.trim()}
            className="px-5 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 flex items-center gap-2 whitespace-nowrap"
            style={{ background: ch.color, color: "#000" }}
          >
            <FlaskConical size={15} />
            Brainstorma
          </button>
        </div>
      </div>
      <div className="text-xs text-gray-600 text-center">
        Il tool espande la tua idea grezza → ti mostra 6 concetti video specifici → tu scegli → genera il pacchetto completo
      </div>
    </div>
  );

  // ── STEP 2: BRAINSTORM RESULTS ──────────────────────────────────────────────
  if (step === "brainstorm") return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-xs text-gray-500 mb-1">Idea originale: <span className="text-gray-300">"{rawIdea}"</span></div>
          <div className="text-white font-semibold">6 concetti video — scegli quello che ti convince</div>
        </div>
        <button onClick={reset} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-800">
          <ArrowLeft size={12} /> Nuova idea
        </button>
      </div>

      <div className="grid gap-3">
        {concepts.map((c) => (
          <div
            key={c.id}
            className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-2xl p-5 transition-all cursor-pointer group"
            onClick={() => runBreakdown(c)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Top row */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ background: ANGLE_COLORS[c.angle] + "22", color: ANGLE_COLORS[c.angle] }}>{c.angle}</span>
                  <span className="text-xs text-gray-500">{c.contentType}</span>
                </div>
                {/* Concept title */}
                <div className="text-white font-semibold text-sm mb-3 leading-snug">{c.concept}</div>
                {/* Research hint */}
                <div className="bg-gray-800 rounded-xl p-3 mb-3">
                  <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">🔍 Cosa ricercare</div>
                  <div className="text-xs text-gray-300 leading-relaxed">{c.researchHint}</div>
                </div>
                {/* Why it works */}
                <div className="text-xs text-gray-500 leading-relaxed">
                  <span className="text-gray-600">💡 Perché funziona: </span>{c.whyItWorks}
                </div>
              </div>
              {/* CTA */}
              <button
                className="flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all opacity-0 group-hover:opacity-100 whitespace-nowrap"
                style={{ background: ch.color, color: "#000" }}
              >
                Usa questo →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── STEP 3: FULL BREAKDOWN ──────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-xs text-gray-500 mb-1">Idea: <span className="text-gray-300">"{rawIdea}"</span> → concetto scelto</div>
          <div className="text-white font-semibold text-sm">{selectedConcept?.concept}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setStep("brainstorm")} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-800">
            <ArrowLeft size={12} /> Altri concetti
          </button>
          <button onClick={reset} className="text-xs text-gray-500 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-800">
            Nuova idea
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 gap-3">
          <div className="w-5 h-5 border-2 border-gray-700 rounded-full animate-spin" style={{ borderTopColor: ch.color }} />
          <div className="text-gray-400 text-sm">Generando il pacchetto completo…</div>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-4">

          {/* Hook idea dal brainstorm */}
          {selectedConcept && (
            <div className="bg-gray-900 border rounded-2xl p-4" style={{ borderColor: ch.color + "44" }}>
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">💡 Hook suggerito dal brainstorming</div>
              <div className="text-sm text-white italic">{selectedConcept.hookIdea}</div>
            </div>
          )}

          {/* Titoli */}
          <Section title="🎯 Idee Titolo" action={<CopyButton text={result.selectedTitle} label="Copia migliore" />}>
            <div className="space-y-2">
              {result.titles.map((t, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${i === 0 ? "border-gray-600 bg-gray-800" : "border-gray-800 bg-gray-800/40"}`}
                >
                  <div className="flex-1 min-w-0">
                    {i === 0 && <div className="text-xs mb-1" style={{ color: ch.color }}>⭐ Consigliato</div>}
                    <div className="text-sm text-white font-medium">{t.title}</div>
                    <div className="text-xs mt-0.5">
                      <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: ANGLE_COLORS[t.angle] + "22", color: ANGLE_COLORS[t.angle] }}>{t.angle}</span>
                    </div>
                  </div>
                  <CopyButton text={t.title} />
                </div>
              ))}
            </div>
          </Section>

          {/* Hook */}
          <Section title="⚡ Hook — Primi 3 Secondi" action={<CopyButton text={result.hook} label="Copia" />}>
            <div className="bg-gray-800 rounded-xl p-4 border-l-4" style={{ borderColor: ch.color }}>
              <p className="text-white text-sm italic leading-relaxed">"{result.hook}"</p>
            </div>
            <div className="text-xs text-gray-500 mt-2">Leggi esattamente queste parole all'inizio del video per massimizzare la retention</div>
          </Section>

          {/* Thumbnail */}
          <Section title="🖼 Thumbnail" action={<CopyButton text={result.thumbnailText} label="Copia testo" />}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Testo overlay (max 5 parole)</div>
                <div className="rounded-xl p-4 text-center font-black text-2xl leading-tight" style={{ background: "#111", border: `2px solid ${ch.color}`, color: ch.color }}>
                  {result.thumbnailText}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Concept visivo</div>
                <div className="bg-gray-800 rounded-xl p-3 text-xs text-gray-300 leading-relaxed h-full">{result.thumbnailConcept}</div>
              </div>
            </div>
          </Section>

          {/* Script Outline */}
          <Section title="📝 Struttura Script">
            <ol className="space-y-2">
              {result.scriptOutline.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5" style={{ background: ch.color + "33", color: ch.color }}>{i + 1}</div>
                  <div className="text-sm text-gray-300 leading-relaxed">{step}</div>
                </li>
              ))}
            </ol>
          </Section>

          {/* Tags & Hashtags */}
          <div className="grid grid-cols-2 gap-4">
            <Section title="🏷 Tags (YouTube)" action={<CopyButton text={result.tags.join(", ")} label="Copia tutti" />}>
              <div className="flex flex-wrap gap-1.5">
                {result.tags.map((t, i) => <span key={i} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-lg">{t}</span>)}
              </div>
            </Section>
            <Section title="#️⃣ Hashtags" action={<CopyButton text={result.hashtags.join(" ")} label="Copia tutti" />}>
              <div className="flex flex-wrap gap-1.5">
                {result.hashtags.map((h, i) => <span key={i} className="text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded-lg">{h}</span>)}
              </div>
            </Section>
          </div>

          {/* Description */}
          <Section title="📄 Descrizione YouTube" action={<CopyButton text={result.description} label="Copia tutto" />}>
            <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans leading-relaxed bg-gray-800 rounded-xl p-4 max-h-60 overflow-y-auto">{result.description}</pre>
          </Section>

          {/* Publishing tips */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">⏰ Orario pubblicazione</div>
              <div className="text-white font-semibold">{result.bestTimeToPost}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">📈 Views stimate (48h)</div>
              <div className="font-semibold" style={{ color: ch.color }}>{result.estimatedViews}</div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

// ─── THUMBNAIL PREVIEW (CSS mockup) ─────────────────────────────────────────

function ThumbnailPreview({ tc, color }: { tc: ThumbnailConcept; color: string }) {
  const base: React.CSSProperties = {
    width: "100%", aspectRatio: "16/9", borderRadius: 12, overflow: "hidden",
    position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Impact', 'Anton', sans-serif", userSelect: "none",
  };

  const renderLayout = (layout: ThumbnailLayout) => {
    switch (layout) {
      case "bigtext":
        return (
          <div style={{ ...base, background: tc.bgColor, border: `2px solid ${tc.accentColor}33` }}>
            <div style={{ position: "absolute", top: 8, left: 10, fontSize: 22, lineHeight: 1 }}>{tc.emoji}</div>
            <div style={{ textAlign: "center", padding: "0 12px" }}>
              <div style={{ color: tc.accentColor, fontSize: "clamp(18px,5vw,36px)", fontWeight: 900, lineHeight: 1.05, textTransform: "uppercase", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>{tc.mainText}</div>
              <div style={{ color: tc.textColor, fontSize: "clamp(8px,2vw,13px)", opacity: 0.8, marginTop: 4, letterSpacing: 2 }}>{tc.subText}</div>
            </div>
          </div>
        );
      case "split":
        return (
          <div style={{ ...base, background: tc.bgColor }}>
            <div style={{ position: "absolute", inset: 0, display: "flex" }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>{tc.emoji}</div>
              <div style={{ width: 3, background: tc.accentColor, opacity: 0.8 }} />
              <div style={{ flex: 1, background: tc.bgColor2 || tc.accentColor + "cc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 8 }}>
                <div style={{ color: tc.textColor, fontSize: "clamp(12px,3.5vw,24px)", fontWeight: 900, textAlign: "center", lineHeight: 1.1 }}>{tc.mainText}</div>
                <div style={{ color: tc.textColor, fontSize: "clamp(6px,1.5vw,10px)", opacity: 0.7, marginTop: 4 }}>{tc.subText}</div>
              </div>
            </div>
          </div>
        );
      case "number":
        return (
          <div style={{ ...base, background: tc.bgColor }}>
            <div style={{ position: "absolute", left: "8%", top: "50%", transform: "translateY(-50%)", color: tc.accentColor, fontSize: "clamp(40px,12vw,80px)", fontWeight: 900, lineHeight: 1, textShadow: `0 0 20px ${tc.accentColor}88` }}>5</div>
            <div style={{ position: "absolute", left: "42%", right: "4%", top: "50%", transform: "translateY(-50%)" }}>
              <div style={{ color: tc.textColor, fontSize: "clamp(9px,2.5vw,16px)", fontWeight: 700, lineHeight: 1.2, textTransform: "uppercase" }}>{tc.subText}</div>
            </div>
            <div style={{ position: "absolute", top: 8, right: 10, fontSize: 18 }}>{tc.emoji}</div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: tc.accentColor }} />
          </div>
        );
      case "arrow":
        return (
          <div style={{ ...base, background: tc.bgColor, border: `3px solid #ef4444` }}>
            <div style={{ position: "absolute", top: 8, left: 10, fontSize: 20 }}>{tc.emoji}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px" }}>
              <div style={{ color: tc.textColor, fontSize: "clamp(20px,6vw,42px)", fontWeight: 900 }}>{tc.mainText}</div>
              <div style={{ color: "#ef4444", fontSize: "clamp(20px,6vw,42px)", fontWeight: 900 }}>→</div>
            </div>
            <div style={{ position: "absolute", bottom: 8, right: 10, color: tc.textColor, fontSize: "clamp(6px,1.5vw,11px)", opacity: 0.6 }}>{tc.subText}</div>
          </div>
        );
      case "gradient":
        return (
          <div style={{ ...base, background: `linear-gradient(135deg, ${tc.bgColor} 0%, ${tc.bgColor2 || tc.accentColor + "66"} 100%)` }}>
            <div style={{ textAlign: "center", padding: "0 10px" }}>
              <div style={{ fontSize: 36, marginBottom: 4 }}>{tc.emoji}</div>
              <div style={{ color: tc.textColor, fontSize: "clamp(12px,3.5vw,22px)", fontWeight: 900, lineHeight: 1.1, textShadow: "0 2px 12px rgba(0,0,0,0.9)" }}>{tc.mainText}</div>
              <div style={{ color: tc.textColor, fontSize: "clamp(6px,1.5vw,10px)", opacity: 0.6, marginTop: 4 }}>{tc.subText}</div>
            </div>
          </div>
        );
      case "highlight":
        return (
          <div style={{ ...base, background: tc.bgColor }}>
            <div style={{ position: "absolute", top: 6, left: 8, background: "#ef4444", color: "#fff", fontSize: "clamp(5px,1.2vw,9px)", fontWeight: 700, padding: "2px 6px", borderRadius: 4, letterSpacing: 1 }}>🚨 SHOCK</div>
            <div style={{ position: "absolute", left: "5%", top: "50%", transform: "translateY(-50%)", background: tc.accentColor, borderRadius: 8, padding: "8px 12px", maxWidth: "55%" }}>
              <div style={{ color: tc.bgColor === "#111111" ? "#111" : "#fff", fontSize: "clamp(10px,3vw,20px)", fontWeight: 900, lineHeight: 1.1 }}>{tc.mainText}</div>
            </div>
            <div style={{ position: "absolute", right: "4%", top: "50%", transform: "translateY(-50%)", fontSize: 32 }}>{tc.emoji}</div>
            <div style={{ position: "absolute", bottom: 6, right: 8, color: tc.textColor, fontSize: "clamp(5px,1.2vw,9px)", opacity: 0.5 }}>{tc.subText}</div>
          </div>
        );
      default:
        return (
          <div style={{ ...base, background: tc.bgColor }}>
            <div style={{ color: tc.textColor, fontSize: "clamp(12px,3vw,20px)", fontWeight: 900, padding: "0 12px", textAlign: "center" }}>{tc.mainText}</div>
          </div>
        );
    }
  };

  return (
    <div>
      {renderLayout(tc.layout)}
      {/* CTR score */}
      <div className="flex items-center gap-1 mt-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={10} fill={i < tc.ctrScore ? color : "transparent"} style={{ color }} />
        ))}
        <span className="text-xs text-gray-500 ml-1">CTR potenziale</span>
      </div>
    </div>
  );
}

// ─── THUMBNAIL TAB ───────────────────────────────────────────────────────────

function ThumbnailTab({ channel: ch }: { channel: ChannelData }) {
  const [mode, setMode] = useState<"generate" | "similar">("generate");
  const [input, setInput] = useState("");
  const [concepts, setConcepts] = useState<ThumbnailConcept[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);

  const run = () => {
    if (!input.trim()) return;
    const results = mode === "generate"
      ? generateThumbnailIdeas(input, ch.niche, ch.lang)
      : findSimilarThumbnails(input, ch.niche, ch.lang);
    setConcepts(results);
    setExpanded(null);
  };

  const placeholder = mode === "generate"
    ? `Es: "Fabrizio Corona", "passive income", "fatti corpo umano"`
    : `Es: "sfondo nero, testo rosso grande a sinistra, freccia che punta a destra, emoji shock"`;

  return (
    <div>
      {/* Mode toggle */}
      <div className="flex gap-2 mb-4">
        {(["generate", "similar"] as const).map((m) => (
          <button key={m} onClick={() => { setMode(m); setConcepts([]); setInput(""); }}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all border"
            style={mode === m ? { background: ch.color, color: "#000", borderColor: ch.color } : { color: ch.color, borderColor: ch.color + "44", background: ch.color + "11" }}
          >
            {m === "generate" ? "🎨 Genera idee copertina" : "🔍 Trova simili alla mia"}
          </button>
        ))}
      </div>

      {mode === "similar" && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 mb-4 text-xs text-gray-400">
          💡 Descrivi la tua thumbnail attuale: colori, posizione del testo, emoji usate, stile generale. Il tool genera variazioni e miglioramenti.
        </div>
      )}

      {/* Input */}
      <div className="flex gap-3 mb-5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder={placeholder}
          className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gray-700"
        />
        <button onClick={run} disabled={!input.trim()}
          className="px-5 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 flex items-center gap-2 whitespace-nowrap"
          style={{ background: ch.color, color: "#000" }}
        >
          <ImageIcon size={14} />
          {mode === "generate" ? "Genera" : "Cerca simili"}
        </button>
      </div>

      {/* Results grid */}
      {concepts.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {concepts.map((tc) => (
            <div key={tc.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition-all">
              {/* Mockup */}
              <div className="p-3 pb-0">
                <ThumbnailPreview tc={tc} color={ch.color} />
              </div>

              {/* Info header */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-white">{tc.name}</div>
                  <div className="flex gap-1">
                    {tc.palette.map((c, i) => (
                      <div key={i} className="w-4 h-4 rounded-full border border-gray-700" style={{ background: c }} title={c} />
                    ))}
                  </div>
                </div>

                {/* Why it works */}
                <div className="text-xs text-gray-400 leading-relaxed mb-3">{tc.whyItWorks}</div>

                {/* Expand/collapse Canva steps */}
                <button
                  onClick={() => setExpanded(expanded === tc.id ? null : tc.id)}
                  className="w-full text-xs py-2 rounded-xl border transition-all font-medium flex items-center justify-center gap-1"
                  style={expanded === tc.id
                    ? { background: ch.color, color: "#000", borderColor: ch.color }
                    : { color: ch.color, borderColor: ch.color + "44", background: ch.color + "11" }}
                >
                  {expanded === tc.id ? "▲ Chiudi istruzioni" : "📋 Istruzioni Canva"}
                </button>

                {expanded === tc.id && (
                  <div className="mt-3 space-y-1.5">
                    {tc.canvaSteps.map((step, i) => (
                      <div key={i} className="flex gap-2">
                        <div className="w-5 h-5 rounded-full text-xs flex items-center justify-center flex-shrink-0 font-bold mt-0.5" style={{ background: ch.color + "33", color: ch.color }}>{i + 1}</div>
                        <div className="text-xs text-gray-300 leading-relaxed">{step}</div>
                      </div>
                    ))}
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      {tc.palette.map((c, i) => (
                        <button key={i} onClick={() => navigator.clipboard.writeText(c)}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg hover:opacity-80 transition-opacity font-mono"
                          style={{ background: c + "33", color: c, border: `1px solid ${c}44` }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TITLE GENERATOR TAB ────────────────────────────────────────────────────

function TitlesTab({ channel: ch }: { channel: ChannelData }) {
  const [keyword, setKeyword] = useState("");
  const [titleIdeas, setTitleIdeas] = useState<any[]>([]);
  const [loadingTitles, setLoadingTitles] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoPackage, setSeoPackage] = useState<any>(null);
  const [loadingSeo, setLoadingSeo] = useState(false);
  const [activeTab, setActiveTab] = useState<"titles" | "seo" | "thumb">("titles");

  const genTitles = async () => {
    if (!keyword.trim()) return;
    setLoadingTitles(true);
    try { setTitleIdeas(await generateTitleIdeas(keyword, ch.niche, ch.lang)); } catch {}
    setLoadingTitles(false);
  };

  const genSEO = async () => {
    if (!seoTitle.trim()) return;
    setLoadingSeo(true);
    try { setSeoPackage(await generateSEOPackage(seoTitle, ch.niche, ch.lang)); } catch {}
    setLoadingSeo(false);
  };

  const TABS = [
    { id: "titles", label: "🎯 Titoli" },
    { id: "seo",    label: "🔍 SEO" },
    { id: "thumb",  label: "🖼 Copertine" },
  ] as const;

  return (
    <div>
      <div className="flex gap-2 mb-5">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all border"
            style={activeTab === t.id
              ? { background: ch.color, color: "#000", borderColor: ch.color }
              : { color: ch.color, borderColor: ch.color + "44", background: ch.color + "11" }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TITOLI ── */}
      {activeTab === "titles" && (
        <div>
          <div className="flex gap-3 mb-4">
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && genTitles()}
              placeholder={`Es: "Fabrizio Corona", "passive income 2024", "cervello umano"`}
              className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gray-700"
            />
            <button onClick={genTitles} disabled={loadingTitles || !keyword.trim()}
              className="px-5 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 flex items-center gap-2"
              style={{ background: ch.color, color: "#000" }}
            >
              {loadingTitles ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Zap size={14} />}
              {loadingTitles ? "…" : "Genera"}
            </button>
          </div>

          {titleIdeas.length > 0 && (
            <div className="space-y-2">
              {titleIdeas.map((idea, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: ANGLE_COLORS[idea.angle] + "22", color: ANGLE_COLORS[idea.angle] }}>{idea.angle}</span>
                        {i === 0 && <span className="text-xs text-yellow-400">⭐ Top pick</span>}
                      </div>
                      <div className="text-white text-sm font-semibold mb-1">{idea.title}</div>
                      <div className="text-xs text-gray-500 leading-relaxed italic">Hook: {idea.hook}</div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <CopyButton text={idea.title} />
                      <button onClick={() => { setSeoTitle(idea.title); setActiveTab("seo"); }}
                        className="text-gray-600 hover:text-white p-1 rounded transition-colors" title="Ottimizza SEO">
                        <Search size={12} />
                      </button>
                      <button onClick={() => { setKeyword(idea.title); setActiveTab("thumb"); }}
                        className="text-gray-600 hover:text-white p-1 rounded transition-colors" title="Genera copertina">
                        <ImageIcon size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SEO ── */}
      {activeTab === "seo" && (
        <div>
          <div className="flex gap-3 mb-4">
            <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && genSEO()}
              placeholder="Incolla un titolo da ottimizzare…"
              className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gray-700"
            />
            <button onClick={genSEO} disabled={loadingSeo || !seoTitle.trim()}
              className="px-5 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 flex items-center gap-2"
              style={{ background: ch.color, color: "#000" }}
            >
              {loadingSeo ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Search size={14} />}
              {loadingSeo ? "…" : "Ottimizza"}
            </button>
          </div>

          {seoPackage && (
            <div className="space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex justify-between mb-2">
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Titolo ottimizzato</div>
                  <CopyButton text={seoPackage.optimizedTitle} label="Copia" />
                </div>
                <div className="text-white font-semibold">{seoPackage.optimizedTitle}</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex justify-between mb-2">
                  <div className="text-xs text-gray-400 uppercase tracking-wide">Descrizione completa</div>
                  <CopyButton text={seoPackage.description} label="Copia" />
                </div>
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed max-h-52 overflow-y-auto">{seoPackage.description}</pre>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex justify-between mb-3">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Tags</div>
                    <CopyButton text={seoPackage.tags.join(", ")} label="Copia" />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {seoPackage.tags.map((t: string, i: number) => <span key={i} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">{t}</span>)}
                  </div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex justify-between mb-3">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Hashtags</div>
                    <CopyButton text={seoPackage.hashtags.join(" ")} label="Copia" />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {seoPackage.hashtags.map((h: string, i: number) => <span key={i} className="text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded">{h}</span>)}
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Concept Thumbnail</div>
                <div className="text-sm text-gray-300">{seoPackage.thumbnailConcept}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── COPERTINE ── */}
      {activeTab === "thumb" && <ThumbnailTab channel={ch} />}
    </div>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

interface Props {
  channel: ChannelData;
}

export default function Strategist({ channel: ch }: Props) {
  const [mainTab, setMainTab] = useState<"breakdown" | "titles">("breakdown");

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
          <Lightbulb size={18} className="text-yellow-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Content Strategist</h1>
          <p className="text-gray-400 text-sm">{ch.title || ch.label} · {ch.niche}</p>
        </div>
      </div>

      {/* Main tabs */}
      <div className="flex gap-1 mb-6 bg-gray-900 p-1 rounded-2xl w-fit border border-gray-800">
        <button
          onClick={() => setMainTab("breakdown")}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${mainTab === "breakdown" ? "text-black" : "text-gray-400 hover:text-white"}`}
          style={mainTab === "breakdown" ? { background: ch.color } : {}}
        >
          <Sparkles size={14} />
          Full Breakdown
        </button>
        <button
          onClick={() => setMainTab("titles")}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${mainTab === "titles" ? "text-black" : "text-gray-400 hover:text-white"}`}
          style={mainTab === "titles" ? { background: ch.color } : {}}
        >
          <Zap size={14} />
          Titoli & SEO
        </button>
      </div>

      {mainTab === "breakdown" && <FullBreakdownTab channel={ch} />}
      {mainTab === "titles" && <TitlesTab channel={ch} />}
    </div>
  );
}
