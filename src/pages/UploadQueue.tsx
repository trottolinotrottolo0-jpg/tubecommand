import { useState, useEffect, useCallback } from "react";
import { Upload, CheckCircle, AlertCircle, Loader, RefreshCw, FolderOpen, X, ChevronRight, Clock, Globe, Lock, Sparkles, Zap, Link } from "lucide-react";
import { generateTitleIdeas, generateSEOPackage } from "../services/ai";
import type { SourceVideoContext } from "../services/ai";

const SERVER = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";
const COLOR = "#ff0000";

interface ChannelInfo {
  id: string;
  label: string;
  authenticated: boolean;
  queueCount: number;
}

const CHANNEL_COLORS: Record<string, string> = {
  gurulandia: "#ff0000",
  hvman: "#10b981",
  moneycraft: "#f59e0b",
};

const CHANNEL_NICHES: Record<string, string> = {
  gurulandia: "podcast clip & entertainment italiano",
  hvman: "motivazione & lifestyle",
  moneycraft: "finanza personale & money content",
};

interface VideoItem {
  filename: string;
  title: string;
  sizeMb: number;
  status: "idle" | "uploading" | "done" | "error";
  progress: number;
}

interface PrevDetails {
  description: string;
  tags: string[];
}

interface UploadForm {
  title: string;
  description: string;
  visibility: "public" | "private" | "scheduled";
  scheduleDate: string;
  scheduleTime: string;
}

// ── STATUS BADGE ─────────────────────────────────────────────────────────────

function StatusBadge({ status, progress }: { status: VideoItem["status"]; progress: number }) {
  if (status === "done") return (
    <div className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
      <CheckCircle size={13} /> Pubblicato
    </div>
  );
  if (status === "error") return (
    <div className="flex items-center gap-1.5 text-red-400 text-xs font-medium">
      <AlertCircle size={13} /> Errore
    </div>
  );
  if (status === "uploading") return (
    <div className="flex items-center gap-1.5 text-blue-400 text-xs font-medium">
      <Loader size={13} className="animate-spin" /> Upload {progress}%
    </div>
  );
  return <div className="text-xs text-gray-500">In coda</div>;
}

// ── UPLOAD DRAWER ─────────────────────────────────────────────────────────────

