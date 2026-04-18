"use client";

import { useState, useEffect, useCallback } from "react";

interface Purchase {
  id: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string | null;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  transactionRef: string | null;
  ticketType: string;
  paymentMethod: "WAVE" | "QMONEY" | "APS" | "AFRIMONEY" | "YONNA";
  purchasedAt: string;
}

interface Stats {
  totalIncome: number;
  ticketsIssued: number;
  pendingCount: number;
  avgTicketValue: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const DATE_RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "all", label: "All Time" },
];

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
  REFUNDED: "bg-gray-100 text-gray-600 border-gray-200",
};

const METHOD_COLORS: Record<string, string> = {
  WAVE: "bg-orange-50 text-orange-700 border-orange-200",
  QMONEY: "bg-blue-50 text-blue-700 border-blue-200",
  APS: "bg-purple-50 text-purple-700 border-purple-200",
  AFRIMONEY: "bg-teal-50 text-teal-700 border-teal-200",
  YONNA: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

const METHOD_LABELS: Record<string, string> = {
  WAVE: "Wave",
  QMONEY: "QMoney",
  APS: "APS",
  AFRIMONEY: "Afrimoney",
  YONNA: "Yonna",
};

const TICKET_BADGE_COLORS = [
  "bg-teal-50 text-teal-700 border-teal-200",
  "bg-blue-50 text-blue-700 border-blue-200",
  "bg-violet-50 text-violet-700 border-violet-200",
  "bg-rose-50 text-rose-700 border-rose-200",
  "bg-amber-50 text-amber-700 border-amber-200",
  "bg-emerald-50 text-emerald-700 border-emerald-200",
];

function ticketBadgeColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return TICKET_BADGE_COLORS[Math.abs(hash) % TICKET_BADGE_COLORS.length];
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatGMD(amount: number) {
  return `D ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function shortRef(id: string, ref: string | null) {
  return ref ? `#${ref.slice(-6).toUpperCase()}` : `#${id.slice(-5).toUpperCase()}`;
}

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-[#1a7f8a]" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function PurchaseHistoryPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);

  const [dateRange, setDateRange] = useState("30d");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchPurchases = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "10",
          dateRange,
          ...(statusFilter ? { status: statusFilter } : {}),
          ...(search ? { search } : {}),
        });
        const res = await fetch(`/api/purchases?${params}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setPurchases(data.purchases);
        setStats(data.stats);
        setPagination(data.pagination);
      } catch {
        // silently fail — empty state shown
      } finally {
        setLoading(false);
      }
    },
    [dateRange, statusFilter, search]
  );

  useEffect(() => {
    fetchPurchases(1);
  }, [fetchPurchases]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
  }

  function exportCSV() {
    if (!purchases.length) return;
    const headers = ["Date", "Time", "Ticket Type", "Patient", "Reference", "Amount (GMD)", "Method", "Status"];
    const rows = purchases.map((p) => [
      formatDate(p.purchasedAt),
      formatTime(p.purchasedAt),
      p.ticketType,
      p.buyerName,
      shortRef(p.id, p.transactionRef),
      p.amount.toFixed(2),
      METHOD_LABELS[p.paymentMethod],
      p.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `purchase-history-${dateRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const dateRangeLabel = DATE_RANGE_OPTIONS.find((o) => o.value === dateRange)?.label ?? "Last 30 Days";

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page heading */}
      <div className="mb-7">
        <p className="text-[11px] font-bold tracking-[0.18em] text-[#1a7f8a] uppercase mb-1">
          Loyalty Program
        </p>
        <h1 className="text-3xl font-extrabold text-gray-900">Purchase History</h1>
        <p className="text-sm text-gray-500 mt-1">
          Detailed audit trail of all medical service tickets issued through the portal.
        </p>
      </div>

      {/* ── Stats row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Income",
            value: stats ? formatGMD(stats.totalIncome) : "—",
            sub: `In selected period`,
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a7f8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            ),
          },
          {
            label: "Tickets Issued",
            value: stats ? stats.ticketsIssued.toLocaleString() : "—",
            sub: "Total purchases",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a7f8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 9a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9z" /><circle cx="7" cy="12" r="1.5" fill="#1a7f8a" /><circle cx="17" cy="12" r="1.5" fill="#1a7f8a" /><path d="M10 12h4" />
              </svg>
            ),
          },
          {
            label: "Pending Calls",
            value: stats ? stats.pendingCount.toString() : "—",
            sub: "Awaiting verification",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a7f8a" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
            ),
          },
          {
            label: "Avg. Ticket Value",
            value: stats ? formatGMD(stats.avgTicketValue) : "—",
            sub: "Statistical data value",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a7f8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            ),
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#1a7f8a]/10 flex items-center justify-center flex-shrink-0">
                {stat.icon}
              </div>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 leading-tight mb-0.5 tabular-nums">
              {loading && !stats ? <span className="animate-pulse bg-gray-200 rounded w-20 h-6 inline-block" /> : stat.value}
            </p>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Main table card ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-gray-100">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div className="relative flex-1 max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search patient, ref, type…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-gray-100 rounded-xl pl-8 pr-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#1a7f8a]/20"
              />
            </div>
          </form>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Date range */}
            <div className="relative">
              <select
              title="Date range"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none bg-gray-100 rounded-xl pl-3 pr-8 py-2 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#1a7f8a]/20 cursor-pointer"
              >
                {DATE_RANGE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>

            {/* Filters toggle */}
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium border transition-colors ${showFilters ? "bg-[#1a7f8a]/10 border-[#1a7f8a]/30 text-[#1a7f8a]" : "bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200"}`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filters
            </button>

            {/* Export */}
            <button
              type="button"
              onClick={exportCSV}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 px-6 py-3 bg-gray-50/60 border-b border-gray-100">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Status</label>
              <div className="flex gap-2 flex-wrap">
                {["", "COMPLETED", "PENDING", "FAILED", "REFUNDED"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                      statusFilter === s
                        ? "bg-[#1a7f8a] text-white border-[#1a7f8a]"
                        : "bg-white text-gray-600 border-gray-200 hover:border-[#1a7f8a]/40"
                    }`}
                  >
                    {s || "All"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Table header */}
        <div className="hidden md:grid grid-cols-[1.2fr_1.3fr_1.4fr_1fr_1fr_80px] gap-4 px-6 py-3 bg-gray-50/50 border-b border-gray-100">
          {["Transaction Date", "Ticket Type", "Patient / Reference", "Amount", "Method", "Actions"].map((h) => (
            <p key={h} className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">{h}</p>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-400">
              <Spinner />
              <p className="text-sm">Loading purchases…</p>
            </div>
          ) : purchases.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 9a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9z" /><circle cx="7" cy="12" r="1.5" fill="#d1d5db" /><circle cx="17" cy="12" r="1.5" fill="#d1d5db" /><path d="M10 12h4" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-600">No purchases found</p>
              <p className="text-xs text-gray-400">Try adjusting your filters or date range.</p>
            </div>
          ) : (
            purchases.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-1 md:grid-cols-[1.2fr_1.3fr_1.4fr_1fr_1fr_80px] gap-4 items-center px-6 py-4 hover:bg-gray-50/60 transition-colors"
              >
                {/* Date */}
                <div>
                  <p className="text-sm font-semibold text-gray-800">{formatDate(p.purchasedAt)}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{formatTime(p.purchasedAt)}</p>
                </div>

                {/* Ticket type */}
                <div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${ticketBadgeColor(p.ticketType)}`}>
                    {p.ticketType}
                  </span>
                </div>

                {/* Patient */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#1a7f8a]/10 flex items-center justify-center flex-shrink-0 text-[#1a7f8a] font-bold text-[11px]">
                    {p.buyerName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{p.buyerName}</p>
                    <p className="text-[11px] text-gray-400 font-mono">{shortRef(p.id, p.transactionRef)}</p>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <p className="text-sm font-bold text-gray-900">{formatGMD(p.amount)}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border mt-0.5 ${STATUS_COLORS[p.status]}`}>
                    {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                  </span>
                </div>

                {/* Method */}
                <div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${METHOD_COLORS[p.paymentMethod]}`}>
                    {METHOD_LABELS[p.paymentMethod]}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="View details"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1a7f8a] hover:bg-[#1a7f8a]/10 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    title="Download receipt"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1a7f8a] hover:bg-[#1a7f8a]/10 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Pagination */}
        {pagination.total > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
            <p className="text-xs text-gray-500">
              Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total.toLocaleString()} results
            </p>
            <div className="flex items-center gap-1">
              <button
              title="Previous page"
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => fetchPurchases(pagination.page - 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let p: number;
                if (pagination.pages <= 5) p = i + 1;
                else if (pagination.page <= 3) p = i + 1;
                else if (pagination.page >= pagination.pages - 2) p = pagination.pages - 4 + i;
                else p = pagination.page - 2 + i;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => fetchPurchases(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                      p === pagination.page
                        ? "bg-[#1a7f8a] text-white"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchPurchases(pagination.page + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Audit Assistance CTA ─────────────────────────────────────── */}
      <div className="mt-6 rounded-2xl overflow-hidden bg-gradient-to-r from-[#0e6b72] to-[#1a9ea8] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-white">
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-white/60 mb-2">
            The MediTicket Advantage
          </p>
          <h3 className="text-xl font-extrabold mb-2">Audit Assistance Needed?</h3>
          <p className="text-sm text-white/80 leading-relaxed max-w-md">
            If you require a certified ledger for tax reconciliation or hospital
            reporting purposes, our finance team can generate a sealed document
            within 24 hours.
          </p>
          <button
            type="button"
            className="mt-5 inline-flex items-center gap-2 bg-white text-[#0e6b72] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors shadow-md"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" />
            </svg>
            Request Certified Audit
          </button>
        </div>
        {/* Decorative visual */}
        <div className="flex-shrink-0 w-48 h-32 bg-white/10 rounded-2xl flex items-center justify-center">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1" opacity="0.4">
            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
          </svg>
        </div>
      </div>
    </div>
  );
}
