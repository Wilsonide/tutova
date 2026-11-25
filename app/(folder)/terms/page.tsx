import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { FileText, LockKeyhole, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms and privacy",
  description:
    "Read the terms for using Tutova and understand how information is used on the platform.",
};

const terms = [
  [
    "1. About Tutova",
    "Tutova is a platform that helps parents, adult learners and other learners discover tutors, make tutoring requests, arrange lessons and follow learning progress. Tutors can create profiles, respond to requests and manage tutoring engagements through the platform.",
  ],
  [
    "2. Accounts and accurate information",
    "You are responsible for providing accurate information when creating and maintaining your account. Keep your login credentials confidential and notify Tutova if you believe someone has accessed your account without permission. Do not impersonate another person or submit information or documents that you know to be false.",
  ],
  [
    "3. Tutor applications and verification",
    "Tutors must complete the information and verification steps requested during onboarding. These may include profile and education details, identity documents, an introduction video, referee information and acceptance of the tutor non-disclosure agreement. A submitted application remains subject to review. Submission, document upload or referee email delivery does not guarantee approval.",
  ],
  [
    "4. Tutor and learner responsibilities",
    "Tutors should describe their qualifications, experience, subjects and teaching arrangements honestly, prepare for agreed lessons and communicate professionally. Parents and learners should provide accurate learning requirements, review tutor information carefully and communicate lesson expectations respectfully. Both parties should keep agreed lesson details up to date.",
  ],
  [
    "5. Requests, bookings and agreements",
    "A tutoring request is an expression of interest and is not, by itself, a confirmed lesson. Follow the platform's booking and agreement steps and review the proposed date, time, duration, mode and other terms before accepting. Do not assume a booking is confirmed until the platform displays its confirmed status.",
  ],
  [
    "6. Payments and tutor earnings",
    "Where payment is required, use the payment options presented through Tutova. Review the amount and payment summary before completing a transaction. Tutor earnings, platform fees, payment confirmation, lesson completion and payout are handled according to the terms displayed for the relevant arrangement and the applicable platform workflow.",
  ],
  [
    "7. Lesson completion and disputes",
    "Use the platform's lesson-completion and acknowledgement steps honestly. If a learner or tutor believes a lesson record is inaccurate or a session is disputed, use the available dispute or support workflow and provide relevant information. A dispute may require administrative review before related funds or records are resolved.",
  ],
  [
    "8. Acceptable use",
    "You must not use Tutova to harass, threaten, exploit, discriminate against or deceive another person; share unlawful, abusive or harmful material; interfere with platform security; misuse another person's personal information; or attempt to bypass platform safeguards or payment workflows.",
  ],
  [
    "9. Content and profile information",
    "You retain responsibility for the information, documents, images, videos and other material you submit. You confirm that you are permitted to provide that material for the purposes of your Tutova account and application. You must not upload material that infringes another person's rights or contains information you are not authorised to share.",
  ],
  [
    "10. Platform availability and changes",
    "Tutova may update, improve, suspend or discontinue parts of the platform where reasonably necessary for maintenance, security, operational or legal reasons. We will take reasonable steps to communicate material changes through appropriate platform channels where practicable.",
  ],
  [
    "11. Suspension and account closure",
    "Tutova may restrict or suspend access where there is a reasonable concern about misuse, inaccurate information, safety, fraud, breach of these terms or a need to investigate an issue. Where appropriate, the affected user may be asked for information or given an opportunity to respond. You may contact Tutova to request assistance with your account.",
  ],
  [
    "12. Limitation and responsibility",
    "Tutova facilitates connections and platform workflows; it does not replace the judgment of parents, learners or tutors when deciding whether an arrangement is suitable. To the extent permitted by applicable law, Tutova does not guarantee uninterrupted platform availability, a particular learning outcome, a tutor match or a specific volume of tutoring requests. Nothing in these terms excludes a right or liability that cannot lawfully be excluded.",
  ],
];

