"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  GraduationCap,
  Handshake,
  Laptop,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
  Wallet,
  UserCheck,
  FileCheck,
  BadgeCheck,
  HeartHandshake,
  TrendingUp,
  Star,
  CalendarCheck,
} from "lucide-react";

const benefits = [
  {
    icon: Users,
    title: "Reach potential learners",
    description:
      "Create a profile that allows parents and learners to discover your subjects, qualifications, experience, and teaching approach.",
  },
  {
    icon: Laptop,
    title: "Choose how you teach",
    description:
      "Offer online lessons, in-person tutoring, or both, depending on your location, skills, and availability.",
  },
  {
    icon: Clock3,
    title: "Work around your schedule",
    description:
      "Indicate when you are available and agree on lesson schedules with learners based on mutual availability.",
  },
  {
    icon: Wallet,
    title: "Earn as you teach",
    description:
      "Receive a share of completed lesson fees, with opportunities to increase your earnings percentage as you gain experience on Tutova.",
  },
];

const steps = [
  {
    number: "01",
    icon: UserCheck,
    title: "Create your tutor account",
    description:
      "Register as a tutor and provide the basic information needed to get started.",
  },
  {
    number: "02",
    icon: FileCheck,
    title: "Complete your profile",
    description:
      "Add your educational background, subjects, teaching experience, preferred teaching mode, and availability.",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "Complete verification",
    description:
      "Submit the required identification, upload your one-minute introduction video, and sign the tutor NDA.",
  },
  {
    number: "04",
    icon: BadgeCheck,
    title: "Get reviewed and approved",
    description:
      "The Tutova team reviews your application. Approved profiles can become visible to prospective learners.",
  },
];

const earningLevels = [
  {
    name: "Beginner",
    percentage: "75%",
    hours: "0–19 hours",
    description:
      "For newly approved tutors building their teaching history on Tutova.",
    color: "bg-[#F0F7FF]",
    textColor: "text-[#0077E6]",
    borderColor: "border-[#DCEBFA]",
  },
  {
    name: "Developing",
    percentage: "80%",
    hours: "20–50 hours",
    description:
      "For tutors who have completed more lessons and demonstrated consistent service.",
    color: "bg-[#E5F8F5]",
    textColor: "text-[#008F83]",
    borderColor: "border-[#C9EEE8]",
  },
  {
    name: "Experienced",
    percentage: "85%",
    hours: "More than 50 hours",
    description:
      "For established tutors with a strong record of completed lessons and professional conduct.",
    color: "bg-[#102A56]",
    textColor: "text-white",
    borderColor: "border-[#102A56]",
  },
];

const earningCriteria = [
  {
    icon: CalendarCheck,
    title: "Completed teaching hours",
    description:
      "Only lessons completed and confirmed through Tutova count towards your teaching-hour milestone.",
  },
  {
    icon: Star,
    title: "Consistent teaching quality",
    description:
      "Maintain a positive learning experience through clear communication, preparation, and constructive parent or learner feedback.",
  },
  {
    icon: Clock3,
    title: "Reliability and attendance",
    description:
      "Attend agreed lessons, communicate schedule changes early, and avoid repeated unexplained cancellations.",
  },
  {
    icon: ShieldCheck,
    title: "Professional conduct",
    description:
      "Follow Tutova's safeguarding, privacy, confidentiality, and professional conduct requirements.",
  },
];

