"use client";

import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import { useRef } from "react";
import Sidebar from "../components/Sidebar";
import { Paperclip, SendHorizonal } from "lucide-react";
import { Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Msg = { role: "u" | "b"; txt: string; grounded?: boolean };
type Thread = { id: string; msgs: Msg[] };

function ChatArea({
  messages,
  loading,
  bottomRef,
}: {
  messages: Msg[];
  loading: boolean;
  bottomRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div
      className={`flex flex-col w-full max-w-5xl mx-auto px-6 md:px-10 lg:px-12 pt-8 gap-6
            max-h-[calc(100vh-200px)] overflow-y-auto overflow-x-hidden
            overscroll-contain pb-28 ${
        messages.length === 0 ? "mt-6" : ""
      }`}
    >
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
            {m.role === "u" ? (
              <span
                className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white max-w-full sm:max-w-sm md:max-w-md lg:max-w-lg break-words"
              >
                {m.txt}
              </span>
            ) : (
              <div className="prose prose-slate dark:prose-invert bg-gray-100 text-gray-900 px-5 py-3 rounded-xl max-w-full sm:max-w-sm md:max-w-md lg:max-w-xl">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.txt}</ReactMarkdown>
              </div>
            )}
            {m.role === "b" && m.grounded && (
              <span className="ml-2 inline-block text-[10px] px-2 py-[2px] rounded bg-green-100 text-green-700 align-middle animate-pulse">
                sourced
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {loading && messages.length > 0 && (
        <motion.div
          key="typing"
          className="text-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            repeat: Infinity,
            duration: 1,
            ease: "easeInOut",
          }}
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

export default function Home() {
  const [threads, setThreads] = useState<Record<string, Thread>>({});
  const [activeId, setActiveId] = useState<string>(() =>
    crypto.randomUUID()
  );
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);   // no initial splash
  const [splash, setSplash] = useState(true);    // show once at app start
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const active = threads[activeId]?.msgs || [];

  // restore threads from localStorage on first load
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("mv_threads") || "[]");
    const obj: Record<string, Thread> = {};
    saved.forEach((t: any) => (obj[t.id] = { id: t.id, msgs: t.msgs }));
    setThreads(obj);
  }, []);

  // initial splash loader (2 s)
  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 2000);
    return () => clearTimeout(t);
  }, []);


  // persist whenever threads change
  useEffect(() => {
    localStorage.setItem(
      "mv_threads",
      JSON.stringify(Object.values(threads))
    );
  }, [threads]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active]);

  async function send() {
    if (!input.trim()) return;
    setLoading(true);
    const userMsg: Msg = { role: "u", txt: input };

    // optimistic UI
    setThreads(prev => ({
      ...prev,
      [activeId]: {
        id: activeId,
        msgs: [...(prev[activeId]?.msgs || []), userMsg]
      }
    }));
    setInput("");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/chat`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query:
            userMsg.txt +
            "\n\nPlease answer in clear Markdown with descriptive headings, bullet points and short paragraphs.",
        }),
      }
    ).then(r => r.json());

    const botMsg: Msg = { role: "b", txt: res.answer, grounded: !!res.grounded };
    setThreads(prev => ({
      ...prev,
      [activeId]: {
        ...prev[activeId],
        msgs: [...prev[activeId].msgs, botMsg]
      }
    }));
    setLoading(false);
  }

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile hamburger */}
      {!sidebarOpen && (
        <button
          className="md:hidden fixed top-[64px] left-4 z-40 p-1 text-gray-700 hover:text-gray-900 focus:outline-none transition"
          aria-label="Open sidebar"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={22} strokeWidth={2.2} />
        </button>
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeId={activeId}
          onSelect={(id) => setActiveId(id)}
          mobile={sidebarOpen}
          close={() => setSidebarOpen(false)}
        />

        <main className="flex-1 flex flex-col items-center min-h-0 overflow-hidden pt-20">
          {/* Centered banner when no messages */}
          {active.length === 0 && (
            <motion.div
              className="flex-1 flex flex-col items-center justify-center text-center space-y-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-700 tracking-wide">
                Your Personal Lawyer is Here
              </h1>
              <h2 className="text-xl sm:text-2xl text-gray-600">
                How can I assist you today?
              </h2>
              <p className="text-gray-500 max-w-md">
                Describe your issue or attach any legal document—I'll review it and guide you.
              </p>
            </motion.div>
          )}

          <ChatArea messages={active} loading={loading} bottomRef={bottomRef} />

          {/* Input panel */}
          <motion.form
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="sticky bottom-4 w-full flex justify-center mt-auto px-4"
          >
            <div className="relative flex w-full max-w-5xl items-center gap-2 px-2 sm:px-4">
              {/* hidden file input */}
              <input
                type="file"
                accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                multiple
                id="fileUpload"
                className="hidden"
                onChange={(e) => {
                  const f = Array.from(e.target.files || []);
                  setFiles(f);
                }}
              />

              {/* attach button */}
              <button
                type="button"
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                onClick={() => document.getElementById("fileUpload")?.click()}
              >
                <Paperclip size={18} />
              </button>

              {/* text input */}
              <input
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tell me your legal question…"
              />

              {/* send */}
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-1"
              >
                <SendHorizonal size={16} />
                Send
              </button>
            </div>
          </motion.form>

          {/* list selected files */}
          {files.length > 0 && (
            <div className="w-full max-w-5xl px-4 mt-2">
              {files.map((f) => (
                <p key={f.name} className="text-xs text-gray-500 truncate">
                  📎 {f.name}
                </p>
              ))}
            </div>
          )}
        </main>
      </div>
    {/* Splash loader (one-time) */}
    { splash && <Loader visible /> }
    </>
  );
}