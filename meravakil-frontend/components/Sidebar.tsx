"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type ChatThread = { id: string; firstLine: string };

const DEMO_THREADS: string[] = [
  "How do I evict a tenant?",
  "Cheque bounced – what next?",
  "Delay in flat possession by builder",
  "Apply for succession certificate",
  "Cyber-fraud on UPI app",
  "Mutual divorce process time",
  "Wrongful job termination in IT",
  "Refund of security deposit",
  "Road accident claim amount",
  "Partition suit among siblings",
  "BBMP property-tax dispute",
  "Section 138 NI notice format",
  "Transfer of farmland in Karnataka",
  "Domestic violence protection order",
  "Consumer complaint against hospital",
];

export default function Sidebar({
  activeId,
  onSelect,
  mobile,
  close,
}: {
  activeId: string | null;
  onSelect: (id: string) => void;
  /** when true renders as mobile drawer */
  mobile?: boolean;
  /** close callback for mobile drawer */
  close?: () => void;
}) {
  const [threads, setThreads] = useState<ChatThread[]>([]);

  /** initial load -- pull from localStorage or seed demo data */
  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("mv_threads") || "[]"
    ) as ChatThread[];

    if (saved.length) {
      setThreads(saved);
    } else {
      const seeded = DEMO_THREADS.map((line, i) => ({
        id: `demo-${i}`,
        firstLine: line,
      }));
      localStorage.setItem("mv_threads", JSON.stringify(seeded));
      setThreads(seeded);
    }
  }, []);

  /** reusable list item */
  function Item({ t }: { t: ChatThread }) {
    const isActive = t.id === activeId;
    return (
      <button
        onClick={() => {
          onSelect(t.id);
          close?.();
        }}
        className={`block w-full truncate text-left px-3 py-2 my-0.5 rounded-lg transition
        ${
          isActive
            ? "bg-blue-50 border-l-4 border-blue-600 text-blue-800 font-medium"
            : "hover:bg-gray-100"
        }`}
      >
        {t.firstLine}
      </button>
    );
  }

  const baseClass =
    "w-56 lg:w-64 shrink-0 border-r border-gray-200 bg-white flex-col h-screen pt-14";

  return (
    <aside
      className={
        mobile
          ? `fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:hidden ${
              mobile ? "translate-x-0" : "-translate-x-full"
            } ${baseClass}`
          : `hidden md:flex ${baseClass}`
      }
    >
      {/* mobile close button */}
      {mobile && (
        <button
          onClick={close}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Close sidebar"
        >
          <X size={20} strokeWidth={2} />
        </button>
      )}

      <div
        className={`px-4 py-3 bg-white border-b font-semibold text-gray-700 ${
          mobile ? "" : "pt-12"
        }`}
      >
        Chats
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        {threads.map((t) => (
          <Item key={t.id} t={t} />
        ))}
      </div>
    </aside>
  );
}