"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface TicketType {
  id: string;
  name: string;
  description: string | null;
  price: string | number;
}

const TICKET_ICONS = [
  // asterisk
  <svg key="a" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
  // stethoscope-like
  <svg key="b" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h6m-6 0a2 2 0 0 1 2 2v4a4 4 0 0 0 8 0v-1a2 2 0 0 1 2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="17" cy="17" r="3" stroke="currentColor" strokeWidth="2" /></svg>,
  // flask
  <svg key="c" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 3h6m-5 0v6l-4.5 9A1 1 0 0 0 6.4 20h11.2a1 1 0 0 0 .9-1.45L14 9V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  // pill
  <svg key="d" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m10.5 20.5-7-7a5 5 0 1 1 7-7l7 7a5 5 0 1 1-7 7zM8.5 8.5l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>,
];

const BG_COLORS = [
  "bg-blue-100 text-blue-600",
  "bg-teal-100 text-teal-600",
  "bg-indigo-100 text-indigo-600",
  "bg-purple-100 text-purple-600",
  "bg-emerald-100 text-emerald-600",
  "bg-sky-100 text-sky-600",
];

function TicketIcon({ index }: { index: number }) {
  const colorClass = BG_COLORS[index % BG_COLORS.length];
  const icon = TICKET_ICONS[index % TICKET_ICONS.length];
  return (
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
      {icon}
    </div>
  );
}

function formatPrice(price: string | number) {
  return `D ${Number(price).toFixed(2)}`;
}

