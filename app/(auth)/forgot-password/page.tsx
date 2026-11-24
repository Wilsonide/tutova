"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { requestPasswordReset } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await requestPasswordReset(email.trim());
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not process your request. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-[#EAF3F7] p-12 text-[#102A56] lg:flex">
        <Link href="/" className="text-2xl font-black tracking-tight">Tutova<span className="text-[#00AFA0]">.</span></Link>
        <div className="max-w-lg">
          <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#00AFA0]/10 text-[#008F84]"><ShieldCheck size={28} /></div>
          <h1 className="text-4xl font-black leading-tight">A secure way back into your learning journey.</h1>
          <p className="mt-5 leading-8 text-slate-600">We’ll help you regain access to your Tutova account with a private, time-limited reset link.</p>
        </div>
        <p className="text-xs text-slate-500">TUTOVA · The right tutor. A brighter future.</p>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link href="/login" className="mb-9 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#0077E6]"><ArrowLeft size={16} /> Back to sign in</Link>
          {!submitted ? (
            <>
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-[#0077E6]/10 text-[#0077E6]"><Mail size={23} /></div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#00AFA0]">Account recovery</p>
              <h1 className="mt-3 text-3xl font-black text-[#102A56]">Forgot your password?</h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">Enter the email address linked to your Tutova account. If an account exists, we’ll send instructions to reset its password.</p>
              <form onSubmit={submit} className="mt-8 space-y-5">
                <Field label="Email address" htmlFor="email">
                  <Input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" disabled={busy} />
                </Field>
                {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                <Button className="w-full" size="lg" type="submit" disabled={busy}>{busy ? "Sending instructions…" : "Send reset link"}</Button>
              </form>
            </>
          ) : (
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-7">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><CheckCircle2 size={25} /></div>
              <h1 className="mt-5 text-2xl font-black text-[#102A56]">Check your inbox</h1>
              <p className="mt-3 text-sm leading-7 text-slate-600">If an account exists for <strong>{email}</strong>, and email delivery is available, password reset instructions will be sent shortly. Check your spam folder too.</p>
              <Link href="/login" className="mt-6 inline-flex text-sm font-bold text-[#0077E6] hover:text-[#005DB8]">Return to sign in</Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
