"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode, ElementType } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Languages,
  MapPin,
  Monitor,
  Users,
  Video,
} from "lucide-react";

import { api } from "@/lib/api";
import { useAuth } from "@/components/providers";

interface PublicSubject {
  id: string;
  name: string;
  slug: string;
}

interface PublicLocation {
  id: string;
  name: string;
  slug: string;
  location_type: string;
}

interface PublicTutor {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  bio: string | null;
  qualifications: string | null;
  years_of_experience: number;
  hourly_rate: number | null;
  teaching_languages: string[];
  learner_age_groups: string[];
  tutoring_modes: string[];
  profile_picture_url: string | null;
  service_area: string | null;
  subjects: PublicSubject[];
  locations: PublicLocation[];
  introduction_video_url: string | null;
}

const modeLabels: Record<string, string> = {
  ONLINE: "Online lessons",
  IN_PERSON: "In-person lessons",
  HYBRID: "Online and in-person",
};

const ageGroupLabels: Record<string, string> = {
  PRIMARY: "Primary school learners",
  SECONDARY: "Secondary school learners",
  ADULT: "Adult learners",
};

function formatCurrency(value: number | null) {
  if (value === null || value === undefined) {
    return "Rate available on request";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function DetailSection({
  icon: Icon,
  title,
  children,
}: {
  icon: ElementType;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1769D2]">
          <Icon size={19} />
        </div>

        <h2 className="text-lg font-bold text-[#102A56]">{title}</h2>
      </div>

      {children}
    </section>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-7 text-slate-500">{children}</p>;
}

export default function TutorDetailsPage() {
  const params = useParams<{ id: string }>();
  const tutorId = params.id;

  const { user } = useAuth();

  const [tutor, setTutor] = useState<PublicTutor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tutorId) return;

    let active = true;

    async function loadTutor() {
      try {
        setLoading(true);
        setError("");

        const result = await api<PublicTutor>(
          `/tutors/${encodeURIComponent(tutorId)}`,
          {
            method: "GET",
          },
        );

        if (active) {
          setTutor(result);
        }
      } catch (err) {
        console.error("Failed to load tutor profile:", err);

        if (active) {
          setError(
            "We couldn't load this tutor's profile. The tutor may not exist or may no longer be available.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadTutor();

    return () => {
      active = false;
    };
  }, [tutorId]);

  const tutorName = useMemo(() => {
    if (!tutor) return "";

    return (
      tutor.full_name?.trim() || `${tutor.first_name} ${tutor.last_name}`.trim()
    );
  }, [tutor]);

  const locations = useMemo(() => {
    if (!tutor) return [];

    return Array.from(
      new Map(
        tutor.locations.map((location) => [location.id, location]),
      ).values(),
    );
  }, [tutor]);

  /*
   * Preserve the selected tutor through the request journey.
   *
   * The request page will read tutor_id from the query string.
   * Unauthenticated visitors go through login first.
   */
  const requestPath = tutor
    ? `/requests?tutor_id=${encodeURIComponent(tutor.id)}`
    : "/requests";

  const canSubmitTutoringRequest =
    user?.role === "PARENT" || user?.role === "ADULT_LEARNER";

  const requestHref = !user
    ? `/login?next=${encodeURIComponent(requestPath)}`
    : canSubmitTutoringRequest
      ? requestPath
      : null;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F9FC]">
        <div className="mx-auto max-w-7xl animate-pulse px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8 h-5 w-36 rounded bg-slate-200" />

          <div className="h-[340px] rounded-3xl bg-slate-200" />

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="space-y-6">
              <div className="h-52 rounded-2xl bg-slate-200" />
              <div className="h-52 rounded-2xl bg-slate-200" />
            </div>

            <div className="h-72 rounded-2xl bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !tutor) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#F7F9FC] px-4">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <Users size={25} />
          </div>

          <h1 className="text-xl font-bold text-[#102A56]">
            Tutor profile unavailable
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-500">
            {error || "We couldn't find this tutor."}
          </p>

          <Link
            href="/discover"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1769D2] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#102A56]"
          >
            <ArrowLeft size={16} />
            Explore tutors
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F9FC] pb-16">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-7 flex items-center gap-2 text-sm">
          <Link
            href="/discover"
            className="font-medium text-slate-500 transition hover:text-[#1769D2]"
          >
            Discover tutors
          </Link>

          <span className="text-slate-300">/</span>

          <span className="font-semibold text-[#102A56]">Tutor profile</span>
        </div>

        {/* Profile hero */}
        <section className="relative isolate overflow-hidden rounded-3xl bg-[#102A56] shadow-xl">
          {tutor.profile_picture_url ? (
            <div
              className="absolute inset-0 -z-20 bg-cover bg-center"
              style={{
                backgroundImage: `url("${tutor.profile_picture_url}")`,
              }}
            />
          ) : (
            <div className="absolute inset-0 -z-20 bg-gradient-to-br from-[#1769D2] via-[#102A56] to-[#071A37]" />
          )}

          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#071A37]/95 via-[#102A56]/80 to-[#102A56]/35" />

          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#071A37]/75 via-transparent to-transparent" />

          <div className="flex min-h-[390px] flex-col justify-end p-6 sm:p-10 lg:min-h-[440px] lg:p-12">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                <GraduationCap size={15} />
                Tutor profile
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {tutorName}
              </h1>

              {tutor.qualifications && (
                <p className="mt-3 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
                  {tutor.qualifications}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/90">
                <span className="inline-flex items-center gap-2">
                  <Clock3 size={17} />
                  {tutor.years_of_experience}{" "}
                  {tutor.years_of_experience === 1 ? "year" : "years"}{" "}
                  experience
                </span>

                {locations.length > 0 && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin size={17} />

                    {locations.map((location) => location.name).join(", ")}
                  </span>
                )}
              </div>

              {tutor.subjects.length > 0 && (
                <div className="mt-7 flex flex-wrap gap-2">
                  {tutor.subjects.slice(0, 5).map((subject) => (
                    <span
                      key={subject.id}
                      className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm"
                    >
                      {subject.name}
                    </span>
                  ))}

                  {tutor.subjects.length > 5 && (
                    <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
                      +{tutor.subjects.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Main content */}
        <div className="mt-8 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_350px]">
          <div className="space-y-7">
            {/* About */}
            <DetailSection icon={Users} title="About the tutor">
              {tutor.bio ? (
                <p className="whitespace-pre-line text-sm leading-8 text-slate-600">
                  {tutor.bio}
                </p>
              ) : (
                <EmptyState>
                  This tutor has not added a biography yet.
                </EmptyState>
              )}
            </DetailSection>

            {/* Introduction video */}
            {tutor.introduction_video_url && (
              <DetailSection icon={Video} title="Meet your tutor">
                <p className="mb-5 text-sm leading-7 text-slate-500">
                  Get to know this tutor through their introduction video.
                </p>

                <div className="overflow-hidden rounded-2xl bg-black">
                  <video
                    controls
                    playsInline
                    preload="metadata"
                    className="max-h-[480px] w-full"
                    src={tutor.introduction_video_url}
                  >
                    Your browser does not support video playback.
                  </video>
                </div>
              </DetailSection>
            )}

            {/* Subjects */}
            <DetailSection icon={BookOpen} title="Subjects and learning areas">
              {tutor.subjects.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {tutor.subjects.map((subject) => (
                    <span
                      key={subject.id}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
                    >
                      <BookOpen size={15} className="text-[#1769D2]" />
                      {subject.name}
                    </span>
                  ))}
                </div>
              ) : (
                <EmptyState>
                  No subjects have been added to this profile yet.
                </EmptyState>
              )}
            </DetailSection>

            {/* Teaching preferences */}
            <DetailSection icon={Monitor} title="Teaching preferences">
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-[#102A56]">
                    Teaching modes
                  </h3>

                  {tutor.tutoring_modes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {tutor.tutoring_modes.map((mode) => (
                        <span
                          key={mode}
                          className="rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-medium text-[#1769D2]"
                        >
                          {modeLabels[mode] || mode.replaceAll("_", " ")}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <EmptyState>No teaching modes listed.</EmptyState>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-5">
                  <h3 className="mb-3 text-sm font-semibold text-[#102A56]">
                    Suitable learners
                  </h3>

                  {tutor.learner_age_groups.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {tutor.learner_age_groups.map((group) => (
                        <span
                          key={group}
                          className="rounded-xl bg-teal-50 px-4 py-2.5 text-sm font-medium text-teal-700"
                        >
                          {ageGroupLabels[group] || group.replaceAll("_", " ")}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <EmptyState>No learner groups listed.</EmptyState>
                  )}
                </div>
              </div>
            </DetailSection>

            {/* Languages */}
            <DetailSection icon={Languages} title="Teaching languages">
              {tutor.teaching_languages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tutor.teaching_languages.map((language) => (
                    <span
                      key={language}
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              ) : (
                <EmptyState>No teaching languages listed.</EmptyState>
              )}
            </DetailSection>

            {/* Location */}
            <DetailSection icon={MapPin} title="Teaching locations">
              {locations.length > 0 || tutor.service_area ? (
                <div className="space-y-3">
                  {locations.map((location) => (
                    <div
                      key={location.id}
                      className="flex items-center gap-3 text-sm text-slate-600"
                    >
                      <MapPin size={16} className="shrink-0 text-[#1769D2]" />

                      <span>
                        {location.name}

                        <span className="ml-2 text-xs text-slate-400">
                          {location.location_type.replaceAll("_", " ")}
                        </span>
                      </span>
                    </div>
                  ))}

                  {tutor.service_area && (
                    <div className="border-t border-slate-100 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Additional service area
                      </p>

                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {tutor.service_area}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState>
                  No teaching locations have been specified.
                </EmptyState>
              )}
            </DetailSection>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-8">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-6">
                <p className="text-sm font-medium text-slate-500">
                  Tutor's hourly rate
                </p>

                <div className="mt-2 flex flex-wrap items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-[#102A56]">
                    {formatCurrency(tutor.hourly_rate)}
                  </span>

                  {tutor.hourly_rate !== null && (
                    <span className="text-sm text-slate-400">/ hour</span>
                  )}
                </div>

                <p className="mt-3 text-xs leading-6 text-slate-500">
                  Discuss lesson arrangements and confirm the final terms before
                  starting.
                </p>
              </div>

              <div className="space-y-4 p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1769D2]">
                    <Clock3 size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#102A56]">
                      Experience
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {tutor.years_of_experience}{" "}
                      {tutor.years_of_experience === 1 ? "year" : "years"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                    <BookOpen size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#102A56]">
                      Learning areas
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {tutor.subjects.length}{" "}
                      {tutor.subjects.length === 1 ? "subject" : "subjects"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                    <Languages size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#102A56]">
                      Languages
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {tutor.teaching_languages.length > 0
                        ? tutor.teaching_languages.join(", ")
                        : "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Request tutoring */}
              <div className="border-t border-slate-100 p-6">
                {requestHref ? (
                  <>
                    <Link
                      href={requestHref}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1769D2] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#102A56]"
                    >
                      {user
                        ? "Request tutoring"
                        : "Sign in to request tutoring"}
                      <ArrowRight size={17} />
                    </Link>

                    <p className="mt-3 text-center text-xs leading-5 text-slate-400">
                      {user
                        ? "Continue to complete your tutoring request."
                        : "Sign in or create an account to continue with this tutor."}
                    </p>
                  </>
                ) : (
                  <p className="rounded-xl bg-slate-50 p-4 text-center text-sm leading-6 text-slate-600">
                    Tutoring requests can be submitted by parents and adult
                    learners.
                  </p>
                )}
              </div>
            </section>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
              <div className="flex items-center gap-2 text-[#102A56]">
                <CheckCircle2 size={18} className="text-[#1769D2]" />

                <h3 className="text-sm font-bold">
                  A safer learning experience
                </h3>
              </div>

              <p className="mt-2 text-xs leading-6 text-slate-600">
                Tutova is designed to support a more structured tutoring
                experience for learners, parents and tutors.
              </p>
            </div>
          </aside>
        </div>

        {/* Back link */}
        <div className="mt-10">
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1769D2] transition hover:text-[#102A56]"
          >
            <ArrowLeft size={17} />
            Back to discover tutors
          </Link>
        </div>
      </div>
    </main>
  );
}
