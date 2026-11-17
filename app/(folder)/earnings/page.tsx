"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { api, money } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Eligible = {
  payment_id: string;
  booking_id: string | null;
  earning_period_start: string | null;
  earning_period_end: string | null;
  gross_amount_minor: number;
  available_amount_minor: number;
  currency: string;
  paid_at: string | null;
};
type Payout = {
  id: string;
  payment_id: string;
  earning_period_start?: string | null;
  earning_period_end?: string | null;
  amount_minor: number;
  currency: string;
  status: string;
  created_at: string;
};
type EarningsSummary = {
  currency: string;
  total_contract_amount_minor: number;
  total_platform_commission_minor: number;
  total_tutor_earnings_minor: number;
  current_month_earnings_minor: number;
  paid_out_minor: number;
  held_tutor_earnings_minor: number;
};

export default function EarningsPage() {
  const [eligible, setEligible] = useState<Eligible[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const [e, p, s] = await Promise.all([
        api<Eligible[]>("/payments/payouts/eligible"),
        api<Payout[]>("/payments/payouts/mine"),
        api<EarningsSummary>("/payments/earnings/summary"),
      ]);
      setEligible(e);
      setPayouts(p);
      setSummary(s);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load payout information");
    }
  }

  useEffect(() => {
    void load();
    api<{ account_name?: string }>("/payments/payout-destination")
      .then((value) => setAccountName(value.account_name || ""))
      .catch(() => undefined);
  }, []);

  async function saveBank(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await api("/payments/payout-destination", {
        method: "PUT",
        body: JSON.stringify({ account_name: accountName, account_number: accountNumber, bank_code: bankCode }),
      });
      toast.success("Payout destination saved");
      setAccountNumber("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save bank details");
    } finally {
      setBusy(false);
    }
  }

  async function request(item: Eligible) {
    setBusy(true);
    try {
      const periodQuery = item.earning_period_start
        ? `?earning_period_start=${encodeURIComponent(item.earning_period_start)}`
        : "";
      await api(`/payments/payouts/request/${item.payment_id}${periodQuery}`, { method: "POST" });
      toast.success("Payout request submitted");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payout request failed");
    } finally {
      setBusy(false);
    }
  }

  const available = eligible.reduce((total, item) => total + item.available_amount_minor, 0);

  return (
    <AppShell
      title="Earnings & payouts"
      description="Track the monthly share of your tutoring contracts, amounts held by Tutova and payments released after the contract and lesson checks."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">This month's earnings</p><p className="mt-2 text-2xl font-black text-[#00A99A]">{money(summary?.current_month_earnings_minor ?? 0, summary?.currency ?? "NGN")}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Total tutor earnings</p><p className="mt-2 text-2xl font-black text-[#102A56]">{money(summary?.total_tutor_earnings_minor ?? 0, summary?.currency ?? "NGN")}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Held by Tutova</p><p className="mt-2 text-2xl font-black text-amber-700">{money(summary?.held_tutor_earnings_minor ?? 0, summary?.currency ?? "NGN")}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-slate-500">Already paid</p><p className="mt-2 text-2xl font-black text-[#102A56]">{money(summary?.paid_out_minor ?? 0, summary?.currency ?? "NGN")}</p></CardContent></Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Contract breakdown</CardTitle></CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div><p className="text-slate-500">Total paid by learners</p><p className="mt-1 text-lg font-bold">{money(summary?.total_contract_amount_minor ?? 0, summary?.currency ?? "NGN")}</p></div>
          <div><p className="text-slate-500">Tutova commission deducted</p><p className="mt-1 text-lg font-bold">{money(summary?.total_platform_commission_minor ?? 0, summary?.currency ?? "NGN")}</p></div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle>Eligible earnings</CardTitle></CardHeader>
        <CardContent>
          {eligible.length ? eligible.map((item) => (
            <div key={`${item.payment_id}-${item.earning_period_start ?? "legacy"}`} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0">
              <div><p className="font-semibold text-[#102A56]">{money(item.available_amount_minor, item.currency)}</p><p className="text-xs text-slate-500">{item.earning_period_start ? `Earning period ${new Date(item.earning_period_start).toLocaleDateString()} – ${new Date(item.earning_period_end ?? item.earning_period_start).toLocaleDateString()}` : `Booking ${item.booking_id?.slice(0, 8) ?? "—"}`} · Payment {item.payment_id.slice(0, 8)}</p></div>
              <Button size="sm" disabled={busy} onClick={() => void request(item)}>Request payout</Button>
            </div>
          )) : <p className="py-5 text-sm text-slate-500">No eligible payouts yet. Each month's share remains held until that month ends and all lessons scheduled in that month are completed, acknowledged and clear of unresolved disputes or reviews.</p>}
          <p className="mt-3 text-xs text-slate-500">The monthly earnings figure is an accrual display. A month's payout becomes eligible only after month-end and completion acknowledgement for all lessons in that month.</p>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Payout bank account</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={saveBank} className="space-y-3">
              <Field label="Account name"><Input required value={accountName} onChange={(event) => setAccountName(event.target.value)} /></Field>
              <Field label="Account number"><Input required minLength={8} maxLength={12} value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} /></Field>
              <Field label="Bank code"><Input required value={bankCode} onChange={(event) => setBankCode(event.target.value)} placeholder="Bank code" /></Field>
              <Button disabled={busy}>Save payout destination</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Payout history</CardTitle></CardHeader>
          <CardContent>
            {payouts.length ? payouts.map((payout) => (
              <div key={payout.id} className="flex justify-between border-b border-slate-100 py-3 text-sm">
                <div><p className="font-semibold">{money(payout.amount_minor, payout.currency)}</p><p className="text-xs text-slate-500">{payout.earning_period_start ? `${new Date(payout.earning_period_start).toLocaleDateString()} – ${new Date(payout.earning_period_end ?? payout.earning_period_start).toLocaleDateString()}` : new Date(payout.created_at).toLocaleDateString()}</p></div><Badge>{payout.status}</Badge>
              </div>
            )) : <p className="py-5 text-sm text-slate-500">No payout requests yet.</p>}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
