import SiteHeader from "@/components/site-header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <div className="pt-[76px]">{children}</div>
    </>
  );
}
