import Link from "next/link";

const CONTACT_NUMBER = "+2347010163875";
const WHATSAPP_URL =
  "https://wa.me/2347010163875?text=Hello%20Tutova%2C%20I%20would%20like%20to%20make%20an%20enquiry.";

const socialLinks = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/t.u.tova/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.5" cy="6.8" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/tutova/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M5.2 3.5a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4ZM3.3 9.4h3.8v11.2H3.3V9.4Zm6.1 0H13v1.5h.1a4.1 4.1 0 0 1 3.7-2c4 0 4.7 2.6 4.7 5.9v5.8h-3.8v-5.1c0-1.2 0-2.8-1.8-2.8s-2.1 1.3-2.1 2.7v5.2H9.4V9.4Z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@tutova__",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.6 8.1a7.1 7.1 0 0 1-4.4-1.5v7.1a5.6 5.6 0 1 1-5.6-5.6c.4 0 .8 0 1.2.1v3.1a2.7 2.7 0 1 0 1.5 2.4V2.5h3a4.2 4.2 0 0 0 4.3 3.8v1.8Z" />
      </svg>
    ),
  },
  {
    name: "X",
    href: "https://x.com/T_u_tova",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.7 5.6 22H2.4l7.3-8.4L1.9 2h6.5l4.5 6.7L18.9 2Zm-1.1 18h1.7L7.4 3.9H5.6L17.8 20Z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@liketutova",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23.2 7a3 3 0 0 0-2.1-2.1C19.2 4.4 12 4.4 12 4.4s-7.2 0-9.1.5A3 3 0 0 0 .8 7 31 31 0 0 0 .3 12a31 31 0 0 0 .5 5 3 3 0 0 0 2.1 2.1c1.9.5 9.1.5 9.1.5s7.2 0 9.1-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-5 31 31 0 0 0-.5-5ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://web.facebook.com/getintutova",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.5 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.3-1.5 1.6-1.5h1.7V3.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.3v3.2h2.8V21h3.4Z" />
      </svg>
    ),
  },
];

