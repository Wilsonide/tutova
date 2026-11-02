"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Laptop,
  MapPin,
  Monitor,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  UserRound,
  Video,
  Wallet,
  Clock3,
  BookMarked,
} from "lucide-react";

import { SiteHeader } from "@/components/site-header";

const featuredTutors = [
  {
    name: "Amara Okafor",
    subject: "Mathematics",
    qualification: "Mathematics educator",
    location: "Lagos, Nigeria",
    experience: "6 years experience",
    rate: "₦5,000",
    image:
      "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=900&auto=format&fit=crop&q=85",
    initials: "AO",
    mode: "Online & in-person",
  },
  {
    name: "David Adeyemi",
    subject: "Physics",
    qualification: "Science tutor",
    location: "Abuja, Nigeria",
    experience: "5 years experience",
    rate: "₦6,000",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&auto=format&fit=crop&q=85",
    initials: "DA",
    mode: "Online & in-person",
  },
  {
    name: "Chinonso Eze",
    subject: "English Language",
    qualification: "English language tutor",
    location: "Owerri, Nigeria",
    experience: "4 years experience",
    rate: "₦4,500",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&auto=format&fit=crop&q=85",
    initials: "CE",
    mode: "Online",
  },
];

const subjects = [
  {
    name: "Mathematics",
    description: "Build confidence with numbers and problem-solving.",
    icon: BookOpen,
    color: "bg-blue-50 text-blue-700",
  },
  {
    name: "English Language",
    description: "Improve reading, writing and communication.",
    icon: BookMarked,
    color: "bg-teal-50 text-teal-700",
  },
  {
    name: "Physics",
    description: "Understand scientific principles and applications.",
    icon: Sparkles,
    color: "bg-violet-50 text-violet-700",
  },
  {
    name: "Chemistry",
    description: "Make complex concepts easier to understand.",
    icon: GraduationCap,
    color: "bg-amber-50 text-amber-700",
  },
  {
    name: "Biology",
    description: "Explore living systems and the natural world.",
    icon: Users,
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    name: "Computer Science",
    description: "Develop digital and computational skills.",
    icon: Laptop,
    color: "bg-indigo-50 text-indigo-700",
  },
];

