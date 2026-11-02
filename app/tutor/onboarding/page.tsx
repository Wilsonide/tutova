"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileCheck2, ShieldCheck, Video } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { api } from "@/lib/api";
import { useAuth } from "@/components/providers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (user && user.role !== "TUTOR") router.replace("/dashboard");
  }, [user, router]);
  const [qual, setQual] = useState("");
  const [exp, setExp] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [years, setYears] = useState("0");
  const [modes, setModes] = useState<string[]>(["ONLINE"]);
  const [area, setArea] = useState("");
  const [check, setCheck] = useState("IDENTITY");
  const [storage, setStorage] = useState("");
  const [ndaVersion, setNdaVersion] = useState("v1");
  const [ndaKey, setNdaKey] = useState("nda-v1");
  const [evidence, setEvidence] = useState("I have read and agree to the NDA");
  const [videoKey, setVideoKey] = useState("");
  const [duration, setDuration] = useState("60");
  const [busy, setBusy] = useState(false);
  const [application, setApplication] = useState<unknown>(null);
  async function action(label: string, fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      const r = await fn();
      toast.success(`${label} submitted`);
      return r;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : `${label} failed`);
      return null;
    } finally {
      setBusy(false);
    }
  }
  async function submitApp(e: React.FormEvent) {
    e.preventDefault();
    const r = await action("Application", () =>
      api("/tutor-applications", {
        method: "POST",
        body: JSON.stringify({
          qualifications_summary: qual,
          experience_summary: exp,
        }),
      }),
    );
    if (r) setApplication(r);
  }
  async function submitProfile(e: React.FormEvent) {
    e.preventDefault();
    await action("Profile", () =>
      api("/tutors/me/profile", {
        method: "PUT",
        body: JSON.stringify({
          headline,
          bio,
          years_experience: Number(years),
          work_modes: modes,
          service_area: area || null,
          timezone: "Africa/Lagos",
          accepts_new_learners: true,
          payout_method_preference: "BANK_TRANSFER",
        }),
      }),
    );
  }
  async function submitVerification(e: React.FormEvent) {
    e.preventDefault();
    await action("Verification", () =>
      api("/learning/tutor-verification/submissions", {
        method: "POST",
        body: JSON.stringify({
          check_type: check,
          private_storage_key: storage,
        }),
      }),
    );
  }
  async function submitNda(e: React.FormEvent) {
    e.preventDefault();
    await action("NDA acceptance", () =>
      api("/learning/tutor-agreements/nda-acceptance", {
        method: "POST",
        body: JSON.stringify({
          agreement_version: ndaVersion,
          document_storage_key: ndaKey,
          evidence,
        }),
      }),
    );
  }
  async function submitVideo(e: React.FormEvent) {
    e.preventDefault();
    await action("Video", () =>
      api("/learning/tutor-videos", {
        method: "POST",
        body: JSON.stringify({
          private_storage_key: videoKey,
          duration_seconds: Number(duration),
        }),
      }),
    );
  }
  const toggle = (m: string) =>
    setModes((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
    );
  return (
    <AppShell
      title="Tutor verification & onboarding"
      description="Complete your application, create your tutor profile, submit verification references, accept the NDA and send your introduction video for review."
    >
      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        <ShieldCheck size={18} className="mt-0.5 shrink-0" />
        <p>
          For privacy, upload sensitive documents to your approved private
          storage service first, then submit the private storage key. This API
          does not directly upload document or video bytes; a storage adapter
          must be configured separately.
        </p>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck2 size={19} className="text-[#0077E6]" /> 1. Tutor
              application
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitApp} className="space-y-4">
              <Field label="Qualifications summary" htmlFor="qual">
                <Textarea
                  id="qual"
                  required
                  minLength={10}
                  maxLength={5000}
                  value={qual}
                  onChange={(e) => setQual(e.target.value)}
                  placeholder="Relevant qualifications, certificates and training"
                />
              </Field>
              <Field label="Teaching experience" htmlFor="exp">
                <Textarea
                  id="exp"
                  required
                  minLength={10}
                  maxLength={5000}
                  value={exp}
                  onChange={(e) => setExp(e.target.value)}
                  placeholder="Teaching, mentoring or subject experience"
                />
              </Field>
              <Button disabled={busy} className="w-full">
                Submit application
              </Button>
            </form>
            {application != null && (
              <pre className="mt-4 overflow-auto rounded-xl bg-slate-50 p-3 text-xs">
                {JSON.stringify(application, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 size={19} className="text-[#00AFA0]" /> 2. Public
              tutor profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitProfile} className="space-y-4">
              <Field label="Profile headline" htmlFor="headline">
                <Input
                  id="headline"
                  required
                  minLength={5}
                  maxLength={160}
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Patient primary maths tutor"
                />
              </Field>
              <Field label="Professional bio" htmlFor="bio">
                <Textarea
                  id="bio"
                  required
                  minLength={30}
                  maxLength={5000}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Your approach, experience and what learners can expect"
                />
              </Field>
              <div className="form-grid">
                <Field label="Years of experience" htmlFor="years">
                  <Input
                    id="years"
                    type="number"
                    min="0"
                    max="80"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                  />
                </Field>
                <Field label="Service area" htmlFor="area">
                  <Input
                    id="area"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="City / neighbourhood"
                  />
                </Field>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">
                  Teaching modes
                </p>
                <div className="flex flex-wrap gap-2">
                  {["ONLINE", "IN_PERSON", "HYBRID"].map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => toggle(m)}
                      className={`rounded-xl border px-3 py-2 text-xs font-bold ${modes.includes(m) ? "border-[#0077E6] bg-[#EAF3FF] text-[#0077E6]" : "border-slate-200 text-slate-500"}`}
                    >
                      {m.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
              <Button className="w-full" disabled={busy || modes.length === 0}>
                Save tutor profile
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck size={19} className="text-[#0077E6]" /> 3. Identity /
              qualification check
            </CardTitle>
            <p className="text-sm text-slate-500">
              Submit one check at a time. Admin approval is required.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitVerification} className="space-y-4">
              <Field label="Verification type" htmlFor="check">
                <select
                  id="check"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                  value={check}
                  onChange={(e) => setCheck(e.target.value)}
                >
                  <option value="IDENTITY">Identity</option>
                  <option value="QUALIFICATION">Qualification</option>
                  <option value="REFERENCE">Reference</option>
                  <option value="BACKGROUND">Background</option>
                </select>
              </Field>
              <Field
                label="Private storage key"
                htmlFor="storage"
                help="A storage key/reference, not a public URL or raw identity number."
              >
                <Input
                  id="storage"
                  required
                  minLength={5}
                  maxLength={500}
                  value={storage}
                  onChange={(e) => setStorage(e.target.value)}
                  placeholder="private/tutor-verification/…"
                />
              </Field>
              <Button variant="outline" className="w-full" disabled={busy}>
                Submit verification
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck2 size={19} className="text-[#00AFA0]" /> 4. Mandatory
              NDA
            </CardTitle>
            <p className="text-sm text-slate-500">
              The accepted version must match the version configured by the
              backend.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitNda} className="space-y-4">
              <Field label="NDA version" htmlFor="ndaVersion">
                <Input
                  id="ndaVersion"
                  required
                  value={ndaVersion}
                  onChange={(e) => setNdaVersion(e.target.value)}
                />
              </Field>
              <Field label="Document storage key" htmlFor="ndaKey">
                <Input
                  id="ndaKey"
                  required
                  minLength={3}
                  value={ndaKey}
                  onChange={(e) => setNdaKey(e.target.value)}
                />
              </Field>
              <Field label="Acceptance evidence" htmlFor="evidence">
                <Input
                  id="evidence"
                  required
                  minLength={2}
                  maxLength={180}
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                />
              </Field>
              <Button variant="outline" className="w-full" disabled={busy}>
                Accept NDA
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video size={19} className="text-[#0077E6]" /> 5. One-minute
              introduction video
            </CardTitle>
            <p className="text-sm text-slate-500">
              Upload a video through your configured private storage workflow,
              then submit its storage key for review.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitVideo} className="form-grid">
              <Field label="Private video storage key" htmlFor="videoKey">
                <Input
                  id="videoKey"
                  required
                  minLength={5}
                  value={videoKey}
                  onChange={(e) => setVideoKey(e.target.value)}
                  placeholder="private/tutor-videos/intro.mp4"
                />
              </Field>
              <Field label="Video duration in seconds" htmlFor="duration">
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="180"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </Field>
              <div className="md:col-span-2">
                <Button disabled={busy}>Submit introduction video</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600">
        <b className="text-[#102A56]">Publication gate:</b> an admin must
        approve your application, all required verification checks, the
        introduction video and pricing; you must accept the current NDA. The
        backend blocks public profile publication until required items are
        complete.
      </div>
    </AppShell>
  );
}
