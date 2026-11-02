"use client";
import { useState } from "react";
import { AlertTriangle, HeartHandshake, ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
export default function SafeguardingPage() {
  const [category, setCategory] = useState("SAFETY_CONCERN");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [agreement, setAgreement] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent, incident: boolean) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await api<Record<string, unknown>>(
        incident ? "/learning/safeguarding/incidents" : "/learning/complaints",
        {
          method: "POST",
          body: JSON.stringify({
            category,
            description,
            subject_user_id: subject || null,
            agreement_id: agreement || null,
          }),
        },
      );
      toast.success(
        incident ? "Safeguarding report submitted" : "Concern submitted",
      );
      setDescription("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not submit report");
    } finally {
      setBusy(false);
    }
  }
  return (
    <AppShell
      title="Help & safeguarding"
      description="Use this space to report concerns about tutoring interactions, learner safety, or platform conduct. Safeguarding cases are restricted to authorised administrators."
    >
      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartHandshake className="text-[#00AFA0]" size={20} /> General
              complaint
            </CardTitle>
            <p className="text-sm text-slate-500">
              For service issues, conduct concerns, or unresolved problems.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => submit(e, false)} className="space-y-4">
              <Field label="Concern category" htmlFor="category">
                <select
                  id="category"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="SERVICE_QUALITY">Service quality</option>
                  <option value="PAYMENT">Payment</option>
                  <option value="CONDUCT">Conduct</option>
                  <option value="SAFETY_CONCERN">Safety concern</option>
                  <option value="OTHER">Other</option>
                </select>
              </Field>
              <Field label="Description" htmlFor="description">
                <Textarea
                  id="description"
                  required
                  minLength={10}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what happened and what support you need"
                />
              </Field>
              <div className="form-grid">
                <Field label="Related user ID (optional)" htmlFor="subject">
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="User UUID"
                  />
                </Field>
                <Field label="Agreement ID (optional)" htmlFor="agreement">
                  <Input
                    id="agreement"
                    value={agreement}
                    onChange={(e) => setAgreement(e.target.value)}
                    placeholder="Agreement UUID"
                  />
                </Field>
              </div>
              <Button className="w-full" disabled={busy}>
                Submit complaint
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card className="border-red-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <ShieldAlert size={20} /> Safeguarding incident
            </CardTitle>
            <p className="text-sm text-slate-500">
              For concerns involving a child's safety, inappropriate contact, or
              urgent risk.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => submit(e, true)} className="space-y-4">
              <div className="rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-800">
                <AlertTriangle size={17} className="mr-2 inline" /> If someone
                is in immediate danger, contact local emergency services or a
                trusted safeguarding authority first.
              </div>
              <Field label="Incident category" htmlFor="incidentCategory">
                <select
                  id="incidentCategory"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="SAFETY_CONCERN">Safety concern</option>
                  <option value="INAPPROPRIATE_CONTACT">
                    Inappropriate contact
                  </option>
                  <option value="BOUNDARY_VIOLATION">Boundary violation</option>
                  <option value="OTHER">Other</option>
                </select>
              </Field>
              <Field label="Incident details" htmlFor="incidentDescription">
                <Textarea
                  id="incidentDescription"
                  required
                  minLength={10}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share factual details. Avoid including unnecessary sensitive information."
                />
              </Field>
              <Field
                label="Related user ID (optional)"
                htmlFor="incidentSubject"
              >
                <Input
                  id="incidentSubject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="User UUID"
                />
              </Field>
              <Button variant="destructive" className="w-full" disabled={busy}>
                Submit safeguarding report
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
