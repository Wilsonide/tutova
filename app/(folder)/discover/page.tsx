"use client";

import { SiteFooter } from "@/components/site-footer";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  GraduationCap,
  MapPin,
  Monitor,
  Search,
  Users,
  Video,
  Wallet,
  X,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Subject, Location } from "@/lib/types";
import { toast } from "sonner";

type TutoringMode = "ONLINE" | "IN_PERSON" | "HYBRID";

interface PublicTutorSubject {
  id: string;
  name: string;
  slug: string;
}

interface PublicTutorLocation {
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
  full_name?: string;
  bio: string | null;
  qualifications: string | null;
  years_of_experience: number;
  hourly_rate: number | string | null;
  teaching_languages: string[];
  learner_age_groups: string[];
  tutoring_modes: TutoringMode[];
  service_area: string | null;
  subjects: PublicTutorSubject[];
  locations: PublicTutorLocation[];
  introduction_video_url?: string | null;
}

interface PublicTutorListResponse {
  items: PublicTutor[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

const PER_PAGE = 9;

const modeLabels: Record<TutoringMode, string> = {
  ONLINE: "Online",
  IN_PERSON: "In-person",
  HYBRID: "Hybrid",
};

function formatRate(rate: number | string | null) {
  if (rate === null || rate === undefined || rate === "") {
    return "Rate available on request";
  }

  const amount = Number(rate);

  if (!Number.isFinite(amount)) {
    return "Rate available on request";
  }

  return `₦${amount.toLocaleString("en-NG")}/hour`;
}

function getTutorName(tutor: PublicTutor) {
  return (
    tutor.full_name ||
    `${tutor.first_name || ""} ${tutor.last_name || ""}`.trim() ||
    "Verified Tutor"
  );
}

function getInitials(tutor: PublicTutor) {
  const name = getTutorName(tutor);

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function DiscoverPage() {
  const [tutors, setTutors] = useState<PublicTutor[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [states, setStates] = useState<Location[]>([]);
  const [lgas, setLgas] = useState<Location[]>([]);

  // The main search and Learning area dropdown share these values.
  const [subjectSearch, setSubjectSearch] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);

  const [stateId, setStateId] = useState("");
  const [lgaId, setLgaId] = useState("");
  const [tutoringMode, setTutoringMode] = useState("");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Match the user's input against the subjects returned by the backend.
  const filteredSubjects = useMemo(() => {
    const keyword = subjectSearch.trim().toLowerCase();

    if (!keyword) return [];

    return subjects.filter((subject) =>
      subject.name.toLowerCase().includes(keyword),
    );
  }, [subjects, subjectSearch]);

  // Load available learning areas and states.
  useEffect(() => {
    let mounted = true;

    Promise.all([
      api<Subject[]>("/subjects", {}, { auth: false }),
      api<Location[]>("/locations?location_type=STATE", {}, { auth: false }),
    ])
      .then(([subjectData, stateData]) => {
        if (!mounted) return;

        setSubjects(subjectData);
        setStates(stateData);
      })
      .catch((err) => {
        if (mounted) {
          toast.error(
            err instanceof Error
              ? err.message
              : "Could not load discovery filters",
          );
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Load LGAs whenever a state is selected.
  useEffect(() => {
    let mounted = true;

    setLgas([]);
    setLgaId("");

    if (!stateId) return;

    api<Location[]>(
      `/locations?location_type=LGA&parent_id=${encodeURIComponent(stateId)}`,
      {},
      { auth: false },
    )
      .then((data) => {
        if (mounted) setLgas(data);
      })
      .catch((err) => {
        if (mounted) {
          toast.error(
            err instanceof Error
              ? err.message
              : "Could not load local government areas",
          );
        }
      });

    return () => {
      mounted = false;
    };
  }, [stateId]);

  // Select a subject from the search suggestions.
  const handleSubjectSelect = (subject: Subject) => {
    setSubjectSearch(subject.name);
    setSubjectId(subject.id);
    setShowSubjectSuggestions(false);
    setPage(1);
  };

  // Typing in the main search resolves the text against available subjects.
  const handleSubjectSearch = (value: string) => {
    setSubjectSearch(value);
    setShowSubjectSuggestions(true);
    setPage(1);

    const exactMatch = subjects.find(
      (subject) => subject.name.toLowerCase() === value.trim().toLowerCase(),
    );

    setSubjectId(exactMatch?.id ?? "");
  };

  // Clear only the learning area selection.
  const clearSubjectSearch = () => {
    setSubjectSearch("");
    setSubjectId("");
    setShowSubjectSuggestions(false);
    setPage(1);
  };

  // Fetch public tutors using the selected filters.
  const fetchTutors = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(PER_PAGE),
      });

      if (subjectId) {
        params.set("subject_id", subjectId);
      }

      if (lgaId) {
        params.set("location_id", lgaId);
      } else if (stateId) {
        params.set("location_id", stateId);
      }

      if (tutoringMode) {
        params.set("tutoring_mode", tutoringMode);
      }

      const response = await api<PublicTutorListResponse>(
        `/tutors?${params.toString()}`,
        {},
        { auth: false },
      );

      setTutors(response.items ?? []);
      setTotal(response.total ?? 0);
      setTotalPages(Math.max(response.total_pages ?? 1, 1));
    } catch (err) {
      setTutors([]);
      setTotal(0);
      setTotalPages(1);

      const message =
        err instanceof Error
          ? err.message
          : "Could not load tutors. Please try again.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, subjectId, stateId, lgaId, tutoringMode]);

  useEffect(() => {
    fetchTutors();
  }, [fetchTutors]);

  const clearFilters = () => {
    setSubjectSearch("");
    setSubjectId("");
    setStateId("");
    setLgaId("");
    setTutoringMode("");
    setShowSubjectSuggestions(false);
    setPage(1);
  };

  const hasFilters = Boolean(
    subjectSearch || subjectId || stateId || lgaId || tutoringMode,
  );

  return (
    <>
      <main className="min-h-screen bg-[#F7F9FC]">
        {/* Page introduction */}
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-[#1769D2]">
                <GraduationCap size={16} />
                Discover trusted tutors
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-[#102A56] sm:text-4xl lg:text-5xl">
                Find the right tutor for your learning goals.
              </h1>

              <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
                Explore verified tutors across academic subjects, professional
                courses, technology, languages and creative skills. Find someone
                whose experience and teaching approach match your needs.
              </p>
            </div>

            {/* Learning area search */}
            <div className="mt-8 max-w-3xl">
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={subjectSearch}
                  onChange={(e) => handleSubjectSearch(e.target.value)}
                  onFocus={() => setShowSubjectSuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setShowSubjectSuggestions(false);
                    }

                    if (e.key === "Enter") {
                      e.preventDefault();

                      if (filteredSubjects.length === 1) {
                        handleSubjectSelect(filteredSubjects[0]);
                      } else {
                        setShowSubjectSuggestions(false);
                      }
                    }
                  }}
                  placeholder="Search for a subject or learning area..."
                  autoComplete="off"
                  className="h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-12 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#1769D2] focus:ring-2 focus:ring-blue-100"
                />

                {subjectSearch && (
                  <button
                    type="button"
                    onClick={clearSubjectSearch}
                    aria-label="Clear learning area search"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  >
                    <X size={18} />
                  </button>
                )}

                {showSubjectSuggestions && subjectSearch.trim() && (
                  <>
                    <button
                      type="button"
                      aria-label="Close suggestions"
                      className="fixed inset-0 z-10 cursor-default"
                      onClick={() => setShowSubjectSuggestions(false)}
                    />

                    <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                      {filteredSubjects.length > 0 ? (
                        filteredSubjects.slice(0, 8).map((subject) => (
                          <button
                            key={subject.id}
                            type="button"
                            onClick={() => handleSubjectSelect(subject)}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition hover:bg-blue-50 ${
                              subjectId === subject.id
                                ? "bg-blue-50 text-[#1769D2]"
                                : "text-slate-700"
                            }`}
                          >
                            <BookOpen
                              size={16}
                              className="shrink-0 text-[#1769D2]"
                            />
                            <span className="font-medium">{subject.name}</span>
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-4 text-sm text-slate-500">
                          No matching learning areas found. Try another subject.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Search and select a learning area to find tutors who teach it.
              </p>
            </div>
          </div>
        </section>

        {/* Tutor directory */}
        <section className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-[#102A56]">
                  Find your ideal tutor
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Narrow your search using the filters below.
                </p>
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm font-semibold text-[#1769D2] hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Learning area */}
              <div>
                <label
                  htmlFor="subject-filter"
                  className="mb-1.5 block text-xs font-semibold text-slate-600"
                >
                  Learning area
                </label>

                <div className="relative">
                  <select
                    id="subject-filter"
                    value={subjectId}
                    onChange={(e) => {
                      const selectedSubject = subjects.find(
                        (subject) => subject.id === e.target.value,
                      );

                      setSubjectId(e.target.value);
                      setSubjectSearch(selectedSubject?.name ?? "");
                      setPage(1);
                    }}
                    className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 outline-none focus:border-[#1769D2]"
                  >
                    <option value="">All learning areas</option>

                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              {/* State */}
              <div>
                <label
                  htmlFor="state-filter"
                  className="mb-1.5 block text-xs font-semibold text-slate-600"
                >
                  State
                </label>

                <div className="relative">
                  <select
                    id="state-filter"
                    value={stateId}
                    onChange={(e) => {
                      setStateId(e.target.value);
                      setLgaId("");
                      setPage(1);
                    }}
                    className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 outline-none focus:border-[#1769D2]"
                  >
                    <option value="">All states</option>

                    {states.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              {/* LGA */}
              <div>
                <label
                  htmlFor="lga-filter"
                  className="mb-1.5 block text-xs font-semibold text-slate-600"
                >
                  Local government area
                </label>

                <div className="relative">
                  <select
                    id="lga-filter"
                    value={lgaId}
                    disabled={!stateId}
                    onChange={(e) => {
                      setLgaId(e.target.value);
                      setPage(1);
                    }}
                    className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 outline-none focus:border-[#1769D2] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">
                      {stateId
                        ? "All LGAs in selected state"
                        : "Select a state first"}
                    </option>

                    {lgas.map((lga) => (
                      <option key={lga.id} value={lga.id}>
                        {lga.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              {/* Teaching mode */}
              <div>
                <label
                  htmlFor="mode-filter"
                  className="mb-1.5 block text-xs font-semibold text-slate-600"
                >
                  Teaching mode
                </label>

                <div className="relative">
                  <select
                    id="mode-filter"
                    value={tutoringMode}
                    onChange={(e) => {
                      setTutoringMode(e.target.value);
                      setPage(1);
                    }}
                    className="h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 outline-none focus:border-[#1769D2]"
                  >
                    <option value="">All teaching modes</option>
                    <option value="ONLINE">Online</option>
                    <option value="IN_PERSON">In-person</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results heading */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#102A56]">
                Available tutors
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {loading
                  ? "Finding tutors..."
                  : `${total.toLocaleString("en-NG")} tutor${total === 1 ? "" : "s"} found`}
              </p>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="overflow-hidden border-slate-200">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 animate-pulse rounded-full bg-slate-100" />

                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                      </div>
                    </div>

                    <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
                    <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-2xl border border-red-100 bg-white px-6 py-12 text-center">
              <h3 className="font-bold text-slate-800">
                We couldn't load the tutors
              </h3>

              <p className="mt-2 text-sm text-slate-500">{error}</p>

              <Button
                type="button"
                onClick={fetchTutors}
                className="mt-5 bg-[#1769D2] hover:bg-[#102A56]"
              >
                Try again
              </Button>
            </div>
          )}

          {/* Tutor cards */}
          {!loading && !error && tutors.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {tutors.map((tutor) => (
                <Card
                  key={tutor.id}
                  className="group flex h-full flex-col overflow-hidden border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <CardContent className="flex flex-1 flex-col p-5">
                    {/* Tutor identity */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#102A56] text-lg font-bold text-white">
                        {getInitials(tutor)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h3 className="font-bold text-[#102A56]">
                            {getTutorName(tutor)}
                          </h3>

                          <span
                            title="Verified tutor"
                            className="inline-flex items-center text-[#1769D2]"
                          >
                            <BadgeCheck size={17} />
                          </span>
                        </div>

                        <p className="mt-1 text-xs font-medium text-slate-500">
                          <BriefcaseBusiness
                            size={13}
                            className="mr-1 inline"
                          />
                          {tutor.years_of_experience}{" "}
                          {tutor.years_of_experience === 1 ? "year" : "years"}{" "}
                          experience
                        </p>
                      </div>
                    </div>

                    {/* Introduction video */}
                    {tutor.introduction_video_url ? (
                      <div className="mt-5 overflow-hidden rounded-xl bg-slate-950">
                        <video
                          controls
                          playsInline
                          preload="metadata"
                          className="aspect-video w-full object-contain"
                          src={tutor.introduction_video_url}
                        >
                          Your browser does not support video playback.
                        </video>
                      </div>
                    ) : (
                      <div className="mt-5 flex aspect-video items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
                        <div className="text-center">
                          <Video size={27} className="mx-auto text-slate-300" />

                          <p className="mt-2 text-xs text-slate-400">
                            Introduction video unavailable
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Bio */}
                    <div className="mt-5">
                      <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                        {tutor.bio ||
                          "This tutor has not added an introduction yet."}
                      </p>
                    </div>

                    {/* Qualifications */}
                    {tutor.qualifications && (
                      <div className="mt-4">
                        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                          Qualifications
                        </p>

                        <p className="line-clamp-2 text-sm text-slate-700">
                          {tutor.qualifications}
                        </p>
                      </div>
                    )}

                    {/* Subjects */}
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                        Learning areas
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {tutor.subjects?.length ? (
                          tutor.subjects.slice(0, 5).map((subject) => (
                            <span
                              key={subject.id}
                              className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-[#1769D2]"
                            >
                              {subject.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">
                            No learning areas listed
                          </span>
                        )}

                        {tutor.subjects?.length > 5 && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                            +{tutor.subjects.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Teaching modes */}
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                        Teaching modes
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {tutor.tutoring_modes?.map((mode) => (
                          <span
                            key={mode}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600"
                          >
                            <Monitor size={13} />
                            {modeLabels[mode] ?? mode}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Languages */}
                    {tutor.teaching_languages?.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                          Languages
                        </p>

                        <p className="text-sm text-slate-600">
                          {tutor.teaching_languages.join(", ")}
                        </p>
                      </div>
                    )}

                    {/* Learner age groups */}
                    {tutor.learner_age_groups?.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                          Learner groups
                        </p>

                        <div className="flex flex-wrap gap-1.5">
                          {tutor.learner_age_groups.map((group) => (
                            <span
                              key={group}
                              className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700"
                            >
                              {group.replaceAll("_", " ")}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    <div className="mt-4">
                      <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                        Service locations
                      </p>

                      <div className="flex items-start gap-1.5 text-sm text-slate-600">
                        <MapPin
                          size={15}
                          className="mt-0.5 shrink-0 text-slate-400"
                        />

                        <span>
                          {tutor.locations?.length
                            ? tutor.locations
                                .map((location) => location.name)
                                .join(", ")
                            : tutor.service_area || "Location not specified"}
                        </span>
                      </div>
                    </div>

                    {/* Rate */}
                    <div className="mt-auto border-t border-slate-100 pt-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs text-slate-400">Hourly rate</p>

                          <p className="mt-1 font-bold text-[#102A56]">
                            <Wallet
                              size={15}
                              className="mr-1 inline text-[#1769D2]"
                            />
                            {formatRate(tutor.hourly_rate)}
                          </p>
                        </div>

                        <Button
                          asChild
                          className="bg-[#1769D2] hover:bg-[#102A56]"
                        >
                          <Link href="/requests">
                            Request tutor
                            <ArrowRight size={15} className="ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty results */}
          {!loading && !error && tutors.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[#1769D2]">
                <Users size={25} />
              </div>

              <h3 className="mt-4 text-lg font-bold text-[#102A56]">
                No tutors found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                We couldn't find tutors matching your current search. Try
                changing your filters or searching for another learning area.
              </p>

              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                className="mt-5"
              >
                Clear filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && tutors.length > 0 && totalPages > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5">
              <p className="text-sm text-slate-500">
                Page {page} of {totalPages}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={page <= 1 || loading}
                  onClick={() => {
                    setPage((current) => Math.max(1, current - 1));
                  }}
                  className="gap-2"
                >
                  <ArrowLeft size={15} />
                  Previous
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={page >= totalPages || loading}
                  onClick={() => {
                    setPage((current) => Math.min(totalPages, current + 1));
                  }}
                  className="gap-2"
                >
                  Next
                  <ArrowRight size={15} />
                </Button>
              </div>
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
