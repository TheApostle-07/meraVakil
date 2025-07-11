"use client";

import Link from "next/link";
import { Scale } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { SignedIn, SignedOut, useUser, useClerk } from "@clerk/nextjs";

export default function Header() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const initials = user
    ? (user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "") ||
      (user.username?.slice(0, 2) ?? "")
    : "";

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

        {/* Auth/UI */}
        <div className="flex items-center gap-4">
          <SignedOut>
            <Link
              href="/auth?mode=sign-in"
              className="px-4 py-1.5 rounded-md bg-white/30 hover:bg-white/50 text-white font-semibold text-sm transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/auth?mode=sign-up"
              className="px-4 py-1.5 rounded-md bg-white text-blue-700 font-semibold text-sm shadow hover:bg-gray-100 transition-colors"
            >
              Sign Up
            </Link>
          </SignedOut>

          {/* Signed‑in: avatar + dropdown */}
          <SignedIn>
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-label="User menu"
                className="h-8 w-8 rounded-full bg-white/25 flex items-center justify-center text-sm font-semibold select-none focus:outline-none overflow-hidden"
              >
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={`${user.firstName || user.username || "User"} avatar`}
                    className="h-full w-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-white">{initials || "MK"}</span>
                )}
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-48 bg-white/90 text-gray-800 rounded-lg shadow-lg backdrop-blur-sm py-2">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setOpen(false)}
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      signOut({ redirectUrl: "/" });
                      setOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