const faqs = [
  {
    question: "Who can become a tutor on Tutova?",
    answer:
      "Tutova welcomes applicants with relevant subject knowledge, suitable educational backgrounds, or teaching experience who can provide quality learning support. All applicants must complete the verification and approval process.",
  },
  {
    question: "Can I teach online and in person?",
    answer:
      "Yes. You can indicate whether you offer online tutoring, in-person tutoring, or both. In-person opportunities depend on learner location and the areas you are willing to serve.",
  },
  {
    question: "Do I need teaching experience?",
    answer:
      "Teaching experience can strengthen your application, but it is not the only consideration. Your subject knowledge, educational background, communication skills, and ability to support learners are also important. All applications are reviewed by the Tutova team.",
  },
  {
    question: "How much of the lesson fee do tutors receive?",
    answer:
      "Tutova uses a tiered earnings structure. Beginner tutors receive 75% of the applicable lesson fee, developing tutors receive 80%, and experienced tutors can qualify for 85%. Progression depends on completed teaching hours and meeting the applicable performance and conduct requirements.",
  },
  {
    question: "How do I qualify for the 85% earnings tier?",
    answer:
      "Tutors must complete more than 50 verified teaching hours and maintain the required standards for teaching quality, reliability, and professional conduct. Reaching the hour milestone alone does not automatically guarantee progression.",
  },
  {
    question: "Are completed teaching hours counted automatically?",
    answer:
      "Only lessons recorded as completed and confirmed through Tutova count towards your teaching-hour total. Cancelled, missed, or unconfirmed lessons do not count as completed teaching hours.",
  },
  {
    question: "When do I receive my earnings?",
    answer:
      "Tutova manages tutor payouts through its payment process. Earnings are subject to lesson completion, payment confirmation, and applicable payout procedures.",
  },
  {
    question: "Does registering guarantee tutoring requests?",
    answer:
      "No. Registration and approval allow your profile to be considered for listing. Actual requests depend on learner demand, subject requirements, location, availability, and other matching factors.",
  },
];

function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#00AFA0]">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#102A56] sm:text-3xl">
        {title}
      </h2>
      <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
        {description}
      </p>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[#E8EDF3] last:border-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-5 py-5 text-left"
      >
        <span className="text-sm font-semibold leading-6 text-[#243B5A] sm:text-base">
          {question}
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-[#0077E6] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <p className="max-w-3xl pb-5 pr-8 text-sm leading-7 text-slate-500">
          {answer}
        </p>
      )}
    </div>
  );
}

