"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { api, money } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowUpRight, CreditCard, ReceiptText, ShieldCheck, Wallet } from "lucide-react";

type Payment = {
  id: string;
  booking_id: string | null;
  tutoring_request_id: string | null;
  tutor_profile_id: string;
  provider_reference: string;
  amount_minor: number;
  tutoring_amount_minor: number;
  learner_fee_minor: number;
  currency: string;
  status: string;
  created_at: string;
  paid_at: string | null;
};

type Tutor = {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  profile_picture_url: string | null;
};

function statusStyle(status: string) {
  switch (status.toUpperCase()) {
    case "PAID": return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "PENDING": return "border-amber-200 bg-amber-50 text-amber-700";
    case "FAILED": case "ABANDONED": return "border-red-200 bg-red-50 text-red-700";
    default: return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

export default function PaymentsPage() {
  const [rows, setRows] = useState<Payment[]>([]);
  const [tutors, setTutors] = useState<Record<string, Tutor>>({});
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const payments = await api<Payment[]>("/payments/mine");
      setRows(payments);
      const ids = Array.from(new Set(payments.map((payment) => payment.tutor_profile_id).filter(Boolean)));
      const profiles = await Promise.all(ids.map(async (id) => {
        try { return await api<Tutor>(`/tutors/${encodeURIComponent(id)}`); }
        catch { return null; }
      }));
      const next: Record<string, Tutor> = {};
      profiles.forEach((profile) => { if (profile) next[profile.id] = profile; });
      setTutors(next);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load payments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  return (
    <AppShell
      title="Payments"
      description="See what you paid, the platform charge, and the status of each tutoring contract."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-3 p-5"><div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-[#1769D2]"><Wallet className="h-5 w-5" /></div><div><p className="text-xs font-medium text-slate-500">Payment records</p><p className="mt-1 text-2xl font-bold text-[#102A56]">{rows.length}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-5"><div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><ShieldCheck className="h-5 w-5" /></div><div><p className="text-xs font-medium text-slate-500">Successful payments</p><p className="mt-1 text-2xl font-bold text-[#102A56]">{rows.filter((row) => row.status === "PAID").length}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-5"><div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-700"><CreditCard className="h-5 w-5" /></div><div><p className="text-xs font-medium text-slate-500">Awaiting confirmation</p><p className="mt-1 text-2xl font-bold text-[#102A56]">{rows.filter((row) => row.status === "PENDING").length}</p></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2"><ReceiptText className="h-5 w-5 text-[#1769D2]" /><CardTitle>Payment history</CardTitle></div>
          <p className="text-sm leading-6 text-slate-500">Each record shows the tutor, tutoring contract amount, learner platform charge and total. A booking is created only after successful payment confirmation.</p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map((item) => <div key={item} className="h-24 animate-pulse rounded-xl bg-slate-100" />)}</div>
          ) : rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 px-5 py-12 text-center">
              <Wallet className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 font-semibold text-slate-800">No payments yet</p>
              <p className="mt-1 text-sm text-slate-500">When you arrange a tutoring contract, your payment details will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((payment) => {
                const tutor = tutors[payment.tutor_profile_id];
                const name = tutor?.full_name || (tutor ? `${tutor.first_name} ${tutor.last_name}` : "Tutova tutor");
                const initials = name.split(" ").filter(Boolean).slice(0,2).map((part) => part[0]).join("").toUpperCase();
                return (
                  <article key={payment.id} className="app-card-hover rounded-2xl border border-slate-100 p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        {tutor?.profile_picture_url ? <img src={tutor.profile_picture_url} alt={name} className="h-12 w-12 rounded-full object-cover" /> : <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blue-50 text-sm font-bold text-[#1769D2]">{initials || "T"}</div>}
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#102A56]">{name}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{new Date(payment.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })} · Ref {payment.provider_reference}</p>
                        </div>
                      </div>
                      <Badge className={`border ${statusStyle(payment.status)}`}>{payment.status.replaceAll("_", " ")}</Badge>
                    </div>
                    <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-3">
                      <div><p className="text-xs text-slate-500">Tutoring contract</p><p className="mt-1 font-semibold text-slate-800">{money(payment.tutoring_amount_minor, payment.currency)}</p></div>
                      <div><p className="text-xs text-slate-500">Tutova platform charge</p><p className="mt-1 font-semibold text-slate-800">{money(payment.learner_fee_minor, payment.currency)}</p></div>
                      <div><p className="text-xs text-slate-500">Total amount</p><p className="mt-1 text-lg font-bold text-[#102A56]">{money(payment.amount_minor, payment.currency)}</p></div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                      <span>{payment.booking_id ? "Booking created" : payment.tutoring_request_id ? "Booking will be created after payment is confirmed" : "Payment record"}</span>
                      {payment.paid_at && <span>Paid {new Date(payment.paid_at).toLocaleString("en-NG")}</span>}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
