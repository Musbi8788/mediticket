import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { DashboardProvider } from "./context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <div className="flex min-h-screen bg-[#f0f4f5]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 p-8 overflow-auto">{children}</main>
        </div>
      </div>
    </DashboardProvider>
  );
}
