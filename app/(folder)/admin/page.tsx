"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { api, money } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/providers";
import { toast } from "sonner";
import { AlertTriangle, X } from "lucide-react";

type VerificationStatus =
  | "NOT_SUBMITTED"
  | "PENDING_REVIEW"
  | "CHANGES_REQUESTED"
  | "APPROVED"
  | "REJECTED";

type Verification = {
  id: string;
  tutor_user_id: string;
  status: VerificationStatus;
  identity_document_type: string | null;
  nda_version: string | null;
  nda_accepted_at: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
};

type PayoutStatus = "REQUESTED" | "PROCESSING" | "PAID" | "FAILED" | "REVERSED";

type Payout = {
  id: string;
  tutor_profile_id: string;
  payment_id: string;
  provider_reference: string | null;
  amount_minor: number;
  currency: string;
  status: PayoutStatus;
  failure_reason: string | null;
  paid_at: string | null;
  created_at: string;
};

type ReviewDecision = "APPROVED" | "REJECTED" | "CHANGES_REQUESTED";

type IdentityDocumentDownload = {
  download_url: string;
  expires_in_seconds: number;
};

type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";

type AdminTutorProfile = {
  id: string;
  user_id: string;
  bio: string | null;
  hourly_rate: number | null;
  qualifications: string | null;
  years_of_experience: number;
  teaching_languages: string[];
  learner_age_groups: string[];
  tutoring_modes: string[];
  service_area: string | null;
  profile_picture_url: string | null;
  created_at: string;
  updated_at: string;
};

type AdminTutor = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  role: "TUTOR";
  account_type: "TUTOR";
  status: UserStatus;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  must_change_password: boolean;
  created_at: string;
  verification_status: VerificationStatus | null;
  tutor_profile: AdminTutorProfile | null;
};

