"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { api } from "@/lib/api";
import type { TutoringRequest, Subject, Location } from "@/lib/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";

import {
  ArrowRight,
  Ban,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Info,
  MapPin,
  RefreshCw,
  UserRound,
  Wallet,
  X,
} from "lucide-react";

type RequestRow = TutoringRequest & {
  selected_tutor_id?: string | null;
  assigned_tutor_id?: string | null;
  requester_first_name?: string;
  requester_last_name?: string;
  requester_account_type?: string | null;
  subject_name?: string;
  location_name?: string | null;
};

type MatchingTutor = {
  tutor_user_id: string;
  first_name: string;
  last_name: string;
  bio: string | null;
  hourly_rate: number | string | null;
  qualifications: string | null;
  years_of_experience: number;
  teaching_languages: string[];
  learner_age_groups: string[];
  tutoring_modes: string[];
  service_area: string | null;
  subjects: string[];
  locations: string[];
  match_level: "STRONG" | "PARTIAL";
  match_reasons: string[];
  unmatched_criteria: string[];
};

type PublicTutor = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  bio: string | null;
  qualifications: string | null;
  years_of_experience: number;
  hourly_rate: number | string | null;
  teaching_languages: string[];
  learner_age_groups: string[];
  tutoring_modes: string[];
  profile_picture_url: string | null;
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
  introduction_video_url: string | null;
};

type BookingStatus =
  | "PENDING_TUTOR_CONFIRMATION"
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "DECLINED"
  | "CANCELLED"
  | "AWAITING_LEARNER_ACKNOWLEDGEMENT"
  | "DISPUTED"
  | "COMPLETED";

type LessonBooking = {
  id: string;
  tutoring_request_id: string;
  tutor_profile_id: string;
  requester_user_id: string;
  start_at: string;
  end_at: string;
  duration_minutes: number;
  hourly_rate: number | string;
  gross_amount_minor: number;
  currency: string;
  status: BookingStatus;
  meeting_link: string | null;
  location_id: string | null;
  lesson_notes: string | null;
  cancellation_reason: string | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  tutor_completed_at: string | null;
  learner_acknowledged_at: string | null;
  disputed_at: string | null;
  dispute_reason: string | null;
  acknowledgement_deadline_at: string | null;
  acknowledgement_reminder_sent_at: string | null;
  admin_review_required_at: string | null;
  admin_reviewed_at: string | null;
  admin_reviewed_by_user_id: string | null;
  admin_review_notes: string | null;
};

type AccountProfileStatus = "loading" | "ready" | "missing" | "error";

/**
 * Sort tutoring requests:
 * 1. ACCEPTED requests first.
 * 2. Other requests afterwards.
 * 3. Newest requests first within each status group.
 */
