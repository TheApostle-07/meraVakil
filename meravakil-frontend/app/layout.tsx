import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col pt-14 overflow-hidden"> {/* 56 px top padding for fixed header */}
        <div className="fixed top-0 inset-x-0 z-20">
          <Header />
        </div>
        {/* main content grows to fill the middle */}
        <div className="flex-1 flex overflow-hidden">{children}</div>
        <Footer />
      </body>
    </html>
  );
}