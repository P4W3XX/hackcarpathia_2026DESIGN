/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, Loader2, User, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
          content: `Błąd: ${error.message}. Sprawdź czy model AI jest poprawny.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const aiCount = messages.filter((m) => m.role === "ai").length;

  return (
    <Card className="overflow-hidden flex flex-col min-h-[70vh] max-h-[85vh] p-0 gap-0">
      <div className="bg-card border-b border-border p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-md bg-accent text-primary">
            <Bot className="size-5" />
          </div>
          <h2 className="text-base font-semibold text-foreground">
            Symulator Rekrutera
          </h2>
        </div>
        {started && (
          <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            Pytanie {aiCount} / 10
          </span>
        )}
      </div>

      <div
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30"
        ref={scrollRef}
      >
        {!started ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center gap-4">
            <div className="size-16 rounded-full bg-accent text-primary flex items-center justify-center">
              <Bot className="size-7" />
            </div>
            <p className="text-muted-foreground max-w-sm">
              Jesteś gotowy na swoją pierwszą rozmowę rekrutacyjną?
            </p>
            <Button onClick={startInterview} size="lg">
              <Play className="size-4" />
              Rozpocznij rozmowę
            </Button>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-2",
                m.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              {m.role === "ai" && (
                <div className="flex size-7 items-center justify-center rounded-md bg-accent text-primary shrink-0 mt-1">
                  <Bot className="size-4" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] px-3.5 py-2 rounded-lg text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-card text-foreground border border-border rounded-tl-sm",
                )}
              >
                {m.content}
              </div>
              {m.role === "user" && (
                <div className="flex size-7 items-center justify-center rounded-md bg-foreground text-background shrink-0 mt-1">
                  <User className="size-4" />
                </div>
              )}
            </div>
          ))
        )}
        {loading && started && (
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Loader2 className="size-3.5 animate-spin" />
            Rekruter pisze odpowiedź...
          </div>
        )}
      </div>

      {started && (
        <div className="p-3 bg-card border-t border-border flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Wpisz swoją odpowiedź..."
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            size="icon"
            aria-label="Wyślij"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      )}
    </Card>
  );
};