function sortRequests(items: RequestRow[]) {
  return [...items].sort((a, b) => {
    if (a.status === "ACCEPTED" && b.status !== "ACCEPTED") {
      return -1;
    }

    if (a.status !== "ACCEPTED" && b.status === "ACCEPTED") {
      return 1;
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

/**
 * Sort bookings by workflow priority:
 * 1. Awaiting tutor response.
 * 2. Legacy bookings awaiting learner confirmation.
 * 3. Confirmed lessons.
 * 4. Awaiting learner acknowledgement.
 * 5. Disputed lessons.
 * 6. Declined bookings.
 * 7. Cancelled bookings.
 * 8. Completed bookings.
 *
 * Newest bookings appear first within each status.
 */
function sortBookings(items: LessonBooking[]) {
  const priority: Record<BookingStatus, number> = {
    PENDING_TUTOR_CONFIRMATION: 0,
    PENDING_CONFIRMATION: 1,
    CONFIRMED: 2,
    AWAITING_LEARNER_ACKNOWLEDGEMENT: 3,
    DISPUTED: 4,
    DECLINED: 5,
    CANCELLED: 6,
    COMPLETED: 7,
  };

  return [...items].sort((a, b) => {
    const statusDifference = priority[a.status] - priority[b.status];

    if (statusDifference !== 0) {
      return statusDifference;
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

function formatRate(rate: number | string | null) {
  if (rate === null || rate === undefined) {
    return "Rate not specified";
  }

  const numericRate = Number(rate);

  if (!Number.isFinite(numericRate)) {
    return "Rate not specified";
  }

  return `₦${numericRate.toLocaleString("en-NG")}/hour`;
}

function formatBookingAmount(booking: LessonBooking) {
  const amount = Number(booking.gross_amount_minor) / 100;

  if (!Number.isFinite(amount)) {
    return "Amount unavailable";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: booking.currency || "NGN",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getTutorName(tutor: PublicTutor) {
  return (
    tutor.full_name?.trim() || `${tutor.first_name} ${tutor.last_name}`.trim()
  );
}

function getRequesterName(request: RequestRow) {
  const name = [request.requester_first_name, request.requester_last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || "Requester";
}

function getRequesterType(request: RequestRow) {
  switch (request.requester_account_type?.toUpperCase()) {
    case "PARENT":
      return "Parent";
    case "ADULT_LEARNER":
      return "Adult learner";
    default:
      return "Learner";
  }
}

function getRequestStatusDescription(request: RequestRow) {
  if (request.status === "ACCEPTED") {
    return "A tutor has accepted this request. You can now request a lesson session.";
  }

  if (request.status === "OPEN" && request.selected_tutor_id) {
    return "This request has been directed to your selected tutor.";
  }

  if (request.status === "OPEN") {
    return "Your request is open and available for matching tutors.";
  }

  if (request.status === "CANCELLED") {
    return "You cancelled this tutoring request.";
  }

  return "View the latest status of your tutoring request.";
}

function getBookingStatusLabel(status: BookingStatus) {
  switch (status) {
    case "PENDING_TUTOR_CONFIRMATION":
      return "Awaiting tutor response";
    case "PENDING_CONFIRMATION":
      return "Awaiting learner confirmation";
    case "CONFIRMED":
      return "Confirmed";
    case "DECLINED":
      return "Declined";
    case "CANCELLED":
      return "Cancelled";
    case "AWAITING_LEARNER_ACKNOWLEDGEMENT":
      return "Awaiting lesson acknowledgement";
    case "DISPUTED":
      return "Under review";
    case "COMPLETED":
      return "Completed";
    default:
      return status.replaceAll("_", " ");
  }
}

function getBookingStatusClasses(status: BookingStatus) {
  switch (status) {
    case "PENDING_TUTOR_CONFIRMATION":
    case "PENDING_CONFIRMATION":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "CONFIRMED":
      return "border-blue-200 bg-blue-50 text-blue-800";
    case "COMPLETED":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "DISPUTED":
      return "border-red-200 bg-red-50 text-red-800";
    case "DECLINED":
    case "CANCELLED":
      return "border-slate-200 bg-slate-100 text-slate-600";
    case "AWAITING_LEARNER_ACKNOWLEDGEMENT":
      return "border-purple-200 bg-purple-50 text-purple-800";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getBookingStatusClasses(status)}`}
    >
      {getBookingStatusLabel(status)}
    </span>
  );
}

function BookingDetails({
  booking,
  children,
}: {
  booking: LessonBooking;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <BookingStatusBadge status={booking.status} />
            <span className="text-xs text-slate-400">
              Booking {booking.id.slice(0, 8)}
            </span>
          </div>

          <div className="mt-3 flex items-start gap-2 text-sm text-slate-700">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <span>{formatDateTime(booking.start_at)}</span>
          </div>

          <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            <Clock3 className="h-4 w-4 shrink-0 text-slate-400" />
            {booking.duration_minutes} minutes
          </div>

          <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-800">
            <Wallet className="h-4 w-4 shrink-0 text-slate-400" />
            {formatBookingAmount(booking)}
          </div>
        </div>
      </div>

      {booking.meeting_link && (
        <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2">
          <p className="text-xs font-semibold text-blue-800">Meeting link</p>
          <a
            href={booking.meeting_link}
            target="_blank"
            rel="noreferrer"
            className="mt-1 block break-all text-sm text-blue-700 underline underline-offset-2"
          >
            {booking.meeting_link}
          </a>
        </div>
      )}

      {booking.lesson_notes && (
        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Lesson notes
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {booking.lesson_notes}
          </p>
        </div>
      )}

      {booking.cancellation_reason && (
        <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2">
          <p className="text-xs font-semibold text-slate-500">
            Cancellation / decline reason
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {booking.cancellation_reason}
          </p>
        </div>
      )}

      {children}
    </div>
  );
}

export default function RequestsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [rows, setRows] = useState<RequestRow[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [bookings, setBookings] = useState<LessonBooking[]>([]);

  const [profileStatus, setProfileStatus] =
    useState<AccountProfileStatus>("loading");

  const [selectedTutorId, setSelectedTutorId] = useState("");
  const [selectedTutor, setSelectedTutor] = useState<PublicTutor | null>(null);
  const [selectedTutorLoading, setSelectedTutorLoading] = useState(false);
  const [selectedTutorError, setSelectedTutorError] = useState("");

  const [states, setStates] = useState<Location[]>([]);
  const [lgas, setLgas] = useState<Location[]>([]);
  const [communities, setCommunities] = useState<Location[]>([]);

  const [stateId, setStateId] = useState("");
  const [lgaId, setLgaId] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [locationId, setLocationId] = useState("");

  const [statesLoading, setStatesLoading] = useState(false);
  const [lgasLoading, setLgasLoading] = useState(false);
  const [communitiesLoading, setCommunitiesLoading] = useState(false);

  const [subjectId, setSubjectId] = useState("");
  const [subjectQuery, setSubjectQuery] = useState("");

  const [mode, setMode] = useState("ONLINE");
  const [description, setDescription] = useState("");
  const [schedule, setSchedule] = useState("");

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [cancellingRequestId, setCancellingRequestId] = useState<string | null>(
    null,
  );

  const [submittedRequest, setSubmittedRequest] = useState(false);
  const [submittedTutorName, setSubmittedTutorName] = useState("");

  const [matchingRequestId, setMatchingRequestId] = useState<string | null>(
    null,
  );
  const [matchingTutors, setMatchingTutors] = useState<MatchingTutor[]>([]);
  const [matchingLoading, setMatchingLoading] = useState(false);

  // Learner booking request form.
  const [bookingRequest, setBookingRequest] = useState("");
  const [startAt, setStartAt] = useState("");
  const [duration, setDuration] = useState("60");
  const [lessonNotes, setLessonNotes] = useState("");

  // Booking actions.
  const [bookingActionId, setBookingActionId] = useState<string | null>(null);

  // Read tutor selection from the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSelectedTutorId(params.get("tutor_id")?.trim() || "");
  }, []);

  // Load selected tutor.
  useEffect(() => {
    if (!selectedTutorId) {
      setSelectedTutor(null);
      setSelectedTutorError("");
      setSelectedTutorLoading(false);
      return;
    }

    let cancelled = false;

    async function loadSelectedTutor() {
      setSelectedTutorLoading(true);
      setSelectedTutorError("");
      setSelectedTutor(null);

      try {
        const result = await api<PublicTutor>(
          `/tutors/${encodeURIComponent(selectedTutorId)}`,
          { method: "GET" },
        );

        if (!cancelled) {
          setSelectedTutor(result);
        }
      } catch (error) {
        console.error("Failed to load selected tutor:", error);

        if (!cancelled) {
          setSelectedTutorError(
            "We couldn't load the selected tutor's profile. Remove this selection to submit a general tutoring request.",
          );
        }
      } finally {
        if (!cancelled) {
          setSelectedTutorLoading(false);
        }
      }
    }

    void loadSelectedTutor();

    return () => {
      cancelled = true;
    };
  }, [selectedTutorId]);

  async function load() {
    setLoading(true);

    try {
      const requestEndpoint =
        user?.role === "TUTOR"
          ? "/tutoring-requests/matching"
          : "/tutoring-requests/mine";

      const [requestResult, bookingResult] = await Promise.allSettled([
        api<RequestRow[]>(requestEndpoint),
        api<LessonBooking[]>("/session-bookings/mine"),
      ]);

      if (requestResult.status === "fulfilled") {
        setRows(requestResult.value);
      } else {
        setRows([]);
        toast.error(
          requestResult.reason instanceof Error
            ? requestResult.reason.message
            : "Could not load tutoring requests",
        );
      }

      if (bookingResult.status === "fulfilled") {
        setBookings(bookingResult.value);
      } else {
        setBookings([]);
        console.error("Could not load lesson bookings:", bookingResult.reason);
        toast.error(
          bookingResult.reason instanceof Error
            ? bookingResult.reason.message
            : "Could not load lesson bookings",
        );
      }

      return requestResult.status === "fulfilled" ? requestResult.value : [];
    } finally {
      setLoading(false);
    }
  }

  // Load public form options.
  useEffect(() => {
    let cancelled = false;

    async function loadFormOptions() {
      setStatesLoading(true);

      try {
        const [stateResults, subjectResults] = await Promise.all([
          api<Location[]>(
            "/locations?location_type=STATE",
            {},
            { auth: false },
          ),
          api<Subject[]>("/subjects", {}, { auth: false }),
        ]);

        if (!cancelled) {
          setStates(stateResults);
          setSubjects(subjectResults);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Could not load subjects and locations",
          );
        }
      } finally {
        if (!cancelled) {
          setStatesLoading(false);
        }
      }
    }

    void loadFormOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load LGAs when the state changes.
  useEffect(() => {
    let cancelled = false;

    setLgas([]);
    setLgaId("");
    setCommunities([]);
    setCommunityId("");
    setLocationId("");

    if (!stateId) {
      setLgasLoading(false);
      return;
    }

    async function loadLgas() {
      setLgasLoading(true);

      try {
        const results = await api<Location[]>(
          `/locations?location_type=LGA&parent_id=${encodeURIComponent(stateId)}`,
          {},
          { auth: false },
        );

        if (!cancelled) {
          setLgas(results);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error ? error.message : "Could not load LGAs",
          );
        }
      } finally {
        if (!cancelled) {
          setLgasLoading(false);
        }
      }
    }

    void loadLgas();

    return () => {
      cancelled = true;
    };
  }, [stateId]);

  // Load communities when the LGA changes.
  useEffect(() => {
    let cancelled = false;

    setCommunities([]);
    setCommunityId("");
    setLocationId(lgaId);

    if (!lgaId) {
      setCommunitiesLoading(false);
      return;
    }

    async function loadCommunities() {
      setCommunitiesLoading(true);

      try {
        const results = await api<Location[]>(
          `/locations?location_type=NEIGHBORHOOD&parent_id=${encodeURIComponent(lgaId)}`,
          {},
          { auth: false },
        );

        if (!cancelled) {
          setCommunities(results);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Could not load communities",
          );
        }
      } finally {
        if (!cancelled) {
          setCommunitiesLoading(false);
        }
      }
    }

    void loadCommunities();

    return () => {
      cancelled = true;
    };
  }, [lgaId]);

  useEffect(() => {
    setLocationId(communityId || lgaId);
  }, [communityId, lgaId]);

  // Prepare authenticated account profile.
  useEffect(() => {
    if (!user?.role) return;

    if (user.role === "TUTOR") {
      setProfileStatus("ready");
      void load();
      return;
    }

    if (user.role !== "PARENT" && user.role !== "ADULT_LEARNER") {
      setProfileStatus("error");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function prepareAccountProfile() {
      setProfileStatus("loading");

      try {
        if (user.role === "PARENT") {
          try {
            await api("/parents/profile");
          } catch {
            await api("/parents/profile", {
              method: "POST",
            });
          }
        }

        if (user.role === "ADULT_LEARNER") {
          try {
            await api("/learners/profile");
          } catch {
            await api("/learners/profile", {
              method: "POST",
              body: JSON.stringify({
                first_name: user.first_name,
                last_name: user.last_name,
              }),
            });
          }
        }

        if (cancelled) return;

        setProfileStatus("ready");
        await load();
      } catch (error) {
        if (cancelled) return;

        console.error("Account profile preparation failed:", error);
        setProfileStatus("error");

        toast.error(
          error instanceof Error
            ? error.message
            : "Could not prepare your account profile",
        );

        setLoading(false);
      }
    }

    void prepareAccountProfile();

    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  function resetRequestForm() {
    setSubjectId("");
    setSubjectQuery("");
    setMode("ONLINE");

    setStateId("");
    setLgaId("");
    setCommunityId("");
    setLocationId("");

    setLgas([]);
    setCommunities([]);

    setDescription("");
    setSchedule("");
  }

  function clearSelectedTutor() {
    setSelectedTutorId("");
    setSelectedTutor(null);
    setSelectedTutorError("");
    setSelectedTutorLoading(false);

    router.replace("/requests", { scroll: false });
  }

  // Submit tutoring request.
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (profileStatus !== "ready") {
      toast.error("Your account profile is not ready yet.");
      return;
    }

    if (
      !subjectId ||
      !description.trim() ||
      description.trim().length < 10 ||
      (mode === "IN_PERSON" && (!stateId || !lgaId || !locationId))
    ) {
      toast.error("Please complete all required fields.");
      return;
    }

    if (selectedTutorId && selectedTutorLoading) {
      toast.error("Please wait while the selected tutor's profile loads.");
      return;
    }

    if (selectedTutorId && !selectedTutor) {
      toast.error(
        "The selected tutor could not be verified. Remove the selection before submitting a general request.",
      );
      return;
    }

    if (selectedTutor) {
      const supportsSubject = selectedTutor.subjects.some(
        (subject) => subject.id === subjectId,
      );

      if (!supportsSubject) {
        toast.error(
          "The selected tutor does not list this learning area. Choose one of their listed learning areas or remove the tutor selection.",
        );
        return;
      }

      if (!selectedTutor.tutoring_modes.includes(mode)) {
        toast.error(
          "The selected tutor does not offer this tutoring mode. Choose an available mode or remove the tutor selection.",
        );
        return;
      }
    }

    const selectedTutorUserId = selectedTutor?.user_id ?? null;
    const selectedTutorName = selectedTutor ? getTutorName(selectedTutor) : "";

    setBusy(true);
    setSubmittedRequest(false);

    try {
      const payload = {
        subject_id: subjectId,
        location_id: mode === "IN_PERSON" ? locationId : null,
        tutoring_mode: mode,
        description: description.trim(),
        preferred_schedule: schedule.trim() || null,
        selected_tutor_user_id: selectedTutorUserId,
      };

      await api("/tutoring-requests", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSubmittedTutorName(selectedTutorName);
      resetRequestForm();

      if (selectedTutorUserId) {
        clearSelectedTutor();
      }

      setSubmittedRequest(true);

      toast.success("Your tutoring request has been submitted.");

      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  async function cancelRequest(request: RequestRow) {
    if (request.status !== "OPEN") {
      toast.error("Only open tutoring requests can be cancelled.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this tutoring request? This action cannot be undone.",
    );

    if (!confirmed) return;

    setCancellingRequestId(request.id);

    try {
      await api(
        `/tutoring-requests/mine/${encodeURIComponent(request.id)}/cancel`,
        { method: "POST" },
      );

      toast.success("Your tutoring request has been cancelled.");

      if (matchingRequestId === request.id) {
        setMatchingRequestId(null);
        setMatchingTutors([]);
      }

      await load();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not cancel this request",
      );
    } finally {
      setCancellingRequestId(null);
    }
  }

  async function findMatchingTutors(requestId: string) {
    if (matchingRequestId === requestId) {
      setMatchingRequestId(null);
      setMatchingTutors([]);
      return;
    }

    setMatchingRequestId(requestId);
    setMatchingTutors([]);
    setMatchingLoading(true);

    try {
      const tutors = await api<MatchingTutor[]>(
        `/tutoring-requests/mine/${encodeURIComponent(requestId)}/matching-tutors`,
      );

      setMatchingTutors(tutors);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not load matching tutors",
      );

      setMatchingRequestId(null);
    } finally {
      setMatchingLoading(false);
    }
  }

  // Tutor accepts or declines a tutoring request.
  async function decide(id: string, decision: "ACCEPT" | "DECLINE") {
    try {
      await api(`/tutoring-requests/${encodeURIComponent(id)}/respond`, {
        method: "POST",
        body: JSON.stringify({ decision }),
      });

      toast.success(
        decision === "ACCEPT" ? "Request accepted" : "Request declined",
      );

      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not respond");
    }
  }

  // Learner creates a booking request after the tutoring request is accepted.
  async function createBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!bookingRequest) {
      toast.error("Select an accepted tutoring request first.");
      return;
    }

    if (!startAt) {
      toast.error("Please select a lesson date and time.");
      return;
    }

    const proposedStart = new Date(startAt);

    if (Number.isNaN(proposedStart.getTime()) || proposedStart <= new Date()) {
      toast.error("The lesson time must be in the future.");
      return;
    }

    const selectedRequest = rows.find(
      (request) => request.id === bookingRequest,
    );

    if (!selectedRequest || selectedRequest.status !== "ACCEPTED") {
      toast.error("Only accepted tutoring requests can be booked.");
      return;
    }

    setBusy(true);

    try {
      await api(
        `/session-bookings/requests/${encodeURIComponent(bookingRequest)}`,
        {
          method: "POST",
          body: JSON.stringify({
            start_at: proposedStart.toISOString(),
            duration_minutes: Number(duration),
            lesson_notes: lessonNotes.trim() || null,
          }),
        },
      );

      toast.success("Your lesson booking request has been sent to the tutor.");

      setBookingRequest("");
      setStartAt("");
      setDuration("60");
      setLessonNotes("");

      await load();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not send your booking request",
      );
    } finally {
      setBusy(false);
    }
  }

  // Tutor accepts a learner's booking request.
  async function acceptBooking(booking: LessonBooking) {
    const relatedRequest = rows.find(
      (request) => request.id === booking.tutoring_request_id,
    );

    const isInPerson = relatedRequest?.tutoring_mode === "IN_PERSON";

    let meetingLink: string | null = null;

    if (!isInPerson) {
      const enteredLink = window.prompt(
        "Enter an online meeting link (optional). Leave blank if you will share it later.",
        "",
      );

      if (enteredLink === null) {
        return;
      }

      meetingLink = enteredLink.trim() || null;

      if (meetingLink && !/^https?:\/\/\S+$/i.test(meetingLink)) {
        toast.error(
          "Please enter a valid meeting link beginning with http:// or https://.",
        );
        return;
      }
    }

    setBookingActionId(booking.id);

    try {
      await api(`/session-bookings/${encodeURIComponent(booking.id)}/accept`, {
        method: "POST",
        body: JSON.stringify({
          meeting_link: meetingLink,
        }),
      });

      toast.success("Booking accepted. The learner has been notified.");
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not accept this booking",
      );
    } finally {
      setBookingActionId(null);
    }
  }

  // Tutor declines a learner's booking request.
  async function declineBooking(bookingId: string) {
    const reason = window.prompt(
      "Please provide a reason for declining this booking request:",
    );

    if (reason === null) return;

    if (!reason.trim()) {
      toast.error("Please provide a reason for declining the booking.");
      return;
    }

    setBookingActionId(bookingId);

    try {
      await api(`/session-bookings/${encodeURIComponent(bookingId)}/decline`, {
        method: "POST",
        body: JSON.stringify({
          reason: reason.trim(),
        }),
      });

      toast.success("Booking request declined.");
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not decline this booking",
      );
    } finally {
      setBookingActionId(null);
    }
  }

  // Legacy booking confirmation. New bookings do not use this action.
  async function confirmLegacyBooking(bookingId: string) {
    const confirmed = window.confirm("Confirm this legacy lesson booking?");

    if (!confirmed) return;

    setBookingActionId(bookingId);

    try {
      await api(`/session-bookings/${encodeURIComponent(bookingId)}/confirm`, {
        method: "POST",
      });

      toast.success("Lesson booking confirmed.");
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not confirm this booking",
      );
    } finally {
      setBookingActionId(null);
    }
  }

  const isTutor = user?.role === "TUTOR";

  // Sorted requests are used by both dashboards.
  const prioritizedRows = sortRequests(rows);

  // Tutor dashboard.
  if (isTutor) {
    const tutorBookings = sortBookings(
      bookings.filter((booking) =>
        [
          "PENDING_TUTOR_CONFIRMATION",
          "PENDING_CONFIRMATION",
          "CONFIRMED",
          "AWAITING_LEARNER_ACKNOWLEDGEMENT",
          "DISPUTED",
        ].includes(booking.status),
      ),
    );

    const pendingTutorBookings = tutorBookings.filter(
      (booking) => booking.status === "PENDING_TUTOR_CONFIRMATION",
    );

    const otherTutorBookings = tutorBookings.filter(
      (booking) => booking.status !== "PENDING_TUTOR_CONFIRMATION",
    );

    return (
      <AppShell
        title="Tutoring requests"
        description="Review matching tutoring requests and manage lesson booking requests from learners."
      >
        <div className="space-y-6">
          {/* Incoming booking requests */}
          <section>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#102A56]">
                  Incoming lesson booking requests
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Learners choose their preferred lesson time. Review each
                  request and accept or decline it.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void load()}
                disabled={loading}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>

            {loading ? (
              <p className="text-sm text-slate-500">
                Loading booking requests…
              </p>
            ) : pendingTutorBookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CalendarDays className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-3 font-medium text-slate-800">
                    No pending booking requests
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    New booking requests from learners will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingTutorBookings.map((booking) => {
                  const relatedRequest = rows.find(
                    (request) => request.id === booking.tutoring_request_id,
                  );

                  return (
                    <Card key={booking.id}>
                      <CardContent className="p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <BookingStatusBadge status={booking.status} />
                              <span className="text-xs text-slate-400">
                                Booking {booking.id.slice(0, 8)}
                              </span>
                            </div>

                            <div className="mt-3 flex items-start gap-2 text-sm text-slate-700">
                              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                              {formatDateTime(booking.start_at)}
                            </div>

                            <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                              <Clock3 className="h-4 w-4 text-slate-400" />
                              {booking.duration_minutes} minutes
                            </div>

                            <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-800">
                              <Wallet className="h-4 w-4 text-slate-400" />
                              {formatBookingAmount(booking)}
                            </div>
                          </div>

                          {relatedRequest && (
                            <Badge>
                              {relatedRequest.tutoring_mode.replaceAll(
                                "_",
                                " ",
                              )}
                            </Badge>
                          )}
                        </div>

                        {relatedRequest && (
                          <div className="mt-4 rounded-xl bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Tutoring request
                            </p>
                            <p className="mt-1 font-medium text-slate-800">
                              {relatedRequest.subject_name || "Learning area"}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              {relatedRequest.description}
                            </p>
                          </div>
                        )}

                        {booking.lesson_notes && (
                          <div className="mt-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Learner's lesson notes
                            </p>
                            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                              {booking.lesson_notes}
                            </p>
                          </div>
                        )}

                        <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                          <Button
                            type="button"
                            disabled={bookingActionId === booking.id}
                            onClick={() => void acceptBooking(booking)}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            {bookingActionId === booking.id
                              ? "Please wait…"
                              : "Accept booking"}
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            disabled={bookingActionId === booking.id}
                            onClick={() => void declineBooking(booking.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Decline
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          {/* Tutoring requests */}
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-[#102A56]">
                Matching tutoring requests
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review requests that match your profile. Accept a tutoring
                request before a learner can book a lesson with you.
              </p>
            </div>

            {loading ? (
              <p className="text-sm text-slate-500">
                Loading tutoring requests…
              </p>
            ) : prioritizedRows.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <RefreshCw className="mx-auto h-7 w-7 text-slate-400" />
                  <p className="mt-3 font-medium text-slate-800">
                    No matching tutoring requests available
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    New requests matching your profile will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {prioritizedRows.map((request) => {
                  const requestBookings = sortBookings(
                    bookings.filter(
                      (booking) => booking.tutoring_request_id === request.id,
                    ),
                  );

                  return (
                    <Card key={request.id}>
                      <CardContent className="p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#1769D2]">
                              <UserRound className="h-6 w-6" />
                            </div>

                            <div className="min-w-0">
                              <h3 className="font-semibold text-[#102A56]">
                                {getRequesterName(request)}
                              </h3>

                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <Badge>{getRequesterType(request)}</Badge>
                                <Badge>{request.status}</Badge>
                                <span className="text-xs text-slate-400">
                                  Submitted {formatDate(request.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <Badge>
                            {request.tutoring_mode.replaceAll("_", " ")}
                          </Badge>
                        </div>

                        <div className="mt-5 grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Subject / learning area
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-800">
                              {request.subject_name || "Not specified"}
                            </p>
                          </div>

                          {request.location_name && (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Preferred location
                              </p>
                              <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-800">
                                <MapPin className="h-4 w-4 text-slate-400" />
                                {request.location_name}
                              </p>
                            </div>
                          )}

                          <div className="sm:col-span-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Learning goals and requirements
                            </p>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                              {request.description}
                            </p>
                          </div>

                          {request.preferred_schedule && (
                            <div className="sm:col-span-2">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Preferred schedule
                              </p>
                              <p className="mt-1 text-sm text-slate-700">
                                {request.preferred_schedule}
                              </p>
                            </div>
                          )}
                        </div>

                        {request.status === "OPEN" && (
                          <div className="mt-5 flex flex-wrap justify-end gap-2">
                            <Button
                              onClick={() => void decide(request.id, "ACCEPT")}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Accept request
                            </Button>

                            <Button
                              variant="outline"
                              onClick={() => void decide(request.id, "DECLINE")}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Decline
                            </Button>
                          </div>
                        )}

                        {request.status === "ACCEPTED" && (
                          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                              <div>
                                <p className="font-medium text-emerald-900">
                                  You accepted this tutoring request
                                </p>
                                <p className="mt-1 text-sm leading-6 text-emerald-800">
                                  The learner can now choose a lesson date and
                                  time and send you a booking request. You will
                                  review and accept or decline each booking.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {requestBookings.length > 0 && (
                          <div className="mt-5 space-y-3">
                            <h4 className="text-sm font-semibold text-slate-800">
                              Booking activity
                            </h4>

                            {requestBookings.map((booking) => (
                              <BookingDetails
                                key={booking.id}
                                booking={booking}
                              />
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          {/* Tutor's confirmed and ongoing bookings */}
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-[#102A56]">
                Your lesson bookings
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Track confirmed lessons and lesson completion acknowledgement.
              </p>
            </div>

            {otherTutorBookings.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-sm text-slate-500">
                  You do not have any confirmed or ongoing lesson bookings yet.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {otherTutorBookings.map((booking) => (
                  <BookingDetails key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </section>
        </div>
      </AppShell>
    );
  }

  const isParent = user?.role === "PARENT";
  const accountProfileLabel = isParent ? "parent profile" : "learner profile";

  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(subjectQuery.trim().toLowerCase()),
  );

  const selectedSubject = subjects.find((subject) => subject.id === subjectId);

  const selectedBookingRequest = rows.find(
    (request) => request.id === bookingRequest,
  );

  return (
    <AppShell
      title="Tutoring requests"
      description="Find the right tutor, submit a tutoring request, and coordinate your lessons."
    >
      {/* Selected tutor */}
      {selectedTutorId && (
        <Card className="mb-6 overflow-hidden border-blue-200">
          {selectedTutorLoading ? (
            <CardContent className="flex items-center gap-3 p-5">
              <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 rounded bg-slate-200" />
                <div className="h-3 w-56 rounded bg-slate-100" />
              </div>
            </CardContent>
          ) : selectedTutor ? (
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  {selectedTutor.profile_picture_url ? (
                    <img
                      src={selectedTutor.profile_picture_url}
                      alt={getTutorName(selectedTutor)}
                      className="h-16 w-16 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1769D2]">
                      <UserRound size={27} />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge>Selected tutor</Badge>
                      <span className="text-xs text-slate-400">
                        From tutor profile
                      </span>
                    </div>

                    <h2 className="truncate text-lg font-bold text-[#102A56]">
                      {getTutorName(selectedTutor)}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {formatRate(selectedTutor.hourly_rate)}
                      {" · "}
                      {selectedTutor.years_of_experience}{" "}
                      {selectedTutor.years_of_experience === 1
                        ? "year"
                        : "years"}{" "}
                      experience
                    </p>

                    {selectedTutor.subjects.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {selectedTutor.subjects.slice(0, 4).map((subject) => (
                          <span
                            key={subject.id}
                            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
                          >
                            {subject.name}
                          </span>
                        ))}

                        {selectedTutor.subjects.length > 4 && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                            +{selectedTutor.subjects.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      router.push(
                        `/tutor/${encodeURIComponent(selectedTutor.id)}`,
                      )
                    }
                  >
                    View profile
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={clearSelectedTutor}
                    className="text-slate-500 hover:text-red-600"
                  >
                    <X className="mr-1 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3">
                <p className="text-xs leading-5 text-blue-800">
                  Your request will be directed to this tutor. The tutor must
                  still review and accept it before they are assigned to the
                  request.
                </p>
              </div>
            </CardContent>
          ) : (
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">
                    Selected tutor unavailable
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {selectedTutorError ||
                      "The selected tutor could not be loaded."}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={clearSelectedTutor}
                >
                  Remove selection
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Account profile status */}
      {profileStatus === "loading" && (
        <Card className="mb-6">
          <CardContent className="flex items-center gap-3 p-5">
            <RefreshCw className="h-5 w-5 animate-spin text-[#1769D2]" />
            <div>
              <p className="font-medium text-slate-800">
                Preparing your account
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Checking your {accountProfileLabel} before you submit a request.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {profileStatus === "error" && (
        <Card className="mb-6 border-amber-200">
          <CardContent className="p-5">
            <p className="font-semibold text-amber-900">
              Your account profile could not be loaded
            </p>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              We couldn't prepare your {accountProfileLabel}. Please refresh the
              page or contact support if the problem continues.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Submission confirmation */}
      {submittedRequest && (
        <Card className="mb-6 border border-emerald-200 bg-emerald-50/60">
          <CardContent className="flex gap-3 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-5 w-5 text-emerald-700" />
            </div>

            <div className="min-w-0">
              <h3 className="font-semibold text-emerald-950">
                Your request has been submitted
              </h3>

              <p className="mt-1 text-sm leading-6 text-emerald-900/80">
                {submittedTutorName
                  ? `Your request has been sent to ${submittedTutorName}.`
                  : "Thank you. Your tutoring request has been recorded. You can follow its status in the Your requests section below."}
              </p>

              <div className="mt-3 space-y-2 text-sm text-emerald-900/80">
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  Your request is available in your request history.
                </p>

                <p className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  {submittedTutorName
                    ? `${submittedTutorName} can now review and respond to your request.`
                    : "You can use Find matching tutors to explore suitable tutors while your request is open."}
                </p>

                <p className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />A selected tutor
                  is not assigned until they accept the request.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSubmittedRequest(false);
                  setSubmittedTutorName("");
                }}
                className="mt-3 text-sm font-medium text-emerald-800 underline underline-offset-4"
              >
                Dismiss
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* New tutoring request form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {selectedTutor
              ? "Request tutoring from this tutor"
              : "Submit a tutoring request"}
          </CardTitle>

          <p className="text-sm text-slate-500">
            {isParent
              ? "Tell us what your child needs help learning and the type of tutoring support you are looking for."
              : "Tell us what you want to learn and the type of tutoring support you are looking for."}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={create} className="grid gap-4 md:grid-cols-2">
            <Field
              label="Subject / learning area"
              help="Type to search, then select a learning area from the suggestions."
            >
              <div className="relative">
                <Input
                  list="tutoring-subject-suggestions"
                  required
                  autoComplete="off"
                  value={subjectQuery}
                  placeholder="Search subjects or learning areas..."
                  disabled={subjects.length === 0 || profileStatus !== "ready"}
                  onChange={(event) => {
                    const value = event.target.value;

                    setSubjectQuery(value);

                    const matchedSubject = subjects.find(
                      (subject) =>
                        subject.name.trim().toLowerCase() ===
                        value.trim().toLowerCase(),
                    );

                    setSubjectId(matchedSubject?.id ?? "");
                  }}
                />

                <datalist id="tutoring-subject-suggestions">
                  {filteredSubjects.map((subject) => (
                    <option key={subject.id} value={subject.name} />
                  ))}
                </datalist>
              </div>

              {selectedSubject && (
                <p className="mt-1.5 text-xs text-emerald-700">
                  Selected: {selectedSubject.name}
                </p>
              )}

              {subjectQuery && !subjectId && (
                <p className="mt-1.5 text-xs text-amber-700">
                  Please choose a valid learning area from the suggestions.
                </p>
              )}

              {subjects.length === 0 && (
                <p className="mt-1 text-xs text-amber-700">
                  No learning areas are currently available.
                </p>
              )}
            </Field>

            <Field label="Tutoring mode">
              <select
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                value={mode}
                onChange={(event) => {
                  const nextMode = event.target.value;
                  setMode(nextMode);

                  if (nextMode !== "IN_PERSON") {
                    setStateId("");
                    setLgaId("");
                    setCommunityId("");
                    setLocationId("");
                    setLgas([]);
                    setCommunities([]);
                  }
                }}
                disabled={profileStatus !== "ready"}
              >
                <option value="ONLINE">Online</option>
                <option value="IN_PERSON">In person</option>
              </select>
            </Field>

            {mode === "IN_PERSON" && (
              <>
                <Field label="State">
                  <select
                    required
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                    value={stateId}
                    onChange={(event) => setStateId(event.target.value)}
                    disabled={statesLoading}
                  >
                    <option value="">
                      {statesLoading ? "Loading states…" : "Select state"}
                    </option>

                    {states.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Local Government Area (LGA)">
                  <select
                    required
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                    value={lgaId}
                    onChange={(event) => setLgaId(event.target.value)}
                    disabled={!stateId || lgasLoading}
                  >
                    <option value="">
                      {!stateId
                        ? "Select a state first"
                        : lgasLoading
                          ? "Loading LGAs…"
                          : "Select LGA"}
                    </option>

                    {lgas.map((lga) => (
                      <option key={lga.id} value={lga.id}>
                        {lga.name}
                      </option>
                    ))}
                  </select>

                  {stateId && !lgasLoading && lgas.length === 0 && (
                    <p className="mt-1 text-xs text-amber-700">
                      No LGAs were found for this state.
                    </p>
                  )}
                </Field>

                <Field label="Community (optional)">
                  <select
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                    value={communityId}
                    onChange={(event) => setCommunityId(event.target.value)}
                    disabled={!lgaId || communitiesLoading}
                  >
                    <option value="">
                      {!lgaId
                        ? "Select an LGA first"
                        : communitiesLoading
                          ? "Loading communities…"
                          : "Entire LGA / no specific community"}
                    </option>

                    {communities.map((community) => (
                      <option key={community.id} value={community.id}>
                        {community.name}
                      </option>
                    ))}
                  </select>

                  {lgaId && !communitiesLoading && communities.length === 0 && (
                    <p className="mt-1 text-xs text-slate-500">
                      No communities have been listed for this LGA yet. You can
                      continue with the LGA.
                    </p>
                  )}
                </Field>

                <div className="flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-xs leading-5 text-blue-800 md:col-span-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    Select a state and LGA. You can optionally choose a
                    community to make your in-person tutoring location more
                    specific.
                  </p>
                </div>
              </>
            )}

            <div className="md:col-span-2">
              <Field
                label={
                  isParent
                    ? "What does your child want to learn?"
                    : "What do you want to learn?"
                }
                help="At least 10 characters"
              >
                <Textarea
                  required
                  minLength={10}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  placeholder={
                    isParent
                      ? "Describe your child's learning goals, current level and the support required."
                      : "Describe your learning goals, current level and the support you need."
                  }
                />
              </Field>
            </div>

            <Field label="Preferred schedule (optional)">
              <Input
                value={schedule}
                onChange={(event) => setSchedule(event.target.value)}
                placeholder="e.g. Weekday evenings"
              />
            </Field>

            <div className="flex items-end">
              <Button
                type="submit"
                disabled={
                  busy ||
                  profileStatus !== "ready" ||
                  selectedTutorLoading ||
                  (!!selectedTutorId && !selectedTutor) ||
                  !subjectId ||
                  description.trim().length < 10 ||
                  (mode === "IN_PERSON" &&
                    (!stateId || !lgaId || !locationId || lgasLoading))
                }
              >
                {busy
                  ? "Submitting…"
                  : selectedTutor
                    ? "Send request to tutor"
                    : "Submit request"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Booking request form */}
      {bookingRequest && selectedBookingRequest && (
        <Card className="mb-6 border-blue-200">
          <CardHeader>
            <CardTitle>Request a lesson session</CardTitle>
            <p className="text-sm text-slate-500">
              Choose your preferred lesson date and time. The tutor will review
              your request and accept or decline it.
            </p>
          </CardHeader>

          <CardContent>
            <div className="mb-4 rounded-xl bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Accepted tutoring request
              </p>
              <p className="mt-1 font-semibold text-blue-950">
                {selectedBookingRequest.subject_name || "Tutoring request"}
              </p>
              <p className="mt-1 text-sm text-blue-800">
                {selectedBookingRequest.tutoring_mode.replaceAll("_", " ")}
              </p>
            </div>

            <form
              onSubmit={createBooking}
              className="grid gap-4 sm:grid-cols-2"
            >
              <Field label="Preferred lesson date and time">
                <Input
                  type="datetime-local"
                  required
                  value={startAt}
                  min={new Date(
                    Date.now() - new Date().getTimezoneOffset() * 60000,
                  )
                    .toISOString()
                    .slice(0, 16)}
                  onChange={(event) => setStartAt(event.target.value)}
                />
              </Field>

              <Field label="Lesson duration">
                <select
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                >
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">90 minutes</option>
                  <option value="120">2 hours</option>
                  <option value="180">3 hours</option>
                  <option value="240">4 hours</option>
                </select>
              </Field>

              <div className="sm:col-span-2">
                <Field label="Lesson notes (optional)">
                  <Textarea
                    rows={3}
                    value={lessonNotes}
                    onChange={(event) => setLessonNotes(event.target.value)}
                    placeholder="Add any useful information about the lesson you are requesting."
                  />
                </Field>
              </div>

              <div className="flex flex-wrap items-end gap-2 sm:col-span-2">
                <Button type="submit" disabled={busy}>
                  {busy ? "Sending request…" : "Send booking request"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setBookingRequest("");
                    setStartAt("");
                    setDuration("60");
                    setLessonNotes("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Learner request history */}
      <Card>
        <CardHeader>
          <CardTitle>Your requests</CardTitle>
          <p className="text-sm text-slate-500">
            Track your tutoring requests and manage lesson booking requests.
          </p>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-500">Loading your requests…</p>
          ) : prioritizedRows.length === 0 ? (
            <div className="py-8 text-center">
              <RefreshCw className="mx-auto h-7 w-7 text-slate-400" />
              <p className="mt-3 font-medium text-slate-800">
                No tutoring requests yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Your submitted tutoring requests will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {prioritizedRows.map((request) => {
                const requestBookings = sortBookings(
                  bookings.filter(
                    (booking) => booking.tutoring_request_id === request.id,
                  ),
                );

                return (
                  <div
                    key={request.id}
                    className="rounded-xl border border-slate-100 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>{request.status}</Badge>

                        {request.status === "OPEN" &&
                          request.selected_tutor_id && (
                            <Badge>Selected tutor</Badge>
                          )}

                        {request.status === "ACCEPTED" && (
                          <Badge>Tutor accepted</Badge>
                        )}
                      </div>

                      <span className="text-xs text-slate-400">
                        {formatDate(request.created_at)}
                      </span>
                    </div>

                    {request.subject_name && (
                      <p className="mt-3 text-sm font-semibold text-[#102A56]">
                        {request.subject_name}
                      </p>
                    )}

                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {request.description}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      {request.tutoring_mode.replaceAll("_", " ")} · Request{" "}
                      {request.id.slice(0, 8)}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {getRequestStatusDescription(request)}
                    </p>

                    {request.preferred_schedule && (
                      <p className="mt-1 text-xs text-slate-500">
                        Preferred schedule: {request.preferred_schedule}
                      </p>
                    )}

                    {request.status === "OPEN" && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={
                            matchingLoading && matchingRequestId === request.id
                          }
                          onClick={() => void findMatchingTutors(request.id)}
                        >
                          {matchingLoading && matchingRequestId === request.id
                            ? "Finding tutors…"
                            : matchingRequestId === request.id
                              ? "Hide matching tutors"
                              : "Find matching tutors"}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          disabled={cancellingRequestId === request.id}
                          onClick={() => void cancelRequest(request)}
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          {cancellingRequestId === request.id ? (
                            "Cancelling…"
                          ) : (
                            <>
                              <Ban className="mr-2 h-4 w-4" />
                              Cancel request
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {request.status === "ACCEPTED" && (
                      <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-3">
                        <div className="flex items-start gap-2 text-sm text-emerald-800">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                          <div>
                            <p className="font-medium">
                              Your tutoring request has been accepted.
                            </p>
                            <p className="mt-1 text-xs leading-5">
                              You can now request a lesson session. The tutor
                              will review your preferred date and time.
                            </p>
                          </div>
                        </div>

                        <Button
                          type="button"
                          className="mt-3"
                          onClick={() => {
                            setBookingRequest(request.id);
                            setStartAt("");
                            setDuration("60");
                            setLessonNotes("");
                          }}
                        >
                          <CalendarDays className="mr-2 h-4 w-4" />
                          Request a lesson
                        </Button>
                      </div>
                    )}

                    {/* Booking activity */}
                    {requestBookings.length > 0 && (
                      <div className="mt-5 border-t border-slate-100 pt-4">
                        <div className="mb-3">
                          <h3 className="font-semibold text-slate-900">
                            Lesson bookings
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">
                            View the status of each requested lesson session.
                          </p>
                        </div>

                        <div className="space-y-3">
                          {requestBookings.map((booking) => (
                            <BookingDetails key={booking.id} booking={booking}>
                              {booking.status ===
                                "PENDING_TUTOR_CONFIRMATION" && (
                                <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
                                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
                                  Your booking request has been sent. The tutor
                                  still needs to accept or decline it.
                                </div>
                              )}

                              {booking.status === "PENDING_CONFIRMATION" && (
                                <div className="mt-4 border-t border-slate-100 pt-3">
                                  <p className="mb-3 text-xs leading-5 text-amber-800">
                                    This is a booking created under the previous
                                    booking workflow.
                                  </p>

                                  <Button
                                    type="button"
                                    disabled={bookingActionId === booking.id}
                                    onClick={() =>
                                      void confirmLegacyBooking(booking.id)
                                    }
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    {bookingActionId === booking.id
                                      ? "Please wait…"
                                      : "Confirm legacy booking"}
                                  </Button>
                                </div>
                              )}

                              {booking.status === "CONFIRMED" && (
                                <div className="mt-3 flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-800">
                                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                                  Your tutor has accepted this lesson booking.
                                  Your lesson is confirmed.
                                </div>
                              )}

                              {booking.status ===
                                "AWAITING_LEARNER_ACKNOWLEDGEMENT" && (
                                <div className="mt-3 flex items-start gap-2 rounded-lg bg-purple-50 px-3 py-2 text-xs leading-5 text-purple-800">
                                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                                  The tutor has marked this lesson as completed.
                                  Please review the lesson before acknowledging
                                  completion or raising a dispute.
                                </div>
                              )}

                              {booking.status === "DECLINED" && (
                                <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
                                  The tutor declined this booking request. You
                                  can submit another booking request for this
                                  accepted tutoring request.
                                </div>
                              )}

                              {booking.status === "DISPUTED" && (
                                <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs leading-5 text-red-800">
                                  This lesson completion is under review.
                                </div>
                              )}

                              {booking.status === "COMPLETED" && (
                                <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-800">
                                  This lesson has been completed and
                                  acknowledged.
                                </div>
                              )}
                            </BookingDetails>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Matching tutors */}
                    {matchingRequestId === request.id && (
                      <div className="mt-5 border-t border-slate-100 pt-5">
                        <div className="mb-4">
                          <h3 className="font-semibold text-slate-900">
                            Matching tutors
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            Tutors are matched against the subject, tutoring
                            mode and, where applicable, the location and its
                            parent service areas.
                          </p>
                        </div>

                        {matchingLoading ? (
                          <p className="py-5 text-sm text-slate-500">
                            Finding suitable tutors…
                          </p>
                        ) : matchingTutors.length === 0 ? (
                          <div className="rounded-xl bg-slate-50 p-5 text-center">
                            <p className="text-sm font-medium text-slate-700">
                              No matching tutors found yet.
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              You can check again later as more tutors become
                              available.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {matchingTutors.map((tutor) => (
                              <div
                                key={tutor.tutor_user_id}
                                className="rounded-xl border border-slate-200 p-4"
                              >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                  <div>
                                    <h4 className="font-semibold text-slate-900">
                                      {tutor.first_name} {tutor.last_name}
                                    </h4>
                                    <p className="mt-1 text-sm font-medium text-slate-700">
                                      {formatRate(tutor.hourly_rate)}
                                    </p>
                                  </div>

                                  <Badge>
                                    {tutor.match_level === "STRONG"
                                      ? "Strong match"
                                      : "Partial match"}
                                  </Badge>
                                </div>

                                {tutor.bio && (
                                  <p className="mt-3 text-sm leading-6 text-slate-600">
                                    {tutor.bio}
                                  </p>
                                )}

                                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                      Experience
                                    </p>
                                    <p className="mt-1 text-slate-700">
                                      {tutor.years_of_experience}{" "}
                                      {tutor.years_of_experience === 1
                                        ? "year"
                                        : "years"}
                                    </p>
                                  </div>

                                  {tutor.qualifications && (
                                    <div>
                                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Qualifications
                                      </p>
                                      <p className="mt-1 text-slate-700">
                                        {tutor.qualifications}
                                      </p>
                                    </div>
                                  )}

                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                      Teaching modes
                                    </p>
                                    <p className="mt-1 text-slate-700">
                                      {tutor.tutoring_modes.length
                                        ? tutor.tutoring_modes.join(", ")
                                        : "Not specified"}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                      Languages
                                    </p>
                                    <p className="mt-1 text-slate-700">
                                      {tutor.teaching_languages.length
                                        ? tutor.teaching_languages.join(", ")
                                        : "Not specified"}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                      Learner age groups
                                    </p>
                                    <p className="mt-1 text-slate-700">
                                      {tutor.learner_age_groups.length
                                        ? tutor.learner_age_groups.join(", ")
                                        : "Not specified"}
                                    </p>
                                  </div>

                                  {tutor.service_area && (
                                    <div>
                                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Service area
                                      </p>
                                      <p className="mt-1 text-slate-700">
                                        {tutor.service_area}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {tutor.subjects.length > 0 && (
                                  <div className="mt-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                      Subjects and learning areas
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {tutor.subjects.map((subject) => (
                                        <Badge key={subject}>{subject}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {tutor.locations.length > 0 && (
                                  <div className="mt-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                      Listed locations
                                    </p>
                                    <p className="mt-1 text-sm text-slate-700">
                                      {tutor.locations.join(", ")}
                                    </p>
                                  </div>
                                )}

                                {tutor.match_reasons.length > 0 && (
                                  <div className="mt-4 rounded-lg bg-slate-50 p-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                      Why this tutor matches
                                    </p>
                                    <ul className="mt-2 space-y-1">
                                      {tutor.match_reasons.map(
                                        (reason, index) => (
                                          <li
                                            key={`${tutor.tutor_user_id}-reason-${index}`}
                                            className="text-sm text-slate-600"
                                          >
                                            • {reason}
                                          </li>
                                        ),
                                      )}
                                    </ul>
                                  </div>
                                )}

                                {tutor.unmatched_criteria.length > 0 && (
                                  <p className="mt-3 text-xs text-amber-700">
                                    Criteria not fully matched:{" "}
                                    {tutor.unmatched_criteria
                                      .map((criterion) =>
                                        criterion === "LOCATION"
                                          ? "Location"
                                          : criterion,
                                      )
                                      .join(", ")}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
