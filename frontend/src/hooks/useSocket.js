import { useEffect, useRef, useState } from "react";
import { useAuth } from "../AuthContext";

function createFallbackSocket() {
  const listeners = new Map();

  return {
    connected: true,
    on(event, handler) {
      const key = `antifsad:${event}`;
      const wrapped = (customEvent) => handler(customEvent.detail);
      listeners.set(handler, { key, wrapped });
      window.addEventListener(key, wrapped);
    },
    off(event, handler) {
      const entry = listeners.get(handler);
      if (entry) {
        window.removeEventListener(entry.key, entry.wrapped);
        listeners.delete(handler);
      }
    },
    emit(event, payload) {
      window.dispatchEvent(new CustomEvent(`antifsad:${event}`, { detail: payload }));
    },
    disconnect() {
      listeners.forEach(({ key, wrapped }) => window.removeEventListener(key, wrapped));
      listeners.clear();
    },
  };
}

export default function useSocket() {
  const { token, user } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token || !user?.user_id) {
      setIsConnected(false);
      socketRef.current?.disconnect?.();
      socketRef.current = null;
      return undefined;
    }

    const socket = createFallbackSocket();
    socketRef.current = socket;
    setIsConnected(true);
    socket.emit("presence-online", { userId: user.user_id });
    socket.emit("join-user-room", { userId: user.user_id, token });

    return () => {
      socket.emit("presence-offline", { userId: user.user_id });
      socket.disconnect();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
      setIsConnected(false);
    };
  }, [token, user]);

  return {
    socket: socketRef.current,
    isConnected,
    joinRoom: (roomId) => socketRef.current?.emit("join-room", { roomId }),
    leaveRoom: (roomId) => socketRef.current?.emit("leave-room", { roomId }),
    emit: (event, payload) => socketRef.current?.emit(event, payload),
  };
}
