"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  CheckCircle2,
  Info,
  LockKeyhole,
  Wallet,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { api, money } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Attempt = {
  attempt_id: string;
  status: string;
  amount_minor: number;
  currency: string;
  provider: string;
  checkout_url: string;
};

function PaymentsPageContent() {
  const params = useSearchParams();

  const [obligation, setObligation] = useState("");
  const [attemptId, setAttemptId] = useState(() => params.get("attempt") || "");
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [verification, setVerification] = useState<Record<
    string,
    unknown
  > | null>(null);

  async function checkout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!obligation.trim()) {
      toast.error("Enter a payment obligation ID");
      return;
    }

    setBusy(true);

    try {
      const idempotencyKey = crypto.randomUUID();

      const data = await api<Attempt>(
        `/learning/payments/${obligation.trim()}/attempts`,
        {
          method: "POST",
          headers: {
            "Idempotency-Key": idempotencyKey,
          },
          body: JSON.stringify({}),
        },
      );

      setAttempt(data);
      setAttemptId(data.attempt_id);

      if (data.checkout_url) {
        sessionStorage.setItem("tutova_payment_obligation", obligation.trim());

        sessionStorage.setItem("tutova_payment_attempt", data.attempt_id);

        window.location.assign(data.checkout_url);
      } else {
        toast.error("Payment provider did not return a checkout URL");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not initialize checkout",
      );
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!obligation.trim() || !attemptId.trim()) {
      toast.error("Enter the payment obligation and attempt IDs");
      return;
    }

    setBusy(true);

    try {
      const data = await api<Record<string, unknown>>(
        `/learning/payments/${obligation.trim()}/verify/${attemptId.trim()}`,
        {
          method: "POST",
        },
      );

      setVerification(data);

      toast.success(
        String(data.status) === "PAID"
          ? "Payment confirmed by provider"
          : "Payment status checked",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not verify payment",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell
      title="Payment centre"
      description="Tutova uses provider-verified payment confirmation. A checkout redirect is not proof of payment; return here and verify the attempt with the backend."
    >
      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
        <LockKeyhole size={18} className="mt-0.5 shrink-0" />

        <p>
          Paystack checkout is available only when the backend is configured
          with <code>PAYMENT_PROVIDER=PAYSTACK</code> and a valid secret key.
          The frontend never receives or stores your Paystack secret.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet size={20} className="text-[#0077E6]" />
              Start a payment
            </CardTitle>

            <p className="text-sm text-slate-500">
              Use the payment obligation ID supplied by your active agreement or
              lesson billing flow.
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={checkout} className="space-y-4">
              <Field label="Payment obligation ID" htmlFor="obligation">
                <Input
                  id="obligation"
                  required
                  value={obligation}
                  onChange={(e) => setObligation(e.target.value)}
                  placeholder="Payment obligation UUID"
                />
              </Field>

              <Button className="w-full" disabled={busy}>
                {busy
                  ? "Connecting to provider…"
                  : "Continue to secure checkout"}

                <ArrowUpRight size={16} />
              </Button>
            </form>

            <p className="mt-4 text-xs leading-5 text-slate-500">
              A fresh idempotency key is generated for each new checkout
              attempt. Do not retry an already paid obligation.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verify payment status</CardTitle>

            <p className="text-sm text-slate-500">
              After checkout, verify with the server to confirm whether the
              provider reports a successful payment.
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={verify} className="space-y-4">
              <Field label="Payment obligation ID" htmlFor="obligationVerify">
                <Input
                  id="obligationVerify"
                  required
                  value={obligation}
                  onChange={(e) => setObligation(e.target.value)}
                  placeholder="Payment obligation UUID"
                />
              </Field>

              <Field label="Payment attempt ID" htmlFor="attempt">
                <Input
                  id="attempt"
                  required
                  value={attemptId}
                  onChange={(e) => setAttemptId(e.target.value)}
                  placeholder="Payment attempt UUID"
                />
              </Field>

              <Button variant="outline" className="w-full" disabled={busy}>
                Verify with Tutova API
              </Button>
            </form>

            {attempt && (
              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Checkout attempt</span>

                  <Badge>{attempt.status}</Badge>
                </div>

                <p className="mt-2 text-xl font-black text-[#102A56]">
                  {money(attempt.amount_minor, attempt.currency)}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Provider: {attempt.provider} · {attempt.attempt_id}
                </p>
              </div>
            )}

            {verification && (
              <div className="mt-4 rounded-xl border border-[#00AFA0]/30 bg-[#E5F8F6] p-4">
                <div className="flex items-center gap-2 font-bold text-[#087e75]">
                  <CheckCircle2 size={17} />
                  Latest verification
                </div>

                <pre className="mt-2 overflow-auto text-xs text-slate-700">
                  {JSON.stringify(verification, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-5">
        <CardContent className="flex gap-3 p-5">
          <Info size={18} className="mt-0.5 shrink-0 text-slate-400" />

          <p className="text-xs leading-5 text-slate-500">
            This backend currently has payment initiation, server-side
            verification and signed webhook support. It does not expose a list
            endpoint for payment obligations or attempts, so payment history
            cannot be displayed until those read endpoints are added.
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}

function PaymentsPageFallback() {
  return (
    <AppShell
      title="Payment centre"
      description="Loading your payment centre..."
    >
      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
            <div className="mt-5 h-11 animate-pulse rounded-lg bg-slate-100" />
            <div className="mt-4 h-11 animate-pulse rounded-lg bg-slate-100" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
            <div className="mt-5 h-11 animate-pulse rounded-lg bg-slate-100" />
            <div className="mt-4 h-11 animate-pulse rounded-lg bg-slate-100" />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={<PaymentsPageFallback />}>
      <PaymentsPageContent />
    </Suspense>
  );
}
