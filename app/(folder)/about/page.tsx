import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Discover the belief, mission and people behind Tutova — a learning community where every learner gets a chance to rise.",
};

const offerings = [
  {
    audience: "For children",
    title: "We find the gap and close it.",
    description:
      "Every child learns differently. We provide personalized support that meets your child exactly where they are. We don't rush them or label them. We find where they need help and walk with them until they catch up — and then go ahead.",
    note: "A child given Time, Attention, and Chance can surprise everyone.",
  },
  {
    audience: "For parents",
    title: "You are no longer alone.",
    description:
      "Tutova bridges the gap between you and your child's learning. You will know what your child is learning, how they are improving, and what they need next. No more guessing. No more worry in silence.",
  },
  {
    audience: "For tutors",
    title: "Your knowledge is valuable.",
    description:
      "We give tutors a platform to teach, to be seen, and to earn with dignity. Your expertise is not wasted here. At Tutova, teaching is respected, rewarded, and celebrated.",
  },
  {
    audience: "For students and professionals",
    title: "Practice until you master it.",
    description:
      "We give you access to thousands of past questions and a real opportunity to practise them — not just read them. So you walk into every exam, interview, and opportunity prepared and confident.",
  },
  {
    audience: "For adult learners",
    title: "It is never too late to learn.",
    description:
      "Whether you want to learn a new skill, go back to school, or simply grow, Tutova gives you the chance to acquire more knowledge at your own pace, on your own terms.",
  },
];

const beliefs = [
  [
    "Every child matters.",
    "No matter their background, school, or starting point.",
  ],
  [
    "Every teacher matters.",
    "Great teachers change lives, and they deserve to earn well doing it.",
  ],
  [
    "Learning is personal.",
    "One size never fits all. Every learner deserves a plan made for them.",
  ],
  [
    "Access is justice.",
    "Quality education should not depend on wealth or location.",
  ],
];

const promises = [
  ["To every parent", "We will see your child."],
  ["To every tutor", "We will value your gift."],
  ["To every learner", "We will give you your chance."],
];

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0077E6]">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#102A56] sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
      )}
    </div>
  );
}

