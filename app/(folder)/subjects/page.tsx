"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
} from "lucide-react";

import { api } from "@/lib/api";
import type { Subject } from "@/lib/types";

const ITEMS_PER_PAGE = 12;

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSubjects() {
      try {
        setLoading(true);
        setError("");

        const response = await api<Subject[]>("/subjects", {}, { auth: false });

        if (active) {
          setSubjects(response);
        }
      } catch {
        if (active) {
          setError(
            "We couldn't load the learning areas at the moment. Please try again.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSubjects();

    return () => {
      active = false;
    };
  }, []);

  const filteredSubjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return subjects;

    return subjects.filter((subject) => {
      return (
        subject.name.toLowerCase().includes(query) ||
        (subject.description ?? "").toLowerCase().includes(query)
      );
    });
  }, [subjects, search]);

  const totalPages = Math.ceil(filteredSubjects.length / ITEMS_PER_PAGE);

  const paginatedSubjects = filteredSubjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const startItem =
    filteredSubjects.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;

  const endItem = Math.min(
    currentPage * ITEMS_PER_PAGE,
    filteredSubjects.length,
  );

  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#102A56]">
        <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#1769D2]/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[#00A99A]/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-blue-100 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>

          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-blue-100">
              <Sparkles size={15} className="text-[#00C6B5]" />
              Explore learning opportunities
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find the right subject.
              <span className="block text-[#53D6C8]">
                Start learning something new.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-blue-100 sm:text-lg">
              From academic subjects to technology, professional skills,
              languages and creative interests, discover learning areas and
              connect with tutors who can help you grow.
            </p>

            <div className="mt-9 flex flex-wrap gap-4 text-sm text-blue-100">
              <span className="flex items-center gap-2">
                <BookOpen size={17} />
                {loading
                  ? "Loading learning areas..."
                  : `${subjects.length} learning areas`}
              </span>
              <span className="text-white/30">|</span>
              <span>Learn at your own pace</span>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16 lg:px-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#1769D2]">
              Learning directory
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Explore all subjects
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Browse the available learning areas or search for something
              specific.
            </p>
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search learning areas..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1769D2] focus:ring-4 focus:ring-[#1769D2]/10"
            />
          </div>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="h-48 animate-pulse rounded-2xl border border-slate-100 bg-white p-6"
                >
                  <div className="h-11 w-11 rounded-xl bg-slate-100" />
                  <div className="mt-6 h-4 w-2/3 rounded bg-slate-100" />
                  <div className="mt-3 h-3 w-full rounded bg-slate-100" />
                  <div className="mt-2 h-3 w-3/4 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-100 bg-white px-6 py-14 text-center">
              <p className="font-semibold text-slate-800">
                Unable to load subjects
              </p>
              <p className="mt-2 text-sm text-slate-500">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 rounded-lg bg-[#102A56] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1769D2]"
              >
                Try again
              </button>
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#1769D2]">
                <Search size={24} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                {search ? "No matching subjects" : "No subjects available yet"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {search
                  ? "Try another search term to find the learning area you're looking for."
                  : "Learning areas will appear here once they become available."}
              </p>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-5 text-sm font-semibold text-[#1769D2] hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedSubjects.map((subject) => (
                  <Link
                    key={subject.id}
                    href={`/discover?subject_id=${encodeURIComponent(subject.id)}`}
                    className="group flex min-h-[205px] flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#1769D2] transition group-hover:bg-[#1769D2] group-hover:text-white">
                        <BookOpen size={22} />
                      </div>

                      <ArrowUpRight
                        size={19}
                        className="text-slate-300 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#1769D2]"
                      />
                    </div>

                    <h3 className="mt-6 text-lg font-semibold text-slate-900 transition group-hover:text-[#1769D2]">
                      {subject.name}
                    </h3>

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                      {subject.description ||
                        `Explore ${subject.name} and find a tutor to guide your learning.`}
                    </p>

                    <div className="mt-auto flex items-center gap-2 pt-5 text-sm font-semibold text-[#1769D2]">
                      Find tutors
                      <ArrowRight
                        size={16}
                        className="transition group-hover:translate-x-1"
                      />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-10 flex flex-col gap-5 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-800">
                    {startItem}–{endItem}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-800">
                    {filteredSubjects.length}
                  </span>{" "}
                  subjects
                </p>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((page) => Math.max(1, page - 1))
                      }
                      className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-[#1769D2] hover:text-[#1769D2] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={17} />
                      Previous
                    </button>

                    <span className="px-3 text-sm font-medium text-slate-600">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((page) => Math.min(totalPages, page + 1))
                      }
                      className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-[#1769D2] hover:text-[#1769D2] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <ChevronRight size={17} />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Call to action */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-10">
        <div className="relative overflow-hidden rounded-3xl bg-[#102A56] px-6 py-10 sm:px-10 sm:py-12">
          <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-[#1769D2]/30 blur-3xl" />

          <div className="relative flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Ready to take the next step?
              </h2>
              <p className="mt-3 text-sm leading-7 text-blue-100 sm:text-base">
                Find a tutor who understands your goals and can help you make
                meaningful progress.
              </p>
            </div>

            <Link
              href="/discover"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[#102A56] transition hover:bg-blue-50"
            >
              Explore tutors
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
