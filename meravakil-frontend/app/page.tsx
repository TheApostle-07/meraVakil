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
import { ChatThread } from "../components/Sidebar";

type Msg = { role: "user" | "ai"; txt: string; grounded?: boolean };
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
            overscroll-contain pb-28 ${messages?.length === 0 ? "mt-6" : ""}`}
    >
      <AnimatePresence initial={false}>
        {messages?.map((m, i) => (
          <motion.div
            key={i}
            className={m.role === "user" ? "text-right" : ""}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            {m.role === "user" ? (
              <span className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white max-w-full sm:max-w-sm md:max-w-md lg:max-w-lg break-words">
                {m.txt}
              </span>
            ) : (
              <div className="prose prose-slate dark:prose-invert bg-gray-100 text-gray-900 px-5 py-3 rounded-xl max-w-full sm:max-w-sm md:max-w-md lg:max-w-xl">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.txt}
                </ReactMarkdown>
              </div>
            )}
            {m.role === "ai" && m.grounded && (
              <span className="ml-2 inline-block text-[10px] px-2 py-[2px] rounded bg-green-100 text-green-700 align-middle animate-pulse">
                sourced
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {loading && messages?.length > 0 && (
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
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false); // no initial splash
  const [splash, setSplash] = useState(true); // show once at app start
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);
  const [newThread, setNewThread] = useState<ChatThread | null>();

  // initial splash loader (2 s)
  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentThread]);

  async function send() {
    if (!input.trim()) return;

    try {
      setLoading(true);
      const userMsg: Msg = { role: "user", txt: input };
      let chatId = currentThread?.id;

      if (!currentThread) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/chat/new`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              content: input,
            }),
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const chat = (await res.json()) as {
          id: string;
          title: string;
        };
        chatId = chat.id;
        setNewThread({
          id: chat.id,
          firstLine: chat.title,
        });
        setCurrentThread({ id: chat.id, msgs: [userMsg] });
      } else {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/message/new`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              chatId: currentThread.id,
              content: input,
            }),
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        setCurrentThread((curr) => ({
          id: curr!.id,
          msgs: [...curr!.msgs, userMsg],
        }));
      }

      setInput("");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          chatId,
          query: userMsg.txt,
        }),
      });

      if (!res.ok || !res.body) {
        console.error("Network error or no stream");
        setLoading(false);
        return;
      }

      // Grab grounded info from header (optional)
      const groundedHeader = res.headers.get("X-Grounded");
      const grounded = groundedHeader === "true";
      console.log("Grounded:", groundedHeader, grounded);

      // Stream and append chunks
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let answer = "";

      // Add a placeholder AI message once, then stream into it
      setCurrentThread((prev) => ({
        ...prev,
        msgs: [...prev.msgs, { role: "ai", txt: "", grounded }],
      }));

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          console.log("Received chunk:", chunk);
          answer += chunk;

          setCurrentThread((prev) => {
            const updatedMsgs = [...prev.msgs];
            const lastMsgIndex = updatedMsgs.length - 1;

            // Update only the last ai message
            if (updatedMsgs[lastMsgIndex].role === "ai") {
              updatedMsgs[lastMsgIndex] = {
                ...updatedMsgs[lastMsgIndex],
                txt: answer,
              };
            }

            return {
              ...prev,
              msgs: updatedMsgs,
            };
          });
        }
      }

      reader.releaseLock();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  }

  const fetchThreadMessages = async (threadId: string) => {
    if (!threadId) {
      setCurrentThread(null);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/message/all?chatId=${threadId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const messages: {
        from: "user" | "ai";
        content: string;
        grounded?: boolean;
      }[] = await res.json();
      const msgs: Msg[] = messages.map((m) => ({
        role: m.from,
        txt: m.content,
        grounded: m.grounded,
      }));

      setCurrentThread({ id: threadId, msgs });
    } catch (err) {
      console.error("Failed to fetch messages!", err);
    }
  };

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
          onNewChat={() => {
            setCurrentThread(null);
            setNewThread(null);
          }}
          newThread={newThread}
          activeId={currentThread?.id}
          onSelect={(id) => fetchThreadMessages(id)}
          mobile={sidebarOpen}
          close={() => setSidebarOpen(false)}
        />

        <main className="flex-1 flex flex-col items-center min-h-0 overflow-hidden pt-20">
          {/* Centered banner when no messages */}
          {!currentThread && (
            <motion.div
              className="flex-1 flex flex-col items-center justify-center text-center space-y-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-700 tracking-wide">
                Your Personal Lawyer is Here
              </h1>
              <h2 className="text-xl sm:text-2xl text-gray-600">
                How can I assist you today?
              </h2>
              <p className="text-gray-500 max-w-md">
                Describe your issue or attach any legal document—I'll review it
                and guide you.
              </p>
            </motion.div>
          )}

          <ChatArea
            messages={currentThread?.msgs}
            loading={loading}
            bottomRef={bottomRef}
          />

          {/* Input panel */}
          <motion.form
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
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
      {splash && <Loader visible />}
    </>
  );
}
