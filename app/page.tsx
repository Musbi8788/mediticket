import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Image src="/logo.svg" alt="MediTicket" width={140} height={45} className="h-10 w-auto" />
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#" className="hover:text-[#1a9ea8] transition-colors">Home</a>
            <a href="#how-it-works" className="hover:text-[#1a9ea8] transition-colors">How It Works</a>
            <a href="#benefits" className="hover:text-[#1a9ea8] transition-colors">Benefits</a>
          </div>
          <Link
            href="/login"
            className="text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg px-4 py-2 hover:border-[#1a9ea8] hover:text-[#1a9ea8] transition-colors"
          >
            Admin Login
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <span className="inline-block text-[11px] font-bold tracking-[0.18em] text-[#1a9ea8] uppercase bg-[#1a9ea8]/10 border border-[#1a9ea8]/20 px-3 py-1.5 rounded-full mb-7">
            For Clinical Admin Staff
          </span>
          <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] mb-6">
            No more waiting in{" "}
            <span className="text-[#1a9ea8]">long hospital lines.</span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed mb-9 max-w-md">
            MediTicket lets you book your hospital ticket via WhatsApp or chat with our AI health assistant before your visit — so your doctor is already prepared when you arrive.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://wa.me/2207036433"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-[#1a9ea8] hover:bg-[#157f88] text-white font-semibold rounded-xl px-5 py-3 text-sm transition-colors shadow-md"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Book a Ticket on WhatsApp
            </a>
            <Link
              href="/book"
              className="inline-flex items-center gap-2.5 border border-gray-300 text-gray-700 hover:border-[#1a9ea8] hover:text-[#1a9ea8] font-semibold rounded-xl px-5 py-3 text-sm transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Chat with AI Assistant
            </Link>
          </div>
        </div>

        {/* Hero right — hospital card visual */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-sm">
            <div className="bg-gradient-to-br from-[#1a9ea8] via-[#22b8c4] to-[#8dd5db] rounded-3xl p-8 shadow-2xl">
              {/* Queue card */}
              <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#1a9ea8]/10 rounded-xl flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a9ea8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" />
                      <path d="M9 22V12H15V22" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Edward Francis Hospital</p>
                    <p className="text-sm font-bold text-gray-800">Queue #14</p>
                  </div>
                  <span className="ml-auto text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    Confirmed
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Estimated wait time</span>
                  <span className="font-semibold text-[#1a9ea8]">~12 min</span>
                </div>
                <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-[#1a9ea8] rounded-full h-1.5 w-[35%]" />
                </div>
              </div>

              {/* Report ready */}
              <div className="bg-white/20 rounded-2xl p-4 text-white">
                <p className="text-sm font-bold mb-1">✓ Pre-consultation ready</p>
                <p className="text-[11px] text-white/80 leading-relaxed">
                  Your doctor will review your symptom report before you arrive.
                </p>
              </div>
            </div>

            {/* Priority badge */}
            <div className="absolute -top-3 -right-3 bg-white rounded-2xl shadow-lg px-3 py-2 flex items-center gap-2 border border-gray-100">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-bold text-gray-700">Priority Access</span>
            </div>
          </div>
        </div>
      </section>

      {/* Two Ways We Help */}
      <section className="bg-gray-50/70 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[11px] font-bold tracking-[0.2em] text-[#1a9ea8] uppercase text-center mb-3">
            Our Services
          </p>
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
            Two Ways We Help You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-[#1a9ea8]/10 flex items-center justify-center mb-6">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-[#1a9ea8]">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">WhatsApp Booking</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">
                No need for complicated apps. Just send a message on WhatsApp to secure your slot instantly. Simple, fast, and familiar.
              </p>
              <a href="https://wa.me/2207036433" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a9ea8] hover:underline">
                Book Now on WhatsApp
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-[#1a9ea8]/10 flex items-center justify-center mb-6">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a9ea8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">AI Pre-Consultation — Free</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">
                Tell our AI assistant your symptoms before you arrive. It organizes your info for the doctor, making your visit twice as effective.
              </p>
              <Link href="/book" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a9ea8] hover:underline">
                Start AI Consultation
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[11px] font-bold tracking-[0.2em] text-[#1a9ea8] uppercase mb-3">
            Process
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14 gap-6">
            <h2 className="text-4xl font-extrabold text-gray-900 max-w-xs leading-tight">
              Your journey to better care
            </h2>
            <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
              We&apos;ve streamlined the entire hospital experience into three simple, stress-free steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: "01",
                title: "Book Your Ticket",
                desc: "Simply start a chat on WhatsApp. Choose your department and get your digital queue ticket in seconds.",
                bg: "bg-gray-800",
                visual: (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-green-400">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-white/70 text-xs">Ticket #14</p>
                      <p className="text-white font-bold text-sm">General OPD</p>
                    </div>
                  </div>
                ),
              },
              {
                num: "02",
                title: "Chat With AI",
                desc: "Explain your concerns to our AI assistant. It securely prepares a summary for your clinical team.",
                bg: "bg-[#1a9ea8]",
                visual: (
                  <div className="flex flex-col gap-2 w-full max-w-[160px] mx-auto">
                    <div className="bg-white/20 rounded-xl rounded-tl-sm px-3 py-2 text-[10px] text-white">
                      How are you feeling today?
                    </div>
                    <div className="bg-white rounded-xl rounded-tr-sm px-3 py-2 text-[10px] text-[#1a9ea8] self-end">
                      I have a fever.
                    </div>
                    <div className="bg-white/20 rounded-xl rounded-tl-sm px-3 py-2 text-[10px] text-white">
                      Got it, noting your symptoms…
                    </div>
                  </div>
                ),
              },
              {
                num: "03",
                title: "Walk In Ready",
                desc: "Show your ticket at the front desk. Your doctor already knows your concern. Save time, feel cared for.",
                bg: "bg-gray-100",
                visual: (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 text-[10px] text-green-700 font-semibold">
                      ✓ Ready for Consultation
                    </div>
                  </div>
                ),
              },
            ].map((step) => (
              <div key={step.num} className="flex flex-col gap-4">
                <span className="text-7xl font-black text-gray-100 leading-none select-none">{step.num}</span>
                <h3 className="text-base font-bold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                <div className={`mt-2 w-full h-44 rounded-2xl ${step.bg} flex items-center justify-center p-5`}>
                  {step.visual}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why MediTicket — teal bg */}
      <section id="benefits" className="py-20 bg-[#0e6b72]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left */}
          <div>
            <p className="text-[11px] font-bold tracking-[0.2em] text-[#7ecbd0] uppercase mb-3">
              The MediTicket Advantage
            </p>
            <h2 className="text-4xl font-extrabold text-white mb-10">Why MediTicket?</h2>
            <div className="flex flex-col gap-8">
              {[
                {
                  title: "Save Time",
                  desc: "No standing in line. Book your ticket from anywhere via WhatsApp in seconds.",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                    </svg>
                  ),
                },
                {
                  title: "Better Doctor Visits",
                  desc: "Your doctor sees your symptoms report before you walk in. Consultation starts immediately.",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
                    </svg>
                  ),
                },
                {
                  title: "Built for The Gambia",
                  desc: "Designed for Gambian hospitals and patients. SMS confirmations. Works on any phone.",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                  ),
                },
                {
                  title: "AI That Assists, Not Replaces",
                  desc: "Our AI helps you describe your condition clearly — your doctor still makes every decision.",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white mb-1">{item.title}</p>
                    <p className="text-sm text-[#9dd8dc] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Chat mockup */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[300px] bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="bg-[#1a9ea8] px-5 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                  MT
                </div>
                <div>
                  <p className="text-white text-sm font-bold">MediTicket Bot</p>
                  <p className="text-white/60 text-[10px]">AI Health Assistant · Online</p>
                </div>
                <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              </div>

              <div className="px-4 py-4 flex flex-col gap-3">
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[85%]">
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Hello! Welcome to Edward Francis Small Teaching Hospital. How are you feeling today?
                  </p>
                </div>
                <div className="bg-[#1a9ea8]/10 rounded-2xl rounded-tr-sm px-3 py-2.5 max-w-[85%] self-end">
                  <p className="text-xs text-[#0e6b72] leading-relaxed">
                    I&apos;ve had a persistent fever since yesterday.
                  </p>
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[85%]">
                  <p className="text-xs text-gray-700 leading-relaxed">
                    I&apos;m sorry to hear that. I&apos;ll help you book a ticket for Internal Medicine. Should I also note your symptoms for the doctor?
                  </p>
                </div>
                <div className="bg-[#1a9ea8]/10 rounded-2xl rounded-tr-sm px-3 py-2.5 max-w-[85%] self-end">
                  <p className="text-xs text-[#0e6b72]">Yes, please!</p>
                </div>
                <div className="bg-[#1a9ea8]/5 border border-[#1a9ea8]/20 rounded-xl px-3 py-2.5 text-[10px] text-[#0e6b72] font-medium">
                  ✓ Report ready — your doctor will review this before you arrive.
                </div>
              </div>

              <div className="px-4 pb-4">
                <div className="bg-gray-100 rounded-full px-3 py-2.5 flex items-center gap-2">
                  <span className="text-xs text-gray-400 flex-1">Type a message…</span>
                  <div className="w-6 h-6 rounded-full bg-[#1a9ea8] flex items-center justify-center flex-shrink-0">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#1a9ea8]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Ready for a better hospital experience?
          </h2>
          <p className="text-white/80 text-base mb-10">
            Join thousands of patients who have reclaimed their time. Book your priority ticket today.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://wa.me/2207036433"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-[#0e6b72] font-bold px-7 py-3 rounded-xl hover:bg-white/90 transition-colors shadow-md"
            >
              Book on WhatsApp
            </a>
            <Link href="/book" className="inline-flex items-center gap-2 border-2 border-white text-white font-bold px-7 py-3 rounded-xl hover:bg-white/10 transition-colors">
              Try AI Assistant
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <Image src="/logo.svg" alt="MediTicket" width={130} height={42} className="h-10 w-auto mb-3" />
            <p className="text-xs leading-relaxed max-w-xs">
              Built at Let&apos;s Vibe Civic AI Hackathon, Disruptive Lab, Fajara, The Gambia. Improving patient care through technology.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider mb-4">Links</p>
            <div className="flex flex-col gap-2.5 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider mb-4">Resources</p>
            <div className="flex flex-col gap-2.5 text-sm">
              <a href="#" className="hover:text-white transition-colors">Patient Portal</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
              <a href="#" className="hover:text-white transition-colors">FAQ</a>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider mb-4">Connect</p>
            <div className="flex flex-col gap-2.5 text-sm">
              <a href="#" className="hover:text-white transition-colors">Contact Us</a>
              <Link href="/login" className="hover:text-white transition-colors">Admin Portal</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 py-6">
          <p className="text-xs text-center text-gray-500">
            © 2026 MediTicket Clinical Sanctuary. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
