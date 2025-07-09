import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen flex flex-col pt-14 overflow-hidden">
          <div className="fixed top-0 inset-x-0 z-20">
            <Header />
          </div>
          {/* main content grows to fill the middle */}
          <div className="flex-1 flex overflow-hidden">{children}</div>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