export default function BecomeATutorPage() {
  return (
    <main className="min-h-screen bg-[#F4F8FB]">
      <div className="" aria-hidden="true" />

      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#EAF4FF] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[#E5F8F5] blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#DCEBFA] bg-[#F0F7FF] px-3.5 py-2 text-xs font-semibold text-[#0077E6]">
              <Sparkles size={14} />
              Teach. Grow. Earn.
            </div>

            <h1 className="mt-7 max-w-2xl text-4xl font-bold leading-[1.13] tracking-tight text-[#102A56] sm:text-5xl lg:text-[58px]">
              Turn your knowledge into{" "}
              <span className="text-[#0077E6]">meaningful impact.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-500 sm:text-lg">
              Join Tutova as a tutor, connect with learners who need your
              expertise, and build a teaching profile around your skills,
              experience, and availability.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register/tutor"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0077E6] px-7 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0066C7] hover:shadow-md"
              >
                Start your application
                <ArrowRight size={16} />
              </Link>

              <Link
                href="#how-it-works"
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#DCE4ED] bg-white px-7 text-sm font-semibold text-[#102A56] transition-colors hover:border-[#0077E6] hover:text-[#0077E6]"
              >
                How it works
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#00AFA0]" />
                Online and in-person
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#00AFA0]" />
                Tutor verification
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#00AFA0]" />
                Transparent earnings
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -right-3 -top-3 h-full w-full rounded-[2rem] bg-[#E7F2FF]" />

            <div className="relative overflow-hidden rounded-[2rem] border border-[#E8EDF3] bg-white p-2 shadow-[0_25px_70px_rgba(16,42,86,0.12)]">
              <div className="relative aspect-[4/4.1] overflow-hidden rounded-[1.5rem]">
                <img
                  src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=85"
                  alt="Teacher supporting students during a classroom lesson"
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#102A56]/65 via-transparent to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/70 bg-white/95 p-4 shadow-lg backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF4FF] text-[#0077E6]">
                      <BookOpen size={21} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-[#102A56]">
                        Teach with purpose
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Share your knowledge. Help learners grow.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-4 hidden items-center gap-3 rounded-2xl border border-[#E8EDF3] bg-white p-4 shadow-lg sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E5F8F5] text-[#00AFA0]">
                <HeartHandshake size={20} />
              </div>

              <div>
                <p className="text-xs font-bold text-[#102A56]">
                  Your expertise matters
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Help learners make progress.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-[#F4F8FB] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="Why Tutova"
            title="A practical way to grow your teaching"
            description="Tutova helps tutors present their skills, connect with suitable learners, and manage tutoring opportunities through one platform."
            centered
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-[#E8EDF3] bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(16,42,86,0.07)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0F7FF] text-[#0077E6]">
                    <Icon size={22} strokeWidth={1.8} />
                  </div>
                  <h3 className="mt-5 text-base font-bold text-[#102A56]">
                    {benefit.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Teaching modes */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading
                eyebrow="Teaching opportunities"
                title="Choose how you want to teach"
                description="Different learners have different needs. Indicate the teaching arrangements you can offer and the locations you are comfortable serving."
              />

              <div className="mt-8 space-y-5">
                <div className="flex gap-4 rounded-2xl border border-[#E8EDF3] p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F0F7FF] text-[#0077E6]">
                    <Video size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#102A56]">
                      Online tutoring
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-500">
                      Deliver lessons remotely and work with learners who are
                      comfortable learning online.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 rounded-2xl border border-[#E8EDF3] p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E5F8F5] text-[#00AFA0]">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#102A56]">
                      In-person tutoring
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-500">
                      Provide face-to-face learning support in locations you can
                      realistically travel to and serve.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-[#102A56] p-8 text-white sm:p-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <GraduationCap size={28} />
              </div>
              <h3 className="mt-7 text-2xl font-bold leading-snug sm:text-3xl">
                Good tutoring starts with understanding the learner.
              </h3>
              <p className="mt-5 text-sm leading-7 text-blue-100">
                Subject knowledge is important, but effective tutoring also
                requires patience, preparation, clear explanations, and the
                ability to adapt to different learning needs.
              </p>
              <div className="mt-8 space-y-4 border-t border-white/15 pt-7">
                {[
                  "Explain concepts clearly",
                  "Prepare for lessons",
                  "Respect learners and families",
                  "Be reliable and professional",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2
                      size={17}
                      className="shrink-0 text-[#00C7B5]"
                    />
                    <span className="text-sm text-blue-50">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Onboarding */}
      <section
        id="how-it-works"
        className="scroll-mt-24 bg-[#F4F8FB] py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="Getting started"
            title="How to join Tutova"
            description="The onboarding process helps us review your background, verify your identity, and prepare your profile for potential learners."
            centered
          />

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="rounded-2xl border border-[#E8EDF3] bg-white p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-[#DCEBFA]">
                      {step.number}
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0F7FF] text-[#0077E6]">
                      <Icon size={21} />
                    </div>
                  </div>
                  <h3 className="mt-6 text-base font-bold text-[#102A56]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/register/tutor"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0077E6] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#0066C7]"
            >
              Begin tutor registration
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Verification */}
      <section
        id="verification"
        className="scroll-mt-24 bg-white py-20 sm:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Trust and safeguarding"
              title="A responsible approach to tutor verification"
              description="Parents need confidence in the people supporting their children's education. Tutova reviews tutor identities and profile information before approving tutors for listing."
            />
            <Link
              href="/safeguarding"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#0077E6] hover:text-[#0066C7]"
            >
              Learn about safeguarding
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="rounded-3xl border border-[#E8EDF3] bg-[#F7FAFD] p-6 sm:p-8">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E5F8F5] text-[#00AFA0]">
                  <ShieldCheck size={21} />
                </div>
                <div>
                  <h3 className="font-bold text-[#102A56]">
                    Identity and information review
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    Applicants provide identification and relevant information
                    for administrative verification.
                  </p>
                </div>
              </div>

              <div className="h-px bg-[#E5EAF0]" />

              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0F7FF] text-[#0077E6]">
                  <Video size={21} />
                </div>
                <div>
                  <h3 className="font-bold text-[#102A56]">
                    One-minute introduction video
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    Submit a short introduction that allows the Tutova team and
                    prospective learners to get a better sense of you and your
                    teaching approach.
                  </p>
                </div>
              </div>

              <div className="h-px bg-[#E5EAF0]" />

              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF6E8] text-[#C58A28]">
                  <Handshake size={21} />
                </div>
                <div>
                  <h3 className="font-bold text-[#102A56]">
                    NDA and professional conduct
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    Tutors must sign the required non-disclosure agreement and
                    follow Tutova's expectations for privacy, confidentiality,
                    and responsible conduct.
                  </p>
                </div>
              </div>

              <div className="h-px bg-[#E5EAF0]" />

              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0F7FF] text-[#0077E6]">
                  <BadgeCheck size={21} />
                </div>
                <div>
                  <h3 className="font-bold text-[#102A56]">
                    Administrative approval
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    Applications are reviewed by the Tutova team. Completing
                    registration does not automatically mean approval.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Listing guidelines */}
      <section
        id="listing-guidelines"
        className="scroll-mt-24 bg-[#F4F8FB] py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="Tutor profile"
            title="Build a profile that represents you accurately"
            description="A useful tutor profile helps parents and learners understand your expertise, experience, and the learning support you can provide."
            centered
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: GraduationCap,
                title: "Educational background",
                description:
                  "Provide accurate details about your qualifications and academic background.",
              },
              {
                icon: BookOpen,
                title: "Subjects and expertise",
                description:
                  "List the subjects and topics you are qualified and comfortable teaching.",
              },
              {
                icon: Users,
                title: "Teaching experience",
                description:
                  "Describe relevant teaching, mentoring, tutoring, or subject-related experience.",
              },
              {
                icon: MapPin,
                title: "Location and coverage",
                description:
                  "For in-person tutoring, specify your location and realistic service areas.",
              },
              {
                icon: Video,
                title: "Introduction video",
                description:
                  "Introduce yourself clearly and explain how you approach teaching.",
              },
              {
                icon: Clock3,
                title: "Availability",
                description:
                  "Provide realistic availability and your preferred lesson arrangements.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[#E8EDF3] bg-white p-6"
                >
                  <Icon size={22} className="text-[#0077E6]" />
                  <h3 className="mt-4 font-bold text-[#102A56]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-24 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="Tutor earnings"
            title="Your earnings can grow with your experience"
            description="Tutova uses a tiered earnings structure. As you complete more lessons and maintain good teaching standards, you can qualify for a higher share of the applicable lesson fees."
            centered
          />

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {earningLevels.map((level) => (
              <div
                key={level.name}
                className={`rounded-2xl border p-6 sm:p-7 ${level.borderColor} ${
                  level.name === "Experienced" ? "bg-[#102A56]" : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3
                    className={`text-base font-bold ${
                      level.name === "Experienced"
                        ? "text-white"
                        : "text-[#102A56]"
                    }`}
                  >
                    {level.name}
                  </h3>
                  {level.name === "Experienced" && (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold text-[#9CE9DF]">
                      Highest tier
                    </span>
                  )}
                </div>

                <p
                  className={`mt-6 text-5xl font-bold tracking-tight ${
                    level.textColor
                  }`}
                >
                  {level.percentage}
                </p>
                <p
                  className={`mt-2 text-sm font-semibold ${
                    level.name === "Experienced"
                      ? "text-blue-100"
                      : "text-[#0077E6]"
                  }`}
                >
                  of the applicable lesson fee
                </p>

                <div
                  className={`mt-6 rounded-xl px-4 py-3 ${
                    level.name === "Experienced" ? "bg-white/10" : level.color
                  }`}
                >
                  <p
                    className={`text-xs font-semibold ${
                      level.name === "Experienced"
                        ? "text-white"
                        : "text-[#243B5A]"
                    }`}
                  >
                    Teaching hours
                  </p>
                  <p
                    className={`mt-1 text-sm font-bold ${
                      level.name === "Experienced"
                        ? "text-[#9CE9DF]"
                        : "text-[#102A56]"
                    }`}
                  >
                    {level.hours}
                  </p>
                </div>

                <p
                  className={`mt-5 text-sm leading-7 ${
                    level.name === "Experienced"
                      ? "text-blue-100"
                      : "text-slate-500"
                  }`}
                >
                  {level.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h3 className="text-xl font-bold text-[#102A56]">
                How do you qualify for a higher tier?
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-500">
                Teaching hours are important, but consistency and
                professionalism matter too. Progression is based on verified
                completed lessons and a satisfactory record on the platform.
              </p>

              <div className="mt-6 rounded-2xl border border-[#DCEBFA] bg-[#F7FAFD] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF4FF] text-[#0077E6]">
                    <TrendingUp size={20} />
                  </div>
                  <p className="text-sm font-bold text-[#102A56]">
                    Your teaching history matters
                  </p>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  Only completed and confirmed lessons count towards your
                  teaching-hour milestones. Cancelled or unconfirmed lessons are
                  excluded.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {earningCriteria.map((criterion) => {
                const Icon = criterion.icon;

                return (
                  <div
                    key={criterion.title}
                    className="rounded-2xl border border-[#E8EDF3] bg-white p-5"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0F7FF] text-[#0077E6]">
                      <Icon size={20} />
                    </div>
                    <h4 className="mt-4 text-sm font-bold text-[#102A56]">
                      {criterion.title}
                    </h4>
                    <p className="mt-2 text-sm leading-7 text-slate-500">
                      {criterion.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Earnings example */}
          <div className="mt-14 rounded-3xl border border-[#DCEBFA] bg-[#F7FAFD] p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF4FF] text-[#0077E6]">
                <Wallet size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Example calculation
                </p>
                <h3 className="font-bold text-[#102A56]">
                  What you could earn from a ₦5,000 lesson
                </h3>
              </div>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              {[
                {
                  tier: "Beginner",
                  share: "75%",
                  tutor: "₦3,750",
                  platform: "₦1,250",
                },
                {
                  tier: "Developing",
                  share: "80%",
                  tutor: "₦4,000",
                  platform: "₦1,000",
                },
                {
                  tier: "Experienced",
                  share: "85%",
                  tutor: "₦4,250",
                  platform: "₦750",
                },
              ].map((item) => (
                <div
                  key={item.tier}
                  className="rounded-2xl border border-[#E8EDF3] bg-white p-5"
                >
                  <p className="text-sm font-semibold text-slate-500">
                    {item.tier} · {item.share}
                  </p>
                  <p className="mt-3 text-2xl font-bold text-[#102A56]">
                    {item.tutor}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Tutor receives</p>
                  <div className="mt-4 border-t border-[#E8EDF3] pt-3">
                    <p className="text-xs text-slate-500">
                      Tutova retains:{" "}
                      <span className="font-semibold text-[#0077E6]">
                        {item.platform}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-5 text-xs leading-6 text-slate-400">
              This is an illustrative calculation based on a ₦5,000 lesson fee.
              Actual lesson prices, applicable fees, and payout arrangements are
              subject to the terms agreed with Tutova.
            </p>
          </div>

          <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-6 text-slate-400">
            Tier qualification is subject to verification of completed teaching
            hours and review of the applicable quality and conduct requirements.
            Registration or reaching an hour milestone alone does not guarantee
            a tier upgrade.
          </p>
        </div>
      </section>

      {/* Tutor guidelines */}
      <section
        id="guidelines"
        className="scroll-mt-24 bg-[#F4F8FB] py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl rounded-3xl border border-[#E8EDF3] bg-white p-7 sm:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E5F8F5] text-[#00AFA0]">
              <HeartHandshake size={23} />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-[#102A56]">
              What we expect from our tutors
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Tutors are expected to take responsibility for the learning
              experience and treat every learner and family with respect.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {[
                "Provide accurate profile information.",
                "Communicate respectfully with parents and learners.",
                "Be punctual and honour agreed sessions.",
                "Respect learner privacy and confidentiality.",
                "Maintain appropriate professional boundaries.",
                "Prepare for lessons and support learner progress.",
                "Follow Tutova's safeguarding requirements.",
                "Communicate changes to agreed arrangements.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0 text-[#00AFA0]"
                  />
                  <span className="text-sm leading-6 text-slate-600">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faqs" className="scroll-mt-24 bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F0F7FF] text-[#0077E6]">
              <CircleHelp size={23} />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-[#102A56] sm:text-3xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-500">
              Find answers to common questions about tutor registration,
              verification, teaching, and earnings.
            </p>
            <p className="mt-6 text-sm text-slate-500">
              Still need help?{" "}
              <Link
                href="/contact"
                className="font-semibold text-[#0077E6] hover:text-[#0066C7]"
              >
                Contact our team
              </Link>
              .
            </p>
          </div>

          <div className="rounded-2xl border border-[#E8EDF3] bg-white px-5 sm:px-7">
            {faqs.map((faq) => (
              <FAQItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#102A56] py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-[#00C7B5]">
            <GraduationCap size={29} />
          </div>

          <h2 className="mt-7 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to start teaching?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
            Create your tutor account, tell us about your skills and experience,
            and complete the verification process. Your next teaching
            opportunity could start here.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register/tutor"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-bold text-[#102A56] transition-all hover:-translate-y-0.5 hover:bg-[#F0F7FF]"
            >
              Become a tutor
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 px-8 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Already registered? Log in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
