import { LayoutDashboard, BarChart2, Lightbulb, DollarSign, TrendingUp, Settings, RefreshCw, Upload, Clapperboard, Film } from "lucide-react";
import type { ChannelData } from "../hooks/useChannels";

type Page = "dashboard" | "analytics" | "strategist" | "monetization" | "trending" | "upload" | "studio" | "broll";

interface Props {
  channels: ChannelData[];
  currentPage: Page;
  setPage: (p: Page) => void;
  activeChannel: number;
  setActiveChannel: (i: number) => void;
  onRefresh: () => void;
}

const nav = [
  { id: "dashboard",    icon: LayoutDashboard, label: "Dashboard" },
  { id: "analytics",    icon: BarChart2,        label: "Analytics" },
  { id: "strategist",   icon: Lightbulb,        label: "AI Strategist" },
  { id: "monetization", icon: DollarSign,       label: "Monetization" },
  { id: "trending",     icon: TrendingUp,       label: "Trending & Competitor" },
  { id: "upload",       icon: Upload,           label: "Upload Queue" },
  { id: "studio",       icon: Clapperboard,     label: "Video Studio" },
  { id: "broll",        icon: Film,             label: "Content Hub" },
] as const;

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function timeAgo(ts: number) {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 1) return "ora";
  if (mins < 60) return `${mins}m fa`;
  const h = Math.floor(mins / 60);
  return `${h}h fa`;
}

export default function Sidebar({ channels, currentPage, setPage, activeChannel, setActiveChannel, onRefresh }: Props) {
  const loading = channels.some((c) => c.loading);
  const lastFetched = channels.find((c) => c.lastFetched)?.lastFetched;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 flex flex-col z-10">
      {/* Logo */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white text-sm">TC</div>
          <span className="font-bold text-white text-lg">TubeCommand</span>
        </div>
        {lastFetched && (
          <div className="text-xs text-gray-600 mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Aggiornato {timeAgo(lastFetched)}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="p-3 flex-1 overflow-y-auto">
        <div className="text-xs text-gray-500 uppercase tracking-wider px-3 mb-2">Navigation</div>
        {nav.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setPage(id as Page)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-all ${
              currentPage === id
                ? "bg-red-600 text-white font-medium"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}

        {/* Channels */}
        <div className="text-xs text-gray-500 uppercase tracking-wider px-3 mt-5 mb-2">I tuoi canali</div>
        {channels.map((ch, i) => (
          <button
            key={ch.handle}
            onClick={() => setActiveChannel(i)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm transition-all ${
              activeChannel === i ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800/50"
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: ch.color }} />
            <div className="flex-1 text-left min-w-0">
              <div className="text-xs font-semibold text-white truncate">{ch.label}</div>
              {ch.loading ? (
                <div className="h-2 w-14 bg-gray-700 rounded animate-pulse mt-1" />
              ) : ch.error ? (
                <div className="text-xs text-red-400">errore API</div>
              ) : (
                <div className="text-xs text-gray-500">{fmt(ch.subscribers)} iscritti</div>
              )}
            </div>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800 space-y-1">
        <button
          onClick={onRefresh}
          disabled={loading}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 text-sm disabled:opacity-50 transition-all"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          {loading ? "Aggiornamento…" : "Aggiorna ora"}
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 text-sm">
          <Settings size={15} />
          Settings
        </button>
      </div>
    </aside>
  );
}
