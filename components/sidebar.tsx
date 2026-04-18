"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDashboard } from "@/app/(dashboard)/context";
import { signOut } from "@/lib/auth-client";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
        <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
        <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
        <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    label: "Ticket Types",
    href: "/ticket-types",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M2 9a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9z" stroke="currentColor" strokeWidth="2" />
        <circle cx="7" cy="12" r="1.5" fill="currentColor" />
        <circle cx="17" cy="12" r="1.5" fill="currentColor" />
        <path d="M10 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Payment Methods",
    href: "/payment-methods",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M2 10h20" stroke="currentColor" strokeWidth="2" />
        <circle cx="6" cy="15" r="1" fill="currentColor" />
        <path d="M10 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Purchase History",
    href: "/purchase-history",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
];

function OrgInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { me, loading } = useDashboard();

  const orgName = me?.organization?.name ?? "Loading…";
  const initials = me?.organization?.name ? OrgInitials(me.organization.name) : "MT";

  async function handleLogout() {
    await signOut();
    router.push("/login");
  }

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
      {/* Hospital identity */}
      <div className="px-5 py-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1a7f8a] flex items-center justify-center flex-shrink-0">
            {loading ? (
              <span className="text-white text-xs font-bold">MT</span>
            ) : (
              <span className="text-white text-xs font-bold">{initials}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 leading-tight truncate">{orgName}</p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Central Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#1a7f8a]/10 text-[#1a7f8a]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <span className={isActive ? "text-[#1a7f8a]" : "text-gray-400"}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Create New Ticket */}
      <div className="px-4 pb-4">
        <Link
          href="/ticket-types/new"
          className="flex items-center justify-center gap-2 w-full bg-[#1a7f8a] text-white text-sm font-semibold rounded-xl py-3 hover:bg-[#156870] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          Create New Ticket
        </Link>
      </div>

      {/* Bottom nav */}
      <div className="px-3 pb-6 flex flex-col gap-1 border-t border-gray-100 pt-3">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            pathname === "/settings"
              ? "bg-[#1a7f8a]/10 text-[#1a7f8a]"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2" />
          </svg>
          Settings
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all w-full text-left"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}
