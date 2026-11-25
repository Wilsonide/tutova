import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import {
  ArrowRight,
  BadgeCheck,
  FileCheck2,
  Handshake,
  MessageCircle,
  ShieldCheck,
  Users,
  Video,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Safety and trust",
  description:
    "Learn how Tutova approaches tutor verification, responsible tutoring, account security and support.",
};

const verificationSteps = [
  {
    icon: FileCheck2,
    title: "Identity and profile review",
    description:
      "Tutors submit identification and relevant profile details for review by the Tutova team.",
  },
  {
    icon: Users,
    title: "Referee checks",
    description:
      "Applicants provide at least two referees. Tutova contacts them to collect responses as part of the application review.",
  },
  {
    icon: Video,
    title: "Tutor introduction video",
    description:
      "Tutors submit a short introduction video so prospective learners and parents can become more familiar with them.",
  },
  {
    icon: Handshake,
    title: "Professional commitment",
    description:
      "Tutors are required to read and agree to Tutova's non-disclosure agreement and professional expectations.",
  },
  {
    icon: BadgeCheck,
    title: "Manual approval",
    description:
      "A submitted application is not automatically approved. The Tutova team reviews the application before a tutor is approved to use the tutor workspace.",
  },
];

const practices = [
  [
    "Keep communication clear",
    "Discuss lesson objectives, expectations, schedules and any changes respectfully. Keep relevant booking details accurate on the platform.",
  ],
  [
    "Protect personal information",
    "Do not share passwords, payment credentials or sensitive identity information in lesson conversations. Share only information necessary to arrange and deliver tutoring.",
  ],
  [
    "Use the booking and payment process",
    "Review lesson details before confirming. Follow the platform's payment and lesson-completion steps, and raise a dispute through the available lesson workflow if something is wrong.",
  ],
  [
    "Raise concerns",
    "If you experience conduct that makes you uncomfortable or have a concern about a lesson or account, contact Tutova so the team can review the matter.",
  ],
];

export default function SafetyPage() {
  return (
    <main className="bg-white text-[#102A56]">
      <section className="bg-[#102A56]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55D8CC]">
            Trust, safety and support
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-5xl">
            A better learning experience starts with trust.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-blue-100 sm:text-lg">
            Tutova brings parents, learners and tutors together. We use
            verification and review steps, clear platform workflows and
            community expectations to encourage responsible learning
            relationships.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/discover"
              className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#00AFA0] px-5 text-sm font-semibold text-white hover:bg-[#00998D]"
            >
              Find a tutor <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="tel:+2347010163875"
              className="inline-flex min-h-12 items-center rounded-lg border border-white/30 px-5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Call Tutova
            </a>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-16 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0077E6]">
            Tutor verification
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            How tutor applications are reviewed
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Verification is a review process. Completing the application or
            sending referee invitations does not by itself mean that a tutor has
            been approved.
          </p>
          <div className="mt-9 grid gap-4 md:grid-cols-2">
            {verificationSteps.map(
              ({ icon: Icon, title, description }, index) => (
                <article
                  key={title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0F7FF] text-[#0077E6]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-bold tracking-widest text-[#00AFA0]">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {description}
                  </p>
                </article>
              ),
            )}
          </div>
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
            <strong>Important:</strong> These measures are intended to support
            trust and accountability. They cannot eliminate every possible risk
            or guarantee the conduct of every person using the platform.
            Parents, learners and tutors should continue to use good judgment.
          </div>
        </div>
      </section>

      <section className="bg-[#F4F8FB] px-5 py-14 sm:px-8 sm:py-16 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0077E6]">
              Community practices
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Help keep lessons respectful and secure.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Safety is a shared responsibility. These practices help everyone
              understand how to use Tutova thoughtfully.
            </p>
          </div>
          <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-5">
            {practices.map(([title, description]) => (
              <div key={title} className="flex gap-4 py-5">
                <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-[#00AFA0]" />
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-7 text-slate-600">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-16 lg:px-10">
        <div className="mx-auto max-w-6xl rounded-2xl bg-[#102A56] p-7 text-white sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-[#65DED0]">
                <MessageCircle className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Need help?
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-semibold">
                Talk to the Tutova team.
              </h2>
              <p className="mt-2 text-sm leading-7 text-blue-100">
                For account, tutor verification, booking, payment or general
                concerns, contact us by phone or WhatsApp.
              </p>
              <p className="mt-4 text-sm font-semibold">+234 701 016 3875</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="tel:+2347010163875"
                className="inline-flex min-h-11 items-center rounded-lg bg-[#00AFA0] px-4 text-sm font-semibold text-white hover:bg-[#00998D]"
              >
                Call us
              </a>
              <a
                href="https://wa.me/2347010163875?text=Hello%20Tutova%2C%20I%20need%20assistance."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-lg border border-white/30 px-4 text-sm font-semibold text-white hover:bg-white/10"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
