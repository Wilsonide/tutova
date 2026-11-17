"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

type ConsentPage = {
  referee_name: string;
  referee_email: string;
  tutor_name: string;
  status: "PENDING" | "CONSENTED" | "DECLINED" | "EXPIRED";
  token_expires_at: string;
};

export default function RefereeConsentPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [page, setPage] = useState<ConsentPage | null>(null);
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let active = true;

    api<ConsentPage>(
      `/verification/referee/${encodeURIComponent(token)}`,
      {},
      { auth: false },
    )
      .then((result) => {
        if (!active) return;

        setPage(result);
        setName(result.referee_name);
        setSubmitted(result.status === "CONSENTED");
      })
      .catch((error) =>
        toast.error(
          error instanceof Error
            ? error.message
            : "This invitation is unavailable.",
        ),
      )
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!consent) {
      toast.error("Please confirm your consent before submitting.");
      return;
    }

    await sendResponse(true);
  }

  async function decline() {
    if (!name.trim()) {
      toast.error("Enter your full name before declining this request.");
      return;
    }

    await sendResponse(false);
  }

  async function sendResponse(accepted: boolean) {
    setBusy(true);

    try {
      const result = await api<ConsentPage>(
        `/verification/referee/${encodeURIComponent(token)}/consent`,
        {
          method: "POST",
          body: JSON.stringify({
            consented_name: name,
            consent: accepted,
          }),
        },
        { auth: false },
      );

      setPage(result);
      setSubmitted(true);

      toast.success(
        accepted
          ? "Your referee consent has been recorded."
          : "Your response has been recorded.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not submit your consent.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F8FB] px-4 py-10">
      <div className="w-full max-w-xl">
        {/* Tutova branding */}
        <div className="mb-7 flex flex-col items-center text-center">
          <Image
            src="/images/logo.png"
            alt="Tutova"
            width={180}
            height={60}
            priority
            className="h-14 w-auto object-contain"
          />

          <p className="mt-2 text-sm text-slate-500">Tutor referee consent</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reference and consent request</CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading secure invitation…
              </div>
            ) : !page ? (
              <p className="py-6 text-sm text-slate-600">
                This invitation is invalid or has expired. Please contact the
                tutor who nominated you.
              </p>
            ) : submitted ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />

                <h1 className="mt-4 text-lg font-bold text-[#102A56]">
                  Response recorded
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {page.status === "CONSENTED"
                    ? `Thank you. Your consent as a referee for ${page.tutor_name} has been recorded.`
                    : "Your decision not to act as a referee has been recorded."}{" "}
                  You can close this page.
                </p>
              </div>
            ) : page.status !== "PENDING" ? (
              <p className="py-6 text-sm text-slate-600">
                This invitation is no longer awaiting a response.
              </p>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <p className="text-sm leading-6 text-slate-600">
                  {page.tutor_name} has nominated you as a referee as part of
                  their Tutova tutor onboarding. Please confirm that you are
                  willing to act as a referee and allow Tutova to contact you
                  for verification and safeguarding checks.
                </p>

                <div className="rounded-xl bg-slate-50 p-4 text-sm">
                  <p>
                    <span className="font-semibold">Invitation sent to:</span>{" "}
                    {page.referee_email}
                  </p>

                  <p className="mt-1">
                    <span className="font-semibold">Nominated name:</span>{" "}
                    {page.referee_name}
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Your full name
                  </label>

                  <Input
                    required
                    minLength={2}
                    maxLength={160}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>

                <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-600">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                    className="mt-1 h-4 w-4 accent-[#00AFA0]"
                  />

                  <span>
                    I confirm that I know this tutor, agree to act as a referee,
                    and consent to Tutova contacting me to verify the
                    information provided by the tutor. I understand that my
                    response will be used for tutor onboarding and safeguarding
                    review.
                  </span>
                </label>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="submit"
                    disabled={busy || !consent}
                    className="w-full"
                  >
                    {busy ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="mr-2 h-4 w-4" />
                    )}
                    Submit consent
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={() => void decline()}
                    className="w-full"
                  >
                    Decline request
                  </Button>
                </div>

                <p className="text-center text-xs text-slate-400">
                  This secure link expires{" "}
                  {new Date(page.token_expires_at).toLocaleString()}.
                </p>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="mt-5 text-center text-xs text-slate-400">
          If you did not expect this request, you may ignore this email.
        </p>
      </div>
    </main>
  );
}
