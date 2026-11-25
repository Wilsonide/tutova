import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShieldCheck,
  Users,
  GraduationCap,
  FileCheck2,
  ClipboardCheck,
  Video,
  Handshake,
  LockKeyhole,
  Phone,
  MapPin,
  CalendarCheck,
  CreditCard,
  ArrowUpRight,
} from "lucide-react";

const verificationSteps = [
  {
    icon: FileCheck2,
    title: "Identity verification",
    description:
      "Tutors submit identification and relevant information for review.",
  },
  {
    icon: Users,
    title: "Referee verification",
    description:
      "Every tutor must provide at least two referees, whom our team contacts.",
  },
  {
    icon: ClipboardCheck,
    title: "Manual application review",
    description:
      "Our team reviews tutor applications before approving profiles. Submission alone does not guarantee approval.",
  },
  {
    icon: Video,
    title: "Introduction video",
    description:
      "Tutors provide a short introduction video to help parents become familiar with them.",
  },
  {
    icon: Handshake,
    title: "Professional commitment",
    description:
      "Tutors must accept Tutova's non-disclosure agreement and follow our professional expectations.",
  },
  {
    icon: ShieldCheck,
    title: "Administrative oversight",
    description:
      "Our team maintains administrative review and moderation processes for relevant platform activities.",
  },
];

export default function SafeguardingPage() {
  return (
    <AppShell
      title="Help & safety"
      description="How we support our community and promote safer, more accountable learning experiences."
    >
      <div className="mx-auto w-full max-w-5xl space-y-8 pb-8">
        {/* Introduction */}
        <section className="relative overflow-hidden rounded-2xl bg-[#102A56] px-6 py-8 text-white sm:px-8 sm:py-10">
          <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/5" />
          <div className="absolute -bottom-24 right-24 h-64 w-64 rounded-full bg-[#00AFA0]/10" />

          <div className="relative max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100">
              <ShieldCheck className="h-4 w-4" />
              Trust and safety at Tutova
            </div>

            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Learning built on trust and accountability.
            </h2>

            <p className="max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
              We believe quality tutoring starts with the right connections.
              That is why we work to make finding tutors, arranging lessons, and
              managing learning relationships more structured and transparent.
            </p>
          </div>
        </section>

        {/* Community support */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">
              How Tutova supports you
            </h2>
            <p className="text-sm text-slate-500">
              A platform designed to support both sides of the learning journey.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="space-y-4 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0077E6]">
                  <Users className="h-5 w-5" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-900">
                    For parents and learners
                  </h3>
                  <p className="text-sm leading-6 text-slate-600">
                    Find tutors based on your learning needs, submit tutoring
                    requests, arrange online or in-person lessons, and follow
                    learning progress through the platform.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="space-y-4 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-[#00AFA0]">
                  <GraduationCap className="h-5 w-5" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-900">For tutors</h3>
                  <p className="text-sm leading-6 text-slate-600">
                    Build a professional profile, connect with learners, respond
                    to tutoring requests, manage lessons, submit progress
                    reports, and receive payments through Tutova&apos;s payment
                    process.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Verification */}
        <section className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#00AFA0]" />
              <h2 className="text-lg font-semibold text-slate-900">
                Our tutor verification process
              </h2>
            </div>
            <p className="text-sm text-slate-500">
              The steps we take to promote trust and accountability within our
              tutoring community.
            </p>
          </div>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="grid gap-x-8 gap-y-6 p-5 sm:grid-cols-2 sm:p-6">
              {verificationSteps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div key={step.title} className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#102A56]">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-900">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-sm leading-6 text-slate-600">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
            <p className="text-sm leading-6 text-amber-900">
              <strong>Important:</strong> These measures help strengthen trust,
              but they cannot eliminate every possible risk. Parents and tutors
              should continue to exercise good judgment when arranging and
              attending sessions.
            </p>
          </div>
        </section>

        {/* Session and account safety */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">
              Keeping your account and sessions safe
            </h2>
            <p className="text-sm text-slate-500">
              A few important practices when using Tutova.
            </p>
          </div>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="divide-y divide-slate-100 p-0">
              <div className="flex gap-4 p-5">
                <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-[#0077E6]" />
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Protect your account
                  </h3>
                  <p className="text-sm leading-6 text-slate-600">
                    Never share your password, payment credentials, or sensitive
                    identity information through lesson messages.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-5">
                <CalendarCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#0077E6]" />
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Manage lessons responsibly
                  </h3>
                  <p className="text-sm leading-6 text-slate-600">
                    Use the booking workflow to confirm sessions and acknowledge
                    completed lessons. If a session is disputed, use the dispute
                    action on the lesson record to enter the available review
                    workflow.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-5">
                <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-[#0077E6]" />
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Understand payment protection
                  </h3>
                  <p className="text-sm leading-6 text-slate-600">
                    Tutor earnings are released only after the learner
                    acknowledges the completed session, subject to Tutova&apos;s
                    payment and review process.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact */}
        <section className="grid gap-4 md:grid-cols-2">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0077E6]">
                <Phone className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">Need assistance?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-6 text-slate-600">
                Contact our team for help with accounts, tutor verification,
                bookings, payments, or general enquiries.
              </p>

              <a
                href="tel:+2347010163875"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0077E6] hover:underline"
              >
                +234 701 016 3875
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-[#00AFA0]">
                <MapPin className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">Our head office</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm font-semibold text-slate-900">Tutova</p>
              <p className="text-sm leading-6 text-slate-600">
                [Insert official head office address]
              </p>
              <p className="text-xs text-slate-500">Nigeria</p>
            </CardContent>
          </Card>
        </section>

        <p className="text-center text-xs text-slate-400">
          Tutova — The right tutor. A brighter future.
        </p>
      </div>
    </AppShell>
  );
}
