import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { ChannelData } from "../hooks/useChannels";

const YPP_SUBS = 1000;
const YPP_HOURS = 4000;

function fmtDays(d: number): { label: string; color: string } {
  if (d <= 0) return { label: "✅ Già raggiunto", color: "#10b981" };
  if (d < 7)  return { label: `${d} giorni`, color: "#10b981" };
  if (d < 30) return { label: `~${Math.ceil(d / 7)} settimane`, color: "#f59e0b" };
  if (d < 180) return { label: `~${Math.ceil(d / 30)} mesi`, color: "#f59e0b" };
  if (d < 365) return { label: `~${Math.ceil(d / 30)} mesi`, color: "#ef4444" };
  return { label: `~${(d / 365).toFixed(1)} anni`, color: "#ef4444" };
}

function estimateWatchHours(ch: ChannelData): number {
  if (!ch.videos || ch.videos.length === 0) return Math.round((ch.views * 4) / 60);
  const avgDurSec = ch.videos.reduce((s, v) => {
    const m = v.duration?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!m) return s + 240;
    return s + parseInt(m[1] || "0") * 3600 + parseInt(m[2] || "0") * 60 + parseInt(m[3] || "0");
  }, 0) / ch.videos.length;
  return Math.round((ch.views * avgDurSec * 0.4) / 3600);
}

function estimateDailySubGrowth(ch: ChannelData): number {
  if (!ch.videos || ch.videos.length < 2) return 0.3;
  const oldest = ch.videos[ch.videos.length - 1];
  const days = Math.max(1, (Date.now() - new Date(oldest.publishedAt).getTime()) / 86400000);
  return ch.subscribers / days;
}

interface Props {
  channel: ChannelData | null;
  onClose: () => void;
}

