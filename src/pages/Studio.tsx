import { useState, useRef, useEffect } from "react";
import {
  Wand2, Mic, Film, Download, ChevronRight, ChevronLeft,
  Play, Pause, Check, Loader, Sparkles, Search, X, AlertCircle,
  Key,
} from "lucide-react";

const SERVER = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Segment {
  text: string;
  keyword: string;
  emotion: string;
}

interface ScriptData {
  hook: string;
  segments: Segment[];
  cta: string;
  fullScript: string;
}

interface Voice {
  id: string;
  name: string;
  previewUrl: string;
  labels: Record<string, string>;
}

interface BRollClip {
  download: string;
  preview: string;
  thumbnail: string;
  width: number;
  height: number;
  duration: number;
  source: string;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const STYLES = [
  { id: "progetto_happiness", label: "Progetto Happiness", emoji: "💛", desc: "Emotivo, crescita personale, storytelling" },
  { id: "michele_mortain",    label: "Michele Mortain",    emoji: "⚡", desc: "Punchy, fatti veloci, numeri shock" },
  { id: "bestie",             label: "Bestie / Facts",     emoji: "🤯", desc: "Listicle rapido, curiosità virale" },
  { id: "money",              label: "Money Craft",        emoji: "💰", desc: "Finance en, fear + solution" },
  { id: "custom",             label: "Stile Custom",       emoji: "✏️", desc: "Descrivi tu il tono" },
];

const DURATIONS = [
  { label: "30s", value: 30 },
  { label: "45s", value: 45 },
  { label: "60s", value: 60 },
  { label: "90s", value: 90 },
];

const STEPS = [
  { icon: Wand2, label: "Script" },
  { icon: Mic,   label: "Voiceover" },
  { icon: Film,  label: "B-Roll" },
  { icon: Download, label: "Export" },
];

// ─── STEP BAR ─────────────────────────────────────────────────────────────────

function StepBar({ step, maxStep, onStep }: { step: number; maxStep: number; onStep: (i: number) => void }) {
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const done = i < step;
        const active = i === step;
        const reachable = i <= maxStep;
        return (
          <div key={i} className="flex items-center">
            <button
              onClick={() => reachable && onStep(i)}
              disabled={!reachable}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                active ? "bg-purple-600 text-white" : done ? "text-green-400 hover:bg-gray-800" : reachable ? "text-gray-400 hover:bg-gray-800" : "text-gray-600 cursor-not-allowed"
              }`}>
              {done ? <Check size={13} /> : <Icon size={13} />}
              {s.label}
            </button>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-px mx-1 ${i < step ? "bg-green-500" : "bg-gray-700"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── PHASE 1: SCRIPT ─────────────────────────────────────────────────────────

function ScriptPhase({ onDone, brollFetching, existing }: { onDone: (d: ScriptData) => void; brollFetching?: boolean; existing?: ScriptData | null }) {
  // Seed da "Big Ideas" (Trending → Crea nel Video Studio)
  const [idea, setIdea] = useState(() => {
    const seed = typeof localStorage !== "undefined" ? localStorage.getItem("studio_seed_idea") : null;
    if (seed) localStorage.removeItem("studio_seed_idea");
    return seed || "";
  });
  const [style, setStyle] = useState("progetto_happiness");
  const [customStyle, setCustomStyle] = useState("");
  const [facts, setFacts] = useState("");
  const [duration, setDuration] = useState(45);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ScriptData | null>(existing || null);

  const generate = async () => {
    if (!idea.trim()) return;
    setLoading(true); setError("");
    try {
      const r = await fetch(`${SERVER}/api/studio/script`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, style, customStyle, targetDuration: duration, facts }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setResult(data);
    } catch (e) { setError(e instanceof Error ? e.message : "Errore"); }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Idea del video</label>
          <textarea value={idea} onChange={e => setIdea(e.target.value)} rows={4}
            placeholder="Es: Come uscire dalla trappola finanziaria dei 20 anni..."
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 resize-none" />
        </div>

        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-2">
            Fatti / punti chiave <span className="text-[10px] text-amber-400 normal-case">consigliato per temi informativi</span>
          </label>
          <textarea value={facts} onChange={e => setFacts(e.target.value)} rows={4}
            placeholder="Incolla qui i fatti VERI (es. sui coccodrilli). L'AI scriverà lo script SOLO su questi, senza inventare. Lascia vuoto per farli generare all'AI (rischio imprecisioni)."
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500 resize-none" />
        </div>

        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Stile canale virale</label>
          <div className="space-y-1.5">
            {STYLES.map(s => (
              <button key={s.id} onClick={() => setStyle(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all border ${
                  style === s.id ? "border-purple-500 bg-purple-500/10" : "border-gray-800 hover:border-gray-600"
                }`}>
                <span>{s.emoji}</span>
                <div>
                  <div className="text-sm font-medium text-white">{s.label}</div>
                  <div className="text-xs text-gray-500">{s.desc}</div>
                </div>
              </button>
            ))}
          </div>
          {style === "custom" && (
            <textarea value={customStyle} onChange={e => setCustomStyle(e.target.value)} rows={2}
              placeholder="Descrivi il tono: es. 'Informale, usa ironia, molte domande retoriche...'"
              className="w-full mt-2 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 resize-none" />
          )}
        </div>

        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Durata target</label>
          <div className="flex gap-2">
            {DURATIONS.map(d => (
              <button key={d.value} onClick={() => setDuration(d.value)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  duration === d.value ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
                }`}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="text-red-400 text-sm flex items-center gap-2"><AlertCircle size={13} />{error}</div>}

        <button onClick={generate} disabled={loading || !idea.trim()}
          className="w-full py-3 rounded-xl font-semibold bg-purple-600 text-white disabled:opacity-40 flex items-center justify-center gap-2">
          {loading ? <Loader size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {loading ? "Generando script..." : "Genera Script con AI"}
        </button>
      </div>

      <div>
        {result ? (
          <div className="space-y-3">
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <div className="text-xs text-purple-400 uppercase tracking-wider mb-1">Hook</div>
              <div className="text-white font-medium">"{result.hook}"</div>
            </div>
            <div className="text-xs text-gray-500 px-1">{result.segments.length} segmenti · ~{result.segments.length * 2}s</div>
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {result.segments.map((seg, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 flex gap-3">
                  <div className="text-gray-600 text-xs w-5 flex-shrink-0 pt-0.5">{i + 1}</div>
                  <div>
                    <div className="text-sm text-white">{seg.text}</div>
                    <div className="text-xs text-gray-600 mt-0.5">🎬 {seg.keyword}</div>
                  </div>
                </div>
              ))}
            </div>
            {brollFetching && (
              <div className="flex items-center gap-2 text-purple-400 text-xs bg-purple-500/10 border border-purple-500/20 rounded-xl px-3 py-2">
                <Loader size={11} className="animate-spin flex-shrink-0" />
                Sto cercando B-roll in background per ogni segmento…
              </div>
            )}
            <button onClick={() => onDone(result)}
              className="w-full py-3 rounded-xl font-semibold bg-green-600 text-white flex items-center justify-center gap-2">
              <ChevronRight size={14} /> Vai al Voiceover
            </button>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-800 rounded-2xl min-h-64">
            <div className="text-center text-gray-600">
              <Wand2 size={32} className="mx-auto mb-3 opacity-30" />
              <div className="text-sm">Lo script apparirà qui</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PHASE 2: VOICEOVER ───────────────────────────────────────────────────────

function VoiceoverPhase({ script, onDone, onBack }: {
  script: ScriptData;
  onDone: (url: string, filename: string) => void;
  onBack: () => void;
}) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(true);
  const [voiceError, setVoiceError] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [stability, setStability] = useState(0.5);
  const [speed, setSpeed] = useState(1.0);
  const [generating, setGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [audioFilename, setAudioFilename] = useState("");
  const [error, setError] = useState("");
  const [previewVoice, setPreviewVoice] = useState<string | null>(null);
  const previewRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch(`${SERVER}/api/studio/voices`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) { setVoices(data); if (data[0]) setSelectedVoice(data[0].id); }
        else setVoiceError(data.error || "Errore caricamento voci");
        setLoadingVoices(false);
      })
      .catch(() => { setVoiceError("Connessione al server fallita"); setLoadingVoices(false); });
  }, []);

  const playPreview = (url: string, id: string) => {
    if (previewVoice === id) { previewRef.current?.pause(); setPreviewVoice(null); return; }
    previewRef.current?.pause();
    const a = new Audio(url); previewRef.current = a;
    a.play(); setPreviewVoice(id);
    a.onended = () => setPreviewVoice(null);
  };

  const generate = async () => {
    if (!selectedVoice) return;
    setGenerating(true); setError("");
    try {
      const r = await fetch(`${SERVER}/api/studio/voiceover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: script.fullScript, voiceId: selectedVoice, stability, speed }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setAudioUrl(data.url); setAudioFilename(data.filename);
    } catch (e) { setError(e instanceof Error ? e.message : "Errore"); }
    setGenerating(false);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-3">Scegli la voce</div>
          {loadingVoices ? (
            <div className="flex items-center gap-2 text-gray-500 text-sm"><Loader size={13} className="animate-spin" /> Caricamento voci...</div>
          ) : voiceError ? (
            <div className="text-red-400 text-sm flex items-center gap-2"><AlertCircle size={13} />{voiceError}</div>
          ) : (
            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
              {voices.map(v => (
                <button key={v.id} onClick={() => setSelectedVoice(v.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all border text-left ${
                    selectedVoice === v.id ? "border-purple-500 bg-purple-500/10" : "border-gray-800 hover:border-gray-600"
                  }`}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">{v.name}</div>
                    {(v.labels.accent || v.labels.gender) && (
                      <div className="text-xs text-gray-500">{[v.labels.accent, v.labels.gender].filter(Boolean).join(" · ")}</div>
                    )}
                  </div>
                  {v.previewUrl && (
                    <button onClick={e => { e.stopPropagation(); playPreview(v.previewUrl, v.id); }}
                      className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 flex-shrink-0">
                      {previewVoice === v.id ? <Pause size={9} /> : <Play size={9} />}
                    </button>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Stabilità: {stability.toFixed(1)}</label>
            <input type="range" min="0" max="1" step="0.1" value={stability} onChange={e => setStability(+e.target.value)}
              className="w-full accent-purple-500" />
            <div className="flex justify-between text-xs text-gray-600 mt-1"><span>Variabile</span><span>Stabile</span></div>
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Velocità: {speed.toFixed(2)}x</label>
            <input type="range" min="0.7" max="1.3" step="0.05" value={speed} onChange={e => setSpeed(+e.target.value)}
              className="w-full accent-purple-500" />
            <div className="flex justify-between text-xs text-gray-600 mt-1"><span>Lento</span><span>Veloce</span></div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
            <div className="text-xs text-gray-500 mb-1.5">Script completo ({script.fullScript.length} caratteri)</div>
            <div className="text-xs text-gray-400 leading-relaxed max-h-24 overflow-y-auto">{script.fullScript}</div>
          </div>
          {error && <div className="text-red-400 text-sm flex items-center gap-2"><AlertCircle size={13} />{error}</div>}
          <button onClick={generate} disabled={generating || !selectedVoice}
            className="w-full py-3 rounded-xl font-semibold bg-purple-600 text-white disabled:opacity-40 flex items-center justify-center gap-2">
            {generating ? <Loader size={14} className="animate-spin" /> : <Mic size={14} />}
            {generating ? "Generando voiceover..." : "Genera Voiceover"}
          </button>
        </div>
      </div>

      {audioUrl && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-green-400 text-sm font-medium"><Check size={13} /> Voiceover pronto!</div>
          <audio controls src={audioUrl} className="w-full h-10" />
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="px-5 py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white flex items-center gap-2 text-sm">
          <ChevronLeft size={14} /> Indietro
        </button>
        <button onClick={() => onDone(audioUrl, audioFilename)} disabled={!audioUrl}
          className="flex-1 py-3 rounded-xl font-semibold bg-green-600 text-white disabled:opacity-40 flex items-center justify-center gap-2 text-sm">
          <ChevronRight size={14} /> Vai al B-Roll
        </button>
      </div>
    </div>
  );
}

// ─── PHASE 3: B-ROLL ─────────────────────────────────────────────────────────

function BRollPhase({ script, onDone, onBack, initialAssignments, initialLoading }: {
  script: ScriptData;
  onDone: (a: Record<number, BRollClip>) => void;
  onBack: () => void;
  initialAssignments: Record<number, BRollClip>;
  initialLoading: Set<number>;
}) {
  const [assignments, setAssignments] = useState<Record<number, BRollClip>>(initialAssignments);
  const [loadingIdx, setLoadingIdx] = useState<Set<number>>(initialLoading);
  const [progress, setProgress] = useState(0);
  const [autoLoading, setAutoLoading] = useState(false);
  const [swap, setSwap] = useState<{ idx: number; results: BRollClip[] } | null>(null);
  const [swapQuery, setSwapQuery] = useState("");
  const [swapLoading, setSwapLoading] = useState(false);
  const [swapMode, setSwapMode] = useState<"online" | "library">("online");
  const [libResults, setLibResults] = useState<BRollClip[]>([]);

  // Normalizza un asset della libreria Content Hub in BRollClip
  const libToClip = (a: { url: string; thumbnail: string; width: number; height: number; duration: number; type: string }): BRollClip => ({
    download: a.url, preview: a.url, thumbnail: a.thumbnail,
    width: a.width || 1080, height: a.height || 1920, duration: a.duration || 0,
    source: a.type === "image" ? "library-img" : "library",
  });

  const searchLibrary = async (q: string) => {
    setSwapLoading(true);
    try {
      const r = await fetch(`${SERVER}/api/hub/library?q=${encodeURIComponent(q)}`);
      const data = await r.json();
      setLibResults((data.results || []).map(libToClip));
    } catch { setLibResults([]); }
    setSwapLoading(false);
  };

  // Sync incoming updates from background prefetch while this phase is active
  useEffect(() => {
    setAssignments(initialAssignments);
  }, [initialAssignments]);

  useEffect(() => {
    setLoadingIdx(initialLoading);
  }, [initialLoading]);

  const searchClip = async (keyword: string): Promise<BRollClip | null> => {
    try {
      const r = await fetch(`${SERVER}/api/broll/search?q=${encodeURIComponent(keyword)}&orientation=portrait&source=pexels&page=1`);
      const data = await r.json();
      return (data.results || [])[0] || null;
    } catch { return null; }
  };

  const autoAssign = async () => {
    setAutoLoading(true); setProgress(0);
    const next = { ...assignments };
    for (let i = 0; i < script.segments.length; i++) {
      setLoadingIdx(prev => new Set([...prev, i]));
      const clip = await searchClip(script.segments[i].keyword);
      if (clip) next[i] = clip;
      setAssignments({ ...next });
      setLoadingIdx(prev => { const s = new Set(prev); s.delete(i); return s; });
      setProgress(Math.round(((i + 1) / script.segments.length) * 100));
      await new Promise(r => setTimeout(r, 150));
    }
    setAutoLoading(false);
  };

  const openSwap = async (idx: number) => {
    setSwap({ idx, results: [] });
    setSwapMode("online");
    setLibResults([]);
    const kw = script.segments[idx].keyword;
    setSwapQuery(kw);
    setSwapLoading(true);
    // carica in parallelo: online + libreria (per il matching col Content Hub)
    searchLibrary(kw);
    try {
      const r = await fetch(`${SERVER}/api/broll/search?q=${encodeURIComponent(kw)}&orientation=portrait&source=pexels&page=1`);
      const data = await r.json();
      setSwap({ idx, results: data.results || [] });
    } catch {}
    setSwapLoading(false);
  };

  const doSwapSearch = async () => {
    if (!swap || !swapQuery.trim()) return;
    if (swapMode === "library") { searchLibrary(swapQuery); return; }
    setSwapLoading(true);
    try {
      const r = await fetch(`${SERVER}/api/broll/search?q=${encodeURIComponent(swapQuery)}&orientation=portrait&source=pexels&page=1`);
      const data = await r.json();
      setSwap({ idx: swap.idx, results: data.results || [] });
    } catch {}
    setSwapLoading(false);
  };

  const assigned = Object.keys(assignments).length;
  const total = script.segments.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white font-semibold flex items-center gap-2">
            {total} segmenti · {assigned}/{total} clip
            {loadingIdx.size > 0 && !autoLoading && (
              <span className="text-xs text-purple-400 flex items-center gap-1">
                <Loader size={10} className="animate-spin" /> prefetch...
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">~2s per clip · orientamento verticale 9:16</div>
        </div>
        <button onClick={autoAssign} disabled={autoLoading || loadingIdx.size > 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium disabled:opacity-50">
          {autoLoading ? <Loader size={13} className="animate-spin" /> : <Sparkles size={13} />}
          {autoLoading ? `${progress}%` : "Ri-cerca tutto"}
        </button>
      </div>

      {autoLoading && (
        <div className="w-full bg-gray-800 rounded-full h-1">
          <div className="bg-purple-500 h-1 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
        {script.segments.map((seg, i) => {
          const clip = assignments[i];
          const isLoading = loadingIdx.has(i);
          return (
            <div key={i} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5">
              <div className="text-gray-600 text-xs w-5 flex-shrink-0">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate">{seg.text}</div>
                <div className="text-xs text-gray-600 mt-0.5">🔍 {seg.keyword}</div>
              </div>
              {isLoading ? (
                <div className="w-16 h-10 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <Loader size={11} className="animate-spin text-gray-500" />
                </div>
              ) : clip ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <video src={clip.preview} className="w-16 h-10 object-cover rounded-lg" muted />
                  <button onClick={() => openSwap(i)} className="text-xs text-gray-500 hover:text-white px-2 py-1 rounded hover:bg-gray-800">
                    Cambia
                  </button>
                </div>
              ) : (
                <button onClick={() => openSwap(i)}
                  className="flex-shrink-0 text-xs text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded-lg hover:bg-purple-500/10">
                  + Cerca
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Swap modal */}
      {swap && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6" onClick={() => setSwap(null)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg p-5 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="font-semibold text-white">Cambia clip — segmento {swap.idx + 1}</div>
              <button onClick={() => setSwap(null)} className="text-gray-500 hover:text-white"><X size={15} /></button>
            </div>

            {/* Tab: online / libreria Content Hub */}
            <div className="flex gap-1 p-1 bg-gray-800 rounded-lg w-fit">
              {([
                { id: "online" as const, label: "Cerca online" },
                { id: "library" as const, label: `Libreria${libResults.length ? ` (${libResults.length})` : ""}` },
              ]).map(t => (
                <button key={t.id} onClick={() => { setSwapMode(t.id); if (t.id === "library" && libResults.length === 0) searchLibrary(swapQuery); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    swapMode === t.id ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input value={swapQuery} onChange={e => setSwapQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && doSwapSearch()}
                placeholder={swapMode === "library" ? "Cerca nei tuoi asset salvati..." : "Cerca b-roll online..."}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500" />
              <button onClick={doSwapSearch} disabled={swapLoading}
                className="px-3 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 disabled:opacity-50">
                {swapLoading ? <Loader size={13} className="animate-spin" /> : <Search size={13} />}
              </button>
            </div>

            {(() => {
              const items = swapMode === "library" ? libResults : swap.results;
              return (
                <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto">
                  {items.slice(0, 12).map((clip, ci) => (
                    <button key={ci} onClick={() => { setAssignments(prev => ({ ...prev, [swap.idx]: clip })); setSwap(null); }}
                      className="rounded-xl overflow-hidden border-2 border-transparent hover:border-purple-500 transition-all aspect-video bg-gray-950">
                      {clip.source === "library-img"
                        ? <img src={clip.thumbnail} className="w-full h-full object-cover" alt="" />
                        : <video src={clip.preview} className="w-full h-full object-cover" muted />}
                    </button>
                  ))}
                  {!swapLoading && items.length === 0 && (
                    <div className="col-span-3 text-center text-gray-600 text-sm py-4">
                      {swapMode === "library" ? "Nessun asset in libreria per questa keyword. Salvane dal Content Hub." : "Nessun risultato"}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button onClick={onBack} className="px-5 py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white flex items-center gap-2 text-sm">
          <ChevronLeft size={14} /> Indietro
        </button>
        <button onClick={() => onDone(assignments)} disabled={assigned === 0}
          className="flex-1 py-3 rounded-xl font-semibold bg-green-600 text-white disabled:opacity-40 flex items-center justify-center gap-2 text-sm">
          <ChevronRight size={14} /> Vai all'Export ({assigned}/{total})
        </button>
      </div>
    </div>
  );
}

// ─── PHASE 4: EXPORT ─────────────────────────────────────────────────────────

const CAPTION_COLORS = [
  { id: "viral",  label: "Bianco",  swatch: "#ffffff" },
  { id: "yellow", label: "Giallo",  swatch: "#ffd400" },
];

const CAPTION_POSITIONS = [
  { id: "top",    label: "Alto" },
  { id: "center", label: "Centro" },
  { id: "bottom", label: "Basso" },
];

const CAPTION_FONTS = [
  { id: "Montserrat",   label: "Montserrat", css: "'Montserrat', sans-serif" },
  { id: "Helvetica",    label: "Helvetica",  css: "'Helvetica Neue', Helvetica, sans-serif" },
  { id: "BebasNeue",    label: "Bebas Neue", css: "'Bebas Neue', sans-serif" },
  { id: "Anton",        label: "Anton",      css: "'Anton', sans-serif" },
  { id: "ArchivoBlack", label: "Archivo",    css: "'Archivo Black', sans-serif" },
  { id: "Poppins",      label: "Poppins",    css: "'Poppins', sans-serif" },
];

const CAPTION_EFFECTS = [
  { id: "none",    label: "Nessuno" },
  { id: "pop",     label: "Pop" },
  { id: "fade",    label: "Fade" },
  { id: "shake",   label: "Shake" },
  { id: "bounce",  label: "Bounce" },
  { id: "zoom",    label: "Zoom" },
  { id: "tilt",    label: "Tilt" },
  { id: "glow",    label: "Glow" },
  { id: "slidein", label: "Slide" },
];

const WORDS_OPTIONS = [
  { value: 0, label: "Frase" },
  { value: 1, label: "1 parola" },
  { value: 2, label: "2 parole" },
  { value: 3, label: "3 parole" },
];

const CLIP_ANIMATIONS = [
  { id: "none",     label: "Statico" },
  { id: "zoomin",   label: "Zoom in" },
  { id: "zoomout",  label: "Zoom out" },
  { id: "kenburns", label: "Ken Burns" },
  { id: "panleft",  label: "Pan ←" },
  { id: "panright", label: "Pan →" },
  { id: "panup",    label: "Pan ↑" },
  { id: "pulse",    label: "Pulse" },
  { id: "shake",    label: "Shake" },
];

// Template pronti: combinazioni preimpostate di tutti i parametri caption
const CAPTION_TEMPLATES = [
  { id: "hormozi", label: "🔥 Hormozi",  font: "Montserrat",   style: "viral",  position: "center", words: 3, effect: "pop",   highlight: true },
  { id: "tiktok",  label: "🎵 TikTok",   font: "Poppins",      style: "viral",  position: "center", words: 1, effect: "pop",   highlight: true },
  { id: "bestie",  label: "🤯 Bestie",   font: "Anton",        style: "yellow", position: "center", words: 2, effect: "shake", highlight: true },
  { id: "minimal", label: "✨ Minimal",  font: "Helvetica",    style: "viral",  position: "bottom", words: 0, effect: "fade",  highlight: false },
  { id: "impact",  label: "💥 Impact",   font: "ArchivoBlack", style: "viral",  position: "bottom", words: 2, effect: "pop",   highlight: true },
];

// Replica della logica server-side per la preview delle parole evidenziate
const PREVIEW_STOPWORDS = new Set(["della","delle","degli","dello","questo","questa","questi","queste","essere","avere","fare","come","quando","perché","anche","molto","tutto","tutti","sono","siamo","siete","hanno","abbiamo","loro","nostro","vostro","cosa","così","dopo","prima","sempre","ancora","adesso","quindi","allora","invece","ogni","alcuni","stesso","senza","sopra","sotto","verso","contro"]);
function previewHighlights(text: string): Set<string> {
  const words = text.split(/\s+/);
  const hl = new Set<string>();
  for (const w of words) {
    const clean = w.replace(/[.,!?;:'"]/g, "");
    if (/\d/.test(clean) || /[€$%]/.test(clean)) hl.add(w);
    else if (clean.length > 3 && clean === clean.toUpperCase()) hl.add(w);
  }
  if (hl.size === 0) {
    const candidate = [...words].sort((a, b) => b.length - a.length)
      .find(w => !PREVIEW_STOPWORDS.has(w.toLowerCase().replace(/[.,!?;:'"]/g, "")));
    if (candidate && candidate.length > 5) hl.add(candidate);
  }
  return hl;
}

function ExportPhase({ script, voiceoverFile, assignments, onBack }: {
  script: ScriptData;
  voiceoverFile: string;
  assignments: Record<number, BRollClip>;
  onBack: () => void;
}) {
  const [exporting, setExporting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [savedTo, setSavedTo] = useState("");
  const [exportFilename, setExportFilename] = useState("");
  const [queuedTo, setQueuedTo] = useState<string[]>([]);
  const [error, setError] = useState("");

  const sendToQueue = async (chId: string) => {
    if (!exportFilename) return;
    try {
      const r = await fetch(`${SERVER}/api/studio/to-queue`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: exportFilename, channel: chId, title: script.hook || script.segments[0]?.text || "Video" }),
      });
      if (r.ok) setQueuedTo(prev => [...prev, chId]);
    } catch {}
  };
  const [progress, setProgress] = useState(0);
  const [captions, setCaptions] = useState(true);
  const [captionStyle, setCaptionStyle] = useState("viral");
  const [captionPosition, setCaptionPosition] = useState("bottom");
  const [captionFont, setCaptionFont] = useState("Montserrat");
  const [highlightWords, setHighlightWords] = useState(true);
  const [wordsPerCaption, setWordsPerCaption] = useState(0);
  const [captionEffect, setCaptionEffect] = useState("none");
  const [clipAnimation, setClipAnimation] = useState("zoomin");
  const [activeTemplate, setActiveTemplate] = useState("");
  const [previewIdx, setPreviewIdx] = useState(0);
  // Musica
  const [musicList, setMusicList] = useState<{ filename: string; name: string }[]>([]);
  const [musicFile, setMusicFile] = useState("");
  // Transizioni
  const [transitionsOn, setTransitionsOn] = useState(false);
  const [transPrompt, setTransPrompt] = useState("");
  const [transPlan, setTransPlan] = useState<{ transition: string; sfx: string | null }[] | null>(null);
  const [transLoading, setTransLoading] = useState(false);
  const [transError, setTransError] = useState("");

  useEffect(() => {
    fetch(`${SERVER}/api/studio/music`).then(r => r.json())
      .then(d => Array.isArray(d) && setMusicList(d)).catch(() => {});
  }, []);

  const applyTemplate = (t: typeof CAPTION_TEMPLATES[number]) => {
    setActiveTemplate(t.id);
    setCaptionFont(t.font);
    setCaptionStyle(t.style);
    setCaptionPosition(t.position);
    setWordsPerCaption(t.words);
    setCaptionEffect(t.effect);
    setHighlightWords(t.highlight);
    setCaptions(true);
  };

  const numCuts = Math.max(0, Object.keys(assignments).length - 1);
  const generateTransitionPlan = async () => {
    if (!transPrompt.trim() || numCuts === 0) return;
    setTransLoading(true); setTransError("");
    try {
      const r = await fetch(`${SERVER}/api/studio/transition-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: transPrompt, numCuts }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setTransPlan(data.plan);
    } catch (e) { setTransError(e instanceof Error ? e.message : "Errore"); }
    setTransLoading(false);
  };

  const firstClip = assignments[previewIdx] || Object.values(assignments)[0];
  const previewText = script.segments[previewIdx]?.text || script.hook;
  const previewWords = previewText.split(/\s+/).filter(Boolean);
  const previewGroup = wordsPerCaption > 0 ? previewWords.slice(0, wordsPerCaption) : previewWords;
  const highlights = highlightWords ? previewHighlights(previewText) : new Set<string>();
  const textColor = captionStyle === "yellow" ? "#ffd400" : "#ffffff";
  const hlColor = captionStyle === "yellow" ? "#ffffff" : "#ffd400";
  const fontCss = CAPTION_FONTS.find(f => f.id === captionFont)?.css || "sans-serif";
  const previewFontSize = wordsPerCaption === 1 ? 26 : wordsPerCaption === 2 ? 22 : wordsPerCaption === 3 ? 19 : 17;
  const fxClass = captionEffect && captionEffect !== "none" ? `cap-${captionEffect}` : "";

  const doExport = async () => {
    setExporting(true); setError(""); setProgress(0);
    const segments = script.segments.map((seg, i) => ({
      text: seg.text,
      duration: 2.0,
      clipUrl: assignments[i]?.download || "",
      isImage: (assignments[i]?.source || "").includes("img"),
    })).filter(s => s.clipUrl);

    try {
      const r = await fetch(`${SERVER}/api/studio/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segments, voiceoverFile, captions, captionStyle, captionPosition, captionFont,
          highlightWords, wordsPerCaption, captionEffect, clipAnimation,
          musicFile: musicFile || null,
          transitions: transitionsOn && transPlan ? transPlan : null,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      // L'export gira in background come job: faccio polling (ma puoi anche cambiare tab,
      // la barra globale in alto continua a mostrarlo).
      const jobId = data.jobId;
      const poll = setInterval(async () => {
        try {
          const jr = await fetch(`${SERVER}/api/jobs/${jobId}`);
          const job = await jr.json();
          setProgress(job.progress || 0);
          if (job.status === "done") {
            clearInterval(poll);
            setProgress(100);
            setDownloadUrl(job.result.url);
            setStreamUrl(job.result.streamUrl || "");
            setSavedTo(job.result.savedTo || "");
            setExportFilename(job.result.filename || "");
            setExporting(false);
          } else if (job.status === "error") {
            clearInterval(poll);
            setError(job.error || "Errore export");
            setExporting(false);
          }
        } catch {}
      }, 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore export");
      setExporting(false);
    }
  };

  // Dopo l'export: player video + download
  if (downloadUrl) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center gap-2 text-green-400 text-sm font-medium justify-center">
          <Check size={14} /> Video esportato!
        </div>
        {streamUrl && (
          <div className="rounded-2xl overflow-hidden border border-gray-800 bg-black mx-auto" style={{ maxWidth: 280 }}>
            <video src={streamUrl} controls className="w-full aspect-[9/16] object-contain" />
          </div>
        )}
        {savedTo && (
          <div className="text-xs text-gray-500 text-center">💾 Backup salvato in: <span className="text-gray-400">{savedTo.replace("/Users/tonyvalentinogallitto/", "~/")}</span></div>
        )}
        <a href={downloadUrl} download
          className="w-full py-4 rounded-xl font-bold bg-green-600 text-white flex items-center justify-center gap-2 hover:bg-green-500 transition-all">
          <Download size={16} /> Scarica Video MP4
        </a>

        {/* Aggiungi alla coda di un canale */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-3.5">
          <div className="text-xs text-gray-400 mb-2.5 text-center">Aggiungi alla coda di un canale</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "gurulandia", label: "Gurulandia", color: "#a855f7" },
              { id: "hvman", label: "HVMAN", color: "#14b8a6" },
              { id: "moneycraft", label: "Money Craft", color: "#eab308" },
            ].map(c => {
              const done = queuedTo.includes(c.id);
              return (
                <button key={c.id} onClick={() => sendToQueue(c.id)} disabled={done}
                  className="py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 disabled:opacity-70"
                  style={done
                    ? { background: c.color + "22", color: c.color }
                    : { background: c.color, color: "#000" }}>
                  {done ? <><Check size={11} /> Aggiunto</> : c.label}
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={() => { setDownloadUrl(""); setStreamUrl(""); setProgress(0); setQueuedTo([]); }}
          className="w-full py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-sm">
          Esporta di nuovo con altre impostazioni
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[280px_1fr] gap-6 max-w-4xl mx-auto">
      <style>{`
        @keyframes capPop { 0% { transform: scale(.6); } 60% { transform: scale(1.08); } 100% { transform: scale(1); } }
        @keyframes capFade { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes capShake { 0% { transform: rotate(2deg); } 50% { transform: rotate(-2deg); } 100% { transform: rotate(0); } }
        @keyframes capBounce { 0% { transform: scale(.3); } 60% { transform: scale(1.2); } 100% { transform: scale(1); } }
        @keyframes capZoom { 0% { transform: scale(1.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes capTilt { 0% { transform: rotate(-8deg); opacity: 0; } 100% { transform: rotate(0); opacity: 1; } }
        @keyframes capGlow { 0%,100% { filter: drop-shadow(0 0 2px #000); } 50% { filter: drop-shadow(0 0 10px currentColor); } }
        @keyframes capSlidein { 0% { transform: scaleX(.8) scaleY(1.15); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .cap-pop { animation: capPop .25s ease-out; }
        .cap-fade { animation: capFade .3s ease-in; }
        .cap-shake { animation: capShake .2s ease-in-out; }
        .cap-bounce { animation: capBounce .3s ease-out; }
        .cap-zoom { animation: capZoom .25s ease-out; }
        .cap-tilt { animation: capTilt .25s ease-out; }
        .cap-glow { animation: capGlow .8s ease-in-out; }
        .cap-slidein { animation: capSlidein .25s ease-out; }
      `}</style>

      {/* PREVIEW — anteprima caption sul b-roll */}
      <div className="space-y-2">
        <div className="text-xs text-gray-400 uppercase tracking-wider">Preview</div>
        <div className="rounded-2xl overflow-hidden border border-gray-800 bg-black relative aspect-[9/16]">
          {firstClip ? (
            <video src={firstClip.preview} className="w-full h-full object-cover" muted autoPlay loop playsInline />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">Nessuna clip</div>
          )}
          {captions && (
            <div className={`absolute left-3 right-3 flex justify-center ${
              captionPosition === "top" ? "top-[12%]" : captionPosition === "center" ? "top-1/2 -translate-y-1/2" : "bottom-[12%]"
            }`}>
              <div key={`${previewIdx}-${captionEffect}-${wordsPerCaption}-${captionFont}-${captionStyle}`}
                className={`text-center font-extrabold leading-tight ${fxClass}`}
                style={{
                  fontFamily: fontCss,
                  fontSize: previewFontSize,
                  color: textColor,
                  textShadow: "0 0 6px #000, 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000",
                }}>
                {previewGroup.map((w, wi) => (
                  <span key={wi} style={highlights.has(w) ? { color: hlColor, fontWeight: 900 } : undefined}>{w} </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <button onClick={() => setPreviewIdx(i => Math.max(0, i - 1))} disabled={previewIdx === 0}
            className="px-2 py-1 rounded hover:bg-gray-800 disabled:opacity-30">←</button>
          <span>segmento {previewIdx + 1}/{script.segments.length}</span>
          <button onClick={() => setPreviewIdx(i => Math.min(script.segments.length - 1, i + 1))}
            disabled={previewIdx >= script.segments.length - 1}
            className="px-2 py-1 rounded hover:bg-gray-800 disabled:opacity-30">→</button>
        </div>
        {wordsPerCaption > 0 && (
          <div className="text-xs text-gray-600 text-center">Mostra {wordsPerCaption} parol{wordsPerCaption === 1 ? "a" : "e"} per volta</div>
        )}
      </div>

      {/* SETTINGS */}
      <div className="space-y-4">
        {/* Templates */}
        <div>
          <div className="text-xs text-gray-500 mb-1.5">Template pronti</div>
          <div className="flex gap-1.5 flex-wrap">
            {CAPTION_TEMPLATES.map(t => (
              <button key={t.id} onClick={() => applyTemplate(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  activeTemplate === t.id ? "border-purple-500 bg-purple-500/15 text-white" : "border-gray-800 text-gray-400 hover:border-gray-600"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-white font-medium text-sm">Captions</div>
            <button onClick={() => setCaptions(c => !c)}
              className={`w-11 h-6 rounded-full transition-all relative ${captions ? "bg-purple-600" : "bg-gray-700"}`}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${captions ? "left-6" : "left-1"}`} />
            </button>
          </div>

          {captions && (
            <>
              <div>
                <div className="text-xs text-gray-500 mb-1.5">Font</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {CAPTION_FONTS.map(f => (
                    <button key={f.id} onClick={() => { setCaptionFont(f.id); setActiveTemplate(""); }}
                      style={{ fontFamily: f.css }}
                      className={`py-2 rounded-lg text-sm font-bold transition-all border ${
                        captionFont === f.id ? "border-purple-500 bg-purple-500/10 text-white" : "border-gray-800 text-gray-400 hover:border-gray-600"
                      }`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1.5">Posizione</div>
                  <div className="flex gap-1.5">
                    {CAPTION_POSITIONS.map(p => (
                      <button key={p.id} onClick={() => { setCaptionPosition(p.id); setActiveTemplate(""); }}
                        className={`flex-1 py-2 rounded-lg text-xs transition-all border ${
                          captionPosition === p.id ? "border-purple-500 bg-purple-500/10 text-white" : "border-gray-800 text-gray-400 hover:border-gray-600"
                        }`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1.5">Colore</div>
                  <div className="flex gap-1.5">
                    {CAPTION_COLORS.map(c => (
                      <button key={c.id} onClick={() => { setCaptionStyle(c.id); setActiveTemplate(""); }}
                        className={`flex-1 py-2 rounded-lg text-xs transition-all border flex items-center justify-center gap-1.5 ${
                          captionStyle === c.id ? "border-purple-500 bg-purple-500/10 text-white" : "border-gray-800 text-gray-400 hover:border-gray-600"
                        }`}>
                        <span className="w-2.5 h-2.5 rounded-full border border-gray-600" style={{ background: c.swatch }} />
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1.5">Parole per volta</div>
                <div className="flex gap-1.5">
                  {WORDS_OPTIONS.map(o => (
                    <button key={o.value} onClick={() => { setWordsPerCaption(o.value); setActiveTemplate(""); }}
                      className={`flex-1 py-2 rounded-lg text-xs transition-all border ${
                        wordsPerCaption === o.value ? "border-purple-500 bg-purple-500/10 text-white" : "border-gray-800 text-gray-400 hover:border-gray-600"
                      }`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1.5">Effetto entrata</div>
                <div className="flex gap-1.5">
                  {CAPTION_EFFECTS.map(e => (
                    <button key={e.id} onClick={() => { setCaptionEffect(e.id); setActiveTemplate(""); }}
                      className={`flex-1 py-2 rounded-lg text-xs transition-all border ${
                        captionEffect === e.id ? "border-purple-500 bg-purple-500/10 text-white" : "border-gray-800 text-gray-400 hover:border-gray-600"
                      }`}>
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white text-sm">Highlight automatici</div>
                  <div className="text-xs text-gray-500">Evidenzia numeri e parole chiave</div>
                </div>
                <button onClick={() => { setHighlightWords(h => !h); setActiveTemplate(""); }}
                  className={`w-11 h-6 rounded-full transition-all relative ${highlightWords ? "bg-purple-600" : "bg-gray-700"}`}>
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${highlightWords ? "left-6" : "left-1"}`} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Animazione clip video */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-2">
          <div className="text-white font-medium text-sm">🎞️ Animazione clip</div>
          <div className="text-xs text-gray-500 mb-1">Movimento applicato a ogni b-roll</div>
          <div className="flex gap-1.5 flex-wrap">
            {CLIP_ANIMATIONS.map(a => (
              <button key={a.id} onClick={() => setClipAnimation(a.id)}
                className={`flex-1 min-w-[80px] py-2 rounded-lg text-xs transition-all border ${
                  clipAnimation === a.id ? "border-purple-500 bg-purple-500/10 text-white" : "border-gray-800 text-gray-400 hover:border-gray-600"
                }`}>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Musica */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium text-sm">🎵 Musica di sottofondo</div>
              <div className="text-xs text-gray-500">Mixata automaticamente a −20 dB</div>
            </div>
          </div>
          {musicList.length > 0 ? (
            <select value={musicFile} onChange={e => setMusicFile(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
              <option value="">Nessuna musica</option>
              {musicList.map(m => <option key={m.filename} value={m.filename}>{m.name}</option>)}
            </select>
          ) : (
            <div className="text-xs text-gray-600">
              Nessun file trovato. Metti i tuoi MP3 in <span className="text-gray-400">~/Desktop/GURULANDIA/audio/music/</span>
            </div>
          )}
          {musicFile && (
            <audio controls src={`${SERVER}/api/studio/musicfile/${musicFile}`} className="w-full h-9" />
          )}
        </div>

        {/* Transizioni AI */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium text-sm">✨ Transizioni + SFX</div>
              <div className="text-xs text-gray-500">Sound effects a −8 dB · {numCuts} tagli</div>
            </div>
            <button onClick={() => setTransitionsOn(t => !t)}
              className={`w-11 h-6 rounded-full transition-all relative ${transitionsOn ? "bg-purple-600" : "bg-gray-700"}`}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${transitionsOn ? "left-6" : "left-1"}`} />
            </button>
          </div>
          {transitionsOn && (
            <>
              <textarea value={transPrompt} onChange={e => setTransPrompt(e.target.value)} rows={2}
                placeholder={`Es: "alterna transizioni flare e swoosh, con click sui flare e clap sugli swoosh"`}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 resize-none" />
              <button onClick={generateTransitionPlan} disabled={transLoading || !transPrompt.trim()}
                className="w-full py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium disabled:opacity-40 flex items-center justify-center gap-2">
                {transLoading ? <Loader size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {transLoading ? "Genero piano..." : transPlan ? "Rigenera piano" : "Genera piano transizioni con AI"}
              </button>
              {transError && <div className="text-red-400 text-xs">{transError}</div>}
              {transPlan && (
                <div className="flex gap-1 flex-wrap">
                  {transPlan.slice(0, 12).map((p, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded bg-purple-500/15 text-purple-300">
                      {p.transition}{p.sfx ? `+${p.sfx}` : ""}
                    </span>
                  ))}
                  {transPlan.length > 12 && <span className="text-xs text-gray-500 py-0.5">+{transPlan.length - 12}</span>}
                </div>
              )}
            </>
          )}
        </div>

        {error && <div className="text-red-400 text-sm flex items-center gap-2"><AlertCircle size={13} />{error}</div>}

        {exporting && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{progress < 80 ? "Download clip + trim + concat..." : "Captions + encoding finale..."}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <button onClick={doExport} disabled={exporting || !voiceoverFile}
          className="w-full py-4 rounded-xl font-bold bg-purple-600 text-white disabled:opacity-50 flex items-center justify-center gap-2">
          {exporting ? <Loader size={16} className="animate-spin" /> : <Download size={16} />}
          {exporting ? "Export in corso..." : "Esporta Video"}
        </button>

        {!voiceoverFile && (
          <div className="text-yellow-500 text-xs flex items-center gap-2"><AlertCircle size={12} /> Torna al passo Voiceover per generare l'audio</div>
        )}

        <button onClick={onBack} disabled={exporting}
          className="w-full py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white flex items-center justify-center gap-2 text-sm disabled:opacity-40">
          <ChevronLeft size={14} /> Indietro
        </button>
      </div>
    </div>
  );
}

// ─── API KEY SETUP ────────────────────────────────────────────────────────────

function ApiKeySetup({ onDone }: { onDone: () => void }) {
  const [anthropic, setAnthropic] = useState("");
  const [elevenlabs, setElevenlabs] = useState("");
  const [pexels, setPexels] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    if (pexels.trim()) {
      await fetch(`${SERVER}/api/broll/keys`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pexels: pexels.trim(), elevenlabs: elevenlabs.trim() }),
      });
    } else if (elevenlabs.trim()) {
      await fetch(`${SERVER}/api/broll/keys`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elevenlabs: elevenlabs.trim() }),
      });
    }
    if (anthropic.trim()) {
      await fetch(`${SERVER}/api/seo/key`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: anthropic.trim() }),
      });
    }
    setSaving(false);
    onDone();
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Key size={18} className="text-purple-400" />
          </div>
          <div>
            <div className="text-white font-bold">Configura API Keys</div>
            <div className="text-xs text-gray-500">Puoi anche metterle nel file .env del server</div>
          </div>
        </div>
        {[
          { label: "Anthropic (script AI)", val: anthropic, set: setAnthropic, ph: "sk-ant-..." },
          { label: "ElevenLabs (voiceover)", val: elevenlabs, set: setElevenlabs, ph: "sk_..." },
          { label: "Pexels (b-roll)", val: pexels, set: setPexels, ph: "La tua Pexels API key" },
        ].map(f => (
          <div key={f.label}>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">{f.label}</label>
            <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 placeholder-gray-600" />
          </div>
        ))}
        <button onClick={save} disabled={saving || (!anthropic && !elevenlabs && !pexels)}
          className="w-full py-3 rounded-xl font-semibold bg-purple-600 text-white disabled:opacity-40 flex items-center justify-center gap-2">
          {saving ? <Loader size={14} className="animate-spin" /> : <Check size={14} />}
          Salva
        </button>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

// ─── BATCH MODE: produci più video in sequenza ─────────────────────────────────

interface BatchItem {
  idea: string;
  status: "queued" | "script" | "voice" | "broll" | "export" | "done" | "error";
  videoUrl?: string;
  filename?: string;
  error?: string;
}

const BATCH_STEP_LABEL: Record<BatchItem["status"], string> = {
  queued: "In attesa", script: "Scrivo script…", voice: "Genero voce…",
  broll: "Cerco b-roll…", export: "Monto video…", done: "Pronto", error: "Errore",
};

function BatchPhase() {
  const [ideasText, setIdeasText] = useState("");
  const [style, setStyle] = useState("progetto_happiness");
  const [duration, setDuration] = useState(45);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voiceId, setVoiceId] = useState("");
  const [template, setTemplate] = useState("hormozi");
  const [clipAnimation, setClipAnimation] = useState("zoomin");
  const [autoChannel, setAutoChannel] = useState("");
  const [items, setItems] = useState<BatchItem[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    fetch(`${SERVER}/api/studio/voices`).then(r => r.json())
      .then(d => { if (Array.isArray(d)) { setVoices(d); if (d[0]) setVoiceId(d[0].id); } }).catch(() => {});
  }, []);

  const setItem = (i: number, patch: Partial<BatchItem>) =>
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, ...patch } : it));

  // Produce un singolo video: script → voce → broll → export (job) → opz. coda
  const produceOne = async (idea: string, i: number): Promise<void> => {
    const tpl = CAPTION_TEMPLATES.find(t => t.id === template) || CAPTION_TEMPLATES[0];
    // 1. script
    setItem(i, { status: "script" });
    const sr = await fetch(`${SERVER}/api/studio/script`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea, style, targetDuration: duration }),
    });
    const script = await sr.json();
    if (!sr.ok) throw new Error(script.error || "script");
    // 2. voiceover
    setItem(i, { status: "voice" });
    const vr = await fetch(`${SERVER}/api/studio/voiceover`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: script.fullScript, voiceId }),
    });
    const vo = await vr.json();
    if (!vr.ok) throw new Error(vo.error || "voiceover");
    // 3. broll per segmento
    setItem(i, { status: "broll" });
    const segments: { text: string; clipUrl: string }[] = [];
    for (const seg of script.segments) {
      let clipUrl = "";
      try {
        const br = await fetch(`${SERVER}/api/broll/search?q=${encodeURIComponent(seg.keyword)}&orientation=portrait&source=pexels&page=1`);
        const bd = await br.json();
        clipUrl = (bd.results || [])[0]?.download || "";
      } catch {}
      if (clipUrl) segments.push({ text: seg.text, clipUrl });
    }
    if (!segments.length) throw new Error("nessun b-roll trovato");
    // 4. export (job in background)
    setItem(i, { status: "export" });
    const er = await fetch(`${SERVER}/api/studio/export`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        segments, voiceoverFile: vo.filename,
        captions: true, captionStyle: tpl.style, captionPosition: tpl.position,
        captionFont: tpl.font, wordsPerCaption: tpl.words, captionEffect: tpl.effect,
        highlightWords: tpl.highlight, clipAnimation,
      }),
    });
    const ex = await er.json();
    if (!er.ok) throw new Error(ex.error || "export");
    // 5. attendi il job export
    const jobId = ex.jobId;
    const result = await new Promise<{ url: string; filename: string }>((resolve, reject) => {
      const poll = setInterval(async () => {
        try {
          const jr = await fetch(`${SERVER}/api/jobs/${jobId}`);
          const job = await jr.json();
          if (job.status === "done") { clearInterval(poll); resolve(job.result); }
          else if (job.status === "error") { clearInterval(poll); reject(new Error(job.error || "export")); }
        } catch {}
      }, 1500);
    });
    // 6. opzionale: aggiungi alla coda canale
    if (autoChannel) {
      try {
        await fetch(`${SERVER}/api/studio/to-queue`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: result.filename, channel: autoChannel, title: script.hook || idea }),
        });
      } catch {}
    }
    setItem(i, { status: "done", videoUrl: result.url, filename: result.filename });
  };

  const start = async () => {
    const ideas = ideasText.split("\n").map(s => s.trim()).filter(Boolean);
    if (!ideas.length || !voiceId) return;
    const init: BatchItem[] = ideas.map(idea => ({ idea, status: "queued" }));
    setItems(init);
    setRunning(true);
    for (let i = 0; i < ideas.length; i++) {
      try { await produceOne(ideas[i], i); }
      catch (e) { setItem(i, { status: "error", error: e instanceof Error ? e.message : "errore" }); }
    }
    setRunning(false);
  };

  const doneCount = items.filter(i => i.status === "done").length;

  return (
    <div className="grid grid-cols-[1fr_1fr] gap-6">
      {/* Setup */}
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Idee (una per riga)</label>
          <textarea value={ideasText} onChange={e => setIdeasText(e.target.value)} rows={6} disabled={running}
            placeholder={"Come risparmiare i primi 1000€\nLa disciplina batte la motivazione\n3 abitudini che cambiano la vita"}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 resize-none" />
          <div className="text-xs text-gray-600 mt-1">{ideasText.split("\n").filter(s => s.trim()).length} video da produrre</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Stile</label>
            <select value={style} onChange={e => setStyle(e.target.value)} disabled={running}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
              {STYLES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Durata</label>
            <select value={duration} onChange={e => setDuration(+e.target.value)} disabled={running}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
              {DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Voce</label>
            <select value={voiceId} onChange={e => setVoiceId(e.target.value)} disabled={running}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
              {voices.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Template caption</label>
            <select value={template} onChange={e => setTemplate(e.target.value)} disabled={running}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
              {CAPTION_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Animazione</label>
            <select value={clipAnimation} onChange={e => setClipAnimation(e.target.value)} disabled={running}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
              {CLIP_ANIMATIONS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Aggiungi a coda</label>
            <select value={autoChannel} onChange={e => setAutoChannel(e.target.value)} disabled={running}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
              <option value="">Solo export</option>
              <option value="gurulandia">Gurulandia</option>
              <option value="hvman">HVMAN</option>
              <option value="moneycraft">Money Craft</option>
            </select>
          </div>
        </div>

        <button onClick={start} disabled={running || !ideasText.trim() || !voiceId}
          className="w-full py-3 rounded-xl font-semibold bg-purple-600 text-white disabled:opacity-40 flex items-center justify-center gap-2">
          {running ? <Loader size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {running ? `Produzione ${doneCount}/${items.length}…` : "Produci tutti i video"}
        </button>
        <div className="text-xs text-gray-600 text-center">I video vengono prodotti in sequenza. Non chiudere la pagina.</div>
      </div>

      {/* Stato */}
      <div>
        {items.length === 0 ? (
          <div className="h-full min-h-64 flex items-center justify-center border-2 border-dashed border-gray-800 rounded-2xl">
            <div className="text-center text-gray-600">
              <Film size={32} className="mx-auto mb-3 opacity-30" />
              <div className="text-sm">I video prodotti appariranno qui</div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {items.map((it, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-gray-800 flex items-center justify-center text-xs text-gray-500 flex-shrink-0">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{it.idea}</div>
                  <div className={`text-xs mt-0.5 flex items-center gap-1.5 ${
                    it.status === "done" ? "text-green-400" : it.status === "error" ? "text-red-400" : "text-purple-400"
                  }`}>
                    {it.status !== "done" && it.status !== "error" && it.status !== "queued" && <Loader size={10} className="animate-spin" />}
                    {it.status === "done" && <Check size={11} />}
                    {it.status === "error" && <AlertCircle size={11} />}
                    {it.status === "error" ? it.error : BATCH_STEP_LABEL[it.status]}
                  </div>
                </div>
                {it.status === "done" && it.videoUrl && (
                  <a href={it.videoUrl} download className="text-xs text-purple-300 hover:text-white flex items-center gap-1 flex-shrink-0">
                    <Download size={12} /> MP4
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Studio() {
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [scriptData, setScriptData] = useState<ScriptData | null>(null);
  const [voiceoverUrl, setVoiceoverUrl] = useState("");
  const [voiceoverFile, setVoiceoverFile] = useState("");
  const [broll, setBroll] = useState<Record<number, BRollClip>>({});
  const [brollLoading, setBrollLoading] = useState<Set<number>>(new Set());
  const [showKeySetup, setShowKeySetup] = useState(false);

  // Vai a uno step (avanti o indietro); alza il limite massimo raggiunto
  const goStep = (i: number) => { setStep(i); setMaxStep(m => Math.max(m, i)); };

  const prefetchBRoll = async (segments: Segment[]) => {
    setBroll({});
    const pending = new Set(segments.map((_, i) => i));
    setBrollLoading(new Set(pending));
    for (let i = 0; i < segments.length; i++) {
      try {
        const r = await fetch(`${SERVER}/api/broll/search?q=${encodeURIComponent(segments[i].keyword)}&orientation=portrait&source=pexels&page=1`);
        const data = await r.json();
        const clip = (data.results || [])[0] || null;
        if (clip) setBroll(prev => ({ ...prev, [i]: clip }));
      } catch {}
      setBrollLoading(prev => { const s = new Set(prev); s.delete(i); return s; });
      await new Promise(res => setTimeout(res, 200));
    }
  };

  if (showKeySetup) return <ApiKeySetup onDone={() => setShowKeySetup(false)} />;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Video Studio</h1>
          <p className="text-gray-500 text-sm mt-1">{mode === "single" ? "Script → Voiceover → B-Roll → Export" : "Produzione in serie di più video"}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 p-1 bg-gray-900 border border-gray-800 rounded-lg">
            <button onClick={() => setMode("single")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === "single" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>
              Singolo
            </button>
            <button onClick={() => setMode("batch")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mode === "batch" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>
              Batch
            </button>
          </div>
          <button onClick={() => setShowKeySetup(true)}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-800 border border-gray-800">
            <Key size={12} /> API Keys
          </button>
        </div>
      </div>

      {mode === "batch" ? <BatchPhase /> : <>
      <StepBar step={step} maxStep={maxStep} onStep={goStep} />

      {step === 0 && (
        <ScriptPhase
          brollFetching={brollLoading.size > 0}
          existing={scriptData}
          onDone={d => { setScriptData(d); goStep(1); prefetchBRoll(d.segments); }}
        />
      )}
      {step === 1 && scriptData && (
        <VoiceoverPhase
          script={scriptData}
          onDone={(url, file) => { setVoiceoverUrl(url); setVoiceoverFile(file); goStep(2); }}
          onBack={() => goStep(0)}
        />
      )}
      {step === 2 && scriptData && (
        <BRollPhase
          script={scriptData}
          initialAssignments={broll}
          initialLoading={brollLoading}
          onDone={a => { setBroll(a); goStep(3); }}
          onBack={() => goStep(1)}
        />
      )}
      {step === 3 && scriptData && (
        <ExportPhase
          script={scriptData}
          voiceoverFile={voiceoverFile}
          assignments={broll}
          onBack={() => goStep(2)}
        />
      )}

      {/* unused to avoid lint warning */}
      {voiceoverUrl && false && <span>{voiceoverUrl}</span>}
      </>}
    </div>
  );
}
