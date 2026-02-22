"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

export default function FloatingChatBot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("chat_history");
    if (saved) setChat(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("chat_history", JSON.stringify(chat));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setChat((prev) => [...prev, { role: "user", text: message }]);
    setLoading(true);
    const msg = message;
    setMessage("");

    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: msg,
        }),
      });

      const data = await res.json();
      setChat((prev) => [...prev, { role: "assistant", text: data.answer }]);
    } catch {
      setChat((prev) => [...prev, { role: "assistant", text: "Server error" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 p-4 rounded-full shadow-lg hover:bg-blue-700"
      >
        <MessageCircle />
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-20 right-6 w-[320px] h-[450px] bg-zinc-900 border border-zinc-700 rounded-xl flex flex-col shadow-xl">
          <div className="flex justify-between items-center p-3 border-b border-zinc-700">
            <span className="font-semibold text-white">AI Assistant</span>
            <X className="cursor-pointer" onClick={() => setOpen(false)} />
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
            {chat.map((c, i) => (
              <div
                key={i}
                className={`flex ${c.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-3 py-2 rounded-xl max-w-[80%] ${
                    c.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-700 text-white"
                  }`}
                >
                  {c.text}
                </div>
              </div>
            ))}
            {loading && <p className="text-zinc-400">Thinking...</p>}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={sendMessage}
            className="p-2 border-t border-zinc-700 flex gap-2"
          >
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask..."
              className="flex-1 bg-zinc-800 text-white px-3 py-2 rounded-full outline-none"
            />
            <button className="bg-blue-600 px-4 rounded-full">Send</button>
          </form>
        </div>
      )}
    </>
  );
}
