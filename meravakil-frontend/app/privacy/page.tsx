// meravakil-frontend/app/privacy/page.tsx
"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import Link from "next/link";

/**
 * Privacy Policy page for MeraVakil – Next.js App Router.
 *
 * ✧ Sticky side-nav for quick section jumps.
 * ✧ Framer-motion entrance + scroll animations.
 * ✧ Tailwind CSS, dark-mode ready.
 */

const sections = [
  { id: "intro", label: "1. Introduction" },
  { id: "data-collected", label: "2. Data We Collect" },
  { id: "usage", label: "3. How We Use Data" },
  { id: "security", label: "4. Data Security" },
  { id: "cookies", label: "5. Cookies & Tracking" },
  { id: "rights", label: "6. Your Rights" },
  { id: "changes", label: "7. Policy Changes" },
  { id: "contact", label: "8. Contact" },
];

const LastUpdated = () => <time dateTime="2025-07-16">16 July 2025</time>;

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-[#0d0d0d] dark:text-gray-100">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-sky-600 via-indigo-600 to-purple-700 py-24 text-center text-white shadow-xl">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl px-4 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl"
        >
          Privacy Policy
        </motion.h1>
        <p className="mt-4 text-sm tracking-wide">
          Last updated: <LastUpdated />
        </p>
        <Shield className="absolute right-6 top-6 h-10 w-10 text-white/60" />
      </section>

      {/* Grid layout */}
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

        {/* Main content */}
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
    case "intro":
      return (
        <p>
          This Privacy Policy explains how MeraVakil ("we", "us", or "our")
          collects, uses, and safeguards your personal data when you use our
          services.
        </p>
      );
    case "data-collected":
      return (
        <ul className="list-disc space-y-2 pl-5">
          <li>Account details (name, email, phone).</li>
          <li>Payment identifiers (handled via Razorpay; card data is never stored).</li>
          <li>Uploaded documents &amp; chat transcripts.</li>
          <li>Device &amp; usage data (IP, browser, timestamps).</li>
        </ul>
      );
    case "usage":
      return (
        <p>
          We process data to provide and improve legal-information services,
          personalise your experience, prevent fraud, and comply with legal
          obligations.
        </p>
      );
    case "security":
      return (
        <p>
          Data is encrypted in transit (TLS) and at rest. Access is restricted
          via role-based controls, and regular audits are performed to detect
          vulnerabilities.
        </p>
      );
    case "cookies":
      return (
        <p>
          We use first-party cookies for authentication, and third-party analytics to understand usage patterns. You can disable cookies in your browser, but some features may not work.
        </p>
      );
    case "rights":
      return (
        <ul className="list-disc space-y-2 pl-5">
          <li>Access: Request a copy of your stored data.</li>
          <li>Rectification: Correct inaccurate information.</li>
          <li>Erasure: Delete your account &amp; data (legal limits apply).</li>
          <li>Objection: Opt-out of certain processing activities.</li>
        </ul>
      );
    case "changes":
      return (
        <p>
          We may update this policy periodically. Material changes will be
          communicated via email or in-app notification.
        </p>
      );
    case "contact":
      return (
        <p>
          For privacy enquiries, email&nbsp;
          <Link href="mailto:privacy@meravakil.com" className="underline">
            privacy@meravakil.com
          </Link>
          .
        </p>
      );
    default:
      return null;
  }
}
