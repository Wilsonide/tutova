"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  CircleHelp,
  Flag,
  MessageCircle,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/providers";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type ProgressRoom = {
  id: string;
  status: string;
  assigned_tutor_id: string;
  created_at: string;
  tutor_name: string;
  requester_name: string;
  requester_role: "PARENT" | "ADULT_LEARNER" | string;
  learner_name: string | null;
  subject_name: string;
  tutoring_mode: "ONLINE" | "IN_PERSON" | "HYBRID" | string;
};

type EntryType = "UPDATE" | "QUESTION" | "MILESTONE" | "CONCERN";

type ProgressEntry = {
  id: string;
  tutoring_request_id: string;
  author_user_id: string;
  author_type: "TUTOR" | "LEARNER";
  author_name: string;
  entry_type: EntryType;
  log_date: string;
  message: string;
  review_status: "PENDING" | "REVIEWED" | "FLAGGED" | "RESOLVED";
  admin_review_notes: string | null;
  created_at: string;
};

const entryOptions: { value: EntryType; label: string; icon: typeof BookOpen }[] = [
  { value: "UPDATE", label: "Daily update", icon: BookOpen },
  { value: "MILESTONE", label: "Milestone", icon: Sparkles },
  { value: "QUESTION", label: "Question", icon: CircleHelp },
  { value: "CONCERN", label: "Raise a concern", icon: AlertTriangle },
];

