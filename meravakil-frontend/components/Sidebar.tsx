"use client";
import { useEffect, useState } from "react";
import {
  X,
  Plus,
  MoreHorizontal,
  Star,
  Edit,
  Trash2,
  MessageSquare,
} from "lucide-react";

import RenameChat from "./Popup/Rename";
import DeleteChat from "./Popup/Delete";

export type ChatThread = {
  id: string;
  firstLine: string;
  isStarred?: boolean;
};

export default function Sidebar({
  activeId,
  onSelect,
  onNewChat,
  newThread,
  mobile,
  close,
}: {
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  newThread?: ChatThread | null;
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
    const loadThreads = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/chat/all`,
          {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const chats: { id: string; title: string; isStarred?: boolean }[] =
          await res.json();

        const mapped = chats.map((c) => ({
          id: c.id,
          firstLine: c.title,
          isStarred: c.isStarred || false,
        }));

        setThreads(mapped);
        localStorage.setItem("mv_threads", JSON.stringify(mapped));
      } catch (err) {
        console.error(
          "Failed to fetch chats, falling back to localStorage:",
          err
        );
      }
    };

    const saved = JSON.parse(
      localStorage.getItem("mv_threads") || "[]"
    ) as ChatThread[];
    if (saved.length) {
      setThreads(saved);
    }

    loadThreads();
  }, []);

  useEffect(() => {
    if (!newThread) return;
    setThreads((prev) => [newThread, ...prev]);
  }, [newThread]);

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

  const handleRename = async () => {
    if (!selectedThread || !renameValue.trim()) return;
    const newTitle = renameValue.trim();

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/rename`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            chatId: selectedThread.id,
            title: newTitle,
          }),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const updated = (await res.json()) as { id: string; title: string };
      const updatedThreads = threads.map((t) =>
        t.id === updated.id ? { ...t, firstLine: updated.title } : t
      );
      setThreads(updatedThreads);
      localStorage.setItem("mv_threads", JSON.stringify(updatedThreads));
      setShowRenameModal(false);
      setSelectedThread(null);
      setRenameValue("");
    } catch (err) {
      console.error("Failed to rename chat:", err);
    }
  };

  const handleDelete = async () => {
    if (!selectedThread) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/delete`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ chatId: selectedThread.id }),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const updatedThreads = threads.filter((t) => t.id !== selectedThread.id);
      setThreads(updatedThreads);
      localStorage.setItem("mv_threads", JSON.stringify(updatedThreads));
      setShowDeleteModal(false);
      setSelectedThread(null);
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  };

  const handleToggleStar = async (threadId: string) => {
    const current = threads.find((t) => t.id === threadId);
    if (!current) return;
    const newIsStarred = !current.isStarred;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/toggle-star`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ chatId: threadId, isStarred: newIsStarred }),
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const updated = (await res.json()) as {
        id: string;
        title: string;
        isStarred: boolean;
      };

      const syncedThreads = threads.map((thread) =>
        thread.id === updated.id
          ? { ...thread, isStarred: updated.isStarred }
          : thread
      );
      setThreads(syncedThreads);
      localStorage.setItem("mv_threads", JSON.stringify(syncedThreads));
    } catch (err) {
      console.error("Failed to toggle star:", err);
    }
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
          handleToggleStar(t.id);
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
        ${isActive ? "bg-blue-50 text-blue-800" : "hover:bg-gray-100"}`}
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
          <div className="flex items-center gap-2 pr-8">
            {t.isStarred && (
              <Star size={14} className="text-blue-600 fill-blue-600" />
            )}
            <span className="flex-1 truncate">{t.firstLine}</span>
          </div>
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
              {t.isStarred ? "Unstar" : "Star"}
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

  // Empty state component
  function EmptyState() {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
        <div className="mb-4 p-3 bg-gray-100 rounded-full">
          <MessageSquare size={24} className="text-gray-400" />
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          No Recent chats
        </h3>
      </div>
    );
  }

  const baseClass =
    "w-56 lg:w-64 shrink-0 border-r border-gray-200 bg-white flex-col h-screen pt-14";

  // Separate starred and regular chats
  const starredChats = threads.filter((t) => t.isStarred);
  const regularChats = threads.filter((t) => !t.isStarred);

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
        {threads.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Starred Chats Section */}
            {starredChats.length > 0 && (
              <div className="mb-4">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Starred
                </div>
                {starredChats.map((t) => (
                  <Item key={t.id} t={t} />
                ))}
              </div>
            )}

            {/* Regular Chats Section */}
            {regularChats.length > 0 && (
              <div>
                {starredChats.length > 0 && (
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recent
                  </div>
                )}
                {regularChats.map((t) => (
                  <Item key={t.id} t={t} />
                ))}
              </div>
            )}
          </>
        )}
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
