"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { api } from "@/lib/api";
import type { Booking, TutoringRequest } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/components/providers";
import { CalendarDays, Clock3, ExternalLink, FileText, RefreshCw, UserRound } from "lucide-react";

type RequestInfo = TutoringRequest & {
  selected_tutor_id?: string | null;
  subject_name?: string;
  requester_first_name?: string;
  requester_last_name?: string;
};
type Tutor = {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  profile_picture_url: string | null;
};

function statusStyle(status: string) {
  if (["CONFIRMED", "COMPLETED"].includes(status)) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (["PENDING_TUTOR_CONFIRMATION", "PENDING_CONFIRMATION", "AWAITING_LEARNER_ACKNOWLEDGEMENT"].includes(status)) return "border-amber-200 bg-amber-50 text-amber-700";
  if (["DISPUTED", "DECLINED", "CANCELLED"].includes(status)) return "border-red-200 bg-red-50 text-red-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

export default function LessonsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Booking[]>([]);
  const [requests, setRequests] = useState<RequestInfo[]>([]);
  const [tutors, setTutors] = useState<Record<string, Tutor>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isLearner = user?.role === "PARENT" || user?.role === "ADULT_LEARNER";
  const isTutor = user?.role === "TUTOR";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [bookings, requestRows] = await Promise.all([
        api<Booking[]>("/session-bookings/mine?limit=100"),
        api<RequestInfo[]>(isTutor ? "/tutoring-requests/matching" : "/tutoring-requests/mine"),
      ]);
      setRows(bookings);
      setRequests(requestRows);
      if (isLearner) {
        const ids = Array.from(new Set(requestRows.map((request) => request.assigned_tutor_id || request.selected_tutor_id).filter((id): id is string => Boolean(id))));
        const profiles = await Promise.all(ids.map(async (id) => {
          try { return await api<Tutor>(`/tutors/${encodeURIComponent(id)}`); }
          catch { return null; }
        }));
        const next: Record<string, Tutor> = {};
        profiles.forEach((profile) => { if (profile) next[profile.id] = profile; });
        setTutors(next);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load lessons");
    } finally {
      setLoading(false);
    }
  }, [isLearner, isTutor]);

  useEffect(() => { void load(); }, [load]);

  const requestById = useMemo(() => new Map(requests.map((request) => [request.id, request])), [requests]);

  async function act(id: string, action: string, body?: object) {
    setBusyId(id);
    try {
      await api(`/session-bookings/${encodeURIComponent(id)}/${action}`, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
      });
      toast.success("Lesson booking updated");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update booking");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AppShell title="Lessons & bookings" description="Keep track of upcoming sessions, tutor decisions and lesson completion in one place.">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#1769D2]"><CalendarDays className="h-5 w-5" /></div>
          <div><p className="text-sm font-semibold text-[#102A56]">Your lesson workspace</p><p className="mt-1 text-xs leading-5 text-slate-600">Manage confirmed sessions and follow the completion and acknowledgement steps.</p></div>
        </div>
        <Button asChild variant="outline" size="sm"><Link href="/progress">Progress reports <FileText className="ml-1 h-4 w-4" /></Link></Button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((item) => <div key={item} className="h-36 animate-pulse rounded-2xl bg-white" />)}</div>
      ) : rows.length === 0 ? (
        <Card><CardContent className="px-5 py-14 text-center"><CalendarDays className="mx-auto h-9 w-9 text-slate-300" /><p className="mt-3 font-semibold text-slate-800">No lessons scheduled yet</p><p className="mt-1 text-sm text-slate-500">Once a tutoring request becomes a paid booking, your sessions will appear here.</p>{isLearner && <Button asChild className="mt-4"><Link href="/requests">View tutoring requests</Link></Button>}</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {rows.map((booking) => {
            const request = requestById.get(booking.tutoring_request_id);
            const tutorId = request?.assigned_tutor_id || request?.selected_tutor_id || booking.tutor_profile_id;
            const tutor = tutors[tutorId];
            const participantName = isTutor
              ? `${request?.requester_first_name || "Learner"} ${request?.requester_last_name || ""}`.trim()
              : tutor?.full_name || (tutor ? `${tutor.first_name} ${tutor.last_name}` : "Your tutor");
            const initials = participantName.split(" ").filter(Boolean).slice(0,2).map((part) => part[0]).join("").toUpperCase();
            return (
              <Card key={booking.id} className="app-card-hover">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      {tutor?.profile_picture_url && !isTutor ? <img src={tutor.profile_picture_url} alt={participantName} className="h-12 w-12 shrink-0 rounded-full object-cover" /> : <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blue-50 text-sm font-bold text-[#1769D2]">{initials || <UserRound className="h-5 w-5" />}</div>}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-[#102A56]">{participantName}</p><Badge className={`border ${statusStyle(booking.status)}`}>{booking.status.replaceAll("_", " ")}</Badge></div>
                        <p className="mt-1 text-sm text-slate-600">{request?.subject_name || "Tutoring session"}</p>
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{new Date(booking.start_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</span>
                          <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{booking.duration_minutes} minutes</span>
                        </div>
                        {booking.meeting_link && <a className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1769D2] hover:underline" href={booking.meeting_link} target="_blank" rel="noreferrer">Open lesson link <ExternalLink className="h-3.5 w-3.5" /></a>}
                        {booking.status === "AWAITING_LEARNER_ACKNOWLEDGEMENT" && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">Your tutor marked this lesson as completed. Review the progress report before acknowledging completion. Funds are not released until you acknowledge or the case is reviewed.</p>}
                        {booking.status === "DISPUTED" && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs leading-5 text-red-800">This lesson is under review. Tutova will handle the dispute before any payout is released.</p>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      {isLearner && booking.status === "PENDING_CONFIRMATION" && <><Button size="sm" disabled={busyId === booking.id} onClick={() => void act(booking.id, "confirm")}>Confirm lesson</Button><Button size="sm" variant="outline" disabled={busyId === booking.id} onClick={() => void act(booking.id, "decline", { reason: "Unable to proceed" })}>Decline</Button></>}
                      {isLearner && booking.status === "AWAITING_LEARNER_ACKNOWLEDGEMENT" && <><Button size="sm" disabled={busyId === booking.id} onClick={() => void act(booking.id, "acknowledge-completion")}>Acknowledge completion</Button><Button size="sm" variant="outline" disabled={busyId === booking.id} onClick={() => void act(booking.id, "dispute-completion", { reason: "I need the completed session reviewed." })}>Raise a dispute</Button></>}
                      {isTutor && booking.status === "CONFIRMED" && <Button size="sm" disabled={busyId === booking.id} onClick={() => void act(booking.id, "complete")}>Mark lesson completed</Button>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <p className="text-xs leading-5 text-slate-500">For a completed lesson, the learner must acknowledge completion before the tutor’s earnings can be released. A dispute sends the booking for administrator review.</p>
    </AppShell>
  );
}
