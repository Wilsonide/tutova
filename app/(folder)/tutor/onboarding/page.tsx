"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Subject, Location } from "@/lib/types";
import { toast } from "sonner";
import {
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type LocationType = "STATE" | "LGA" | "CITY" | "NEIGHBORHOOD";

type CatalogLocation = Location & {
  location_type: LocationType;
  parent_id: string | null;
  country_code?: string;
  is_active?: boolean;
};

type LocationListResponse =
  | CatalogLocation[]
  | {
      items?: CatalogLocation[];
      data?: CatalogLocation[];
      results?: CatalogLocation[];
    };

type TutorProfile = {
  id?: string;
  bio: string | null;
  qualifications: string | null;
  hourly_rate: number | string | null;
  years_of_experience: number;
  teaching_languages: string[];
  learner_age_groups: string[];
  tutoring_modes: string[];
  service_area: string | null;
  profile_picture_url?: string | null;
  introduction_video_url?: string | null;
  subject_ids?: string[];
  location_ids?: string[];
};

type CurrentUserResponse = {
  id: string;
  phone_number: string | null;
  is_phone_verified: boolean;
};

type VerificationStatus =
  | "NOT_SUBMITTED"
  | "PENDING_REVIEW"
  | "CHANGES_REQUESTED"
  | "APPROVED"
  | "REJECTED";

type VerificationResponse = {
  id: string;
  status: VerificationStatus;
  nda_version?: string | null;
  nda_accepted_at?: string | null;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  review_notes?: string | null;
};

type UploadResponse = {
  message?: string;
  profile_picture_url?: string | null;
  introduction_video_url?: string | null;
};

type IdentityDocumentType =
  | "NATIONAL_ID"
  | "PASSPORT"
  | "DRIVERS_LICENSE"
  | "OTHER_APPROVED_ID";

type UploadAction =
  | "picture"
  | "video"
  | "identity"
  | "picture-delete"
  | "video-delete"
  | null;

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const AGE_GROUPS = [
  { value: "PRIMARY", label: "Primary learners" },
  { value: "SECONDARY", label: "Secondary learners" },
  { value: "ADULT", label: "Adult learners" },
];

const TEACHING_MODES = [
  { value: "ONLINE", label: "Online" },
  { value: "IN_PERSON", label: "In person" },
  { value: "HYBRID", label: "Hybrid" },
];

const IDENTITY_DOCUMENT_TYPES: {
  value: IdentityDocumentType;
  label: string;
}[] = [
  { value: "NATIONAL_ID", label: "National ID" },
  { value: "PASSPORT", label: "International passport" },
  { value: "DRIVERS_LICENSE", label: "Driver's licence" },
  { value: "OTHER_APPROVED_ID", label: "Other approved ID" },
];

const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  NOT_SUBMITTED: "Not submitted",
  PENDING_REVIEW: "Under review",
  CHANGES_REQUESTED: "Changes requested",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const INITIAL_SUBJECT_LIMIT = 12;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function unwrapLocations(response: LocationListResponse): CatalogLocation[] {
  if (Array.isArray(response)) return response;

  return response.items ?? response.data ?? response.results ?? [];
}

function formatStatus(status: VerificationStatus) {
  return VERIFICATION_LABELS[status] ?? status.replaceAll("_", " ");
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

/* -------------------------------------------------------------------------- */
/* Reusable UI                                                                */
/* -------------------------------------------------------------------------- */

function SelectionButton({
  selected,
  children,
  onClick,
}: {
  selected: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        selected
          ? "border-[#00A99A] bg-[#E8F8F5] text-[#087E75]"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function StepIndicator({
  currentStep,
  onStepChange,
  profileExists,
}: {
  currentStep: 1 | 2;
  onStepChange: (step: 1 | 2) => void;
  profileExists: boolean;
}) {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onStepChange(1)}
          className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
            currentStep === 1
              ? "border-[#1769D2] bg-blue-50"
              : "border-transparent bg-slate-50 hover:bg-slate-100"
          }`}
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
              profileExists
                ? "bg-emerald-100 text-emerald-700"
                : currentStep === 1
                  ? "bg-[#1769D2] text-white"
                  : "bg-slate-200 text-slate-600"
            }`}
          >
            {profileExists ? <Check size={17} /> : "1"}
          </span>

          <span className="min-w-0">
            <span className="block text-sm font-bold text-[#102A56]">
              Profile creation
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">
              Your professional details
            </span>
          </span>
        </button>

        <button
          type="button"
          disabled={!profileExists}
          onClick={() => onStepChange(2)}
          className={`flex items-center gap-3 rounded-xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
            currentStep === 2
              ? "border-[#1769D2] bg-blue-50"
              : "border-transparent bg-slate-50 hover:bg-slate-100"
          }`}
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
              currentStep === 2
                ? "bg-[#1769D2] text-white"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            2
          </span>

          <span className="min-w-0">
            <span className="block text-sm font-bold text-[#102A56]">
              Verification
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">
              Picture, video and identity
            </span>
          </span>
        </button>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full bg-[#00A99A] transition-all ${
            currentStep === 1 ? "w-1/2" : "w-full"
          }`}
        />
      </div>
    </div>
  );
}

function FileUploadCard({
  title,
  description,
  icon,
  accept,
  fileName,
  busy,
  disabled = false,
  actionLabel,
  onChange,
  onRemove,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  accept: string;
  fileName?: string | null;
  busy: boolean;
  disabled?: boolean;
  actionLabel: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove?: () => void;
}) {
  const inputId = `upload-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const unavailable = busy || disabled;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1769D2]">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-[#102A56]">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>

      {fileName && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <CheckCircle2 size={16} className="shrink-0" />
          <span className="min-w-0 flex-1 truncate">{fileName}</span>
        </div>
      )}

      {disabled && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
          Create your tutor profile in Step 1 before uploading this file.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label
          htmlFor={inputId}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            unavailable
              ? "pointer-events-none cursor-not-allowed bg-slate-200 text-slate-500"
              : "cursor-pointer bg-[#102A56] text-white hover:bg-[#173B72]"
          }`}
        >
          {busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Upload size={16} />
          )}
          {busy ? "Uploading…" : actionLabel}
        </label>

        <input
          id={inputId}
          type="file"
          accept={accept}
          className="sr-only"
          disabled={unavailable}
          onChange={onChange}
        />

        {onRemove && fileName && (
          <button
            type="button"
            onClick={onRemove}
            disabled={unavailable}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 size={15} />
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

function LocationSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  loading = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: CatalogLocation[];
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Field label={label}>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled || loading}
          className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 outline-none transition focus:border-[#1769D2] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          <option value="">{loading ? "Loading…" : placeholder}</option>

          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>

        {loading ? (
          <Loader2
            size={15}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400"
          />
        ) : (
          <ChevronRight
            size={15}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400"
          />
        )}
      </div>
    </Field>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function TutorOnboardingPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  /* Profile fields */
  const [bio, setBio] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("0");
  const [languages, setLanguages] = useState("English");
  const [ages, setAges] = useState<string[]>(["PRIMARY"]);
  const [modes, setModes] = useState<string[]>(["ONLINE"]);
  const [area, setArea] = useState("");

  /* Phone number belongs to the authenticated user, not TutorProfile. */
  const [phoneNumber, setPhoneNumber] = useState("");
  const [savedPhoneNumber, setSavedPhoneNumber] = useState<string | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [savedPhoneVerified, setSavedPhoneVerified] = useState(false);

  /* Page state */
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<UploadAction>(null);

  /* Catalogue */
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [catalogTouched, setCatalogTouched] = useState(false);

  /* Subject picker */
  const [subjectSearch, setSubjectSearch] = useState("");
  const [showAllSubjects, setShowAllSubjects] = useState(false);

  /* Location picker */
  const [states, setStates] = useState<CatalogLocation[]>([]);
  const [lgas, setLgas] = useState<CatalogLocation[]>([]);
  const [communities, setCommunities] = useState<CatalogLocation[]>([]);
  const [locationNames, setLocationNames] = useState<Record<string, string>>(
    {},
  );

  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedLgaId, setSelectedLgaId] = useState("");
  const [selectedCommunityId, setSelectedCommunityId] = useState("");
  const [newCommunityName, setNewCommunityName] = useState("");

  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingLgas, setLoadingLgas] = useState(false);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  const [creatingCommunity, setCreatingCommunity] = useState(false);

  /* Upload state */
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(
    null,
  );
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [identityDocumentName, setIdentityDocumentName] = useState<
    string | null
  >(null);

  /* Verification */
  const [identityDocumentType, setIdentityDocumentType] =
    useState<IdentityDocumentType>("NATIONAL_ID");
  const [acceptNda, setAcceptNda] = useState(false);
  const [verification, setVerification] = useState<VerificationResponse | null>(
    null,
  );

  const pictureInputRef = useRef<HTMLInputElement>(null);

  /* ------------------------------------------------------------------------ */
  /* Derived values                                                           */
  /* ------------------------------------------------------------------------ */

  const selectedSubjects = useMemo(
    () => subjects.filter((subject) => subjectIds.includes(subject.id)),
    [subjects, subjectIds],
  );

  const filteredSubjects = useMemo(() => {
    const query = subjectSearch.trim().toLowerCase();

    if (!query) return subjects;

    return subjects.filter((subject) =>
      subject.name.toLowerCase().includes(query),
    );
  }, [subjects, subjectSearch]);

  const visibleSubjects = useMemo(
    () =>
      showAllSubjects || subjectSearch.trim()
        ? filteredSubjects
        : filteredSubjects.slice(0, INITIAL_SUBJECT_LIMIT),
    [filteredSubjects, showAllSubjects, subjectSearch],
  );

  const selectedCommunities = useMemo(
    () =>
      locationIds.map((id) => ({
        id,
        name: locationNames[id] ?? "Previously selected community",
      })),
    [locationIds, locationNames],
  );

  const verificationStatus = verification?.status ?? "NOT_SUBMITTED";

  const verificationIsLocked =
    verificationStatus === "PENDING_REVIEW" ||
    verificationStatus === "APPROVED";

  const verificationStatusClass =
    verificationStatus === "APPROVED"
      ? "bg-emerald-50 text-emerald-700"
      : verificationStatus === "PENDING_REVIEW"
        ? "bg-blue-50 text-blue-700"
        : verificationStatus === "REJECTED" ||
            verificationStatus === "CHANGES_REQUESTED"
          ? "bg-amber-50 text-amber-700"
          : "bg-slate-100 text-slate-600";

  /* ------------------------------------------------------------------------ */
  /* Location API                                                             */
  /* ------------------------------------------------------------------------ */

  async function fetchLocations(params: {
    location_type: LocationType;
    parent_id?: string;
  }) {
    const query = new URLSearchParams();
    query.set("location_type", params.location_type);

    if (params.parent_id) {
      query.set("parent_id", params.parent_id);
    }

    const response = await api<LocationListResponse>(
      `/locations?${query.toString()}`,
      {},
      { auth: false },
    );

    return unwrapLocations(response);
  }

  async function fetchLocationById(locationId: string) {
    return await api<CatalogLocation>(
      `/locations/${encodeURIComponent(locationId)}`,
      {},
      { auth: false },
    );
  }

  function rememberLocations(items: CatalogLocation[]) {
    setLocationNames((current) => {
      const next = { ...current };

      for (const item of items) {
        next[item.id] = item.name;
      }

      return next;
    });
  }

  async function hydrateSavedLocations(savedLocationIds: string[]) {
    if (savedLocationIds.length === 0) return;

    try {
      // Each saved tutor location is a NEIGHBORHOOD whose parent is an LGA.
      // Resolve the saved records and walk up the parent chain to recover the
      // State and LGA selectors when the page is revisited.
      const savedCommunities = await Promise.all(
        savedLocationIds.map((id) => fetchLocationById(id)),
      );

      const activeCommunities = savedCommunities.filter(
        (item) =>
          item.is_active !== false &&
          (item.location_type === "NEIGHBORHOOD" ||
            item.location_type === "CITY") &&
          Boolean(item.parent_id),
      );

      rememberLocations(savedCommunities);

      if (activeCommunities.length === 0) {
        toast.error(
          "Some saved communities could not be restored. Please review your service locations.",
        );
        return;
      }

      const parentLgaIds = Array.from(
        new Set(
          activeCommunities.map((community) => community.parent_id as string),
        ),
      );
      const parentLgas = await Promise.all(parentLgaIds.map(fetchLocationById));
      rememberLocations(parentLgas);

      const firstCommunity = activeCommunities[0];
      const firstLga = parentLgas.find(
        (lga) => lga.id === firstCommunity.parent_id,
      );

      if (
        !firstLga ||
        firstLga.location_type !== "LGA" ||
        !firstLga.parent_id
      ) {
        toast.error(
          "Could not restore the State and LGA for your saved community.",
        );
        return;
      }

      const state = await fetchLocationById(firstLga.parent_id);
      if (state.location_type !== "STATE") {
        toast.error("The saved community is linked to an invalid State.");
        return;
      }

      rememberLocations([state]);
      setStates((current) =>
        current.some((item) => item.id === state.id)
          ? current
          : [...current, state].sort((a, b) => a.name.localeCompare(b.name)),
      );

      // Restore the selector context to the first saved community. Other saved
      // communities remain visible in the selected-community list above.
      setSelectedStateId(state.id);
      setSelectedLgaId(firstLga.id);

      const [stateLgas, lgaCommunities] = await Promise.all([
        fetchLocations({ location_type: "LGA", parent_id: state.id }),
        fetchLocations({
          location_type: "NEIGHBORHOOD",
          parent_id: firstLga.id,
        }),
      ]);

      setLgas(
        stateLgas.some((item) => item.id === firstLga.id)
          ? stateLgas
          : [...stateLgas, firstLga].sort((a, b) =>
              a.name.localeCompare(b.name),
            ),
      );
      setCommunities(lgaCommunities);
      rememberLocations([
        ...stateLgas,
        firstLga,
        ...lgaCommunities,
        ...parentLgas,
      ]);

      // Resolve the names for every saved community, including communities in
      // other LGAs, so the saved-location chips never show placeholder text.
      if (activeCommunities.length !== savedLocationIds.length) {
        toast.error(
          "One or more saved communities are inactive or unavailable. You can remove them and select another community.",
        );
      }
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Could not restore your saved State, LGA and communities. Please try refreshing the page.",
        ),
      );
    }
  }

  async function loadStates() {
    setLoadingStates(true);

    try {
      const result = await fetchLocations({
        location_type: "STATE",
      });

      setStates(result);
      rememberLocations(result);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not load states."));
    } finally {
      setLoadingStates(false);
    }
  }

  async function handleStateChange(stateId: string) {
    setSelectedStateId(stateId);
    setSelectedLgaId("");
    setSelectedCommunityId("");
    setNewCommunityName("");
    setLgas([]);
    setCommunities([]);

    if (!stateId) return;

    setLoadingLgas(true);

    try {
      const result = await fetchLocations({
        location_type: "LGA",
        parent_id: stateId,
      });

      setLgas(result);
      rememberLocations(result);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Could not load LGAs for this state."),
      );
    } finally {
      setLoadingLgas(false);
    }
  }

  async function handleLgaChange(lgaId: string) {
    setSelectedLgaId(lgaId);
    setSelectedCommunityId("");
    setNewCommunityName("");
    setCommunities([]);

    if (!lgaId) return;

    setLoadingCommunities(true);

    try {
      let result = await fetchLocations({
        location_type: "NEIGHBORHOOD",
        parent_id: lgaId,
      });

      // Support existing CITY records only as a fallback.
      if (result.length === 0) {
        result = await fetchLocations({
          location_type: "CITY",
          parent_id: lgaId,
        });
      }

      setCommunities(result);
      rememberLocations(result);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Could not load communities for this LGA."),
      );
    } finally {
      setLoadingCommunities(false);
    }
  }

  function addExistingCommunity() {
    if (!selectedCommunityId) {
      toast.error("Select an existing community first.");
      return;
    }

    if (locationIds.includes(selectedCommunityId)) {
      toast.error("This community has already been added.");
      return;
    }

    const selected = communities.find(
      (community) => community.id === selectedCommunityId,
    );

    if (selected) {
      rememberLocations([selected]);
    }

    setLocationIds((current) => [...current, selectedCommunityId]);
    setCatalogTouched(true);
    setSelectedCommunityId("");
    toast.success("Community added to your service locations.");
  }

  async function createOrReuseCommunity() {
    const name = newCommunityName.trim();

    if (!selectedLgaId) {
      toast.error("Select a State and LGA first.");
      return;
    }

    if (name.length < 2) {
      toast.error("Enter a community name with at least two characters.");
      return;
    }

    if (name.length > 150) {
      toast.error("Community names cannot exceed 150 characters.");
      return;
    }

    // Reuse an already-loaded community in the selected LGA.
    const existing = communities.find(
      (community) => community.name.trim().toLowerCase() === name.toLowerCase(),
    );

    if (existing) {
      if (locationIds.includes(existing.id)) {
        toast.error("This community is already in your service locations.");
        return;
      }

      setLocationIds((current) => [...current, existing.id]);
      setCatalogTouched(true);
      setNewCommunityName("");
      setSelectedCommunityId("");
      toast.success("Existing community added.");
      return;
    }

    setCreatingCommunity(true);

    try {
      const community = await api<CatalogLocation>("/locations/communities", {
        method: "POST",
        body: JSON.stringify({
          name,
          lga_id: selectedLgaId,
        }),
      });

      // Add the returned record to the current list immediately.
      setCommunities((current) => {
        const alreadyPresent = current.some((item) => item.id === community.id);

        return alreadyPresent ? current : [...current, community];
      });

      rememberLocations([community]);

      // Add the new or reused community to the tutor's catalogue selection.
      setLocationIds((current) =>
        current.includes(community.id) ? current : [...current, community.id],
      );

      setCatalogTouched(true);
      setNewCommunityName("");
      setSelectedCommunityId("");

      toast.success("Community added. It is now available for this LGA.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not add this community."));
    } finally {
      setCreatingCommunity(false);
    }
  }

  function removeCommunity(id: string) {
    setLocationIds((current) => current.filter((item) => item !== id));
    setCatalogTouched(true);
  }

  /* ------------------------------------------------------------------------ */
  /* Initial page data                                                        */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let active = true;

    async function loadPage() {
      setLoading(true);

      const results = await Promise.allSettled([
        api<Subject[]>("/subjects", {}, { auth: false }),
        api<TutorProfile>("/tutors/profile"),
        api<VerificationResponse>("/verification/tutor/me"),
        fetchLocations({ location_type: "STATE" }),
        api<CurrentUserResponse>("/auth/me"),
      ]);

      if (!active) return;

      const [
        subjectResult,
        profileResult,
        verificationResult,
        statesResult,
        currentUserResult,
      ] = results;

      if (subjectResult.status === "fulfilled") {
        setSubjects(subjectResult.value);
      } else {
        toast.error("Could not load subjects and learning areas.");
      }

      if (statesResult.status === "fulfilled") {
        setStates(statesResult.value);
        rememberLocations(statesResult.value);
      } else {
        toast.error("Could not load states.");
      }

      if (profileResult.status === "fulfilled") {
        const profile = profileResult.value;

        setExists(true);
        setBio(profile.bio ?? "");
        setQualifications(profile.qualifications ?? "");
        setRate(
          profile.hourly_rate !== null ? String(profile.hourly_rate) : "",
        );
        setYears(String(profile.years_of_experience ?? 0));
        setLanguages((profile.teaching_languages ?? []).join(", "));
        setAges(profile.learner_age_groups ?? []);
        setModes(profile.tutoring_modes ?? ["ONLINE"]);
        setArea(profile.service_area ?? "");
        setProfilePictureUrl(profile.profile_picture_url ?? null);
        setVideoUrl(profile.introduction_video_url ?? null);

        if (Array.isArray(profile.subject_ids)) {
          setSubjectIds(profile.subject_ids);
        }

        if (Array.isArray(profile.location_ids)) {
          setLocationIds(profile.location_ids);
          void hydrateSavedLocations(profile.location_ids);
        }
      }

      if (verificationResult.status === "fulfilled") {
        setVerification(verificationResult.value);
      }

      if (currentUserResult.status === "fulfilled") {
        const currentUser = currentUserResult.value;
        const savedPhone = currentUser.phone_number ?? "";
        setPhoneNumber(savedPhone);
        setSavedPhoneNumber(currentUser.phone_number);
        setPhoneVerified(currentUser.is_phone_verified);
        setSavedPhoneVerified(currentUser.is_phone_verified);
      } else {
        toast.error("Could not load your account phone number.");
      }

      setLoading(false);
    }

    void loadPage();

    return () => {
      active = false;
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Selection helpers                                                        */
  /* ------------------------------------------------------------------------ */

  function toggleSelection(
    value: string,
    selected: string[],
    setSelected: (values: string[]) => void,
  ) {
    setSelected(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    );
  }

  function toggleSubject(id: string) {
    setSubjectIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );

    setCatalogTouched(true);
  }

  /* ------------------------------------------------------------------------ */
  /* Upload helpers                                                           */
  /* ------------------------------------------------------------------------ */

  function validateFile(
    file: File,
    allowedTypes: string[],
    maxSize: number,
    label: string,
  ) {
    if (!allowedTypes.includes(file.type)) {
      toast.error(`Choose a supported ${label} file.`);
      return false;
    }

    if (file.size > maxSize) {
      toast.error(`${label} must not exceed ${maxSize / (1024 * 1024)} MB.`);
      return false;
    }

    if (file.size === 0) {
      toast.error(`The selected ${label} file is empty.`);
      return false;
    }

    return true;
  }

  async function uploadFile(
    endpoint: string,
    file: File,
    action: Exclude<UploadAction, null>,
  ) {
    if (!exists) {
      throw new Error("Create your tutor profile before uploading files.");
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(action);

    try {
      return await api<UploadResponse>(endpoint, {
        method: "POST",
        body: formData,
      });
    } finally {
      setUploading(null);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Profile picture                                                          */
  /* ------------------------------------------------------------------------ */

  async function handleProfilePicture(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!exists) {
      toast.error("Create your tutor profile before uploading a picture.");
      return;
    }

    if (
      !validateFile(
        file,
        ["image/jpeg", "image/png", "image/webp"],
        5 * 1024 * 1024,
        "profile picture",
      )
    ) {
      return;
    }

    try {
      const response = await uploadFile(
        "/tutors/profile/picture",
        file,
        "picture",
      );

      if (response.profile_picture_url) {
        setProfilePictureUrl(response.profile_picture_url);
      } else {
        const profile = await api<TutorProfile>("/tutors/profile");
        setProfilePictureUrl(profile.profile_picture_url ?? null);
      }

      toast.success("Profile picture uploaded.");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Could not upload your profile picture."),
      );
    }
  }

  async function removeProfilePicture() {
    if (!exists) return;

    setUploading("picture-delete");

    try {
      await api("/tutors/profile/picture", {
        method: "DELETE",
      });

      setProfilePictureUrl(null);
      toast.success("Profile picture removed.");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Could not remove your profile picture."),
      );
    } finally {
      setUploading(null);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Introduction video                                                       */
  /* ------------------------------------------------------------------------ */

  async function handleIntroductionVideo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (
      !validateFile(
        file,
        ["video/mp4", "video/webm"],
        100 * 1024 * 1024,
        "introduction video",
      )
    ) {
      return;
    }

    try {
      const response = await uploadFile(
        "/tutors/profile/introduction-video",
        file,
        "video",
      );

      if (response.introduction_video_url) {
        setVideoUrl(response.introduction_video_url);
      } else {
        const profile = await api<TutorProfile>("/tutors/profile");
        setVideoUrl(profile.introduction_video_url ?? null);
      }

      toast.success("Introduction video uploaded.");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Could not upload your introduction video."),
      );
    }
  }

  async function removeIntroductionVideo() {
    if (!exists) return;

    setUploading("video-delete");

    try {
      await api("/tutors/profile/introduction-video", {
        method: "DELETE",
      });

      setVideoUrl(null);
      toast.success("Introduction video removed.");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Could not remove your introduction video."),
      );
    } finally {
      setUploading(null);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Identity document                                                        */
  /* ------------------------------------------------------------------------ */

  async function handleIdentityDocument(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (
      !validateFile(
        file,
        ["application/pdf", "image/jpeg", "image/png"],
        10 * 1024 * 1024,
        "identity document",
      )
    ) {
      return;
    }

    try {
      await uploadFile(
        "/verification/tutor/identity-document",
        file,
        "identity",
      );

      // Only the filename is displayed. Private storage URLs and keys
      // are deliberately not exposed in the tutor interface.
      setIdentityDocumentName(file.name);
      toast.success("Identity document uploaded securely.");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Could not upload your identity document."),
      );
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Step 1: Save profile                                                     */
  /* ------------------------------------------------------------------------ */

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedPhone = phoneNumber.trim();

    if (
      normalizedPhone &&
      normalizedPhone.replace(/[\s()+.-]/g, "").length < 7
    ) {
      toast.error("Enter a valid phone number or leave the field empty.");
      return;
    }

    if (normalizedPhone.length > 30) {
      toast.error("Phone number cannot exceed 30 characters.");
      return;
    }

    if (modes.length === 0) {
      toast.error("Select at least one teaching mode.");
      return;
    }

    if (ages.length === 0) {
      toast.error("Select at least one learner age group.");
      return;
    }

    if (!rate || !Number.isFinite(Number(rate)) || Number(rate) <= 0) {
      toast.error("Enter a valid hourly rate.");
      return;
    }

    if (Number(rate) > 10000000) {
      toast.error("Hourly rate cannot exceed ₦10,000,000.");
      return;
    }

    const experience = Number(years);

    if (!Number.isInteger(experience) || experience < 0 || experience > 80) {
      toast.error("Years of experience must be between 0 and 80.");
      return;
    }

    if (
      (modes.includes("IN_PERSON") || modes.includes("HYBRID")) &&
      locationIds.length === 0
    ) {
      toast.error(
        "Add at least one community for in-person or hybrid tutoring.",
      );
      return;
    }

    const languageList = [
      ...new Set(
        languages
          .split(",")
          .map((language) => language.trim())
          .filter(Boolean),
      ),
    ];

    if (languageList.length === 0) {
      toast.error("Enter at least one teaching language.");
      return;
    }

    if (languageList.length > 20) {
      toast.error("You can enter a maximum of 20 teaching languages.");
      return;
    }

    setBusy(true);

    try {
      await api("/tutors/profile", {
        method: exists ? "PATCH" : "POST",
        body: JSON.stringify({
          bio: bio.trim() || null,
          qualifications: qualifications.trim() || null,
          hourly_rate: Number(rate),
          years_of_experience: experience,
          teaching_languages: languageList,
          learner_age_groups: ages,
          tutoring_modes: modes,
          service_area: area.trim() || null,
        }),
      });

      // Persist the complete catalogue on every save. This also persists
      // deliberate empty selections and prevents stale selections on reload.
      setExists(true);

      await api("/tutors/profile/catalog", {
        method: "PUT",
        body: JSON.stringify({
          subject_ids: subjectIds,
          location_ids: locationIds,
        }),
      });
      setCatalogTouched(false);

      // Phone number is stored on the authenticated User, not TutorProfile.
      // Do not call this endpoint when the number has not changed: doing so
      // would unnecessarily reset the phone verification flag.
      if (normalizedPhone !== (savedPhoneNumber ?? "")) {
        const updatedUser = await api<CurrentUserResponse>(
          "/auth/phone-number",
          {
            method: "PATCH",
            body: JSON.stringify({
              phone_number: normalizedPhone || null,
            }),
          },
        );

        const updatedPhone = updatedUser.phone_number ?? "";
        setPhoneNumber(updatedPhone);
        setSavedPhoneNumber(updatedUser.phone_number);
        setPhoneVerified(updatedUser.is_phone_verified);
        setSavedPhoneVerified(updatedUser.is_phone_verified);
      }

      toast.success("Your tutor profile has been saved.");
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not save your tutor profile."));
    } finally {
      setBusy(false);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Step 2: Submit verification                                              */
  /* ------------------------------------------------------------------------ */

  async function submitVerification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!exists) {
      toast.error("Create your tutor profile in Step 1 first.");
      setCurrentStep(1);
      return;
    }

    if (!acceptNda) {
      toast.error("You must accept the tutor NDA before submitting.");
      return;
    }

    setBusy(true);

    try {
      const response = await api<VerificationResponse>(
        "/verification/tutor/submit",
        {
          method: "POST",
          body: JSON.stringify({
            identity_document_type: identityDocumentType,
            accept_nda: true,
          }),
        },
      );

      setVerification(response);
      setAcceptNda(false);
      toast.success("Your verification has been submitted for review.");
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Could not submit your verification."),
      );
    } finally {
      setBusy(false);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <AppShell
      title="Tutor onboarding"
      description="Create your tutor profile, then complete your verification."
    >
      {loading ? (
        <div className="flex min-h-64 items-center justify-center">
          <Loader2 className="animate-spin text-[#1769D2]" size={28} />
        </div>
      ) : (
        <div className="mx-auto max-w-5xl">
          <StepIndicator
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            profileExists={exists}
          />

          {/* ================================================================= */}
          {/* STEP 1: PROFILE CREATION                                         */}
          {/* ================================================================= */}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#1769D2]">
                  Step 1 of 2
                </p>
                <h2 className="mt-1 text-xl font-bold text-[#102A56]">
                  Create your professional profile
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Tell learners what you teach, your experience and where you
                  are available to teach.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Professional details</CardTitle>
                </CardHeader>

                <CardContent>
                  <form onSubmit={saveProfile} className="space-y-7">
                    <Field
                      label="Phone number"
                      help="Add a number where learners or the Tutova team can reach you. Leave it empty if you do not want to provide one yet."
                    >
                      <div className="space-y-2">
                        <Input
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          maxLength={30}
                          value={phoneNumber}
                          onChange={(event) => {
                            const nextPhone = event.target.value;
                            setPhoneNumber(nextPhone);
                            setPhoneVerified(
                              nextPhone.trim() === (savedPhoneNumber ?? "")
                                ? savedPhoneVerified
                                : false,
                            );
                          }}
                          placeholder="e.g. +234 801 234 5678"
                        />
                        {phoneNumber.trim() ? (
                          <p
                            className={`text-xs font-medium ${
                              phoneVerified
                                ? "text-emerald-700"
                                : "text-amber-700"
                            }`}
                          >
                            {phoneVerified
                              ? "Phone number verified"
                              : "Phone number not verified"}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-500">
                            No phone number added.
                          </p>
                        )}
                      </div>
                    </Field>

                    <Field label="Professional bio">
                      <Textarea
                        value={bio}
                        onChange={(event) => setBio(event.target.value)}
                        rows={5}
                        maxLength={5000}
                        placeholder="Tell learners about your background, teaching approach and what makes your lessons valuable."
                      />
                    </Field>

                    <Field label="Qualifications and expertise">
                      <Textarea
                        value={qualifications}
                        onChange={(event) =>
                          setQualifications(event.target.value)
                        }
                        rows={4}
                        maxLength={5000}
                        placeholder="List relevant qualifications, certifications, professional experience or areas of expertise."
                      />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Hourly rate (₦)">
                        <Input
                          type="number"
                          min="1"
                          max="10000000"
                          step="0.01"
                          required
                          value={rate}
                          onChange={(event) => setRate(event.target.value)}
                          placeholder="e.g. 5000"
                        />
                      </Field>

                      <Field label="Years of experience">
                        <Input
                          type="number"
                          min="0"
                          max="80"
                          step="1"
                          required
                          value={years}
                          onChange={(event) => setYears(event.target.value)}
                        />
                      </Field>
                    </div>

                    <Field
                      label="Teaching languages"
                      help="Separate multiple languages with commas."
                    >
                      <Input
                        value={languages}
                        onChange={(event) => setLanguages(event.target.value)}
                        placeholder="English, Igbo, Yoruba"
                      />
                    </Field>

                    <div>
                      <p className="mb-3 text-sm font-semibold text-[#102A56]">
                        Learner age groups
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {AGE_GROUPS.map((item) => (
                          <SelectionButton
                            key={item.value}
                            selected={ages.includes(item.value)}
                            onClick={() =>
                              toggleSelection(item.value, ages, setAges)
                            }
                          >
                            {item.label}
                          </SelectionButton>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-sm font-semibold text-[#102A56]">
                        Teaching modes
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {TEACHING_MODES.map((item) => (
                          <SelectionButton
                            key={item.value}
                            selected={modes.includes(item.value)}
                            onClick={() =>
                              toggleSelection(item.value, modes, setModes)
                            }
                          >
                            {item.label}
                          </SelectionButton>
                        ))}
                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        Select every mode you offer: online, in person or
                        hybrid.
                      </p>
                    </div>

                    <Field
                      label="Service area"
                      help="A general description of the areas you serve."
                    >
                      <Input
                        value={area}
                        onChange={(event) => setArea(event.target.value)}
                        maxLength={255}
                        placeholder="e.g. Owerri and surrounding areas"
                      />
                    </Field>

                    {/* Subjects */}

                    <div className="border-t border-slate-100 pt-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold text-[#102A56]">
                            What can you teach?
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            Search and select the subjects, skills or learning
                            areas you offer.
                          </p>
                        </div>

                        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#1769D2]">
                          {subjectIds.length} selected
                        </span>
                      </div>

                      {selectedSubjects.length > 0 && (
                        <div className="mt-4 rounded-xl border border-[#BCE8E1] bg-[#F2FBF9] p-4">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <p className="text-xs font-bold uppercase tracking-wide text-[#087E75]">
                              Selected learning areas
                            </p>

                            <button
                              type="button"
                              onClick={() => {
                                setSubjectIds([]);
                                setCatalogTouched(true);
                              }}
                              className="text-xs font-semibold text-slate-500 hover:text-red-600"
                            >
                              Clear all
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {selectedSubjects.map((subject) => (
                              <span
                                key={subject.id}
                                className="inline-flex items-center gap-1.5 rounded-full border border-[#BCE8E1] bg-white px-3 py-1.5 text-xs font-medium text-[#087E75]"
                              >
                                {subject.name}
                                <button
                                  type="button"
                                  aria-label={`Remove ${subject.name}`}
                                  onClick={() => toggleSubject(subject.id)}
                                  className="rounded-full hover:text-red-600"
                                >
                                  <X size={13} />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="relative mt-4">
                        <Search
                          size={17}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <Input
                          value={subjectSearch}
                          onChange={(event) => {
                            setSubjectSearch(event.target.value);
                            setShowAllSubjects(false);
                          }}
                          placeholder="Search for a subject or skill..."
                          className="pl-10"
                        />
                      </div>

                      {subjects.length === 0 ? (
                        <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                          No active subjects or learning areas are currently
                          available.
                        </p>
                      ) : filteredSubjects.length === 0 ? (
                        <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                          No matching subjects found. Try another search.
                        </p>
                      ) : (
                        <>
                          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {visibleSubjects.map((subject) => {
                              const selected = subjectIds.includes(subject.id);

                              return (
                                <button
                                  key={subject.id}
                                  type="button"
                                  aria-pressed={selected}
                                  onClick={() => toggleSubject(subject.id)}
                                  className={`flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                                    selected
                                      ? "border-[#8AD6CB] bg-[#F0FAF8]"
                                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                  }`}
                                >
                                  <span
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                      selected
                                        ? "border-[#00A99A] bg-[#00A99A] text-white"
                                        : "border-slate-300 bg-white"
                                    }`}
                                  >
                                    {selected && <Check size={13} />}
                                  </span>

                                  <span
                                    className={`min-w-0 flex-1 text-sm ${
                                      selected
                                        ? "font-semibold text-[#087E75]"
                                        : "text-slate-600"
                                    }`}
                                  >
                                    {subject.name}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {!subjectSearch.trim() &&
                            filteredSubjects.length > INITIAL_SUBJECT_LIMIT && (
                              <button
                                type="button"
                                onClick={() =>
                                  setShowAllSubjects((current) => !current)
                                }
                                className="mt-4 text-sm font-semibold text-[#1769D2] hover:text-[#102A56]"
                              >
                                {showAllSubjects
                                  ? "Show fewer subjects"
                                  : `Show all ${filteredSubjects.length} learning areas`}
                              </button>
                            )}
                        </>
                      )}
                    </div>

                    {/* Locations */}

                    <div className="border-t border-slate-100 pt-6">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1769D2]">
                          <MapPin size={19} />
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-[#102A56]">
                            Where can you teach in person?
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            Select a State and LGA, then choose an existing
                            community or add one yourself.
                          </p>
                        </div>
                      </div>

                      {states.length === 0 && !loadingStates ? (
                        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                          No states were returned by the location service.
                          Please check that your seeded State records are
                          active.
                        </p>
                      ) : (
                        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <LocationSelect
                              label="1. State"
                              value={selectedStateId}
                              onChange={handleStateChange}
                              options={states}
                              placeholder="Select state"
                              loading={loadingStates}
                            />

                            <LocationSelect
                              label="2. Local Government Area"
                              value={selectedLgaId}
                              onChange={handleLgaChange}
                              options={lgas}
                              placeholder={
                                selectedStateId
                                  ? "Select LGA"
                                  : "Select a state first"
                              }
                              disabled={!selectedStateId}
                              loading={loadingLgas}
                            />
                          </div>

                          <div className="mt-5 border-t border-slate-200 pt-5">
                            <p className="text-sm font-semibold text-[#102A56]">
                              3. Community
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              Choose an existing community or enter a new one.
                              New communities are saved under the selected LGA
                              and become available to other tutors.
                            </p>

                            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                              <LocationSelect
                                label="Existing community"
                                value={selectedCommunityId}
                                onChange={setSelectedCommunityId}
                                options={communities}
                                placeholder={
                                  !selectedLgaId
                                    ? "Select an LGA first"
                                    : communities.length
                                      ? "Select community"
                                      : "No existing communities"
                                }
                                disabled={!selectedLgaId}
                                loading={loadingCommunities}
                              />

                              <div className="flex items-end">
                                <Button
                                  type="button"
                                  variant="outline"
                                  disabled={
                                    !selectedCommunityId ||
                                    creatingCommunity ||
                                    loadingCommunities
                                  }
                                  onClick={addExistingCommunity}
                                  className="w-full sm:w-auto"
                                >
                                  <Plus size={15} className="mr-2" />
                                  Add selected
                                </Button>
                              </div>
                            </div>

                            <div className="my-4 flex items-center gap-3">
                              <div className="h-px flex-1 bg-slate-200" />
                              <span className="text-xs font-medium text-slate-400">
                                OR ADD A NEW COMMUNITY
                              </span>
                              <div className="h-px flex-1 bg-slate-200" />
                            </div>

                            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                              <Field label="Community name">
                                <Input
                                  value={newCommunityName}
                                  onChange={(event) =>
                                    setNewCommunityName(event.target.value)
                                  }
                                  maxLength={150}
                                  disabled={!selectedLgaId || creatingCommunity}
                                  placeholder={
                                    selectedLgaId
                                      ? "Enter community name"
                                      : "Select an LGA first"
                                  }
                                />
                              </Field>

                              <div className="flex items-end">
                                <Button
                                  type="button"
                                  disabled={
                                    !selectedLgaId ||
                                    newCommunityName.trim().length < 2 ||
                                    creatingCommunity
                                  }
                                  onClick={createOrReuseCommunity}
                                  className="w-full sm:w-auto"
                                >
                                  {creatingCommunity ? (
                                    <Loader2
                                      size={15}
                                      className="mr-2 animate-spin"
                                    />
                                  ) : (
                                    <Plus size={15} className="mr-2" />
                                  )}
                                  {creatingCommunity
                                    ? "Adding…"
                                    : "Add community"}
                                </Button>
                              </div>
                            </div>

                            {!selectedLgaId && (
                              <p className="mt-3 text-xs text-slate-500">
                                Select a State and LGA before choosing or
                                creating a community.
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-[#102A56]">
                            Your service communities
                          </p>

                          <span className="text-xs text-slate-500">
                            {locationIds.length} selected
                          </span>
                        </div>

                        {selectedCommunities.length === 0 ? (
                          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                            No communities added yet.
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {selectedCommunities.map((location) => (
                              <span
                                key={location.id}
                                className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-medium text-[#1769D2]"
                              >
                                <MapPin size={14} />
                                {location.name}

                                <button
                                  type="button"
                                  aria-label={`Remove ${location.name}`}
                                  onClick={() => removeCommunity(location.id)}
                                  className="rounded-full hover:text-red-600"
                                >
                                  <X size={14} />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <p className="mt-3 text-xs leading-5 text-slate-500">
                        Online-only tutors can leave the location section empty.
                        In-person and hybrid tutors should add the communities
                        they serve.
                      </p>
                    </div>

                    {/* Save and continue */}

                    <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs leading-5 text-slate-500">
                        Your profile must be saved before you can proceed to
                        verification.
                      </p>

                      <Button
                        type="submit"
                        disabled={
                          busy || uploading !== null || creatingCommunity
                        }
                        className="w-full sm:w-auto"
                      >
                        {busy ? (
                          <Loader2 size={16} className="mr-2 animate-spin" />
                        ) : (
                          <CheckCircle2 size={16} className="mr-2" />
                        )}
                        {busy
                          ? "Saving profile…"
                          : exists
                            ? "Save and continue"
                            : "Create profile and continue"}
                        {!busy && <ChevronRight size={16} className="ml-2" />}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 2: VERIFICATION                                              */}
          {/* ================================================================= */}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#1769D2]">
                  Step 2 of 2
                </p>
                <h2 className="mt-1 text-xl font-bold text-[#102A56]">
                  Verify your tutor account
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Add your profile picture, introduce yourself, upload an
                  identity document and agree to the tutor NDA.
                </p>
              </div>

              {!exists && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-900">
                    Your profile has not been created yet.
                  </p>
                  <p className="mt-1 text-sm text-amber-800">
                    Complete Step 1 before continuing with verification.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-3"
                    onClick={() => setCurrentStep(1)}
                  >
                    <ChevronLeft size={16} className="mr-2" />
                    Return to profile creation
                  </Button>
                </div>
              )}

              {/* Profile picture */}

              <Card>
                <CardHeader>
                  <CardTitle>Profile picture</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                      {profilePictureUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={profilePictureUrl}
                          alt="Your tutor profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Camera size={34} className="text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-[#102A56]">
                        Make your profile recognisable
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Use a clear, professional photograph. JPEG, PNG or WebP,
                        maximum 5 MB.
                      </p>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <Button
                          type="button"
                          disabled={!exists || uploading !== null}
                          onClick={() => pictureInputRef.current?.click()}
                        >
                          {uploading === "picture" ? (
                            <Loader2 size={16} className="mr-2 animate-spin" />
                          ) : (
                            <Upload size={16} className="mr-2" />
                          )}
                          {!exists
                            ? "Create profile first"
                            : profilePictureUrl
                              ? "Change picture"
                              : "Upload picture"}
                        </Button>

                        {profilePictureUrl && (
                          <Button
                            type="button"
                            variant="outline"
                            disabled={uploading !== null}
                            onClick={removeProfilePicture}
                          >
                            {uploading === "picture-delete" ? (
                              <Loader2
                                size={16}
                                className="mr-2 animate-spin"
                              />
                            ) : (
                              <Trash2 size={16} className="mr-2" />
                            )}
                            Remove
                          </Button>
                        )}
                      </div>

                      <input
                        ref={pictureInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={!exists || uploading !== null}
                        onChange={handleProfilePicture}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Verification status */}

              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle>Verification status</CardTitle>

                    <span
                      className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-bold ${verificationStatusClass}`}
                    >
                      {formatStatus(verificationStatus)}
                    </span>
                  </div>
                </CardHeader>

                <CardContent>
                  {verification?.review_notes && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm font-semibold text-amber-900">
                        Feedback from the review team
                      </p>

                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-amber-800">
                        {verification.review_notes}
                      </p>
                    </div>
                  )}

                  {verificationIsLocked && (
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-[#102A56]">
                        {verificationStatus === "APPROVED"
                          ? "Your tutor verification has been approved."
                          : "Your verification is awaiting review."}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {verificationStatus === "APPROVED"
                          ? "Your verification has been approved. You do not need to submit it again."
                          : "Your documents are being reviewed. You will be able to respond if the review team requests changes."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Introduction video */}

              {!verificationIsLocked && (
                <Card>
                  <CardHeader>
                    <CardTitle>Introduction video</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm leading-6 text-slate-500">
                      Help learners get to know you. Introduce yourself, explain
                      what you teach and describe how you help learners make
                      progress.
                    </p>

                    {videoUrl && (
                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black">
                        <video
                          src={videoUrl}
                          controls
                          playsInline
                          className="max-h-[420px] w-full"
                        >
                          Your browser does not support video playback.
                        </video>
                      </div>
                    )}

                    <FileUploadCard
                      title="Tutor introduction"
                      description="MP4 or WebM video, maximum 100 MB and 2 minutes. Uploading another video replaces the existing introduction."
                      icon={<Video size={21} />}
                      accept="video/mp4,video/webm"
                      fileName={videoUrl ? "Introduction video uploaded" : null}
                      busy={
                        uploading === "video" || uploading === "video-delete"
                      }
                      disabled={!exists}
                      actionLabel={videoUrl ? "Replace video" : "Upload video"}
                      onChange={handleIntroductionVideo}
                      onRemove={videoUrl ? removeIntroductionVideo : undefined}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Identity document and NDA */}

              {!verificationIsLocked && (
                <Card>
                  <CardHeader>
                    <CardTitle>Identity document and agreement</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                      <ShieldCheck
                        size={20}
                        className="mt-0.5 shrink-0 text-[#1769D2]"
                      />

                      <div>
                        <p className="text-sm font-semibold text-[#102A56]">
                          Your identity document is private
                        </p>

                        <p className="mt-1 text-sm leading-6 text-blue-900/80">
                          Identity documents are uploaded to private storage and
                          are made available only through the authorised
                          verification process. They are not displayed on your
                          public tutor profile.
                        </p>
                      </div>
                    </div>

                    <FileUploadCard
                      title="Identity document"
                      description="Upload a valid National ID, international passport, driver's licence or other approved identity document. PDF, JPEG or PNG, maximum 10 MB."
                      icon={<FileText size={21} />}
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      fileName={identityDocumentName}
                      busy={uploading === "identity"}
                      disabled={!exists}
                      actionLabel={
                        identityDocumentName
                          ? "Replace document"
                          : "Upload document"
                      }
                      onChange={handleIdentityDocument}
                    />

                    <Field label="Identity document type">
                      <select
                        value={identityDocumentType}
                        onChange={(event) =>
                          setIdentityDocumentType(
                            event.target.value as IdentityDocumentType,
                          )
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#1769D2] focus:ring-2 focus:ring-blue-100"
                      >
                        {IDENTITY_DOCUMENT_TYPES.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <form onSubmit={submitVerification} className="space-y-5">
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
                        <input
                          type="checkbox"
                          checked={acceptNda}
                          onChange={(event) =>
                            setAcceptNda(event.target.checked)
                          }
                          className="mt-1 h-4 w-4 accent-[#1769D2]"
                        />

                        <span className="text-sm leading-6 text-slate-600">
                          I have read and agree to the Tutova tutor
                          non-disclosure agreement (NDA), including the
                          confidentiality and safeguarding responsibilities
                          applicable to tutors on the platform.
                        </span>
                      </label>

                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-[#102A56]">
                          Before submitting
                        </p>

                        <ul className="mt-2 space-y-1.5 text-sm text-slate-500">
                          <li>Your professional profile must be saved.</li>
                          <li>Your introduction video must be uploaded.</li>
                          <li>Your identity document must be uploaded.</li>
                          <li>You must accept the tutor NDA.</li>
                        </ul>

                        <p className="mt-3 text-xs leading-5 text-slate-500">
                          The server checks that the required uploads are stored
                          before accepting your verification submission.
                        </p>
                      </div>

                      <Button
                        type="submit"
                        disabled={
                          busy || uploading !== null || !acceptNda || !exists
                        }
                        className="w-full sm:w-auto"
                      >
                        {busy ? (
                          <Loader2 size={16} className="mr-2 animate-spin" />
                        ) : (
                          <ShieldCheck size={16} className="mr-2" />
                        )}
                        {busy ? "Submitting…" : "Submit for verification"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Step navigation */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCurrentStep(1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <ChevronLeft size={16} className="mr-2" />
                  Back to profile
                </Button>

                <p className="text-xs leading-5 text-slate-500">
                  You can return to Step 1 to update your professional details.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
