import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "Tutova — The right tutor. A brighter future.",
    template: "%s | Tutova",
  },
  description:
    "Find verified tutors, arrange lessons and follow learner progress with Tutova.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div>{children}</div>

          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
