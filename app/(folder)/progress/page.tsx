"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/providers";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Booking = {
  id: string; start_at: string; end_at: string; status: string;
  duration_minutes: number; currency: string; tutor_profile_id: string;
  tutoring_request_id: string; requester_user_id: string;
};
type Report = {
  id: string; booking_id: string; author_user_id: string;
  author_type: "TUTOR" | "LEARNER"; lesson_date: string;
  topic_covered: string; learning_objectives: string | null;
  activities: string | null; learner_performance: string | null;
  challenges: string | null; next_steps: string | null;
  attendance_confirmed: boolean; satisfaction_rating: number | null;
  feedback: string | null; issue_reported: boolean; issue_details: string | null;
  review_status: string; admin_review_notes: string | null;
};

export default function ProgressPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reports, setReports] = useState<Record<string, Report[]>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, any>>({});

  async function load() {
    setLoading(true);
    try {
      const rows = await api<Booking[]>("/session-bookings/mine?limit=100&offset=0");
      setBookings(rows);
      const pairs = await Promise.all(rows.map(async (booking) => {
        try { return [booking.id, await api<Report[]>(`/progress-reports/bookings/${booking.id}`)] as const; }
        catch { return [booking.id, []] as const; }
      }));
      setReports(Object.fromEntries(pairs));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load lessons");
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  const isTutor = user?.role === "TUTOR";
  const canReport = user?.role === "TUTOR" || user?.role === "PARENT" || user?.role === "ADULT_LEARNER";
  const editableBookings = bookings.filter((b) => ["AWAITING_LEARNER_ACKNOWLEDGEMENT", "DISPUTED", "COMPLETED"].includes(b.status));

  function updateForm(id: string, key: string, value: any) {
    setForms((current) => ({ ...current, [id]: { ...(current[id] || {}), [key]: value } }));
  }

  async function submit(booking: Booking) {
    const value = forms[booking.id] || {};
    if (!String(value.topic_covered || "").trim() && isTutor) { toast.error("Enter the topic covered."); return; }
    if (value.issue_reported && !String(value.issue_details || value.feedback || "").trim()) { toast.error("Describe the issue before submitting the report."); return; }
    setBusy(booking.id);
    try {
      await api(`/progress-reports/bookings/${booking.id}`, {
        method: "POST",
        body: JSON.stringify({
          lesson_date: booking.start_at,
          topic_covered: value.topic_covered || (isTutor ? "" : "Learner feedback"),
          learning_objectives: value.learning_objectives || null,
          activities: value.activities || null,
          learner_performance: value.learner_performance || null,
          challenges: value.challenges || null,
          next_steps: value.next_steps || null,
          attendance_confirmed: value.attendance_confirmed !== false,
          satisfaction_rating: isTutor ? null : (value.satisfaction_rating ? Number(value.satisfaction_rating) : null),
          feedback: value.feedback || null,
          issue_reported: Boolean(value.issue_reported),
          issue_details: value.issue_details || null,
        }),
      });
      toast.success("Progress report submitted. Tutova administrators have been notified.");
      setForms((current) => ({ ...current, [booking.id]: {} }));
      await load();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not submit report"); }
    finally { setBusy(null); }
  }

  return <AppShell title="Lesson progress reports" description="Tutors and learners submit a report for each completed lesson. Tutova administrators can review both accounts, follow up on issues and monitor lesson completion.">
    {loading ? <p className="py-8 text-sm text-slate-500">Loading lesson records…</p> : !editableBookings.length ? <Card><CardContent className="p-6 text-sm text-slate-500">There are no lessons awaiting progress reports. Reports become available after the tutor marks a lesson completed.</CardContent></Card> :
      <div className="space-y-5">{editableBookings.map((booking) => {
        const existing = reports[booking.id] || [];
        const myReport = existing.find((r) => r.author_user_id === user?.id);
        const value = forms[booking.id] || {};
        return <Card key={booking.id}><CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle>Lesson · {new Date(booking.start_at).toLocaleString("en-NG")}</CardTitle><p className="mt-1 text-xs text-slate-500">{booking.duration_minutes} minutes · Booking {booking.id.slice(0, 8)}</p></div><Badge>{booking.status.replaceAll("_", " ")}</Badge></div></CardHeader><CardContent className="space-y-5">
          <div className="grid gap-3 md:grid-cols-2">{existing.map((report) => <div key={report.id} className="rounded-xl border border-slate-200 p-4"><div className="flex justify-between gap-2"><p className="font-semibold text-[#102A56]">{report.author_type === "TUTOR" ? "Tutor report" : "Learner / parent feedback"}</p><Badge>{report.review_status}</Badge></div><p className="mt-2 text-sm font-medium">{report.topic_covered}</p>{report.feedback && <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{report.feedback}</p>}{report.issue_reported && <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">Issue reported: {report.issue_details || report.feedback}</p>}{report.admin_review_notes && <p className="mt-2 text-xs text-slate-500">Admin: {report.admin_review_notes}</p>}</div>)}</div>
          {!canReport ? null : myReport ? <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">Your report has been submitted. You can view its review status above.</p> : <div className="space-y-3 border-t border-slate-100 pt-4"><h3 className="font-semibold text-[#102A56]">{isTutor ? "Submit tutor lesson report" : "Submit learner feedback"}</h3><label className="block text-sm">{isTutor ? "Topic covered" : "Topic covered (if known)"}<input className="mt-1 w-full rounded-lg border border-slate-300 p-2" value={value.topic_covered || ""} onChange={(e) => updateForm(booking.id, "topic_covered", e.target.value)} /></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={value.attendance_confirmed !== false} onChange={(e) => updateForm(booking.id, "attendance_confirmed", e.target.checked)} /> I confirm that the scheduled lesson took place</label>{isTutor && <><label className="block text-sm">Learning objectives<textarea className="mt-1 w-full rounded-lg border border-slate-300 p-2" rows={2} value={value.learning_objectives || ""} onChange={(e) => updateForm(booking.id, "learning_objectives", e.target.value)} /></label><label className="block text-sm">Activities and teaching methods<textarea className="mt-1 w-full rounded-lg border border-slate-300 p-2" rows={2} value={value.activities || ""} onChange={(e) => updateForm(booking.id, "activities", e.target.value)} /></label><label className="block text-sm">Learner performance and understanding<textarea className="mt-1 w-full rounded-lg border border-slate-300 p-2" rows={2} value={value.learner_performance || ""} onChange={(e) => updateForm(booking.id, "learner_performance", e.target.value)} /></label><label className="block text-sm">Challenges<textarea className="mt-1 w-full rounded-lg border border-slate-300 p-2" rows={2} value={value.challenges || ""} onChange={(e) => updateForm(booking.id, "challenges", e.target.value)} /></label><label className="block text-sm">Next steps<textarea className="mt-1 w-full rounded-lg border border-slate-300 p-2" rows={2} value={value.next_steps || ""} onChange={(e) => updateForm(booking.id, "next_steps", e.target.value)} /></label></>}
            <label className="block text-sm">{isTutor ? "Additional notes" : "Your feedback about the lesson"}<textarea className="mt-1 w-full rounded-lg border border-slate-300 p-2" rows={3} value={value.feedback || ""} onChange={(e) => updateForm(booking.id, "feedback", e.target.value)} /></label>{!isTutor && <label className="block text-sm">Satisfaction rating<select className="mt-1 w-full rounded-lg border border-slate-300 p-2" value={value.satisfaction_rating || ""} onChange={(e) => updateForm(booking.id, "satisfaction_rating", e.target.value)}><option value="">Select rating</option>{[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} / 5</option>)}</select></label>}
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(value.issue_reported)} onChange={(e) => updateForm(booking.id, "issue_reported", e.target.checked)} /> I need to report an issue</label>{value.issue_reported && <label className="block text-sm">Issue details<textarea className="mt-1 w-full rounded-lg border border-slate-300 p-2" rows={3} value={value.issue_details || ""} onChange={(e) => updateForm(booking.id, "issue_details", e.target.value)} /></label>}
            <Button disabled={busy === booking.id} onClick={() => void submit(booking)}>{busy === booking.id ? "Submitting…" : "Submit progress report"}</Button>
          </div>}
        </CardContent></Card>;
      })}</div>}
  </AppShell>;
}
