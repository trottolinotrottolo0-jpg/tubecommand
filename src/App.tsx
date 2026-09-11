import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Strategist from "./pages/Strategist";
import Monetization from "./pages/Monetization";
import Trending from "./pages/Trending";
import UploadQueue from "./pages/UploadQueue";
import Studio from "./pages/Studio";
import BRoll from "./pages/BRoll";
import ActivityBar, { useJobs } from "./components/ActivityBar";
import { useChannels } from "./hooks/useChannels";

type Page = "dashboard" | "analytics" | "strategist" | "monetization" | "trending" | "upload" | "studio" | "broll";

export default function App() {
  const { channels, forceRefresh } = useChannels();
  const [page, setPage] = useState<Page>("dashboard");
  const [activeChannel, setActiveChannel] = useState(0);
  const jobs = useJobs();

  // Handoff tra pagine (es. "Crea nel Video Studio" da Trending → Big Ideas)
  useEffect(() => {
    const onGoto = (e: Event) => {
      const dest = (e as CustomEvent).detail as Page;
      if (dest) setPage(dest);
    };
    window.addEventListener("tubecommand:goto", onGoto);
    return () => window.removeEventListener("tubecommand:goto", onGoto);
  }, []);

  const ch = channels[activeChannel];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <ActivityBar jobs={jobs} />
      <Sidebar
        channels={channels}
        currentPage={page}
        setPage={setPage}
        activeChannel={activeChannel}
        setActiveChannel={setActiveChannel}
        onRefresh={forceRefresh}
      />
      <main className="ml-64 p-8">
        {page === "dashboard" && (
          <Dashboard channels={channels} setActiveChannel={setActiveChannel} setPage={setPage} onRefresh={forceRefresh} />
        )}
        {page === "analytics" && <Analytics channel={ch} />}
        {page === "strategist" && <Strategist channel={ch} />}
        {page === "monetization" && <Monetization channels={channels} />}
        {page === "trending" && <Trending channels={channels} />}
        {page === "upload" && <UploadQueue />}
        {page === "studio" && <Studio />}
        {page === "broll" && <BRoll />}
      </main>
    </div>
  );
}