const footerGroups = [
  {
    title: "For learners",
    links: [
      { label: "Find a tutor", href: "/discover" },
      { label: "Explore subjects", href: "/#subjects" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Learning resources", href: "/resources" },
      { label: "Learner FAQs", href: "/#faqs" },
    ],
  },
  {
    title: "For tutors",
    links: [
      { label: "Become a tutor", href: "/register/tutor" },
      { label: "Pricing and payout", href: "/become-a-tutor#pricing" },
      { label: "Verification", href: "/become-a-tutor#verification" },
      { label: "Tutor FAQs", href: "/become-a-tutor#faqs" },
    ],
  },
  {
    title: "Tutova",
    links: [
      { label: "About us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Safety", href: "/safety" },
      { label: "Terms and privacy", href: "/terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#0B2042] text-white">
      {/* Subtle decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-[#0077E6]/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-5 pb-8 pt-14 sm:px-8 sm:pt-16 lg:px-10">
        {/* Main footer */}
        <div className="grid gap-12 border-b border-white/10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-10">
          {/* Brand */}
          <div className="max-w-sm">
            <Link
              href="/"
              className="group inline-flex items-center gap-2.5"
              aria-label="Tutova home"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0077E6] text-base font-extrabold text-white shadow-lg shadow-blue-950/20 transition duration-200 group-hover:bg-[#00AFA0]">
                T
              </span>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                tutova<span className="text-[#00AFA0]">.</span>
              </span>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-7 text-blue-100/65">
              Connecting learners with tutors and making personalised learning
              support easier to discover.
            </p>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#00AFA0]">
              The right tutor. A brighter future.
            </p>

            {/* Contact information */}
            <div className="mt-6 space-y-3">
              <a
                href={`tel:${CONTACT_NUMBER}`}
                className="group inline-flex items-center gap-3 text-sm text-blue-100/75 transition hover:text-[#65DED0]"
                aria-label="Call Tutova"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] transition group-hover:border-[#00AFA0]/40 group-hover:bg-[#00AFA0]/10">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="h-4 w-4"
                  >
                    <path
                      d="M5 3h3l2 5-2 1.5a14 14 0 0 0 6.5 6.5L18 14l3 3v3c0 1.1-.9 2-2 2C10.6 21 3 13.4 3 5c0-1.1.9-2 2-2Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span>
                  <span className="block text-xs text-blue-100/45">
                    Call us
                  </span>
                  <span className="font-semibold">+234 701 016 3875</span>
                </span>
              </a>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with Tutova on WhatsApp"
                className="group inline-flex items-center gap-3 text-sm text-blue-100/75 transition hover:text-[#65DED0]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] transition group-hover:border-[#00AFA0]/40 group-hover:bg-[#00AFA0]/10">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    className="h-[18px] w-[18px]"
                  >
                    <path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.6 0 .3 5.3.3 11.8c0 2.1.6 4.2 1.6 6L0 24l6.4-1.7a11.8 11.8 0 0 0 5.7 1.5h.1c6.5 0 11.8-5.3 11.8-11.8 0-3.2-1.2-6.2-3.5-8.5ZM12.1 21.8a9.9 9.9 0 0 1-5-1.4l-.4-.2-3.8 1 1-3.7-.3-.4a9.8 9.8 0 0 1-1.5-5.3c0-5.5 4.5-10 10-10 2.7 0 5.2 1 7.1 2.9a9.9 9.9 0 0 1 2.9 7.1c0 5.5-4.5 10-10 10Zm5.5-7.5c-.3-.2-1.7-.9-2-1s-.5-.2-.7.2-.8 1-.9 1.2-.3.2-.6.1a8 8 0 0 1-2.4-1.5 9 9 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.4.3-.6.1-.2 0-.4 0-.6s-.7-1.7-1-2.3c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.2-1.2 2.8 1.2 3.2 1.4 3.4c.2.2 2.4 3.7 5.8 5.1.8.3 1.4.5 1.9.6.8.3 1.6.2 2.2.1.7-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.1-1.4-.1-.2-.3-.3-.6-.5Z" />
                  </svg>
                </span>
                <span>
                  <span className="block text-xs text-blue-100/45">
                    Chat with us
                  </span>
                  <span className="font-semibold">WhatsApp Tutova</span>
                </span>
              </a>
            </div>
          </div>

          {/* Navigation groups */}
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-bold tracking-wide text-white">
                {group.title}
              </h3>

              <ul className="mt-5 space-y-3.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="inline-flex text-sm text-blue-100/60 transition duration-200 hover:translate-x-1 hover:text-[#00AFA0]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social section */}
        <div className="grid gap-9 border-b border-white/10 py-10 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#00AFA0]/20 bg-[#00AFA0]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#65DED0]">
              Stay connected
              <span className="h-1.5 w-1.5 rounded-full bg-[#00AFA0]" />
            </span>

            <h3 className="mt-4 text-xl font-bold tracking-tight text-white sm:text-2xl">
              Follow Tutova Everywhere!{" "}
              <span className="whitespace-nowrap">📚✨</span>
            </h3>

            <p className="mt-3 text-sm leading-7 text-blue-100/65">
              We are everywhere you are. Follow us, learn with us, and grow with
              us!
            </p>

            <p className="mt-4 text-sm leading-6 text-blue-100/75">
              Turn on notifications so you don't miss our lessons, tips, and
              updates.
            </p>
          </div>

          {/* Social links */}
          <div className="flex flex-wrap gap-2.5 lg:max-w-[390px] lg:justify-end">
            {socialLinks.map(({ name, href, icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow Tutova on ${name}`}
                className="group inline-flex h-11 items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-sm font-medium text-blue-100/75 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#00AFA0]/50 hover:bg-[#00AFA0]/10 hover:text-white hover:shadow-lg hover:shadow-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00AFA0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B2042]"
              >
                <span className="h-[17px] w-[17px] shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:text-[#65DED0]">
                  {icon}
                </span>
                {name}
              </a>
            ))}
          </div>
        </div>

        {/* Hashtags */}
        <p className="py-6 text-xs leading-6 text-blue-100/40">
          #Tutova <span className="text-[#00AFA0]/70">#LearnWithTutova</span>{" "}
          #OnlineLearning #Education #StudyWithUs
        </p>

        {/* Bottom bar */}
        <div className="flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-blue-100/45 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Tutova. All rights reserved.</p>

          <p className="font-medium tracking-wide">
            Learning grows with the right support.
          </p>
        </div>
      </div>
    </footer>
  );
}
