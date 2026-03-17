"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { interviewApi, resumeApi } from "@/lib/api";
import { Resume } from "@/types";
import {
  Loader2, ChevronDown, ChevronUp, Lightbulb,
  Code2, Users, Zap, BookOpen, CheckCircle2, Star
} from "lucide-react";
import toast from "react-hot-toast";
import { clsx } from "clsx";

const EXPERIENCE_LEVELS = [
  { value: "fresher", label: "Fresher (0-1 yr)" },
  { value: "junior", label: "Junior (1-3 yrs)" },
  { value: "mid", label: "Mid-level (3-5 yrs)" },
  { value: "senior", label: "Senior (5+ yrs)" },
];

const POPULAR_ROLES = [
  "Full Stack Developer", "Data Scientist", "AI/ML Engineer",
  "Backend Developer", "Frontend Developer", "DevOps Engineer",
  "Data Analyst", "Mobile Developer", "Cybersecurity Analyst",
];

const DIFFICULTY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  easy:   { color: "#16a34a", bg: "#f0fdf4", label: "Easy" },
  medium: { color: "#d97706", bg: "#fffbeb", label: "Medium" },
  hard:   { color: "#dc2626", bg: "#fef2f2", label: "Hard" },
};

interface Question {
  question: string;
  difficulty?: string;
  topic?: string;
  category?: string;
  model_answer: string;
  tip: string;
}

interface InterviewData {
  job_role: string;
  experience_level: string;
  technical_questions: Question[];
  hr_questions: Question[];
  preparation_tips: string[];
}

