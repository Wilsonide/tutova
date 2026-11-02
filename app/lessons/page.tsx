"use client";
import { useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, Info, Plus } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
export default function LessonsPage() {
  const [agreement, setAgreement] = useState("");
  const [start, setStart] = useState("");
  const [duration, setDuration] = useState("60");
  const [mode, setMode] = useState("ONLINE");
  const [lesson, setLesson] = useState("");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  async function schedule(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api<Record<string, unknown>>(
        `/learning/agreements/${agreement}/lessons`,
        {
          method: "POST",
          body: JSON.stringify({
            scheduled_start: new Date(start).toISOString(),
            duration_minutes: Number(duration),
            mode,
          }),
        },
      );
      setResult(r);
      setLesson(String(r.id || ""));
      toast.success("Lesson scheduled");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not schedule lesson");
    } finally {
      setBusy(false);
    }
  }
  async function deliver(e: React.FormEvent) {
    e.preventDefault();
    try {
      const r = await api(`/learning/lessons/${lesson}/delivery`, {
        method: "POST",
        body: JSON.stringify({ tutor_delivery_notes: notes || null }),
      });
      setResult(r);
      toast.success("Lesson marked as delivered");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update lesson");
    }
  }
  return (
    <AppShell
      title="Lessons & scheduling"
      description="Schedule a lesson under an active agreement, then let the tutor record delivery. The backend currently supports creation and delivery actions but does not expose a lesson-list endpoint."
    >
      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
        <Info size={18} className="mt-0.5 shrink-0" />
        <p>
          Use an active agreement ID to schedule. The backend validates that the
          agreement is active and that you are one of its parties.
        </p>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays size={19} className="text-[#0077E6]" /> Schedule a
              lesson
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={schedule} className="space-y-4">
              <Field label="Active agreement ID" htmlFor="agreement">
                <Input
                  id="agreement"
                  required
                  value={agreement}
                  onChange={(e) => setAgreement(e.target.value)}
                  placeholder="Agreement UUID"
                />
              </Field>
              <Field label="Lesson date and time" htmlFor="start">
                <Input
                  id="start"
                  required
                  type="datetime-local"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </Field>
              <div className="form-grid">
                <Field label="Duration (minutes)" htmlFor="duration">
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    max="600"
                    step="15"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </Field>
                <Field label="Teaching mode" htmlFor="mode">
                  <select
                    id="mode"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                  >
                    <option value="ONLINE">Online</option>
                    <option value="IN_PERSON">In person</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </Field>
              </div>
              <Button className="w-full" disabled={busy}>
                {busy ? "Scheduling…" : "Schedule lesson"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 size={19} className="text-[#00AFA0]" /> Record
              lesson delivery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={deliver} className="space-y-4">
              <Field label="Lesson ID" htmlFor="lesson">
                <Input
                  id="lesson"
                  required
                  value={lesson}
                  onChange={(e) => setLesson(e.target.value)}
                  placeholder="Lesson UUID"
                />
              </Field>
              <Field label="Tutor delivery notes" htmlFor="notes">
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Topics covered, activities, observations…"
                />
              </Field>
              <Button className="w-full" variant="secondary">
                Mark as delivered
              </Button>
              <p className="text-xs leading-5 text-slate-500">
                Only the assigned tutor can mark the lesson delivered. Submit
                the learner progress report separately.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
      {result !== null && (
        <Card className="mt-5">
          <CardContent className="p-5">
            <p className="font-bold text-[#102A56]">Latest response</p>
            <pre className="mt-3 overflow-auto rounded-xl bg-slate-50 p-3 text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}
