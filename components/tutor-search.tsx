"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

const searchSuggestions = [
  "Mathematics",
  "English",
  "Physics",
  "Chemistry",
  "Biology",
  "Further Mathematics",
  "Basic Science",
  "Computer Science",
  "Programming",
  "Python",
  "JavaScript",
  "Web Development",
  "Graphic Design",
  "Data Analysis",
  "Microsoft Excel",
  "French",
  "Music",
  "Accounting",
  "Economics",
  "Public Speaking",
];

interface TutorSearchProps {
  mobile?: boolean;
  onSearch?: () => void;
}

export function TutorSearch({ mobile = false, onSearch }: TutorSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const suggestions = query.trim()
    ? searchSuggestions
        .filter((item) =>
          item.toLowerCase().includes(query.trim().toLowerCase()),
        )
        .slice(0, 6)
    : [];

  function submitSearch(value: string) {
    const keyword = value.trim();

    if (!keyword) return;

    setQuery(keyword);
    setOpen(false);
    onSearch?.();

    router.push(`/discover?q=${encodeURIComponent(keyword)}`);
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
      className={`relative w-full ${mobile ? "" : "sm:w-[210px] lg:w-[245px] sm:shrink-0"}`}
    >
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submitSearch(query);
        }}
      >
        <div
          className={`flex items-center gap-2 border transition ${
            mobile ? "h-12 rounded-xl px-4" : "h-10 rounded-full px-3"
          } ${
            open
              ? "border-[#0077E6] bg-white ring-2 ring-[#0077E6]/10"
              : "border-slate-200 bg-[#F4F8FB]"
          }`}
        >
          <Search size={17} className="shrink-0 text-slate-400" />

          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={
              mobile ? "Search subjects or skills..." : "Subject or skill..."
            }
            aria-label="Search tutors by subject or skill"
            aria-autocomplete="list"
            aria-expanded={open && suggestions.length > 0}
            className="w-full min-w-0 bg-transparent text-sm text-[#102A56] outline-none placeholder:text-slate-400"
          />

          {mobile && (
            <button
              type="submit"
              className="shrink-0 text-sm font-semibold text-[#0077E6]"
            >
              Search
            </button>
          )}
        </div>
      </form>

      {open && suggestions.length > 0 && (
        <div
          role="listbox"
          aria-label="Search suggestions"
          className="absolute left-0 top-full z-[70] mt-2 w-full min-w-[240px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_45px_rgba(16,42,86,0.15)]"
        >
          <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Suggested searches
          </p>

          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              role="option"
              aria-selected={false}
              onClick={() => submitSearch(suggestion)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-700 transition hover:bg-[#F4F8FB] hover:text-[#0077E6]"
            >
              <Search size={15} className="shrink-0 text-slate-400" />
              <span>{suggestion}</span>
            </button>
          ))}

          <button
            type="button"
            onClick={() => submitSearch(query)}
            className="mt-1 flex w-full items-center justify-between border-t border-slate-100 px-3 py-3 text-left text-xs font-semibold text-[#0077E6]"
          >
            Search for "{query}"<span>Enter ↵</span>
          </button>
        </div>
      )}

      {open && query.trim() && suggestions.length === 0 && (
        <div className="absolute left-0 top-full z-[70] mt-2 w-full min-w-[240px] rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_18px_45px_rgba(16,42,86,0.15)]">
          <p className="px-2 py-2 text-sm text-slate-500">
            No suggested matches.
          </p>

          <button
            type="button"
            onClick={() => submitSearch(query)}
            className="w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#0077E6] transition hover:bg-[#F4F8FB]"
          >
            Search for "{query}" →
          </button>
        </div>
      )}
    </div>
  );
}
