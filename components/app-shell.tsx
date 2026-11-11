"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  CalendarDays,
  ChartNoAxesColumn,
  Compass,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Wallet,
  Settings,
  HeartHandshake,
  Users,
  Menu,
  X,
  GraduationCap,
  ClipboardCheck,
  ChevronRight,
} from "lucide-react";

import { Brand } from "@/components/brand";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";

const learnerNav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/requests", label: "Requests", icon: Users },
  { href: "/lessons", label: "Lessons", icon: CalendarDays },
  {
    href: "/progress",
    label: "Learning progress",
    icon: ChartNoAxesColumn,
  },
  { href: "/payments", label: "Payments", icon: Wallet },
];

const tutorNav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  {
    href: "/tutor/manage",
    label: "My teaching profile",
    icon: GraduationCap,
  },
  {
    href: "/tutor/onboarding",
    label: "Verification",
    icon: ShieldCheck,
  },
  { href: "/requests", label: "Requests", icon: Users },
  { href: "/lessons", label: "Lessons", icon: CalendarDays },
  {
    href: "/progress",
    label: "Progress reports",
    icon: ChartNoAxesColumn,
  },
  { href: "/earnings", label: "Earnings & payouts", icon: Wallet },
];

const adminNav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin", label: "Review centre", icon: ClipboardCheck },
  {
    href: "/safeguarding",
    label: "Safety & reports",
    icon: HeartHandshake,
  },
];

function isActivePath(path: string, href: string) {
  if (href === "/dashboard") {
    return path === href;
  }

  return path === href || path.startsWith(`${href}/`);
}

function getRoleLabel(role: string) {
  return role
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getInitials(firstName?: string, lastName?: string) {
  return `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`.toUpperCase();
}

export function AppShell({
  children,
  title,
  description,
}: {
  children: ReactNode;
  title: string;
  description?: string;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const path = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(path)}`);
    }
  }, [loading, user, router, path]);

  useEffect(() => {
    setMobileOpen(false);
  }, [path]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#F7F9FC]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#1769D2]/20 border-t-[#1769D2]" />
          <p className="text-xs font-medium text-[#8290A4]">
            Preparing your workspace...
          </p>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  const items = isAdmin
    ? adminNav
    : user.role === "TUTOR"
      ? tutorNav
      : learnerNav;

  const initials = getInitials(user.first_name, user.last_name);
  const fullName = `${user.first_name} ${user.last_name}`.trim();
  const roleLabel = getRoleLabel(user.role);

  const showSafetyLink = !isAdmin;

  const handleSignOut = async () => {
    if (signingOut) return;

    setSigningOut(true);

    try {
      await signOut();
      setMobileOpen(false);
      router.replace("/");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not log out");
      setSigningOut(false);
    }
  };

  const navLinkClass = (href: string) => {
    const active = isActivePath(path, href);

    return [
      "group relative flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5",
      "text-[13px] font-semibold transition-all duration-200",
      active
        ? "bg-[#EDF4FF] text-[#1769D2]"
        : "text-[#66758A] hover:bg-[#F6F8FB] hover:text-[#102A56]",
    ].join(" ");
  };

  const renderNavigation = () => (
    <nav className="space-y-1" aria-label="Main navigation">
      {items.map((item) => {
        const active = isActivePath(path, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            aria-current={active ? "page" : undefined}
            className={navLinkClass(item.href)}
          >
            {active && (
              <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#1769D2]" />
            )}

            <Icon
              size={18}
              strokeWidth={active ? 2.2 : 1.8}
              className="shrink-0"
            />

            <span className="flex-1">{item.label}</span>

            {active && <ChevronRight size={15} className="text-[#1769D2]/60" />}
          </Link>
        );
      })}
    </nav>
  );

  const renderAccountNavigation = () => (
    <nav className="space-y-1" aria-label="Account navigation">
      <Link
        href="/settings"
        onClick={() => setMobileOpen(false)}
        aria-current={path === "/settings" ? "page" : undefined}
        className={navLinkClass("/settings")}
      >
        <Settings size={18} strokeWidth={1.8} />
        <span>Settings</span>
      </Link>

      {showSafetyLink && (
        <Link
          href="/safeguarding"
          onClick={() => setMobileOpen(false)}
          aria-current={
            isActivePath(path, "/safeguarding") ? "page" : undefined
          }
          className={navLinkClass("/safeguarding")}
        >
          <HeartHandshake size={18} strokeWidth={1.8} />
          <span>Help & safety</span>
        </Link>
      )}
    </nav>
  );

  const renderUserIdentity = () => (
    <div className="flex min-w-0 items-center gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#E9F2FF] text-sm font-bold text-[#1769D2] ring-4 ring-[#F7F9FC]">
        {initials || "U"}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-[#102A56]">
          {fullName || "Tutova user"}
        </p>
        <p className="mt-0.5 truncate text-[11px] font-medium text-[#8A96A8]">
          {roleLabel}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[250px] flex-col border-r border-[#E7EBF2] bg-white lg:flex">
        {/* Brand */}
        <div className="flex h-[76px] shrink-0 items-center border-b border-[#EDF0F5] px-6">
          <Brand />
        </div>

        {/* Sidebar navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-7">
          {renderNavigation()}

          <div className="my-7 border-t border-[#EDF0F5]" />

          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#98A3B4]">
            Account
          </p>

          {renderAccountNavigation()}
        </div>

        {/* User account footer */}
        <div className="shrink-0 border-t border-[#EDF0F5] p-4">
          <div className="rounded-2xl bg-[#F7F9FC] p-3">
            {renderUserIdentity()}

            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#E8EDF3] bg-white px-3 py-2.5 text-xs font-semibold text-[#758298] transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut size={15} />
              {signingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="min-h-screen lg:pl-[250px]">
        {/* Mobile-only header */}
        <header className="sticky top-0 z-20 border-b border-[#E7EBF2] bg-white/95 backdrop-blur-xl lg:hidden">
          <div className="flex h-[68px] items-center px-4 sm:px-7">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((open) => !open)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#52647C] transition-colors hover:bg-[#F6F8FB]"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <Brand />
            </div>
          </div>

          {/* Mobile navigation */}
          {mobileOpen && (
            <div className="border-t border-[#EDF0F5] bg-white px-4 pb-5 pt-4 shadow-lg">
              <div className="mb-5 rounded-2xl border border-[#E8EDF3] bg-[#F8FAFC] p-3">
                {renderUserIdentity()}
              </div>

              {renderNavigation()}

              <div className="my-5 border-t border-[#EDF0F5]" />

              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#98A3B4]">
                Account
              </p>

              {renderAccountNavigation()}

              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="mt-4 flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                <LogOut size={18} />
                {signingOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-7 sm:py-9 xl:px-10">
          <div className="mb-7 sm:mb-8">
            <h1 className="page-heading">{title}</h1>

            {description && (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#758298]">
                {description}
              </p>
            )}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
