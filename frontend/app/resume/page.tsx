"use client";
import { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import ResumeUpload from "@/components/ui/ResumeUpload";
import ResumePDFReport from "@/components/ui/ResumePDFReport";
import AnalysisProgress from "@/components/ui/AnalysisProgress";
import { resumeApi, analysisApi } from "@/lib/api";
import { Resume } from "@/types";
import {
  Loader2, Trash2, CheckCircle2, AlertCircle,
  Sparkles, TrendingUp, Briefcase, ChevronRight,
  FileText, Star, Zap, Target, BookOpen
} from "lucide-react";
import toast from "react-hot-toast";
import { clsx } from "clsx";

export default function ResumePage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selected, setSelected] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState<string | null>(null);
  const [analysisStage, setAnalysisStage] = useState<string | null>(null);
  const [rewriting, setRewriting] = useState<string | null>(null);
  const [rewriteResult, setRewriteResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview"|"careers"|"improvements"|"rewriter">("overview");

  const fetchResumes = useCallback(async () => {
    const { data } = await resumeApi.list();
    setResumes(data);
    return data;
  }, []);

  useEffect(() => {
    fetchResumes().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(async () => {
      try {
        const { data } = await resumeApi.get(polling);
        setAnalysisStage(data.analysis_stage || "reading");
        if (data.status === "analyzed" || data.analysis_stage === "done") {
          clearInterval(interval);
          setPolling(null);
          setAnalysisStage(null);
          const full = await resumeApi.get(data.id);
          setSelected(full.data);
          await fetchResumes();
          toast.success("Analysis complete!");
        }
        if (data.analysis_stage === "error") {
          clearInterval(interval);
          setPolling(null);
          toast.error("Analysis failed — please try again");
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [polling]);

  const handleUploaded = (id: string) => {
    setPolling(id);
    setSelected(null);
    setRewriteResult(null);
    fetchResumes();
  };

  const handleSelect = async (r: Resume) => {
    try {
      const { data } = await resumeApi.get(r.id);
      setSelected(data);
      setRewriteResult(null);
      setActiveTab("overview");
    } catch { toast.error("Could not load resume"); }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await resumeApi.delete(id);
    setResumes(r => r.filter(x => x.id !== id));
    if (selected?.id === id) setSelected(null);
    toast.success("Deleted");
  };

  const handleRewrite = async (sectionName: string) => {
    if (!selected) return;
    setRewriting(sectionName);
    try {
      const { data } = await analysisApi.rewriteSection(selected.id, sectionName);
      setRewriteResult({ section: sectionName, ...data });
    } catch { toast.error("Rewrite failed"); }
    finally { setRewriting(null); }
  };

  const scoreColor = (s: number) =>
    s >= 75 ? "#22c55e" : s >= 50 ? "#f59e0b" : "#ef4444";

  const scoreLabel = (s: number) =>
    s >= 75 ? "Strong" : s >= 50 ? "Good" : "Needs Work";

  return (
    <AppShell>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <h1 className="text-xl font-semibold text-gray-900">Resume Analysis</h1>
          <p className="text-sm text-gray-500 mt-0.5">AI-powered resume insights and career guidance</p>
        </div>

        <div className="p-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-6">

            {/* LEFT PANEL */}
            <div className="col-span-4 space-y-4">
              {/* Upload */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Upload Resume</h2>
                <ResumeUpload onUploaded={handleUploaded} />
              </div>

              {/* Resume list */}
              {!loading && resumes.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                  <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Your Resumes</h2>
                  <div className="space-y-2">
                    {resumes.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => handleSelect(r)}
                        className={clsx(
                          "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                          selected?.id === r.id
                            ? "bg-indigo-50 border-2 border-indigo-200"
                            : "hover:bg-gray-50 border-2 border-transparent"
                        )}
                      >
                        <div className={clsx(
                          "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                          selected?.id === r.id ? "bg-indigo-100" : "bg-gray-100"
                        )}>
                          <FileText className={clsx("w-4 h-4", selected?.id === r.id ? "text-indigo-600" : "text-gray-500")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{r.filename}</p>
                          <p className="text-xs text-gray-500">
                            {r.resume_score ? `Score: ${r.resume_score}/100` : r.status === "analyzed" ? "Analyzed" : "Processing..."}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {r.status === "analyzed"
                            ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                            : <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                          }
                          <button
                            onClick={(e) => handleDelete(r.id, e)}
                            className="text-gray-300 hover:text-red-400 transition-colors p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT PANEL */}
            <div className="col-span-8">
              {/* Analysis progress */}
              {polling && !selected && (
                <AnalysisProgress stage={analysisStage} />
              )}

              {/* Full analysis results */}
              {selected?.status === "analyzed" && (
                <div className="space-y-4">
                  {/* Score hero card */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Analysis Report</h2>
                      <ResumePDFReport resume={selected} />
                    </div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Resume Score</h2>
                        <div className="flex items-end gap-2">
                          <span className="text-5xl font-bold" style={{ color: scoreColor(selected.resume_score ?? 0) }}>
                            {selected.resume_score ?? "—"}
                          </span>
                          <span className="text-xl text-gray-400 mb-1">/100</span>
                        </div>
                        <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${scoreColor(selected.resume_score ?? 0)}18`,
                            color: scoreColor(selected.resume_score ?? 0)
                          }}>
                          <Star className="w-3 h-3" />
                          {scoreLabel(selected.resume_score ?? 0)}
                        </span>
                      </div>
                      {/* Score ring */}
                      <div className="relative w-24 h-24">
                        <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3"/>
                          <circle cx="18" cy="18" r="15.9" fill="none"
                            stroke={scoreColor(selected.resume_score ?? 0)}
                            strokeWidth="3"
                            strokeDasharray={`${((selected.resume_score ?? 0) / 100) * 100} 100`}
                            strokeLinecap="round"
                            style={{ transition: "stroke-dasharray 1s ease" }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <TrendingUp className="w-6 h-6" style={{ color: scoreColor(selected.resume_score ?? 0) }} />
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${selected.resume_score ?? 0}%`, backgroundColor: scoreColor(selected.resume_score ?? 0) }}
                      />
                    </div>

                    {/* Top improvements */}
                    {selected.suggestions && selected.suggestions.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {selected.suggestions.slice(0, 3).map((s: any, i: number) => (
                          <div key={i} className={clsx(
                            "p-3 rounded-xl text-xs",
                            s.severity === "high" ? "bg-red-50 text-red-700" :
                            s.severity === "medium" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
                          )}>
                            <p className="font-semibold capitalize mb-0.5">{s.section}</p>
                            <p className="opacity-80 leading-tight">{s.issue}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tabs */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex border-b border-gray-100">
                      {[
                        { key: "overview", label: "Skills", icon: Zap },
                        { key: "careers", label: "Career Matches", icon: Target },
                        { key: "improvements", label: "Improvements", icon: BookOpen },
                        { key: "rewriter", label: "AI Rewriter", icon: Sparkles },
                      ].map(({ key, label, icon: Icon }) => (
                        <button
                          key={key}
                          onClick={() => setActiveTab(key as any)}
                          className={clsx(
                            "flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all",
                            activeTab === key
                              ? "text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50/50"
                              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </button>
                      ))}
                    </div>

                    <div className="p-6">
                      {/* SKILLS TAB */}
                      {activeTab === "overview" && (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800">Detected Skills</h3>
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-medium">
                              {selected.skills?.length ?? 0} found
                            </span>
                          </div>
                          {selected.skills && selected.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {selected.skills.map((skill) => {
                                const score = selected.skill_scores?.[skill] ?? 0.5;
                                return (
                                  <span
                                    key={skill}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all hover:shadow-sm"
                                    style={{
                                      backgroundColor: score >= 0.8 ? "#eef2ff" : score >= 0.6 ? "#f0fdf4" : "#fafafa",
                                      borderColor: score >= 0.8 ? "#a5b4fc" : score >= 0.6 ? "#86efac" : "#e5e7eb",
                                      color: score >= 0.8 ? "#4338ca" : score >= 0.6 ? "#15803d" : "#6b7280",
                                    }}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: score >= 0.8 ? "#6366f1" : score >= 0.6 ? "#22c55e" : "#9ca3af" }}
                                    />
                                    {skill}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No skills detected yet.</p>
                          )}
                          <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-400 inline-block"/>High confidence</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400 inline-block"/>Medium confidence</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block"/>Listed only</span>
                          </div>
                        </div>
                      )}

                      {/* CAREERS TAB */}
                      {activeTab === "careers" && (
                        <div className="space-y-3">
                          <h3 className="font-semibold text-gray-800 mb-4">Top Career Matches</h3>
                          {selected.career_matches && selected.career_matches.length > 0 ? (
                            selected.career_matches.map((m: any) => (
                              <div key={m.career_id} className="border border-gray-100 rounded-xl p-4 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                      <Briefcase className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <span className="font-semibold text-gray-900 text-sm">{m.title}</span>
                                  </div>
                                  <span className="text-lg font-bold" style={{ color: scoreColor(m.score * 100) }}>
                                    {Math.round(m.score * 100)}%
                                  </span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3">
                                  <div className="h-full rounded-full transition-all duration-700"
                                    style={{ width: `${m.score * 100}%`, backgroundColor: scoreColor(m.score * 100) }} />
                                </div>
                                {m.reasons?.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {m.reasons.slice(0, 2).map((r: string, i: number) => (
                                      <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">✓ {r}</span>
                                    ))}
                                  </div>
                                )}
                                {m.missing_skills?.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {m.missing_skills.slice(0, 3).map((s: string, i: number) => (
                                      <span key={i} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">+ {s}</span>
                                    ))}
                                  </div>
                                )}
                                {m.roadmap_tip && (
                                  <p className="text-xs text-indigo-600 flex items-center gap-1 mt-2">
                                    <ChevronRight className="w-3 h-3" /> {m.roadmap_tip}
                                  </p>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">Career matches not available yet.</p>
                          )}
                        </div>
                      )}

                      {/* IMPROVEMENTS TAB */}
                      {activeTab === "improvements" && (
                        <div className="space-y-3">
                          <h3 className="font-semibold text-gray-800 mb-4">Improvement Suggestions</h3>
                          {selected.suggestions && selected.suggestions.length > 0 ? (
                            selected.suggestions.map((s: any, i: number) => (
                              <div key={i} className={clsx(
                                "flex gap-4 p-4 rounded-xl border",
                                s.severity === "high" ? "bg-red-50 border-red-100" :
                                s.severity === "medium" ? "bg-amber-50 border-amber-100" : "bg-blue-50 border-blue-100"
                              )}>
                                <AlertCircle className={clsx(
                                  "w-5 h-5 flex-shrink-0 mt-0.5",
                                  s.severity === "high" ? "text-red-500" :
                                  s.severity === "medium" ? "text-amber-500" : "text-blue-500"
                                )} />
                                <div>
                                  <p className="text-sm font-semibold text-gray-800 capitalize mb-0.5">{s.section}</p>
                                  <p className="text-sm text-gray-600 mb-1">{s.issue}</p>
                                  <p className="text-sm text-indigo-600 font-medium">💡 {s.fix}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No suggestions available.</p>
                          )}
                        </div>
                      )}

                      {/* REWRITER TAB */}
                      {activeTab === "rewriter" && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-indigo-500" />
                            <h3 className="font-semibold text-gray-800">AI Section Rewriter</h3>
                          </div>
                          <p className="text-xs text-gray-500 mb-4">Click any section to get an AI-improved version</p>
                          <div className="flex flex-wrap gap-2 mb-5">
                            {Object.keys(selected.extracted_data?.sections ?? {}).map((sec) => (
                              <button
                                key={sec}
                                onClick={() => handleRewrite(sec)}
                                disabled={rewriting === sec}
                                className={clsx(
                                  "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all",
                                  rewriting === sec
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                                    : "bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                                )}
                              >
                                {rewriting === sec && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                <span className="capitalize">{sec}</span>
                              </button>
                            ))}
                          </div>

                          {rewriteResult && (
                            <div className="space-y-3">
                              <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                <p className="text-xs font-semibold text-red-600 mb-2 uppercase tracking-wide">Original · {rewriteResult.section}</p>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{rewriteResult.original}</p>
                              </div>
                              <div className="relative">
                                <div className="absolute left-1/2 -translate-x-1/2 -top-2 z-10">
                                  <span className="bg-indigo-600 text-white text-xs px-3 py-1 rounded-full">AI Improved</span>
                                </div>
                              </div>
                              <div className="p-4 bg-green-50 rounded-xl border border-green-200 mt-2">
                                <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed mb-3">{rewriteResult.improved}</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {rewriteResult.changes_made?.map((c: string, i: number) => (
                                    <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ {c}</span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!polling && !selected && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="font-semibold text-gray-700 mb-1">No resume selected</h3>
                  <p className="text-sm text-gray-400">Upload a resume or select one from the list</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}