const steps = [
  {
    number: "01",
    title: "Tell us what you want to learn",
    description:
      "Choose a subject, learning level and the kind of support you need.",
    icon: BookOpen,
  },
  {
    number: "02",
    title: "Find a suitable tutor",
    description:
      "Explore tutor profiles and compare their experience, teaching approach and availability.",
    icon: UserRound,
  },
  {
    number: "03",
    title: "Arrange your lessons",
    description:
      "Send a request and work out the lesson arrangements with your selected tutor.",
    icon: Video,
  },
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Tutor verification",
    description:
      "We use a review process to help establish tutor identity and profile credibility.",
  },
  {
    icon: Users,
    title: "Learning that fits",
    description:
      "Find tutors based on your subject, learning needs and preferred arrangement.",
  },
  {
    icon: Monitor,
    title: "Flexible lesson options",
    description:
      "Explore online and in-person tutoring options, depending on tutor availability.",
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
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.19em] text-[#0077E6]">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#102A56] sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
        {description}
      </p>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#102A56]">
      <SiteHeader />

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-[#F4F8FB]">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#DCEEFF] opacity-70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-48 -left-40 h-[420px] w-[420px] rounded-full bg-[#DDF7F2] opacity-70 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:px-10 lg:py-24">
          <div className="max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#D8E8F7] bg-white/80 px-4 py-2 text-sm font-medium text-[#24527E] shadow-sm">
              <Sparkles className="h-4 w-4 text-[#00AFA0]" />
              Learning support that moves you forward
            </div>

            <h1 className="text-[2.65rem] font-bold leading-[1.12] tracking-[-0.045em] text-[#102A56] sm:text-5xl lg:text-[3.65rem]">
              The right tutor can make a{" "}
              <span className="relative inline-block text-[#0077E6]">
                real difference.
                <span className="absolute -bottom-1 left-0 -z-10 h-3 w-full rounded-full bg-[#BDE9E4]" />
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Find tutors who understand your learning needs. Explore
              personalised tutoring support for school subjects, academic
              improvement and new skills.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/discover"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-[#0077E6] px-7 py-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(0,119,230,0.20)] transition hover:-translate-y-0.5 hover:bg-[#0068CB]"
              >
                Find a tutor
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/register/tutor"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl border border-[#D6E1EC] bg-white px-7 py-4 text-sm font-semibold text-[#102A56] transition hover:border-[#0077E6] hover:bg-blue-50"
              >
                Become a tutor
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#00AFA0]" />
                Personalised learning
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#00AFA0]" />
                Online and in-person
              </span>
            </div>
          </div>

          {/* HERO IMAGE COMPOSITION */}
          <div className="relative mx-auto w-full max-w-[570px]">
            <div className="absolute -left-4 top-14 h-32 w-32 rounded-full border border-[#BBDCF5] sm:-left-8" />
            <div className="absolute -bottom-5 right-8 h-28 w-28 rounded-full bg-[#CFF2EB]" />

            <div className="relative grid grid-cols-[1fr_0.78fr] items-center gap-3 sm:gap-5">
              <div className="relative overflow-hidden rounded-[28px] rounded-br-[90px] bg-[#DCEBFA] shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=1000&auto=format&fit=crop&q=90"
                  alt="Tutor working with learning materials"
                  className="h-[340px] w-full object-cover object-center sm:h-[440px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#102A56]/35 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <p className="text-xs font-medium text-white/80">
                    Learning starts with
                  </p>
                  <p className="mt-1 text-xl font-bold">the right guidance.</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="overflow-hidden rounded-[26px] rounded-bl-[70px] bg-[#E1F4F0] shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=85"
                    alt="Tutor portrait"
                    className="h-[190px] w-full object-cover object-center sm:h-[245px]"
                  />
                </div>

                <div className="overflow-hidden rounded-[26px] rounded-tr-[65px] bg-[#E8E9F9] shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=85"
                    alt="Tutor portrait"
                    className="h-[145px] w-full object-cover object-center sm:h-[180px]"
                  />
                </div>
              </div>
            </div>

            <div className="absolute -bottom-7 left-2 flex items-center gap-3 rounded-2xl border border-white/80 bg-white p-4 shadow-[0_12px_35px_rgba(16,42,86,0.13)] sm:-left-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E2F7F2] text-[#009688]">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#102A56]">
                  Your learning journey
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Starts with one good connection
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE STRIP */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-5 py-8 sm:grid-cols-3 sm:px-8 lg:px-10">
          {[
            {
              icon: ShieldCheck,
              title: "Reviewed tutor profiles",
              text: "Make more informed choices.",
            },
            {
              icon: Laptop,
              title: "Flexible learning options",
              text: "Online and in-person arrangements.",
            },
            {
              icon: UserRound,
              title: "A tutor for your needs",
              text: "Explore different subjects and skills.",
            },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F0F7FD] text-[#0077E6]">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#102A56]">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* EXPLORE SUBJECTS */}
      <section id="subjects" className="scroll-mt-24 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              eyebrow="Explore subjects"
              title="What would you like to learn?"
              description="Start with a subject or skill. Find learning support that matches what you want to achieve."
            />
            <Link
              href="/discover"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#0077E6] transition hover:gap-3"
            >
              Explore tutors
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <Link
                key={subject.name}
                href={`/discover?q=${encodeURIComponent(subject.name)}`}
                className="group rounded-2xl border border-[#E8EEF4] bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-[#B9D9F4] hover:shadow-[0_14px_35px_rgba(16,42,86,0.07)]"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${subject.color}`}
                >
                  <subject.icon className="h-5 w-5" />
                </div>
                <div className="mt-6 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-[#102A56]">
                    {subject.name}
                  </h3>
                  <ArrowUpRight className="h-5 w-5 text-slate-300 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#0077E6]" />
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {subject.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED TUTORS */}
      <section
        id="explore-tutors"
        className="scroll-mt-24 bg-[#F4F8FB] py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              eyebrow="Meet the tutors"
              title="Find someone who makes learning clearer."
              description="Explore tutor profiles and discover people who can support your learning goals."
            />
            <Link
              href="/discover"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#0077E6] transition hover:gap-3"
            >
              View all tutors
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredTutors.map((tutor) => (
              <article
                key={tutor.name}
                className="group overflow-hidden rounded-[24px] border border-[#E6EDF4] bg-white shadow-[0_5px_20px_rgba(16,42,86,0.035)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(16,42,86,0.10)]"
              >
                {/* Portrait area: fixed aspect ratio keeps every card aligned */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#E7EEF5]">
                  <img
                    src={tutor.image}
                    alt={`Portrait of ${tutor.name}`}
                    className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#102A56]/45 to-transparent" />
                  <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#102A56] shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-[#00AFA0]" />
                    {tutor.mode}
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-[#102A56]">
                        {tutor.name}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-[#0077E6]">
                        {tutor.subject}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 rounded-lg bg-[#FFF8E8] px-2.5 py-1.5 text-xs font-semibold text-[#9A6B13]">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      Profile
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-slate-500">
                    {tutor.qualification}
                  </p>

                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                    <p className="flex items-center gap-2 text-sm text-slate-500">
                      <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                      {tutor.location}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock3 className="h-4 w-4 shrink-0 text-slate-400" />
                      {tutor.experience}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-400">
                        Illustrative rate
                      </p>
                      <p className="mt-0.5 text-lg font-bold text-[#102A56]">
                        {tutor.rate}
                        <span className="text-xs font-normal text-slate-400">
                          {" "}
                          / session
                        </span>
                      </p>
                    </div>
                    <Link
                      href="/discover"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#EEF6FD] px-4 py-3 text-sm font-semibold text-[#0077E6] transition hover:bg-[#0077E6] hover:text-white"
                    >
                      View tutors
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Sample tutor profiles shown for layout illustration. Actual tutor
            information and rates should come from your tutor discovery data.
          </p>
        </div>
      </section>

      {/* PARENTS */}
      <section id="parents" className="scroll-mt-24 bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-10">
          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="absolute -left-5 -top-5 h-28 w-28 rounded-full bg-[#E1F5F1]" />
            <div className="relative overflow-hidden rounded-[30px] rounded-br-[100px] bg-[#E6EEF7]">
              <img
                src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1100&auto=format&fit=crop&q=85"
                alt="Teacher supporting students in a learning environment"
                className="h-[340px] w-full object-cover sm:h-[440px]"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-5 right-4 max-w-[245px] rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:right-0">
              <div className="flex items-center gap-2 text-sm font-bold text-[#102A56]">
                <ShieldCheck className="h-5 w-5 text-[#00AFA0]" />
                Make an informed choice
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Review tutor profiles and discuss your child's learning needs.
              </p>
            </div>
          </div>

          <div id="individual-learners" className="scroll-mt-24">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.19em] text-[#0077E6]">
              For parents and learners
            </p>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#102A56] sm:text-4xl">
              Learning support should fit the learner, not the other way around.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600">
              Every learner has different strengths, challenges and goals.
              Tutova helps parents and individual learners explore tutors who
              can provide support suited to those needs.
            </p>

            <div className="mt-8 space-y-5">
              {[
                "Explore tutors by subject and learning needs.",
                "Compare tutor profiles before sending a request.",
                "Discuss lesson arrangements and learning expectations.",
                "Consider online or in-person tutoring options.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#00AFA0]" />
                  <p className="text-sm leading-6 text-slate-600">{item}</p>
                </div>
              ))}
            </div>

            <Link
              href="/discover"
              className="mt-9 inline-flex items-center gap-3 rounded-xl bg-[#102A56] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#183D75]"
            >
              Explore tutors
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="scroll-mt-24 bg-[#F4F8FB] py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <SectionHeading
            eyebrow="How Tutova works"
            title="A clearer way to find learning support."
            description="From identifying a learning need to connecting with a tutor, the process is designed to be straightforward."
            centered
          />

          <div className="relative mt-14 grid gap-6 md:grid-cols-3">
            <div className="absolute left-[16%] right-[16%] top-9 hidden border-t border-dashed border-[#BBD4E9] md:block" />

            {steps.map((step) => (
              <div
                key={step.number}
                className="relative rounded-2xl border border-[#E4ECF3] bg-white p-7 shadow-[0_6px_22px_rgba(16,42,86,0.035)]"
              >
                <div className="relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-2xl border-[6px] border-[#F4F8FB] bg-[#EAF4FD] text-[#0077E6]">
                  <step.icon className="h-7 w-7" />
                </div>
                <p className="mt-7 text-xs font-bold tracking-[0.16em] text-[#00AFA0]">
                  STEP {step.number}
                </p>
                <h3 className="mt-3 text-xl font-bold leading-snug text-[#102A56]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0077E6] hover:underline"
            >
              Start exploring tutors
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST AND FLEXIBILITY */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <SectionHeading
            eyebrow="A thoughtful learning experience"
            title="More than finding a name on a list."
            description="Choosing a tutor is an important decision. Tutova is designed to make tutor discovery and the next steps clearer."
            centered
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl border border-[#E8EEF4] bg-white p-7 transition hover:border-[#C8DFF2] hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF4FD] text-[#0077E6]">
                  <benefit.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-bold text-[#102A56]">
                  {benefit.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TUTOR CTA */}
      <section className="bg-white px-5 pb-20 sm:px-8 sm:pb-24 lg:px-10">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[30px] bg-[#102A56] px-7 py-12 sm:px-12 sm:py-16 lg:px-16">
          <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border-[45px] border-white/5" />
          <div className="absolute -bottom-36 right-48 h-72 w-72 rounded-full bg-[#0077E6]/20 blur-2xl" />

          <div className="relative flex flex-col justify-between gap-9 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6CE0D2]">
                For tutors
              </p>
              <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
                Ready to share what you know?
              </h2>
              <p className="mt-4 max-w-xl text-base leading-8 text-blue-100/80">
                Join a learning community where your knowledge and teaching
                experience can help learners make progress.
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link
                href="/register/tutor"
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-white px-6 py-4 text-sm font-bold text-[#102A56] transition hover:bg-[#EAF4FD]"
              >
                Register as a tutor
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/become-a-tutor"
                className="inline-flex items-center justify-center rounded-xl border border-white/30 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* LEARNING RESOURCES */}
      <section
        id="resources"
        className="scroll-mt-24 border-t border-slate-100 bg-[#F8FAFC] py-16"
      >
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-5 sm:px-8 md:flex-row md:items-center lg:px-10">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.19em] text-[#0077E6]">
              Keep learning
            </p>
            <h2 className="mt-3 text-2xl font-bold text-[#102A56] sm:text-3xl">
              Useful resources for your learning journey.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-500">
              Explore learning materials and guidance to help you make better
              decisions about tutoring and academic development.
            </p>
          </div>
          <Link
            href="/resources"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#0077E6] hover:underline"
          >
            Explore resources
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0B2042] text-white">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div className="max-w-sm">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-white"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0077E6] text-sm font-extrabold">
                  T
                </span>
                tutova
              </Link>
              <p className="mt-5 text-sm leading-7 text-blue-100/70">
                Connecting learners with tutors and making personalised learning
                support easier to discover.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">For learners</h3>
              <ul className="mt-5 space-y-3 text-sm text-blue-100/70">
                <li>
                  <Link
                    className="transition hover:text-white"
                    href="/discover"
                  >
                    Find a tutor
                  </Link>
                </li>
                <li>
                  <Link
                    className="transition hover:text-white"
                    href="/#subjects"
                  >
                    Explore subjects
                  </Link>
                </li>
                <li>
                  <Link
                    className="transition hover:text-white"
                    href="/#how-it-works"
                  >
                    How it works
                  </Link>
                </li>
                <li>
                  <Link
                    className="transition hover:text-white"
                    href="/resources"
                  >
                    Learning resources
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">For tutors</h3>
              <ul className="mt-5 space-y-3 text-sm text-blue-100/70">
                <li>
                  <Link
                    className="transition hover:text-white"
                    href="/register/tutor"
                  >
                    Become a tutor
                  </Link>
                </li>
                <li>
                  <Link
                    className="transition hover:text-white"
                    href="/become-a-tutor#pricing"
                  >
                    Pricing and payout
                  </Link>
                </li>
                <li>
                  <Link
                    className="transition hover:text-white"
                    href="/become-a-tutor#verification"
                  >
                    Verification
                  </Link>
                </li>
                <li>
                  <Link
                    className="transition hover:text-white"
                    href="/become-a-tutor#faqs"
                  >
                    Tutor FAQs
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">Tutova</h3>
              <ul className="mt-5 space-y-3 text-sm text-blue-100/70">
                <li>
                  <Link className="transition hover:text-white" href="/about">
                    About us
                  </Link>
                </li>
                <li>
                  <Link className="transition hover:text-white" href="/contact">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link className="transition hover:text-white" href="/safety">
                    Safety
                  </Link>
                </li>
                <li>
                  <Link className="transition hover:text-white" href="/terms">
                    Terms and privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/10 pt-7 text-xs text-blue-100/50 sm:flex-row sm:items-center">
            <p>© {new Date().getFullYear()} Tutova. All rights reserved.</p>
            <p>Learning grows with the right support.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
