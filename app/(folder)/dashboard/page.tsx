"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Clock3,
  GraduationCap,
  Search,
  Wallet,
  BookOpen,
  Users,
  UserPlus,
  Pencil,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import type { Booking, TutoringRequest } from "@/lib/types";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";

type NotificationSummary = {
  unread_count?: number;
};

type ChildLearner = {
  id: string;
  parent_profile_id: string | null;
  user_id: string | null;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
};

function formatDate(date: string) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getStatusStyle(status: string) {
  const normalized = status.toUpperCase();

  if (["CONFIRMED", "COMPLETED", "APPROVED"].includes(normalized)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (["CANCELLED", "REJECTED", "FAILED"].includes(normalized)) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (["PENDING", "REQUESTED"].includes(normalized)) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

export default function DashboardPage() {
  const { user } = useAuth();

  const [requests, setRequests] = useState<TutoringRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [children, setChildren] = useState<ChildLearner[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [childrenLoading, setChildrenLoading] = useState(false);

  const isTutor = user?.role === "TUTOR";
  const isAdultLearner = user?.role === "ADULT_LEARNER";
  const isParent = user?.role === "PARENT";

  const description = isTutor
    ? "Keep track of your teaching opportunities and upcoming sessions."
    : isAdultLearner
      ? "Stay on top of your learning goals, lessons and tutoring activities."
      : "Stay connected with your children's learning and tutoring activities.";

  const requestLabel = isTutor
    ? "Matching requests"
    : isAdultLearner
      ? "Learning requests"
      : "Children's requests";

  const emptyBookingMessage = isTutor
    ? "Your scheduled teaching sessions will appear here."
    : isAdultLearner
      ? "Your upcoming learning sessions will appear here."
      : "Your children's scheduled learning sessions will appear here.";

  useEffect(() => {
    if (!user) return;

    let active = true;

    async function loadDashboard() {
      setLoading(true);

      if (isParent) {
        setChildrenLoading(true);
      }

      const dashboardRequests = [
        api<TutoringRequest[]>(
          isTutor ? "/tutoring-requests/matching" : "/tutoring-requests/mine",
        ),
        api<Booking[]>("/session-bookings/mine?limit=10"),
        api<NotificationSummary>("/notifications?limit=1"),
      ];

      const results = await Promise.allSettled(dashboardRequests);

      if (!active) return;

      if (results[0].status === "fulfilled") {
        setRequests(results[0].value);
      }

      if (results[1].status === "fulfilled") {
        setBookings(results[1].value);
      }

      if (results[2].status === "fulfilled") {
        setUnread(results[2].value.unread_count || 0);
      }

      if (results.every((result) => result.status === "rejected")) {
        toast.error("Dashboard information could not be loaded.");
      } else if (results.some((result) => result.status === "rejected")) {
        toast.error("Some dashboard information could not be loaded.");
      }

      setLoading(false);

      if (isParent) {
        try {
          const parentChildren = await api<ChildLearner[]>("/parents/learners");

          if (active) {
            setChildren(parentChildren);
          }
        } catch {
          if (active) {
            toast.error("Your children could not be loaded.");
          }
        } finally {
          if (active) {
            setChildrenLoading(false);
          }
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [user, isTutor, isParent]);

  const primaryAction = isTutor
    ? {
        label: "Complete tutor profile",
        href: "/tutor/onboarding",
        icon: GraduationCap,
      }
    : {
        label: isAdultLearner ? "Find a tutor" : "Find learning support",
        href: "/requests",
        icon: Search,
      };

  const PrimaryIcon = primaryAction.icon;

  return (
    <AppShell
      title={`Welcome, ${user?.first_name || "there"}`}
      description={description}
    >
      <div className="mx-auto w-full max-w-7xl space-y-6 pb-8">
        {/* Welcome panel */}
        <section className="relative isolate overflow-hidden rounded-2xl bg-[#102A56] px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">
          <div className="pointer-events-none absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full bg-[#1769D2]/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-1/4 -z-10 h-56 w-56 rounded-full bg-[#00A99A]/20 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-blue-100">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00D3B5]" />
                Your Tutova workspace
              </div>

              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {isTutor
                  ? "Make every lesson count."
                  : isAdultLearner
                    ? "Keep growing at your pace."
                    : "Support every step of their learning."}
              </h2>

              <p className="mt-2 max-w-lg text-sm leading-6 text-blue-100/85">
                {isTutor
                  ? "Explore tutoring opportunities, manage your profile and stay prepared for your upcoming sessions."
                  : isAdultLearner
                    ? "Discover learning opportunities, organise your lessons and keep your progress moving forward."
                    : "Find the right learning support, keep track of lessons and manage your children's tutoring activities."}
              </p>
            </div>

            <Button
              asChild
              className="h-11 shrink-0 bg-white px-5 font-semibold text-[#102A56] shadow-sm hover:bg-blue-50"
            >
              <Link href={primaryAction.href}>
                <PrimaryIcon className="mr-2 h-4 w-4" />
                {primaryAction.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Parent: My Children */}
        {isParent && (
          <section>
            <Card className="border-slate-200/80 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base font-bold text-[#102A56]">
                    <Users className="h-5 w-5 text-[#1769D2]" />
                    My Children
                  </CardTitle>
                  <p className="mt-1 text-sm text-slate-500">
                    Manage the learner profiles linked to your account.
                  </p>
                </div>

                <Button
                  asChild
                  size="sm"
                  className="shrink-0 bg-[#1769D2] hover:bg-[#1258B5]"
                >
                  <Link href="/children">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add child
                  </Link>
                </Button>
              </CardHeader>

              <CardContent>
                {childrenLoading ? (
                  <div className="space-y-3 py-2">
                    {[1, 2].map((item) => (
                      <div
                        key={item}
                        className="flex animate-pulse items-center gap-3 rounded-xl border border-slate-100 p-3"
                      >
                        <div className="h-10 w-10 rounded-full bg-slate-100" />
                        <div className="space-y-2">
                          <div className="h-3 w-32 rounded bg-slate-100" />
                          <div className="h-2.5 w-20 rounded bg-slate-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : children.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {children.slice(0, 6).map((child) => (
                        <div
                          key={child.id}
                          className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#1769D2]">
                            {child.first_name.charAt(0).toUpperCase()}
                            {child.last_name.charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {child.first_name} {child.last_name}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              Learner profile
                            </p>
                          </div>

                          <Link
                            href="/children"
                            aria-label={`Manage ${child.first_name}'s profile`}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-[#1769D2]"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-slate-500">
                        {children.length}{" "}
                        {children.length === 1 ? "learner" : "learners"}{" "}
                        registered
                      </p>

                      <Link
                        href="/children"
                        className="inline-flex items-center text-sm font-semibold text-[#1769D2] hover:text-[#1258B5]"
                      >
                        Manage children
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1769D2]">
                      <Users className="h-6 w-6" />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-slate-800">
                      No learner profiles yet
                    </p>

                    <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                      Add your child's profile to help organise their tutoring
                      requests, lessons and learning activities.
                    </p>

                    <Button
                      asChild
                      size="sm"
                      className="mt-4 bg-[#1769D2] hover:bg-[#1258B5]"
                    >
                      <Link href="/children">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add your first child
                      </Link>
                    </Button>
                  </div>
                )}

                {!childrenLoading && children.length > 6 && (
                  <p className="mt-3 text-xs text-slate-500">
                    Showing 6 of {children.length} learner profiles.
                  </p>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Statistics */}
        <section>
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#102A56]">Overview</h2>
            <p className="mt-1 text-sm text-slate-500">
              A quick look at your activity.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Card className="border-slate-200/80 shadow-sm">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {requestLabel}
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-[#102A56]">
                    {loading ? "—" : requests.length}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {isTutor ? "Opportunities available" : "Submitted requests"}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#1769D2]">
                  <BookOpen className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 shadow-sm">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm font-medium text-slate-500">Bookings</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-[#102A56]">
                    {loading ? "—" : bookings.length}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {isTutor ? "Scheduled sessions" : "Learning sessions"}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-[#00A99A]">
                  <CalendarDays className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 shadow-sm sm:col-span-2 xl:col-span-1">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Unread notifications
                  </p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-[#102A56]">
                    {loading ? "—" : unread}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Updates and reminders
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Bell className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Main content */}
        <div className="grid items-start gap-5 xl:grid-cols-[0.85fr_1.15fr]">
          {/* Quick actions */}
          <Card className="border-slate-200/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-[#102A56]">
                Quick actions
              </CardTitle>
              <p className="text-sm text-slate-500">
                Shortcuts to the things you use most.
              </p>
            </CardHeader>

            <CardContent className="space-y-2">
              {isTutor ? (
                <>
                  <Link
                    href="/tutor/onboarding"
                    className="group flex items-center justify-between rounded-xl border border-slate-200 p-3.5 transition hover:border-blue-200 hover:bg-blue-50/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#1769D2]">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Manage tutor profile
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Update your teaching information
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#1769D2]" />
                  </Link>

                  <Link
                    href="/requests"
                    className="group flex items-center justify-between rounded-xl border border-slate-200 p-3.5 transition hover:border-blue-200 hover:bg-blue-50/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-[#009B8D]">
                        <Search className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Matching requests
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Explore suitable tutoring requests
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#1769D2]" />
                  </Link>

                  <Link
                    href="/earnings"
                    className="group flex items-center justify-between rounded-xl border border-slate-200 p-3.5 transition hover:border-blue-200 hover:bg-blue-50/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                        <Wallet className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Earnings & payouts
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Review your earnings activity
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#1769D2]" />
                  </Link>
                </>
              ) : (
                <>
                  {isParent && (
                    <Link
                      href="/children"
                      className="group flex items-center justify-between rounded-xl border border-slate-200 p-3.5 transition hover:border-blue-200 hover:bg-blue-50/60"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-[#009B8D]">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            Manage children
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            Add or update learner profiles
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#1769D2]" />
                    </Link>
                  )}

                  <Link
                    href="/requests"
                    className="group flex items-center justify-between rounded-xl border border-slate-200 p-3.5 transition hover:border-blue-200 hover:bg-blue-50/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#1769D2]">
                        <Search className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {isAdultLearner
                            ? "Find a tutor"
                            : "Find learning support"}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {isAdultLearner
                            ? "Explore tutors for your learning goals"
                            : "Explore tutoring for your children"}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#1769D2]" />
                  </Link>

                  <Link
                    href="/lessons"
                    className="group flex items-center justify-between rounded-xl border border-slate-200 p-3.5 transition hover:border-blue-200 hover:bg-blue-50/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-[#009B8D]">
                        <CalendarDays className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {isAdultLearner ? "My lessons" : "Children's lessons"}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Review your scheduled sessions
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#1769D2]" />
                  </Link>

                  <Link
                    href="/payments"
                    className="group flex items-center justify-between rounded-xl border border-slate-200 p-3.5 transition hover:border-blue-200 hover:bg-blue-50/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                        <Wallet className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Payment centre
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Manage your learning payments
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#1769D2]" />
                  </Link>
                </>
              )}
            </CardContent>
          </Card>

          {/* Recent bookings */}
          <Card className="border-slate-200/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base font-bold text-[#102A56]">
                  Recent bookings
                </CardTitle>
                <p className="mt-1 text-sm text-slate-500">
                  Your latest scheduled sessions.
                </p>
              </div>

              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-[#1769D2] hover:bg-blue-50"
              >
                <Link href="/lessons">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="space-y-3 py-2">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="flex animate-pulse items-center justify-between gap-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-100" />
                        <div className="space-y-2">
                          <div className="h-3 w-32 rounded bg-slate-100" />
                          <div className="h-2.5 w-20 rounded bg-slate-100" />
                        </div>
                      </div>
                      <div className="h-6 w-16 rounded-full bg-slate-100" />
                    </div>
                  ))}
                </div>
              ) : bookings.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {bookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between gap-3 py-4 first:pt-2 last:pb-2"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1769D2]">
                          <CalendarDays className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {formatDate(booking.start_at)}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock3 className="h-3.5 w-3.5" />
                            {booking.duration_minutes} minutes
                          </p>
                        </div>
                      </div>

                      <Badge
                        variant="outline"
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusStyle(booking.status)}`}
                      >
                        {formatStatus(booking.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center px-4 py-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <CalendarDays className="h-6 w-6" />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    No bookings yet
                  </p>

                  <p className="mt-1 max-w-xs text-sm leading-6 text-slate-500">
                    {emptyBookingMessage}
                  </p>

                  {!isTutor && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="mt-4 border-blue-200 text-[#1769D2] hover:bg-blue-50"
                    >
                      <Link href="/requests">
                        Explore tutoring
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
