import { useState } from "react";
import { Calculator } from "lucide-react";
import type { ChannelData } from "../hooks/useChannels";
import CalcDrawer from "../components/CalcDrawer";

// YouTube Partner Program requirements
const YPP_SUBS = 1000;
const YPP_HOURS = 4000; // watch hours (12 months)
// YPP_SHORTS_VIEWS = 10M views (alternative path, shown in UI)


function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

// Rough watch hours estimate: views × avg duration (assume 3 min for shorts/clip, 8 min for long)
function estimateWatchHours(ch: ChannelData): number {
  if (!ch.videos || ch.videos.length === 0) {
    // fallback: assume 4 min avg
    return Math.round((ch.views * 4) / 60);
  }
  const avgDurSec = ch.videos.reduce((s, v) => {
    const m = v.duration?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!m) return s + 240;
    const h = parseInt(m[1] || "0") * 3600;
    const min = parseInt(m[2] || "0") * 60;
    const sec = parseInt(m[3] || "0");
    return s + h + min + sec;
  }, 0) / ch.videos.length;
  // estimate: total views × avg duration × 40% retention / 3600
  return Math.round((ch.views * avgDurSec * 0.4) / 3600);
}

// Days to reach target based on recent growth
function daysToTarget(current: number, target: number, dailyGrowth: number): number | null {
  if (current >= target) return 0;
  if (dailyGrowth <= 0) return null;
  return Math.ceil((target - current) / dailyGrowth);
}

function formatDays(d: number | null): string {
  if (d === null) return "∞";
  if (d === 0) return "✅ Raggiunto";
  if (d < 7) return `${d} giorni`;
  if (d < 30) return `~${Math.ceil(d / 7)} settimane`;
  if (d < 365) return `~${Math.ceil(d / 30)} mesi`;
  return `~${(d / 365).toFixed(1)} anni`;
}

function estimateDailySubGrowth(ch: ChannelData): number {
  // Heuristic: if we have videos, estimate from recency
  if (!ch.videos || ch.videos.length < 2) return 0.3;
  const oldest = ch.videos[ch.videos.length - 1];
  const daysSinceFirst = Math.max(1, (Date.now() - new Date(oldest.publishedAt).getTime()) / 86400000);
  return ch.subscribers / daysSinceFirst;
}

// Monetization tips per channel niche
const TIPS: Record<string, string[]> = {
  gurulandiarecords: [
    "Pubblica almeno 3 clip/settimana da 60–90 sec per massimizzare gli Shorts views",
    "Aggiungi un video long-form (8-12 min) ogni 2 settimane per accumulare watch hours",
    "Tag intervistati famosi nei titoli aumenta i click organici del 40%+",
    "Usa le Shorts per spingere traffico verso i long-form: +watch hours",
  ],
  HVMANnw: [
    "Pubblica 1 video long-form (6-10 min) ogni settimana: massimizza le watch hours",
    "Abbina ogni video long a 2-3 Shorts estratti: doppio impatto, stesso contenuto",
    "Il format 'Top 5 fatti' performa il 60% meglio di titoli generici in questo niche",
    "Thumbnail con numeri grandi (es. '5 cose') aumentano il CTR del 30%",
  ],
  "MoneyCraft-y8w": [
    "Video in inglese: pubblica almeno 2x/settimana per competere con i canali US",
    "I video tra 8-15 min hanno i CPM più alti nel niche Finance ($15-40 CPM)",
    "Aggiungi una CTA alla newsletter/link in bio: aumenta il valore dell'audience",
    "Usa titoli 'How I made $X' o 'Why I quit my job' — CTR altissimo nel niche",
  ],
};

// ─────────────────────────────────────────────────────────────────────────────

interface ChannelMonetProps {
  ch: ChannelData;
  onOpenCalc: () => void;
}

