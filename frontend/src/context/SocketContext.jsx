import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { getSocket, disconnectSocket } from "../socket/socket";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const token = useSelector((s) => s.auth.token);
  const user = useSelector((s) => s.auth.user);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState({}); // { [conversationId]: { userId, userName } }
  const activeConversationRef = useRef(null);

  useEffect(() => {
    if (!token || !user) {
      disconnectSocket();
      setSocket(null);
      setConnected(false);
      setOnlineUsers(new Set());
      return;
    }

    const socketInstance = getSocket(token);
    setSocket(socketInstance);

    if (!socketInstance.connected) {
      socketInstance.connect();
    }

    const onConnect = () => {
      setConnected(true);
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onOnlineUsersList = (usersList) => {
      setOnlineUsers(new Set(usersList));
    };

    const onUserStatusChanged = ({ userId, isOnline, onlineUserIds }) => {
      if (onlineUserIds) {
        setOnlineUsers(new Set(onlineUserIds));
      } else {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          if (isOnline) next.add(userId);
          else next.delete(userId);
          return next;
        });
      }
    };

    const onUserTyping = ({ conversationId, userId, userName }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [conversationId]: { userId, userName },
      }));
    };

    const onUserStopTyping = ({ conversationId }) => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[conversationId];
        return next;
      });
    };

    const onNewMessageNotification = ({ conversationId, jobTitle, senderName, message }) => {
      // If user is not currently in this conversation room, show a brief toast
      if (activeConversationRef.current !== conversationId) {
        toast((t) => (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs font-bold text-brand">{jobTitle || "New Message"}</p>
              <p className="text-sm font-semibold">{senderName}:</p>
              <p className="line-clamp-1 text-xs text-slate-500">{message.text || "Attachment received"}</p>
            </div>
          </div>
        ), { id: `msg_${conversationId}` });
      }
    };

    const onApplicationStatusUpdated = ({ jobTitle, status, note }) => {
      toast.success(
        `Application update: "${jobTitle}" status changed to ${status}${note ? ` (${note})` : ""}`,
        { duration: 5000 }
      );
    };

    socketInstance.on("connect", onConnect);
    socketInstance.on("disconnect", onDisconnect);
    socketInstance.on("online_users_list", onOnlineUsersList);
    socketInstance.on("user_status_changed", onUserStatusChanged);
    socketInstance.on("user_typing", onUserTyping);
    socketInstance.on("user_stop_typing", onUserStopTyping);
    socketInstance.on("new_message_notification", onNewMessageNotification);
    socketInstance.on("application_status_updated", onApplicationStatusUpdated);

    return () => {
      socketInstance.off("connect", onConnect);
      socketInstance.off("disconnect", onDisconnect);
      socketInstance.off("online_users_list", onOnlineUsersList);
      socketInstance.off("user_status_changed", onUserStatusChanged);
      socketInstance.off("user_typing", onUserTyping);
      socketInstance.off("user_stop_typing", onUserStopTyping);
      socketInstance.off("new_message_notification", onNewMessageNotification);
      socketInstance.off("application_status_updated", onApplicationStatusUpdated);
    };
  }, [token, user]);

  const joinConversation = useCallback(
    (conversationId) => {
      if (!socket || !conversationId) return;
      activeConversationRef.current = conversationId;
      socket.emit("join_conversation", conversationId);
    },
    [socket],
  );

  const leaveConversation = useCallback(
    (conversationId) => {
      if (!socket || !conversationId) return;
      if (activeConversationRef.current === conversationId) {
        activeConversationRef.current = null;
      }
      socket.emit("leave_conversation", conversationId);
    },
    [socket],
  );

  const emitTyping = useCallback(
    (conversationId) => {
      if (!socket || !conversationId) return;
      socket.emit("typing", {
        conversationId,
        userName: user?.name,
      });
    },
    [socket, user?.name],
  );

  const emitStopTyping = useCallback(
    (conversationId) => {
      if (!socket || !conversationId) return;
      socket.emit("stop_typing", { conversationId });
    },
    [socket],
  );

  const isUserOnline = useCallback(
    (userId) => {
      if (!userId) return false;
      return onlineUsers.has(String(userId));
    },
    [onlineUsers],
  );

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        onlineUsers,
        typingUsers,
        isUserOnline,
        joinConversation,
        leaveConversation,
        emitTyping,
        emitStopTyping,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext) || {};
