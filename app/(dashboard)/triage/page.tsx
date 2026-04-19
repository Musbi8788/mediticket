"use client";

import { useCallback, useEffect, useState } from "react";

type Severity = "CRITICAL" | "MODERATE" | "MILD";
type Status = "PENDING" | "IN_REVIEW" | "APPROVED" | "REFERRED";
type ChatMsg = { role: "user" | "assistant"; content: string };

interface Consultation {
  id: string;
  patientName: string;
  patientAge: number;
  symptoms: string;
  chatHistory: ChatMsg[];
  aiSummary: string | null;
  aiRecommendation: string | null;
  severity: Severity;
  status: Status;
  createdAt: string;
}

const SEVERITY_CONFIG: Record<Severity, { label: string; dot: string; badge: string; ring: string }> = {
  CRITICAL: { label: "Critical", dot: "bg-red-500", badge: "bg-red-50 text-red-600 border border-red-100", ring: "border-l-4 border-red-400" },
  MODERATE: { label: "Moderate", dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border border-amber-100", ring: "border-l-4 border-amber-400" },
  MILD: { label: "Mild", dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border border-emerald-100", ring: "border-l-4 border-emerald-400" },
};

const STATUS_BADGE: Record<Status, string> = {
  PENDING: "bg-gray-100 text-gray-500",
  IN_REVIEW: "bg-blue-50 text-blue-600",
  APPROVED: "bg-emerald-50 text-emerald-700",
  REFERRED: "bg-purple-50 text-purple-600",
};

const STATUS_LABEL: Record<Status, string> = {
  PENDING: "Waiting",
  IN_REVIEW: "In Review",
  APPROVED: "Approved",
  REFERRED: "Referred",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function TriagePage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Consultation | null>(null);
  const [filter, setFilter] = useState<"all" | Severity>("all");
  const [activeTab, setActiveTab] = useState<"chat" | "summary">("summary");
  const [updating, setUpdating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/triage");
      if (res.ok) {
        const data = await res.json();
        const list: Consultation[] = data.consultations ?? [];
        setConsultations(list);
        setSelected((prev) => {
          if (!prev) return list[0] ?? null;
          return list.find((c) => c.id === prev.id) ?? list[0] ?? null;
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function updateStatus(id: string, status: Status) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/triage/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setConsultations((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
        setSelected((prev) => (prev?.id === id ? { ...prev, status } : prev));
      }
    } finally {
      setUpdating(false);
    }
  }

  const filtered = filter === "all" ? consultations : consultations.filter((c) => c.severity === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin h-8 w-8 text-[#1a7f8a]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] text-[#1a7f8a] uppercase mb-1">Clinical · AI-Assisted</p>
        <h1 className="text-4xl font-extrabold text-gray-900">Patient Triage</h1>
      </div>

      {consultations.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1a7f8a]/10 flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a7f8a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="text-gray-900 font-bold text-lg mb-1">No patient consultations yet</p>
          <p className="text-gray-400 text-sm max-w-xs">When patients complete pre-consultation on the booking page, they will appear here.</p>
        </div>
      ) : (
        <div className="flex gap-5 min-h-0 flex-1" style={{ height: "calc(100vh - 220px)" }}>
          {/* Left: patient queue */}
          <div className="w-80 flex-shrink-0 bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden">
            <div className="px-4 pt-5 pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-900">Queue Today</h2>
                <span className="text-xs font-semibold bg-[#1a7f8a]/10 text-[#1a7f8a] rounded-full px-2 py-0.5">
                  {consultations.length} patient{consultations.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex gap-1">
                {(["all", "CRITICAL", "MODERATE", "MILD"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`flex-1 text-[10px] font-bold py-1 rounded-lg capitalize transition-colors ${
                      filter === f ? "bg-[#1a7f8a] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {f === "all" ? "all" : SEVERITY_CONFIG[f].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <p className="text-center text-gray-400 text-xs py-8">No patients with this severity.</p>
              ) : (
                filtered.map((c) => {
                  const s = SEVERITY_CONFIG[c.severity];
                  const isActive = selected?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { setSelected(c); setActiveTab("summary"); }}
                      className={`w-full text-left px-4 py-3.5 ${s.ring} transition-colors ${isActive ? "bg-[#1a7f8a]/5" : "hover:bg-gray-50"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{c.patientName}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{c.patientAge}y · {timeAgo(c.createdAt)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.badge}`}>{s.label}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${STATUS_BADGE[c.status]}`}>{STATUS_LABEL[c.status]}</span>
                        </div>
                      </div>
                      {c.aiSummary && (
                        <p className="text-[11px] text-gray-500 font-medium mt-1.5 line-clamp-2">{c.aiSummary}</p>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: patient detail */}
          {selected && (
            <div className="flex-1 min-w-0 flex flex-col gap-4 overflow-y-auto">
              {/* Header card */}
              <div className="bg-white rounded-2xl shadow-sm px-6 py-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#1a7f8a]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-[#1a7f8a]">
                        {selected.patientName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-extrabold text-gray-900">{selected.patientName}</h2>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${SEVERITY_CONFIG[selected.severity].badge}`}>
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ${SEVERITY_CONFIG[selected.severity].dot} mr-1.5`} />
                          {SEVERITY_CONFIG[selected.severity].label} Priority
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${STATUS_BADGE[selected.status]}`}>
                          {STATUS_LABEL[selected.status]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {selected.patientAge} years old · Submitted {timeAgo(selected.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    {selected.status === "PENDING" && (
                      <button
                        type="button"
                        onClick={() => updateStatus(selected.id, "IN_REVIEW")}
                        disabled={updating}
                        className="flex items-center gap-1.5 px-4 h-9 rounded-xl text-sm font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50 transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" /></svg>
                        Start Review
                      </button>
                    )}
                    {selected.status !== "APPROVED" && selected.status !== "REFERRED" && (
                      <>
                        <button
                          type="button"
                          onClick={() => updateStatus(selected.id, "APPROVED")}
                          disabled={updating}
                          className="flex items-center gap-1.5 px-4 h-9 rounded-xl text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          Approve AI Rec.
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(selected.id, "REFERRED")}
                          disabled={updating}
                          className="flex items-center gap-1.5 px-4 h-9 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          Refer
                        </button>
                      </>
                    )}
                    {(selected.status === "APPROVED" || selected.status === "REFERRED") && (
                      <div className="flex items-center gap-1.5 px-4 h-9 rounded-xl text-sm font-semibold bg-gray-50 text-gray-400 border border-gray-100">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                        Case {STATUS_LABEL[selected.status]}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_280px] gap-4 flex-1 min-h-0">
                {/* Centre: AI summary + chat */}
                <div className="flex flex-col gap-4 min-h-0">
                  {/* AI Assessment */}
                  <div className="bg-white rounded-2xl shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-[#1a7f8a]/10 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#1a7f8a]">
                          <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" stroke="currentColor" strokeWidth="2" />
                          <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                      <p className="text-xs font-bold text-[#1a7f8a] uppercase tracking-wider">AI Assessment</p>
                    </div>

                    {selected.aiSummary ? (
                      <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl px-4 py-3 mb-3">
                        {selected.aiSummary}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 italic mb-3">No AI summary available.</p>
                    )}

                    {selected.aiRecommendation && (
                      <div className="bg-[#1a7f8a]/5 border border-[#1a7f8a]/20 rounded-xl px-4 py-3">
                        <p className="text-[11px] font-bold text-[#1a7f8a] uppercase tracking-wider mb-1">AI Recommendation</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{selected.aiRecommendation}</p>
                      </div>
                    )}

                    {selected.symptoms && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {selected.symptoms.split(";").map((s) => s.trim()).filter(Boolean).map((s) => (
                          <span key={s} className="text-xs font-medium bg-[#1a7f8a]/8 text-[#1a7f8a] px-2.5 py-1 rounded-full">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Chat transcript */}
                  <div className="bg-white rounded-2xl shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
                    <div className="flex border-b border-gray-100 px-5 pt-4">
                      {(["summary", "chat"] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveTab(tab)}
                          className={`capitalize text-sm font-semibold pb-3 mr-6 border-b-2 transition-colors ${
                            activeTab === tab ? "border-[#1a7f8a] text-[#1a7f8a]" : "border-transparent text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          {tab === "summary" ? "Patient Info" : "AI Chat Transcript"}
                        </button>
                      ))}
                    </div>

                    {activeTab === "chat" ? (
                      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                        {selected.chatHistory.length === 0 ? (
                          <p className="text-gray-400 text-sm text-center py-8">No chat history.</p>
                        ) : (
                          selected.chatHistory.map((msg, i) => (
                            <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                                msg.role === "assistant" ? "bg-[#1a7f8a]/10 text-[#1a7f8a]" : "bg-gray-200 text-gray-600"
                              }`}>
                                {msg.role === "assistant" ? "AI" : selected.patientName[0]}
                              </div>
                              <div className={`max-w-[75%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                                <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                  msg.role === "assistant" ? "bg-[#1a7f8a]/8 text-gray-700 rounded-tl-sm" : "bg-gray-100 text-gray-700 rounded-tr-sm"
                                }`}>
                                  {msg.content}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                        {[
                          { label: "Full Name", value: selected.patientName },
                          { label: "Age", value: `${selected.patientAge} years` },
                          { label: "Submitted", value: new Date(selected.createdAt).toLocaleString() },
                          { label: "Severity", value: SEVERITY_CONFIG[selected.severity].label },
                          { label: "Status", value: STATUS_LABEL[selected.status] },
                        ].map((row) => (
                          <div key={row.label} className="flex justify-between items-center text-sm py-2 border-b border-gray-50 last:border-0">
                            <span className="text-gray-400">{row.label}</span>
                            <span className="font-semibold text-gray-800">{row.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Far right: queue stats */}
                <div className="flex flex-col gap-4">
                  <div className="bg-white rounded-2xl shadow-sm p-5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Queue Summary</p>
                    {(["CRITICAL", "MODERATE", "MILD"] as Severity[]).map((s) => {
                      const count = consultations.filter((c) => c.severity === s).length;
                      const cfg = SEVERITY_CONFIG[s];
                      return (
                        <div key={s} className="flex items-center gap-2 mb-2">
                          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                          <span className="text-sm text-gray-500 flex-1">{cfg.label}</span>
                          <span className="text-sm font-bold text-gray-800">{count}</span>
                        </div>
                      );
                    })}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
                      <span className="text-gray-400">Approved today</span>
                      <span className="font-bold text-emerald-600">{consultations.filter((c) => c.status === "APPROVED").length}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-400">Pending review</span>
                      <span className="font-bold text-gray-700">{consultations.filter((c) => c.status === "PENDING").length}</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-blue-500">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-gray-900">In-Person Check</p>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4">
                      Call the patient in for a physical examination before finalizing the AI recommendation.
                    </p>
                    <button type="button" className="w-full h-10 rounded-xl bg-blue-500 text-white text-sm font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.08-.9a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Call Patient In
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
