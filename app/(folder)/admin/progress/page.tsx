"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Flag,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/providers";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type ReviewStatus = "PENDING" | "REVIEWED" | "FLAGGED" | "RESOLVED";
type Entry = {
  id: string;
  tutoring_request_id: string;
  author_user_id: string;
  author_type: "TUTOR" | "LEARNER";
  author_name: string;
  entry_type: "UPDATE" | "QUESTION" | "MILESTONE" | "CONCERN";
  log_date: string;
  message: string;
  review_status: ReviewStatus;
  admin_review_notes: string | null;
  created_at: string;
};

const filters: { value: string; label: string }[] = [
  { value: "PENDING", label: "Awaiting review" },
  { value: "FLAGGED", label: "Flagged concerns" },
  { value: "REVIEWED", label: "Reviewed" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "", label: "All entries" },
];

export default function AdminProgressPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Entry[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("PENDING");
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const query = filter ? `?review_status=${filter}&limit=300` : "?limit=300";
      setItems(await api<Entry[]>(`/progress-logs/admin${query}`));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load daily progress logs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") void load();
  }, [user, filter]);

  async function review(entry: Entry, status: ReviewStatus) {
    setBusy(entry.id);
    try {
      await api(`/progress-logs/admin/${entry.id}/review`, {
        method: "PATCH",
        body: JSON.stringify({
          review_status: status,
          admin_review_notes: notes[entry.id] ?? entry.admin_review_notes ?? null,
        }),
      });
      toast.success("Progress log review saved.");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update this entry.");
    } finally {
      setBusy(null);
    }
  }

  if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") {
    return <AppShell title="Progress log oversight"><p className="text-sm text-slate-500">Administrator access required.</p></AppShell>;
  }

  return (
    <AppShell
      title="Daily progress oversight"
      description="Supervise tutoring progress conversations, review concerns, record follow-up notes and maintain a clear safeguarding trail."
    >
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#EAF3F7] text-[#1769D2]"><ShieldCheck size={20} /></span>
          <div><p className="text-sm font-bold text-[#102A56]">Administrator supervision</p><p className="text-xs text-slate-500">All tutoring log entries are visible to authorised administrators.</p></div>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => <button key={item.value} type="button" onClick={() => setFilter(item.value)} className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${filter === item.value ? "border-[#1769D2] bg-[#EDF4FF] text-[#1769D2]" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>{item.label}</button>)}
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">{items.length} {items.length === 1 ? "entry" : "entries"}</p>
        {filter === "FLAGGED" && <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100"><AlertTriangle size={12} className="mr-1" /> Priority review</Badge>}
      </div>

      {loading ? <p className="py-10 text-center text-sm text-slate-500">Loading progress entries…</p> : items.length === 0 ? (
        <Card><CardContent className="p-8 text-center"><CheckCircle2 className="mx-auto text-emerald-500" size={28} /><p className="mt-3 font-semibold text-[#102A56]">Nothing to review here</p><p className="mt-1 text-sm text-slate-500">There are no progress log entries in this category.</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {items.map((entry) => (
            <Card key={entry.id} className="overflow-hidden border-slate-200 shadow-sm">
              <div className={`h-1 ${entry.entry_type === "CONCERN" || entry.review_status === "FLAGGED" ? "bg-amber-400" : "bg-[#00AFA0]"}`} />
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F1F5F9] text-[#1769D2]"><MessageCircle size={18} /></span>
                    <div>
                      <p className="font-bold text-[#102A56]">{entry.author_name} <span className="font-normal text-slate-400">· {entry.author_type === "TUTOR" ? "Tutor" : "Parent / adult learner"}</span></p>
                      <p className="mt-1 text-xs text-slate-500">Request {entry.tutoring_request_id.slice(0, 8)} · {new Date(entry.created_at).toLocaleString("en-NG")}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{entry.entry_type.replaceAll("_", " ")}</Badge>
                    <Badge className={entry.review_status === "FLAGGED" ? "bg-amber-100 text-amber-800 hover:bg-amber-100" : entry.review_status === "RESOLVED" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : ""}>{entry.review_status}</Badge>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#F7F9FC] p-4">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{entry.message}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Administrator review / follow-up notes</label>
                  <Textarea rows={2} placeholder="Record what was reviewed, who should follow up, or how the concern was addressed…" value={notes[entry.id] ?? entry.admin_review_notes ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [entry.id]: event.target.value }))} />
                </div>

                <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                  <Button size="sm" disabled={busy === entry.id} onClick={() => void review(entry, "REVIEWED")}><CheckCircle2 size={14} className="mr-1.5" /> Mark reviewed</Button>
                  <Button size="sm" variant="outline" disabled={busy === entry.id} onClick={() => void review(entry, "FLAGGED")}><Flag size={14} className="mr-1.5" /> Flag for follow-up</Button>
                  <Button size="sm" variant="outline" disabled={busy === entry.id} onClick={() => void review(entry, "RESOLVED")}>Resolve</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