const privacy = [
  [
    "Information you provide",
    "Depending on how you use Tutova, information may include account and contact details, profile information, education and work history, subjects and preferences, referee details and responses, identity and qualification documents, introduction videos, support enquiries, booking information and payment records.",
  ],
  [
    "Information created through platform use",
    "Tutova may process records generated when you use platform features, such as tutoring requests, bookings, agreements, lesson progress reports, notifications, verification decisions, payment status and relevant account activity.",
  ],
  [
    "How information is used",
    "Information is used to create and maintain accounts, display tutor profiles, support tutor applications and verification, connect learners with tutors, arrange and manage lessons, process payments and payouts, provide support, address disputes, maintain platform security and meet applicable legal obligations.",
  ],
  [
    "Who information may be shared with",
    "Information may be shared with people and service providers who need it for the relevant platform function. For example, referee details are used to contact the referees supplied by a tutor; relevant tutor profile information is shown to prospective learners; payment information is processed through payment providers; and authorised Tutova administrators may review verification materials and platform records.",
  ],
  [
    "Documents and verification materials",
    "Identity documents, certificates, statements of result, referee responses and tutor introduction videos are provided for onboarding, verification and related platform purposes. Access should be limited to authorised personnel and relevant workflows. Do not upload documents belonging to another person unless you are authorised to do so.",
  ],
  [
    "Storage, security and retention",
    "Tutova uses technical and organisational measures intended to protect information against unauthorised access, loss or misuse. No online service can guarantee absolute security. Information may be retained for as long as needed for the purposes described here, to maintain relevant records, resolve disputes, enforce agreements or meet legal requirements.",
  ],
  [
    "Your choices and requests",
    "You should keep your account information accurate. For questions or requests concerning your personal information, contact Tutova using the details below. We may need to verify your identity and consider applicable legal or operational requirements before responding.",
  ],
  [
    "Updates to this notice",
    "Tutova may update these terms and this privacy information as the platform develops or legal requirements change. The latest version will be published on this page. Check this page periodically for updates.",
  ],
];

export default function TermsPage() {
  return (
    <main className="bg-white text-[#102A56]">
      <section className="bg-[#102A56]">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55D8CC]">
            Legal information
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-5xl">
            Terms of use and privacy
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-blue-100">
            Please read these terms and the privacy information below to
            understand the responsibilities involved in using Tutova.
          </p>
          <p className="mt-4 text-xs text-blue-100/70">
            Draft for review — this page should be checked by a qualified
            Nigerian legal practitioner before being treated as Tutova's final
            legal policy.
          </p>
        </div>
      </section>
      <section className="px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[240px_1fr]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-[#F4F8FB] p-5 lg:sticky lg:top-24">
            <h2 className="font-semibold">On this page</h2>
            <nav className="mt-4 space-y-3 text-sm">
              <a className="block text-[#0077E6] hover:underline" href="#terms">
                Terms of use
              </a>
              <a
                className="block text-[#0077E6] hover:underline"
                href="#privacy"
              >
                Privacy information
              </a>
              <a
                className="block text-[#0077E6] hover:underline"
                href="#contact"
              >
                Contact
              </a>
            </nav>
          </aside>
          <div className="min-w-0">
            <section id="terms" className="scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#0077E6]">
                  <Scale className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#0077E6]">
                    Part one
                  </p>
                  <h2 className="text-2xl font-semibold">Terms of use</h2>
                </div>
              </div>
              <div className="mt-7 divide-y divide-slate-200 border-y border-slate-200">
                {terms.map(([title, text]) => (
                  <article key={title} className="py-5">
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {text}
                    </p>
                  </article>
                ))}
              </div>
            </section>
            <section id="privacy" className="mt-14 scroll-mt-24">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-[#00AFA0]">
                  <LockKeyhole className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#00AFA0]">
                    Part two
                  </p>
                  <h2 className="text-2xl font-semibold">
                    Privacy information
                  </h2>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                The exact information processed depends on the features you use.
                The sections below describe the general categories and purposes.
              </p>
              <div className="mt-7 divide-y divide-slate-200 border-y border-slate-200">
                {privacy.map(([title, text]) => (
                  <article key={title} className="py-5">
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {text}
                    </p>
                  </article>
                ))}
              </div>
            </section>
            <section
              id="contact"
              className="mt-14 rounded-2xl bg-[#F4F8FB] p-6 sm:p-8"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-[#0077E6]" />
                <h2 className="text-xl font-semibold">
                  Questions about these terms?
                </h2>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Contact Tutova for questions about the platform, these terms or
                your personal information.
              </p>
              <a
                href="tel:+2347010163875"
                className="mt-4 inline-flex font-semibold text-[#0077E6] hover:underline"
              >
                +234 701 016 3875
              </a>
            </section>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
