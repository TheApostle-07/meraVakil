"use client";

import Link from "next/link";
import { Scale } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-30 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 sm:px-10 py-3 text-white">
        {/* Brand */}
        <Link
          href="/"
          scroll={false}
          className="flex items-center gap-2 group transition-colors"
        >
          <Scale
            size={24}
            className="group-hover:rotate-6 group-hover:scale-105 transition-transform duration-300"
          />
          <span className="text-lg sm:text-2xl font-extrabold tracking-wide">
            MeraVakil
          </span>
        </Link>

        {/* Avatar with hover menu */}
        <div ref={dropdownRef} className="relative">
          {/* avatar */}
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="h-8 w-8 rounded-full bg-white/25 flex items-center justify-center text-sm font-semibold select-none focus:outline-none"
          >
            MK
          </button>

          {/* menu */}
          <div
            className={`absolute right-0 mt-2 w-36 bg-white text-gray-700 rounded-md shadow-lg border border-gray-200 transition-all duration-150
              ${open ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 translate-y-1 pointer-events-none'}`}
          >
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm hover:bg-gray-100 rounded-t-md"
            >
              Profile
            </Link>
            <button
              type="button"
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-b-md"
              onClick={() => alert('Logged out!')}
            >
              Log&nbsp;Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}