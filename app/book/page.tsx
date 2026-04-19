"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type PaymentMethod = { id: string; type: string; accountNumber: string; accountName: string };
type TicketType = { id: string; name: string; description: string | null; price: number };
type Hospital = {
  id: string;
  name: string;
  address: string;
  phone: string;
  ticketTypes: TicketType[];
  paymentMethods: PaymentMethod[];
};
type ChatMsg = { role: "user" | "assistant"; content: string };
type Stage = "select-hospital" | "collect-name" | "collect-age" | "symptom-chat" | "complete";
type BookingModal = { hospital: Hospital; ticket: TicketType };

export default function BookPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Chat state machine
  const [stage, setStage] = useState<Stage>("select-hospital");
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: "Welcome to MediTicket AI! Please select the hospital you would like to consult with:" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [consultationId, setConsultationId] = useState("");
  const [symptomCount, setSymptomCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Booking modal
  const [modal, setModal] = useState<BookingModal | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", paymentMethodId: "" });
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState<{ id: string } | null>(null);
  const [bookError, setBookError] = useState("");

  useEffect(() => {
    fetch("/api/public/hospitals")
      .then((r) => r.json())
      .then((d) => setHospitals(d.hospitals ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filtered = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.ticketTypes.some((t) => t.name.toLowerCase().includes(search.toLowerCase()))
  );

  function addMsg(role: "user" | "assistant", content: string) {
    setMessages((m) => [...m, { role, content }]);
  }

  function selectHospital(hospital: Hospital) {
    setSelectedHospital(hospital);
    addMsg("user", hospital.name);
    setStage("collect-name");
    setTimeout(() => addMsg("assistant", `Great choice! You've selected **${hospital.name}**.\n\nWhat is your full name?`), 300);
  }

  function handleNameSubmit() {
    const name = chatInput.trim();
    if (!name) return;
    setChatInput("");
    setPatientName(name);
    addMsg("user", name);
    setStage("collect-age");
    setTimeout(() => addMsg("assistant", `Thank you, ${name}. How old are you?`), 300);
  }

  function handleAgeSubmit() {
    const age = chatInput.trim();
    if (!age || isNaN(Number(age)) || Number(age) < 1 || Number(age) > 120) {
      addMsg("assistant", "Please enter a valid age (1–120).");
      setChatInput("");
      return;
    }
    setChatInput("");
    setPatientAge(age);
    addMsg("user", age);
    setStage("symptom-chat");
    setTimeout(
      () =>
        addMsg(
          "assistant",
          `Thank you. I'm here to help prepare a summary for your doctor at ${selectedHospital?.name}.\n\nPlease describe how you're feeling today — what symptoms or concerns brought you in?`
        ),
      300
    );
  }

  async function handleSymptomChat() {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    setChatInput("");
    setSymptomCount((c) => c + 1);
    const next: ChatMsg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setChatLoading(true);

    try {
      const res = await fetch("/api/public/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next,
          patientName,
          patientAge,
        }),
      });
      const data = await res.json();
      addMsg("assistant", data.reply ?? "Sorry, something went wrong. Please try again.");
    } catch {
      addMsg("assistant", "Network error. Please try again.");
    } finally {
      setChatLoading(false);
    }
  }

  async function sendToHospital() {
    if (!selectedHospital || !patientName || !patientAge) return;
    setChatLoading(true);

    // User messages: [0]=hospital name, [1]=patient name, [2]=age, [3+]=actual symptoms
    const allUserMessages = messages.filter((m) => m.role === "user");
    const symptoms = allUserMessages
      .slice(3)
      .map((m) => m.content)
      .join("; ");

    // Only send the symptom conversation to the hospital (skip the hospital/name/age setup)
    // Find the index where symptom chat begins (after the "Thank you" assistant message)
    const symptomStartIdx = messages.findIndex(
      (m) => m.role === "assistant" && m.content.includes("Please describe how you're feeling")
    );
    const clinicalHistory = symptomStartIdx >= 0 ? messages.slice(symptomStartIdx) : messages;

    try {
      const res = await fetch("/api/public/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName,
          patientAge: Number(patientAge),
          symptoms,
          chatHistory: clinicalHistory,
          organizationId: selectedHospital.id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setConsultationId(data.consultation.id);
        setStage("complete");
        addMsg(
          "assistant",
          `✓ Your pre-consultation has been sent to **${selectedHospital.name}**. A doctor will review your case before you arrive.\n\nYou can now book a ticket below so the hospital is ready for you.`
        );
      } else {
        addMsg("assistant", "Something went wrong saving your consultation. Please try again.");
      }
    } catch {
      addMsg("assistant", "Network error. Please try again.");
    } finally {
      setChatLoading(false);
    }
  }

  function handleSend() {
    if (stage === "collect-name") return handleNameSubmit();
    if (stage === "collect-age") return handleAgeSubmit();
    if (stage === "symptom-chat") return handleSymptomChat();
  }

  function openModal(hospital: Hospital, ticket: TicketType) {
    setModal({ hospital, ticket });
    setForm({
      name: patientName || "",
      phone: "",
      email: "",
      paymentMethodId: hospital.paymentMethods[0]?.id ?? "",
    });
    setBooked(null);
    setBookError("");
  }

  async function submitBooking() {
    if (!modal) return;
    if (!form.name || !form.phone) { setBookError("Name and phone are required."); return; }
    setBooking(true);
    setBookError("");
    try {
      const res = await fetch("/api/public/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName: form.name,
          buyerPhone: form.phone,
          buyerEmail: form.email || undefined,
          ticketTypeId: modal.ticket.id,
          paymentMethodId: form.paymentMethodId || undefined,
          aiSummary: consultationId ? `Consultation ID: ${consultationId}` : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) setBookError(data.error ?? "Booking failed.");
      else setBooked(data.booking);
    } catch { setBookError("Network error. Please try again."); }
    finally { setBooking(false); }
  }

  return (
    <div className="min-h-screen bg-[#f0f4f5] font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Image src="/logo.svg" alt="MediTicket" width={140} height={45} className="h-10 w-auto" />
          <Link href="/login" className="text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg px-4 py-2 hover:border-[#1a9ea8] hover:text-[#1a9ea8] transition-colors">
            Admin Login
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-[#1a9ea8] text-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-white/70 mb-2">Patient Portal</p>
          <h1 className="text-3xl font-extrabold mb-2">Book Your Hospital Ticket</h1>
          <p className="text-white/80 text-sm max-w-lg">
            Chat with our AI health assistant to describe your symptoms. Your doctor will receive a full summary before you arrive.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left — Hospitals & Tickets */}
          <div className="flex-1 min-w-0">
            <div className="relative mb-5">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search hospitals or services…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#1a9ea8] focus:ring-2 focus:ring-[#1a9ea8]/20"
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <svg className="animate-spin h-8 w-8 text-[#1a9ea8]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24 text-gray-400 text-sm">No hospitals or services found.</div>
            ) : (
              <div className="flex flex-col gap-5">
                {filtered.map((hospital) => (
                  <div key={hospital.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1a9ea8]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#1a9ea8] font-bold text-sm">{hospital.name.slice(0, 2).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{hospital.name}</p>
                        <p className="text-xs text-gray-400">{hospital.address}</p>
                      </div>
                    </div>
                    {hospital.ticketTypes.length === 0 ? (
                      <p className="px-5 py-4 text-sm text-gray-400">No services available.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
                        {hospital.ticketTypes.map((ticket) => (
                          <div key={ticket.id} className="border border-gray-100 rounded-xl p-4 flex flex-col gap-2 hover:border-[#1a9ea8]/40 hover:bg-[#f0f9fa] transition-colors">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-gray-900 text-sm">{ticket.name}</p>
                              <span className="text-[#1a9ea8] font-bold text-sm whitespace-nowrap">GMD {ticket.price.toLocaleString()}</span>
                            </div>
                            {ticket.description && <p className="text-xs text-gray-500 leading-relaxed">{ticket.description}</p>}
                            <button
                              type="button"
                              onClick={() => openModal(hospital, ticket)}
                              className="mt-1 w-full bg-[#1a9ea8] hover:bg-[#157f88] text-white text-xs font-semibold rounded-lg py-2 transition-colors"
                            >
                              Book Now
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right — AI Chatbot */}
          <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
            <div className="sticky top-20 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-110px)] max-h-[640px]">
              {/* Chat header */}
              <div className="bg-[#1a9ea8] px-4 py-3.5 flex items-center gap-3 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">MT</div>
                <div>
                  <p className="text-white text-sm font-bold">MediTicket AI</p>
                  <p className="text-white/60 text-[10px]">
                    {selectedHospital ? selectedHospital.name : "Pre-consultation assistant"}
                  </p>
                </div>
                <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </div>

              {/* Disclaimer */}
              <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 flex-shrink-0">
                <p className="text-[10px] text-amber-700">
                  This AI helps organise your symptoms for the doctor. It does <strong>not</strong> diagnose or prescribe.
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                      msg.role === "user"
                        ? "bg-[#1a9ea8]/10 text-[#0e6b72] rounded-tr-sm"
                        : "bg-gray-100 text-gray-700 rounded-tl-sm"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}

                {/* Hospital picker — shown during select-hospital stage */}
                {stage === "select-hospital" && !loading && (
                  <div className="flex flex-col gap-2">
                    {hospitals.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => selectHospital(h)}
                        className="text-left border border-gray-200 rounded-xl px-3 py-2.5 hover:border-[#1a9ea8] hover:bg-[#f0f9fa] transition-colors"
                      >
                        <p className="text-xs font-semibold text-gray-800">{h.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{h.address}</p>
                      </button>
                    ))}
                  </div>
                )}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2.5 flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Send to hospital button (shown after 3+ symptom exchanges) */}
              {stage === "symptom-chat" && symptomCount >= 3 && (
                <div className="px-4 pb-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={sendToHospital}
                    disabled={chatLoading}
                    className="w-full text-xs font-semibold text-white bg-[#1a9ea8] hover:bg-[#157f88] disabled:opacity-50 rounded-lg py-2.5 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Send summary to hospital
                  </button>
                </div>
              )}

              {stage === "complete" && consultationId && (
                <div className="px-4 pb-2 flex-shrink-0">
                  <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-[10px] text-green-700 font-medium text-center">
                    ✓ Sent to hospital — book a ticket to confirm your visit
                  </div>
                </div>
              )}

              {/* Input — hidden during hospital selection and after complete */}
              {stage !== "select-hospital" && stage !== "complete" && (
                <div className="px-4 pb-4 flex-shrink-0">
                  <div className="flex gap-2">
                    <input
                      type={stage === "collect-age" ? "number" : "text"}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder={
                        stage === "collect-name" ? "Your full name…"
                        : stage === "collect-age" ? "Your age…"
                        : "Describe your symptoms…"
                      }
                      disabled={chatLoading}
                      className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-xs text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#1a9ea8]/30 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      aria-label="Send message"
                      onClick={handleSend}
                      disabled={chatLoading || !chatInput.trim()}
                      className="w-9 h-9 rounded-full bg-[#1a9ea8] hover:bg-[#157f88] disabled:opacity-40 flex items-center justify-center transition-colors flex-shrink-0"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && !booked && setModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {booked ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Booking Confirmed!</h3>
                <p className="text-sm text-gray-500 mb-4">Show this reference at the front desk.</p>
                <div className="bg-gray-50 rounded-xl px-4 py-3 mb-6">
                  <p className="text-[11px] text-gray-400 mb-1">Booking Reference</p>
                  <p className="font-mono text-sm font-bold text-gray-900 break-all">{booked.id}</p>
                </div>
                {consultationId && <p className="text-xs text-[#1a9ea8] mb-5">✓ Your AI symptom summary has been sent to the hospital.</p>}
                <button type="button" onClick={() => setModal(null)} className="w-full bg-[#1a9ea8] hover:bg-[#157f88] text-white font-semibold rounded-xl py-3 text-sm transition-colors">Done</button>
              </div>
            ) : (
              <>
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Book Ticket</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{modal.ticket.name} · {modal.hospital.name}</p>
                  </div>
                  <button type="button" aria-label="Close" onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-5 flex flex-col gap-4">
                  <div className="bg-[#1a9ea8]/5 border border-[#1a9ea8]/20 rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-gray-600">Amount</span>
                    <span className="font-bold text-[#1a9ea8]">GMD {modal.ticket.price.toLocaleString()}</span>
                  </div>
                  {consultationId && (
                    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-xs text-green-700">
                      ✓ Your AI symptom summary will be attached to this booking.
                    </div>
                  )}
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">Full Name *</label>
                      <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Modou Jallow" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a9ea8] focus:ring-2 focus:ring-[#1a9ea8]/20" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">Phone Number *</label>
                      <input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="e.g. +220 7000000" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a9ea8] focus:ring-2 focus:ring-[#1a9ea8]/20" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">Email (optional)</label>
                      <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="your@email.com" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a9ea8] focus:ring-2 focus:ring-[#1a9ea8]/20" />
                    </div>
                    {modal.hospital.paymentMethods.length > 0 && (
                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">Payment Method</label>
                        <select aria-label="Payment Method" value={form.paymentMethodId} onChange={(e) => setForm((f) => ({ ...f, paymentMethodId: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a9ea8] focus:ring-2 focus:ring-[#1a9ea8]/20 bg-white">
                          <option value="">Select payment method</option>
                          {modal.hospital.paymentMethods.map((pm) => (
                            <option key={pm.id} value={pm.id}>{pm.type} — {pm.accountName} ({pm.accountNumber})</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  {bookError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{bookError}</p>}
                  <button type="button" onClick={submitBooking} disabled={booking} className="w-full bg-[#1a9ea8] hover:bg-[#157f88] disabled:opacity-60 text-white font-semibold rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2">
                    {booking ? (
                      <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Booking…</>
                    ) : "Confirm Booking"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
