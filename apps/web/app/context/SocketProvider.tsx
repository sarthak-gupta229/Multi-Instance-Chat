"use client";
import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";

interface SocketProviderProps {
  children?: React.ReactNode;
}
interface ISocketContext {
  sendMessage: (msg: string) => any;
  messages: string[];
}

const SocketContext = createContext<ISocketContext | null>(null);

export const useSocket = () => {
  const state = useContext(SocketContext);

  if (!state) throw new Error("state is undefined");
  return state;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const sendMessage: ISocketContext["sendMessage"] = useCallback(
    (msg) => {
      console.log("Sent Message", msg);
      if (socket) {
        socket.emit("event:message", { message: msg });
      }
    },
    [socket],
  );

  const MessageRec = useCallback((msg: string) => {
    console.log("Received Message", msg);
    const { message } = JSON.parse(msg) as { message: string };
    setMessages((prev) => [...prev, message]);
  }, []);

  useEffect(() => {
    const port =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("port") || "8000"
        : "8000";
    const _socket = io(`http://localhost:${port}`);
    _socket.on("message", MessageRec);
    setSocket(_socket);

    return () => {
      _socket.disconnect();
      _socket.off("message", MessageRec);
      setSocket(null);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ sendMessage, messages }}>
      {children}
    </SocketContext.Provider>
  );
};
