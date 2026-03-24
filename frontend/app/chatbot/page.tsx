"use client";
import { useEffect, useRef, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { resumeApi, streamChat } from "@/lib/api";
import { Resume } from "@/types";
import { Send, Loader2, Bot, User, Sparkles } from "lucide-react";

interface Message { role: "user" | "assistant"; content: string; }
const F = "#0A3D3D", C = "#C08552";


function MarkdownMessage({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: "ol" | "ul" | null = null;

  const flushList = () => {
    if (listItems.length === 0) return;
    if (listType === "ol") {
      elements.push(
        <ol key={elements.length} className="list-decimal ml-4 space-y-1 my-2">
          {listItems.map((item, i) => <li key={i} className="text-sm leading-relaxed" style={{ color: "#0D1F1F" }} dangerouslySetInnerHTML={{ __html: formatInline(item) }}/>)}
        </ol>
      );
    } else {
      elements.push(
        <ul key={elements.length} className="list-disc ml-4 space-y-1 my-2">
          {listItems.map((item, i) => <li key={i} className="text-sm leading-relaxed" style={{ color: "#0D1F1F" }} dangerouslySetInnerHTML={{ __html: formatInline(item) }}/>)}
        </ul>
      );
    }
    listItems = []; listType = null;
  };

  lines.forEach((line, i) => {
    const olMatch = line.match(/^\d+\.\s+(.+)/);
    const ulMatch = line.match(/^[-*]\s+(.+)/);
    const h3Match = line.match(/^###\s+(.+)/);
    const h2Match = line.match(/^##\s+(.+)/);
    const h1Match = line.match(/^#\s+(.+)/);

    if (olMatch) { if (listType !== "ol") { flushList(); listType = "ol"; } listItems.push(olMatch[1]); return; }
    if (ulMatch) { if (listType !== "ul") { flushList(); listType = "ul"; } listItems.push(ulMatch[1]); return; }
    flushList();

    if (h3Match || h2Match || h1Match) {
      const text = (h3Match || h2Match || h1Match)![1];
      elements.push(<p key={i} className="font-semibold mt-3 mb-1 text-sm" style={{ color: "#0A3D3D" }} dangerouslySetInnerHTML={{ __html: formatInline(text) }}/>);
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2"/>);
    } else {
      elements.push(<p key={i} className="text-sm leading-relaxed" style={{ color: "#0D1F1F" }} dangerouslySetInnerHTML={{ __html: formatInline(line) }}/>);
    }
  });
  flushList();
  return <div className="space-y-0.5">{elements}</div>;
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#0A3D3D;font-weight:600">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(10,61,61,0.08);padding:1px 5px;border-radius:4px;font-size:12px;font-family:monospace">$1</code>');
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your AI career advisor powered by Dalence. I can help with resume tips, career guidance, interview prep, and skill recommendations. What would you like to work on today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    resumeApi.list().then(r => {
      const analyzed = r.data.filter((x: Resume) => x.status === "analyzed");
      setResumes(analyzed);
      if (analyzed.length > 0) setResumeId(analyzed[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);
    try {
      await streamChat(
        [...messages, { role: "user", content: userMsg }],
        resumeId,
        chunk => setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: updated[updated.length - 1].content + chunk };
          return updated;
        })
      );
    } catch { setMessages(prev => { const u = [...prev]; u[u.length-1].content = "Sorry, something went wrong. Please try again."; return u; }); }
    finally { setLoading(false); }
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const suggestions = ["How can I improve my resume?", "What skills should I learn for full stack?", "How do I prepare for a technical interview?", "What career paths suit my skills?"];

  return (
    <AppShell>
      <div className="min-h-screen flex flex-col" style={{ background: "#FBF9F6" }}>
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between" style={{ background: "white", borderBottom: "1px solid rgba(10,61,61,0.08)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0A3D3D, #7BA89A)" }}>
              <Bot className="w-5 h-5 text-white"/>
            </div>
            <div>
              <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, color: "#0D1F1F" }}>AI Career Advisor</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#7BA89A" }}/>
                <span className="text-xs" style={{ color: "#5A7575" }}>Online · Ready to help</span>
              </div>
            </div>
          </div>
          {resumes.length > 0 && (
            <select value={resumeId || ""} onChange={e => setResumeId(e.target.value || null)}
              className="text-sm px-3 py-2 rounded-xl outline-none" style={{ border: "1px solid rgba(10,61,61,0.15)", background: "#F3F0EA", color: "#0D1F1F" }}>
              <option value="">No resume context</option>
              {resumes.map(r => <option key={r.id} value={r.id}>{r.filename}</option>)}
            </select>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4" style={{ maxHeight: "calc(100vh - 220px)" }}>
          {messages.length === 1 && (
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#5A7575" }}>Suggested questions</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map(s => (
                  <button key={s} onClick={() => { setInput(s); inputRef.current?.focus(); }}
                    className="text-sm px-4 py-2 rounded-xl border transition-all"
                    style={{ background: "white", borderColor: "rgba(10,61,61,0.12)", color: "#2A4545" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(10,61,61,0.04)"; e.currentTarget.style.borderColor = "rgba(10,61,61,0.2)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "rgba(10,61,61,0.12)"; }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: msg.role === "assistant" ? "linear-gradient(135deg, #0A3D3D, #7BA89A)" : "rgba(192,133,82,0.15)" }}>
                {msg.role === "assistant" ? <Bot className="w-4 h-4 text-white"/> : <User className="w-4 h-4" style={{ color: C }}/>}
              </div>
              <div className="max-w-[75%]">
                <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={{ background: msg.role === "user" ? F : "white", color: msg.role === "user" ? "white" : "#0D1F1F", border: msg.role === "assistant" ? "1px solid rgba(10,61,61,0.08)" : "none", boxShadow: msg.role === "assistant" ? "0 2px 8px rgba(10,61,61,0.04)" : "none" }}>
                  {!msg.content
                    ? <span className="flex gap-1"><span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#5A7575", animationDelay: "0ms" }}/><span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#5A7575", animationDelay: "150ms" }}/><span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#5A7575", animationDelay: "300ms" }}/></span>
                    : msg.role === "user"
                    ? <span>{msg.content}</span>
                    : <MarkdownMessage content={msg.content} />
                  }
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef}/>
        </div>

        {/* Input */}
        <div className="px-8 pb-6 pt-3" style={{ borderTop: "1px solid rgba(10,61,61,0.07)", background: "white" }}>
          <div className="flex gap-3 items-end rounded-2xl p-3" style={{ border: "2px solid rgba(10,61,61,0.15)", background: "#F3F0EA" }}>
            <textarea ref={inputRef} rows={1} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
              placeholder="Ask me anything about your career…"
              className="flex-1 resize-none bg-transparent text-sm outline-none leading-relaxed"
              style={{ color: "#0D1F1F", maxHeight: 120 }}/>
            <button onClick={handleSend} disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
              style={{ background: F }}
              onMouseEnter={e => { if (!loading && input.trim()) e.currentTarget.style.background = C; }}
              onMouseLeave={e => { e.currentTarget.style.background = F; }}>
              {loading ? <Loader2 className="w-4 h-4 text-white animate-spin"/> : <Send className="w-4 h-4 text-white"/>}
            </button>
          </div>
          <p className="text-xs text-center mt-2" style={{ color: "rgba(10,61,61,0.3)" }}>Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </AppShell>
  );
}