export default function InterviewPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [expLevel, setExpLevel] = useState("fresher");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InterviewData | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"technical" | "hr">("technical");
  const [savedAnswers, setSavedAnswers] = useState<Record<string, string>>({});
  const [showAnswer, setShowAnswer] = useState<Record<string, boolean>>({});

  useEffect(() => {
    resumeApi.list().then(r => {
      const analyzed = r.data.filter((x: Resume) => x.status === "analyzed");
      setResumes(analyzed);
      if (analyzed.length > 0) setSelectedResumeId(analyzed[0].id);
    }).catch(() => {});
  }, []);

  const handleGenerate = async () => {
    const role = customRole.trim() || jobRole;
    if (!role) { toast.error("Please select or enter a job role"); return; }
    setLoading(true);
    setData(null);
    setExpandedIdx(null);
    setShowAnswer({});
    try {
      const { data: result } = await interviewApi.generate(
        role, expLevel, selectedResumeId || undefined
      );
      if (result.error) { toast.error(result.error); return; }
      setData(result);
      toast.success(`Generated ${result.technical_questions?.length + result.hr_questions?.length} questions!`);
    } catch {
      toast.error("Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (key: string) =>
    setExpandedIdx(prev => prev === key ? null : key);

  const toggleAnswer = (key: string) =>
    setShowAnswer(prev => ({ ...prev, [key]: !prev[key] }));

  const questions = data
    ? (activeTab === "technical" ? data.technical_questions : data.hr_questions)
    : [];

  return (
    <AppShell>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <h1 className="text-xl font-semibold text-gray-900">Interview Prep</h1>
          <p className="text-sm text-gray-500 mt-0.5">AI-generated questions with model answers tailored to your role</p>
        </div>

        <div className="p-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-12 gap-6">

            {/* LEFT: Config panel */}
            <div className="col-span-4 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Configure</h2>

                {/* Resume context */}
                {resumes.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Resume context (optional)</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={selectedResumeId}
                      onChange={e => setSelectedResumeId(e.target.value)}
                    >
                      <option value="">None — generic questions</option>
                      {resumes.map(r => <option key={r.id} value={r.id}>{r.filename}</option>)}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">Questions will be tailored to your skills</p>
                  </div>
                )}

                {/* Experience level */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Experience level</label>
                  <div className="grid grid-cols-2 gap-2">
                    {EXPERIENCE_LEVELS.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setExpLevel(value)}
                        className={clsx(
                          "py-2 px-3 rounded-xl text-xs font-medium border transition-all",
                          expLevel === value
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Job role */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Job role</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {POPULAR_ROLES.map(role => (
                      <button
                        key={role}
                        onClick={() => { setJobRole(role); setCustomRole(""); }}
                        className={clsx(
                          "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
                          jobRole === role && !customRole
                            ? "bg-indigo-50 text-indigo-700 border-indigo-300"
                            : "bg-white text-gray-600 border-gray-200 hover:border-indigo-200"
                        )}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                  <input
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Or type a custom role…"
                    value={customRole}
                    onChange={e => { setCustomRole(e.target.value); setJobRole(""); }}
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading || (!jobRole && !customRole.trim())}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Generating…</>
                    : <><Zap className="w-4 h-4" />Generate Questions</>
                  }
                </button>
              </div>

              {/* Prep tips */}
              {data?.preparation_tips && data.preparation_tips.length > 0 && (
                <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-indigo-600" />
                    <h2 className="text-sm font-semibold text-indigo-800">Preparation Tips</h2>
                  </div>
                  <ul className="space-y-2">
                    {data.preparation_tips.map((tip, i) => (
                      <li key={i} className="flex gap-2 text-xs text-indigo-700">
                        <span className="text-indigo-400 flex-shrink-0 mt-0.5">→</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* RIGHT: Questions */}
            <div className="col-span-8">
              {!data && !loading && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                    <BookOpen className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="font-semibold text-gray-700 mb-1">Ready to prepare?</h3>
                  <p className="text-sm text-gray-400 max-w-xs">Select a role and click Generate to get personalized interview questions with model answers</p>
                </div>
              )}

              {loading && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-24">
                  <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
                  <p className="font-medium text-gray-700">Generating questions for {customRole || jobRole}…</p>
                  <p className="text-sm text-gray-400 mt-1">This takes about 10 seconds</p>
                </div>
              )}

              {data && !loading && (
                <div className="space-y-4">
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
                      <p className="text-2xl font-bold text-indigo-600">{data.technical_questions?.length}</p>
                      <p className="text-xs text-gray-500 mt-1">Technical Qs</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
                      <p className="text-2xl font-bold text-purple-600">{data.hr_questions?.length}</p>
                      <p className="text-xs text-gray-500 mt-1">HR Qs</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
                      <p className="text-lg font-bold text-gray-700 capitalize">{data.experience_level}</p>
                      <p className="text-xs text-gray-500 mt-1">Level</p>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex border-b border-gray-100">
                      <button
                        onClick={() => setActiveTab("technical")}
                        className={clsx(
                          "flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all",
                          activeTab === "technical"
                            ? "text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50/50"
                            : "text-gray-500 hover:text-gray-700"
                        )}
                      >
                        <Code2 className="w-4 h-4" />
                        Technical ({data.technical_questions?.length})
                      </button>
                      <button
                        onClick={() => setActiveTab("hr")}
                        className={clsx(
                          "flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all",
                          activeTab === "hr"
                            ? "text-purple-600 border-b-2 border-purple-500 bg-purple-50/50"
                            : "text-gray-500 hover:text-gray-700"
                        )}
                      >
                        <Users className="w-4 h-4" />
                        HR / Behavioural ({data.hr_questions?.length})
                      </button>
                    </div>

                    <div className="p-4 space-y-3 max-h-[65vh] overflow-y-auto">
                      {questions.map((q, i) => {
                        const key = `${activeTab}-${i}`;
                        const isOpen = expandedIdx === key;
                        const diff = q.difficulty ? DIFFICULTY_CONFIG[q.difficulty] : null;

                        return (
                          <div
                            key={key}
                            className={clsx(
                              "border rounded-xl transition-all",
                              isOpen ? "border-indigo-200 shadow-sm" : "border-gray-100 hover:border-gray-200"
                            )}
                          >
                            {/* Question header */}
                            <button
                              onClick={() => toggleExpand(key)}
                              className="w-full flex items-start gap-3 p-4 text-left"
                            >
                              <span className={clsx(
                                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",
                                activeTab === "technical" ? "bg-indigo-100 text-indigo-700" : "bg-purple-100 text-purple-700"
                              )}>
                                {i + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 leading-relaxed">{q.question}</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  {diff && (
                                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                      style={{ background: diff.bg, color: diff.color }}>
                                      {diff.label}
                                    </span>
                                  )}
                                  {(q.topic || q.category) && (
                                    <span className="text-xs text-gray-400">{q.topic || q.category}</span>
                                  )}
                                </div>
                              </div>
                              {isOpen
                                ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                                : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                              }
                            </button>

                            {/* Expanded content */}
                            {isOpen && (
                              <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
                                {/* Your answer input */}
                                <div>
                                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Your answer (practice)</label>
                                  <textarea
                                    rows={3}
                                    placeholder="Type your answer here before revealing the model answer…"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={savedAnswers[key] || ""}
                                    onChange={e => setSavedAnswers(prev => ({ ...prev, [key]: e.target.value }))}
                                  />
                                </div>

                                {/* Reveal model answer */}
                                <button
                                  onClick={() => toggleAnswer(key)}
                                  className={clsx(
                                    "flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition-all",
                                    showAnswer[key]
                                      ? "bg-green-100 text-green-700"
                                      : "bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700"
                                  )}
                                >
                                  {showAnswer[key]
                                    ? <><CheckCircle2 className="w-3.5 h-3.5" />Hide model answer</>
                                    : <><Star className="w-3.5 h-3.5" />Reveal model answer</>
                                  }
                                </button>

                                {showAnswer[key] && (
                                  <div className="space-y-2">
                                    <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                                      <p className="text-xs font-semibold text-green-700 mb-1.5">Model Answer</p>
                                      <p className="text-sm text-gray-700 leading-relaxed">{q.model_answer}</p>
                                    </div>
                                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                                      <p className="text-xs font-semibold text-amber-700 mb-1">Pro Tip</p>
                                      <p className="text-xs text-gray-700">{q.tip}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}