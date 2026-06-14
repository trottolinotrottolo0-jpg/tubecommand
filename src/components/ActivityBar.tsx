import { useEffect, useState } from "react";
import { Loader, Check, AlertCircle, X, Download, Image as ImageIcon, Film } from "lucide-react";

const SERVER = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

export interface Job {
  id: string;
  type: "export" | "generate";
  label: string;
  status: "running" | "done" | "error";
  progress: number;
  result: { url?: string; streamUrl?: string; kind?: string; urls?: string[] } | null;
  error: string | null;
  createdAt: number;
  updatedAt: number;
}

// Hook condiviso: poll dei job globali ogni 2s
export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const r = await fetch(`${SERVER}/api/jobs`);
        const d = await r.json();
        if (alive) setJobs(d.jobs || []);
      } catch { /* server giù: ignora */ }
    };
    tick();
    const iv = setInterval(tick, 2000);
    return () => { alive = false; clearInterval(iv); };
  }, []);
  return jobs;
}

export default function ActivityBar({ jobs }: { jobs: Job[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const visible = jobs.filter(j => !dismissed.has(j.id) && (j.status === "running" || Date.now() - j.updatedAt < 120000));

  const dismiss = async (id: string) => {
    setDismissed(prev => new Set([...prev, id]));
    try { await fetch(`${SERVER}/api/jobs/${id}`, { method: "DELETE" }); } catch {}
  };

  if (visible.length === 0) return null;

  return (
    <div className="fixed top-3 right-4 z-50 flex flex-col gap-2 w-80">
      {visible.map(job => {
        const Icon = job.type === "generate" ? (job.result?.kind === "video" ? Film : ImageIcon) : Film;
        const firstAsset = job.result?.url || job.result?.urls?.[0];
        return (
          <div key={job.id} className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-3 animate-[slideIn_.2s_ease-out]">
            <div className="flex items-start gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                job.status === "running" ? "bg-purple-500/20" : job.status === "done" ? "bg-green-500/20" : "bg-red-500/20"
              }`}>
                {job.status === "running" ? <Loader size={15} className="animate-spin text-purple-400" />
                  : job.status === "done" ? <Check size={15} className="text-green-400" />
                  : <AlertCircle size={15} className="text-red-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-gray-300 mb-0.5">
                  <Icon size={11} className="text-gray-500 flex-shrink-0" />
                  <span className="truncate font-medium">{job.label}</span>
                </div>
                {job.status === "running" && (
                  <>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 mt-1.5">
                      <div className="bg-purple-500 h-1.5 rounded-full transition-all duration-700" style={{ width: `${job.progress}%` }} />
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">{job.progress}% · in corso</div>
                  </>
                )}
                {job.status === "done" && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-green-400">Completato</span>
                    {job.type === "export" && job.result?.url && (
                      <a href={job.result.url} download className="text-[11px] text-purple-300 hover:text-white flex items-center gap-1">
                        <Download size={10} /> Scarica
                      </a>
                    )}
                    {job.type === "generate" && firstAsset && (
                      <a href={firstAsset} target="_blank" rel="noreferrer" className="text-[11px] text-purple-300 hover:text-white">
                        Apri asset
                      </a>
                    )}
                  </div>
                )}
                {job.status === "error" && (
                  <div className="text-[11px] text-red-400 mt-0.5 truncate" title={job.error || ""}>{job.error}</div>
                )}
              </div>
              <button onClick={() => dismiss(job.id)} className="text-gray-600 hover:text-white flex-shrink-0"><X size={13} /></button>
            </div>
          </div>
        );
      })}
      <style>{`@keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }`}</style>
    </div>
  );
}
