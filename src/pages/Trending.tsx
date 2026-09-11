import { useState } from "react";
import { TrendingUp, Search, ExternalLink, Users, Filter, Sparkles, Lightbulb, Loader, Wand2, X } from "lucide-react";
import type { ChannelData } from "../hooks/useChannels";
import { searchYouTube, getChannelByHandle } from "../services/youtube";
import type { SearchResult, ChannelStats } from "../services/youtube";

const SERVER = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

interface BigIdea {
  title: string;
  hook: string;
  angle: string;
  why: string;
  format: "short" | "long";
}

const CHANNEL_ID_MAP: Record<string, string> = {
  gurulandiarecords: "gurulandia",
  HVMANnw: "hvman",
  "MoneyCraft-y8w": "moneycraft",
};

const COMPETITORS: Record<string, { handle: string; label: string }[]> = {
  gurulandiarecords: [
    { handle: "OneMooreTime", label: "One More Time" },
    { handle: "IlBasementDiGazzoli", label: "Il Basement di Gazzoli" },
    { handle: "PulpPodcast", label: "Pulp Podcast" },
  ],
  HVMANnw: [],
  "MoneyCraft-y8w": [
    { handle: "aliabdal", label: "Ali Abdal" },
    { handle: "AndyElliottOfficial", label: "Andy Elliott" },
    { handle: "GrahamStephan", label: "Graham Stephan" },
    { handle: "MeetKevin", label: "Meet Kevin" },
  ],
};

const NICHES = [
  {
    handle: "gurulandiarecords",
    label: "Guru Landia Records",
    color: "#a855f7",
    queries: [
      "clip podcast italiano virale",
      "intervista fabrizio corona",
      "falsissima podcast shorts",
      "podcast clip entertainment italia",
      "intervista vip italiano 2024",
    ],
  },
  {
    handle: "HVMANnw",
    label: "HVMAN",
    color: "#14b8a6",
    queries: [
      "fatti incredibili corpo umano",
      "animali straordinari record",
      "curiosità scientifiche italia",
      "scienza virale shorts italiano",
      "record natura mondo animali",
    ],
  },
  {
    handle: "MoneyCraft-y8w",
    label: "Money Craft",
    color: "#eab308",
    queries: [
      "passive income ideas 2024",
      "how to make money online",
      "financial freedom mindset",
      "productivity money mindset shorts",
      "investing for beginners 2024",
    ],
  },
];

type DurFilter = "any" | "short" | "medium" | "long";
type OrderFilter = "viewCount" | "date" | "relevance";

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

const DUR_LABELS: Record<DurFilter, string> = {
  any: "Tutti",
  short: "Shorts (< 4 min)",
  medium: "Long (4-20 min)",
  long: "Very Long (> 20 min)",
};

const ORDER_LABELS: Record<OrderFilter, string> = {
  viewCount: "Più visti",
  date: "Più recenti",
  relevance: "Più rilevanti",
};

interface Props {
  channels: ChannelData[];
}

