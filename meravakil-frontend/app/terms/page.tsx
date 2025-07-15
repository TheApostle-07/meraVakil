
// meravakil-frontend/app/terms/page.tsx
"use client";

import { motion } from "framer-motion";
import { CheckCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";

/**
 * Elegant Terms & Conditions page for MeraVakil – built for the Next.js App Router.
 *
 * ‣ Responsive two‑column layout on ≥lg screens (sticky side‑nav + main content).
 * ‣ Smooth Framer‑motion entrance animations.
 * ‣ Tailwind utility classes with brand‑neutral palette (easy to theme).
 * ‣ Anchor links for quick navigation & a subtle scroll‑spy highlight.
 *
 * Update the <LastUpdated /> date in one place and it auto‑renders everywhere.
 */

const sections = [
  { id: "introduction", label: "1. Introduction" },
  { id: "services", label: "2. Scope of Services" },
  { id: "account", label: "3. Account Registration" },
  { id: "payments", label: "4. Payments & Refunds" },
  { id: "liability", label: "5. Limitation of Liability" },
  { id: "privacy", label: "6. Privacy & Data" },
  { id: "termination", label: "7. Termination" },
  { id: "governing-law", label: "8. Governing Law" },
  { id: "contact", label: "9. Contact" },
];

const LastUpdated = () => <time dateTime="2025-07-16">16 July 2025</time>;

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-[#0e0e0e] dark:text-gray-100">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-tr from-indigo-600 via-purple-600 to-fuchsia-600 py-24 text-center text-white shadow-xl">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl px-4 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl"
        >
          Terms &amp; Conditions
        </motion.h1>
        <p className="mt-4 text-sm/relaxed tracking-wide">
          Last updated: <LastUpdated />
        </p>
        <ShieldCheck className="absolute right-6 top-6 h-10 w-10 text-white/60" />
      </section>

      {/* Content grid */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 lg:grid-cols-[18rem_1fr] gap-8 px-4 py-12 lg:py-20">
        {/* Side nav */}
        <nav className="hidden lg:block sticky top-24 self-start">
          <ul className="space-y-3 text-sm font-medium">
            {sections.map(({ id, label }) => (
              <li key={id}>
                <Link
                  href={`#${id}`}
                  className="block rounded-lg px-4 py-2 transition-colors hover:bg-gray-200 hover:dark:bg-gray-800"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main article */}
        <article className="prose lg:prose-lg dark:prose-invert mx-auto">
          {sections.map(({ id, label }) => (
            <Section key={id} id={id} label={label} />
          ))}
        </article>
      </div>
    </div>
  );
}

function Section({ id, label }: { id: string; label: string }) {
  const content = getContent(id);
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      className="scroll-mt-24"
    >
      <h2 className="mb-4 text-2xl font-semibold tracking-tight sm:text-3xl">
        {label}
      </h2>
      {content}
    </motion.section>
  );
}

function getContent(id: string) {
  switch (id) {
    case "introduction":
      return (
        <p>
          Welcome to MeraVakil. By accessing or using our platform, you agree to
          be bound by these Terms &amp; Conditions ("Terms"). If you do not
          agree, please refrain from using the service.
        </p>
      );
    case "services":
      return (
        <ul className="list-disc pl-5 space-y-2">
          <li>AI‑assisted legal information tailored for Indian law.</li>
          <li>
            Document review and drafting suggestions generated via OpenAI
            models.
          </li>
          <li>
            Connection to licensed advocates for formal legal representation.
          </li>
        </ul>
      );
    case "account":
      return (
        <p>
          You must create an account with accurate details. You are responsible
          for safeguarding your login credentials and for all activity that
          occurs under your account.
        </p>
      );
    case "payments":
      return (
        <>
          <p>
            Fees are payable in INR via Razorpay. All purchases are final unless
            expressly stated otherwise under applicable consumer‑protection
            laws.
          </p>
          <p>
            In limited circumstances, MeraVakil may, at its sole discretion,
            issue refunds or credits.
          </p>
        </>
      );
    case "liability":
      return (
        <p>
          MeraVakil provides information, not legal representation. We do not
          guarantee the accuracy or completeness of AI‑generated content and are
          not liable for any losses arising from reliance on the service.
        </p>
      );
    case "privacy":
      return (
        <p>
          Our <Link href="/privacy" className="underline">Privacy Policy</Link>
          &nbsp;explains how we collect, use, and protect your data. By using the
          service, you consent to those practices.
        </p>
      );
    case "termination":
      return (
        <p>
          We reserve the right to suspend or terminate your account if you
          violate these Terms or engage in unlawful conduct.
        </p>
      );
    case "governing-law":
      return (
        <p>
          These Terms are governed by the laws of India. Any disputes shall be
          subject to the exclusive jurisdiction of the courts of Bengaluru,
          Karnataka.
        </p>
      );
    case "contact":
      return (
        <p>
          Questions? Email us at&nbsp;
          <Link href="mailto:support@meravakil.com" className="underline">
            support@meravakil.com
          </Link>
          .
        </p>
      );
    default:
      return null;
  }
}
