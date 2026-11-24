"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { resetPassword } from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!token) {
      setError("This reset link is missing its security token. Request a new link.");
      return;
    }
    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }
    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "This reset link is invalid or has expired.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-[#EAF3F7] p-12 text-[#102A56] lg:flex">
        <Link href="/" className="text-2xl font-black tracking-tight">Tutova<span className="text-[#00AFA0]">.</span></Link>
        <div className="max-w-lg">
          <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#00AFA0]/10 text-[#008F84]"><LockKeyhole size={28} /></div>
          <h1 className="text-4xl font-black leading-tight">Choose a new password.</h1>
          <p className="mt-5 leading-8 text-slate-600">Create a strong password to protect your lessons, learning records and account information.</p>
        </div>
        <p className="text-xs text-slate-500">TUTOVA · The right tutor. A brighter future.</p>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link href="/login" className="mb-9 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#0077E6]"><ArrowLeft size={16} /> Back to sign in</Link>
          {success ? (
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-7">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700"><CheckCircle2 size={25} /></div>
              <h1 className="mt-5 text-2xl font-black text-[#102A56]">Password updated</h1>
              <p className="mt-3 text-sm leading-7 text-slate-600">Your password has been changed and existing sessions have been signed out. You can now sign in with your new password.</p>
              <Button className="mt-6 w-full" onClick={() => router.replace("/login")}>Continue to sign in</Button>
            </div>
          ) : (
            <>
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-[#0077E6]/10 text-[#0077E6]"><LockKeyhole size={23} /></div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#00AFA0]">Account security</p>
              <h1 className="mt-3 text-3xl font-black text-[#102A56]">Create a new password</h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">Use at least 8 characters. This reset link can only be used once and expires after 30 minutes.</p>
              <form onSubmit={submit} className="mt-8 space-y-5">
                <Field label="New password" htmlFor="password">
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your new password" className="pr-12" disabled={busy} />
                    <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#102A56]">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                </Field>
                <Field label="Confirm new password" htmlFor="confirmation">
                  <div className="relative">
                    <Input id="confirmation" type={showConfirmation ? "text" : "password"} autoComplete="new-password" required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Enter your new password again" className="pr-12" disabled={busy} />
                    <button type="button" aria-label={showConfirmation ? "Hide password" : "Show password"} onClick={() => setShowConfirmation((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#102A56]">{showConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                </Field>
                {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                <Button className="w-full" size="lg" type="submit" disabled={busy || !token}>{busy ? "Updating password…" : "Reset password"}</Button>
              </form>
              {!token && <p className="mt-4 text-sm text-amber-700">No reset token was found. <Link className="font-bold underline" href="/forgot-password">Request a new reset link</Link>.</p>}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<div className="grid min-h-screen place-items-center text-sm text-slate-500">Loading secure reset form…</div>}><ResetPasswordForm /></Suspense>;
}
