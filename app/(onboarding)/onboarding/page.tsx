"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: React.HTMLInputAutoCompleteAttribute;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#1a7f8a]/30 transition-all"
      />
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!name || !email || !phone) {
      setError("Hospital name, email, and phone are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, address }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to create organization.");
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f4f5] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#1a7f8a] flex items-center justify-center flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M3 9L12 2L21 9V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 22V12H15V22" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Set Up Your Hospital</h1>
            <p className="text-sm text-gray-500">Complete your organization profile to continue</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          <Field
            label="Hospital Name"
            placeholder="e.g. Sanctuary General Hospital"
            value={name}
            onChange={setName}
            autoComplete="organization"
          />
          <Field
            label="Email Address"
            type="email"
            placeholder="admin@hospital.com"
            value={email}
            onChange={setEmail}
            autoComplete="email"
          />
          <Field
            label="Phone Number"
            type="tel"
            placeholder="+220 xxx xxxx"
            value={phone}
            onChange={setPhone}
            autoComplete="tel"
          />
          <Field
            label="Address (optional)"
            placeholder="Banjul, The Gambia"
            value={address}
            onChange={setAddress}
            autoComplete="street-address"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#1a7f8a] text-white font-semibold rounded-xl h-12 text-sm mt-2 hover:bg-[#156870] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <Spinner /> : null}
            {loading ? "Setting up…" : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}
