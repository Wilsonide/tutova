"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock3, ShieldCheck, XCircle } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";
function StatusInner() {
  const params = useSearchParams();
  const [status, setStatus] = useState("PENDING_VERIFICATION");
  const [detail, setDetail] = useState(
    "Payment redirects are not proof of successful payment. Verify the transaction with Tutova.",
  );
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState("");
  
  async function verify() {
    if (!reference) {
      setDetail(
        "We need the Paystack provider reference to verify this transaction. Return to Payment Centre if it is unavailable.",
      );
      return;
    }
    setBusy(true);
    try {
      const r = await api<Record<string, unknown>>(
        `/payments/reference/${encodeURIComponent(reference)}/verify`,
        { method: "POST" },
      );
      setStatus(String(r.status || "UNKNOWN"));
      setDetail(JSON.stringify(r, null, 2));
      toast.success(
        String(r.status) === "PAID" ? "Payment confirmed" : "Payment checked",
      );
    } catch (e) {
      setStatus("VERIFICATION_REQUIRED");
      setDetail(e instanceof Error ? e.message : "Could not verify payment");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    setReference(params.get("reference") || "");
  }, [params]);
  useEffect(() => {
    if (reference) verify();
  }, [reference]);
  const paid = status === "PAID";
  return (
    <>
      <SiteHeader />
      <main className="grid min-h-[75vh] place-items-center px-5 py-12">
        <Card className="w-full max-w-xl">
          <CardContent className="p-8 text-center sm:p-10">
            <div
              className={`mx-auto grid h-16 w-16 place-items-center rounded-2xl ${paid ? "bg-[#E5F8F6] text-[#00AFA0]" : "bg-[#EAF3FF] text-[#0077E6]"}`}
            >
              {paid ? (
                <CheckCircle2 size={32} />
              ) : status === "FAILED" ? (
                <XCircle size={32} />
              ) : (
                <Clock3 size={32} />
              )}
            </div>
            <p className="eyebrow mt-6">Payment status</p>
            <h1 className="mt-2 text-3xl font-black text-[#102A56]">
              {paid ? "Payment confirmed" : status.replaceAll("_", " ")}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {paid
                ? "The payment provider has confirmed this payment. Tutova has recorded the verified status."
                : "We will not mark a payment as paid until the backend verifies it with the provider."}
            </p>
            <pre className="mt-5 max-h-44 overflow-auto rounded-xl bg-slate-50 p-3 text-left text-xs text-slate-600">
              {detail}
            </pre>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              {!paid && (
                <Button onClick={verify} disabled={busy}>
                  {busy ? "Verifying…" : "Verify payment again"}
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link href="/payments">Go to payment centre</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
            <p className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={14} /> Secure, provider-verified payment status
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
export default function PaymentStatusPage() {
  return (
    <Suspense>
      <StatusInner />
    </Suspense>
  );
}
