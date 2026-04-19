"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import modempayLogo from "@/images/modempay.png";

type PaymentType = "WAVE" | "QMONEY" | "APS" | "AFRIMONEY" | "YONNA";

interface PaymentMethodRecord {
  id: string;
  type: PaymentType;
  accountNumber: string;
  accountName: string;
  isActive: boolean;
}

// Per-type display config
const METHOD_CONFIG: Record<
  PaymentType,
  {
    label: string;
    tagline: string;
    accountNumberLabel: string;
    accountNameLabel: string;
    accountNumberPlaceholder: string;
    accountNamePlaceholder: string;
    color: string;
    bg: string;
    icon: React.ReactNode;
    abbr: string;
  }
> = {
  WAVE: {
    label: "Wave Mobile Money",
    tagline: "Configure Wave merchant credentials",
    accountNumberLabel: "Account Number",
    accountNameLabel: "Account Name",
    accountNumberPlaceholder: "+220 700 0000",
    accountNamePlaceholder: "Hospital / Merchant name",
    color: "text-blue-600",
    bg: "bg-blue-100",
    abbr: "WV",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  QMONEY: {
    label: "QMoney",
    tagline: "Quantum Mobile Money — Gambia",
    accountNumberLabel: "Account Number",
    accountNameLabel: "Verification Name",
    accountNumberPlaceholder: "+220 300 0000",
    accountNamePlaceholder: "Clinic / Business name",
    color: "text-orange-600",
    bg: "bg-orange-100",
    abbr: "QM",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="2" />
        <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  APS: {
    label: "APS Money Transfer",
    tagline: "Atlantic Pay Services — Gambia",
    accountNumberLabel: "Account ID",
    accountNameLabel: "Legal Entity",
    accountNumberPlaceholder: "APS-MED-XXXX",
    accountNamePlaceholder: "Registered legal name",
    color: "text-sky-600",
    bg: "bg-sky-100",
    abbr: "AP",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  AFRIMONEY: {
    label: "Afrimoney",
    tagline: "Africell Mobile Money — Gambia",
    accountNumberLabel: "Merchant Phone",
    accountNameLabel: "Business Name",
    accountNumberPlaceholder: "+220 770 0000",
    accountNamePlaceholder: "Registered business name",
    color: "text-red-600",
    bg: "bg-red-100",
    abbr: "AF",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M9 9h.01M15 9h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  YONNA: {
    label: "Yonna Finance",
    tagline: "Yonna Financial Solutions — Gambia",
    accountNumberLabel: "Wallet Number",
    accountNameLabel: "Account Name",
    accountNumberPlaceholder: "YON-XXXX-XXX",
    accountNamePlaceholder: "Hospital wallet name",
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    abbr: "YN",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
        <path d="M2 10h20" stroke="currentColor" strokeWidth="2" />
        <circle cx="6" cy="15" r="1.5" fill="currentColor" />
        <path d="M10 15h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
};

const PAYMENT_TYPES: PaymentType[] = ["WAVE", "QMONEY", "APS", "AFRIMONEY", "YONNA"];

type FormState = Record<PaymentType, { accountNumber: string; accountName: string; isActive: boolean }>;

function Spinner({ small }: { small?: boolean }) {
  const s = small ? 14 : 18;
  return (
    <svg className="animate-spin" width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-[#1a7f8a]/20 focus:border-[#1a7f8a]/40 transition-all disabled:opacity-50"
      />
    </div>
  );
}

export default function PaymentMethodsPage() {
  const [form, setForm] = useState<FormState>(() =>
    Object.fromEntries(
      PAYMENT_TYPES.map((t) => [t, { accountNumber: "", accountName: "", isActive: true }])
    ) as FormState
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingIds, setExistingIds] = useState<Partial<Record<PaymentType, string>>>({});

  const fetchMethods = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payment-methods");
      if (!res.ok) throw new Error("Failed to load");
      const data: PaymentMethodRecord[] = await res.json();

      const ids: Partial<Record<PaymentType, string>> = {};
      const newForm = { ...form };
      for (const m of data) {
        newForm[m.type] = { accountNumber: m.accountNumber, accountName: m.accountName, isActive: m.isActive };
        ids[m.type] = m.id;
      }
      setForm(newForm);
      setExistingIds(ids);
    } catch {
      // silently ignore — empty form is fine
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchMethods(); }, [fetchMethods]);

  function updateField(type: PaymentType, field: "accountNumber" | "accountName", value: string) {
    setForm((prev) => ({ ...prev, [type]: { ...prev[type], [field]: value } }));
  }

  function toggleActive(type: PaymentType) {
    setForm((prev) => ({ ...prev, [type]: { ...prev[type], isActive: !prev[type].isActive } }));
  }

  async function handleSaveAll() {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const configured = PAYMENT_TYPES.filter(
        (t) => form[t].accountNumber.trim() || form[t].accountName.trim() || existingIds[t]
      );

      await Promise.all(
        configured.map((type) =>
          fetch("/api/payment-methods", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type,
              accountNumber: form[type].accountNumber || "N/A",
              accountName: form[type].accountName || "N/A",
              isActive: form[type].isActive,
            }),
          })
        )
      );

      setSaved(true);
      await fetchMethods();
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const configuredCount = PAYMENT_TYPES.filter((t) => existingIds[t]).length;
  const activeCount = PAYMENT_TYPES.filter((t) => existingIds[t] && form[t].isActive).length;

  // Wave is the featured/primary card; others go in a 2x2 grid
  const [waveType, ...gridTypes] = PAYMENT_TYPES;
  const waveConfig = METHOD_CONFIG[waveType];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page heading */}
      <div className="mb-7">
        <p className="text-xs font-semibold tracking-[0.18em] text-[#1a7f8a] uppercase mb-1">
          Financial Integration
        </p>
        <h1 className="text-4xl font-extrabold text-gray-900">Payment Methods</h1>
        <p className="text-sm text-gray-500 mt-2 max-w-xl">
          Securely configure and manage Gambian payment gateways. Ensure account details are verified with local providers for real-time ticket settlement.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
        {/* ── Left: payment method cards ─────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Wave — featured card */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <div className="px-6 pt-6 pb-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl ${waveConfig.bg} ${waveConfig.color} flex items-center justify-center flex-shrink-0`}>
                    {waveConfig.icon}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">{waveConfig.label}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{waveConfig.tagline}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleActive(waveType)}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
                      form[waveType].isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${form[waveType].isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                    {form[waveType].isActive ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              {loading ? (
                <div className="flex items-center gap-2 text-gray-400 py-4">
                  <Spinner small /> <span className="text-sm">Loading…</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Method Type — static display */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Method Type</label>
                    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700">
                      <span>Merchant API</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <InputField
                    label={waveConfig.accountNumberLabel}
                    value={form[waveType].accountNumber}
                    onChange={(v) => updateField(waveType, "accountNumber", v)}
                    placeholder={waveConfig.accountNumberPlaceholder}
                  />
                  <InputField
                    label={waveConfig.accountNameLabel}
                    value={form[waveType].accountName}
                    onChange={(v) => updateField(waveType, "accountName", v)}
                    placeholder={waveConfig.accountNamePlaceholder}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Grid: QMoney, APS, Afrimoney, Yonna */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gridTypes.map((type) => {
              const cfg = METHOD_CONFIG[type];
              return (
                <div key={type} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-5 pt-5 pb-4 border-b border-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-10 h-10 rounded-xl ${cfg.bg} ${cfg.color} flex items-center justify-center flex-shrink-0`}>
                          {cfg.icon}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{cfg.label}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{cfg.tagline}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleActive(type)}
                        title={form[type].isActive ? "Click to deactivate" : "Click to activate"}
                        className={`w-8 h-4 rounded-full transition-colors relative flex-shrink-0 ${
                          form[type].isActive ? "bg-[#1a7f8a]" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${
                            form[type].isActive ? "translate-x-4" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="px-5 py-4 flex flex-col gap-3">
                    {loading ? (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Spinner small /> <span className="text-xs">Loading…</span>
                      </div>
                    ) : (
                      <>
                        <InputField
                          label={cfg.accountNumberLabel}
                          value={form[type].accountNumber}
                          onChange={(v) => updateField(type, "accountNumber", v)}
                          placeholder={cfg.accountNumberPlaceholder}
                        />
                        <InputField
                          label={cfg.accountNameLabel}
                          value={form[type].accountName}
                          onChange={(v) => updateField(type, "accountName", v)}
                          placeholder={cfg.accountNamePlaceholder}
                        />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right sidebar ──────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Save All Changes */}
          <div className="bg-[#1a7f8a] rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2.5 mb-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-base font-bold">Secure Configuration</p>
            </div>
            <p className="text-sm text-white/80 leading-relaxed mb-5">
              Updates to payment methods are audited and require supervisor approval. Changes will take effect immediately upon verification.
            </p>

            {error && (
              <div className="bg-red-500/20 border border-red-300/30 rounded-xl px-3 py-2 text-xs text-red-100 mb-3">
                {error}
              </div>
            )}
            {saved && (
              <div className="bg-white/20 rounded-xl px-3 py-2 text-xs text-white mb-3 flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Changes saved successfully.
              </div>
            )}

            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saving || loading}
              className="w-full flex items-center justify-between bg-white text-[#1a7f8a] font-bold rounded-xl px-5 py-3 text-sm hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{saving ? "Saving…" : "Save All Changes"}</span>
              {saving ? (
                <div className="text-[#1a7f8a]"><Spinner small /></div>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>

          {/* Gateway Performance */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-5">
              Gateway Performance
            </p>
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500">Uptime (24h)</span>
                  <span className="text-xs font-bold text-gray-900">99.8%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1a7f8a] rounded-full w-[99.8%]" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500">Settlement Speed</span>
                  <span className="text-xs font-bold text-[#1a7f8a]">Instant</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1a7f8a] rounded-full w-full" />
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                    Configured Methods
                  </span>
                  <span className="text-[10px] font-bold text-gray-500">
                    {configuredCount} / {PAYMENT_TYPES.length}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {PAYMENT_TYPES.map((t) => {
                    const cfg = METHOD_CONFIG[t];
                    const isConfigured = !!existingIds[t];
                    return (
                      <div
                        key={t}
                        title={cfg.label}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold transition-opacity ${
                          isConfigured
                            ? `${cfg.bg} ${cfg.color}`
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {cfg.abbr}
                      </div>
                    );
                  })}
                  <span className="text-xs text-gray-400 ml-1">
                    {activeCount} active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Secure Cloud Banking card */}
          <div className="bg-[#1a7f8a] rounded-2xl p-6 overflow-hidden relative">
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none">
                <circle cx="160" cy="160" r="120" stroke="white" strokeWidth="40" />
                <circle cx="40" cy="40" r="60" stroke="white" strokeWidth="30" />
              </svg>
            </div>
            <div className="relative">
              <p className="text-[10px] font-bold tracking-widest text-white/60 uppercase mb-2">
                Verified Provider
              </p>
              <p className="text-lg font-extrabold text-white leading-snug">
                Secure Cloud Banking Integration
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-xs text-white/80 font-medium">PCI-DSS Level 1 Compliant</span>
              </div>
            </div>
          </div>

          {/* Powered by ModemPay */}
          <a
            href="https://modempay.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm hover:shadow-md hover:border-gray-200 transition-all group"
          >
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
              Powered by
            </span>
            <Image
              src={modempayLogo}
              alt="ModemPay"
              width={90}
              height={28}
              className="object-contain opacity-80 group-hover:opacity-100 transition-opacity"
            />
          </a>
        </div>
      </div>
    </div>
  );
}
