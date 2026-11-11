"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { api } from "@/lib/api";
import type { Subject } from "@/lib/types";

import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  Laptop,
  MapPin,
  Monitor,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Users,
  UserRound,
  Video,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface PublicTutor {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  profile_picture_url?: string | null;
  bio: string | null;
  qualifications: string | null;
  years_of_experience: number;
  hourly_rate: number | string | null;
  teaching_languages: string[];
  learner_age_groups: string[];
  tutoring_modes: ("ONLINE" | "IN_PERSON" | "HYBRID")[];
  service_area: string | null;
  subjects: {
    id: string;
    name: string;
    slug: string;
  }[];
  locations: {
    id: string;
    name: string;
    slug: string;
    location_type: string;
  }[];
  introduction_video_url?: string | null;
}

interface PublicTutorsResponse {
  items: PublicTutor[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getTutorName(tutor: PublicTutor) {
  return (
    tutor.full_name ||
    `${tutor.first_name ?? ""} ${tutor.last_name ?? ""}`.trim() ||
    "Tutova Tutor"
  );
}

function getTutorInitials(tutor: PublicTutor) {
  return getTutorName(tutor)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function formatRate(rate: number | string | null) {
  if (rate === null || rate === undefined || rate === "") {
    return "Rate not specified";
  }

  const amount = Number(rate);

  if (!Number.isFinite(amount)) {
    return String(rate);
  }

  return `₦${amount.toLocaleString("en-NG")}`;
}

function getTutorModes(modes: PublicTutor["tutoring_modes"]) {
  if (!modes?.length) return "Teaching mode not specified";

  return modes
    .map((mode) => {
      switch (mode) {
        case "ONLINE":
          return "Online";
        case "IN_PERSON":
          return "In-person";
        case "HYBRID":
          return "Hybrid";
        default:
          return mode;
      }
    })
    .join(" & ");
}

function getTutorLocation(tutor: PublicTutor) {
  const locationNames = tutor.locations
    ?.map((location) => location.name)
    .filter(Boolean);

  if (locationNames?.length) {
    return locationNames.join(", ");
  }

  return tutor.service_area || "Location not specified";
}

function getTutorSubjects(tutor: PublicTutor) {
  return (
    tutor.subjects?.map((subject) => subject.name).join(", ") ||
    "Learning areas not specified"
  );
}

/* -------------------------------------------------------------------------- */
/* Tutor card                                                                 */
/* -------------------------------------------------------------------------- */

function FeaturedTutorCard({ tutor }: { tutor: PublicTutor }) {
  const [imageFailed, setImageFailed] = useState(false);

  const name = getTutorName(tutor);
  const imageUrl = tutor.profile_picture_url;
  const hasImage = Boolean(imageUrl && !imageFailed);
  const hasVideo = Boolean(tutor.introduction_video_url);

  const experience = tutor.years_of_experience ?? 0;

  return (
    <article className="group relative isolate min-h-[510px] overflow-hidden rounded-[26px] bg-[#102A56] shadow-[0_12px_35px_rgba(16,42,86,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(16,42,86,0.18)]">
      {/* Profile picture background */}
      {hasImage ? (
        <img
          src={imageUrl!}
          alt={`${name}'s profile`}
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="absolute inset-0 h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1769D2] via-[#174B82] to-[#102A56]">
          <div className="flex h-36 w-36 items-center justify-center rounded-full border border-white/30 bg-white/10 text-5xl font-bold text-white shadow-2xl backdrop-blur-sm">
            {getTutorInitials(tutor)}
          </div>
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/10" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full border border-white/10" />
        </div>
      )}

      {/* Image overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#071A35]/50 via-transparent to-[#071A35]/95" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#071A35]/75 via-transparent to-transparent opacity-90" />

      {/* Top labels */}
      <div className="absolute left-5 right-5 top-5 z-10 flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#102A56]/55 px-3.5 py-2 text-xs font-semibold text-white shadow-sm backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-[#53D8C4]" />
          Tutova tutor
        </span>

        {hasVideo && (
          <a
            href={tutor.introduction_video_url!}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Watch ${name}'s introduction video`}
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/95 px-3.5 py-2 text-xs font-bold text-[#102A56] shadow-lg transition hover:bg-[#EAF4FD]"
          >
            <PlayCircle className="h-4 w-4 text-[#0077E6]" />
            Watch introduction
          </a>
        )}
      </div>

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-6 text-white sm:p-7">
        <div className="mb-4 flex flex-wrap gap-2">
          {(tutor.tutoring_modes ?? []).slice(0, 2).map((mode) => (
            <span
              key={mode}
              className="rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md"
            >
              {mode === "IN_PERSON"
                ? "In-person"
                : mode === "ONLINE"
                  ? "Online"
                  : "Hybrid"}
            </span>
          ))}
        </div>

        <h3 className="text-2xl font-bold tracking-tight text-white">{name}</h3>

        <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-blue-100">
          {getTutorSubjects(tutor)}
        </p>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/75">
          {tutor.qualifications ||
            tutor.bio ||
            "Explore this tutor's profile to learn more about their teaching experience."}
        </p>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/20 pt-4 text-xs text-white/80">
          <span className="inline-flex min-w-0 items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-[#6CE0D2]" />
            <span className="line-clamp-1">{getTutorLocation(tutor)}</span>
          </span>

          <span className="inline-flex items-center gap-2">
            <Clock3 className="h-4 w-4 shrink-0 text-[#6CE0D2]" />
            {experience} {experience === 1 ? "year" : "years"} experience
          </span>
        </div>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-white/60">Hourly rate</p>
            <p className="mt-1 text-xl font-bold text-white">
              {formatRate(tutor.hourly_rate)}
            </p>
          </div>

          <Link
            href={`/tutor/${encodeURIComponent(tutor.id)}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#102A56] transition hover:bg-[#DDF7F2]"
          >
            View profile
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Reusable section heading                                                   */
/* -------------------------------------------------------------------------- */

function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.19em] text-[#0077E6]">
        {eyebrow}
      </p>

      <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#102A56] sm:text-4xl">
        {title}
      </h2>

      <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
        {description}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Static explanatory content                                                */
/* -------------------------------------------------------------------------- */

const steps = [
  {
    number: "01",
    title: "Tell us what you want to learn",
    description:
      "Choose a subject, learning level and the kind of support you need.",
    icon: BookOpen,
  },
  {
    number: "02",
    title: "Find a suitable tutor",
    description:
      "Explore tutor profiles and compare their experience, teaching approach and availability.",
    icon: UserRound,
  },
  {
    number: "03",
    title: "Arrange your lessons",
    description:
      "Send a request and work out the lesson arrangements with your selected tutor.",
    icon: Video,
  },
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Tutor verification",
    description:
      "We use a review process to help establish tutor identity and profile credibility.",
  },
  {
    icon: Users,
    title: "Learning that fits",
    description:
      "Find tutors based on your subject, learning needs and preferred arrangement.",
  },
  {
    icon: Monitor,
    title: "Flexible lesson options",
    description:
      "Explore online and in-person tutoring options, depending on tutor availability.",
  },
];

/* -------------------------------------------------------------------------- */
/* Homepage                                                                   */
/* -------------------------------------------------------------------------- */

export default function HomePage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [featuredTutors, setFeaturedTutors] = useState<PublicTutor[]>([]);

  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [tutorsLoading, setTutorsLoading] = useState(true);

  const [subjectsError, setSubjectsError] = useState(false);
  const [tutorsError, setTutorsError] = useState(false);
  const [subjectPage, setSubjectPage] = useState(1);

  const SUBJECTS_PER_PAGE = 6;

  const totalSubjectPages = Math.ceil(subjects.length / SUBJECTS_PER_PAGE);

  const paginatedSubjects = subjects.slice(
    (subjectPage - 1) * SUBJECTS_PER_PAGE,
    subjectPage * SUBJECTS_PER_PAGE,
  );

  useEffect(() => {
    let active = true;

    async function loadSubjects() {
      try {
        setSubjectsLoading(true);
        setSubjectsError(false);

        const response = await api<Subject[]>("/subjects", {}, { auth: false });

        if (active) {
          setSubjects(response ?? []);
        }
      } catch (error) {
        console.error("Failed to load subjects:", error);

        if (active) {
          setSubjectsError(true);
        }
      } finally {
        if (active) {
          setSubjectsLoading(false);
        }
      }
    }

    async function loadFeaturedTutors() {
      try {
        setTutorsLoading(true);
        setTutorsError(false);

        const response = await api<PublicTutorsResponse>(
          "/tutors?page=1&per_page=3",
          {},
          { auth: false },
        );

        if (active) {
          setFeaturedTutors(response?.items ?? []);
        }
      } catch (error) {
        console.error("Failed to load featured tutors:", error);

        if (active) {
          setTutorsError(true);
        }
      } finally {
        if (active) {
          setTutorsLoading(false);
        }
      }
    }

    loadSubjects();
    loadFeaturedTutors();

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <main className="min-h-screen overflow-hidden bg-white text-[#102A56]">
        {/* HERO */}
        <section className="relative isolate overflow-hidden bg-[#F4F8FB]">
          <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#DCEEFF] opacity-70 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-48 -left-40 h-[420px] w-[420px] rounded-full bg-[#DDF7F2] opacity-70 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:px-10 lg:py-24">
            <div className="max-w-2xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#D8E8F7] bg-white/80 px-4 py-2 text-sm font-medium text-[#24527E] shadow-sm">
                <Sparkles className="h-4 w-4 text-[#00AFA0]" />
                Learning support that moves you forward
              </div>

              <h1 className="text-[2.65rem] font-bold leading-[1.12] tracking-[-0.045em] text-[#102A56] sm:text-5xl lg:text-[3.65rem]">
                The right tutor can make a{" "}
                <span className="relative inline-block text-[#0077E6]">
                  real difference.
                  <span className="absolute -bottom-1 left-0 -z-10 h-3 w-full rounded-full bg-[#BDE9E4]" />
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                Find tutors who understand your learning needs. Explore
                personalised tutoring support for school subjects, academic
                improvement and new skills.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/discover"
                  className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-[#0077E6] px-7 py-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(0,119,230,0.20)] transition hover:-translate-y-0.5 hover:bg-[#0068CB]"
                >
                  Find a tutor
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/register/tutor"
                  className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl border border-[#D6E1EC] bg-white px-7 py-4 text-sm font-semibold text-[#102A56] transition hover:border-[#0077E6] hover:bg-blue-50"
                >
                  Become a tutor
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00AFA0]" />
                  Personalised learning
                </span>

                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00AFA0]" />
                  Online and in-person
                </span>
              </div>
            </div>

            {/* HERO IMAGE COMPOSITION */}
            <div className="relative mx-auto w-full max-w-[570px]">
              <div className="absolute -left-4 top-14 h-32 w-32 rounded-full border border-[#BBDCF5] sm:-left-8" />
              <div className="absolute -bottom-5 right-8 h-28 w-28 rounded-full bg-[#CFF2EB]" />

              <div className="relative grid grid-cols-[1fr_0.78fr] items-center gap-3 sm:gap-5">
                <div className="relative overflow-hidden rounded-[28px] rounded-br-[90px] bg-[#DCEBFA] shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=1000&auto=format&fit=crop&q=90"
                    alt="Tutor working with learning materials"
                    className="h-[340px] w-full object-cover object-center sm:h-[440px]"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#102A56]/35 via-transparent to-transparent" />

                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <p className="text-xs font-medium text-white/80">
                      Learning starts with
                    </p>
                    <p className="mt-1 text-xl font-bold">
                      the right guidance.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="overflow-hidden rounded-[26px] rounded-bl-[70px] bg-[#E1F4F0] shadow-lg">
                    <img
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=85"
                      alt="Learner portrait"
                      className="h-[190px] w-full object-cover object-center sm:h-[245px]"
                    />
                  </div>

                  <div className="overflow-hidden rounded-[26px] rounded-tr-[65px] bg-[#E8E9F9] shadow-lg">
                    <img
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=85"
                      alt="Learner portrait"
                      className="h-[145px] w-full object-cover object-center sm:h-[180px]"
                    />
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-7 left-2 flex items-center gap-3 rounded-2xl border border-white/80 bg-white p-4 shadow-[0_12px_35px_rgba(16,42,86,0.13)] sm:-left-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E2F7F2] text-[#009688]">
                  <GraduationCap className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-sm font-bold text-[#102A56]">
                    Your learning journey
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Starts with one good connection
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VALUE STRIP */}
        <section className="border-b border-slate-100 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-5 py-8 sm:grid-cols-3 sm:px-8 lg:px-10">
            {[
              {
                icon: ShieldCheck,
                title: "Reviewed tutor profiles",
                text: "Make more informed choices.",
              },
              {
                icon: Laptop,
                title: "Flexible learning options",
                text: "Online and in-person arrangements.",
              },
              {
                icon: UserRound,
                title: "A tutor for your needs",
                text: "Explore different subjects and skills.",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F0F7FD] text-[#0077E6]">
                  <item.icon className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#102A56]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* EXPLORE SUBJECTS */}
        <section id="subjects" className="scroll-mt-24 bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <SectionHeading
                eyebrow="Explore subjects"
                title="What would you like to learn?"
                description="Start with a subject or skill. Find learning support that matches what you want to achieve."
              />

              <Link
                href="/subjects"
                className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#0077E6] transition hover:gap-3"
              >
                See all subjects
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-12">
              {subjectsLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse rounded-2xl border border-[#E8EEF4] p-6"
                    >
                      <div className="h-12 w-12 rounded-2xl bg-slate-100" />
                      <div className="mt-6 h-5 w-2/3 rounded bg-slate-100" />
                      <div className="mt-3 h-4 w-full rounded bg-slate-100" />
                    </div>
                  ))}
                </div>
              ) : subjectsError ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
                  <p className="text-sm text-red-700">
                    We couldn't load learning areas right now.
                  </p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-3 text-sm font-semibold text-[#0077E6]"
                  >
                    Try again
                  </button>
                </div>
              ) : subjects.length === 0 ? (
                <div className="rounded-2xl border border-[#E8EEF4] p-8 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-3 font-semibold text-[#102A56]">
                    No learning areas available yet.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {paginatedSubjects.map((subject) => (
                      <Link
                        key={subject.id}
                        href={`/discover?subject_id=${encodeURIComponent(subject.id)}`}
                        className="group rounded-2xl border border-[#E8EEF4] bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-[#B9D9F4] hover:shadow-[0_14px_35px_rgba(16,42,86,0.07)]"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#0077E6]">
                          <BookOpen className="h-5 w-5" />
                        </div>

                        <div className="mt-6 flex items-center justify-between gap-3">
                          <h3 className="text-lg font-bold text-[#102A56]">
                            {subject.name}
                          </h3>
                          <ArrowUpRight className="h-5 w-5 text-slate-300 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#0077E6]" />
                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          Explore tutors who teach {subject.name}.
                        </p>
                      </Link>
                    ))}
                  </div>

                  {totalSubjectPages > 1 && (
                    <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row">
                      <p className="text-sm text-slate-500">
                        Showing{" "}
                        <span className="font-semibold text-[#102A56]">
                          {(subjectPage - 1) * SUBJECTS_PER_PAGE + 1}–
                          {Math.min(
                            subjectPage * SUBJECTS_PER_PAGE,
                            subjects.length,
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-[#102A56]">
                          {subjects.length}
                        </span>{" "}
                        subjects
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setSubjectPage((current) =>
                              Math.max(1, current - 1),
                            )
                          }
                          disabled={subjectPage === 1}
                          className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#DCE5EE] px-4 text-sm font-semibold text-[#102A56] transition hover:bg-[#F4F8FB] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ArrowRight className="h-4 w-4 rotate-180" />
                          Previous
                        </button>

                        <span className="px-3 text-sm font-medium text-slate-600">
                          {subjectPage} / {totalSubjectPages}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setSubjectPage((current) =>
                              Math.min(totalSubjectPages, current + 1),
                            )
                          }
                          disabled={subjectPage === totalSubjectPages}
                          className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#DCE5EE] px-4 text-sm font-semibold text-[#102A56] transition hover:bg-[#F4F8FB] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Next
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/subjects"
                className="inline-flex items-center gap-2 rounded-xl border border-[#D6E1EC] bg-white px-6 py-3 text-sm font-semibold text-[#102A56] transition hover:border-[#0077E6] hover:bg-blue-50"
              >
                See all subjects
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURED TUTORS */}
        <section
          id="explore-tutors"
          className="scroll-mt-24 bg-[#F4F8FB] py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <SectionHeading
                eyebrow="Meet the tutors"
                title="Find someone who makes learning clearer."
                description="Explore tutor profiles and discover people who can support your learning goals."
              />

              <Link
                href="/discover"
                className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#0077E6] transition hover:gap-3"
              >
                View all tutors
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-12">
              {tutorsLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse overflow-hidden rounded-[26px] bg-white"
                    >
                      <div className="h-[510px] bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : tutorsError ? (
                <div className="rounded-2xl border border-red-100 bg-white p-8 text-center">
                  <p className="text-sm text-slate-600">
                    We couldn't load featured tutors right now.
                  </p>
                  <Link
                    href="/discover"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0077E6]"
                  >
                    Browse tutors
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : featuredTutors.length === 0 ? (
                <div className="rounded-2xl border border-[#E6EDF4] bg-white p-10 text-center">
                  <GraduationCap className="mx-auto h-9 w-9 text-slate-300" />
                  <h3 className="mt-4 font-bold text-[#102A56]">
                    No tutors available yet
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    We're working to connect learners with suitable tutors.
                  </p>
                  <Link
                    href="/discover"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0077E6]"
                  >
                    Explore tutors
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {featuredTutors.map((tutor) => (
                    <FeaturedTutorCard key={tutor.id} tutor={tutor} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* PARENTS AND LEARNERS */}
        <section id="parents" className="scroll-mt-24 bg-white py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-10">
            <div className="relative mx-auto w-full max-w-[520px]">
              <div className="absolute -left-5 -top-5 h-28 w-28 rounded-full bg-[#E1F5F1]" />
              <div className="relative overflow-hidden rounded-[30px] rounded-br-[100px] bg-[#E6EEF7]">
                <img
                  src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1100&auto=format&fit=crop&q=85"
                  alt="Teacher supporting students in a learning environment"
                  className="h-[340px] w-full object-cover sm:h-[440px]"
                  loading="lazy"
                />
              </div>

              <div className="absolute -bottom-5 right-4 max-w-[245px] rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:right-0">
                <div className="flex items-center gap-2 text-sm font-bold text-[#102A56]">
                  <ShieldCheck className="h-5 w-5 text-[#00AFA0]" />
                  Make an informed choice
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Review tutor profiles and discuss your child's learning needs.
                </p>
              </div>
            </div>

            <div id="individual-learners" className="scroll-mt-24">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.19em] text-[#0077E6]">
                For parents and learners
              </p>

              <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#102A56] sm:text-4xl">
                Learning support should fit the learner, not the other way
                around.
              </h2>

              <p className="mt-5 text-base leading-8 text-slate-600">
                Every learner has different strengths, challenges and goals.
                Tutova helps parents and individual learners explore tutors who
                can provide support suited to those needs.
              </p>

              <div className="mt-8 space-y-5">
                {[
                  "Explore tutors by subject and learning needs.",
                  "Compare tutor profiles before sending a request.",
                  "Discuss lesson arrangements and learning expectations.",
                  "Consider online or in-person tutoring options.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#00AFA0]" />
                    <p className="text-sm leading-6 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/discover"
                className="mt-9 inline-flex items-center gap-3 rounded-xl bg-[#102A56] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#183D75]"
              >
                Explore tutors
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="scroll-mt-24 bg-[#F4F8FB] py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <SectionHeading
              eyebrow="How Tutova works"
              title="A clearer way to find learning support."
              description="From identifying a learning need to connecting with a tutor, the process is designed to be straightforward."
              centered
            />

            <div className="relative mt-14 grid gap-6 md:grid-cols-3">
              <div className="absolute left-[16%] right-[16%] top-9 hidden border-t border-dashed border-[#BBD4E9] md:block" />

              {steps.map((step) => (
                <div
                  key={step.number}
                  className="relative rounded-2xl border border-[#E4ECF3] bg-white p-7 shadow-[0_6px_22px_rgba(16,42,86,0.035)]"
                >
                  <div className="relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-2xl border-[6px] border-[#F4F8FB] bg-[#EAF4FD] text-[#0077E6]">
                    <step.icon className="h-7 w-7" />
                  </div>

                  <p className="mt-7 text-xs font-bold tracking-[0.16em] text-[#00AFA0]">
                    STEP {step.number}
                  </p>
                  <h3 className="mt-3 text-xl font-bold leading-snug text-[#102A56]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/discover"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0077E6] hover:underline"
              >
                Start exploring tutors
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* TRUST AND FLEXIBILITY */}
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <SectionHeading
              eyebrow="A thoughtful learning experience"
              title="More than finding a name on a list."
              description="Choosing a tutor is an important decision. Tutova is designed to make tutor discovery and the next steps clearer."
              centered
            />

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-[#E8EEF4] bg-white p-7 transition hover:border-[#C8DFF2] hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF4FD] text-[#0077E6]">
                    <benefit.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-[#102A56]">
                    {benefit.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TUTOR CTA */}
        <section className="bg-white px-5 pb-20 sm:px-8 sm:pb-24 lg:px-10">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[30px] bg-[#102A56] px-7 py-12 sm:px-12 sm:py-16 lg:px-16">
            <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border-[45px] border-white/5" />
            <div className="absolute -bottom-36 right-48 h-72 w-72 rounded-full bg-[#0077E6]/20 blur-2xl" />

            <div className="relative flex flex-col justify-between gap-9 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6CE0D2]">
                  For tutors
                </p>
                <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
                  Ready to share what you know?
                </h2>
                <p className="mt-4 max-w-xl text-base leading-8 text-blue-100/80">
                  Join a learning community where your knowledge and teaching
                  experience can help learners make progress.
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Link
                  href="/register/tutor"
                  className="inline-flex items-center justify-center gap-3 rounded-xl bg-white px-6 py-4 text-sm font-bold text-[#102A56] transition hover:bg-[#EAF4FD]"
                >
                  Register as a tutor
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/become-a-tutor"
                  className="inline-flex items-center justify-center rounded-xl border border-white/30 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Learn more
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* LEARNING RESOURCES */}
        <section
          id="resources"
          className="scroll-mt-24 border-t border-slate-100 bg-[#F8FAFC] py-16"
        >
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-5 sm:px-8 md:flex-row md:items-center lg:px-10">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.19em] text-[#0077E6]">
                Keep learning
              </p>
              <h2 className="mt-3 text-2xl font-bold text-[#102A56] sm:text-3xl">
                Useful resources for your learning journey.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                Explore learning materials and guidance to help you make better
                decisions about tutoring and academic development.
              </p>
            </div>

            <Link
              href="/resources"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#0077E6] hover:underline"
            >
              Explore resources
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
