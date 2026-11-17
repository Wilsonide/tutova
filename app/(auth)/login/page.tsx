"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { useAuth } from "@/components/providers";
import { getMyTutorVerification } from "@/lib/api";
import { toast } from "sonner";

type AccountType = "PARENT" | "ADULT_LEARNER" | "TUTOR";

const accountGuidance: Record<
  AccountType,
  { label: string; description: string }
> = {
  PARENT: {
    label: "Parent / Guardian",
    description:
      "Find trusted tutors, arrange lessons for your child, and follow their learning progress.",
  },
  ADULT_LEARNER: {
    label: "Adult learner",
    description:
      "Find a tutor, arrange lessons, and take control of your personal learning journey.",
  },
  TUTOR: {
    label: "Tutor",
    description:
      "Access your teaching account, manage lessons, and complete your tutor verification.",
  },
};

// Shared Tutova branding.
function TutovaBrand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className="inline-flex w-fit items-center gap-3 transition-opacity hover:opacity-80"
      aria-label="Tutova home"
    >
      <span className="flex h-[58px] w-[76px] items-center justify-center rounded-xl border border-white/60 bg-white px-2 shadow-lg shadow-black/10">
        <Image
          src="/images/logo.png"
          alt="Tutova logo"
          width={180}
          height={60}
          priority
          className="h-10 w-full object-contain"
        />
      </span>

      <span
        className={`text-2xl font-extrabold tracking-tight ${
          light ? "text-white" : "text-[#102A56]"
        }`}
      >
        Tutova<span className="text-[#00AFA0]">.</span>
      </span>
    </Link>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("PARENT");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const { signIn } = useAuth();
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    setBusy(true);

    try {
      const user = await signIn(email, password);

      const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

      const isTutor = user.role === "TUTOR";

      // Unverified tutors must complete onboarding before accessing
      // the normal dashboard.
      let isApprovedTutor = false;

      if (isTutor) {
        try {
          const verification = await getMyTutorVerification();
          isApprovedTutor = verification.status === "APPROVED";
        } catch (error) {
          // Fail safely: if verification cannot be confirmed,
          // keep the tutor in onboarding.
          console.error("Unable to retrieve tutor verification status:", error);
        }
      }

      const next =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("next")
          : null;

      const safeNext =
        next && next.startsWith("/") && !next.startsWith("//") ? next : null;

      // Determine destination based on role and verification.
      const destination = isAdmin
        ? "/admin"
        : isTutor && !isApprovedTutor
          ? "/tutor/onboarding"
          : (safeNext ?? "/dashboard");

      toast.success(
        isTutor && !isApprovedTutor
          ? "Welcome back! Please complete your tutor verification."
          : "Welcome back",
      );

      router.replace(destination);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      {/* Desktop branding panel */}
      <section className="hidden flex-col justify-between bg-[#102A56] p-12 text-white lg:flex">
        <TutovaBrand light />

        <div className="max-w-lg">
          <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-[#56E0D4]">
            <LockKeyhole size={28} />
          </div>

          <h1 className="text-4xl font-black leading-tight">
            Your learning journey, all in one place.
          </h1>

          <p className="mt-5 leading-8 text-blue-100">
            Pick up where you left off. Your lessons, tutor conversations and
            progress are ready when you are.
          </p>
        </div>

        <p className="text-xs text-blue-200">
          TUTOVA · The right tutor. A brighter future.
        </p>
      </section>

      {/* Login form */}
      <section className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="mb-10 lg:hidden">
            <TutovaBrand />
          </div>

          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-[#0077E6]"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>

          <p className="eyebrow">Welcome back</p>

          <h2 className="mt-3 text-3xl font-black text-[#102A56]">
            Sign in to Tutova
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Use the email and password associated with your account.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            {/* Account type */}
            <Field label="I am signing in as" htmlFor="accountType">
              <div className="relative">
                <select
                  id="accountType"
                  value={accountType}
                  onChange={(e) =>
                    setAccountType(e.target.value as AccountType)
                  }
                  disabled={busy}
                  className="h-11 w-full appearance-none rounded-xl border border-input bg-white px-3 pr-10 text-sm font-medium text-[#102A56] outline-none transition-all focus:border-[#0077E6] focus:ring-2 focus:ring-[#0077E6]/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="PARENT">Parent / Guardian</option>
                  <option value="ADULT_LEARNER">Adult learner</option>
                  <option value="TUTOR">Tutor</option>
                </select>

                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                {accountGuidance[accountType].description}
              </p>
            </Field>

            {/* Email */}
            <Field label="Email address" htmlFor="email">
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={busy}
              />
            </Field>

            {/* Password */}
            <Field label="Password" htmlFor="password">
              <div className="relative">
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-12"
                  placeholder="Enter your password"
                  disabled={busy}
                />

                <button
                  type="button"
                  aria-label={show ? "Hide password" : "Show password"}
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-[#102A56]"
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>

            {/* Submit */}
            <Button className="w-full" size="lg" disabled={busy} type="submit">
              {busy ? "Signing you in…" : "Sign in"}
              {!busy && <ArrowRight size={17} />}
            </Button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            New to Tutova?{" "}
            <Link
              href="/register"
              className="font-bold text-[#0077E6] transition-colors hover:text-[#005DB8]"
            >
              Create an account
            </Link>
          </p>

          <p className="mt-8 rounded-xl bg-[#F4F8FB] p-3 text-xs leading-5 text-slate-500">
            Security note: Tutova keeps the refresh token in an HTTP-only
            cookie. Your short-lived access token stays in memory and is
            refreshed through the backend.
          </p>
        </div>
      </section>
    </div>
  );
}
