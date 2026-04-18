"use client";

import { useState } from "react";
import { useDashboard } from "@/app/(dashboard)/context";

export function Topbar() {
  const { me } = useDashboard();
  const [search, setSearch] = useState("");

  const userName = me?.user?.name ?? "Admin";
  const userInitials = userName.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 flex-shrink-0">
      {/* Logo */}
      <span className="text-[#1a7f8a] font-bold text-xl mr-2 w-44 flex-shrink-0">Medic Ticket</span>

      {/* Search */}
      <div className="flex-1 max-w-xl relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        <input
          type="search"
          placeholder="Search medical records, tickets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-100 rounded-xl pl-9 pr-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#1a7f8a]/20 transition-all"
        />
      </div>

      {/* Icons */}
      <div className="flex items-center gap-3 ml-auto">
        <button type="button" title="Notifications" aria-label="Notifications" className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors relative">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>
        <button type="button" title="Help" aria-label="Help" className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* User profile */}
      <div className="flex items-center gap-3 pl-3 border-l border-gray-100">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-gray-900 leading-tight">{userName}</p>
          <p className="text-xs text-gray-400">Administrator</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#1a7f8a] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">{userInitials}</span>
        </div>
      </div>
    </header>
  );
}
