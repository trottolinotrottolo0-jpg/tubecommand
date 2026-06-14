import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { CHANNELS } from "../hooks/useChannels";

type Status = "Idea" | "Scripting" | "Filming" | "Editing" | "Published";
const STATUSES: Status[] = ["Idea", "Scripting", "Filming", "Editing", "Published"];
const STATUS_COLORS: Record<Status, string> = {
  Idea: "#6b7280",
  Scripting: "#3b82f6",
  Filming: "#f59e0b",
  Editing: "#a855f7",
  Published: "#10b981",
};

interface Video {
  id: string;
  title: string;
  channelIdx: number;
  status: Status;
  date: string;
  notes?: string;
}

function getWeekDays(date: Date) {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const DAY_NAMES = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

export default function Calendar() {
  const [videos, setVideos] = useState<Video[]>([
    {
      id: "1",
      title: "I 5 segreti del denaro che nessuno ti dice",
      channelIdx: 2,
      status: "Idea",
      date: new Date().toISOString().split("T")[0],
    },
  ]);
  const [week, setWeek] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", channelIdx: 0, status: "Idea" as Status, date: new Date().toISOString().split("T")[0], notes: "" });

  const weekDays = getWeekDays(new Date(week));

  const addVideo = () => {
    if (!form.title.trim()) return;
    setVideos((v) => [...v, { ...form, id: Date.now().toString() }]);
    setForm({ title: "", channelIdx: 0, status: "Idea", date: new Date().toISOString().split("T")[0], notes: "" });
    setShowForm(false);
  };

  const deleteVideo = (id: string) => setVideos((v) => v.filter((x) => x.id !== id));

  const videosOnDay = (date: Date) => {
    const d = date.toISOString().split("T")[0];
    return videos.filter((v) => v.date === d);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Calendar</h1>
          <p className="text-gray-400 text-sm">Pianifica i tuoi video su tutti i canali</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-all"
        >
          <Plus size={15} />
          Aggiungi Video
        </button>
      </div>

      {/* Week navigation */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => { const d = new Date(week); d.setDate(d.getDate() - 7); setWeek(d); }}
          className="text-gray-400 hover:text-white px-3 py-1 rounded-lg bg-gray-800 text-sm"
        >← Prec</button>
        <span className="text-white text-sm font-medium">
          {weekDays[0].toLocaleDateString("it-IT", { day: "numeric", month: "long" })} – {weekDays[6].toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}
        </span>
        <button
          onClick={() => { const d = new Date(week); d.setDate(d.getDate() + 7); setWeek(d); }}
          className="text-gray-400 hover:text-white px-3 py-1 rounded-lg bg-gray-800 text-sm"
        >Succ →</button>
      </div>

      {/* Weekly grid */}
      <div className="grid grid-cols-7 gap-2 mb-8">
        {weekDays.map((day, i) => {
          const isToday = day.toDateString() === new Date().toDateString();
          const dayVideos = videosOnDay(day);
          return (
            <div
              key={i}
              className={`bg-gray-800/50 border rounded-xl p-2 min-h-32 ${isToday ? "border-red-600" : "border-gray-700"}`}
            >
              <div className={`text-xs mb-2 font-medium ${isToday ? "text-red-400" : "text-gray-400"}`}>
                {DAY_NAMES[i]} {day.getDate()}
              </div>
              <div className="space-y-1">
                {dayVideos.map((v) => (
                  <div
                    key={v.id}
                    className="rounded-lg p-1.5 group relative"
                    style={{ background: CHANNELS[v.channelIdx].color + "22", borderLeft: `3px solid ${CHANNELS[v.channelIdx].color}` }}
                  >
                    <div className="text-xs text-white truncate">{v.title}</div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs" style={{ color: STATUS_COLORS[v.status] }}>●{" "}{v.status}</span>
                      <button onClick={() => deleteVideo(v.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300">
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* All videos list */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Tutti i video pianificati</h3>
        {videos.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">Nessun video pianificato. Clicca "Aggiungi Video".</p>
        ) : (
          <div className="space-y-2">
            {videos.map((v) => (
              <div key={v.id} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CHANNELS[v.channelIdx].color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{v.title}</div>
                  <div className="text-xs text-gray-500">{CHANNELS[v.channelIdx].label} · {v.date}</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: STATUS_COLORS[v.status] + "22", color: STATUS_COLORS[v.status] }}>
                  {v.status}
                </span>
                <button onClick={() => deleteVideo(v.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white mb-4">Nuovo Video</h2>
            <div className="space-y-3">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Titolo del video"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
              />
              <select
                value={form.channelIdx}
                onChange={(e) => setForm({ ...form, channelIdx: Number(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
              >
                {CHANNELS.map((c, i) => <option key={i} value={i}>{c.label}</option>)}
              </select>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
              />
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Note (opzionale)"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none resize-none h-20"
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm hover:text-white">
                Annulla
              </button>
              <button onClick={addVideo} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700">
                Aggiungi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