type AdminTutorList = {
  items: AdminTutor[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
};

type RefundStatus = "PENDING" | "PROCESSING" | "PROCESSED" | "FAILED";

type Refund = {
  id: string;
  payment_id: string;
  provider_reference: string | null;
  amount_minor: number;
  tutor_share_minor: number;
  platform_share_minor: number;
  currency: string;
  status: RefundStatus;
  reason: string;
  failure_reason: string | null;
  processed_at: string | null;
  created_at: string;
};

type TutorStatusConfirmation = {
  tutor: AdminTutor;
  status: "SUSPENDED" | "INACTIVE";
};

const PAGE_SIZE = 10;

function formatDate(value: string | null | undefined) {
  if (!value) return "Unavailable";

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "Unavailable" : date.toLocaleString();
}

function formatRate(value: number | null) {
  if (value === null || value === undefined) return "Not set";

  return `₦${Number(value).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} / hour`;
}

function formatList(values: string[] | null | undefined) {
  return values?.length ? values.join(", ") : "Not provided";
}

function statusClass(status: string) {
  switch (status) {
    case "ACTIVE":
    case "APPROVED":
    case "PAID":
    case "PROCESSED":
      return "border-green-200 bg-green-50 text-green-700";
    case "PENDING_REVIEW":
    case "PENDING":
    case "PROCESSING":
    case "REQUESTED":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "SUSPENDED":
    case "REJECTED":
    case "FAILED":
    case "REVERSED":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [checks, setChecks] = useState<Verification[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [tutors, setTutors] = useState<AdminTutor[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);

  const [tutorSearch, setTutorSearch] = useState("");
  const [tutorStatusFilter, setTutorStatusFilter] = useState("");
  const [tutorPage, setTutorPage] = useState(1);
  const [tutorTotal, setTutorTotal] = useState(0);
  const [tutorTotalPages, setTutorTotalPages] = useState(1);

  const [statusConfirmation, setStatusConfirmation] =
    useState<TutorStatusConfirmation | null>(null);

  const [refundPaymentId, setRefundPaymentId] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  const [notes, setNotes] = useState<Record<string, string>>({});
  const [otpValues, setOtpValues] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyVerification, setBusyVerification] = useState<string | null>(null);
  const [busyPayout, setBusyPayout] = useState<string | null>(null);
  const [busyTutor, setBusyTutor] = useState<string | null>(null);
  const [busyRefund, setBusyRefund] = useState<string | null>(null);
  const [creatingRefund, setCreatingRefund] = useState(false);
  const [openingDocument, setOpeningDocument] = useState<string | null>(null);

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  const load = useCallback(
    async (showRefreshState = false) => {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const [verificationResult, payoutResult, tutorResult, refundResult] =
          await Promise.allSettled([
            api<Verification[]>("/verification/admin/pending?limit=100"),
            api<Payout[]>("/payments/admin/payouts"),
            api<AdminTutorList>(
              `/admin/tutors?page=${tutorPage}&per_page=${PAGE_SIZE}${
                tutorSearch.trim()
                  ? `&search=${encodeURIComponent(tutorSearch.trim())}`
                  : ""
              }${
                tutorStatusFilter
                  ? `&status=${encodeURIComponent(tutorStatusFilter)}`
                  : ""
              }`,
            ),
            api<Refund[]>("/payments/admin/refunds"),
          ]);

        const errors: string[] = [];

        if (verificationResult.status === "fulfilled") {
          setChecks(verificationResult.value);
        } else {
          errors.push("verification queue");
        }

        if (payoutResult.status === "fulfilled") {
          setPayouts(payoutResult.value);
        } else {
          errors.push("payout records");
        }

        if (tutorResult.status === "fulfilled") {
          setTutors(tutorResult.value.items);
          setTutorTotal(tutorResult.value.total);
          setTutorTotalPages(Math.max(1, tutorResult.value.total_pages));
        } else {
          errors.push("tutor directory");
        }

        if (refundResult.status === "fulfilled") {
          setRefunds(refundResult.value);
        } else {
          errors.push("refund records");
        }

        if (errors.length) {
          toast.error(`Could not load: ${errors.join(", ")}.`);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [tutorPage, tutorSearch, tutorStatusFilter],
  );

  useEffect(() => {
    if (isAdmin) {
      void load();
    } else {
      setLoading(false);
    }
  }, [isAdmin, load]);

  async function review(id: string, decision: ReviewDecision) {
    const reviewNotes = (notes[id] || "").trim();

    if (
      (decision === "REJECTED" || decision === "CHANGES_REQUESTED") &&
      !reviewNotes
    ) {
      toast.error("Review notes are required for this decision.");
      return;
    }

    setBusyVerification(id);

    try {
      await api(`/verification/admin/${id}/review`, {
        method: "POST",
        body: JSON.stringify({
          decision,
          review_notes: reviewNotes || null,
        }),
      });

      toast.success(
        decision === "APPROVED"
          ? "Tutor verification approved"
          : decision === "REJECTED"
            ? "Tutor verification rejected"
            : "Changes requested successfully",
      );

      setNotes((current) => {
        const updated = { ...current };
        delete updated[id];
        return updated;
      });

      await load(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Review failed");
    } finally {
      setBusyVerification(null);
    }
  }

  async function openIdentityDocument(verificationId: string) {
    setOpeningDocument(verificationId);

    try {
      const result = await api<IdentityDocumentDownload>(
        `/verification/admin/${verificationId}/identity-document`,
      );

      if (!result.download_url) {
        throw new Error("The document download link was not returned.");
      }

      window.open(result.download_url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not open identity document",
      );
    } finally {
      setOpeningDocument(null);
    }
  }

  // View the existing public tutor profile page.
  // The route expects the tutor profile ID, not the user ID.
  function viewTutorDetails(tutor: AdminTutor) {
    const profileId = tutor.tutor_profile?.id;

    if (!profileId) {
      toast.error("This tutor has not created a teaching profile yet.");
      return;
    }

    router.push(`/tutor/${encodeURIComponent(profileId)}`);
  }

  async function updateTutorStatus(tutor: AdminTutor, status: UserStatus) {
    if (tutor.status === status) return;

    setBusyTutor(tutor.user_id);

    try {
      await api(`/admin/tutors/${tutor.user_id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      toast.success(
        status === "ACTIVE"
          ? "Tutor account activated."
          : status === "SUSPENDED"
            ? "Tutor account suspended."
            : "Tutor account deactivated.",
      );

      setStatusConfirmation(null);
      await load(true);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update tutor status",
      );
    } finally {
      setBusyTutor(null);
    }
  }

  function requestTutorStatusChange(
    tutor: AdminTutor,
    status: "SUSPENDED" | "INACTIVE",
  ) {
    if (tutor.status === status) return;
    setStatusConfirmation({ tutor, status });
  }

  async function confirmTutorStatusChange() {
    if (!statusConfirmation) return;

    await updateTutorStatus(
      statusConfirmation.tutor,
      statusConfirmation.status,
    );
  }

  async function processPayout(payout: Payout) {
    if (payout.status !== "REQUESTED") return;

    setBusyPayout(payout.id);

    try {
      await api(`/payments/admin/payouts/${payout.id}/process`, {
        method: "POST",
      });

      toast.success("Payout processing request submitted.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not process payout",
      );
    } finally {
      await load(true);
      setBusyPayout(null);
    }
  }

  async function retryPayout(payout: Payout) {
    if (payout.status !== "FAILED" && payout.status !== "REVERSED") {
      return;
    }

    setBusyPayout(payout.id);

    try {
      await api(`/payments/admin/payouts/${payout.id}/retry`, {
        method: "POST",
      });

      toast.success("Payout retry submitted.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Payout retry failed",
      );
    } finally {
      await load(true);
      setBusyPayout(null);
    }
  }

  async function verifyPayout(payout: Payout) {
    if (payout.status !== "PROCESSING") return;

    setBusyPayout(payout.id);

    try {
      await api(`/payments/admin/payouts/${payout.id}/verify`, {
        method: "POST",
      });

      toast.success("Payout status verified.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not verify payout",
      );
    } finally {
      await load(true);
      setBusyPayout(null);
    }
  }

  async function finalizePayout(payout: Payout) {
    const otp = (otpValues[payout.id] || "").trim();

    if (!otp) {
      toast.error("Enter the OTP to finalize this payout.");
      return;
    }

    if (otp.length < 4 || otp.length > 12) {
      toast.error("The OTP must contain between 4 and 12 characters.");
      return;
    }

    if (payout.status !== "PROCESSING") return;

    setBusyPayout(payout.id);

    try {
      await api(`/payments/admin/payouts/${payout.id}/finalize`, {
        method: "POST",
        body: JSON.stringify({ otp }),
      });

      toast.success("Payout finalization submitted.");

      setOtpValues((current) => {
        const updated = { ...current };
        delete updated[payout.id];
        return updated;
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not finalize payout",
      );
    } finally {
      await load(true);
      setBusyPayout(null);
    }
  }

  async function createRefund(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const paymentId = refundPaymentId.trim();
    const amount = Number(refundAmount);
    const reason = refundReason.trim();

    if (!paymentId) {
      toast.error("Enter the payment ID.");
      return;
    }

    if (!Number.isSafeInteger(amount) || amount <= 0) {
      toast.error("Enter a valid refund amount in kobo.");
      return;
    }

    if (reason.length < 3 || reason.length > 500) {
      toast.error("The reason must contain between 3 and 500 characters.");
      return;
    }

    setCreatingRefund(true);

    try {
      await api(`/payments/admin/${paymentId}/refund`, {
        method: "POST",
        body: JSON.stringify({
          amount_minor: amount,
          reason,
        }),
      });

      toast.success("Refund request submitted.");

      setRefundPaymentId("");
      setRefundAmount("");
      setRefundReason("");

      await load(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not initiate refund",
      );

      await load(true);
    } finally {
      setCreatingRefund(false);
    }
  }

  async function verifyRefund(refund: Refund) {
    if (refund.status !== "PENDING" && refund.status !== "PROCESSING") {
      return;
    }

    setBusyRefund(refund.id);

    try {
      await api(`/payments/admin/refunds/${refund.id}/verify`, {
        method: "POST",
      });

      toast.success("Refund status verification submitted.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not verify refund",
      );
    } finally {
      await load(true);
      setBusyRefund(null);
    }
  }

  if (!isAdmin) {
    return (
      <AppShell title="Admin" description="Restricted area">
        <p className="text-sm text-slate-500">
          Your account does not have the administrator role.
        </p>
      </AppShell>
    );
  }

  const confirmationTutor = statusConfirmation?.tutor;
  const confirmationStatus = statusConfirmation?.status;
  const confirmationBusy = confirmationTutor
    ? busyTutor === confirmationTutor.user_id
    : false;

  return (
    <AppShell
      title="Admin console"
      description="Manage tutors, verification reviews, payouts and payment refunds."
    >
      {/* Tutor status confirmation modal */}
      {statusConfirmation && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !confirmationBusy) {
              setStatusConfirmation(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tutor-status-dialog-title"
            aria-describedby="tutor-status-dialog-description"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <AlertTriangle size={22} />
              </div>

              <button
                type="button"
                aria-label="Close confirmation"
                disabled={confirmationBusy}
                onClick={() => setStatusConfirmation(null)}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <h2
              id="tutor-status-dialog-title"
              className="mt-4 text-lg font-bold text-[#102A56]"
            >
              {confirmationStatus === "SUSPENDED"
                ? "Suspend this tutor?"
                : "Deactivate this tutor?"}
            </h2>

            <p
              id="tutor-status-dialog-description"
              className="mt-2 text-sm leading-6 text-slate-600"
            >
              You are about to{" "}
              {confirmationStatus === "SUSPENDED" ? "suspend" : "deactivate"}{" "}
              <strong className="text-slate-800">
                {confirmationTutor?.first_name} {confirmationTutor?.last_name}
              </strong>
              's account.
              {confirmationStatus === "SUSPENDED"
                ? " The account will be marked as suspended."
                : " The account will be marked as inactive."}{" "}
              You can reactivate the account later from tutor management.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={confirmationBusy}
                onClick={() => setStatusConfirmation(null)}
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={confirmationBusy}
                onClick={() => void confirmTutorStatusChange()}
                className={
                  confirmationStatus === "SUSPENDED"
                    ? "bg-amber-600 text-white hover:bg-amber-700"
                    : "bg-red-600 text-white hover:bg-red-700"
                }
              >
                {confirmationBusy
                  ? "Updating..."
                  : confirmationStatus === "SUSPENDED"
                    ? "Yes, suspend tutor"
                    : "Yes, deactivate tutor"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Administration and financial operations.
        </p>

        <Button
          variant="outline"
          size="sm"
          disabled={loading || refreshing}
          onClick={() => void load(true)}
        >
          {refreshing ? "Refreshing..." : "Refresh admin data"}
        </Button>
      </div>

      {/* Tutor management */}
      <section id="tutors" className="scroll-mt-24">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>Tutor management</CardTitle>
              <Badge>{tutorTotal} tutors</Badge>
            </div>
          </CardHeader>

          <CardContent>
            <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px_auto]">
              <Field label="Search tutors">
                <input
                  value={tutorSearch}
                  onChange={(event) => {
                    setTutorSearch(event.target.value);
                    setTutorPage(1);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void load(true);
                  }}
                  placeholder="Name, email or phone number"
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#1769D2] focus:ring-2 focus:ring-[#1769D2]/10"
                />
              </Field>

              <Field label="Account status">
                <select
                  value={tutorStatusFilter}
                  onChange={(event) => {
                    setTutorStatusFilter(event.target.value);
                    setTutorPage(1);
                  }}
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#1769D2]"
                >
                  <option value="">All statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="PENDING_VERIFICATION">
                    Pending verification
                  </option>
                </select>
              </Field>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  disabled={loading || refreshing}
                  onClick={() => void load(true)}
                >
                  Search
                </Button>
              </div>
            </div>

            {loading ? (
              <p className="py-5 text-sm text-slate-500">Loading tutors...</p>
            ) : tutors.length ? (
              <div className="space-y-4">
                {tutors.map((tutor) => {
                  const busy = busyTutor === tutor.user_id;
                  const profile = tutor.tutor_profile;

                  return (
                    <div
                      key={tutor.user_id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                          {profile?.profile_picture_url ? (
                            <img
                              src={profile.profile_picture_url}
                              alt={`${tutor.first_name} ${tutor.last_name}`}
                              className="h-14 w-14 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[#EDF4FF] text-lg font-bold text-[#1769D2]">
                              {tutor.first_name.charAt(0)}
                              {tutor.last_name.charAt(0)}
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="font-semibold text-[#102A56]">
                              {tutor.first_name} {tutor.last_name}
                            </p>
                            <p className="mt-1 break-all text-sm text-slate-500">
                              {tutor.email}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {tutor.phone_number || "No phone number"}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              Joined {formatDate(tutor.created_at)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge className={statusClass(tutor.status)}>
                            {tutor.status.replaceAll("_", " ")}
                          </Badge>
                          <Badge
                            className={statusClass(
                              tutor.verification_status || "NOT_SUBMITTED",
                            )}
                          >
                            {(
                              tutor.verification_status || "NOT SUBMITTED"
                            ).replaceAll("_", " ")}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <p className="text-xs text-slate-400">Hourly rate</p>
                          <p className="mt-1 font-medium text-slate-700">
                            {formatRate(profile?.hourly_rate ?? null)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Experience</p>
                          <p className="mt-1 font-medium text-slate-700">
                            {profile
                              ? `${profile.years_of_experience} years`
                              : "Profile not created"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">
                            Teaching modes
                          </p>
                          <p className="mt-1 font-medium text-slate-700">
                            {formatList(profile?.tutoring_modes)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!profile?.id}
                          onClick={() => viewTutorDetails(tutor)}
                        >
                          {profile?.id
                            ? "View details"
                            : "No profile available"}
                        </Button>

                        {tutor.status !== "ACTIVE" && (
                          <Button
                            size="sm"
                            disabled={busy}
                            onClick={() =>
                              void updateTutorStatus(tutor, "ACTIVE")
                            }
                          >
                            {busy ? "Updating..." : "Activate"}
                          </Button>
                        )}

                        {tutor.status === "ACTIVE" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            onClick={() =>
                              requestTutorStatusChange(tutor, "SUSPENDED")
                            }
                          >
                            Suspend
                          </Button>
                        )}

                        {tutor.status !== "INACTIVE" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            onClick={() =>
                              requestTutorStatusChange(tutor, "INACTIVE")
                            }
                          >
                            Deactivate
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <p className="text-xs text-slate-500">
                    Page {tutorPage} of {tutorTotalPages} · {tutorTotal} tutors
                  </p>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={tutorPage <= 1 || loading}
                      onClick={() => setTutorPage((page) => page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={tutorPage >= tutorTotalPages || loading}
                      onClick={() => setTutorPage((page) => page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="py-5 text-sm text-slate-500">
                No tutors found for the selected filters.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Verification queue */}
      <section id="verification" className="mt-6 scroll-mt-24">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>Pending tutor verification</CardTitle>
              <Badge>{checks.length} pending</Badge>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <p className="py-5 text-sm text-slate-500">
                Loading verification records...
              </p>
            ) : checks.length ? (
              checks.map((verification) => {
                const isBusy = busyVerification === verification.id;

                return (
                  <div
                    key={verification.id}
                    className="border-b border-slate-100 py-5 last:border-0"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-[#102A56]">
                          Tutor {verification.tutor_user_id}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {verification.identity_document_type ||
                            "Document type unavailable"}
                          {" · "}
                          {formatDate(verification.submitted_at)}
                        </p>
                        <p className="mt-1 break-all text-xs text-slate-500">
                          Verification ID: {verification.id}
                        </p>
                      </div>
                      <Badge className={statusClass(verification.status)}>
                        {verification.status}
                      </Badge>
                    </div>

                    <div className="mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={openingDocument === verification.id}
                        onClick={() =>
                          void openIdentityDocument(verification.id)
                        }
                      >
                        {openingDocument === verification.id
                          ? "Opening document..."
                          : "View identity document"}
                      </Button>
                    </div>

                    {verification.review_notes && (
                      <div className="mt-3 rounded-lg bg-slate-50 p-3">
                        <p className="text-xs font-semibold text-slate-600">
                          Previous review notes
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                          {verification.review_notes}
                        </p>
                      </div>
                    )}

                    <div className="mt-4">
                      <Field label="Review notes">
                        <Textarea
                          rows={3}
                          maxLength={3000}
                          placeholder="Add feedback or explain the reason for your decision..."
                          value={notes[verification.id] || ""}
                          onChange={(event) =>
                            setNotes((current) => ({
                              ...current,
                              [verification.id]: event.target.value,
                            }))
                          }
                        />
                      </Field>
                      <p className="mt-1 text-right text-xs text-slate-400">
                        {(notes[verification.id] || "").length}/3000
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        disabled={isBusy}
                        onClick={() => void review(verification.id, "APPROVED")}
                      >
                        {isBusy ? "Processing..." : "Approve"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isBusy}
                        onClick={() =>
                          void review(verification.id, "CHANGES_REQUESTED")
                        }
                      >
                        Request changes
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isBusy}
                        onClick={() => void review(verification.id, "REJECTED")}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="py-5 text-sm text-slate-500">
                No pending verification records.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Payouts */}
      <section id="payouts" className="mt-6 scroll-mt-24">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>Tutor payouts</CardTitle>
              <Badge>{payouts.length} records</Badge>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <p className="py-5 text-sm text-slate-500">
                Loading payout records...
              </p>
            ) : payouts.length ? (
              payouts.map((payout) => {
                const isBusy = busyPayout === payout.id;

                return (
                  <div
                    key={payout.id}
                    className="border-b border-slate-100 py-5 last:border-0"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-lg font-semibold text-[#102A56]">
                          {money(payout.amount_minor, payout.currency)}
                        </p>
                        <p className="mt-1 break-all text-xs text-slate-500">
                          Provider reference:{" "}
                          {payout.provider_reference || "Unavailable"}
                        </p>
                        <p className="mt-1 break-all text-xs text-slate-500">
                          Payout ID: {payout.id}
                        </p>
                        <p className="mt-1 break-all text-xs text-slate-500">
                          Payment ID: {payout.payment_id}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Created: {formatDate(payout.created_at)}
                        </p>
                        {payout.paid_at && (
                          <p className="mt-1 text-xs text-slate-500">
                            Paid: {formatDate(payout.paid_at)}
                          </p>
                        )}
                      </div>
                      <Badge className={statusClass(payout.status)}>
                        {payout.status}
                      </Badge>
                    </div>

                    {payout.failure_reason && (
                      <div className="mt-3 rounded-lg border border-red-100 bg-red-50 p-3">
                        <p className="text-xs font-semibold text-red-700">
                          Failure reason
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-red-700">
                          {payout.failure_reason}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {payout.status === "REQUESTED" && (
                        <Button
                          size="sm"
                          disabled={isBusy}
                          onClick={() => void processPayout(payout)}
                        >
                          {isBusy ? "Processing..." : "Process payout"}
                        </Button>
                      )}

                      {payout.status === "PROCESSING" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isBusy}
                          onClick={() => void verifyPayout(payout)}
                        >
                          {isBusy ? "Verifying..." : "Verify payout"}
                        </Button>
                      )}

                      {(payout.status === "FAILED" ||
                        payout.status === "REVERSED") && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isBusy}
                          onClick={() => void retryPayout(payout)}
                        >
                          {isBusy ? "Retrying..." : "Retry payout"}
                        </Button>
                      )}

                      {payout.status === "PAID" && (
                        <span className="text-sm font-medium text-green-700">
                          Payout completed
                        </span>
                      )}
                    </div>

                    {payout.status === "PROCESSING" && (
                      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-[#102A56]">
                          Finalize payout
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          If this transfer is awaiting OTP confirmation, enter
                          the OTP to finalize it. You can also verify its
                          provider status before taking further action.
                        </p>

                        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
                          <div className="flex-1">
                            <Field label="Transfer OTP">
                              <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={12}
                                placeholder="Enter OTP"
                                value={otpValues[payout.id] || ""}
                                onChange={(event) =>
                                  setOtpValues((current) => ({
                                    ...current,
                                    [payout.id]: event.target.value,
                                  }))
                                }
                                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#1769D2]"
                              />
                            </Field>
                          </div>
                          <Button
                            size="sm"
                            disabled={
                              isBusy || !(otpValues[payout.id] || "").trim()
                            }
                            onClick={() => void finalizePayout(payout)}
                          >
                            {isBusy ? "Finalizing..." : "Finalize payout"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="py-5 text-sm text-slate-500">No payout requests.</p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Refund management */}
      <section id="refunds" className="mt-6 scroll-mt-24">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>Payment refunds</CardTitle>
              <Badge>{refunds.length} records</Badge>
            </div>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={createRefund}
              className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <h3 className="font-semibold text-[#102A56]">
                Initiate a refund
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Enter the payment ID and refund amount in kobo. The payment
                service validates the refundable balance and payout
                restrictions.
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Field label="Payment ID">
                  <input
                    value={refundPaymentId}
                    onChange={(event) => setRefundPaymentId(event.target.value)}
                    placeholder="Enter payment ID"
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#1769D2]"
                    required
                  />
                </Field>

                <Field label="Refund amount (kobo)">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={refundAmount}
                    onChange={(event) => setRefundAmount(event.target.value)}
                    placeholder="e.g. 150000"
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#1769D2]"
                    required
                  />
                </Field>

                <div className="md:col-span-2">
                  <Field label="Reason">
                    <Textarea
                      rows={3}
                      minLength={3}
                      maxLength={500}
                      value={refundReason}
                      onChange={(event) => setRefundReason(event.target.value)}
                      placeholder="Explain why this payment is being refunded..."
                      required
                    />
                  </Field>
                  <p className="mt-1 text-right text-xs text-slate-400">
                    {refundReason.length}/500
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <Button type="submit" disabled={creatingRefund}>
                  {creatingRefund ? "Submitting refund..." : "Initiate refund"}
                </Button>
              </div>
            </form>

            <div className="space-y-4">
              {loading ? (
                <p className="py-5 text-sm text-slate-500">
                  Loading refund records...
                </p>
              ) : refunds.length ? (
                refunds.map((refund) => {
                  const isBusy = busyRefund === refund.id;
                  const canVerify =
                    refund.status === "PENDING" ||
                    refund.status === "PROCESSING";

                  return (
                    <div
                      key={refund.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-[#102A56]">
                            {money(refund.amount_minor, refund.currency)}
                          </p>
                          <p className="mt-1 break-all text-xs text-slate-500">
                            Refund ID: {refund.id}
                          </p>
                          <p className="mt-1 break-all text-xs text-slate-500">
                            Payment ID: {refund.payment_id}
                          </p>
                          <p className="mt-1 break-all text-xs text-slate-500">
                            Provider reference:{" "}
                            {refund.provider_reference || "Unavailable"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Created: {formatDate(refund.created_at)}
                          </p>
                          {refund.processed_at && (
                            <p className="mt-1 text-xs text-slate-500">
                              Processed: {formatDate(refund.processed_at)}
                            </p>
                          )}
                        </div>

                        <Badge className={statusClass(refund.status)}>
                          {refund.status}
                        </Badge>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-xs text-slate-400">Tutor share</p>
                          <p className="mt-1 text-sm font-medium text-slate-700">
                            {money(refund.tutor_share_minor, refund.currency)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">
                            Platform share
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-700">
                            {money(
                              refund.platform_share_minor,
                              refund.currency,
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 rounded-lg bg-slate-50 p-3">
                        <p className="text-xs font-semibold text-slate-600">
                          Reason
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                          {refund.reason}
                        </p>
                      </div>

                      {refund.failure_reason && (
                        <div className="mt-3 rounded-lg border border-red-100 bg-red-50 p-3">
                          <p className="text-xs font-semibold text-red-700">
                            Failure reason
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-sm text-red-700">
                            {refund.failure_reason}
                          </p>
                        </div>
                      )}

                      {canVerify && (
                        <div className="mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isBusy}
                            onClick={() => void verifyRefund(refund)}
                          >
                            {isBusy ? "Verifying..." : "Verify refund"}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="py-5 text-sm text-slate-500">
                  No refund records found.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
