"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { api, money } from "@/lib/api";
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
  requester_profile_picture_url?: string | null;
  requester_account_type?: string | null;
  subject_name?: string;
  location_name?: string | null;
  my_response?: "ACCEPTED" | "DECLINED" | null;
  selected_tutor_response?: "ACCEPTED" | "DECLINED" | null;
};

type MatchingTutor = {
  tutor_user_id: string;
  tutor_profile_id?: string | null;
  response_decision?: "ACCEPTED" | "DECLINED" | null;
  first_name: string;
  last_name: string;
  bio: string | null;
  monthly_fee: number | string | null;
  qualifications: string | null;
  years_of_experience: number;
  teaching_languages: string[];
  learner_age_groups: string[];
  tutoring_modes: string[];
  service_area: string | null;
  subjects: string[];
  locations: string[];
  profile_picture_url?: string | null;
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
  monthly_fee: number | string | null;
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
  monthly_fee: number | string;
  gross_amount_minor: number;
  monthly_arrangement_id?: string | null;
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

type CheckoutPreview = {
  checkout_url: string;
  provider_reference: string;
  amount_minor: number;
  tutoring_amount_minor: number;
  learner_fee_minor: number;
  currency: string;
  commission_bps: number;
};

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

  return `₦${numericRate.toLocaleString("en-NG")}/month`;
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
    return "A tutor has been selected for this request. You can now arrange the lesson.";
  }

  if (
    request.status === "OPEN" &&
    request.selected_tutor_id &&
    request.selected_tutor_response === "DECLINED"
  ) {
    return "The selected tutor declined this request. Cancel it and submit a new request to choose another tutor.";
  }

  if (request.status === "OPEN" && request.selected_tutor_id) {
    return "Your direct request has been sent to the selected tutor. The tutor must accept it before you can schedule a lesson and make payment.";
  }

  if (request.status === "OPEN") {
    return "Your request is open. Tutors can express interest, and you can select one of the tutors who accepts.";
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
      return "Agreement review";
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

      {booking.status === "PENDING_CONFIRMATION" && (
        <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Tutor has accepted the paid booking request. Review the agreement to
          accept the proposed terms.
          <Link href="/agreements" className="ml-2 font-semibold underline">
            Open agreement
          </Link>
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
  const [contractMonths, setContractMonths] = useState("1");
  const [monthlyArrangementId, setMonthlyArrangementId] = useState<
    string | null
  >(null);
  const [lessonNotes, setLessonNotes] = useState("");
  const [checkoutPreview, setCheckoutPreview] =
    useState<CheckoutPreview | null>(null);
  const [tutorProfiles, setTutorProfiles] = useState<
    Record<string, PublicTutor>
  >({});

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
          if (result.tutoring_modes?.length) {
            setMode((currentMode) =>
              result.tutoring_modes.includes(currentMode)
                ? currentMode
                : result.tutoring_modes[0],
            );
          }
          setLocationId("");
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
        if (user?.role === "PARENT") {
          try {
            await api("/parents/profile");
          } catch {
            await api("/parents/profile", {
              method: "POST",
            });
          }
        }

        if (user?.role === "ADULT_LEARNER") {
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
      ((mode === "IN_PERSON" || mode === "HYBRID") &&
        (!locationId || (!selectedTutor && (!stateId || !lgaId))))
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
        location_id:
          mode === "IN_PERSON" || mode === "HYBRID" ? locationId : null,
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

      const selectedRequest = rows.find((request) => request.id === id);
      toast.success(
        decision === "ACCEPT"
          ? selectedRequest?.selected_tutor_id
            ? "Direct tutoring request accepted"
            : "Interest sent. The learner can now review and select you."
          : selectedRequest?.selected_tutor_id
            ? "Direct tutoring request declined"
            : "Request declined",
      );

      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not respond");
    }
  }

  async function selectRespondingTutor(
    requestId: string,
    tutor: MatchingTutor,
  ) {
    if (!tutor.tutor_profile_id) {
      toast.error(
        "This tutor response is missing its profile reference. Refresh the request and try again.",
      );
      return;
    }
    setBusy(true);
    try {
      await api(
        `/tutoring-requests/mine/${encodeURIComponent(requestId)}/select-tutor/${encodeURIComponent(tutor.tutor_profile_id)}`,
        { method: "POST" },
      );
      toast.success(
        `${tutor.first_name} ${tutor.last_name} has been selected. You can now arrange the lessons.`,
      );
      setMatchingRequestId(null);
      setMatchingTutors([]);
      await load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not select this tutor",
      );
    } finally {
      setBusy(false);
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
      toast.error(
        "The tutor must accept your tutoring request before you can schedule and pay for a lesson.",
      );
      return;
    }

    setBusy(true);

    try {
      const existingArrangementId =
        monthlyArrangementId ||
        bookings.find(
          (item) =>
            item.tutoring_request_id === bookingRequest &&
            item.monthly_arrangement_id,
        )?.monthly_arrangement_id ||
        null;
      const bookingPayload = {
        start_at: proposedStart.toISOString(),
        duration_minutes: Number(duration),
        contract_months: Number(contractMonths),
        monthly_arrangement_id: existingArrangementId,
        lesson_notes: lessonNotes.trim() || null,
      };

      // An active monthly arrangement has already been paid for. Additional
      // lessons under that contract can be booked without another checkout.
      if (existingArrangementId) {
        const createdBooking = await api<LessonBooking>(
          `/session-bookings/requests/${encodeURIComponent(bookingRequest)}`,
          {
            method: "POST",
            body: JSON.stringify(bookingPayload),
          },
        );
        toast.success(
          "Your lesson has been added to the paid contract. The tutor has been notified.",
        );
        setBookingRequest("");
        setStartAt("");
        setDuration("60");
        setLessonNotes("");
        await load();
        return;
      }

      // First booking: initialize checkout against the tutoring request.
      // No LessonBooking row is created until Paystack confirms payment.
      const payment = await api<CheckoutPreview>(
        `/payments/requests/${encodeURIComponent(bookingRequest)}/initialize`,
        {
          method: "POST",
          headers: { "Idempotency-Key": crypto.randomUUID() },
          body: JSON.stringify({
            start_at: bookingPayload.start_at,
            duration_minutes: bookingPayload.duration_minutes,
            contract_months: bookingPayload.contract_months,
            lesson_notes: bookingPayload.lesson_notes,
          }),
        },
      );

      if (!payment.checkout_url) {
        throw new Error(
          "Paystack did not return a checkout URL. No booking has been created.",
        );
      }

      setCheckoutPreview(payment);
      toast.success(
        "Your payment summary is ready. Review it before continuing.",
      );
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
  function continueToPayment() {
    if (!checkoutPreview?.checkout_url) return;
    window.location.assign(checkoutPreview.checkout_url);
  }

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

  // Tutor dashboard. Each tutoring request is the parent record; all lesson
  // bookings created from it are rendered inside the same card.
  if (isTutor) {
    const tutorRequestIds = new Set(
      prioritizedRows.map((request) => request.id),
    );
    const unlinkedBookings = sortBookings(
      bookings.filter(
        (booking) => !tutorRequestIds.has(booking.tutoring_request_id),
      ),
    );

    return (
      <AppShell
        title="Tutoring requests"
        description="Review learner requests and manage every lesson booking from the same request card."
      >
        <div className="space-y-6">
          <div className="flex flex-col gap-3 rounded-2xl border border-[#DCE8F5] bg-gradient-to-r from-[#F5F9FF] to-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <p className="text-sm font-semibold text-[#102A56]">
                Your request workspace
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                A learner's request and every lesson booked from it stay
                together. Open a request to review its details, then handle its
                lesson bookings in the panel beside it.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void load()}
              disabled={loading}
              className="shrink-0 bg-white"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh requests
            </Button>
          </div>

          {loading ? (
            <Card>
              <CardContent className="p-8 text-center text-sm text-slate-500">
                Loading your tutoring requests and lesson bookings…
              </CardContent>
            </Card>
          ) : prioritizedRows.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-[#1769D2]">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <p className="mt-4 font-semibold text-[#102A56]">
                  No tutoring requests yet
                </p>
                <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                  New requests that match your subjects, teaching modes and
                  service locations will appear here. Lesson bookings will be
                  displayed inside their related request.
                </p>
              </CardContent>
            </Card>
          ) : (
            <section className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-[#102A56]">
                    Learner requests
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {prioritizedRows.length}{" "}
                    {prioritizedRows.length === 1 ? "request" : "requests"} in
                    your workspace
                  </p>
                </div>
                <p className="text-xs text-slate-400">
                  Newest requests are shown first within each status.
                </p>
              </div>

              {prioritizedRows.map((request) => {
                const requestBookings = sortBookings(
                  bookings.filter(
                    (booking) => booking.tutoring_request_id === request.id,
                  ),
                );
                const isDirectRequest = Boolean(request.selected_tutor_id);
                const hasResponded = Boolean(request.my_response);
                const canRespond = request.status === "OPEN" && !hasResponded;
                const hasPendingTutorBooking = requestBookings.some(
                  (booking) => booking.status === "PENDING_TUTOR_CONFIRMATION",
                );
                const initials =
                  `${request.requester_first_name?.[0] ?? ""}${request.requester_last_name?.[0] ?? ""}`.toUpperCase();

                return (
                  <Card
                    key={request.id}
                    className="overflow-hidden border-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-4 sm:px-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          {request.requester_profile_picture_url ? (
                            <img
                              src={request.requester_profile_picture_url}
                              alt={getRequesterName(request)}
                              className="h-12 w-12 shrink-0 rounded-full border border-white object-cover shadow-sm"
                            />
                          ) : (
                            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-blue-100 bg-blue-50 text-sm font-bold text-[#1769D2]">
                              {initials || <UserRound className="h-5 w-5" />}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate font-semibold text-[#102A56]">
                                {getRequesterName(request)}
                              </h3>
                              <Badge>{getRequesterType(request)}</Badge>
                              {isDirectRequest && (
                                <Badge className="border-slate-200 bg-white text-slate-600">
                                  Direct request
                                </Badge>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                              Submitted {formatDate(request.created_at)} ·{" "}
                              {request.subject_name || "Learning area"}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                          <Badge>{request.status.replaceAll("_", " ")}</Badge>
                          <Badge className="border-slate-200 bg-white text-slate-600">
                            {request.tutoring_mode.replaceAll("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-4 sm:p-5">
                      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                        {/* Request details and tutor response stay on the left. */}
                        <div className="min-w-0 space-y-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Learning goals and requirements
                            </p>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                              {request.description}
                            </p>
                          </div>

                          <div className="grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-2">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                Subject
                              </p>
                              <p className="mt-1 text-sm font-medium text-slate-800">
                                {request.subject_name || "Not specified"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                Tutoring mode
                              </p>
                              <p className="mt-1 text-sm font-medium text-slate-800">
                                {request.tutoring_mode.replaceAll("_", " ")}
                              </p>
                            </div>
                            {request.location_name && (
                              <div className="sm:col-span-2">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                  Preferred location
                                </p>
                                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-800">
                                  <MapPin className="h-4 w-4 text-slate-400" />
                                  {request.location_name}
                                </p>
                              </div>
                            )}
                            {request.preferred_schedule && (
                              <div className="sm:col-span-2">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                  Preferred schedule
                                </p>
                                <p className="mt-1 text-sm text-slate-700">
                                  {request.preferred_schedule}
                                </p>
                              </div>
                            )}
                          </div>

                          {request.status === "OPEN" && isDirectRequest && (
                            <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-3 text-sm leading-6 text-blue-900">
                              This learner sent the request directly to you.
                              Accept it to allow the learner to arrange a lesson
                              and make payment, or decline it if you cannot take
                              it on.
                            </div>
                          )}

                          {request.status === "OPEN" && hasResponded && (
                            <div
                              className={`rounded-xl p-3 text-sm leading-6 ${request.my_response === "ACCEPTED" ? "border border-emerald-100 bg-emerald-50 text-emerald-900" : "border border-slate-200 bg-slate-50 text-slate-700"}`}
                            >
                              {request.my_response === "ACCEPTED"
                                ? isDirectRequest
                                  ? "You accepted this direct request. The learner can now arrange a lesson and complete payment."
                                  : "You expressed interest. The learner will review your response and may select you."
                                : "You declined this request. It will remain in your request history."}
                            </div>
                          )}

                          {request.status === "ACCEPTED" && (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                              <div className="flex items-start gap-2">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                                <div>
                                  <p className="text-sm font-semibold text-emerald-950">
                                    {isDirectRequest
                                      ? "You accepted this direct request"
                                      : "The learner selected you"}
                                  </p>
                                  <p className="mt-1 text-xs leading-5 text-emerald-800">
                                    The learner can now propose a lesson time
                                    and pay for the contract. Any resulting
                                    booking request will appear beside this
                                    tutoring request.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {canRespond && (
                            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                              <Button
                                onClick={() =>
                                  void decide(request.id, "ACCEPT")
                                }
                                className="shadow-sm transition-transform hover:-translate-y-0.5"
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                {isDirectRequest
                                  ? "Accept request"
                                  : "Express interest"}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() =>
                                  void decide(request.id, "DECLINE")
                                }
                                className="border-red-200 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                              >
                                <X className="mr-2 h-4 w-4" />
                                Decline
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Every booking created from this request lives on the right. */}
                        <div className="min-w-0 rounded-2xl border border-slate-200 bg-[#FBFCFE] p-3 sm:p-4">
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <h4 className="font-semibold text-[#102A56]">
                                Lesson bookings
                              </h4>
                              <p className="mt-0.5 text-xs text-slate-500">
                                Bookings linked to this tutoring request
                              </p>
                            </div>
                            <Badge className="border-slate-200 bg-white text-slate-600">
                              {requestBookings.length}{" "}
                              {requestBookings.length === 1
                                ? "booking"
                                : "bookings"}
                            </Badge>
                          </div>

                          {requestBookings.length === 0 ? (
                            <div className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center">
                              <CalendarDays className="h-6 w-6 text-slate-300" />
                              <p className="mt-2 text-sm font-medium text-slate-700">
                                No lesson booking yet
                              </p>
                              <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                                {request.status === "ACCEPTED"
                                  ? "The learner can now choose a lesson time and complete payment. The booking will appear here after payment succeeds."
                                  : "Once this request is accepted and the learner completes payment, the lesson booking will appear here."}
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {requestBookings.map((booking, index) => (
                                <div
                                  key={booking.id}
                                  className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <BookingStatusBadge
                                        status={booking.status}
                                      />
                                      <span className="text-[11px] text-slate-400">
                                        Lesson {index + 1}
                                      </span>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-800">
                                      {formatBookingAmount(booking)}
                                    </span>
                                  </div>
                                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                    <div className="flex items-start gap-2 text-sm text-slate-700">
                                      <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                      <span>
                                        {formatDateTime(booking.start_at)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                      <Clock3 className="h-4 w-4 shrink-0 text-slate-400" />
                                      {booking.duration_minutes} minutes
                                    </div>
                                  </div>
                                  {booking.lesson_notes && (
                                    <div className="mt-3 rounded-lg bg-slate-50 p-3">
                                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                        Learner's lesson notes
                                      </p>
                                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                        {booking.lesson_notes}
                                      </p>
                                    </div>
                                  )}
                                  {booking.meeting_link && (
                                    <div className="mt-3 rounded-lg bg-blue-50 p-3">
                                      <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                                        Meeting link
                                      </p>
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
                                  {booking.cancellation_reason && (
                                    <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                        Decline / cancellation reason
                                      </p>
                                      <p className="mt-1">
                                        {booking.cancellation_reason}
                                      </p>
                                    </div>
                                  )}

                                  {booking.status ===
                                    "PENDING_TUTOR_CONFIRMATION" && (
                                    <>
                                      <div className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                                        The learner has paid and submitted this
                                        lesson request. Review the proposed time
                                        and accept or decline the booking.
                                      </div>
                                      <div className="mt-3 flex flex-wrap gap-2">
                                        <Button
                                          size="sm"
                                          disabled={
                                            bookingActionId === booking.id
                                          }
                                          onClick={() =>
                                            void acceptBooking(booking)
                                          }
                                        >
                                          <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                          {bookingActionId === booking.id
                                            ? "Please wait…"
                                            : "Accept lesson"}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          disabled={
                                            bookingActionId === booking.id
                                          }
                                          onClick={() =>
                                            void declineBooking(booking.id)
                                          }
                                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                        >
                                          <X className="mr-1.5 h-4 w-4" />
                                          Decline
                                        </Button>
                                      </div>
                                    </>
                                  )}

                                  {booking.status ===
                                    "PENDING_CONFIRMATION" && (
                                    <div className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                                      This is a legacy booking awaiting
                                      agreement review.{" "}
                                      <Link
                                        href="/agreements"
                                        className="font-semibold underline"
                                      >
                                        Open agreements
                                      </Link>
                                      .
                                    </div>
                                  )}
                                  {booking.status === "CONFIRMED" && (
                                    <div className="mt-3 rounded-lg bg-blue-50 p-3 text-xs leading-5 text-blue-800">
                                      This lesson is confirmed. Keep the learner
                                      updated if any arrangements change.
                                    </div>
                                  )}
                                  {booking.status ===
                                    "AWAITING_LEARNER_ACKNOWLEDGEMENT" && (
                                    <div className="mt-3 rounded-lg bg-purple-50 p-3 text-xs leading-5 text-purple-800">
                                      You marked this lesson as completed. The
                                      learner must acknowledge completion or
                                      raise a dispute before the payout process
                                      can continue.
                                      {booking.acknowledgement_deadline_at && (
                                        <p className="mt-1 font-medium">
                                          Acknowledgement deadline:{" "}
                                          {formatDateTime(
                                            booking.acknowledgement_deadline_at,
                                          )}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                  {booking.status === "DISPUTED" && (
                                    <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs leading-5 text-red-800">
                                      This lesson is under admin review.{" "}
                                      {booking.dispute_reason
                                        ? `Reason: ${booking.dispute_reason}`
                                        : "Tutova will review the reported issue."}
                                    </div>
                                  )}
                                  {booking.status === "DECLINED" && (
                                    <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                                      You declined this lesson booking.
                                    </div>
                                  )}
                                  {booking.status === "CANCELLED" && (
                                    <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                                      This lesson booking was cancelled.
                                    </div>
                                  )}
                                  {booking.status === "COMPLETED" && (
                                    <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs leading-5 text-emerald-800">
                                      This lesson has been completed and
                                      acknowledged.
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </section>
          )}

          {unlinkedBookings.length > 0 && (
            <section className="space-y-3">
              <div>
                <h2 className="text-base font-semibold text-[#102A56]">
                  Other lesson activity
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  These bookings were returned by your booking history but their
                  tutoring request is not in the current matching-request list.
                </p>
              </div>
              {unlinkedBookings.map((booking) => (
                <BookingDetails key={booking.id} booking={booking}>
                  {booking.status === "PENDING_TUTOR_CONFIRMATION" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        disabled={bookingActionId === booking.id}
                        onClick={() => void acceptBooking(booking)}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Accept lesson
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={bookingActionId === booking.id}
                        onClick={() => void declineBooking(booking.id)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Decline
                      </Button>
                    </div>
                  )}
                </BookingDetails>
              ))}
            </section>
          )}
        </div>
      </AppShell>
    );
  }

  const isParent = user?.role === "PARENT";
  const accountProfileLabel = isParent ? "parent profile" : "learner profile";

  const availableSubjects = selectedTutor
    ? subjects.filter((subject) =>
        selectedTutor.subjects.some((item) => item.id === subject.id),
      )
    : subjects;

  const availableModes = selectedTutor
    ? selectedTutor.tutoring_modes
    : ["ONLINE", "IN_PERSON", "HYBRID"];
  const needsPhysicalLocation = mode === "IN_PERSON" || mode === "HYBRID";
  const filteredSubjects = availableSubjects.filter((subject) =>
    subject.name.toLowerCase().includes(subjectQuery.trim().toLowerCase()),
  );

  const selectedSubject = availableSubjects.find(
    (subject) => subject.id === subjectId,
  );

  const selectedBookingRequest = rows.find(
    (request) => request.id === bookingRequest,
  );

  useEffect(() => {
    if (user?.role === "TUTOR") return;
    const ids = Array.from(
      new Set(
        rows
          .flatMap((request) => [
            request.assigned_tutor_id,
            request.selected_tutor_id,
          ])
          .filter((value): value is string => Boolean(value)),
      ),
    );
    const missing = ids.filter((id) => !tutorProfiles[id]);
    if (!missing.length) return;
    let cancelled = false;
    Promise.all(
      missing.map(async (id) => {
        try {
          const profile = await api<PublicTutor>(
            `/tutors/${encodeURIComponent(id)}`,
          );
          return [id, profile] as const;
        } catch {
          return null;
        }
      }),
    ).then((results) => {
      if (cancelled) return;
      setTutorProfiles((current) => {
        const next = { ...current };
        for (const result of results) if (result) next[result[0]] = result[1];
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [rows, user?.role, tutorProfiles]);

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
                      {formatRate(selectedTutor.monthly_fee)}
                      {" · "}
                      {selectedTutor.years_of_experience}{" "}
                      {selectedTutor.years_of_experience === 1
                        ? "year"
                        : "years"}{" "}
                      experience
                    </p>

                    {selectedTutor.subjects.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {selectedTutor.subjects.map((subject) => (
                          <span
                            key={subject.id}
                            className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
                          >
                            {subject.name}
                          </span>
                        ))}
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
                  ? `Your direct request has been sent to ${submittedTutorName}. The tutor must accept it before you can schedule a lesson and make payment.`
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
                    ? `${submittedTutorName} must accept your tutoring request before the booking and payment stage becomes available.`
                    : "You can use Find matching tutors to explore suitable tutors while your request is open."}
                </p>

                <p className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  {submittedTutorName
                    ? "The selected tutor has been notified and can respond from the tutor dashboard."
                    : "For generic requests, you choose one tutor from those who express interest."}
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
                  disabled={
                    availableSubjects.length === 0 || profileStatus !== "ready"
                  }
                  onChange={(event) => {
                    const value = event.target.value;

                    setSubjectQuery(value);

                    const matchedSubject = availableSubjects.find(
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

              {availableSubjects.length === 0 && (
                <p className="mt-1 text-xs text-amber-700">
                  {selectedTutor
                    ? "This tutor has not listed any learning areas. You cannot send a direct request until their profile is updated."
                    : "No learning areas are currently available."}
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
                  setLocationId("");

                  if (nextMode !== "IN_PERSON" && nextMode !== "HYBRID") {
                    setStateId("");
                    setLgaId("");
                    setCommunityId("");
                    setLgas([]);
                    setCommunities([]);
                  }
                }}
                disabled={
                  profileStatus !== "ready" || availableModes.length === 0
                }
              >
                {availableModes.map((availableMode) => (
                  <option key={availableMode} value={availableMode}>
                    {availableMode === "ONLINE"
                      ? "Online"
                      : availableMode === "IN_PERSON"
                        ? "In person"
                        : availableMode === "HYBRID"
                          ? "Hybrid"
                          : availableMode.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
              {selectedTutor && (
                <p className="mt-1.5 text-xs text-slate-500">
                  Showing the tutoring modes offered by{" "}
                  {getTutorName(selectedTutor)}.
                </p>
              )}
            </Field>

            {needsPhysicalLocation && selectedTutor && (
              <Field
                label="Tutor's available location"
                help="Choose one of the locations registered by this tutor."
              >
                <select
                  required
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                  value={locationId}
                  onChange={(event) => setLocationId(event.target.value)}
                >
                  <option value="">Select tutor location</option>
                  {selectedTutor.locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
                {selectedTutor.locations.length === 0 && (
                  <p className="mt-1.5 text-xs text-amber-700">
                    This tutor has not added a service location. You can choose
                    Online if the tutor offers it, or contact the tutor after
                    updating their profile.
                  </p>
                )}
              </Field>
            )}

            {needsPhysicalLocation && !selectedTutor && (
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
                  (selectedTutor && availableSubjects.length === 0) ||
                  (selectedTutor && availableModes.length === 0) ||
                  description.trim().length < 10 ||
                  (needsPhysicalLocation &&
                    (!locationId ||
                      (!selectedTutor && (!stateId || !lgaId || lgasLoading))))
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

      {checkoutPreview && (
        <Card className="mb-6 overflow-hidden border-[#B9E5DF] shadow-[0_16px_45px_rgba(16,42,86,0.08)]">
          <CardHeader className="bg-[#F0FBF8]">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-[#009B8D] shadow-sm">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-[#102A56]">
                  Review your payment
                </CardTitle>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Review the contract amount and Tutova platform charge before
                  opening Paystack.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {selectedBookingRequest && (
              <div className="grid gap-3 rounded-xl bg-slate-50 p-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-500">Tutor</p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {(() => {
                      const tutorId =
                        selectedBookingRequest.assigned_tutor_id ||
                        selectedBookingRequest.selected_tutor_id ||
                        "";
                      const tutor = tutorProfiles[tutorId];
                      return (
                        tutor?.full_name ||
                        (tutor
                          ? `${tutor.first_name} ${tutor.last_name}`
                          : "Your selected tutor")
                      );
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Proposed lesson</p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {startAt
                      ? new Date(startAt).toLocaleString("en-NG", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Selected schedule"}{" "}
                    · {duration} minutes
                  </p>
                </div>
              </div>
            )}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-slate-600">
                  Tutoring contract ({contractMonths}{" "}
                  {Number(contractMonths) === 1 ? "month" : "months"})
                </span>
                <span className="font-semibold text-slate-900">
                  {money(
                    checkoutPreview.tutoring_amount_minor,
                    checkoutPreview.currency,
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-slate-600">Tutova platform charge</span>
                <span className="font-semibold text-slate-900">
                  {money(
                    checkoutPreview.learner_fee_minor,
                    checkoutPreview.currency,
                  )}
                </span>
              </div>
              <div className="border-t border-dashed border-slate-200 pt-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-[#102A56]">
                    Total amount to pay
                  </span>
                  <span className="text-xl font-bold tracking-tight text-[#102A56]">
                    {money(
                      checkoutPreview.amount_minor,
                      checkoutPreview.currency,
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-xs leading-5 text-blue-900">
              <p className="font-semibold">What happens next?</p>
              <p className="mt-1">
                You’ll be taken to Paystack to complete this payment securely.
                Tutova creates your lesson booking only after Paystack confirms
                successful payment. Your tutor will then review the paid booking
                request.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={continueToPayment}
                className="min-h-11 px-5"
              >
                Continue to secure payment{" "}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <span className="text-xs text-slate-500">
                Reference: {checkoutPreview.provider_reference}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking request form */}
      {bookingRequest && selectedBookingRequest && !checkoutPreview && (
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

              {monthlyArrangementId ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                  This lesson will be added to your existing tutoring contract.
                  You will not be charged for the contract again.
                </div>
              ) : (
                <Field label="Tutoring contract duration">
                  <select
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                    value={contractMonths}
                    onChange={(event) => setContractMonths(event.target.value)}
                  >
                    <option value="1">1 month</option>
                    <option value="2">2 months</option>
                    <option value="3">3 months</option>
                  </select>
                  <p className="mt-1 text-xs text-slate-500">
                    The full agreed contract amount is paid to Tutova upfront.
                  </p>
                </Field>
              )}

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
                    setContractMonths("1");
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
            Follow tutor responses, choose a tutor and track every booking
            linked to each request.
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
                const hasPendingBooking = requestBookings.some((booking) =>
                  [
                    "PENDING_TUTOR_CONFIRMATION",
                    "PENDING_CONFIRMATION",
                  ].includes(booking.status),
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

                        {request.status === "OPEN" &&
                          request.selected_tutor_response === "DECLINED" && (
                            <Badge>Tutor declined</Badge>
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
                    {user?.role !== "TUTOR" &&
                      (request.assigned_tutor_id ||
                        request.selected_tutor_id) &&
                      (() => {
                        const tutorId = (request.assigned_tutor_id ||
                          request.selected_tutor_id) as string;
                        const tutor = tutorProfiles[tutorId];
                        return (
                          <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                            {tutor?.profile_picture_url ? (
                              <img
                                src={tutor.profile_picture_url}
                                alt={tutor.full_name}
                                className="h-11 w-11 rounded-full object-cover"
                              />
                            ) : (
                              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                                {tutor
                                  ? `${tutor.first_name[0]}${tutor.last_name[0]}`.toUpperCase()
                                  : "T"}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                                {request.assigned_tutor_id
                                  ? "Your assigned tutor"
                                  : "Tutor selected"}
                              </p>
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {tutor?.full_name ||
                                  (tutor
                                    ? `${tutor.first_name} ${tutor.last_name}`
                                    : "Loading tutor profile…")}
                              </p>
                              {tutor?.monthly_fee != null && (
                                <p className="text-xs text-slate-500">
                                  {formatRate(tutor.monthly_fee)} / month
                                </p>
                              )}
                            </div>
                            {tutor && (
                              <Link
                                href={`/tutor/${encodeURIComponent(tutor.id)}`}
                                className="ml-auto text-xs font-semibold text-[#1769D2]"
                              >
                                Profile
                              </Link>
                            )}
                          </div>
                        );
                      })()}

                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {request.description}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      {request.tutoring_mode.replaceAll("_", " ")}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {getRequestStatusDescription(request)}
                    </p>

                    {request.status === "OPEN" &&
                      request.selected_tutor_response === "DECLINED" && (
                        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
                          Your selected tutor declined this request. You can
                          cancel it and submit a new request to choose another
                          tutor.
                        </div>
                      )}

                    {request.preferred_schedule && (
                      <p className="mt-1 text-xs text-slate-500">
                        Preferred schedule: {request.preferred_schedule}
                      </p>
                    )}

                    {request.status === "OPEN" && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {!request.selected_tutor_id && (
                          <Button
                            type="button"
                            variant="outline"
                            disabled={
                              matchingLoading &&
                              matchingRequestId === request.id
                            }
                            onClick={() => void findMatchingTutors(request.id)}
                          >
                            {matchingLoading && matchingRequestId === request.id
                              ? "Finding tutors…"
                              : matchingRequestId === request.id
                                ? "Hide matching tutors"
                                : "Find matching tutors"}
                          </Button>
                        )}
                        {!hasPendingBooking && (
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
                        )}
                      </div>
                    )}

                    {request.status === "ACCEPTED" && !hasPendingBooking && (
                      <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-3">
                        <div className="flex items-start gap-2 text-sm text-emerald-800">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                          <div>
                            <p className="font-medium">
                              The tutor has accepted your tutoring request.
                            </p>
                            <p className="mt-1 text-xs leading-5">
                              You can now propose the exact lesson date and time
                              and pay through Tutova. The tutor will review the
                              paid booking before the agreement is prepared.
                            </p>
                          </div>
                        </div>

                        <Button
                          type="button"
                          className="mt-3"
                          onClick={() => {
                            const existingArrangement =
                              requestBookings.find((item) =>
                                Boolean(item.monthly_arrangement_id),
                              )?.monthly_arrangement_id ?? null;
                            setMonthlyArrangementId(existingArrangement);
                            setCheckoutPreview(null);
                            setBookingRequest(request.id);
                            setStartAt("");
                            setDuration("60");
                            setContractMonths("1");
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
                                    The tutor has accepted the proposed lesson.
                                    Review the tutoring agreement and approve
                                    its terms before the booking is confirmed.
                                  </p>
                                  <Button asChild size="sm">
                                    <Link href="/agreements">
                                      Review tutoring agreement
                                    </Link>
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
                                  <div className="flex min-w-0 items-center gap-3">
                                    {tutor.profile_picture_url ? (
                                      <img
                                        src={tutor.profile_picture_url}
                                        alt={`${tutor.first_name} ${tutor.last_name}`}
                                        className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-2 ring-white shadow-sm"
                                      />
                                    ) : (
                                      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-blue-50 text-lg font-bold text-[#1769D2]">
                                        {`${tutor.first_name?.[0] ?? ""}${tutor.last_name?.[0] ?? ""}`.toUpperCase()}
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <h4 className="truncate font-semibold text-slate-900">
                                        {tutor.first_name} {tutor.last_name}
                                      </h4>
                                      <p className="mt-1 text-sm font-medium text-slate-700">
                                        {formatRate(tutor.monthly_fee)}
                                      </p>
                                      <p className="mt-0.5 text-xs text-slate-500">
                                        {tutor.years_of_experience}{" "}
                                        {tutor.years_of_experience === 1
                                          ? "year"
                                          : "years"}{" "}
                                        teaching experience
                                      </p>
                                    </div>
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
                                {request.status === "OPEN" &&
                                  !request.selected_tutor_id &&
                                  tutor.response_decision === "ACCEPTED" && (
                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-emerald-50 p-3">
                                      <p className="text-sm text-emerald-800">
                                        This tutor is interested in your
                                        request.
                                      </p>
                                      <Button
                                        size="sm"
                                        disabled={busy}
                                        onClick={() =>
                                          void selectRespondingTutor(
                                            request.id,
                                            tutor,
                                          )
                                        }
                                      >
                                        Select this tutor
                                      </Button>
                                    </div>
                                  )}
                                {request.selected_tutor_id &&
                                  tutor.response_decision === "ACCEPTED" && (
                                    <p className="mt-3 text-xs font-medium text-emerald-700">
                                      Selected tutor response
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
