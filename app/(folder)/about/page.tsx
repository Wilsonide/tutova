import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Tutova is a learning platform designed for Africa—connecting teachers, learners, and parents to turn education into a journey of confidence and steady growth.",
};

const problems = [
  "Children were failing—not from a lack of ability, but because they never got support tailored to how they learn.",
  "Brilliant teachers were undervalued, underpaid, and struggling to reach the students who needed them most.",
  "Parents were worried and searching for reliable help they could genuinely trust with their child’s future.",
  "Students and professionals wanted to grow and pass critical exams, but lacked practical guidance and real test preparation.",
];

const offerings = [
  {
    audience: "For Children: Closing the Learning Gap",
    description:
      "Every child learns at their own pace. Instead of rushing them or slapping on labels, we meet your child exactly where they are. We identify where they are struggling, walk with them until they catch up, and give them the confidence to move ahead.",
  },
  {
    audience: "For Parents: Peace of Mind and Clarity",
    description:
      "You shouldn't have to guess how your child is doing in school. Tutova keeps you connected to your child’s progress—showing you what they are learning, where they are improving, and what they need next. No more worrying in silence.",
  },
  {
    audience: "For Tutors: Respect and Fair Reward",
    description:
      "Your expertise matters. Tutova gives educators a dedicated space to teach, reach more students, and earn a dignified income. Here, great teaching is valued and rewarded.",
  },
  {
    audience: "For Students & Professionals: Practice That Builds Mastery",
    description:
      "Reading notes isn't enough when stakes are high. We give you access to thousands of past questions and interactive practice tools so you can walk into every exam, certification, or interview prepared and confident.",
  },
  {
    audience: "For Adult Learners: Growth on Your Own Terms",
    description:
      "It is never too late to pick up a new skill or finish what you started. Whether you are returning to school or upskilling for your career, Tutova lets you learn at your own pace, on your own schedule.",
  },
];

const values = [
  [
    "Every child matters.",
    "Regardless of their background, school, or starting point, every child deserves to be seen.",
  ],
  [
    "Every teacher matters.",
    "Great teachers change lives, and they deserve to earn well doing it.",
  ],
  [
    "Learning is personal.",
    "One size never fits all. Real progress happens when education adapts to the individual.",
  ],
  [
    "Access is everything.",
    "Quality support shouldn't depend on where you live or how much you earn.",
  ],
];

const promises = [
  ["To every parent:", "We will see and support your child."],
  ["To every tutor:", "We will value and reward your gift."],
  ["To every learner:", "We will give you your chance."],
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
  return (
    <main className="bg-white text-[#102A56]">
      {/* Hero / About Tutova */}
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

            <div className="mt-7 max-w-3xl space-y-5 text-base leading-8 text-blue-100 sm:text-lg">
              <p>
                In crowded classrooms, it is easy for a child to fall behind.
                Too often, those children are written off as "slow" or "dull,"
                and nobody stops to ask why.
              </p>

              <p className="font-semibold text-white">
                At Tutova, we believe something different: No child is incapable
                of learning. What they really need is time, attention, and a
                fair chance.
              </p>

              <p>
                Tutova was built on that belief. We are a learning platform
                designed for Africa—connecting teachers, learners, and parents
                to turn education from a daily struggle into a journey of
                confidence and steady growth.
              </p>
            </div>

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

      {/* Why We Started */}
      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0077E6]">
              Why We Started
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              We built Tutova to close these gaps.
            </h2>
          </div>

          <div>
            <p className="text-base leading-8 text-slate-600">
              Across our communities, we saw the same disconnect happening every
              day:
            </p>

            <ul className="mt-6 divide-y divide-[#E2EAF1] border-y border-[#E2EAF1]">
              {problems.map((problem, index) => (
                <li
                  key={problem}
                  className="grid gap-2 py-5 sm:grid-cols-[3rem_1fr] sm:gap-5"
                >
                  <span className="text-sm font-bold tabular-nums text-[#00AFA0]">
                    0{index + 1}
                  </span>
                  <p className="text-sm leading-7 text-slate-700 sm:text-base">
                    {problem}
                  </p>
                </li>
              ))}
            </ul>

            <p className="mt-8 text-lg font-semibold">
              We built Tutova to close these gaps.
            </p>
          </div>
        </div>
      </section>

      {/* How Tutova Helps */}
      <section className="bg-[#F4F8FB] px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="How Tutova Helps"
            title="Tutova connects the people who want to learn with the people who know how to teach."
          />

          <div className="mt-10 divide-y divide-[#DCE7F0] border-y border-[#DCE7F0]">
            {offerings.map((item, index) => (
              <article
                key={item.audience}
                className="grid gap-3 py-7 sm:grid-cols-[3rem_0.8fr_1.2fr] sm:gap-6 lg:gap-10"
              >
                <span className="pt-1 text-sm font-bold tabular-nums text-[#00AFA0]">
                  0{index + 1}
                </span>

                <h3 className="text-lg font-semibold leading-snug">
                  {item.audience}
                </h3>

                <p className="text-sm leading-7 text-slate-600 sm:text-base">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Our Mission & Vision */}
      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0077E6]">
              Our Mission
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              To leave no learner behind.
            </h2>

            <p className="mt-5 text-sm leading-8 text-slate-600 sm:text-base">
              Aligned with the United Nations Sustainable Development Goal 4
              (Quality Education for All), we exist to give every learner
              targeted support while empowering teachers to share their
              knowledge and earn sustainably.
            </p>
          </div>

          <div className="border-t-2 border-[#00AFA0] pt-7 lg:border-l-2 lg:border-t-0 lg:pl-10 lg:pt-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0077E6]">
              Our Vision
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              To become Africa’s most trusted learning community.
            </h2>

            <p className="mt-5 text-sm leading-8 text-slate-600 sm:text-base">
              A future where quality education isn't a privilege for a few, but
              an accessible right for every home.
            </p>
          </div>
        </div>
      </section>

      {/* What Drives Us */}
      <section className="bg-[#F4F8FB] px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="What Drives Us"
            title="The values behind our learning community."
          />

          <div className="mt-10 grid gap-x-12 sm:grid-cols-2">
            {values.map(([title, description], index) => (
              <div key={title} className="border-t border-[#DCE7F0] py-6">
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

      {/* Our Promise */}
      <section className="bg-[#102A56] px-5 py-16 text-white sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#55D8CC]">
              Our Promise
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              At Tutova, we don't just teach subjects—we build confidence.
            </h2>

            <p className="mt-5 text-base leading-8 text-blue-100">
              We don't just hand out answers—we build real understanding. To us,
              your child is never just a number in a classroom; they are a name,
              a story, and a future.
            </p>
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
              <p className="text-xl font-semibold">
                Welcome to Tutova—where learning meets care, and every learner
                rises.
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

      {/* Brand closing line */}
      <section className="border-t border-[#E2EAF1] px-5 py-6 text-center sm:px-8">
        <p className="text-xs font-semibold tracking-wide text-[#102A56] sm:text-sm">
          Every Child Can Learn <span className="mx-2 text-[#00AFA0]">•</span>
          Every Teacher Can Earn <span className="mx-2 text-[#00AFA0]">•</span>
          Every Learner Deserves A Chance
        </p>
      </section>
    </main>
  );
}
