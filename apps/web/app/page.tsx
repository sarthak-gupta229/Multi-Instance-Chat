"use client";
import { useSocket } from "./context/SocketProvider";
import { useState } from "react";

export default function Home() {
  const { sendMessage, messages } = useSocket();
  const [msg, setMsg] = useState("");
  return (
    <>
      <main className="flex h-dvh justify-center bg-gray-100 p-4">
        <section className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-sm">
          <header className="border-b border-gray-200 px-5 py-4">
            <h1 className="text-lg font-semibold text-gray-900">Chat Room</h1>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg, index) => (
              <div key={index} className="rounded-lg bg-blue-100 px-4 py-2">
                {msg}
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (msg.trim()) {
                sendMessage(msg);
                setMsg("");
              }
            }}
            className="flex items-center gap-3 border-t border-gray-200 p-4"
          >
            <input
              type="text"
              value={msg}
              placeholder="Type a message..."
              onChange={(e) => setMsg(e.target.value)}
              className="min-w-0 flex-1 rounded-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />

            <button
              type="submit"
              className="rounded-full bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              Send
            </button>
          </form>
        </section>
      </main>
    </>
  );
}
