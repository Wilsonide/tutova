"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

type VerificationResponse = {
  message?: string;
  status?: string;
};

type VerificationState = "VERIFYING" | "SUCCESS" | "FAILED";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  const hasVerified = useRef(false);

  const [state, setState] = useState<VerificationState>("VERIFYING");

  const [message, setMessage] = useState(
    "Please wait while we confirm your payment.",
  );

  useEffect(() => {
    if (!reference || hasVerified.current) {
      if (!reference) {
        setState("FAILED");
        setMessage(
          "No payment reference was provided. We could not verify this transaction.",
        );
      }
      return;
    }

    hasVerified.current = true;

    const verifyPayment = async () => {
      try {
        const result = await api<VerificationResponse>(
          `/payments/reference/${encodeURIComponent(reference)}/verify`,
          {
            method: "POST",
          },
        );

        setState("SUCCESS");
        setMessage(
          result?.message || "Your payment has been verified successfully.",
        );
      } catch (error) {
        console.error("Payment verification failed:", error);

        setState("FAILED");

        setMessage(
          error instanceof Error
            ? error.message
            : "We could not verify your payment. Please check your payment history or contact support.",
        );
      }
    };

    verifyPayment();
  }, [reference]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {state === "VERIFYING" && (
          <>
            <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <h1 className="text-xl font-semibold text-slate-900">
              Verifying your payment
            </h1>

            <p className="mt-3 text-sm text-slate-600">{message}</p>
          </>
        )}

        {state === "SUCCESS" && (
          <>
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">
              ✓
            </div>

            <h1 className="text-xl font-semibold text-slate-900">
              Payment successful
            </h1>

            <p className="mt-3 text-sm text-slate-600">{message}</p>

            <p className="mt-4 break-all text-xs text-slate-400">
              Reference: {reference}
            </p>

            <Link
              href="/dashboard"
              className="mt-8 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              Continue to dashboard
            </Link>
          </>
        )}

        {state === "FAILED" && (
          <>
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl text-red-600">
              !
            </div>

            <h1 className="text-xl font-semibold text-slate-900">
              Payment verification unsuccessful
            </h1>

            <p className="mt-3 text-sm text-slate-600">{message}</p>

            {reference && (
              <p className="mt-4 break-all text-xs text-slate-400">
                Reference: {reference}
              </p>
            )}

            <Link
              href="/dashboard"
              className="mt-8 inline-flex w-full items-center justify-center rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Return to dashboard
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm text-slate-600">
            Loading payment information...
          </p>
        </main>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
