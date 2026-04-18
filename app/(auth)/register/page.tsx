"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input, Checkbox } from "@heroui/react";

export default function RegisterPage() {
  const [hospitalName, setHospitalName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#f0f4f5]">
      {/* ── Left panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col p-10 relative overflow-hidden">
        {/* Logo */}
        <Link
          href="/login"
          className="flex items-center gap-2 text-[#1a7f8a] font-semibold text-lg w-fit"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M8 3H16V6H8V3Z" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M12 10V16M9 13H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Medic Ticket
        </Link>

        {/* Hero text */}
        <div className="mt-16">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#1a7f8a] uppercase mb-4">
            The Clinical Sanctuary
          </p>
          <h2 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            Streamlining{" "}
            <span className="text-[#1a7f8a]">Administrative</span>{" "}
            Excellence.
          </h2>
          <p className="text-gray-500 text-base leading-relaxed max-w-sm">
            Join the central hub for modern hospital ticket management.
            Precision, security, and editorial clarity in every interaction.
          </p>
        </div>

        {/* Hospital corridor image card */}
        <div className="mt-auto relative rounded-2xl overflow-hidden shadow-xl">
          {/* Image placeholder — replace src with your hospital image */}
          <div className="w-full h-64 bg-gradient-to-br from-[#8ec5c8] via-[#b8d8db] to-[#d4eaec] flex items-center justify-center">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="opacity-30"
            >
              <path
                d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 22V12H15V22"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Caption card */}
          <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1a7f8a] flex items-center justify-center flex-shrink-0">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Sanctuary General</p>
              <p className="text-xs text-gray-500">Central Admin Infrastructure</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between bg-white px-8 sm:px-14 py-10">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link
            href="/login"
            className="flex items-center gap-2 text-[#1a7f8a] font-semibold text-lg w-fit"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M8 3H16V6H8V3Z" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M12 10V16M9 13H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Medic Ticket
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Create Account</h1>
            <p className="text-sm text-gray-500">Enter your hospital details to get started.</p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4">
            {/* Hospital Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Hospital Name</label>
              <Input
                type="text"
                placeholder="e.g. Sanctuary General"
                value={hospitalName}
                onValueChange={setHospitalName}
                startContent={
                  <svg
                    className="text-gray-400 flex-shrink-0"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                }
                classNames={{
                  inputWrapper:
                    "bg-gray-100 border-0 shadow-none data-[hover=true]:bg-gray-100 group-data-[focus=true]:bg-gray-100",
                  input: "text-gray-800 placeholder:text-gray-400",
                }}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <Input
                type="email"
                placeholder="admin@hospital.com"
                value={email}
                onValueChange={setEmail}
                startContent={
                  <svg
                    className="text-gray-400 flex-shrink-0"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" />
                  </svg>
                }
                classNames={{
                  inputWrapper:
                    "bg-gray-100 border-0 shadow-none data-[hover=true]:bg-gray-100 group-data-[focus=true]:bg-gray-100",
                  input: "text-gray-800 placeholder:text-gray-400",
                }}
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Phone Number</label>
              <Input
                type="tel"
                placeholder="+220 xxx xxxx"
                value={phone}
                onValueChange={setPhone}
                startContent={
                  <svg
                    className="text-gray-400 flex-shrink-0"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 7.49 7.49l.38-.38a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                }
                classNames={{
                  inputWrapper:
                    "bg-gray-100 border-0 shadow-none data-[hover=true]:bg-gray-100 group-data-[focus=true]:bg-gray-100",
                  input: "text-gray-800 placeholder:text-gray-400",
                }}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onValueChange={setPassword}
                startContent={
                  <svg
                    className="text-gray-400 flex-shrink-0"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                }
                classNames={{
                  inputWrapper:
                    "bg-gray-100 border-0 shadow-none data-[hover=true]:bg-gray-100 group-data-[focus=true]:bg-gray-100",
                  input: "text-gray-800 placeholder:text-gray-400",
                }}
              />
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-2 mt-1">
              <Checkbox
                isSelected={agreed}
                onValueChange={setAgreed}
                size="sm"
                classNames={{ wrapper: "mt-0.5" }}
              />
              <span className="text-sm text-gray-600 leading-snug">
                I agree to the{" "}
                <a href="#" className="text-[#1a7f8a] font-medium hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#1a7f8a] font-medium hover:underline">
                  Privacy Policy
                </a>
                .
              </span>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              isDisabled={!agreed}
              className="w-full bg-[#1a7f8a] text-white font-semibold rounded-xl h-12 text-base mt-1 hover:bg-[#156870] transition-colors disabled:opacity-50"
            >
              Create Admin Account
            </Button>

            {/* OAuth divider */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
                Or Continue With
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google */}
            <Button
              variant="flat"
              className="w-full bg-gray-100 text-gray-700 font-medium rounded-xl h-12 text-sm hover:bg-gray-200 transition-colors"
              startContent={
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              }
            >
              Sign up with Google
            </Button>

            {/* Login link */}
            <p className="text-center text-sm text-gray-500 mt-1">
              Already have an account?{" "}
              <Link href="/login" className="text-[#1a7f8a] font-medium hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer links */}
        <div className="flex items-center justify-center gap-6 mt-8">
          {["Support", "Privacy", "Security"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase hover:text-gray-600 transition-colors"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
