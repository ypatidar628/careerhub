import { useState, useMemo } from "react";
import { FiSearch, FiMessageSquare, FiX } from "react-icons/fi";
import { useSocket } from "../../context/SocketContext";
import ConversationItem from "./ConversationItem";

export default function ConversationList({
  conversations,
  selectedId,
  loading,
  currentUserId,
  onSelectConversation,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const { isUserOnline } = useSocket();

  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations;
    const q = searchTerm.toLowerCase().trim();

    return conversations.filter((c) => {
      const otherUser =
        c.otherUser ||
        c.participants?.find(
          (p) => String(p._id || p.id) !== String(currentUserId),
        );
      const name = (otherUser?.name || "").toLowerCase();
      const jobTitle = (c.jobTitle || "").toLowerCase();
      const company = (c.jobId?.company || c.company || "").toLowerCase();
      const lastMsg = (c.lastMessage || "").toLowerCase();

      return (
        name.includes(q) ||
        jobTitle.includes(q) ||
        company.includes(q) ||
        lastMsg.includes(q)
      );
    });
  }, [conversations, searchTerm, currentUserId]);

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Header & Search Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FiMessageSquare className="text-brand" /> Messages
          </h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {conversations.length}
          </span>
        </div>

        {/* Search Box */}
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search conversations..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-9 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-800"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Clear search"
            >
              <FiX className="text-xs" />
            </button>
          )}
        </div>
      </div>

      {/* Conversation Items List */}
      <div className="flex-1 overflow-y-auto chat-scrollbar divide-y divide-slate-100 dark:divide-slate-800/60">
        {loading && (
          <div className="space-y-3 p-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 animate-pulse p-2 rounded-2xl"
              >
                <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-3/4 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="h-2.5 w-1/2 rounded-full bg-slate-100 dark:bg-slate-800/60" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-2xl text-brand dark:bg-brand/20">
              <FiMessageSquare />
            </div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No conversations yet
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-[200px]">
              Your conversations with candidates or recruiters will appear here.
            </p>
          </div>
        )}

        {!loading && conversations.length > 0 && filteredConversations.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No conversations found
            </p>
            <p className="mt-1 text-xs text-slate-500">
              No chats matching "{searchTerm}"
            </p>
          </div>
        )}

        {!loading &&
          filteredConversations.map((c) => {
            const otherUser =
              c.otherUser ||
              c.participants?.find(
                (p) => String(p._id || p.id) !== String(currentUserId),
              );
            const otherUserId = otherUser?._id || otherUser?.id;
            const online = isUserOnline(otherUserId);
            const isSelected = String(c.id || c._id) === String(selectedId);

            return (
              <ConversationItem
                key={c.id || c._id}
                conversation={c}
                isSelected={isSelected}
                isOnline={online}
                currentUserId={currentUserId}
                onClick={() => onSelectConversation(c)}
              />
            );
          })}
      </div>
    </div>
  );
}