function UploadDrawer({
  video,
  channel,
  onClose,
  onConfirm,
  prevDetails,
  loadingPrev,
}: {
  video: VideoItem;
  channel: ChannelInfo;
  onClose: () => void;
  onConfirm: (form: UploadForm) => void;
  prevDetails: PrevDetails | null;
  loadingPrev: boolean;
}) {
  const niche = CHANNEL_NICHES[channel.id] || "youtube content";
  const tomorrow = new Date(Date.now() + 86400000);
  const defaultDate = tomorrow.toISOString().split("T")[0];

  const [form, setForm] = useState<UploadForm>({
    title: video.title,
    description: "",
    visibility: "public",
    scheduleDate: defaultDate,
    scheduleTime: "18:00",
  });

  const [titleSuggestions, setTitleSuggestions] = useState<{ title: string; angle: string }[]>([]);
  const [loadingTitles, setLoadingTitles] = useState(false);
  const [loadingSEO, setLoadingSEO] = useState(false);
  const [showTitlePicker, setShowTitlePicker] = useState(false);
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceVideo, setSourceVideo] = useState<SourceVideoContext | null>(null);
  const [loadingSource, setLoadingSource] = useState(false);
  const [sourceError, setSourceError] = useState("");

  const ANGLE_COLORS: Record<string, string> = {
    curiosity: "#3b82f6", howto: "#10b981",
    listicle: "#f59e0b", shock: "#ef4444", story: "#a855f7",
  };

  // Pre-fill quando arrivano i dettagli del video precedente
  useEffect(() => {
    if (prevDetails) {
      setForm(f => ({
        ...f,
        description: prevDetails.description || f.description,
      }));
    }
  }, [prevDetails]);

  const update = (k: keyof UploadForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  const optimizeTitle = async () => {
    setLoadingTitles(true);
    setShowTitlePicker(false);
    try {
      const ideas = await generateTitleIdeas(form.title, niche, "Italiano");
      setTitleSuggestions(ideas.slice(0, 4));
      setShowTitlePicker(true);
    } catch {}
    setLoadingTitles(false);
  };

  const loadSourceVideo = async () => {
    if (!sourceUrl.trim()) return;
    setLoadingSource(true);
    setSourceError("");
    setSourceVideo(null);
    try {
      const res = await fetch(`${SERVER}/api/video-info?url=${encodeURIComponent(sourceUrl.trim())}`);
      const data = await res.json();
      if (data.error) { setSourceError(data.error); return; }
      setSourceVideo({ title: data.title, description: data.description, channelTitle: data.channelTitle, tags: data.tags });
    } catch { setSourceError("Errore di connessione al server"); }
    finally { setLoadingSource(false); }
  };

  const [seoError, setSeoError] = useState("");
  const generateSEO = async () => {
    setLoadingSEO(true);
    setSeoError("");
    try {
      const pkg = await generateSEOPackage(form.title, niche, "Italiano", sourceVideo || undefined, channel.id);
      setForm(f => ({ ...f, description: pkg.description }));
    } catch (e) {
      setSeoError(e instanceof Error ? e.message : "Errore generazione SEO");
    }
    setLoadingSEO(false);
  };

  const visOptions = [
    { id: "public",    icon: Globe,  label: "Pubblica ora",   desc: "Visibile subito a tutti" },
    { id: "private",   icon: Lock,   label: "Bozza privata",  desc: "Solo tu puoi vederla" },
    { id: "scheduled", icon: Clock,  label: "Programma",      desc: "Pubblica in una data specifica" },
  ] as const;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-screen w-[520px] bg-gray-900 border-l border-gray-800 z-50 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800" style={{ borderTop: `3px solid ${COLOR}` }}>
          <div>
            <div className="font-bold text-white text-sm">Prepara upload</div>
            <div className="text-xs text-gray-500 mt-0.5">{video.sizeMb} MB · {video.filename.match(/^#\d+/)?.[0]}</div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1"><X size={18} /></button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Sorgente podcast */}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
              <Link size={10} /> Video sorgente (podcast originale)
            </label>
            <div className="flex gap-2">
              <input
                value={sourceUrl}
                onChange={e => { setSourceUrl(e.target.value); setSourceVideo(null); setSourceError(""); }}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-gray-500 placeholder-gray-600"
              />
              <button
                onClick={loadSourceVideo}
                disabled={loadingSource || !sourceUrl.trim()}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all disabled:opacity-40 whitespace-nowrap"
                style={{ background: "#3b82f622", color: "#3b82f6", border: "1px solid #3b82f644" }}
              >
                {loadingSource ? <Loader size={10} className="animate-spin" /> : <Link size={10} />}
                Carica
              </button>
            </div>
            {sourceError && <div className="text-xs text-red-400 mt-1.5">{sourceError}</div>}
            {sourceVideo && (
              <div className="mt-2 bg-blue-900/20 border border-blue-800/40 rounded-xl p-3">
                <div className="text-xs text-blue-300 font-medium truncate">✓ {sourceVideo.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{sourceVideo.channelTitle} · Le keyword vengono usate per il SEO</div>
              </div>
            )}
            <div className="text-xs text-gray-600 mt-1.5">Facoltativo — migliora la descrizione SEO con il contesto dell'episodio originale</div>
          </div>

          {/* Titolo */}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Titolo</label>
            <input
              value={form.title}
              onChange={e => { update("title", e.target.value); setShowTitlePicker(false); }}
              maxLength={100}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gray-500"
            />
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-gray-600">{form.title.length}/100</div>
              <button onClick={optimizeTitle} disabled={loadingTitles || !form.title.trim()}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
                style={{ background: COLOR + "22", color: COLOR }}>
                {loadingTitles ? <Loader size={10} className="animate-spin" /> : <Zap size={10} />}
                Ottimizza titolo
              </button>
            </div>

            {/* Title suggestions */}
            {showTitlePicker && titleSuggestions.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <div className="text-xs text-gray-500 mb-1">Scegli un titolo ottimizzato:</div>
                {titleSuggestions.map((t, i) => (
                  <button key={i} onClick={() => { update("title", t.title); setShowTitlePicker(false); }}
                    className="w-full text-left p-3 rounded-xl border border-gray-700 bg-gray-800 hover:border-gray-500 transition-all">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-1.5 py-0.5 rounded font-medium"
                        style={{ background: (ANGLE_COLORS[t.angle] || "#666") + "22", color: ANGLE_COLORS[t.angle] || "#666" }}>
                        {t.angle}
                      </span>
                    </div>
                    <div className="text-xs text-white leading-snug">{t.title}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Descrizione */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-400 uppercase tracking-wider">Descrizione</label>
              <div className="flex items-center gap-2">
                {loadingPrev && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Loader size={10} className="animate-spin" /> Dal precedente…
                  </div>
                )}
                {prevDetails && !loadingPrev && (
                  <div className="text-xs text-green-500">✓ Dal video precedente</div>
                )}
              </div>
            </div>
            <textarea
              value={form.description}
              onChange={e => update("description", e.target.value)}
              rows={7}
              placeholder="Verrà copiata dal tuo ultimo video pubblicato…"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gray-500 resize-none leading-relaxed"
            />
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-gray-600">{form.description.length}/5000</div>
              <button onClick={generateSEO} disabled={loadingSEO || !form.title.trim()}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
                style={{ background: "#a855f722", color: "#a855f7" }}>
                {loadingSEO ? <Loader size={10} className="animate-spin" /> : <Sparkles size={10} />}
                Genera SEO con AI
              </button>
            </div>
            {seoError && <div className="text-xs text-red-400 mt-1">{seoError}</div>}
          </div>

          {/* Tag info */}
          <div className="bg-gray-800 rounded-xl px-4 py-3 flex items-center gap-2 text-xs text-gray-400">
            🏷️ I tag vengono gestiti automaticamente da YouTube a livello di canale
          </div>

          {/* Visibilità */}
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Visibilità</label>
            <div className="space-y-2">
              {visOptions.map(opt => {
                const Icon = opt.icon;
                const active = form.visibility === opt.id;
                return (
                  <button key={opt.id} onClick={() => update("visibility", opt.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left"
                    style={active
                      ? { borderColor: COLOR, background: COLOR + "15" }
                      : { borderColor: "#374151", background: "transparent" }}
                  >
                    <Icon size={15} style={{ color: active ? COLOR : "#6b7280" }} />
                    <div className="flex-1">
                      <div className="text-sm font-medium" style={{ color: active ? "#fff" : "#9ca3af" }}>{opt.label}</div>
                      <div className="text-xs text-gray-600">{opt.desc}</div>
                    </div>
                    {active && <div className="w-2 h-2 rounded-full" style={{ background: COLOR }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Data/ora se scheduled */}
          {form.visibility === "scheduled" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Data</label>
                <input type="date" value={form.scheduleDate} onChange={e => update("scheduleDate", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gray-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Ora</label>
                <input type="time" value={form.scheduleTime} onChange={e => update("scheduleTime", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-gray-500"
                />
              </div>
              <div className="col-span-2 text-xs text-gray-500 bg-gray-800 rounded-xl p-3">
                📅 Il video verrà caricato come privato e pubblicato automaticamente il {form.scheduleDate} alle {form.scheduleTime}
              </div>
            </div>
          )}

        </div>

        {/* Footer CTA */}
        <div className="p-5 border-t border-gray-800 space-y-2">
          <button
            onClick={() => onConfirm(form)}
            disabled={!form.title.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40"
            style={{ background: COLOR, color: "#fff" }}
          >
            <Upload size={15} />
            {form.visibility === "public" && "Carica e pubblica ora"}
            {form.visibility === "private" && "Carica come bozza"}
            {form.visibility === "scheduled" && `Carica e programma per il ${form.scheduleDate}`}
          </button>
          <button onClick={onClose} className="w-full py-2.5 text-sm text-gray-500 hover:text-white transition-colors">
            Annulla
          </button>
        </div>
      </div>
    </>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────

export default function UploadQueue() {
  const [channels, setChannels] = useState<ChannelInfo[]>([]);
  const [activeChannel, setActiveChannel] = useState<string>("gurulandia");
  const [queue, setQueue] = useState<VideoItem[]>([]);
  const [serverOk, setServerOk] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [prevDetails, setPrevDetails] = useState<PrevDetails | null>(null);
  const [loadingPrev, setLoadingPrev] = useState(false);
  const [authUrl, setAuthUrl] = useState("");
  const [callbackUrl, setCallbackUrl] = useState("");
  const [authError, setAuthError] = useState("");

  const channel = channels.find(c => c.id === activeChannel);
  const chColor = CHANNEL_COLORS[activeChannel] || COLOR;

  const fetchChannels = useCallback(async () => {
    try {
      const res = await fetch(`${SERVER}/api/channels`, { signal: AbortSignal.timeout(2000) });
      const data = await res.json();
      setChannels(data.channels || []);
      setServerOk(true);
    } catch { setServerOk(false); }
  }, []);

  const fetchQueue = useCallback(async (ch: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${SERVER}/api/queue?channel=${ch}`);
      const data = await res.json();
      setQueue(data.queue || []);
    } catch { setQueue([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchChannels(); }, [fetchChannels]);
  useEffect(() => { fetchQueue(activeChannel); setAuthUrl(""); setCallbackUrl(""); setAuthError(""); }, [activeChannel, fetchQueue]);

  const startAuth = async () => {
    setAuthError("");
    try {
      const res = await fetch(`${SERVER}/api/auth-url?channel=${activeChannel}`);
      const data = await res.json();
      setAuthUrl(data.url);
      window.open(data.url, "_blank");
    } catch { setAuthError("Server non raggiungibile"); }
  };

  const submitAuthCode = async () => {
    setAuthError("");
    try {
      const res = await fetch(`${SERVER}/api/auth-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: activeChannel, callbackUrl }),
      });
      const data = await res.json();
      if (data.error) { setAuthError(data.error); return; }
      setAuthUrl(""); setCallbackUrl("");
      fetchChannels();
    } catch { setAuthError("Errore di connessione"); }
  };

  const openDrawer = async (video: VideoItem) => {
    setSelectedVideo(video);
    setPrevDetails(null);
    setLoadingPrev(true);
    try {
      const res = await fetch(`${SERVER}/api/prev-details?channel=${activeChannel}`);
      const data = await res.json();
      setPrevDetails(data.details || null);
    } catch { setPrevDetails(null); }
    finally { setLoadingPrev(false); }
  };

  const pollProgress = useCallback((ch: string, filename: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${SERVER}/api/progress/${encodeURIComponent(filename)}?channel=${ch}`);
        const data = await res.json();
        setQueue(prev => prev.map(v =>
          v.filename === filename ? { ...v, status: data.status, progress: data.progress } : v
        ));
        if (data.status === "done" || data.status === "error") {
          clearInterval(interval);
          fetchQueue(ch);
        }
      } catch { clearInterval(interval); }
    }, 1500);
  }, [fetchQueue]);

  const handleConfirm = async (form: UploadForm) => {
    if (!selectedVideo) return;
    setSelectedVideo(null);
    setQueue(prev => prev.map(v =>
      v.filename === selectedVideo.filename ? { ...v, status: "uploading", progress: 0 } : v
    ));

    try {
      await fetch(`${SERVER}/api/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: activeChannel, filename: selectedVideo.filename, form }),
      });
      pollProgress(activeChannel, selectedVideo.filename);
    } catch {
      setQueue(prev => prev.map(v =>
        v.filename === selectedVideo.filename ? { ...v, status: "error" } : v
      ));
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: chColor + "22" }}>
            <Upload size={18} style={{ color: chColor }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Upload Queue</h1>
            <p className="text-gray-400 text-sm">{channel?.label || "…"} — video da pubblicare</p>
          </div>
        </div>
        <button onClick={() => { fetchQueue(activeChannel); fetchChannels(); }}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-800">
          <RefreshCw size={12} /> Aggiorna
        </button>
      </div>

      {/* Channel tabs */}
      <div className="flex gap-2 mb-5">
        {(channels.length ? channels : [{ id: "gurulandia", label: "Gurulandia Records", authenticated: false, queueCount: 0 }]).map(c => {
          const cc = CHANNEL_COLORS[c.id] || COLOR;
          const active = c.id === activeChannel;
          return (
            <button key={c.id} onClick={() => setActiveChannel(c.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border"
              style={active
                ? { background: cc + "18", borderColor: cc, color: "#fff" }
                : { background: "transparent", borderColor: "#374151", color: "#9ca3af" }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: cc }} />
              {c.label}
              <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: cc + "22", color: cc }}>{c.queueCount}</span>
              {!c.authenticated && <Lock size={11} className="text-gray-500" />}
            </button>
          );
        })}
      </div>

      {/* Server status */}
      {serverOk === false && (
        <div className="bg-red-900/20 border border-red-800/50 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-2 text-red-400 font-medium mb-2">
            <AlertCircle size={15} /> Server non raggiungibile
          </div>
          <div className="text-xs text-gray-400 mb-3">Aprilo in un terminale:</div>
          <code className="block bg-gray-950 text-green-400 text-xs px-4 py-3 rounded-xl">
            cd ~/Desktop/GURULANDIA && node server.mjs
          </code>
        </div>
      )}

      {/* Auth banner per canale non autenticato */}
      {serverOk === true && channel && !channel.authenticated && (
        <div className="bg-yellow-900/15 border border-yellow-700/40 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-2 text-yellow-400 font-medium mb-1.5 text-sm">
            <Lock size={14} /> {channel.label} non è ancora collegato a YouTube
          </div>
          {!authUrl ? (
            <button onClick={startAuth}
              className="mt-1 text-xs px-4 py-2 rounded-xl font-semibold"
              style={{ background: chColor, color: "#fff" }}>
              Collega account YouTube
            </button>
          ) : (
            <div className="mt-2 space-y-2">
              <div className="text-xs text-gray-400">
                1. Si è aperta una finestra Google — accedi con l'account di <b className="text-white">{channel.label}</b>.<br />
                2. Dopo l'autorizzazione, copia l'URL completo dalla barra del browser e incollalo qui:
              </div>
              <div className="flex gap-2">
                <input value={callbackUrl} onChange={e => setCallbackUrl(e.target.value)}
                  placeholder="http://localhost:2500/oauth/callback?code=..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-gray-500" />
                <button onClick={submitAuthCode} disabled={!callbackUrl.trim()}
                  className="text-xs px-4 py-2 rounded-xl font-semibold disabled:opacity-40"
                  style={{ background: chColor, color: "#fff" }}>
                  Conferma
                </button>
              </div>
            </div>
          )}
          {authError && <div className="text-xs text-red-400 mt-2">{authError}</div>}
        </div>
      )}

      {serverOk === true && channel?.authenticated && (
        <div className="flex items-center gap-2 text-green-400 text-xs mb-5">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Server attivo — {channel.label} connesso a YouTube
        </div>
      )}

      {/* Stats */}
      {queue.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "In coda", value: queue.filter(v => v.status === "idle").length, color: "#6b7280" },
            { label: "Pubblicati", value: queue.filter(v => v.status === "done").length, color: "#10b981" },
            { label: "Totale", value: queue.length, color: chColor },
          ].map(s => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3">
          <Loader size={18} className="animate-spin text-gray-500" />
          <span className="text-gray-500 text-sm">Caricamento coda...</span>
        </div>
      ) : queue.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen size={40} className="text-gray-700 mx-auto mb-3" />
          <div className="text-gray-500">Nessun video in coda</div>
        </div>
      ) : (
        <div className="space-y-2">
          {queue.map((v, i) => (
            <div key={v.filename}
              className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-4 flex items-center gap-4 transition-all group"
              style={v.status === "uploading" ? { borderColor: "#3b82f666" } : {}}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ background: chColor + "22", color: chColor }}>
                {i + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{v.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{v.sizeMb} MB</div>
                {v.status === "uploading" && (
                  <div className="mt-2 w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${v.progress}%`, background: COLOR }} />
                  </div>
                )}
              </div>

              <StatusBadge status={v.status} progress={v.progress} />

              {v.status === "idle" && (
                <button
                  onClick={() => openDrawer(v)}
                  disabled={serverOk !== true || !channel?.authenticated}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-30 opacity-0 group-hover:opacity-100"
                  style={{ background: chColor + "22", color: chColor, border: `1px solid ${chColor}44` }}
                >
                  Prepara <ChevronRight size={12} />
                </button>
              )}

              {v.status === "error" && (
                <button onClick={() => openDrawer(v)} disabled={serverOk !== true}
                  className="text-xs px-3 py-2 rounded-xl border border-red-800 text-red-400 hover:bg-red-900/20 transition-all">
                  Riprova
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drawer */}
      {selectedVideo && channel && (
        <UploadDrawer
          video={selectedVideo}
          channel={channel}
          onClose={() => setSelectedVideo(null)}
          onConfirm={handleConfirm}
          prevDetails={prevDetails}
          loadingPrev={loadingPrev}
        />
      )}
    </div>
  );
}
