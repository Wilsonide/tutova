"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ArrowRight,
  Menu,
  X,
  UserRound,
  LogOut,
} from "lucide-react";
import { TutorSearch } from "./tutor-search";
import { useAuth } from "@/components/providers";
const learnerLinks = [
  {
    label: "For parents",
    href: "/#parents",
    description: "Find the right learning support for your child.",
  },
  {
    label: "For individual learners",
    href: "/#individual-learners",
    description: "Build skills and learn at your own pace.",
  },
  {
    label: "Explore subjects",
    href: "/#subjects",
    description: "Browse subjects and areas of learning.",
  },
  {
    label: "Explore tutors",
    href: "/discover",
    description: "Discover tutors and compare their profiles.",
  },
  {
    label: "Learning resources",
    href: "/#resources",
    description: "Helpful materials for better learning.",
  },
  {
    label: "How it works",
    href: "/#how-it-works",
    description: "Understand how Tutova connects learners and tutors.",
  },
];
const tutorLinks = [
  { label: "Tutor registration", href: "/register/tutor" },
  { label: "Tutor pricing & payout", href: "/become-a-tutor#pricing" },
  {
    label: "Tutor listing guidelines",
    href: "/become-a-tutor#listing-guidelines",
  },
  { label: "Tutor guidelines", href: "/become-a-tutor#guidelines" },
  { label: "Tutor verification", href: "/become-a-tutor#verification" },
  { label: "Tutor FAQs", href: "/become-a-tutor#faqs" },
];
type MenuName = "learners" | "tutors" | null;
export function SiteHeader() {
  const [activeMenu, setActiveMenu] = useState<MenuName>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const initials = user
    ? `${user.first_name?.charAt(0) ?? ""}${user.last_name?.charAt(0) ?? ""}`.toUpperCase()
    : "";
  const fullName = user ? `${user.first_name} ${user.last_name}`.trim() : "";
  const formattedRole = user?.role
    ? user.role
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "";
  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setActiveMenu(null);
        setAccountOpen(false);
        setMobileAccountOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveMenu(null);
        setMobileOpen(false);
        setAccountOpen(false);
        setMobileAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  function closeNavigation() {
    setActiveMenu(null);
    setMobileOpen(false);
    setAccountOpen(false);
    setMobileAccountOpen(false);
  }
  function toggleMenu(menu: Exclude<MenuName, null>) {
    setActiveMenu((current) => (current === menu ? null : menu));
    setAccountOpen(false);
  }
  async function handleSignOut() {
    try {
      await signOut();
      closeNavigation();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Unable to sign out:", error);
    }
  }
  const desktopTriggerClass = (menu: Exclude<MenuName, null>) =>
    `group flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-colors duration-200 ${
      activeMenu === menu
        ? "bg-[#F0F7FF] text-[#0077E6]"
        : "text-slate-700 hover:bg-[#F4F8FB] hover:text-[#0077E6]"
    }`;
  const mobileTriggerClass = (menu: Exclude<MenuName, null>) =>
    `flex min-h-12 w-full items-center justify-between rounded-xl px-3 text-left text-sm font-semibold transition-colors ${
      activeMenu === menu
        ? "bg-[#F0F7FF] text-[#0077E6]"
        : "text-[#102A56] hover:bg-[#F7F9FC]"
    }`;
  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-[100] w-full border-b border-[#E8EDF3] bg-white/95 shadow-sm backdrop-blur-xl"
    >
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
        {/* Search and brand */}
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Link
            href="/"
            onClick={closeNavigation}
            className="flex shrink-0 items-center gap-2.5"
            aria-label="Tutova home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102A56] text-lg font-bold text-white">
              T
            </span>
            <span className="text-[25px] font-bold tracking-tight text-[#102A56]">
              tutova<span className="text-[#00AFA0]">.</span>
            </span>
          </Link>
        </div>
        {/* Desktop navigation */}
        <nav
          className="hidden items-center gap-2 lg:flex"
          aria-label="Main navigation"
        >
          {/* Learner dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleMenu("learners")}
              aria-expanded={activeMenu === "learners"}
              aria-haspopup="true"
              className={desktopTriggerClass("learners")}
            >
              For Learners
              <ChevronDown
                size={15}
                className={`transition-transform duration-200 ${
                  activeMenu === "learners" ? "rotate-180" : ""
                }`}
              />
            </button>
            {activeMenu === "learners" && (
              <div className="absolute left-0 top-full z-50 mt-3 w-[370px] overflow-hidden rounded-2xl border border-[#E8EDF3] bg-white p-2 shadow-[0_20px_60px_rgba(16,42,86,0.14)]">
                <div className="px-4 pb-3 pt-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#00AFA0]">
                    Learn with Tutova
                  </p>
                  <p className="mt-1 text-[13px] leading-5 text-slate-500">
                    Everything learners need, in one place.
                  </p>
                </div>
                <div className="space-y-0.5">
                  {learnerLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeNavigation}
                      className="group flex items-start justify-between rounded-xl px-4 py-3 transition-colors duration-150 hover:bg-[#F4F8FB]"
                    >
                      <span>
                        <span className="block text-[13px] font-semibold text-[#243B5A] transition-colors group-hover:text-[#0077E6]">
                          {item.label}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                          {item.description}
                        </span>
                      </span>
                      <ArrowRight
                        size={14}
                        className="mt-1 shrink-0 text-slate-300 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-[#0077E6] group-hover:opacity-100"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Tutor dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleMenu("tutors")}
              aria-expanded={activeMenu === "tutors"}
              aria-haspopup="true"
              className={desktopTriggerClass("tutors")}
            >
              Become a Tutor
              <ChevronDown
                size={15}
                className={`transition-transform duration-200 ${
                  activeMenu === "tutors" ? "rotate-180" : ""
                }`}
              />
            </button>
            {activeMenu === "tutors" && (
              <div className="absolute left-0 top-full z-50 mt-3 w-[310px] overflow-hidden rounded-2xl border border-[#E8EDF3] bg-white p-2 shadow-[0_20px_60px_rgba(16,42,86,0.14)]">
                <div className="px-4 pb-3 pt-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#00AFA0]">
                    Tutor information
                  </p>
                  <p className="mt-1 text-[13px] leading-5 text-slate-500">
                    Resources for teaching on Tutova.
                  </p>
                </div>
                <div className="space-y-0.5">
                  {tutorLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeNavigation}
                      className="group flex items-center justify-between rounded-xl px-4 py-3 text-[13px] font-semibold text-[#243B5A] transition-colors hover:bg-[#F4F8FB] hover:text-[#0077E6]"
                    >
                      {item.label}
                      <ArrowRight
                        size={14}
                        className="text-slate-300 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-[#0077E6] group-hover:opacity-100"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>
        {/* Desktop actions */}
        <div className="hidden shrink-0 items-center gap-5 lg:flex">
          {!loading && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setAccountOpen((open) => !open);
                  setActiveMenu(null);
                }}
                aria-label="Open account menu"
                aria-expanded={accountOpen}
                aria-haspopup="true"
                className="flex items-center gap-2 rounded-full border border-[#E8EDF3] p-1 pr-3 transition-colors hover:border-[#B8D5F5] hover:bg-[#F7FAFD]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#102A56] text-sm font-bold text-white">
                  {initials}
                </span>
                <span className="max-w-[110px] truncate text-[13px] font-semibold text-[#102A56]">
                  {user.first_name}
                </span>
                <ChevronDown
                  size={15}
                  className={`text-slate-500 transition-transform ${
                    accountOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-full z-50 mt-3 w-[270px] overflow-hidden rounded-2xl border border-[#E8EDF3] bg-white p-2 shadow-[0_20px_60px_rgba(16,42,86,0.14)]">
                  <div className="border-b border-[#EDF0F4] px-3 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#102A56] text-sm font-bold text-white">
                        {initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#102A56]">
                          {fullName}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 inline-flex rounded-full bg-[#F0F7FF] px-3 py-1 text-[11px] font-semibold text-[#0077E6]">
                      {formattedRole}
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={closeNavigation}
                    className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-semibold text-[#102A56] transition-colors hover:bg-[#F0F7FF] hover:text-[#0077E6]"
                  >
                    <UserRound size={16} />
                    Go to Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : !loading ? (
            <>
              <Link
                href="/login"
                className="text-[13px] font-semibold text-[#102A56] transition-colors hover:text-[#0077E6]"
              >
                Log in
              </Link>
              <Link
                href="/discover"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#0077E6] px-6 text-[13px] font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0066C7] hover:shadow-md"
              >
                Find a tutor
                <ArrowRight size={15} />
              </Link>
            </>
          ) : (
            <div className="h-10 w-28 animate-pulse rounded-full bg-slate-100" />
          )}
        </div>
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => {
            setMobileOpen((open) => !open);
            setActiveMenu(null);
            setAccountOpen(false);
          }}
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E5EAF0] text-[#102A56] transition-colors hover:bg-[#F4F8FB] lg:hidden"
        >
          {mobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>
      {/* Mobile navigation */}
      {mobileOpen && (
        <div className="max-h-[calc(100dvh-76px)] overflow-y-auto overscroll-contain border-t border-[#E8EDF3] bg-white px-5 pb-6 pt-5 shadow-[0_16px_30px_rgba(16,42,86,0.07)] lg:hidden">
          <div className="mx-auto max-w-7xl">
            {/* Mobile search */}
            <div className="mb-5 sm:hidden">
              <TutorSearch mobile onSearch={closeNavigation} />
            </div>
            {/* Mobile account */}
            {!loading && user && (
              <div className="mb-5 rounded-2xl border border-[#E8EDF3] bg-[#F8FAFC] p-3">
                <button
                  type="button"
                  onClick={() => setMobileAccountOpen((open) => !open)}
                  aria-expanded={mobileAccountOpen}
                  className="flex w-full items-center justify-between"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#102A56] text-sm font-bold text-white">
                      {initials}
                    </span>
                    <span className="min-w-0 text-left">
                      <span className="block truncate text-sm font-bold text-[#102A56]">
                        {fullName}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {user.email}
                      </span>
                    </span>
                  </span>
                  <ChevronDown
                    size={17}
                    className={`shrink-0 text-slate-500 transition-transform ${
                      mobileAccountOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {mobileAccountOpen && (
                  <div className="mt-3 border-t border-[#E5EAF0] pt-3">
                    <span className="inline-flex rounded-full bg-[#F0F7FF] px-3 py-1 text-[11px] font-semibold text-[#0077E6]">
                      {formattedRole}
                    </span>
                    <Link
                      href="/dashboard"
                      onClick={closeNavigation}
                      className="mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#102A56] transition-colors hover:bg-[#F0F7FF] hover:text-[#0077E6]"
                    >
                      <UserRound size={16} />
                      Go to Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            )}
            {/* Learner section */}
            <div className="border-b border-[#EDF0F4] pb-3">
              <button
                type="button"
                onClick={() => toggleMenu("learners")}
                aria-expanded={activeMenu === "learners"}
                className={mobileTriggerClass("learners")}
              >
                <span>For Learners</span>
                <ChevronDown
                  size={17}
                  className={`transition-transform duration-200 ${
                    activeMenu === "learners" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeMenu === "learners" && (
                <div className="mt-2 space-y-1 rounded-xl bg-[#F7F9FC] p-2">
                  {learnerLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeNavigation}
                      className="block rounded-lg px-3 py-3 transition-colors hover:bg-white"
                    >
                      <span className="block text-[13px] font-semibold text-[#243B5A]">
                        {item.label}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        {item.description}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {/* Tutor section */}
            <div className="border-b border-[#EDF0F4] py-3">
              <button
                type="button"
                onClick={() => toggleMenu("tutors")}
                aria-expanded={activeMenu === "tutors"}
                className={mobileTriggerClass("tutors")}
              >
                <span>Become a Tutor</span>
                <ChevronDown
                  size={17}
                  className={`transition-transform duration-200 ${
                    activeMenu === "tutors" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {activeMenu === "tutors" && (
                <div className="mt-2 space-y-1 rounded-xl bg-[#F7F9FC] p-2">
                  {tutorLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeNavigation}
                      className="flex items-center justify-between rounded-lg px-3 py-3 text-[13px] font-medium text-[#43536A] transition-colors hover:bg-white hover:text-[#0077E6]"
                    >
                      {item.label}
                      <ArrowRight size={14} className="text-slate-300" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {/* Mobile actions */}
            {!loading && !user && (
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={closeNavigation}
                  className="flex h-12 items-center justify-center rounded-xl border border-[#DCE4ED] text-sm font-semibold text-[#102A56] transition-colors hover:bg-[#F7F9FC]"
                >
                  Log in
                </Link>
                <Link
                  href="/discover"
                  onClick={closeNavigation}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0077E6] text-sm font-semibold text-white transition-colors hover:bg-[#0066C7]"
                >
                  Find a tutor
                  <ArrowRight size={15} />
                </Link>
              </div>
            )}
            {loading && (
              <div className="mt-5 h-12 animate-pulse rounded-xl bg-slate-100" />
            )}
          </div>
        </div>
      )}
    </header>
  );
}
export default SiteHeader;
