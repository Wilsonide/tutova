import { Suspense } from "react";
import NewRequestClient from "./new-request-client";
export default function NewRequestPage() {
  return (
    <Suspense>
      <NewRequestClient />
    </Suspense>
  );
}
