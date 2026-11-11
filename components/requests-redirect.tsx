"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export function RequestsRedirect({
  tutorId,
  offeringId,
}: {
  tutorId: string;
  offeringId: string;
}) {
  const router = useRouter();
  useEffect(() => {
    const q = new URLSearchParams();
    if (tutorId) q.set("tutor", tutorId);
    if (offeringId) q.set("offering", offeringId);
    q.set("new", "1");
    router.replace(`/requests?${q.toString()}`);
  }, [router, tutorId, offeringId]);
  return (
    <div className="grid min-h-screen place-items-center text-sm text-slate-500">
      Opening request form…
    </div>
  );
}
