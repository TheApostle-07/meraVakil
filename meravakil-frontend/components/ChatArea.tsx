// meravakil-frontend/components/ChatArea.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";

export type Msg = { role: "u" | "b"; txt: string; grounded?: boolean };

export default function ChatArea({
  messages,
  loading,
}: {
  messages: Msg[];
  loading: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* auto-scroll on new messages */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* render nothing if conversation is empty (banner stays visible) */
  if (messages.length === 0) return null;

  return (
    <div className="flex flex-col grow shrink-0 min-h-0 max-h-full w-full max-w-2xl mx-auto px-4 pt-4 pb-28 gap-4 overflow-y-auto overflow-x-hidden overscroll-contain">
      <AnimatePresence initial={false}>
        {messages.map((m, i) => (
          <motion.div
            key={i}
            className={m.role === "u" ? "text-right" : ""}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            <span
              className={`inline-block px-4 py-2 rounded-xl max-w-full sm:max-w-sm md:max-w-md lg:max-w-lg break-words ${
                m.role === "u"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              {m.txt}
            </span>
            {m.role === "b" && m.grounded && (
              <span className="ml-2 inline-block text-[10px] px-2 py-[2px] rounded bg-green-100 text-green-700 align-middle animate-pulse">
                sourced
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* typing indicator */}
      {loading && (
        <motion.div
          key="typing"
          className="text-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
        >
          <span className="inline-block px-4 py-2 rounded-xl bg-gray-200 text-gray-500 animate-pulse">
            typing…
          </span>
        </motion.div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}