export default function Trending({ channels }: Props) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeQuery, setActiveQuery] = useState("");
  const [customQuery, setCustomQuery] = useState("");
  const [creatorFilter, setCreatorFilter] = useState("");
  const [durFilter, setDurFilter] = useState<DurFilter>("any");
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("viewCount");
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"keywords" | "competitors">("keywords");
  const [activeChannelIdx, setActiveChannelIdx] = useState(0);
  const [compData, setCompData] = useState<Record<string, ChannelStats | null>>({});
  const [compLoading, setCompLoading] = useState<Record<string, boolean>>({});
  // Big Ideas
  const [ideas, setIdeas] = useState<BigIdea[]>([]);
  const [patterns, setPatterns] = useState<string[]>([]);
  const [ideasLoading, setIdeasLoading] = useState(false);
  const [ideasError, setIdeasError] = useState("");
  const [showIdeas, setShowIdeas] = useState(false);

  const generateIdeas = async () => {
    if (results.length === 0) return;
    setShowIdeas(true); setIdeasLoading(true); setIdeasError(""); setIdeas([]); setPatterns([]);
    try {
      const r = await fetch(`${SERVER}/api/ideas/generate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: CHANNEL_ID_MAP[activeChannel?.handle] || "gurulandia",
          niche: activeNiche.label,
          videos: results.map(r => ({ title: r.title, channel: r.channelTitle, views: r.viewCount })),
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setIdeas(data.ideas || []);
      setPatterns(data.patterns || []);
    } catch (e) { setIdeasError(e instanceof Error ? e.message : "Errore"); }
    setIdeasLoading(false);
  };

  // Manda l'idea al Video Studio (seed via localStorage, lo Studio lo legge all'avvio)
  const sendToStudio = (idea: BigIdea) => {
    localStorage.setItem("studio_seed_idea", idea.hook ? `${idea.title}. ${idea.angle}` : idea.title);
    window.dispatchEvent(new CustomEvent("tubecommand:goto", { detail: "studio" }));
  };

  const activeNiche = NICHES[activeChannelIdx];
  const activeChannel = channels[activeChannelIdx];
  const competitors = COMPETITORS[activeChannel?.handle] || [];

  const search = async (q: string) => {
    setLoading(true);
    setActiveQuery(q);
    setError("");
    try {
      const opts: Parameters<typeof searchYouTube>[2] = {
        order: orderFilter,
      };
      if (durFilter !== "any") opts.videoDuration = durFilter;
      const data = await searchYouTube(q, 15, opts);
      setResults(data);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const loadCompetitor = async (handle: string) => {
    if (compData[handle] !== undefined) return;
    setCompLoading((p) => ({ ...p, [handle]: true }));
    try {
      const stats = await getChannelByHandle(handle);
      setCompData((p) => ({ ...p, [handle]: stats }));
    } catch {
      setCompData((p) => ({ ...p, [handle]: null }));
    }
    setCompLoading((p) => ({ ...p, [handle]: false }));
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
          <TrendingUp size={18} className="text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Trending & Competitor Research</h1>
          <p className="text-gray-400 text-sm">Keyword calde, long-form e analisi competitor per le tue nicchie</p>
        </div>
      </div>

      {/* Channel selector */}
      <div className="flex gap-2 mb-5">
        {NICHES.map((n, i) => (
          <button
            key={n.handle}
            onClick={() => setActiveChannelIdx(i)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all border"
            style={
              activeChannelIdx === i
                ? { background: n.color, color: "#000", borderColor: n.color }
                : { color: n.color, borderColor: n.color + "44", background: n.color + "11" }
            }
          >
            {n.label}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-900 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab("keywords")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "keywords" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"}`}
        >
          🔍 Keyword Trends
        </button>
        <button
          onClick={() => { setTab("competitors"); competitors.forEach((c) => loadCompetitor(c.handle)); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "competitors" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"}`}
        >
          👥 Competitor ({competitors.length})
        </button>
      </div>

      {tab === "keywords" && (
        <div>
          {/* Quick keyword buttons */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Keyword rapide — {activeNiche.label}</div>
            <div className="flex flex-wrap gap-2">
              {activeNiche.queries.map((q) => (
                <button
                  key={q}
                  onClick={() => search(q)}
                  className="text-xs px-3 py-2 rounded-full border transition-all font-medium"
                  style={
                    activeQuery === q
                      ? { background: activeNiche.color, color: "#000", borderColor: activeNiche.color }
                      : { color: activeNiche.color, borderColor: activeNiche.color + "44", background: activeNiche.color + "11" }
                  }
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Search + Filters */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-5">
            <div className="flex gap-3 mb-3">
              <input
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && customQuery && search(customQuery)}
                placeholder="Cerca keyword, hashtag o topic…"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gray-600"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2.5 rounded-xl border text-sm transition-all flex items-center gap-1.5 ${showFilters ? "bg-gray-700 text-white border-gray-600" : "border-gray-700 text-gray-400 hover:text-white"}`}
              >
                <Filter size={14} />
                Filtri
              </button>
              <button
                onClick={() => customQuery && search(customQuery)}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition-all flex items-center gap-2"
              >
                <Search size={14} />
                Cerca
              </button>
            </div>

            {/* Filter row */}
            {showFilters && (
              <div className="border-t border-gray-800 pt-3 space-y-3">
                {/* Duration */}
                <div>
                  <div className="text-xs text-gray-500 mb-2">Durata video</div>
                  <div className="flex flex-wrap gap-2">
                    {(["any", "short", "medium", "long"] as DurFilter[]).map((d) => (
                      <button
                        key={d}
                        onClick={() => setDurFilter(d)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${durFilter === d ? "bg-blue-600 text-white border-blue-600" : "border-gray-700 text-gray-400 hover:text-white"}`}
                      >
                        {DUR_LABELS[d]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Order */}
                <div>
                  <div className="text-xs text-gray-500 mb-2">Ordina per</div>
                  <div className="flex gap-2">
                    {(["viewCount", "date", "relevance"] as OrderFilter[]).map((o) => (
                      <button
                        key={o}
                        onClick={() => setOrderFilter(o)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${orderFilter === o ? "bg-blue-600 text-white border-blue-600" : "border-gray-700 text-gray-400 hover:text-white"}`}
                      >
                        {ORDER_LABELS[o]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Creator filter */}
                <div>
                  <div className="text-xs text-gray-500 mb-2">Filtra per creator (handle YouTube)</div>
                  <div className="flex gap-2">
                    <input
                      value={creatorFilter}
                      onChange={(e) => setCreatorFilter(e.target.value)}
                      placeholder="Es: aliabdal, GrahamStephan…"
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none"
                    />
                    {creatorFilter && (
                      <button onClick={() => setCreatorFilter("")} className="text-xs text-gray-500 hover:text-white px-2">✕</button>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Cerca solo nei video di quel creator</div>
                </div>

                <button
                  onClick={() => { if (customQuery || activeQuery) search(customQuery || activeQuery); }}
                  className="w-full py-2 rounded-lg bg-gray-800 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-all"
                >
                  Applica filtri e cerca di nuovo
                </button>
              </div>
            )}
          </div>

          {error && <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 text-red-300 text-sm mb-4">⚠ {error}</div>}

          {loading && (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-gray-900 rounded-xl animate-pulse" />)}
            </div>
          )}

          {!loading && results.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-gray-500 flex gap-3">
                  <span>Risultati: <span className="text-gray-300 font-medium">"{activeQuery}"</span></span>
                  {durFilter !== "any" && <span className="text-blue-400">· {DUR_LABELS[durFilter]}</span>}
                  <span className="text-gray-500">· {ORDER_LABELS[orderFilter]}</span>
                </div>
                <button onClick={generateIdeas} disabled={ideasLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white disabled:opacity-50 hover:opacity-90 transition-all">
                  {ideasLoading ? <Loader size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  Genera Big Ideas
                </button>
              </div>

              {/* Pannello Big Ideas */}
              {showIdeas && (
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/30 rounded-2xl p-5 mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-white font-semibold">
                      <Lightbulb size={16} className="text-purple-400" /> Big Ideas da questi virali
                    </div>
                    <button onClick={() => setShowIdeas(false)} className="text-gray-500 hover:text-white"><X size={15} /></button>
                  </div>

                  {ideasLoading && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm py-6 justify-center">
                      <Loader size={14} className="animate-spin" /> Analizzo i pattern virali e genero idee…
                    </div>
                  )}
                  {ideasError && <div className="text-red-400 text-sm">{ideasError}</div>}

                  {!ideasLoading && patterns.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {patterns.map((p, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-200 border border-purple-500/20">{p}</span>
                      ))}
                    </div>
                  )}

                  {!ideasLoading && ideas.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {ideas.map((idea, i) => (
                        <div key={i} className="bg-gray-900/70 border border-gray-800 rounded-xl p-3.5 flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-sm text-white font-semibold leading-snug">{idea.title}</div>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${idea.format === "short" ? "bg-pink-500/20 text-pink-300" : "bg-blue-500/20 text-blue-300"}`}>{idea.format}</span>
                          </div>
                          <div className="text-xs text-gray-400"><span className="text-gray-500">Hook:</span> "{idea.hook}"</div>
                          <div className="text-xs text-gray-500">{idea.angle}</div>
                          <div className="text-xs text-emerald-400/80 flex items-center gap-1"><TrendingUp size={11} /> {idea.why}</div>
                          <button onClick={() => sendToStudio(idea)}
                            className="mt-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-all">
                            <Wand2 size={12} /> Crea nel Video Studio
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="space-y-2">
                {results.map((r, i) => (
                  <a
                    key={r.id}
                    href={`https://youtube.com/watch?v=${r.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-3 transition-all group"
                  >
                    <span className="text-sm font-bold text-gray-600 w-5 text-right flex-shrink-0">{i + 1}</span>
                    <img src={r.thumbnail} alt="" className="w-24 h-14 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white font-medium line-clamp-2 group-hover:text-red-400 leading-tight">{r.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{r.channelTitle} · {new Date(r.publishedAt).toLocaleDateString("it-IT")}</div>
                    </div>
                    <div className="flex-shrink-0 text-right min-w-[60px]">
                      {r.viewCount !== undefined && (
                        <div className="text-base font-bold text-white">{fmt(r.viewCount)}</div>
                      )}
                      <div className="text-xs text-gray-600">views</div>
                    </div>
                    <ExternalLink size={14} className="text-gray-600 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "competitors" && (
        <div>
          {competitors.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center text-gray-500">
              Nessun competitor configurato per questo canale.
            </div>
          ) : (
            <div className="space-y-4">
              {competitors.map((comp) => {
                const data = compData[comp.handle];
                const isLoading = compLoading[comp.handle];
                return (
                  <div key={comp.handle} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                          <Users size={16} className="text-gray-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">{comp.label}</div>
                          <div className="text-xs text-gray-500">@{comp.handle}</div>
                        </div>
                      </div>
                      <a href={`https://youtube.com/@${comp.handle}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white">
                        <ExternalLink size={14} />
                      </a>
                    </div>

                    {isLoading ? (
                      <div className="grid grid-cols-3 gap-3">
                        {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-800 rounded-lg animate-pulse" />)}
                      </div>
                    ) : data === null ? (
                      <div className="text-xs text-red-400 bg-red-900/20 rounded-lg p-3">
                        Canale non trovato. Verifica il handle su YouTube.
                      </div>
                    ) : data ? (
                      <>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div className="bg-gray-800 rounded-xl p-3 text-center">
                            <div className="text-xs text-gray-500 mb-1">👥 Iscritti</div>
                            <div className="text-lg font-bold text-white">{fmt(data.subscribers)}</div>
                          </div>
                          <div className="bg-gray-800 rounded-xl p-3 text-center">
                            <div className="text-xs text-gray-500 mb-1">👁 Views totali</div>
                            <div className="text-lg font-bold text-white">{fmt(data.views)}</div>
                          </div>
                          <div className="bg-gray-800 rounded-xl p-3 text-center">
                            <div className="text-xs text-gray-500 mb-1">🎬 Video</div>
                            <div className="text-lg font-bold text-white">{data.videoCount}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setTab("keywords"); setCustomQuery(comp.label); search(comp.label + " best videos 2024"); }}
                            className="flex-1 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-lg py-2 transition-all"
                          >
                            🔍 Cerca i loro top video
                          </button>
                          <button
                            onClick={() => { setTab("keywords"); setDurFilter("short"); setCustomQuery(comp.label); search(comp.label + " shorts"); }}
                            className="flex-1 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-lg py-2 transition-all"
                          >
                            📱 Cerca i loro Shorts
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-gray-500">Caricamento…</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
