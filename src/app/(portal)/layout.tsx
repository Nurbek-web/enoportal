import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen min-w-0 transition-all duration-300">
        <Header />
        <main className="flex-1 px-4 py-4 md:px-6 md:py-6">{children}</main>
      </div>
    </div>
  );
}
