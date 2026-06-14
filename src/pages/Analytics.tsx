import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area,
} from "recharts";
import type { ChannelData } from "../hooks/useChannels";
import {
  Eye, ThumbsUp, MessageCircle, ExternalLink, Users, Film, TrendingUp,
  BarChart3, Heart, Trophy, ArrowUpRight,
} from "lucide-react";

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function parseDuration(iso: string) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";
  const h = parseInt(match[1] || "0");
  const m = parseInt(match[2] || "0");
  const s = parseInt(match[3] || "0");
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

interface Props {
  channel: ChannelData;
}

export default function Analytics({ channel: ch }: Props) {
  const videos = ch.videos || [];
  const sorted = [...videos].sort((a, b) => b.views - a.views);
  const maxViews = sorted[0]?.views || 1;

  const chartData = sorted.slice(0, 8).map((v) => ({
    name: v.title.slice(0, 22) + (v.title.length > 22 ? "…" : ""),
    views: v.views,
  }));

  // Andamento nel tempo (per data di pubblicazione)
  const byDate = [...videos]
    .sort((a, b) => +new Date(a.publishedAt) - +new Date(b.publishedAt))
    .map((v) => ({
      date: new Date(v.publishedAt).toLocaleDateString("it-IT", { day: "2-digit", month: "short" }),
      views: v.views,
    }));

  const totalEngagement = videos.reduce((s, v) => s + v.likes + v.comments, 0);
  const totalViews = videos.reduce((s, v) => s + v.views, 0);
  const totalLikes = videos.reduce((s, v) => s + v.likes, 0);
  const engRate = totalViews > 0 ? ((totalEngagement / totalViews) * 100).toFixed(2) : "0.00";
  const avgViews = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;

  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  const kpis = [
    { label: "Iscritti", value: fmt(ch.subscribers), icon: Users, tint: "text-purple-400", bg: "from-purple-500/10" },
    { label: "Views totali", value: fmt(ch.views), icon: Eye, tint: "text-blue-400", bg: "from-blue-500/10" },
    { label: "Video", value: String(ch.videoCount), icon: Film, tint: "text-pink-400", bg: "from-pink-500/10" },
    { label: "Media views/video", value: fmt(avgViews), icon: BarChart3, tint: "text-amber-400", bg: "from-amber-500/10" },
    { label: "Like totali", value: fmt(totalLikes), icon: Heart, tint: "text-rose-400", bg: "from-rose-500/10" },
    { label: "Engagement", value: engRate + "%", icon: TrendingUp, tint: "text-emerald-400", bg: "from-emerald-500/10" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {ch.thumbnail && <img src={ch.thumbnail} className="w-16 h-16 rounded-2xl ring-2 ring-gray-800" alt={ch.title} />}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: ch.color }} />
            <h1 className="text-2xl font-bold text-white">{ch.title}</h1>
            <a href={`https://youtube.com/@${ch.handle}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white">
              <ExternalLink size={14} />
            </a>
          </div>
          <p className="text-gray-400 text-sm mt-0.5">{ch.niche} · {ch.lang}</p>
        </div>
        {ch.lastFetched && (
          <div className="text-xs text-gray-600 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            {new Date(ch.lastFetched).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {kpis.map((k) => (
          <div key={k.label} className={`bg-gradient-to-br ${k.bg} to-transparent bg-gray-900 border border-gray-800 rounded-2xl p-4`}>
            <k.icon size={16} className={`${k.tint} mb-2`} />
            <div className="text-xl font-bold text-white leading-none">{k.value}</div>
            <div className="text-xs text-gray-500 mt-1.5">{k.label}</div>
          </div>
        ))}
      </div>

      {ch.loading ? (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[...Array(2)].map((_, i) => <div key={i} className="h-64 bg-gray-900 rounded-2xl animate-pulse" />)}
        </div>
      ) : videos.length > 0 ? (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 size={14} className="text-gray-500" /> Top video per views
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => fmt(v)} tick={{ fill: "#6b7280", fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fill: "#9ca3af", fontSize: 10 }} />
                  <Tooltip
                    cursor={{ fill: "#ffffff08" }}
                    contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
                    labelStyle={{ color: "#f9fafb" }}
                    formatter={(v: any) => [fmt(Number(v)), "views"]}
                  />
                  <Bar dataKey="views" fill={ch.color} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={14} className="text-gray-500" /> Andamento views per pubblicazione
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={byDate} margin={{ left: -10, right: 8 }}>
                  <defs>
                    <linearGradient id="gradViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={ch.color} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={ch.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 9 }} interval="preserveStartEnd" />
                  <YAxis tickFormatter={(v) => fmt(v)} tick={{ fill: "#6b7280", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
                    labelStyle={{ color: "#f9fafb" }}
                    formatter={(v: any) => [fmt(Number(v)), "views"]}
                  />
                  <Area type="monotone" dataKey="views" stroke={ch.color} strokeWidth={2} fill="url(#gradViews)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Best / worst */}
          {best && worst && best.id !== worst.id && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {[
                { tag: "Miglior video", v: best, color: "text-green-400", icon: Trophy, ring: "ring-green-500/30" },
                { tag: "Da rilanciare", v: worst, color: "text-orange-400", icon: ArrowUpRight, ring: "ring-orange-500/20" },
              ].map(({ tag, v, color, icon: Icon, ring }) => (
                <a key={tag} href={`https://youtube.com/watch?v=${v.id}`} target="_blank" rel="noreferrer"
                  className={`flex gap-3 bg-gray-900 border border-gray-800 rounded-2xl p-3 ring-1 ${ring} hover:border-gray-600 transition-all group`}>
                  <img src={v.thumbnail} className="w-28 h-16 rounded-lg object-cover flex-shrink-0" alt="" />
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs font-semibold flex items-center gap-1.5 ${color}`}><Icon size={12} /> {tag}</div>
                    <div className="text-sm text-white font-medium truncate mt-1 group-hover:text-red-400 transition-colors">{v.title}</div>
                    <div className="flex gap-3 text-xs text-gray-500 mt-1.5">
                      <span>{fmt(v.views)} views</span>
                      <span>{fmt(v.likes)} like</span>
                      <span>{v.views > 0 ? (((v.likes + v.comments) / v.views) * 100).toFixed(1) : "0"}% eng.</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* Video list */}
          <h3 className="text-sm font-semibold text-white mb-3">Tutti i video ({videos.length})</h3>
          <div className="space-y-2">
            {sorted.map((v, i) => {
              const eng = v.views > 0 ? ((v.likes + v.comments) / v.views) * 100 : 0;
              return (
                <a key={v.id} href={`https://youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-3 transition-all group">
                  <div className="text-sm font-bold text-gray-600 w-6 text-right">{i + 1}</div>
                  <div className="relative flex-shrink-0">
                    <img src={v.thumbnail} alt={v.title} className="w-24 h-14 rounded-lg object-cover" />
                    <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded">{parseDuration(v.duration)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium truncate group-hover:text-red-400 transition-colors">{v.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{new Date(v.publishedAt).toLocaleDateString("it-IT")}</div>
                    {/* barra views relativa */}
                    <div className="w-full bg-gray-800 rounded-full h-1 mt-2">
                      <div className="h-1 rounded-full" style={{ width: `${(v.views / maxViews) * 100}%`, background: ch.color }} />
                    </div>
                  </div>
                  <div className="flex gap-5 flex-shrink-0">
                    {[
                      { icon: Eye, val: v.views },
                      { icon: ThumbsUp, val: v.likes },
                      { icon: MessageCircle, val: v.comments },
                    ].map((m, k) => (
                      <div key={k} className="text-center w-12">
                        <m.icon size={12} className="text-gray-500 mx-auto mb-0.5" />
                        <div className="text-xs font-medium text-white">{fmt(m.val)}</div>
                      </div>
                    ))}
                    <div className="text-center w-12">
                      <TrendingUp size={12} className="text-gray-500 mx-auto mb-0.5" />
                      <div className="text-xs font-medium text-emerald-400">{eng.toFixed(1)}%</div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 py-12">Nessun video trovato</div>
      )}
    </div>
  );
}
