"use client";
import { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import ResumeUpload from "@/components/ui/ResumeUpload";
import AnalysisProgress from "@/components/ui/AnalysisProgress";
import ResumePDFReport from "@/components/ui/ResumePDFReport";
import { resumeApi, analysisApi } from "@/lib/api";
import { Resume } from "@/types";
import { Loader2, Trash2, CheckCircle2, AlertCircle, Sparkles, TrendingUp, Briefcase, ChevronRight, FileText, Star, Zap, Target, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import { clsx } from "clsx";

const F = "#0A3D3D", C = "#C08552", S = "#7BA89A";
const scoreColor = (s: number) => s >= 75 ? F : s >= 50 ? C : "#B83A2A";
const scoreLabel = (s: number) => s >= 75 ? "Strong" : s >= 50 ? "Good" : "Needs Work";

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
    setResumes(data); return data;
  }, []);

  useEffect(() => { fetchResumes().finally(() => setLoading(false)); }, []);

  useEffect(() => {
    if (!polling) return;
    const iv = setInterval(async () => {
      try {
        const { data } = await resumeApi.get(polling);
        setAnalysisStage(data.analysis_stage || "reading");
        if (data.status === "analyzed" || data.analysis_stage === "done") {
          clearInterval(iv); setPolling(null); setAnalysisStage(null);
          const full = await resumeApi.get(data.id);
          setSelected(full.data); await fetchResumes();
          toast.success("Analysis complete!");
        }
        if (data.analysis_stage === "error") { clearInterval(iv); setPolling(null); toast.error("Analysis failed"); }
      } catch {}
    }, 3000);
    return () => clearInterval(iv);
  }, [polling]);

  const handleUploaded = (id: string) => { setPolling(id); setSelected(null); setRewriteResult(null); fetchResumes(); };
  const handleSelect = async (r: Resume) => { const { data } = await resumeApi.get(r.id); setSelected(data); setRewriteResult(null); setActiveTab("overview"); };
  const handleDelete = async (id: string, e: React.MouseEvent) => { e.stopPropagation(); await resumeApi.delete(id); setResumes(r => r.filter(x => x.id !== id)); if (selected?.id === id) setSelected(null); toast.success("Deleted"); };
  const handleRewrite = async (sec: string) => { if (!selected) return; setRewriting(sec); try { const { data } = await analysisApi.rewriteSection(selected.id, sec); setRewriteResult({ section: sec, ...data }); } catch { toast.error("Rewrite failed"); } finally { setRewriting(null); } };

  const Card = ({ children, className="" }: any) => (
    <div className={`rounded-2xl ${className}`} style={{ background: "white", border: "1px solid rgba(10,61,61,0.08)", boxShadow: "0 2px 8px rgba(10,61,61,0.04)" }}>{children}</div>
  );

  const tabs = [
    { key: "overview", label: "Skills", icon: Zap },
    { key: "careers", label: "Career Matches", icon: Target },
    { key: "improvements", label: "Improvements", icon: BookOpen },
    { key: "rewriter", label: "AI Rewriter", icon: Sparkles },
  ];

  return (
    <AppShell>
      <div className="min-h-screen" style={{ background: "#FBF9F6" }}>
        <div className="px-8 py-6" style={{ background: "white", borderBottom: "1px solid rgba(10,61,61,0.08)" }}>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22, color: "#0D1F1F", letterSpacing: "-0.02em" }}>Resume Analysis</h1>
          <p className="text-sm mt-0.5" style={{ color: "#5A7575" }}>AI-powered resume insights and career guidance</p>
        </div>

        <div className="p-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-6">
            {/* Left */}
            <div className="col-span-4 space-y-4">
              <Card className="p-5">
                <h2 className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "#2A4545" }}>Upload Resume</h2>
                <ResumeUpload onUploaded={handleUploaded} />
              </Card>
              {!loading && resumes.length > 0 && (
                <Card className="p-5">
                  <h2 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#2A4545" }}>Your Resumes</h2>
                  <div className="space-y-2">
                    {resumes.map(r => {
                      const active = selected?.id === r.id;
                      return (
                        <div key={r.id} onClick={() => handleSelect(r)}
                          className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                          style={{ background: active ? "rgba(10,61,61,0.06)" : "transparent", border: `2px solid ${active ? "rgba(10,61,61,0.2)" : "transparent"}` }}
                          onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(10,61,61,0.03)"; }}
                          onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: active ? "rgba(10,61,61,0.1)" : "#F3F0EA" }}>
                            <FileText className="w-4 h-4" style={{ color: active ? F : "#5A7575" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: "#0D1F1F" }}>{r.filename}</p>
                            <p className="text-xs" style={{ color: "#5A7575" }}>{r.resume_score ? `Score: ${r.resume_score}/100` : r.status === "analyzed" ? "Analyzed" : "Processing…"}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {r.status === "analyzed" ? <CheckCircle2 className="w-4 h-4" style={{ color: S }} /> : <Loader2 className="w-4 h-4 animate-spin" style={{ color: C }} />}
                            <button onClick={e => handleDelete(r.id, e)} className="p-0.5 transition-colors" style={{ color: "rgba(10,61,61,0.2)" }}
                              onMouseEnter={e => (e.currentTarget.style.color = "#B83A2A")}
                              onMouseLeave={e => (e.currentTarget.style.color = "rgba(10,61,61,0.2)")}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </div>

            {/* Right */}
            <div className="col-span-8">
              {polling && !selected && <AnalysisProgress stage={analysisStage} />}

              {selected?.status === "analyzed" && (
                <div className="space-y-4">
                  {/* Score card */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#2A4545" }}>Analysis Report</h2>
                      <ResumePDFReport resume={selected} />
                    </div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-end gap-2">
                          <span className="text-5xl font-bold" style={{ fontFamily: "'Space Grotesk',sans-serif", color: scoreColor(selected.resume_score ?? 0) }}>{selected.resume_score ?? "—"}</span>
                          <span className="text-xl mb-1" style={{ color: "#5A7575" }}>/100</span>
                        </div>
                        <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: `${scoreColor(selected.resume_score ?? 0)}14`, color: scoreColor(selected.resume_score ?? 0) }}>
                          <Star className="w-3 h-3" />{scoreLabel(selected.resume_score ?? 0)}
                        </span>
                      </div>
                      <div className="relative w-24 h-24">
                        <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F3F0EA" strokeWidth="3"/>
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke={scoreColor(selected.resume_score ?? 0)} strokeWidth="3"
                            strokeDasharray={`${((selected.resume_score ?? 0)/100)*100} 100`} strokeLinecap="round"/>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <TrendingUp className="w-6 h-6" style={{ color: scoreColor(selected.resume_score ?? 0) }}/>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 w-full h-2 rounded-full overflow-hidden" style={{ background: "#F3F0EA" }}>
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${selected.resume_score ?? 0}%`, background: scoreColor(selected.resume_score ?? 0) }}/>
                    </div>
                    {(selected.suggestions?.length ?? 0) > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {selected.suggestions?.slice(0, 3).map((s: any, i: number) => (
                          <div key={i} className="p-3 rounded-xl text-xs" style={{ background: s.severity === "high" ? "rgba(184,58,42,0.06)" : s.severity === "medium" ? "rgba(192,133,82,0.06)" : "rgba(10,61,61,0.04)", color: s.severity === "high" ? "#B83A2A" : s.severity === "medium" ? C : F }}>
                            <p className="font-semibold capitalize mb-0.5">{s.section}</p>
                            <p className="opacity-80 leading-tight">{s.issue}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  {/* Tabs */}
                  <Card>
                    <div className="flex" style={{ borderBottom: "1px solid rgba(10,61,61,0.07)" }}>
                      {tabs.map(({ key, label, icon: Icon }) => (
                        <button key={key} onClick={() => setActiveTab(key as any)}
                          className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all"
                          style={{ color: activeTab === key ? F : "#5A7575", borderBottom: activeTab === key ? `2px solid ${F}` : "2px solid transparent", background: activeTab === key ? "rgba(10,61,61,0.03)" : "transparent" }}>
                          <Icon className="w-4 h-4" />{label}
                        </button>
                      ))}
                    </div>
                    <div className="p-6">
                      {/* Skills */}
                      {activeTab === "overview" && (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold" style={{ fontFamily: "'Space Grotesk',sans-serif", color: "#0D1F1F" }}>Detected Skills</h3>
                            <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "rgba(10,61,61,0.08)", color: F }}>{selected.skills?.length ?? 0} found</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selected.skills?.map(skill => {
                              const sc = selected.skill_scores?.[skill] ?? 0.5;
                              return (
                                <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all"
                                  style={{ background: sc >= 0.8 ? "rgba(10,61,61,0.06)" : sc >= 0.6 ? "rgba(123,168,154,0.1)" : "#F3F0EA", borderColor: sc >= 0.8 ? "rgba(10,61,61,0.2)" : sc >= 0.6 ? "rgba(123,168,154,0.25)" : "rgba(10,61,61,0.08)", color: sc >= 0.8 ? F : sc >= 0.6 ? "#3D7A6A" : "#5A7575" }}>
                                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sc >= 0.8 ? F : sc >= 0.6 ? S : "#5A7575" }}/>
                                  {skill}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Careers */}
                      {activeTab === "careers" && (
                        <div className="space-y-3">
                          <h3 className="font-semibold mb-4" style={{ fontFamily: "'Space Grotesk',sans-serif", color: "#0D1F1F" }}>Top Career Matches</h3>
                          {selected.career_matches?.map((m: any) => (
                            <div key={m.career_id} className="p-4 rounded-xl border transition-all" style={{ borderColor: "rgba(10,61,61,0.08)" }}
                              onMouseEnter={e => { e.currentTarget.style.background = "rgba(10,61,61,0.02)"; e.currentTarget.style.borderColor = "rgba(10,61,61,0.15)"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(10,61,61,0.08)"; }}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(10,61,61,0.07)" }}>
                                    <Briefcase className="w-4 h-4" style={{ color: F }} />
                                  </div>
                                  <span className="font-semibold text-sm" style={{ color: "#0D1F1F" }}>{m.title}</span>
                                </div>
                                <span className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk',sans-serif", color: scoreColor(m.score * 100) }}>{Math.round(m.score * 100)}%</span>
                              </div>
                              <div className="w-full h-1.5 rounded-full mb-3" style={{ background: "#F3F0EA" }}>
                                <div className="h-full rounded-full" style={{ width: `${m.score * 100}%`, background: scoreColor(m.score * 100) }}/>
                              </div>
                              {m.reasons?.length > 0 && <div className="flex flex-wrap gap-1 mb-1">{m.reasons.slice(0,2).map((r: string, i: number) => <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(123,168,154,0.12)", color: "#3D7A6A" }}>✓ {r}</span>)}</div>}
                              {m.missing_skills?.length > 0 && <div className="flex flex-wrap gap-1 mb-1">{m.missing_skills.slice(0,3).map((s: string, i: number) => <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(184,58,42,0.06)", color: "#B83A2A" }}>+ {s}</span>)}</div>}
                              {m.roadmap_tip && <p className="text-xs flex items-center gap-1 mt-1" style={{ color: C }}><ChevronRight className="w-3 h-3"/>{m.roadmap_tip}</p>}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Improvements */}
                      {activeTab === "improvements" && (
                        <div className="space-y-3">
                          <h3 className="font-semibold mb-4" style={{ fontFamily: "'Space Grotesk',sans-serif", color: "#0D1F1F" }}>Improvement Suggestions</h3>
                          {selected.suggestions?.map((s: any, i: number) => (
                            <div key={i} className="flex gap-4 p-4 rounded-xl border" style={{ background: s.severity === "high" ? "rgba(184,58,42,0.04)" : s.severity === "medium" ? "rgba(192,133,82,0.04)" : "rgba(10,61,61,0.03)", borderColor: s.severity === "high" ? "rgba(184,58,42,0.12)" : s.severity === "medium" ? "rgba(192,133,82,0.12)" : "rgba(10,61,61,0.08)" }}>
                              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: s.severity === "high" ? "#B83A2A" : s.severity === "medium" ? C : F }}/>
                              <div>
                                <p className="text-sm font-semibold capitalize mb-0.5" style={{ color: "#0D1F1F" }}>{s.section}</p>
                                <p className="text-sm mb-1" style={{ color: "#2A4545" }}>{s.issue}</p>
                                <p className="text-sm font-medium" style={{ color: C }}>💡 {s.fix}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Rewriter */}
                      {activeTab === "rewriter" && (
                        <div>
                          <div className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4" style={{ color: C }}/><h3 className="font-semibold" style={{ fontFamily: "'Space Grotesk',sans-serif", color: "#0D1F1F" }}>AI Section Rewriter</h3></div>
                          <p className="text-xs mb-4" style={{ color: "#5A7575" }}>Click any section to get an AI-improved version</p>
                          <div className="flex flex-wrap gap-2 mb-5">
                            {Object.keys(selected.extracted_data?.sections ?? {}).map(sec => (
                              <button key={sec} onClick={() => handleRewrite(sec)} disabled={rewriting === sec}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all"
                                style={{ background: rewriting === sec ? "rgba(10,61,61,0.06)" : "white", borderColor: rewriting === sec ? "rgba(10,61,61,0.2)" : "rgba(10,61,61,0.1)", color: "#2A4545" }}>
                                {rewriting === sec && <Loader2 className="w-3.5 h-3.5 animate-spin"/>}
                                <span className="capitalize">{sec}</span>
                              </button>
                            ))}
                          </div>
                          {rewriteResult && (
                            <div className="space-y-3">
                              <div className="p-4 rounded-xl border" style={{ background: "rgba(184,58,42,0.04)", borderColor: "rgba(184,58,42,0.1)" }}>
                                <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "#B83A2A" }}>Original · {rewriteResult.section}</p>
                                <p className="text-sm leading-relaxed" style={{ color: "#2A4545" }}>{rewriteResult.original}</p>
                              </div>
                              <div className="p-4 rounded-xl border" style={{ background: "rgba(123,168,154,0.06)", borderColor: "rgba(123,168,154,0.2)" }}>
                                <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "#3D7A6A" }}>AI Improved</p>
                                <p className="text-sm leading-relaxed mb-3" style={{ color: "#0D1F1F" }}>{rewriteResult.improved}</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {rewriteResult.changes_made?.map((c: string, i: number) => <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(123,168,154,0.15)", color: "#3D7A6A" }}>✓ {c}</span>)}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )}

              {!polling && !selected && (
                <Card className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(10,61,61,0.06)" }}>
                    <FileText className="w-8 h-8" style={{ color: F }}/>
                  </div>
                  <h3 className="font-semibold mb-1" style={{ fontFamily: "'Space Grotesk',sans-serif", color: "#0D1F1F" }}>No resume selected</h3>
                  <p className="text-sm" style={{ color: "#5A7575" }}>Upload a resume or select one from the list</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}