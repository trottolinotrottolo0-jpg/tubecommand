import { useState, useEffect } from "react";
import {
  Search, Download, Play, Pause, ExternalLink, Key,
  Loader, Film, Smartphone, Monitor, Filter, X, Check,
  CheckSquare, Square, Package, Sparkles, Wand2,
  Trash2, FolderOpen, Image as ImageIcon, Bookmark, BookmarkCheck,
} from "lucide-react";

const SERVER = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

interface BRollClip {
  id: string;
  source: "pexels" | "pixabay" | "youtube";
  thumbnail: string;
  preview: string;
  download: string;
  duration: number;
  width: number;
  height: number;
  author: string;
  authorUrl: string;
  pageUrl: string;
  ytId?: string;
  title?: string;
}

type Orientation = "portrait" | "landscape";
type Source = "all" | "pexels" | "pixabay" | "youtube";

const SOURCE_COLORS: Record<string, string> = {
  pexels: "#05A081",
  pixabay: "#4BB543",
  youtube: "#FF0000",
};

// ── VIDEO CARD ────────────────────────────────────────────────────────────────

function ClipCard({ clip, onSelect, selected, onToggleSelect, onSave, saved }: {
  clip: BRollClip;
  onSelect: (c: BRollClip) => void;
  selected: boolean;
  onToggleSelect: (c: BRollClip) => void;
  onSave?: (c: BRollClip) => void;
  saved?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const [hover, setHover] = useState(false);
  const isPortrait = clip.height > clip.width;
  const aspectClass = isPortrait ? "aspect-[9/16]" : "aspect-video";
  const srcColor = SOURCE_COLORS[clip.source] || "#888";

  return (
    <div
      className={`group relative rounded-2xl overflow-hidden border transition-all cursor-pointer bg-gray-900 ${
        selected ? "border-purple-500 ring-1 ring-purple-500/30" : "border-gray-800 hover:border-gray-600"
      }`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPlaying(false); }}
      onClick={() => onSelect(clip)}
    >
      <div className={`${aspectClass} relative bg-gray-950 overflow-hidden`}>
        {playing && clip.preview ? (
          <video
            src={clip.preview}
            className="w-full h-full object-cover"
            autoPlay muted loop playsInline
            onError={() => setPlaying(false)}
          />
        ) : (
          <img
            src={clip.thumbnail}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={e => { (e.target as HTMLImageElement).src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'><rect fill='%23222' width='1' height='1'/></svg>"; }}
          />
        )}

        {/* Hover overlay */}
        {hover && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3">
            {clip.source === "youtube" ? (
              <a href={clip.pageUrl} target="_blank" rel="noreferrer"
                onClick={e => e.stopPropagation()}
                className="w-10 h-10 rounded-full bg-red-600/90 flex items-center justify-center text-white hover:bg-red-500 transition-all"
                title="Guarda su YouTube">
                <Play size={16} />
              </a>
            ) : (
              <button
                onClick={e => { e.stopPropagation(); setPlaying(!playing); }}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition-all"
              >
                {playing ? <Pause size={16} /> : <Play size={16} />}
              </button>
            )}
          </div>
        )}

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-md">
          {Math.floor(clip.duration / 60)}:{String(clip.duration % 60).padStart(2, "0")}
        </div>

        {/* Select checkbox */}
        <button
          onClick={e => { e.stopPropagation(); onToggleSelect(clip); }}
          className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-md flex items-center justify-center transition-all ${
            selected
              ? "bg-purple-600 text-white"
              : "bg-black/50 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-white"
          } ${selected ? "opacity-100" : ""}`}
        >
          {selected ? <CheckSquare size={14} /> : <Square size={14} />}
        </button>

        {/* Source badge */}
        <div className="absolute bottom-2 left-2 text-xs px-2 py-0.5 rounded-md font-medium"
          style={{ background: srcColor + "22", color: srcColor, border: `1px solid ${srcColor}44` }}>
          {clip.source}
        </div>

        {/* Resolution */}
        <div className="absolute top-2 right-2 bg-black/70 text-gray-300 text-xs px-1.5 py-0.5 rounded-md">
          {clip.width}×{clip.height}
        </div>

        {/* Save to library */}
        {onSave && (
          <button
            onClick={e => { e.stopPropagation(); if (!saved) onSave(clip); }}
            title={saved ? "Salvato in libreria" : "Salva in libreria"}
            className={`absolute bottom-2 right-2 z-10 px-2 h-6 rounded-md flex items-center gap-1 text-xs transition-all ${
              saved ? "bg-green-600/90 text-white opacity-100" : "bg-black/60 text-gray-200 opacity-0 group-hover:opacity-100 hover:bg-purple-600"
            }`}
          >
            {saved ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
            {saved ? "Salvato" : "Salva"}
          </button>
        )}
      </div>

      <div className="p-3">
        {clip.title && <div className="text-xs text-gray-300 truncate mb-0.5" title={clip.title}>{clip.title}</div>}
        <div className="text-xs text-gray-500 truncate">
          by <span className="text-gray-400">{clip.author}</span>
        </div>
      </div>
    </div>
  );
}

// ── DETAIL PANEL ──────────────────────────────────────────────────────────────

function DetailPanel({ clip, onClose, onSave, saved }: { clip: BRollClip; onClose: () => void; onSave?: (c: BRollClip) => void; saved?: boolean }) {
  const isPortrait = clip.height > clip.width;
  const srcColor = SOURCE_COLORS[clip.source] || "#888";

  const handleDownload = async () => {
    const a = document.createElement("a");
    a.href = clip.download;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-screen w-[560px] bg-gray-900 border-l border-gray-800 z-50 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Film size={16} style={{ color: srcColor }} />
            <span className="font-bold text-white text-sm">Anteprima clip</span>
            <span className="text-xs px-2 py-0.5 rounded-md font-medium"
              style={{ background: srcColor + "22", color: srcColor }}>
              {clip.source}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Preview */}
          <div className={`${isPortrait ? "max-w-[280px] mx-auto" : "w-full"} rounded-2xl overflow-hidden bg-gray-950`}>
            {clip.source === "youtube" ? (
              <img src={clip.thumbnail} className="w-full" alt="" />
            ) : (
              <video
                src={clip.preview || clip.download}
                className="w-full"
                controls autoPlay muted loop playsInline
              />
            )}
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Risoluzione", value: `${clip.width} × ${clip.height}` },
              { label: "Durata", value: `${Math.floor(clip.duration / 60)}:${String(clip.duration % 60).padStart(2, "0")}` },
              { label: "Formato", value: isPortrait ? "9:16 (Vertical)" : "16:9 (Horizontal)" },
              { label: "Autore", value: clip.author },
            ].map(item => (
              <div key={item.label} className="bg-gray-800 rounded-xl p-3">
                <div className="text-xs text-gray-500">{item.label}</div>
                <div className="text-sm text-white font-medium mt-0.5">{item.value}</div>
              </div>
            ))}
          </div>

          {/* Attribution */}
          <div className="bg-gray-800 rounded-xl p-3 text-xs text-gray-400">
            {clip.source === "youtube"
              ? "Clip da YouTube · scaricata in MP4 al click. Verifica i diritti d'uso prima di pubblicare."
              : `Clip gratuita da ${clip.source === "pexels" ? "Pexels" : "Pixabay"} · Libera per uso commerciale · Attribuzione consigliata`}
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 border-t border-gray-800 space-y-2">
          {onSave && (
            <button onClick={() => { if (!saved) onSave(clip); }} disabled={saved}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                saved ? "bg-green-600/20 text-green-400" : "bg-purple-600 text-white hover:bg-purple-500"
              }`}>
              {saved ? <><BookmarkCheck size={15} /> Salvato in libreria</> : <><Bookmark size={15} /> Salva in libreria</>}
            </button>
          )}
          <button onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all text-white"
            style={{ background: srcColor }}>
            <Download size={15} /> Scarica HD
          </button>
          <a href={clip.pageUrl} target="_blank" rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-colors border border-gray-700 hover:border-gray-500">
            <ExternalLink size={13} /> Apri su {clip.source}
          </a>
        </div>
      </div>
    </>
  );
}