export default function TicketTypesPage() {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const formRef = useRef<HTMLDivElement>(null);

  const fetchTicketTypes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ticket-types");
      if (!res.ok) throw new Error("Failed to load ticket types");
      const data = await res.json();
      setTicketTypes(data);
    } catch {
      setError("Could not load ticket types.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTicketTypes(); }, [fetchTicketTypes]);

  function resetForm() {
    setEditingId(null);
    setName("");
    setPrice("");
    setDescription("");
    setError(null);
  }

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function startEdit(t: TicketType) {
    setEditingId(t.id);
    setName(t.name);
    setPrice(String(Number(t.price).toFixed(2)));
    setDescription(t.description ?? "");
    setError(null);
    setSuccess(null);
    scrollToForm();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) { setError("Ticket name is required."); return; }
    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      setError("Enter a valid price.");
      return;
    }

    setSubmitting(true);
    try {
      const url = editingId ? `/api/ticket-types/${editingId}` : "/api/ticket-types";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price, description }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Something went wrong");
      }

      const saved: TicketType = await res.json();

      if (editingId) {
        setTicketTypes((prev) => prev.map((t) => (t.id === editingId ? saved : t)));
        setSuccess("Ticket type updated successfully.");
      } else {
        setTicketTypes((prev) => [...prev, saved]);
        setSuccess("Ticket type created successfully.");
      }
      resetForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this ticket type? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/ticket-types/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setTicketTypes((prev) => prev.filter((t) => t.id !== id));
      if (editingId === id) resetForm();
    } catch {
      setError("Could not delete ticket type.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page heading */}
      <div className="mb-5 md:mb-7">
        <p className="text-xs font-semibold tracking-wider lg:tracking-[0.18em] text-[#1a7f8a] uppercase mb-1">
          Administration · Management
        </p>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900">Ticket Type Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* ── Left: ticket list ─────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="flex items-start justify-between px-4 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Configured Ticket Types</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Review and manage current billing categories</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile: "+ Add" shortcut */}
              <button
                type="button"
                onClick={scrollToForm}
                className="lg:hidden flex items-center gap-1 px-3 h-8 rounded-lg bg-[#1a7f8a] text-white text-xs font-bold transition-colors hover:bg-[#156870]"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                Add
              </button>
              <button type="button" title="Filter" className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button type="button" title="Export" className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Table head — desktop only */}
          <div className="hidden lg:grid grid-cols-[2fr_3fr_1.2fr_80px] gap-4 px-6 py-3 bg-gray-50/60">
            {["Ticket Name", "Description", "Price", "Actions"].map((h) => (
              <p key={h} className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                {h}
              </p>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
                <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#1a7f8a" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <p className="text-sm">Loading ticket types…</p>
              </div>
            ) : ticketTypes.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 9a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9z" stroke="#d1d5db" strokeWidth="2" />
                  <circle cx="7" cy="12" r="1.5" fill="#d1d5db" />
                  <circle cx="17" cy="12" r="1.5" fill="#d1d5db" />
                  <path d="M10 12h4" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <p className="text-sm font-medium">No ticket types yet</p>
                <p className="text-xs">
                  Use the form{" "}
                  <span className="lg:hidden">below</span>
                  <span className="hidden lg:inline">on the right</span>
                  {" "}to add one.
                </p>
              </div>
            ) : (
              ticketTypes.map((t, i) => (
                <div key={t.id} className={editingId === t.id ? "bg-[#1a7f8a]/5" : ""}>
                  {/* Mobile card */}
                  <div className="lg:hidden px-4 py-3.5 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <TicketIcon index={i} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{t.name}</p>
                        <p className="text-sm font-bold text-[#1a7f8a]">{formatPrice(t.price)}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => startEdit(t)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1a7f8a] hover:bg-[#1a7f8a]/10 transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          onClick={() => handleDelete(t.id)}
                          disabled={deleting === t.id}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {t.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1.5 pl-12">{t.description}</p>
                    )}
                  </div>

                  {/* Desktop row */}
                  <div className="hidden lg:grid grid-cols-[2fr_3fr_1.2fr_80px] gap-4 items-center px-6 py-4 hover:bg-gray-50/50 transition-colors">
                    {/* Name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <TicketIcon index={i} />
                      <span className="text-sm font-semibold text-gray-800 truncate">{t.name}</span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-500 line-clamp-2">{t.description ?? "—"}</p>

                    {/* Price */}
                    <p className="text-sm font-bold text-[#1a7f8a]">{formatPrice(t.price)}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Edit"
                        onClick={() => startEdit(t)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#1a7f8a] hover:bg-[#1a7f8a]/10 transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        onClick={() => handleDelete(t.id)}
                        disabled={deleting === t.id}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Right: create / edit form ──────────────────────── */}
        <div ref={formRef} className="flex flex-col gap-4 lg:sticky lg:top-4">
          <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
            {/* Panel header */}
            <div className="flex items-start gap-3 mb-5 sm:mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#1a7f8a]/10 flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 9a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9z" stroke="#1a7f8a" strokeWidth="2" />
                  <path d="M12 5V19M5 12H19" stroke="#1a7f8a" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {editingId ? "Edit Ticket Type" : "New Ticket Category"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {editingId ? "Update the ticket details below" : "Add a new billing service type"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Feedback */}
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 font-medium">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700 font-medium">
                  {success}
                </div>
              )}

              {/* Ticket name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                  Ticket Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Specialty Surgery"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#1a7f8a]/30 transition-all"
                />
              </div>

              {/* Price */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                  Price (GMD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 select-none pointer-events-none">D</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-gray-100 rounded-xl pl-7 pr-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#1a7f8a]/30 transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                  Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the scope of this medical service..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl bg-gray-100 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 resize-none outline-none focus:ring-2 focus:ring-[#1a7f8a]/30 transition-all"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-[#1a7f8a] text-white font-bold rounded-xl h-12 text-sm hover:bg-[#156870] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  ) : null}
                  {editingId ? "Update Ticket Type" : "Initialize Ticket Type"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full h-10 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Cancel edit
                  </button>
                )}
              </div>

              <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                By creating this category, you are authorizing it for use across all
                Sanctuary General departments.
              </p>
            </form>
          </div>

          {/* Billing Integrity notice */}
          <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[#1a7f8a]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p className="text-sm font-bold">Billing Integrity</p>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Ensuring accurate pricing reflects hospital resource allocation. Always
              cross-check with clinical guidelines before modifying high-intensity care prices.
            </p>
            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#1a7f8a] rounded-full w-[85%]" />
            </div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Active System Load
            </p>
          </div>
        </div>
      </div>

      {/* Mobile FAB — scroll to form */}
      <button
        type="button"
        onClick={scrollToForm}
        aria-label="Add ticket type"
        className="lg:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-[#1a7f8a] text-white shadow-lg flex items-center justify-center hover:bg-[#156870] transition-colors active:scale-95"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
