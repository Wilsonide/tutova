import Link from "next/link";

export function SiteFooter() {
  return (
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
                <Link className="transition hover:text-white" href="/discover">
                  Find a tutor
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-white" href="/#subjects">
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
                <Link className="transition hover:text-white" href="/resources">
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
  );
}
