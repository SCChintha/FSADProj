import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { apiRequest } from "../apiClient";
import { useAuth } from "../AuthContext";

function normalizeMessage(message, currentUserId) {
  return {
    id: message.id || `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    senderId: message.senderId,
    senderName: message.senderName || "Unknown",
    content: message.content || "",
    type: (message.type || "TEXT").toLowerCase(),
    createdAt: message.createdAt || new Date().toISOString(),
    read: Boolean(message.read),
    isMine: String(message.senderId) === String(currentUserId),
    fileName: message.fileName || "",
    fileType: message.fileType || "",
    optimistic: Boolean(message.optimistic),
  };
}

export default function useChat({ appointmentId, socket }) {
  const { token, user } = useAuth();
  const typingTimeoutRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!appointmentId || !token) {
      return undefined;
    }

    let cancelled = false;
    setIsLoading(true);
    apiRequest(`/api/chat/${appointmentId}?page=1`, { token })
      .then((data) => {
        if (!cancelled) {
          setMessages((data || []).map((entry) => normalizeMessage(entry, user?.user_id)));
        }
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) {
          toast.error(error.message || "Failed to load chat history.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    socket?.emit("join-room", { roomId: `appointment-chat-${appointmentId}` });

    return () => {
      cancelled = true;
      socket?.emit("leave-room", { roomId: `appointment-chat-${appointmentId}` });
    };
  }, [appointmentId, socket, token, user?.user_id]);

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    const onMessage = (payload) => {
      if (String(payload?.appointmentId) !== String(appointmentId)) {
        return;
      }
      const normalized = normalizeMessage(payload, user?.user_id);
      setMessages((current) => [...current, normalized]);
      if (!normalized.isMine) {
        setUnreadCount((current) => current + 1);
      }
    };

    const onTyping = (payload) => {
      if (String(payload?.appointmentId) !== String(appointmentId) || String(payload?.userId) === String(user?.user_id)) {
        return;
      }
      setTypingUsers((current) => Array.from(new Set([...current, payload.name || payload.userName || "Someone"])));
    };

    const onStopTyping = (payload) => {
      if (String(payload?.appointmentId) !== String(appointmentId)) {
        return;
      }
      setTypingUsers((current) => current.filter((name) => name !== (payload.name || payload.userName || "Someone")));
    };

    const onRead = (payload) => {
      if (String(payload?.appointmentId) !== String(appointmentId)) {
        return;
      }
      setMessages((current) => current.map((message) => (
        payload.messageIds?.includes?.(message.id) ? { ...message, read: true } : message
      )));
    };

    socket.on("chat-message-received", onMessage);
    socket.on("chat-typing", onTyping);
    socket.on("chat-stop-typing", onStopTyping);
    socket.on("chat-messages-read", onRead);

    return () => {
      socket.off("chat-message-received", onMessage);
      socket.off("chat-typing", onTyping);
      socket.off("chat-stop-typing", onStopTyping);
      socket.off("chat-messages-read", onRead);
    };
  }, [appointmentId, socket, user?.user_id]);

  const sendMessage = async (content, type = "text", metadata = {}) => {
    const optimistic = normalizeMessage({
      senderId: user?.user_id,
      senderName: user?.name,
      content,
      type,
      createdAt: new Date().toISOString(),
      optimistic: true,
      ...metadata,
    }, user?.user_id);

    setMessages((current) => [...current, optimistic]);
    try {
      socket?.emit("chat-message", {
        appointmentId,
        content,
        type: type.toUpperCase(),
        senderId: user?.user_id,
        senderName: user?.name,
        ...metadata,
      });
      return optimistic;
    } catch (error) {
      setMessages((current) => current.filter((message) => message.id !== optimistic.id));
      toast.error("Message failed to send.");
      throw error;
    }
  };

  const sendFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}/api/chat/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = await response.json();
      await sendMessage(data.fileUrl, "file", { fileName: data.fileName, fileType: data.fileType });
    } catch (error) {
      console.error(error);
      toast.error(error.message || "File upload failed.");
    }
  };

  const markAsRead = () => {
    setUnreadCount(0);
    socket?.emit("chat-read", {
      appointmentId,
      messageIds: messages.filter((message) => !message.read && !message.isMine).map((message) => message.id),
    });
  };

  const sendTyping = () => {
    socket?.emit("chat-typing", { appointmentId, userId: user?.user_id, name: user?.name });
    window.clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => {
      socket?.emit("chat-stop-typing", { appointmentId, userId: user?.user_id, name: user?.name });
    }, 300);
  };

  const groupedMessages = useMemo(() => messages, [messages]);

  return {
    messages: groupedMessages,
    isLoading,
    typingUsers,
    unreadCount,
    sendMessage,
    sendFile,
    markAsRead,
    sendTyping,
    stopTyping: () => socket?.emit("chat-stop-typing", { appointmentId, userId: user?.user_id, name: user?.name }),
  };
}
