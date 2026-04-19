import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { DashboardProvider } from "./context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <div className="flex absolute inset-0 w-full min-h-screen overflow-hidden bg-[#f0f4f5]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar />
          <main className="p-8 grow overflow-y-auto">{children}</main>
        </div>
      </div>
    </DashboardProvider>
  );
}
