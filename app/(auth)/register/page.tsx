"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { api } from "@/lib/api";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const { signIn } = useAuth();
  const router = useRouter();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (password.length < 12) {
      toast.error("Use at least 12 characters for your password");
      return;
    }

    setBusy(true);

    try {
      await api(
        "/users/register/learner",
        {
          method: "POST",
          body: JSON.stringify({
            display_name: name,
            email,
            password,
          }),
        },
        { auth: false, retry: false },
      );

      await signIn(email, password);

      toast.success("Your account is ready");
      router.replace("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6">
        <Brand />

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500"
        >
          <ArrowLeft size={16} />
          Home
        </Link>
      </header>

      <main className="mx-auto grid max-w-6xl gap-12 px-5 py-8 lg:grid-cols-[.9fr_1.1fr] lg:py-16">
        <div className="rounded-[2rem] bg-[#102A56] p-8 text-white sm:p-10">
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-[#56E0D4]">
            YOUR NEXT CHAPTER STARTS HERE
          </span>

          <h1 className="mt-7 text-4xl font-black leading-tight">
            Good support can change the way we learn.
          </h1>

          <p className="mt-5 leading-7 text-blue-100">
            Create your account and take the next step with a tutoring
            experience built around trust and progress.
          </p>

          <div className="mt-9 space-y-4">
            {[
              "Find learning support that suits your needs",
              "Connect with tutors who match your preferences",
              "Manage your tutoring journey in one place",
            ].map((item) => (
              <p key={item} className="flex gap-3 text-sm">
                <CheckCircle2 className="shrink-0 text-[#56E0D4]" size={18} />
                {item}
              </p>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-xl py-2">
          <p className="eyebrow">Create account</p>

          <h2 className="mt-3 text-3xl font-black text-[#102A56]">
            Join Tutova
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Create your account to discover tutors and access learning support
            for yourself or someone in your care.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <Field label="Full name" htmlFor="name">
              <Input
                id="name"
                required
                minLength={2}
                maxLength={120}
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </Field>

            <Field label="Email address" htmlFor="email">
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </Field>

            <Field
              label="Create password"
              htmlFor="password"
              help="At least 12 characters. Choose a unique password."
            >
              <Input
                id="password"
                type="password"
                required
                minLength={12}
                maxLength={128}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="12+ characters"
              />
            </Field>

            <Button size="lg" className="w-full" disabled={busy}>
              {busy ? "Creating account…" : "Create account"}
              <ArrowRight size={17} />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already registered?{" "}
            <Link href="/login" className="font-bold text-[#0077E6]">
              Sign in
            </Link>
          </p>

          <p className="mt-5 text-center text-sm text-slate-500">
            Interested in teaching on Tutova?{" "}
            <Link href="/register/tutor" className="font-bold text-[#0077E6]">
              Register as a tutor
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
