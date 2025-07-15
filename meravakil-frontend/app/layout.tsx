// meravakil-frontend/app/layout.tsx
"use client";

import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";

/**
 * Global layout – fixes scroll clipping on long-form pages (Privacy, Terms, etc.).
 *
 * ✧ Removes the body‐level `overflow-hidden` that prevented scrolling.
 * ✧ Keeps the header fixed while allowing the main area to scroll independently.
 * ✧ Footer sticks to the bottom when content is short but scrolls away on long pages.
 */

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth">
        <body className="min-h-screen flex flex-col pt-14 bg-white text-gray-800 dark:bg-[#0d0d0d] dark:text-gray-100">
          {/* Fixed Header */}
          <div className="fixed inset-x-0 top-0 z-20 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-[#0d0d0d]/70">
            <Header />
          </div>

          {/* Main content – scrollable */}
          <main className="flex-1 w-full overflow-y-auto">{children}</main>

          {/* Footer */}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
