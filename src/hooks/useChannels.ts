import { useState, useEffect } from "react";
import { getChannelByHandle, getChannelVideos } from "../services/youtube";
import type { ChannelStats, VideoItem } from "../services/youtube";

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 ore

export const CHANNELS = [
  {
    handle: "gurulandiarecords",
    color: "#a855f7",
    label: "Guru Landia Records",
    niche: "Podcast clip & entertainment italiano",
    lang: "Italian",
    competitors: ["OneMooreTime", "GazzoliBasement", "PulpPodcast"],
    keywords: ["clip podcast italiano", "intervista fabrizio corona", "podcast entertainment italia", "falsissima corona", "clip intervista famosi"],
  },
  {
    handle: "HVMANnw",
    color: "#14b8a6",
    label: "HVMAN",
    niche: "Fatti scientifici su umani e animali",
    lang: "Italian",
    competitors: [],
    keywords: ["fatti incredibili corpo umano", "animali straordinari", "scienza virale italiano", "curiosità natura", "record mondo umani"],
  },
  {
    handle: "MoneyCraft-y8w",
    color: "#eab308",
    label: "Money Craft",
    niche: "Finance & money mindset",
    lang: "English",
    competitors: ["AliAbdal", "AndrewHuberman", "AndyElliott", "GrahamStephan", "MeetKevin"],
    keywords: ["passive income 2024", "how to make money online", "financial freedom", "productivity guru shorts", "money mindset"],
  },
];

export interface ChannelConfig {
  handle: string;
  color: string;
  label: string;
  niche: string;
  lang: string;
  competitors: string[];
  keywords: string[];
}

export interface ChannelData extends ChannelStats {
  color: string;
  label: string;
  niche: string;
  lang: string;
  competitors: string[];
  keywords: string[];
  videos?: VideoItem[];
  loading: boolean;
  error?: string;
  lastFetched?: number;
}

type CacheEntry = {
  stats: ChannelStats;
  videos: VideoItem[];
  timestamp: number;
};

function cacheKey(handle: string) {
  return `tubecommand_ch_${handle}`;
}

function loadFromCache(handle: string): CacheEntry | null {
  try {
    const raw = localStorage.getItem(cacheKey(handle));
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) return null;
    return entry;
  } catch {
    return null;
  }
}

function saveToCache(handle: string, stats: ChannelStats, videos: VideoItem[]) {
  try {
    const entry: CacheEntry = { stats, videos, timestamp: Date.now() };
    localStorage.setItem(cacheKey(handle), JSON.stringify(entry));
  } catch {
    // quota exceeded — ignore
  }
}

export function clearCache() {
  CHANNELS.forEach((c) => localStorage.removeItem(cacheKey(c.handle)));
}

export function useChannels() {
  const [channels, setChannels] = useState<ChannelData[]>(
    CHANNELS.map((c) => ({
      id: "", handle: c.handle, title: c.label, label: c.label, description: "", thumbnail: "",
      subscribers: 0, views: 0, videoCount: 0,
      color: c.color, niche: c.niche, lang: c.lang,
      competitors: c.competitors, keywords: c.keywords,
      loading: true,
    }))
  );

  const fetchChannel = async (c: ChannelConfig, i: number, forceRefresh = false) => {
    // Try cache first
    if (!forceRefresh) {
      const cached = loadFromCache(c.handle);
      if (cached) {
        setChannels((prev) => {
          const next = [...prev];
          next[i] = {
            ...next[i], ...cached.stats,
            videos: cached.videos,
            loading: false,
            lastFetched: cached.timestamp,
          };
          return next;
        });
        return;
      }
    }

    try {
      const stats = await getChannelByHandle(c.handle);
      setChannels((prev) => {
        const next = [...prev];
        next[i] = { ...next[i], ...stats, loading: false, lastFetched: Date.now() };
        return next;
      });
      const videos = await getChannelVideos(stats.id, 15);
      saveToCache(c.handle, stats, videos);
      setChannels((prev) => {
        const next = [...prev];
        next[i] = { ...next[i], videos, lastFetched: Date.now() };
        return next;
      });
    } catch (err: any) {
      setChannels((prev) => {
        const next = [...prev];
        next[i] = { ...next[i], loading: false, error: err.message };
        return next;
      });
    }
  };

  useEffect(() => {
    CHANNELS.forEach((c, i) => fetchChannel(c, i));

    // Auto-refresh every 6 hours
    const interval = setInterval(() => {
      CHANNELS.forEach((c, i) => fetchChannel(c, i, true));
    }, CACHE_TTL_MS);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const forceRefresh = () => {
    clearCache();
    setChannels((prev) => prev.map((ch) => ({ ...ch, loading: true, error: undefined })));
    CHANNELS.forEach((c, i) => fetchChannel(c, i, true));
  };

  return { channels, forceRefresh };
}
