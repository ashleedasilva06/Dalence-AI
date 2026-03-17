"use client";
import { useEffect, useRef, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { resumeApi } from "@/lib/api";
import { Resume, ChatMessage } from "@/types";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { clsx } from "clsx";

const STARTERS = [
  "What career paths suit a fresh MCA graduate?",
  "How do I improve my resume for a data scientist role?",
  "What skills should I learn to become an AI engineer?",
  "How should I prepare for a technical interview?",
];

export default function ChatbotPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    resumeApi.list().then((r) => {
      const analyzed = r.data.filter((x: Resume) => x.status === "analyzed");
      setResumes(analyzed);
      if (analyzed.length > 0) setSelectedResumeId(analyzed[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || streaming) return;
    setInput("");

    const userMsg: ChatMessage = { role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setStreaming(true);

    // Add empty assistant message to stream into
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const token = localStorage.getItem("token") || "";
      abortRef.current = new AbortController();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/chat/stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            messages: newMessages,
            resume_id: selectedResumeId || null,
          }),
          signal: abortRef.current.signal,
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response body");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          setMessages((m) => {
            const copy = [...m];
            const last = copy[copy.length - 1];
            copy[copy.length - 1] = {
              ...last,
              content: last.content + chunk,
            };
            return copy;
          });
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = {
            ...copy[copy.length - 1],
            content: "Sorry, something went wrong. Please try again.",
          };
          return copy;
        });
      }
    } finally {
      setStreaming(false);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-8 py-4 flex items-center gap-4 flex-shrink-0">
          <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">AI Career Advisor</h1>
            <p className="text-xs text-gray-500">Powered by Gemini</p>
          </div>
          {resumes.length > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-gray-500">Resume context:</span>
              <select
                className="input text-xs max-w-[180px] py-1.5"
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
              >
                <option value="">None</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>{r.filename}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Bot className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Your AI Career Advisor</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Ask me anything about careers, skills, resume, or interviews
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="p-4 text-left text-sm text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-brand-300 hover:bg-brand-50 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={clsx(
                "flex gap-3 max-w-3xl",
                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={clsx(
                "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",
                msg.role === "user" ? "bg-brand-100" : "bg-purple-100"
              )}>
                {msg.role === "user"
                  ? <User className="w-4 h-4 text-brand-700" />
                  : <Bot className="w-4 h-4 text-purple-700" />
                }
              </div>
              <div className={clsx(
                "px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[80%] whitespace-pre-wrap",
                msg.role === "user"
                  ? "bg-brand-600 text-white rounded-tr-sm"
                  : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm"
              )}>
                {msg.content
                  ? msg.content
                  : streaming && i === messages.length - 1
                    ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    : null
                }
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 bg-white px-8 py-4 flex-shrink-0">
          <div className="flex gap-3 max-w-3xl mx-auto">
            <input
              className="input flex-1"
              placeholder="Ask anything about your career…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={streaming}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || streaming}
              className="btn-primary px-4"
            >
              {streaming
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />
              }
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}