function ChannelMonetCard({ ch, onOpenCalc }: ChannelMonetProps) {
  const estimatedHours = estimateWatchHours(ch);
  const subsProgress = Math.min((ch.subscribers / YPP_SUBS) * 100, 100);
  const hoursProgress = Math.min((estimatedHours / YPP_HOURS) * 100, 100);
  const dailyGrowth = estimateDailySubGrowth(ch);

  const daysForSubs = daysToTarget(ch.subscribers, YPP_SUBS, dailyGrowth);
  const daysForHours = daysToTarget(estimatedHours, YPP_HOURS, dailyGrowth * 4);

  const bottleneck = ch.subscribers >= YPP_SUBS
    ? { label: "Watch Hours", days: daysForHours }
    : daysForSubs !== null && daysForHours !== null
      ? daysForSubs > daysForHours ? { label: "Subscribers", days: daysForSubs } : { label: "Watch Hours", days: daysForHours }
      : { label: "Subscribers", days: daysForSubs };

  const isMonetized = ch.subscribers >= YPP_SUBS && estimatedHours >= YPP_HOURS;

  const tips = TIPS[ch.handle] || [];

  // Frequency scenarios
  const scenarios = [
    { freq: "1 video/settimana", multiplier: 1 },
    { freq: "3 video/settimana", multiplier: 3 },
    { freq: "5 video/settimana", multiplier: 5 },
  ].map((s) => ({
    ...s,
    days: daysToTarget(ch.subscribers, YPP_SUBS, dailyGrowth * s.multiplier),
  }));

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden" style={{ borderTop: `3px solid ${ch.color}` }}>
      {/* Header */}
      <div className="p-5 flex items-center gap-4 border-b border-gray-800">
        {ch.thumbnail ? (
          <img src={ch.thumbnail} className="w-12 h-12 rounded-full object-cover" alt={ch.title} />
        ) : (
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: ch.color }}>
            {ch.label[0]}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white">{ch.title || ch.label}</div>
          <div className="text-xs text-gray-400">{ch.niche}</div>
        </div>
        {isMonetized ? (
          <div className="bg-green-900/40 border border-green-700 text-green-400 text-xs px-3 py-1.5 rounded-full font-semibold">
            ✅ Monetizzabile
          </div>
        ) : (
          <div className="text-xs px-3 py-1.5 rounded-full font-semibold" style={{ background: ch.color + "22", color: ch.color }}>
            ⏳ {formatDays(bottleneck.days)}
          </div>
        )}
      </div>

      <div className="p-5 space-y-5">
        {ch.loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-gray-800 rounded-lg animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* YPP Requirements */}
            <div className="space-y-3">
              <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">📋 Requisiti YouTube Partner Program</div>

              {/* Subscribers */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-gray-300">👥 Iscritti</span>
                  <span className="text-sm font-bold" style={{ color: ch.subscribers >= YPP_SUBS ? "#10b981" : "white" }}>
                    {ch.subscribers.toLocaleString()} / {YPP_SUBS.toLocaleString()}
                    {ch.subscribers >= YPP_SUBS && " ✅"}
                  </span>
                </div>
                <ProgressBar value={ch.subscribers} max={YPP_SUBS} color={ch.subscribers >= YPP_SUBS ? "#10b981" : ch.color} />
                <div className="text-xs text-gray-600 mt-1">{subsProgress.toFixed(1)}% completato · mancano {Math.max(0, YPP_SUBS - ch.subscribers).toLocaleString()} iscritti</div>
              </div>

              {/* Watch Hours */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-gray-300">⏱ Watch Hours (stima)</span>
                  <span className="text-sm font-bold" style={{ color: estimatedHours >= YPP_HOURS ? "#10b981" : "white" }}>
                    {estimatedHours.toLocaleString()} / {YPP_HOURS.toLocaleString()}h
                    {estimatedHours >= YPP_HOURS && " ✅"}
                  </span>
                </div>
                <ProgressBar value={estimatedHours} max={YPP_HOURS} color={estimatedHours >= YPP_HOURS ? "#10b981" : ch.color} />
                <div className="text-xs text-gray-600 mt-1">{hoursProgress.toFixed(1)}% · stima basata su views × durata media × 40% retention · mancano ~{Math.max(0, YPP_HOURS - estimatedHours).toLocaleString()}h</div>
              </div>
            </div>

            {/* Frequency scenarios */}
            {!isMonetized && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">📅 Proiezione per frequenza di pubblicazione</div>
                <div className="grid grid-cols-3 gap-2">
                  {scenarios.map((s) => (
                    <div key={s.freq} className="bg-gray-800 rounded-xl p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">{s.freq}</div>
                      <div className="text-base font-bold text-white">{formatDays(s.days)}</div>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-600 mt-2">* Stima basata sul tasso di crescita attuale degli iscritti</div>
              </div>
            )}

            {/* CPM / Revenue estimate if monetized */}
            {isMonetized && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">💰 Stima Revenue mensile</div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "CPM basso (€2)", rpm: 1.2 },
                    { label: "CPM medio (€5)", rpm: 3 },
                    { label: "CPM alto (€10)", rpm: 6 },
                    { label: "Finance CPM (€20)", rpm: 12 },
                  ].map((est) => {
                    const monthlyViews = (ch.views / Math.max(ch.videoCount, 1)) * 4;
                    const revenue = (monthlyViews / 1000) * est.rpm;
                    return (
                      <div key={est.label} className="bg-gray-800 rounded-xl p-3">
                        <div className="text-xs text-gray-400 mb-1">{est.label}</div>
                        <div className="text-lg font-bold text-green-400">€{revenue.toFixed(0)}/mese</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tips */}
            {tips.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">💡 Consigli per accelerare</div>
                <ul className="space-y-2">
                  {tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span style={{ color: ch.color }} className="flex-shrink-0 mt-0.5">→</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weekly Content Plan */}
            {!isMonetized && (
              <button
                onClick={onOpenCalc}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all hover:opacity-90"
                style={{ borderColor: ch.color + "66", color: ch.color, background: ch.color + "11" }}
              >
                <Calculator size={15} />
                Apri calcolatore → quanto ci metti con X video/giorno?
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface Props {
  channels: ChannelData[];
}

export default function Monetization({ channels }: Props) {
  const [drawerChannel, setDrawerChannel] = useState<ChannelData | null>(null);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">💰 Monetization Tracker</h1>
        <p className="text-gray-400 text-sm mt-1">Quanto manca alla monetizzazione e come arrivarci prima</p>
      </div>

      {/* YPP Quick Reference */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">YouTube Partner Program — Requisiti</div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">👥</span>
            <div><span className="text-white font-bold">1.000</span> <span className="text-gray-400">iscritti</span></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">⏱</span>
            <div><span className="text-white font-bold">4.000h</span> <span className="text-gray-400">watch time (12 mesi)</span></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📱</span>
            <div><span className="text-white font-bold">OPPURE: 10M</span> <span className="text-gray-400">visualizzazioni Shorts (90 giorni)</span></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">✅</span>
            <div><span className="text-gray-400">Account in regola + 2FA attivo</span></div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {channels.map((ch) => (
          <ChannelMonetCard
            key={ch.handle}
            ch={ch}
            onOpenCalc={() => setDrawerChannel(ch)}
          />
        ))}
      </div>

      <CalcDrawer channel={drawerChannel} onClose={() => setDrawerChannel(null)} />
    </div>
  );
}
