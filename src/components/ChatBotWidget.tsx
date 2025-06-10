import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function ChatBotWidget({ userId, role }: { userId: number; role: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<{ from: "user" | "bot"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: { from: "user"; text: string } = { from: "user", text: message };
    setHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await invoke<string>("chatbot_query", {
        message,
        userId,
        role,
      });
      setHistory((prev) => [...prev, { from: "bot", text: response }]);
    } catch (err) {
        console.error("Erreur chatbot_query :", err);
      setHistory((prev) => [...prev, { from: "bot", text: "❌ Erreur lors de la requête." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 bg-green-600 hover:bg-green-700 text-white rounded-full p-3 shadow-lg z-50"
      >
        💬
      </button>

      {open && (
        <div className="fixed bottom-20 right-4 w-80 bg-white text-black dark:bg-zinc-800 dark:text-white border dark:border-zinc-700 rounded-xl shadow-xl p-4 flex flex-col gap-2 z-50">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-lg">Assistant IA 🤖</h2>
            <button onClick={() => setOpen(false)}>✖</button>
          </div>

          <div className="flex flex-col gap-1 overflow-y-auto max-h-64 text-sm">
            {history.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg whitespace-pre-wrap text-black dark:text-white ${
                    msg.from === "user"
                    ? "bg-green-100 dark:bg-green-900 self-end"
                    : "bg-zinc-200 dark:bg-zinc-700 self-start"
                }`}
                >
                {msg.text}
                </div>
            ))}
            {loading && <div className="text-xs italic">Le bot réfléchit...</div>}
          </div>

          <div className="flex mt-2 gap-2">
            <input
            className="flex-1 p-2 text-sm border rounded 
                        bg-white text-black placeholder:text-black 
                        dark:bg-zinc-700 dark:text-white dark:placeholder:text-zinc-400 
                        dark:border-zinc-600"
            placeholder="Posez une question..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-green-600 text-white px-3 rounded hover:bg-green-700"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
