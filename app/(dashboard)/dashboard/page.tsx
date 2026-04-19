"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ActivityItem {
  id: string;
  name: string;
  shortId: string;
  initials: string;
  time: string;
  status: string;
  amount: string;
}

interface StatsData {
  totalTickets: number;
  ticketTrend: number | null;
  monthlyRevenue: number;
  revenueGoalPercent: number;
  activeAdmissions: number;
  recentActivity: ActivityItem[];
}

const ACTIVITY_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-green-100 text-green-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
];

const statusStyles: Record<string, string> = {
  COMPLETED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-gray-100 text-gray-600",
  FAILED: "text-red-600 font-semibold",
  REFUNDED: "bg-yellow-100 text-yellow-700",
};

function StatsSkeleton() {
  return (
    <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-32" />
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatRevenue = (amount: number) =>
    `D ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page heading */}
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-[0.18em] text-[#1a7f8a] uppercase mb-1">
          Clinical Oversight
        </p>
        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900">Administrative Dashboard</h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Total Tickets Sold */}
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-3 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Tickets Sold</p>
              {loading ? (
                <StatsSkeleton />
              ) : (
                <p className="text-4xl font-extrabold text-gray-900 tracking-tight">
                  {stats?.totalTickets.toLocaleString() ?? "0"}
                </p>
              )}
            </div>
            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M2 9a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9z" stroke="#9ca3af" strokeWidth="2" />
                <circle cx="7" cy="12" r="1.5" fill="#9ca3af" />
                <circle cx="17" cy="12" r="1.5" fill="#9ca3af" />
                <path d="M10 12h4" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-medium">
            {!loading && stats?.ticketTrend !== null && stats?.ticketTrend !== undefined ? (
              <span className={stats.ticketTrend >= 0 ? "text-[#1a7f8a]" : "text-red-500"}>
                {stats.ticketTrend >= 0 ? "↑" : "↓"} {Math.abs(stats.ticketTrend)}% from last month
              </span>
            ) : (
              <span className="text-gray-400 text-xs">No prior month data</span>
            )}
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-3 shadow-sm">
          <p className="text-sm text-gray-500">Monthly Revenue</p>
          {loading ? (
            <StatsSkeleton />
          ) : (
            <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {formatRevenue(stats?.monthlyRevenue ?? 0)}
            </p>
          )}
          <div className="space-y-1.5">
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1a7f8a] rounded-full transition-all duration-700"
                style={{ width: `${stats?.revenueGoalPercent ?? 0}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">
              {loading ? "Loading…" : `${stats?.revenueGoalPercent ?? 0}% of Monthly Goal reached`}
            </p>
          </div>
        </div>

        {/* Pending Tickets */}
        <div className="bg-white rounded-2xl p-6 flex flex-col gap-3 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-sm text-gray-500">Pending Tickets</p>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v4l3 3" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="9" stroke="#3b82f6" strokeWidth="2" />
              </svg>
            </div>
          </div>
          {loading ? (
            <StatsSkeleton />
          ) : (
            <p className="text-4xl font-extrabold text-gray-900 tracking-tight">
              {stats?.activeAdmissions.toLocaleString() ?? "0"}
            </p>
          )}
          <p className="text-sm text-[#1a7f8a] font-medium">Awaiting processing</p>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Operations */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 className="text-base font-bold text-gray-900">Quick Operations</h2>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/ticket-types"
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-[#1a7f8a]/30 hover:bg-[#1a7f8a]/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-[#1a7f8a] flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-[#1a7f8a] transition-colors">
                Add Ticket Type
              </span>
            </Link>

            <Link
              href="/payment-methods"
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-[#1a7f8a]/30 hover:bg-[#1a7f8a]/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-[#1a7f8a]/10 flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="5" width="20" height="14" rx="2" stroke="#1a7f8a" strokeWidth="2" />
                  <path d="M2 10h20" stroke="#1a7f8a" strokeWidth="2" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-[#1a7f8a] transition-colors">
                Manage Payment Options
              </span>
            </Link>

            <Link
              href="/purchase-history"
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-[#1a7f8a]/30 hover:bg-[#1a7f8a]/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-[#1a7f8a]/10 flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#1a7f8a" strokeWidth="2" />
                  <circle cx="12" cy="12" r="3" stroke="#1a7f8a" strokeWidth="2" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-[#1a7f8a] transition-colors">
                View Purchases
              </span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v4l3 3" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="9" stroke="#6b7280" strokeWidth="2" />
              </svg>
              <h2 className="text-base font-bold text-gray-900">Recent Activity</h2>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_auto_auto_auto] gap-3 px-2 pb-2 border-b border-gray-100">
            {["Activity", "Timestamp", "Status", "Amount"].map((col) => (
              <p
                key={col}
                className={`text-xs font-semibold text-gray-400 uppercase tracking-wider last:text-right ${col === "Timestamp" ? "hidden sm:block" : ""}`}
              >
                {col}
              </p>
            ))}
          </div>

          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="py-10 flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 text-[#1a7f8a]" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            ) : !stats?.recentActivity.length ? (
              <div className="py-10 text-center text-sm text-gray-400">No recent activity yet.</div>
            ) : (
              stats.recentActivity.map((row, i) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_auto_auto_auto] gap-3 items-center py-3 px-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${ACTIVITY_COLORS[i % ACTIVITY_COLORS.length]}`}>
                      {row.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{row.name}</p>
                      <p className="text-xs text-gray-400">{row.shortId}</p>
                    </div>
                  </div>

                  <p className="hidden sm:block text-xs text-gray-500 whitespace-nowrap">{row.time}</p>

                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md whitespace-nowrap ${statusStyles[row.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {row.status}
                  </span>

                  <p className="text-sm font-semibold text-gray-800 text-right whitespace-nowrap">{row.amount}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
