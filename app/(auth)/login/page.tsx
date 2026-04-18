"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function InputField({
  label,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
  right,
  icon,
}: {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: React.HTMLInputAutoCompleteAttribute;
  right?: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {right}
      </div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-gray-100 rounded-xl pl-9 pr-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#1a7f8a]/30 transition-all"
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true);
    try {
      const { error: authError } = await signIn.email({ email, password });
      if (authError) { setError(authError.message ?? "Invalid email or password."); return; }
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    await signIn.social({ provider: "google", callbackURL: "/dashboard" });
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#b8dfe3] via-[#d4eef1] to-[#f0f8f9]">
      {/* Shield watermark */}
      <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 opacity-[0.12]">
        <svg width="520" height="600" viewBox="0 0 520 600" fill="none">
          <path d="M260 20L480 100V280C480 400 380 500 260 560C140 500 40 400 40 280V100L260 20Z" fill="#1a7f8a" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full px-4">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#1a7f8a] flex items-center justify-center mb-4 shadow-lg">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="4" y="8" width="20" height="16" rx="2" stroke="white" strokeWidth="2" fill="none" />
              <path d="M10 4H18V8H10V4Z" stroke="white" strokeWidth="2" fill="none" />
              <path d="M14 13V19M11 16H17" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-[#1a7f8a] uppercase mb-1">The Clinical Sanctuary</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-1">Medic Ticket</h1>
          <p className="text-sm text-gray-500">Administrative Access Gateway</p>
        </div>

        {/* Card */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSignIn} className="flex flex-col gap-5">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 font-medium">{error}</div>
            )}

            <InputField
              label="Hospital Email"
              type="email"
              placeholder="dr.smith@sanctuary.com"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />

            <InputField
              label="Secure Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              right={
                <a href="#" className="text-sm font-medium text-[#1a7f8a] hover:text-[#156870] transition-colors">Forgot?</a>
              }
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              }
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#1a7f8a] text-white font-semibold rounded-xl h-12 text-base hover:bg-[#156870] transition-colors disabled:opacity-60"
            >
              {loading ? <Spinner /> : <>Sign In <span aria-hidden>→</span></>}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">Authorized OAuth Only</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button
              type="button"
              disabled={googleLoading}
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl h-12 text-sm hover:bg-gray-200 transition-colors disabled:opacity-60"
            >
              {googleLoading ? <Spinner /> : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>

            <p className="text-center text-sm text-gray-500">
              New hospital?{" "}
              <a href="/register" className="font-medium text-[#1a7f8a] hover:underline">Create an account</a>
            </p>
          </form>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Need specialized assistance?{" "}
          <a href="mailto:support@mediticket.gm" className="font-medium text-[#1a7f8a] hover:text-[#156870] transition-colors">Contact IT Support</a>
        </p>

        <div className="flex items-center gap-3 mt-4 opacity-40">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="9" y="3" width="6" height="4" rx="1" stroke="#6b7280" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      <div className="absolute bottom-5 left-5 flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-medium text-gray-600">System Status: Optimal</span>
      </div>
    </div>
  );
}