export default function CalcDrawer({ channel: ch, onClose }: Props) {
  const [videosPerDay, setVideosPerDay] = useState(1);

  useEffect(() => {
    if (ch) setVideosPerDay(1);
  }, [ch?.handle]);

  if (!ch) return null;

  const baseGrowth = Math.max(estimateDailySubGrowth(ch), 0.05);
  const estimatedHours = estimateWatchHours(ch);

  // sub growth scales with video frequency (baseline = 1 video/day)
  const adjustedSubGrowth = baseGrowth * videosPerDay;

  const subsMissing = Math.max(0, YPP_SUBS - ch.subscribers);
  const daysForSubs = subsMissing > 0 ? Math.ceil(subsMissing / adjustedSubGrowth) : 0;

  const avgViewsPerVideo = ch.videoCount > 0 ? ch.views / ch.videoCount : 60;
  const avgDurMin = ch.videos && ch.videos.length > 0
    ? ch.videos.reduce((s, v) => {
        const m = v.duration?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!m) return s + 4;
        return s + parseInt(m[1] || "0") * 60 + parseInt(m[2] || "0") + parseInt(m[3] || "0") / 60;
      }, 0) / ch.videos.length
    : 4;

  const hoursMissing = Math.max(0, YPP_HOURS - estimatedHours);
  const dailyNewHours = videosPerDay * avgViewsPerVideo * (avgDurMin / 60) * 0.4;
  const daysForHours = hoursMissing > 0 && dailyNewHours > 0 ? Math.ceil(hoursMissing / dailyNewHours) : 0;
  const daysTotal = Math.max(daysForSubs, daysForHours);

  const subsResult = fmtDays(daysForSubs);
  const hoursResult = fmtDays(daysForHours);
  const totalResult = fmtDays(daysTotal);

  const presets = [
    { label: "1 vid/settimana", val: 1 / 7 },
    { label: "3/settimana", val: 3 / 7 },
    { label: "1/giorno", val: 1 },
    { label: "2/giorno", val: 2 },
    { label: "3/giorno", val: 3 },
    { label: "5/giorno", val: 5 },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-screen w-96 bg-gray-900 border-l border-gray-800 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800" style={{ borderTop: `3px solid ${ch.color}` }}>
          <div className="flex items-center gap-3">
            {ch.thumbnail
              ? <img src={ch.thumbnail} className="w-9 h-9 rounded-full object-cover" alt={ch.title} />
              : <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: ch.color }}>{ch.label[0]}</div>
            }
            <div>
              <div className="font-semibold text-white text-sm">{ch.title || ch.label}</div>
              <div className="text-xs text-gray-500">🧮 Calcolatore monetizzazione</div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        {/* Scroll content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          {/* Current status */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Situazione attuale</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-gray-800 rounded-xl px-4 py-2.5">
                <span className="text-sm text-gray-300">👥 Iscritti</span>
                <span className="text-sm font-bold text-white">{ch.subscribers.toLocaleString()} / 1.000</span>
              </div>
              <div className="flex justify-between items-center bg-gray-800 rounded-xl px-4 py-2.5">
                <span className="text-sm text-gray-300">⏱ Watch hours (stima)</span>
                <span className="text-sm font-bold text-white">{estimatedHours.toLocaleString()} / 4.000h</span>
              </div>
            </div>
          </div>

          {/* Frequency selector */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Quanti video pubblichi?</div>

            {/* Preset pills */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {presets.map((p) => {
                const active = Math.abs(videosPerDay - p.val) < 0.05;
                return (
                  <button
                    key={p.label}
                    onClick={() => setVideosPerDay(p.val)}
                    className="py-2 rounded-xl text-xs font-semibold transition-all border"
                    style={active
                      ? { background: ch.color, color: "#000", borderColor: ch.color }
                      : { color: ch.color, borderColor: ch.color + "44", background: ch.color + "11" }
                    }
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Slider */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>1/settimana</span>
                <span className="font-bold text-white" style={{ color: ch.color }}>
                  {videosPerDay >= 1
                    ? `${Number.isInteger(videosPerDay) ? videosPerDay : videosPerDay.toFixed(1)} video/giorno`
                    : `${Math.round(videosPerDay * 7)} video/settimana`}
                </span>
                <span>5/giorno</span>
              </div>
              <input
                type="range"
                min={0.14}
                max={5}
                step={0.14}
                value={videosPerDay}
                onChange={(e) => setVideosPerDay(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: ch.color }}
              />
            </div>
          </div>

          {/* Results */}
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Proiezione con {videosPerDay >= 1 ? `${Math.round(videosPerDay)} video/giorno` : `${Math.round(videosPerDay * 7)} video/settimana`}</div>
            <div className="space-y-2">
              <div className="bg-gray-800 rounded-xl px-4 py-3 flex justify-between items-center">
                <span className="text-sm text-gray-400">👥 1.000 iscritti</span>
                <span className="text-sm font-bold" style={{ color: subsResult.color }}>{subsResult.label}</span>
              </div>
              <div className="bg-gray-800 rounded-xl px-4 py-3 flex justify-between items-center">
                <span className="text-sm text-gray-400">⏱ 4.000 watch hours</span>
                <span className="text-sm font-bold" style={{ color: hoursResult.color }}>{hoursResult.label}</span>
              </div>
              <div className="border rounded-xl px-4 py-4 flex justify-between items-center" style={{ borderColor: ch.color + "66", background: ch.color + "11" }}>
                <span className="text-sm font-semibold text-white">🏆 Monetizzazione</span>
                <span className="text-lg font-bold" style={{ color: totalResult.color }}>{totalResult.label}</span>
              </div>
            </div>
          </div>

          {/* Bottleneck advice */}
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">💡 Collo di bottiglia</div>
            <div className="text-sm text-gray-300">
              {daysForSubs > daysForHours
                ? <>Gli <strong className="text-white">iscritti</strong> sono il limite principale. Concentrati su titoli click-bait e condivisioni per crescere più veloce.</>
                : daysForHours > 0
                  ? <>Le <strong className="text-white">watch hours</strong> sono il limite. Pubblica più video long-form (8+ min) per accumularle.</>
                  : <span className="text-green-400">Stai per farcela — continua così! 🚀</span>
              }
            </div>
          </div>

          <div className="text-xs text-gray-600 text-center pb-2">
            Stima basata sul tasso di crescita storico del canale. La crescita reale dipende da molti fattori.
          </div>
        </div>
      </div>
    </>
  );
}