// ── API KEY SETUP ─────────────────────────────────────────────────────────────

function ApiKeySetup({ onDone }: { onDone: () => void }) {
  const [pexels, setPexels] = useState("");
  const [pixabay, setPixabay] = useState("");
  const [anthropic, setAnthropic] = useState("");
  const [elevenlabs, setElevenlabs] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const body: Record<string, string> = {};
    if (pexels.trim()) body.pexels = pexels.trim();
    if (pixabay.trim()) body.pixabay = pixabay.trim();
    if (elevenlabs.trim()) body.elevenlabs = elevenlabs.trim();
    await fetch(`${SERVER}/api/broll/keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (anthropic.trim()) {
      await fetch(`${SERVER}/api/seo/key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: anthropic.trim() }),
      });
    }
    setSaving(false);
    onDone();
  };

  return (
    <div className="max-w-lg mx-auto mt-16">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Key size={18} className="text-purple-400" />
          </div>
          <div>
            <div className="text-white font-bold">Configura API Keys</div>
            <div className="text-xs text-gray-500">Servono per cercare B-roll su Pexels e Pixabay (gratuite)</div>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Pexels API Key</label>
          <input value={pexels} onChange={e => setPexels(e.target.value)}
            placeholder="Prendila da pexels.com/api → gratis"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gray-500 placeholder-gray-600" />
          <a href="https://www.pexels.com/api/new/" target="_blank" rel="noopener noreferrer"
            className="text-xs text-green-500 hover:underline mt-1 inline-block">
            Registrati e ottieni la key gratis →
          </a>
        </div>

        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Pixabay API Key</label>
          <input value={pixabay} onChange={e => setPixabay(e.target.value)}
            placeholder="Prendila da pixabay.com/api/docs → gratis"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gray-500 placeholder-gray-600" />
          <a href="https://pixabay.com/api/docs/" target="_blank" rel="noopener noreferrer"
            className="text-xs text-green-500 hover:underline mt-1 inline-block">
            Registrati e ottieni la key gratis →
          </a>
        </div>

        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Anthropic API Key (per SEO AI)</label>
          <input value={anthropic} onChange={e => setAnthropic(e.target.value)}
            placeholder="sk-ant-... → per generare SEO con Claude"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gray-500 placeholder-gray-600" />
          <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer"
            className="text-xs text-green-500 hover:underline mt-1 inline-block">
            Ottieni la key dalla console Anthropic →
          </a>
        </div>

        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">ElevenLabs API Key (per voiceover)</label>
          <input value={elevenlabs} onChange={e => setElevenlabs(e.target.value)}
            placeholder="sk_... → per generare voiceover nel Video Studio"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gray-500 placeholder-gray-600" />
          <a href="https://elevenlabs.io/app/settings/api-keys" target="_blank" rel="noopener noreferrer"
            className="text-xs text-green-500 hover:underline mt-1 inline-block">
            Ottieni la key da ElevenLabs →
          </a>
        </div>

        <button onClick={save} disabled={saving || (!pexels.trim() && !pixabay.trim() && !anthropic.trim() && !elevenlabs.trim())}
          className="w-full py-3 rounded-xl font-semibold text-sm bg-purple-600 text-white disabled:opacity-40 transition-all flex items-center justify-center gap-2">
          {saving ? <Loader size={14} className="animate-spin" /> : <Check size={14} />}
          Salva e inizia
        </button>
      </div>
    </div>
  );
}