function formatDay(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ProgressPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ProgressRoom[]>([]);
  const [entriesByRequest, setEntriesByRequest] = useState<Record<string, ProgressEntry[]>>({});
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [entryType, setEntryType] = useState<EntryType>("UPDATE");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const roomRows = await api<ProgressRoom[]>("/progress-logs/rooms");
      setRooms(roomRows);
      setActiveRequestId((current) =>
        current && roomRows.some((room) => room.id === current)
          ? current
          : roomRows[0]?.id ?? null,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load your learning rooms.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) void load();
  }, [user?.id, user?.role]);

  // Refresh the open room periodically so both participants see new entries
  // without requiring a page reload. This uses ordinary HTTP requests, not WebSockets.
  useEffect(() => {
    if (!activeRequestId) return;
    let active = true;
    const refreshRoom = async () => {
      try {
        const entries = await api<ProgressEntry[]>(`/progress-logs/requests/${activeRequestId}`);
        if (active) {
          setEntriesByRequest((current) => ({ ...current, [activeRequestId]: entries }));
        }
      } catch {
        // Keep the current conversation visible if a background refresh fails.
      }
    };
    const interval = window.setInterval(() => void refreshRoom(), 15000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [activeRequestId]);

  const activeRoom = rooms.find((room) => room.id === activeRequestId) ?? null;
  const activeEntries = activeRequestId ? entriesByRequest[activeRequestId] ?? [] : [];

  useEffect(() => {
    if (!activeRequestId) return;
    let active = true;
    async function loadActiveRoom() {
      try {
        const entries = await api<ProgressEntry[]>(`/progress-logs/requests/${activeRequestId}`);
        if (active) {
          setEntriesByRequest((current) => ({ ...current, [activeRequestId]: entries }));
        }
      } catch (error) {
        if (active) {
          toast.error(error instanceof Error ? error.message : "Could not load this conversation.");
        }
      }
    }
    void loadActiveRoom();
    return () => {
      active = false;
    };
  }, [activeRequestId]);

  const isTutor = user?.role === "TUTOR";

  async function sendEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeRequestId || message.trim().length < 2) return;
    setSending(true);
    try {
      await api(`/progress-logs/requests/${activeRequestId}`, {
        method: "POST",
        body: JSON.stringify({ entry_type: entryType, message: message.trim() }),
      });
      setMessage("");
      setEntryType("UPDATE");
      toast.success(entryType === "CONCERN" ? "Concern submitted to Tutova for review." : "Your progress update has been added.");
      const [updatedEntries, updatedRooms] = await Promise.all([
        api<ProgressEntry[]>(`/progress-logs/requests/${activeRequestId}`),
        api<ProgressRoom[]>("/progress-logs/rooms"),
      ]);
      setEntriesByRequest((current) => ({ ...current, [activeRequestId]: updatedEntries }));
      setRooms(updatedRooms);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send your update.");
    } finally {
      setSending(false);
    }
  }

  return (
    <AppShell
      title="Daily learning log"
      description="A shared space for tutors and learners to record daily progress, celebrate milestones, ask questions and raise concerns. Tutova administrators supervise every learning log."
    >
      <div className="grid gap-5 xl:grid-cols-[310px_minmax(0,1fr)]">
        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <div className="border-b border-slate-100 bg-[#F7FAFD] p-5">
            <div className="flex items-center gap-2 text-[#102A56]">
              <MessageCircle size={18} />
              <h2 className="font-bold">Your learning rooms</h2>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-500">Each room follows an accepted tutoring relationship.</p>
          </div>
          <CardContent className="p-2">
            {loading ? (
              <p className="p-4 text-sm text-slate-500">Loading your tutoring rooms…</p>
            ) : rooms.length === 0 ? (
              <div className="p-5 text-center">
                <Users className="mx-auto text-slate-300" size={28} />
                <p className="mt-3 text-sm font-semibold text-[#102A56]">No learning rooms yet</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Your progress log will appear as soon as a tutor accepts your tutoring request.</p>
              </div>
            ) : rooms.map((room) => {
              const active = room.id === activeRequestId;
              const roomEntries = entriesByRequest[room.id] ?? [];
              const hasLoadedRoom = Object.prototype.hasOwnProperty.call(entriesByRequest, room.id);
              const lastEntry = roomEntries[roomEntries.length - 1];
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => setActiveRequestId(room.id)}
                  className={`w-full rounded-xl p-3 text-left transition ${active ? "bg-[#EDF4FF] ring-1 ring-[#1769D2]/15" : "hover:bg-slate-50"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${active ? "bg-[#1769D2] text-white" : "bg-[#EAF3F7] text-[#1769D2]"}`}>
                        <BookOpen size={18} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-[#102A56]">
                          {isTutor
                            ? room.requester_role === "PARENT"
                              ? `Parent: ${room.requester_name}`
                              : `Adult learner: ${room.requester_name}`
                            : `Tutor: ${room.tutor_name}`}
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] text-slate-500">
                          {room.requester_role === "PARENT"
                            ? room.learner_name
                              ? `Learner: ${room.learner_name} · Parent: ${room.requester_name}`
                              : `Parent: ${room.requester_name} · ${room.subject_name}`
                            : `Adult learner: ${room.requester_name} · ${room.subject_name}`}
                        </span>
                      </span>
                    </div>
                    {(entriesByRequest[room.id] ?? []).length > 0 && <Badge>{(entriesByRequest[room.id] ?? []).length}</Badge>}
                  </div>
                  <p className="mt-2 truncate text-xs text-slate-500">
                    {lastEntry
                      ? `${lastEntry.author_name}: ${lastEntry.message}`
                      : hasLoadedRoom
                        ? "No progress updates yet"
                        : `${room.subject_name} · Open conversation to view updates`}
                  </p>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="flex min-h-[620px] flex-col overflow-hidden border-slate-200 shadow-sm">
          {activeRoom ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#EAF3F7] text-[#1769D2]"><MessageCircle size={20} /></span>
                  <div>
                    <h2 className="font-bold text-[#102A56]">
                      {isTutor
                        ? activeRoom.requester_role === "PARENT"
                          ? `Parent: ${activeRoom.requester_name}`
                          : `Adult learner: ${activeRoom.requester_name}`
                        : `Tutor: ${activeRoom.tutor_name}`}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {activeRoom.requester_role === "PARENT"
                        ? activeRoom.learner_name
                          ? `Learner: ${activeRoom.learner_name} · Parent: ${activeRoom.requester_name}`
                          : `Parent: ${activeRoom.requester_name} · ${activeRoom.subject_name}`
                        : `Adult learner: ${activeRoom.requester_name} · ${activeRoom.subject_name}`}
                    </p>
                  </div>
                </div>
                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Tutova supervised</Badge>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto bg-[#F7F9FC] p-4 sm:p-6">
                <div className="mx-auto max-w-xl rounded-2xl border border-blue-100 bg-blue-50/80 p-4 text-center">
                  <ShieldCheckIcon />
                  <p className="mt-2 text-sm font-semibold text-[#102A56]">A shared record of learning</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">Tutors and learners can post updates here. Tutova administrators can review entries and follow up on concerns.</p>
                </div>

                {activeEntries.length === 0 ? (
                  <div className="grid min-h-48 place-items-center text-center">
                    <div>
                      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-300 shadow-sm"><MessageCircle size={22} /></div>
                      <p className="mt-3 text-sm font-semibold text-[#102A56]">Start your daily learning log</p>
                      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">Share what was covered, what went well, a milestone, a question or something that needs attention.</p>
                    </div>
                  </div>
                ) : activeEntries.map((entry) => {
                  const mine = entry.author_user_id === user?.id;
                  const concern = entry.entry_type === "CONCERN";
                  return (
                    <div key={entry.id}>
                      <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">{formatDay(entry.log_date)}</p>
                      <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[78%] ${mine ? "rounded-br-md bg-[#1769D2] text-white" : "rounded-bl-md border border-slate-100 bg-white text-slate-700"}`}>
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className={`text-xs font-bold ${mine ? "text-white" : "text-[#102A56]"}`}>{mine ? "You" : entry.author_name}</span>
                            <span className={`text-[10px] ${mine ? "text-blue-100" : "text-slate-400"}`}>{entry.author_type === "TUTOR" ? "Tutor" : "Learner / parent"} · {formatTime(entry.created_at)}</span>
                            {concern && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800"><Flag size={10} /> Concern</span>}
                            {entry.entry_type === "MILESTONE" && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">Milestone</span>}
                            {entry.entry_type === "QUESTION" && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800">Question</span>}
                          </div>
                          <p className="whitespace-pre-wrap text-sm leading-6">{entry.message}</p>
                          {entry.review_status !== "PENDING" && <p className={`mt-2 text-[10px] font-semibold ${mine ? "text-blue-100" : "text-slate-400"}`}>Tutova review: {entry.review_status.replaceAll("_", " ")}</p>}
                          {entry.admin_review_notes && <div className={`mt-3 rounded-lg p-2 text-xs ${mine ? "bg-white/10 text-blue-50" : "bg-blue-50 text-blue-900"}`}><strong>Tutova review:</strong> {entry.admin_review_notes}</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 bg-white p-4 sm:p-5">
                <form onSubmit={sendEntry} className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {entryOptions.map((option) => {
                      const Icon = option.icon;
                      const active = entryType === option.value;
                      return (
                        <button key={option.value} type="button" onClick={() => setEntryType(option.value)} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${active ? option.value === "CONCERN" ? "border-amber-300 bg-amber-50 text-amber-800" : "border-[#1769D2]/25 bg-[#EDF4FF] text-[#1769D2]" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                          <Icon size={13} /> {option.label}
                        </button>
                      );
                    })}
                  </div>
                  {entryType === "CONCERN" && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">This entry will be escalated to Tutova administrators for follow-up.</p>}
                  <div className="flex items-end gap-2">
                    <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} maxLength={5000} placeholder={isTutor ? "Share today's lesson progress, learner response or next steps…" : "Share your learning experience, feedback or a question…"} className="min-h-[82px] flex-1 resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#1769D2] focus:bg-white focus:ring-2 focus:ring-[#1769D2]/10" />
                    <Button type="submit" disabled={sending || message.trim().length < 2} className="h-11 shrink-0 px-4"><Send size={16} className="mr-2" />{sending ? "Sending" : "Send"}</Button>
                  </div>
                  <p className="text-right text-[10px] text-slate-400">{message.length}/5000 characters · Entries are retained in the tutoring record.</p>
                </form>
              </div>
            </>
          ) : (
            <div className="grid flex-1 place-items-center p-8 text-center">
              <div><BookOpen className="mx-auto text-slate-300" size={32} /><p className="mt-3 font-semibold text-[#102A56]">Your learning log will appear here</p><p className="mt-1 text-sm text-slate-500">Select a tutoring room to view its daily updates.</p></div>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

function ShieldCheckIcon() {
  return <CheckCircle2 className="mx-auto text-[#00AFA0]" size={20} />;
}