export default function AboutPage() {
  const problems = [
    "Too many children struggle not because they cannot learn, but because they have not received the right support.",
    "Too many brilliant teachers are undervalued, underpaid, and unseen.",
    "Too many parents are worried and searching for someone they can trust with their child's future.",
    "Too many adult learners, students, and professionals want to grow but cannot find the right guidance, questions, or practice.",
  ];

  const differences = [
    ["We don't just teach subjects.", "We build confidence."],
    ["We don't just give answers.", "We build understanding."],
    ["We don't just prepare children for exams.", "We prepare them for life."],
  ];

  return (
    <main className="bg-white text-[#102A56]">
      <section className="bg-[#102A56]">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#55D8CC]">
            About Tutova
          </p>
          <div className="mt-6 max-w-4xl">
            <h1 className="text-4xl font-semibold leading-[1.12] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
              Every child can learn. Every teacher can earn. Every learner
              deserves a chance.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-blue-100 sm:text-lg">
              We believe learning should open doors, build confidence, and give
              every person the support they need to reach their potential.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/discover"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#00AFA0] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#00998D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55D8CC]"
              >
                Find a tutor <ArrowRight size={17} />
              </Link>
              <Link
                href="/register/tutor"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/35 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55D8CC]"
              >
                Teach with Tutova
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0077E6]">
              The belief that started it all
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              No child is dull.
            </h2>
            <p className="mt-4 text-lg font-semibold leading-8 text-[#00AFA0]">
              Every child needs Time, Attention, and Chance.
            </p>
          </div>
          <div className="space-y-5 text-base leading-8 text-slate-600">
            <p>
              Some children are called dull. Some are called slow. Some are left
              behind in a crowded classroom and nobody ever stops to ask why.
            </p>
            <p className="font-semibold text-[#102A56]">
              At Tutova, we know the truth: every learner can make progress when
              given the right support.
            </p>
            <p>
              Tutova is a learning platform that bridges the gap between
              teachers, learners, and parents — and turns learning from a
              struggle into a journey of confidence, growth, and possibility.
            </p>
            <p>
              We are not just another tutoring website. We are a learning
              community built for Africa, for every home, and for every child
              who deserves to be seen.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#F4F8FB] px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="The problem we saw"
            title="Potential is everywhere. The right support isn't."
            description="Too many learners and educators are held back by gaps that the right guidance, attention, and opportunity can help close."
          />
          <ul className="mt-10 divide-y divide-[#DCE7F0] border-y border-[#DCE7F0]">
            {problems.map((problem, index) => (
              <li
                key={problem}
                className="grid gap-2 py-5 sm:grid-cols-[3rem_1fr] sm:gap-5"
              >
                <span className="text-sm font-bold tabular-nums text-[#00AFA0]">
                  0{index + 1}
                </span>
                <p className="max-w-4xl text-sm leading-7 text-slate-700 sm:text-base">
                  {problem}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-lg font-semibold">
            We saw that gap. And we decided to close it.
          </p>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="What Tutova does"
            title="Connecting the people who need learning with the people who can teach it."
            description="Tutova brings learners, parents, and tutors together around the support, practice, and opportunity each person needs."
          />
          <div className="mt-10 divide-y divide-[#E2EAF1] border-y border-[#E2EAF1]">
            {offerings.map((item, index) => (
              <article
                key={item.audience}
                className="grid gap-3 py-7 sm:grid-cols-[3rem_0.8fr_1.2fr] sm:gap-6 lg:gap-10"
              >
                <span className="pt-1 text-sm font-bold tabular-nums text-[#00AFA0]">
                  0{index + 1}
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#0077E6]">
                    {item.audience}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold leading-snug">
                    {item.title}
                  </h3>
                </div>
                <div>
                  <p className="text-sm leading-7 text-slate-600">
                    {item.description}
                  </p>
                  {item.note && (
                    <p className="mt-3 text-sm font-semibold leading-6 text-[#087F78]">
                      {item.note}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F4F8FB] px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0077E6]">
              Our mission
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              Leave no learner behind.
            </h2>
            <p className="mt-5 text-sm leading-8 text-slate-600 sm:text-base">
              To ensure that every child gets support in the areas where they
              need it. To give every child equal access to quality education in
              line with the United Nations Sustainable Development Goal 4 —
              Quality Education for All. And to give teachers a platform to
              share their expertise and earn from it.
            </p>
            <p className="mt-4 font-semibold">
              Our mission is simple: leave no learner behind.
            </p>
          </div>
          <div className="border-t-2 border-[#00AFA0] pt-7 lg:border-l-2 lg:border-t-0 lg:pl-10 lg:pt-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0077E6]">
              Our vision
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              A brighter future for every learner.
            </h2>
            <p className="mt-5 text-sm leading-8 text-slate-600 sm:text-base">
              To become Africa's leading learning community and the trusted home
              where every child is supported, every teacher is valued, and every
              learner — young or adult — has the opportunity to reach their full
              potential.
            </p>
            <p className="mt-4 font-semibold">
              Quality education should be a right for all, not a privilege for a
              few.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="What we believe"
            title="A learning community built on people-first values."
          />
          <div className="mt-10 grid gap-x-12 sm:grid-cols-2">
            {beliefs.map(([title, description], index) => (
              <div key={title} className="border-t border-[#E2EAF1] py-6">
                <p className="text-xs font-bold tabular-nums text-[#00AFA0]">
                  0{index + 1}
                </p>
                <h3 className="mt-2 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F4F8FB] px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <SectionHeading
            eyebrow="Why Tutova is different"
            title="More than lessons. A foundation for life."
            description="At Tutova, your child is not a number. Your child is a name, a story, and a future."
          />
          <div className="divide-y divide-[#DCE7F0] border-y border-[#DCE7F0]">
            {differences.map(([first, second]) => (
              <div key={first} className="py-5">
                <p className="text-sm text-slate-500">{first}</p>
                <p className="mt-1 text-lg font-semibold">{second}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#102A56] px-5 py-16 text-white sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#55D8CC]">
              Our promise to you
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              Every learner deserves to be seen.
            </h2>
          </div>
          <div className="mt-9 grid gap-6 border-y border-white/20 py-7 sm:grid-cols-3 sm:gap-8">
            {promises.map(([audience, promise]) => (
              <div key={audience}>
                <p className="text-sm text-blue-100">{audience}</p>
                <p className="mt-2 text-lg font-semibold text-[#55D8CC]">
                  {promise}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xl font-semibold">Welcome to Tutova.</p>
              <p className="mt-2 text-sm leading-7 text-blue-100">
                Where learning meets love, and every learner rises.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#00AFA0] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#00998D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55D8CC]"
              >
                Get started <ArrowRight size={17} />
              </Link>
              <Link
                href="/discover"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/35 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55D8CC]"
              >
                Explore tutors
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