// ── KEYWORD SUGGESTIONS ───────────────────────────────────────────────────────

function suggestKeywords(idea: string): string[] {
  const words = idea.toLowerCase().replace(/[^a-zàèéìòù0-9\s]/g, "").split(/\s+/).filter(w => w.length > 3);
  const stopwords = new Set(["come","cosa","questo","quella","perché","quando","dove","sono","fare","fatto","molto","anche","sempre","tutto","ogni"]);
  const clean = words.filter(w => !stopwords.has(w));

  const topicMap: Record<string, string[]> = {
    startup: ["office team", "coding laptop", "brainstorm whiteboard", "pitch meeting", "entrepreneur"],
    tecnologia: ["technology circuit", "server room", "digital code", "futuristic", "robot AI"],
    intelligenza: ["artificial intelligence", "neural network", "brain technology", "machine learning"],
    podcast: ["microphone studio", "podcast recording", "headphones desk", "interview"],
    business: ["business meeting", "office workers", "corporate", "handshake deal"],
    soldi: ["money cash", "stock market", "finance trading", "gold coins", "wealthy"],
    money: ["money cash", "stock market", "finance", "dollar bills", "cryptocurrency"],
    crypto: ["cryptocurrency bitcoin", "blockchain", "digital currency", "trading screen"],
    fitness: ["gym workout", "exercise training", "running athlete", "weights"],
    cibo: ["cooking kitchen", "food preparation", "restaurant chef", "healthy meal"],
    politica: ["parliament debate", "politics speech", "election voting", "government"],
    guerra: ["military conflict", "world map geopolitics", "news broadcast", "documentary"],
    energia: ["solar panels", "wind turbines", "power plant", "electric energy"],
    italia: ["rome colosseum", "italy landscape", "italian city", "mediterranean"],
    europa: ["european parliament", "EU flags", "europe skyline", "brussels"],
    trump: ["american politics", "white house", "usa flag", "news broadcast"],
  };

  const suggestions = new Set<string>();
  for (const w of clean) {
    for (const [key, vals] of Object.entries(topicMap)) {
      if (w.includes(key) || key.includes(w)) {
        vals.forEach(v => suggestions.add(v));
      }
    }
  }

  if (suggestions.size < 3 && clean.length > 0) {
    suggestions.add(clean.slice(0, 2).join(" "));
    suggestions.add(clean[0] + " cinematic");
    suggestions.add(clean[0] + " aerial");
  }

  return [...suggestions].slice(0, 8);
}

