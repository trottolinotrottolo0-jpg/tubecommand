import { ExternalLink, AlertTriangle } from "lucide-react";
import type { ChannelData } from "../hooks/useChannels";

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function Stat({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="text-xs text-gray-500 uppercase tracking-wide">{icon} {label}</div>
      <div className="text-xl font-bold" style={{ color }}>{value}</div>
    </div>
  );
}

function ChannelCard({ ch, onClick }: { ch: ChannelData; onClick: () => void }) {
  const avgViews = ch.videoCount > 0 ? Math.round(ch.views / ch.videoCount) : 0;
  const channelName = ch.title || ch.label;

  return (
    <div
      className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all"
      style={{ borderTop: `3px solid ${ch.color}` }}
    >
      {/* Channel header */}
      <div className="p-5 flex items-center gap-4">
        {ch.loading ? (
          <div className="w-14 h-14 rounded-full bg-gray-800 animate-pulse flex-shrink-0" />
        ) : ch.thumbnail ? (
          <img src={ch.thumbnail} alt={channelName} className="w-14 h-14 rounded-full object-cover flex-shrink-0" style={{ outline: `2px solid ${ch.color}` }} />
        ) : (
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0" style={{ background: ch.color }}>
            {ch.label[0]}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-white text-base leading-tight">{channelName}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{ch.niche}</p>
              <p className="text-xs mt-1" style={{ color: ch.color + "cc" }}>@{ch.handle}</p>
            </div>
            <a
              href={`https://youtube.com/@${ch.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-white transition-colors flex-shrink-0 mt-0.5"
              title="Apri su YouTube"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 pb-4">
        {ch.error ? (
          <div className="flex items-start gap-2 bg-red-950/40 border border-red-800/40 rounded-xl p-3 text-sm text-red-300">
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
            <span className="text-xs leading-relaxed">{ch.error}</span>
          </div>
        ) : ch.loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Stat label="Iscritti" value={fmt(ch.subscribers)} icon="👥" color={ch.color} />
            <Stat label="Views totali" value={fmt(ch.views)} icon="👁" color={ch.color} />
            <Stat label="Video" value={String(ch.videoCount)} icon="🎬" color={ch.color} />
            <Stat label="Media views" value={fmt(avgViews)} icon="📈" color={ch.color} />
          </div>
        )}
      </div>

      {/* Top video */}
      {ch.videos && ch.videos.length > 0 && (
        <div className="mx-4 mb-4 bg-gray-800/60 rounded-xl p-3">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">🏆 Top video</div>
          <div className="flex gap-3 items-center">
            <img src={ch.videos[0].thumbnail} alt="" className="w-20 h-12 rounded-lg object-cover flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-xs text-white font-medium leading-tight line-clamp-2">{ch.videos[0].title}</div>
              <div className="text-xs text-gray-400 mt-1">{fmt(ch.videos[0].views)} views · {fmt(ch.videos[0].likes)} likes</div>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pb-4">
        <button
          onClick={onClick}
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
          style={{ background: ch.color, color: "#000" }}
        >
          Analytics completa →
        </button>
      </div>
    </div>
  );
}

interface Props {
  channels: ChannelData[];
  setActiveChannel: (i: number) => void;
  setPage: (p: any) => void;
  onRefresh: () => void;
}

export default function Dashboard({ channels, setActiveChannel, setPage, onRefresh: _onRefresh }: Props) {
  const totalViews = channels.reduce((s, c) => s + c.views, 0);
  const totalSubs = channels.reduce((s, c) => s + c.subscribers, 0);
  const totalVideos = channels.reduce((s, c) => s + c.videoCount, 0);
  const loaded = channels.filter((c) => !c.loading && !c.error);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Overview di tutti i tuoi canali YouTube</p>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="text-3xl">👁</div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Views totali</div>
            <div className="text-3xl font-bold text-white">{fmt(totalViews)}</div>
            <div className="text-xs text-gray-600 mt-0.5">su {loaded.length} canali</div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="text-3xl">👥</div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Iscritti totali</div>
            <div className="text-3xl font-bold text-white">{fmt(totalSubs)}</div>
            <div className="text-xs text-gray-600 mt-0.5">audience combinata</div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="text-3xl">🎬</div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Video pubblicati</div>
            <div className="text-3xl font-bold text-white">{totalVideos}</div>
            <div className="text-xs text-gray-600 mt-0.5">in totale</div>
          </div>
        </div>
      </div>

      {/* Channel Cards — stack verticale, più leggibili */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {channels.map((ch, i) => (
          <ChannelCard
            key={ch.handle}
            ch={ch}
            onClick={() => { setActiveChannel(i); setPage("analytics"); }}
          />
        ))}
      </div>
    </div>
  );
}
