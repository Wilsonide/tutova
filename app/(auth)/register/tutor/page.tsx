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

export default function TutorRegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const { signIn } = useAuth();
  const router = useRouter();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanFirstName || !cleanLastName) {
      toast.error("Enter your first name and last name.");
      return;
    }

    if (password.length < 8) {
      toast.error("Use at least 8 characters for your password.");
      return;
    }

    setBusy(true);

    try {
      await api(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify({
            first_name: cleanFirstName,
            last_name: cleanLastName,
            email: cleanEmail,
            password,
            account_type: "TUTOR",
          }),
        },
        { auth: false, retry: false },
      );

      await signIn(cleanEmail, password);

      toast.success("Your tutor account has been created.");
      router.replace("/tutor/onboarding");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.",
      );
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
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#102A56]"
        >
          <ArrowLeft size={16} />
          Home
        </Link>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-5 py-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-14 lg:py-16">
        <section className="rounded-[2rem] bg-[#102A56] p-8 text-white sm:p-10">
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold tracking-wide text-[#56E0D4]">
            TEACH WITH TUTOVA
          </span>

          <h1 className="mt-7 text-4xl font-black leading-tight sm:text-5xl">
            Make a meaningful difference through teaching.
          </h1>

          <p className="mt-5 leading-7 text-blue-100">
            Connect with learners, share your expertise, and help people make
            real progress through personalised tutoring.
          </p>

          <div className="mt-9 space-y-4">
            {[
              "Create your professional tutor profile",
              "Showcase your experience and expertise",
              "Connect with learners seeking your skills",
            ].map((item) => (
              <p key={item} className="flex items-start gap-3 text-sm">
                <CheckCircle2
                  className="mt-0.5 shrink-0 text-[#56E0D4]"
                  size={18}
                />
                {item}
              </p>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-xl py-2">
          <p className="eyebrow">Tutor registration</p>

          <h2 className="mt-3 text-3xl font-black text-[#102A56]">
            Become a Tutova tutor
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Create your account to get started. You can then add your teaching
            information, learning areas, profile details, and complete the
            verification process.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="First name" htmlFor="first_name">
                <Input
                  id="first_name"
                  required
                  minLength={1}
                  maxLength={100}
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                />
              </Field>

              <Field label="Last name" htmlFor="last_name">
                <Input
                  id="last_name"
                  required
                  minLength={1}
                  maxLength={100}
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                />
              </Field>
            </div>

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
              help="Use at least 8 characters and choose a unique password."
            >
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8+ characters"
              />
            </Field>

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? "Creating account…" : "Create tutor account"}
              {!busy && <ArrowRight size={17} />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already registered?{" "}
            <Link href="/login" className="font-bold text-[#0077E6]">
              Sign in
            </Link>
          </p>

          <p className="mt-5 text-center text-sm text-slate-500">
            Looking for a tutor?{" "}
            <Link href="/register" className="font-bold text-[#0077E6]">
              Create a learner account
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