// ── LIBRARY ASSET TYPE ────────────────────────────────────────────────────────

interface HubAsset {
  id: string;
  type: "video" | "image";
  source: string;
  keyword?: string;
  prompt?: string;
  title?: string;
  url: string;
  thumbnail: string;
  width: number;
  height: number;
  duration: number;
  createdAt: number;
}

// Salva un risultato di ricerca nella libreria Content Hub
async function saveToLibrary(clip: BRollClip, keyword: string): Promise<boolean> {
  const isImg = (clip as { type?: string }).type === "image";
  try {
    const r = await fetch(`${SERVER}/api/hub/save`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: isImg ? "image" : "video",
        sourceUrl: clip.download,
        source: clip.source,
        keyword,
        title: clip.title || "",
        thumbnail: isImg ? "" : clip.thumbnail,
        width: clip.width, height: clip.height, duration: clip.duration,
      }),
    });
    return r.ok;
  } catch { return false; }
}

// ── CREATE TAB (Higgsfield) ───────────────────────────────────────────────────

interface HfModel { id: string; label: string; }

function CreateTab({ onSaved }: { onSaved: () => void }) {
  const [hfConfigured, setHfConfigured] = useState<boolean | null>(null);
  const [account, setAccount] = useState("");
  const [kind, setKind] = useState<"image" | "video">("image");
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState("9:16");
  const [imgModels, setImgModels] = useState<HfModel[]>([]);
  const [vidModels, setVidModels] = useState<HfModel[]>([]);
  const [imgModel, setImgModel] = useState("nano_banana_2");
  const [vidModel, setVidModel] = useState("kling2_6");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [savedIdx, setSavedIdx] = useState<Set<number>>(new Set());
  // Picker immagini di reference dalla libreria
  const [showLibPicker, setShowLibPicker] = useState(false);
  const [libImages, setLibImages] = useState<HubAsset[]>([]);

  const openLibPicker = () => {
    setShowLibPicker(true);
    fetch(`${SERVER}/api/hub/library?type=image`).then(r => r.json())
      .then(d => setLibImages(d.results || [])).catch(() => setLibImages([]));
  };

  useEffect(() => {
    fetch(`${SERVER}/api/hub/hf-status`).then(r => r.json())
      .then(d => { setHfConfigured(!!d.configured); setAccount(d.account || ""); }).catch(() => setHfConfigured(false));
    fetch(`${SERVER}/api/hub/hf-models`).then(r => r.json())
      .then(d => { setImgModels(d.image || []); setVidModels(d.video || []); }).catch(() => {});
  }, []);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setError(""); setResults([]); setSavedIdx(new Set());
    try {
      const r = await fetch(`${SERVER}/api/hub/generate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, prompt, model: kind === "image" ? imgModel : vidModel, aspectRatio: aspect, imageUrl }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      // Generazione in background come job: polling (la barra globale in alto la mostra
      // anche se cambi tab).
      const jobId = data.jobId;
      const poll = setInterval(async () => {
        try {
          const jr = await fetch(`${SERVER}/api/jobs/${jobId}`);
          const job = await jr.json();
          if (job.status === "done") {
            clearInterval(poll);
            setResults(job.result?.urls || []);
            if (!job.result?.urls?.length) setError("Nessun risultato generato");
            setLoading(false);
          } else if (job.status === "error") {
            clearInterval(poll);
            setError(job.error || "Errore generazione");
            setLoading(false);
          }
        } catch {}
      }, 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore generazione");
      setLoading(false);
    }
  };

  const saveResult = async (url: string, i: number) => {
    const ok = await fetch(`${SERVER}/api/hub/save`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: kind, sourceUrl: url, source: "higgsfield", prompt, width: kind === "image" ? 1080 : 1080, height: 1920, duration: 0 }),
    }).then(r => r.ok).catch(() => false);
    if (ok) { setSavedIdx(prev => new Set([...prev, i])); onSaved(); }
  };

  // usa il risultato immagine come base per generare un video
  const useAsVideoBase = (url: string) => { setKind("video"); setImageUrl(url); setResults([]); };

  if (hfConfigured === false) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-lg">
        <div className="flex items-center gap-2 text-white font-bold mb-2"><Wand2 size={16} className="text-purple-400" /> Crea asset con Higgsfield</div>
        <p className="text-sm text-gray-400 mb-3">
          Il CLI Higgsfield non è autenticato. Apri il terminale ed esegui:
        </p>
        <code className="block bg-gray-950 text-purple-300 text-sm px-3 py-2 rounded-lg mb-3">higgsfield auth login</code>
        <p className="text-xs text-gray-500">Poi ricarica questa pagina.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[380px_1fr] gap-6">
      <div className="space-y-4">
        {account && <div className="text-xs text-gray-500 flex items-center gap-1.5"><Sparkles size={11} className="text-purple-400" /> {account}</div>}
        <div className="flex gap-2">
          {(["image", "video"] as const).map(k => (
            <button key={k} onClick={() => setKind(k)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border flex items-center justify-center gap-2 ${
                kind === k ? "border-purple-500 bg-purple-500/10 text-white" : "border-gray-800 text-gray-400 hover:border-gray-600"
              }`}>
              {k === "image" ? <ImageIcon size={14} /> : <Film size={14} />}
              {k === "image" ? "Immagine" : "Video"}
            </button>
          ))}
        </div>

        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Prompt</label>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={4}
            placeholder={kind === "image" ? "Es: l'uomo più ricco del mondo, ritratto cinematografico, luce drammatica" : "Es: lenta carrellata in avanti, atmosfera epica"}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 resize-none" />
        </div>

        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Modello</label>
          <select value={kind === "image" ? imgModel : vidModel}
            onChange={e => kind === "image" ? setImgModel(e.target.value) : setVidModel(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
            {(kind === "image" ? imgModels : vidModels).map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>

        {kind === "image" ? (
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Formato</label>
            <div className="flex gap-2">
              {["9:16", "16:9", "1:1", "4:3"].map(a => (
                <button key={a} onClick={() => setAspect(a)}
                  className={`flex-1 py-2 rounded-lg text-xs transition-all border ${aspect === a ? "border-purple-500 bg-purple-500/10 text-white" : "border-gray-800 text-gray-400 hover:border-gray-600"}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-1.5 block">Immagine di reference (opzionale)</label>
            {imageUrl ? (
              <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-xl p-2">
                <img src={imageUrl} className="w-12 h-16 object-cover rounded-lg" alt="" />
                <div className="flex-1 text-xs text-gray-400 truncate">Immagine di partenza selezionata</div>
                <button onClick={() => setImageUrl("")} className="text-gray-500 hover:text-white p-1"><X size={14} /></button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={openLibPicker}
                  className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:border-purple-500 hover:text-white text-sm flex items-center justify-center gap-2">
                  <FolderOpen size={14} /> Scegli dalla libreria
                </button>
              </div>
            )}
            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)}
              placeholder="...oppure incolla un URL · vuoto = text-to-video"
              className="w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-purple-500 placeholder-gray-600" />
          </div>
        )}

        {error && <div className="text-red-400 text-sm flex items-center gap-2"><X size={13} />{error}</div>}

        <button onClick={generate} disabled={loading || !prompt.trim()}
          className="w-full py-3 rounded-xl font-semibold bg-purple-600 text-white disabled:opacity-40 flex items-center justify-center gap-2">
          {loading ? <Loader size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {loading ? "Generazione in corso (~30-90s)..." : `Genera ${kind === "image" ? "immagine" : "video"}`}
        </button>
        {loading && <div className="text-xs text-gray-500 text-center">Higgsfield sta elaborando, non chiudere la pagina.</div>}
      </div>

      <div>
        {results.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {results.map((url, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-gray-800 bg-gray-950">
                {kind === "image"
                  ? <img src={url} className="w-full aspect-[9/16] object-cover" alt="" />
                  : <video src={url} className="w-full aspect-[9/16] object-cover" controls autoPlay muted loop playsInline />}
                <div className="p-2 flex gap-2">
                  <button onClick={() => saveResult(url, i)} disabled={savedIdx.has(i)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 ${savedIdx.has(i) ? "bg-green-600/20 text-green-400" : "bg-purple-600 text-white hover:bg-purple-500"}`}>
                    {savedIdx.has(i) ? <><BookmarkCheck size={12} /> Salvato</> : <><Bookmark size={12} /> Salva in libreria</>}
                  </button>
                  {kind === "image" && (
                    <button onClick={() => useAsVideoBase(url)} title="Usa per generare un video"
                      className="px-2.5 py-2 rounded-lg text-xs bg-gray-800 text-gray-300 hover:bg-gray-700 flex items-center gap-1">
                      <Film size={12} /> Video
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full min-h-72 flex items-center justify-center border-2 border-dashed border-gray-800 rounded-2xl">
            <div className="text-center text-gray-600">
              <Wand2 size={32} className="mx-auto mb-3 opacity-30" />
              <div className="text-sm">I tuoi asset generati appariranno qui</div>
            </div>
          </div>
        )}
      </div>

      {/* Picker immagini libreria (per reference video) */}
      {showLibPicker && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6" onClick={() => setShowLibPicker(false)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl p-5 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="font-semibold text-white">Scegli un'immagine di reference</div>
              <button onClick={() => setShowLibPicker(false)} className="text-gray-500 hover:text-white"><X size={15} /></button>
            </div>
            {libImages.length === 0 ? (
              <div className="text-center text-gray-600 text-sm py-10">Nessuna immagine in libreria. Genera o salva immagini prima.</div>
            ) : (
              <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto">
                {libImages.map(a => (
                  <button key={a.id} onClick={() => { setImageUrl(a.url); setShowLibPicker(false); }}
                    className="rounded-xl overflow-hidden border-2 border-transparent hover:border-purple-500 transition-all aspect-[9/16] bg-gray-950">
                    <img src={a.url} className="w-full h-full object-cover" alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── LIBRARY TAB ───────────────────────────────────────────────────────────────

function LibraryTab() {
  const [assets, setAssets] = useState<HubAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = (q = "") => {
    setLoading(true);
    fetch(`${SERVER}/api/hub/library?q=${encodeURIComponent(q)}`).then(r => r.json())
      .then(d => setAssets(d.results || [])).catch(() => setAssets([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    await fetch(`${SERVER}/api/hub/asset/${id}`, { method: "DELETE" });
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && load(query)}
            placeholder="Cerca nei tuoi asset salvati..."
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-gray-600 placeholder-gray-600" />
        </div>
        <button onClick={() => load(query)} className="p-2.5 rounded-xl bg-purple-600 text-white"><Filter size={14} /></button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500 text-sm"><Loader size={13} className="animate-spin" /> Caricamento libreria...</div>
      ) : assets.length === 0 ? (
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-800 rounded-2xl">
          <div className="text-center text-gray-600">
            <FolderOpen size={32} className="mx-auto mb-3 opacity-30" />
            <div className="text-sm">Libreria vuota. Salva clip dalla ricerca o genera asset con Higgsfield.</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {assets.map(a => (
            <div key={a.id} className="group relative rounded-2xl overflow-hidden border border-gray-800 bg-gray-900">
              <div className="aspect-[9/16] bg-gray-950">
                {a.type === "image"
                  ? <img src={a.url} className="w-full h-full object-cover" alt="" loading="lazy" />
                  : <video src={a.url} className="w-full h-full object-cover" muted loop
                      onMouseEnter={e => (e.target as HTMLVideoElement).play()}
                      onMouseLeave={e => (e.target as HTMLVideoElement).pause()} />}
              </div>
              <div className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-md bg-black/70 text-gray-200 capitalize">{a.source}</div>
              <button onClick={() => remove(a.id)}
                className="absolute top-2 right-2 w-7 h-7 rounded-md bg-black/60 text-gray-300 hover:bg-red-600 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 size={13} />
              </button>
              <a href={a.url} download className="absolute bottom-2 right-2 w-7 h-7 rounded-md bg-black/60 text-gray-300 hover:bg-gray-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <Download size={13} />
              </a>
              <div className="p-2 text-xs text-gray-500 truncate">{a.prompt || a.keyword || a.title || a.type}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────

export default function BRoll() {
  const [tab, setTab] = useState<"search" | "create" | "library">("search");
  const [libraryVersion, setLibraryVersion] = useState(0); // forza remount LibraryTab
  const [apiStatus, setApiStatus] = useState<{ pexels: boolean; pixabay: boolean } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [source, setSource] = useState<Source>("all");
  const [mediaType, setMediaType] = useState<"video" | "image">("video");
  const [ytMode, setYtMode] = useState<"shorts" | "video">("shorts");
  const [results, setResults] = useState<BRollClip[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClip, setSelectedClip] = useState<BRollClip | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const saveClip = async (clip: BRollClip) => {
    const ok = await saveToLibrary(clip, searchQuery);
    if (ok) setSavedIds(prev => new Set([...prev, clip.id]));
  };

  const toggleSelect = (clip: BRollClip) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(clip.id)) next.delete(clip.id);
      else next.add(clip.id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === results.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(results.map(r => r.id)));
  };

  const downloadSelected = async () => {
    const clips = results.filter(r => selectedIds.has(r.id));
    if (clips.length === 0) return;
    setDownloading(true);

    // Crea nomi significativi: keyword + source + index
    const q = searchQuery.replace(/[^a-zA-Z0-9\s]/g, "").trim().replace(/\s+/g, "-").toLowerCase();
    const payload = clips.map((clip, i) => ({
      url: clip.download,
      name: `${q}-${clip.source}-${i + 1}-${clip.width}x${clip.height}.mp4`,
    }));

    try {
      const res = await fetch(`${SERVER}/api/broll/download-zip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clips: payload }),
      });
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `broll-${q}-${clips.length}clips.zip`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      // Fallback: apri singoli link
      for (const clip of clips) {
        const a = document.createElement("a");
        a.href = clip.download;
        a.target = "_blank";
        a.click();
        await new Promise(r => setTimeout(r, 800));
      }
    }
    setDownloading(false);
  };

  const checkApi = async () => {
    try {
      const r = await fetch(`${SERVER}/api/broll/status`);
      const data = await r.json();
      setApiStatus(data);
    } catch {
      setApiStatus({ pexels: false, pixabay: false });
    }
  };

  useEffect(() => { checkApi(); }, []);

  const doSearch = async (q: string, p: number) => {
    setLoading(true);
    setPage(p);
    try {
      const url = mediaType === "image"
        ? `${SERVER}/api/broll/images?q=${encodeURIComponent(q)}&orientation=${orientation}&page=${p}`
        : source === "youtube"
        ? `${SERVER}/api/broll/youtube?q=${encodeURIComponent(q)}&max=20&mode=${ytMode}`
        : `${SERVER}/api/broll/search?q=${encodeURIComponent(q)}&orientation=${orientation}&source=${source}&page=${p}`;
      const r = await fetch(url);
      const data = await r.json();
      if (p === 1) setResults(data.results || []);
      else setResults(prev => [...prev, ...(data.results || [])]);
    } catch { if (p === 1) setResults([]); }
    finally { setLoading(false); }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setSuggestions(suggestKeywords(searchQuery).filter(k => k.toLowerCase() !== searchQuery.toLowerCase()).slice(0, 6));
    doSearch(searchQuery, 1);
  };

  if (apiStatus && !apiStatus.pexels && !apiStatus.pixabay) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Film size={18} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">B-Roll Finder</h1>
            <p className="text-gray-400 text-sm">Trova clip gratuite per i tuoi video</p>
          </div>
        </div>
        <ApiKeySetup onDone={checkApi} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Package size={18} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Content Hub</h1>
            <p className="text-gray-400 text-sm">Trova, crea e salva tutti gli asset per i tuoi video</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-gray-900 border border-gray-800 rounded-xl mb-5 w-fit">
        {([
          { id: "search" as const, icon: Search, label: "Cerca online" },
          { id: "create" as const, icon: Wand2, label: "Crea con AI" },
          { id: "library" as const, icon: FolderOpen, label: "Libreria" },
        ]).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "create" && <CreateTab onSaved={() => setLibraryVersion(v => v + 1)} />}
      {tab === "library" && <LibraryTab key={libraryVersion} />}

      {tab === "search" && <>
      {/* Search bar + Filters */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder={source === "youtube" ? "Cerca una persona o un tema (es: Anna Pepe)..." : mediaType === "image" ? "Cerca foto (es: città di notte)..." : "Cerca b-roll (es: ocean sunset, money desk)..."}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-gray-600 placeholder-gray-600"
          />
        </div>

        {/* Media type filter */}
        <div className="flex rounded-xl border border-gray-800 overflow-hidden">
          {([
            { id: "video" as const, icon: Film, label: "Video" },
            { id: "image" as const, icon: ImageIcon, label: "Foto" },
          ]).map(m => (
            <button key={m.id}
              onClick={() => { setMediaType(m.id); if (searchQuery) setTimeout(() => doSearch(searchQuery, 1), 0); }}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs transition-all ${
                mediaType === m.id ? "bg-purple-600 text-white" : "bg-gray-900 text-gray-400 hover:text-white"
              }`}>
              <m.icon size={12} /> {m.label}
            </button>
          ))}
        </div>

        {/* Orientation filter */}
        <div className="flex rounded-xl border border-gray-800 overflow-hidden">
          {([
            { id: "portrait" as Orientation, icon: Smartphone, label: "9:16" },
            { id: "landscape" as Orientation, icon: Monitor, label: "16:9" },
          ]).map(o => (
            <button key={o.id}
              onClick={() => { setOrientation(o.id); if (searchQuery) doSearch(searchQuery, 1); }}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs transition-all ${
                orientation === o.id
                  ? "bg-purple-600 text-white"
                  : "bg-gray-900 text-gray-400 hover:text-white"
              }`}>
              <o.icon size={12} /> {o.label}
            </button>
          ))}
        </div>

        {/* Source filter (solo per i video) */}
        {mediaType === "video" && <>
        {/* Source filter */}
        <div className="flex rounded-xl border border-gray-800 overflow-hidden">
          {(["all", "pexels", "pixabay", "youtube"] as Source[]).map(s => (
            <button key={s}
              onClick={() => { setSource(s); if (searchQuery) doSearch(searchQuery, 1); }}
              className={`px-3 py-2 text-xs transition-all whitespace-nowrap ${
                source === s
                  ? s === "youtube" ? "bg-red-600 text-white" : "bg-gray-700 text-white"
                  : "bg-gray-900 text-gray-400 hover:text-white"
              }`}>
              {s === "all" ? "Tutti" : s === "youtube" ? "▶ Persone" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Shorts/Video toggle (solo per Persone/YouTube) */}
        {source === "youtube" && (
          <div className="flex rounded-xl border border-gray-800 overflow-hidden">
            {([
              { id: "shorts" as const, label: "Clip brevi" },
              { id: "video" as const, label: "Video interi" },
            ]).map(m => (
              <button key={m.id}
                onClick={() => { setYtMode(m.id); if (searchQuery) setTimeout(() => doSearch(searchQuery, 1), 0); }}
                className={`px-3 py-2 text-xs transition-all whitespace-nowrap ${
                  ytMode === m.id ? "bg-gray-700 text-white" : "bg-gray-900 text-gray-400 hover:text-white"
                }`}>
                {m.label}
              </button>
            ))}
          </div>
        )}
        </>}

        <button onClick={handleSearch} disabled={!searchQuery.trim() || loading}
          className="px-4 py-2.5 rounded-xl bg-purple-600 text-white disabled:opacity-40 flex items-center gap-2 text-sm font-medium">
          {loading ? <Loader size={14} className="animate-spin" /> : <Search size={14} />} Cerca
        </button>
      </div>

      {/* Keyword suggestions (idee correlate) */}
      {suggestions.length > 0 && source !== "youtube" && (
        <div className="flex flex-wrap gap-2 mb-5 items-center">
          <span className="text-xs text-gray-500">Idee correlate:</span>
          {suggestions.map(kw => (
            <button key={kw} onClick={() => { setSearchQuery(kw); doSearch(kw, 1); }}
              className="text-xs px-3 py-1.5 rounded-lg transition-all border border-gray-700 bg-gray-800 text-gray-400 hover:text-white hover:border-gray-500">
              {kw}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {loading && results.length === 0 && (
        <div className="flex items-center justify-center py-20 gap-3">
          <Loader size={18} className="animate-spin text-purple-400" />
          <span className="text-gray-500 text-sm">Cerco B-roll...</span>
        </div>
      )}

      {!loading && results.length === 0 && searchQuery && (
        <div className="text-center py-20">
          <Film size={40} className="text-gray-700 mx-auto mb-3" />
          <div className="text-gray-500">Nessun risultato per "{searchQuery}"</div>
          <div className="text-xs text-gray-600 mt-1">Prova un'altra keyword o cambia i filtri</div>
        </div>
      )}

      {results.length > 0 && (
        <>
          {/* Selection bar */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button onClick={selectAll}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                {selectedIds.size === results.length ? <CheckSquare size={13} className="text-purple-400" /> : <Square size={13} />}
                {selectedIds.size === results.length ? "Deseleziona tutti" : "Seleziona tutti"}
              </button>
              <span className="text-xs text-gray-500">{results.length} clip · {orientation === "portrait" ? "9:16" : "16:9"}</span>
            </div>

            {selectedIds.size > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-purple-400 font-medium">{selectedIds.size} selezionat{selectedIds.size === 1 ? "a" : "e"}</span>
                <button
                  onClick={downloadSelected}
                  disabled={downloading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 text-white disabled:opacity-50 transition-all"
                >
                  {downloading ? <Loader size={12} className="animate-spin" /> : <Package size={12} />}
                  Scarica ZIP ({selectedIds.size} clip)
                </button>
                <button onClick={() => setSelectedIds(new Set())}
                  className="text-xs text-gray-500 hover:text-white transition-colors">
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <div className={`grid gap-3 ${(source === "youtube" && mediaType !== "image") || orientation === "landscape" ? "grid-cols-3" : "grid-cols-4"}`}>
            {results.map(clip => (
              <ClipCard
                key={clip.id}
                clip={clip}
                onSelect={setSelectedClip}
                selected={selectedIds.has(clip.id)}
                onToggleSelect={toggleSelect}
                onSave={saveClip}
                saved={savedIds.has(clip.id)}
              />
            ))}
          </div>

          {/* Load more */}
          {mediaType !== "image" && source !== "youtube" && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => doSearch(searchQuery, page + 1)}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-gray-700 text-sm text-gray-400 hover:text-white hover:border-gray-500 transition-all disabled:opacity-40"
              >
                {loading ? <Loader size={13} className="animate-spin" /> : null}
                Carica altri
              </button>
            </div>
          )}
        </>
      )}
      </>}

      {/* Detail panel */}
      {selectedClip && <DetailPanel clip={selectedClip} onClose={() => setSelectedClip(null)} onSave={saveClip} saved={savedIds.has(selectedClip.id)} />}
    </div>
  );
}
