import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  GraduationCap,
  ShieldCheck,
  Wallet,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Learning resources",
  description:
    "Practical guidance for parents, learners and tutors using Tutova.",
};

const guides = [
  {
    icon: Users,
    category: "For parents and learners",
    title: "Choosing a tutor who fits your learning needs",
    description:
      "Start with the subject or skill you want to work on. Consider the tutor's listed qualifications, experience, teaching approach, preferred lesson mode and location.",
    points: [
      "Write down the topics or skills you want help with.",
      "Review tutor profiles and the information provided.",
      "Discuss expectations, lesson format and availability before confirming an arrangement.",
    ],
  },
  {
    icon: CalendarCheck,
    category: "Booking lessons",
    title: "Understand requests, agreements and bookings",
    description:
      "A tutoring request begins the conversation. Review the proposed lesson details and follow the agreement and booking steps shown in your account.",
    points: [
      "Check the date, time, duration and lesson mode.",
      "Read the proposed terms before accepting.",
      "Use the booking record to keep track of the confirmed arrangement.",
    ],
  },
  {
    icon: GraduationCap,
    category: "For tutors",
    title: "Build a clear and trustworthy tutor profile",
    description:
      "A useful profile helps parents and learners understand what you teach and the kind of learning support you offer.",
    points: [
      "Describe your subjects and teaching approach clearly.",
      "Provide accurate education and experience details.",
      "Complete the verification requirements and respond to requests professionally.",
    ],
  },
  {
    icon: ShieldCheck,
    category: "Trust and safety",
    title: "Use Tutova responsibly",
    description:
      "Good learning relationships depend on clear communication, respect for privacy and responsible use of platform workflows.",
    points: [
      "Protect your password and account information.",
      "Keep lesson arrangements and communications respectful.",
      "Contact Tutova if you have a safety, account or booking concern.",
    ],
  },
  {
    icon: Wallet,
    category: "Payments",
    title: "Understand lesson payments and completion",
    description:
      "Review the payment summary and follow the payment status shown in Tutova. Lesson completion and tutor earnings follow the platform's acknowledgement and review process.",
    points: [
      "Check the amount and payment details before paying.",
      "Wait for the platform to confirm payment status.",
      "Acknowledge a completed lesson only when the lesson has taken place as recorded.",
    ],
  },
];

export default function ResourcesPage() {
  return (
    <main className="bg-white text-[#102A56]">
      <section className="bg-[#102A56]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55D8CC]">
            Tutova guides
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-5xl">
            Helpful guidance for every step of learning.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-blue-100">
            Explore practical tips for finding a tutor, arranging lessons,
            building a tutor profile and using Tutova with confidence.
          </p>
        </div>
      </section>
      <section className="px-5 py-14 sm:px-8 sm:py-16 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-5 md:grid-cols-2">
            {guides.map(
              ({ icon: Icon, category, title, description, points }, index) => (
                <article
                  key={title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0F7FF] text-[#0077E6]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-bold tracking-widest text-[#00AFA0]">
                      GUIDE 0{index + 1}
                    </span>
                  </div>
                  <p className="mt-5 text-xs font-bold uppercase tracking-wider text-[#0077E6]">
                    {category}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold leading-snug">
                    {title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {description}
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {points.map((point) => (
                      <li
                        key={point}
                        className="flex gap-2 text-sm leading-6 text-slate-600"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00AFA0]" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              ),
            )}
          </div>
        </div>
      </section>
      <section className="bg-[#F4F8FB] px-5 py-14 sm:px-8 sm:py-16 lg:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 rounded-2xl bg-white p-7 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-9">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-[#0077E6]">
              Ready to get started?
            </p>
            <h2 className="mt-3 text-2xl font-semibold">
              Find the right learning support.
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Explore tutor profiles or learn more about how Tutova works.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/discover"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#0077E6] px-5 text-sm font-semibold text-white hover:bg-[#0066C8]"
            >
              Find a tutor <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/safety"
              className="inline-flex min-h-11 items-center rounded-lg border border-slate-200 px-5 text-sm font-semibold text-[#102A56] hover:bg-slate-50"
            >
              Safety and trust
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
