/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useRef, useEffect } from "react";
import { Send, User, Bot, RefreshCw } from "lucide-react";

export const InterviewSimulator = () => {
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; content: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const startInterview = async () => {
    setStarted(true);
    setLoading(true);

    const initialPrompt: { role: "user" | "ai"; content: string } = {
      role: "user",
      content: "Dzień dobry, przyszedłem na rozmowę o pracę.",
    };

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [initialPrompt], questionCount: 0 }),
      });

      const data = await response.json();

      setMessages([initialPrompt, { role: "ai", content: data.content }]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user" as const, content: input };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          questionCount: messages.filter((m) => m.role === "ai").length,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Błąd serwera");
      }

      setMessages([...newMessages, { role: "ai", content: data.content }]);
    } catch (error: any) {
      console.error("Błąd komunikacji:", error);
      setMessages([
        ...newMessages,
        {
          role: "ai",
          content: `❌ Błąd: ${error.message}. Sprawdź czy model AI jest poprawny.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-none sm:rounded-2xl overflow-hidden shadow-2xl flex-1 flex flex-col w-full min-h-[70vh] max-h-[85vh]">
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Bot className="text-red-500" /> Symulator Rekrutera
        </h2>
        {started && (
          <span className="text-xs text-slate-400 bg-slate-950 px-2 py-1 rounded">
            Pytanie: {messages.filter((m) => m.role === "ai").length} / 10
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {!started ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-4">
            <p className="text-slate-400">
              Jesteś gotowy na swoją pierwszą rozmowę rekrutacyjną?
            </p>
            <button
              onClick={startInterview}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105"
            >
              Rozpocznij rozmowę
            </button>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700"
                }`}
              >
                <p className="text-sm">{m.content}</p>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="text-slate-500 text-xs animate-pulse">
            Zły rekruter notuje Twoje błędy...
          </div>
        )}
      </div>

      {started && (
        <div className="p-4 bg-slate-800 border-t border-slate-700 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Wpisz swoją odpowiedź..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-red-500"
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-600 p-2 rounded-xl text-white hover:bg-blue-500 disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      )}
    </div>
  );
};
