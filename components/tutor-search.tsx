"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, BookOpen, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import type { Subject } from "@/lib/types";

interface TutorSearchProps {
  mobile?: boolean;
  onSearch?: () => void;
}

export function TutorSearch({ mobile = false, onSearch }: TutorSearchProps) {
  const [query, setQuery] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load actual learning areas from the backend.
  useEffect(() => {
    let mounted = true;

    api<Subject[]>("/subjects", {}, { auth: false })
      .then((data) => {
        if (mounted) setSubjects(data);
      })
      .catch(() => {
        // Search remains usable even if suggestions cannot be loaded.
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Suggestions are based only on active backend learning areas.
  const suggestions = query.trim()
    ? subjects
        .filter((subject) =>
          subject.name.toLowerCase().includes(query.trim().toLowerCase()),
        )
        .slice(0, 6)
    : [];

  function submitSearch(value: string) {
    const keyword = value.trim();

    if (!keyword) return;

    setQuery(keyword);
    setOpen(false);
    onSearch?.();

    // Uses the same search parameter as the Discover page.
    router.push(`/discover?search=${encodeURIComponent(keyword)}`);
  }

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div
      ref={searchRef}
      className={`relative w-full ${
        mobile ? "" : "sm:w-[210px] lg:w-[245px] sm:shrink-0"
      }`}
    >
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submitSearch(query);
        }}
      >
        <div
          className={`flex items-center gap-2 border transition ${
            mobile ? "h-12 rounded-xl px-4" : "h-10 rounded-full px-3"
          } ${
            open
              ? "border-[#1769D2] bg-white ring-2 ring-[#1769D2]/10"
              : "border-slate-200 bg-[#F4F8FB]"
          }`}
        >
          <Search size={17} className="shrink-0 text-slate-400" />

          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={
              mobile ? "Search tutors or learning areas..." : "Search tutors..."
            }
            aria-label="Search tutors by name or learning area"
            aria-autocomplete="list"
            aria-expanded={open && suggestions.length > 0}
            className="w-full min-w-0 bg-transparent text-sm text-[#102A56] outline-none placeholder:text-slate-400"
          />

          {mobile && (
            <button
              type="submit"
              disabled={!query.trim()}
              className="shrink-0 text-sm font-semibold text-[#1769D2] disabled:opacity-40"
            >
              Search
            </button>
          )}
        </div>
      </form>

      {/* Dynamic learning-area suggestions */}
      {open && query.trim() && (
        <div
          role="listbox"
          aria-label="Learning area suggestions"
          className="absolute left-0 top-full z-[70] mt-2 w-full min-w-[240px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_45px_rgba(16,42,86,0.15)]"
        >
          <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            {suggestions.length > 0
              ? "Matching learning areas"
              : "Search tutors"}
          </p>

          {suggestions.map((subject) => (
            <button
              key={subject.id}
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => submitSearch(subject.name)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-700 transition hover:bg-[#F4F8FB] hover:text-[#1769D2]"
            >
              <BookOpen size={15} className="shrink-0 text-slate-400" />
              <span>{subject.name}</span>
            </button>
          ))}

          {/* Always allow free-text searches */}
          <button
            type="button"
            onClick={() => submitSearch(query)}
            className="mt-1 flex w-full items-center justify-between border-t border-slate-100 px-3 py-3 text-left text-xs font-semibold text-[#1769D2] hover:bg-[#F4F8FB]"
          >
            Search tutors for "{query}"
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
