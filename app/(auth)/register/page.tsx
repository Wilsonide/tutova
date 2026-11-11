"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  UserRound,
  Users,
} from "lucide-react";

import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { api } from "@/lib/api";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";

type AccountType = "PARENT" | "ADULT_LEARNER";

function getSafeNextPath(value: string | null): string | null {
  if (!value) return null;

  // Only allow internal application paths.
  // Prevent protocol-relative redirects such as //example.com.
  if (!value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

export default function RegisterPage() {
  const [accountType, setAccountType] = useState<AccountType>("PARENT");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // Preserve the destination supplied through the login/register journey.
  const [nextPath, setNextPath] = useState<string | null>(null);

  // Tracks whether registration and sign-in have already succeeded.
  // This prevents duplicate account registration if profile creation fails.
  const [accountCreated, setAccountCreated] = useState(false);

  const { signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedDestination = params.get("next");

    setNextPath(getSafeNextPath(requestedDestination));
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (busy) return;

    const trimmedName = name.trim();
    const nameParts = trimmedName.split(/\s+/);
    const trimmedEmail = email.trim();

    if (!accountCreated) {
      if (!trimmedName || nameParts.length === 0) {
        toast.error("Please enter your full name");
        return;
      }

      if (password.length < 8) {
        toast.error("Use at least 8 characters for your password");
        return;
      }

      if (!trimmedEmail) {
        toast.error("Please enter your email address");
        return;
      }
    }

    setBusy(true);

    try {
      // STEP 1: Register and authenticate the account.
      // Skip this step when retrying profile creation.
      if (!accountCreated) {
        await api(
          "/auth/register",
          {
            method: "POST",
            body: JSON.stringify({
              first_name: nameParts[0],
              last_name: nameParts.slice(1).join(" ") || nameParts[0],
              email: trimmedEmail,
              password,
              account_type: accountType,
            }),
          },
          { auth: false, retry: false },
        );

        await signIn(trimmedEmail, password);

        setAccountCreated(true);
      }

      // STEP 2: Create the appropriate profile.
      if (accountType === "PARENT") {
        // Parent profile is created from the authenticated user.
        // The backend does not require a request body.
        await api("/parents/profile", {
          method: "POST",
        });
      } else {
        // Adult learner profile requires first and last names.
        await api("/learners/profile", {
          method: "POST",
          body: JSON.stringify({
            first_name: nameParts[0],
            last_name: nameParts.slice(1).join(" ") || nameParts[0],
          }),
        });
      }

      // STEP 3: Continue to the originally requested destination.
      toast.success(
        accountType === "PARENT"
          ? "Your parent account is ready"
          : "Your learner account is ready",
      );

      router.replace(nextPath || "/dashboard");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : accountCreated
            ? "Profile creation failed. Please try again."
            : "Registration failed",
      );
    } finally {
      setBusy(false);
    }
  }

  const accountOptions = [
    {
      value: "PARENT" as const,
      title: "I'm a parent",
      description: "Find tutors and manage learning for your child.",
      icon: Users,
    },
    {
      value: "ADULT_LEARNER" as const,
      title: "I'm learning myself",
      description: "Find tutors and manage your own learning journey.",
      icon: UserRound,
    },
  ];

  const loginHref = nextPath
    ? `/login?next=${encodeURIComponent(nextPath)}`
    : "/login";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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

      <main className="mx-auto grid max-w-6xl gap-12 px-5 py-8 lg:grid-cols-[.9fr_1.1fr] lg:py-16">
        {/* Introduction panel */}
        <div className="rounded-[2rem] bg-[#102A56] p-8 text-white sm:p-10">
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-[#56E0D4]">
            YOUR NEXT CHAPTER STARTS HERE
          </span>

          <h1 className="mt-7 text-4xl font-black leading-tight">
            Good support can change the way we learn.
          </h1>

          <p className="mt-5 leading-7 text-blue-100">
            Whether you are supporting a child's education or investing in your
            own development, Tutova helps you connect with tutors who understand
            your learning needs.
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

          <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.06] p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-[#56E0D4]">
                <GraduationCap size={23} />
              </div>

              <div>
                <p className="text-sm font-bold">Learning without limits</p>
                <p className="mt-1 text-xs text-blue-100/75">
                  Education, professional skills and personal growth.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Registration form */}
        <div className="mx-auto w-full max-w-xl py-2">
          <p className="eyebrow">Create account</p>

          <h2 className="mt-3 text-3xl font-black text-[#102A56]">
            Join Tutova
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            First, tell us how you intend to use Tutova. We'll prepare your
            account around your learning needs.
          </p>

          {nextPath?.startsWith("/requests") && (
            <div className="mt-5 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <GraduationCap
                size={20}
                className="mt-0.5 shrink-0 text-[#1769D2]"
              />
              <div>
                <p className="text-sm font-bold text-[#102A56]">
                  Continue with your tutoring request
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  After creating your account, you'll return to your tutoring
                  request.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={submit} className="mt-8 space-y-5">
            {/* Account type */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-[#102A56]">
                I want to join Tutova as a...
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                {accountOptions.map((option) => {
                  const Icon = option.icon;
                  const selected = accountType === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={busy || accountCreated}
                      onClick={() => setAccountType(option.value)}
                      aria-pressed={selected}
                      className={[
                        "relative flex min-h-[132px] flex-col items-start rounded-2xl border p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-70",
                        selected
                          ? "border-[#1769D2] bg-[#F0F6FF] ring-2 ring-[#1769D2]/10"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <div className="flex w-full items-center justify-between">
                        <div
                          className={[
                            "grid h-10 w-10 place-items-center rounded-xl",
                            selected
                              ? "bg-[#1769D2] text-white"
                              : "bg-slate-100 text-slate-500",
                          ].join(" ")}
                        >
                          <Icon size={19} />
                        </div>

                        {selected && (
                          <CheckCircle2 size={19} className="text-[#1769D2]" />
                        )}
                      </div>

                      <span className="mt-3 text-sm font-bold text-[#102A56]">
                        {option.title}
                      </span>

                      <span className="mt-1 text-xs leading-5 text-slate-500">
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Field label="Full name" htmlFor="name">
              <Input
                id="name"
                required
                minLength={2}
                maxLength={120}
                autoComplete="name"
                value={name}
                disabled={busy || accountCreated}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </Field>

            <Field label="Email address" htmlFor="email">
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                disabled={busy || accountCreated}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </Field>

            <Field
              label="Create password"
              htmlFor="password"
              help="At least 8 characters. Choose a unique password."
            >
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                value={password}
                disabled={busy || accountCreated}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8+ characters"
              />
            </Field>

            {accountCreated && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
                Your account has been created and you are signed in. Profile
                setup is still pending. Submit again to retry profile creation.
              </div>
            )}

            <Button size="lg" className="w-full" disabled={busy}>
              {busy
                ? accountCreated
                  ? "Setting up your profile..."
                  : "Creating account..."
                : accountCreated
                  ? "Complete profile setup"
                  : "Create account"}

              <ArrowRight size={17} />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already registered?{" "}
            <Link href={loginHref} className="font-bold text-[#0077E6]">
              Sign in
            </Link>
          </p>

          <div className="my-6 border-t border-slate-100" />

          <p className="text-center text-sm text-slate-500">
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
