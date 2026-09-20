import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { FiMessageSquare, FiSend, FiBriefcase } from "react-icons/fi";
import toast from "react-hot-toast";
import client from "../../api/client";
import { useSocket } from "../../context/SocketContext";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";
import "./chat.css";

export default function ConversationHistory({
  initialConversationId,
  initialApplicationId,
  onClose,
}) {
  const currentUser = useSelector((s) => s.auth.user);
  const {
    socket,
    joinConversation,
    leaveConversation,
  } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Load conversation list
  const loadConversations = useCallback(async (selectId = null) => {
    try {
      setLoadingList(true);
      const { data } = await client.get("/conversations");
      const list = data.conversations || [];
      setConversations(list);

      if (selectId) {
        const found = list.find(
          (c) => String(c.id || c._id) === String(selectId),
        );
        if (found) setSelectedConversation(found);
      } else if (!selectedConversation && list.length > 0 && window.innerWidth >= 768) {
        // Auto-select first conversation on desktop
        setSelectedConversation(list[0]);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoadingList(false);
    }
  }, [selectedConversation]);

  // Initial setup: Handle direct conversation ID or application ID
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (initialApplicationId) {
        try {
          const { data } = await client.post(
            `/applications/${initialApplicationId}/conversation`,
          );
          if (isMounted && data.conversation) {
            setSelectedConversation(data.conversation);
            await loadConversations(data.conversation.id || data.conversation._id);
            return;
          }
        } catch (err) {
          console.error("Error creating/getting application conversation:", err);
        }
      }

      if (isMounted) {
        await loadConversations(initialConversationId);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [initialConversationId, initialApplicationId]);

  // Load messages when selected conversation changes
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    const convId = selectedConversation.id || selectedConversation._id;
    let isMounted = true;

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        joinConversation(convId);

        const { data } = await client.get(`/conversations/${convId}/messages`);
        if (isMounted) {
          setMessages(data.messages || []);

          // Clear unread count in local state
          setConversations((prev) =>
            prev.map((c) =>
              String(c.id || c._id) === String(convId) ? { ...c, unread: 0 } : c,
            ),
          );
        }
      } catch (error) {
        if (isMounted) {
          toast.error("Failed to load messages.");
        }
      } finally {
        if (isMounted) setLoadingMessages(false);
      }
    };

    fetchMessages();

    return () => {
      isMounted = false;
      leaveConversation(convId);
    };
  }, [selectedConversation, joinConversation, leaveConversation]);

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (data) => {
      const activeId = selectedConversation?.id || selectedConversation?._id;
      const isCurrentConv = String(data.conversationId) === String(activeId);

      // 1. Update message list if active
      if (isCurrentConv) {
        setMessages((prev) => {
          if (
            prev.some(
              (m) =>
                (m.id || m._id) === (data.message.id || data.message._id),
            )
          ) {
            return prev;
          }
          return [...prev, data.message];
        });

        // Mark as read in server
        socket.emit("mark_as_read", { conversationId: activeId });
      }

      // 2. Update conversation list preview & ordering
      setConversations((prev) => {
        const found = prev.find(
          (c) => String(c.id || c._id) === String(data.conversationId),
        );

        const previewText =
          data.message.text ||
          (data.message.attachments?.length
            ? `[Attachment: ${data.message.attachments[0].fileName}]`
            : "");

        if (!found) {
          // If brand new conversation not yet in list, reload list
          loadConversations(activeId);
          return prev;
        }

        const updated = {
          ...found,
          lastMessage: previewText,
          lastMessageAt: data.message.createdAt || new Date().toISOString(),
          unread: isCurrentConv ? 0 : (found.unread || 0) + 1,
        };

        const remaining = prev.filter(
          (c) => String(c.id || c._id) !== String(data.conversationId),
        );
        return [updated, ...remaining];
      });
    };

    const handleMessagesRead = (data) => {
      const activeId = selectedConversation?.id || selectedConversation?._id;
      if (String(data.conversationId) === String(activeId)) {
        setMessages((prev) =>
          prev.map((m) => ({
            ...m,
            readBy: Array.from(
              new Set([...(m.readBy || []), data.readByUserId]),
            ),
          })),
        );
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("messages_marked_read", handleMessagesRead);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("messages_marked_read", handleMessagesRead);
    };
  }, [socket, selectedConversation, loadConversations]);

  // Send message handler
  const handleSendMessage = async ({ text, attachments }) => {
    if (!selectedConversation) return;
    const convId = selectedConversation.id || selectedConversation._id;

    try {
      const { data } = await client.post(`/conversations/${convId}/messages`, {
        text,
        attachments,
      });

      const newMsg = data.message;
      setMessages((prev) => {
        if (
          prev.some(
            (m) => (m.id || m._id) === (newMsg.id || newMsg._id),
          )
        ) {
          return prev;
        }
        return [...prev, newMsg];
      });

      // Update conversation list preview
      setConversations((prev) => {
        const found = prev.find((c) => String(c.id || c._id) === String(convId));
        if (!found) return prev;

        const updated = {
          ...found,
          lastMessage: text || `[Attachment: ${attachments[0]?.fileName}]`,
          lastMessageAt: new Date().toISOString(),
        };

        const remaining = prev.filter((c) => String(c.id || c._id) !== String(convId));
        return [updated, ...remaining];
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send message.",
      );
      throw error;
    }
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const showListOnMobile = !selectedConversation;

  return (
    <div className="flex h-[750px] max-h-[85vh] w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
      {/* Left Panel: Conversation History List */}
      <div
        className={`${
          showListOnMobile ? "flex" : "hidden"
        } md:flex h-full w-full md:w-[320px] lg:w-[360px] flex-col shrink-0`}
      >
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversation?.id || selectedConversation?._id}
          loading={loadingList}
          currentUserId={currentUser?.id || currentUser?._id}
          onSelectConversation={(c) => setSelectedConversation(c)}
        />
      </div>

      {/* Right Panel: Chat Window or Empty State */}
      <div
        className={`${
          !showListOnMobile ? "flex" : "hidden"
        } md:flex h-full flex-1 flex-col overflow-hidden`}
      >
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            messages={messages}
            loading={loadingMessages}
            currentUser={currentUser}
            onSendMessage={handleSendMessage}
            onBack={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-950">
            <div className="mb-4 grid h-20 w-20 place-items-center rounded-3xl bg-brand/10 text-4xl text-brand dark:bg-brand/20">
              <FiMessageSquare />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
              Select a conversation
            </h3>
            <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              Choose a conversation from the left to start chatting with candidates or hiring managers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
