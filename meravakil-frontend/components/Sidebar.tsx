"use client";
import { useEffect, useState } from "react";
import { X, Plus, MoreHorizontal, Star, Edit, Trash2 } from "lucide-react";

import RenameChat from "./Popup/Rename";
import DeleteChat from "./Popup/Delete";

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
  onNewChat,
  mobile,
  close,
}: {
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  /** when true renders as mobile drawer */
  mobile?: boolean;
  /** close callback for mobile drawer */
  close?: () => void;
}) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [renameValue, setRenameValue] = useState("");

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

  /** Close menu when clicking outside */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside any dropdown menu
      const target = event.target as Element;
      if (
        openMenuId &&
        !target.closest(".dropdown-menu") &&
        !target.closest(".menu-button")
      ) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  const handleRename = () => {
    if (selectedThread && renameValue.trim()) {
      const updatedThreads = threads.map((thread) =>
        thread.id === selectedThread.id
          ? { ...thread, firstLine: renameValue.trim() }
          : thread
      );
      setThreads(updatedThreads);
      localStorage.setItem("mv_threads", JSON.stringify(updatedThreads));
    }
    setShowRenameModal(false);
    setSelectedThread(null);
    setRenameValue("");
  };

  const handleDelete = () => {
    if (selectedThread) {
      const updatedThreads = threads.filter(
        (thread) => thread.id !== selectedThread.id
      );
      setThreads(updatedThreads);
      localStorage.setItem("mv_threads", JSON.stringify(updatedThreads));
    }
    setShowDeleteModal(false);
    setSelectedThread(null);
  };

  //** reusable list item */
  function Item({ t }: { t: ChatThread }) {
    const isActive = t.id === activeId;
    const [isHovered, setIsHovered] = useState(false);

    const handleMenuAction = (action: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setOpenMenuId(null);

      switch (action) {
        case "star":
          console.log("Star thread:", t.id);
          break;
        case "rename":
          setSelectedThread(t);
          setRenameValue(t.firstLine);
          setShowRenameModal(true);
          break;
        case "delete":
          setSelectedThread(t);
          setShowDeleteModal(true);
          break;
      }
    };

    return (
      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          onClick={() => {
            onSelect(t.id);
            close?.();
          }}
          className={`block w-full truncate text-left px-3 py-2 my-0.5 rounded-lg transition relative
        ${
          isActive
            ? "bg-blue-50 text-blue-800 font-medium"
            : "hover:bg-gray-100"
        }`}
        >
          {/* Add gradient fade effect overlay */}
          <div
            className={`absolute right-0 top-0 bottom-0 w-20 pointer-events-none transition-opacity duration-200 ${
              isHovered || isActive || openMenuId === t.id
                ? "opacity-100"
                : "opacity-0"
            } ${
              isActive
                ? "bg-gradient-to-l from-blue-50 from-40% via-blue-50/60 via-blue-50/20 to-transparent"
                : "bg-gradient-to-l from-gray-100 from-40% via-gray-100/60 via-gray-100/20 to-transparent"
            }`}
          />
          <span className="pr-8">{t.firstLine}</span>
        </button>

        {/* Three dots menu button - now shows on hover OR when active */}
        {(isHovered || isActive || openMenuId === t.id) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuId(openMenuId === t.id ? null : t.id);
            }}
            className={`menu-button absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded transition-all duration-200 z-10 ${
              isActive ? "text-blue-600" : "text-gray-500"
            }`}
          >
            <MoreHorizontal size={16} />
          </button>
        )}

        {/* Dropdown menu */}
        {openMenuId === t.id && (
          <div className="dropdown-menu p-1 absolute right-2 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMenuAction("star", e);
              }}
              className="w-full text-left rounded-sm px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <Star size={14} />
              Star
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMenuAction("rename", e);
              }}
              className="w-full text-left rounded-sm px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <Edit size={14} />
              Rename
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMenuAction("delete", e);
              }}
              className="w-full text-left rounded-sm px-3 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}
      </div>
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
        className={`px-4 py-2 bg-white font-semibold text-gray-700 ${
          mobile ? "" : "pt-12"
        }`}
      >
        Chats
      </div>

      {/* New Chat Button */}
      <div className="px-2 py-2">
        <button
          onClick={() => {
            onNewChat();
            close?.();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors font-medium"
        >
          <Plus size={18} strokeWidth={2} />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        {threads.map((t) => (
          <Item key={t.id} t={t} />
        ))}
      </div>

      {showRenameModal && (
        <RenameChat
          renameValue={renameValue}
          setRenameValue={setRenameValue}
          onClose={() => {
            setShowRenameModal(false);
            setSelectedThread(null);
            setRenameValue("");
          }}
          handleRename={handleRename}
        />
      )}

      {showDeleteModal && (
        <DeleteChat
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedThread(null);
          }}
          handleDelete={handleDelete}
        />
      )}
    </aside>
  );
}
