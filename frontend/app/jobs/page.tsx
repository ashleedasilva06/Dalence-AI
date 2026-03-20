"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { resumeApi, analysisApi } from "@/lib/api";
import { Resume } from "@/types";
import { Loader2, Search, BookOpen, AlertTriangle, CheckCircle2, ChevronRight, Clock, Target, TrendingUp, ArrowRight, Zap, Star } from "lucide-react";
import toast from "react-hot-toast";
import { clsx } from "clsx";

const F = "#0A3D3D", C = "#C08552", S = "#7BA89A";
const scoreColor = (s: number) => s >= 0.7 ? F : s >= 0.5 ? C : "#B83A2A";

const CAREERS = [
  { id:"full_stack_developer", label:"Full Stack Developer" },
  { id:"ai_ml_engineer", label:"AI/ML Engineer" },
  { id:"data_scientist", label:"Data Scientist" },
  { id:"backend_developer", label:"Backend Developer" },
  { id:"frontend_developer", label:"Frontend Developer" },
  { id:"devops_engineer", label:"DevOps Engineer" },
  { id:"mobile_developer", label:"Mobile Developer" },
  { id:"data_engineer", label:"Data Engineer" },
  { id:"cybersecurity_analyst", label:"Cybersecurity Analyst" },
];

export default function JobsPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [matchResult, setMatchResult] = useState<any>(null);
  const [gapResult, setGapResult] = useState<any>(null);
  const [targetCareer, setTargetCareer] = useState("");
  const [loading, setLoading] = useState(false);
  const [gapLoading, setGapLoading] = useState(false);
  const [tab, setTab] = useState<"match"|"gap">("match");

  useEffect(() => {
    resumeApi.list().then(r => {
      const a = r.data.filter((x: Resume) => x.status === "analyzed");
      setResumes(a);
      if (a.length > 0) setSelectedResumeId(a[0].id);
    });
  }, []);

  const handleMatch = async () => {
    if (!selectedResumeId || !jobDescription.trim()) { toast.error("Select a resume and paste a job description"); return; }
    setLoading(true);
    try { const { data } = await analysisApi.jobMatch(selectedResumeId, jobDescription, jobTitle); setMatchResult(data); }
    catch { toast.error("Match analysis failed"); } finally { setLoading(false); }
  };

  const handleGap = async () => {
    if (!selectedResumeId) { toast.error("Select a resume first"); return; }
    if (!targetCareer && !jobDescription.trim()) { toast.error("Choose a career path or paste a JD"); return; }
    setGapLoading(true);
    try { const { data } = await analysisApi.skillGap(selectedResumeId, targetCareer||undefined, targetCareer?undefined:jobDescription); setGapResult(data); }
    catch { toast.error("Gap analysis failed"); } finally { setGapLoading(false); }
  };

  const Card = ({ children, className="" }: any) => (
    <div className={`rounded-2xl ${className}`} style={{ background:"white", border:"1px solid rgba(10,61,61,0.08)", boxShadow:"0 2px 8px rgba(10,61,61,0.04)" }}>{children}</div>
  );

  const inputCls = "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all";
  const inputStyle = { border:"1.5px solid rgba(10,61,61,0.15)", background:"#F3F0EA", color:"#0D1F1F" };

  return (
    <AppShell>
      <div className="min-h-screen" style={{ background:"#FBF9F6" }}>
        <div className="px-8 py-6" style={{ background:"white", borderBottom:"1px solid rgba(10,61,61,0.08)" }}>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:22, color:"#0D1F1F", letterSpacing:"-0.02em" }}>Job Matcher & Skill Gap</h1>
          <p className="text-sm mt-0.5" style={{ color:"#5A7575" }}>Match your resume to jobs and get a personalized learning roadmap</p>
        </div>

        <div className="p-8 max-w-6xl mx-auto space-y-6">
          {/* Resume selector */}
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold flex-shrink-0" style={{ color:"#2A4545" }}>Resume:</label>
              {resumes.length === 0
                ? <p className="text-sm" style={{ color:"#5A7575" }}>No analyzed resumes yet — upload one first.</p>
                : <select className="px-3 py-2 rounded-xl text-sm outline-none max-w-xs" style={{ border:"1.5px solid rgba(10,61,61,0.15)", background:"#F3F0EA", color:"#0D1F1F" }}
                    value={selectedResumeId} onChange={e => setSelectedResumeId(e.target.value)}>
                    {resumes.map(r => <option key={r.id} value={r.id}>{r.filename}</option>)}
                  </select>
              }
            </div>
          </Card>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-2xl w-fit" style={{ background:"rgba(10,61,61,0.06)" }}>
            {([["match","Job Match",Search],["gap","Skill Gap + Roadmap",BookOpen]] as const).map(([key,label,Icon]) => (
              <button key={key} onClick={() => setTab(key)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: tab===key?"white":"transparent", color: tab===key?"#0D1F1F":"#5A7575", boxShadow: tab===key?"0 2px 8px rgba(10,61,61,0.08)":"none" }}>
                <Icon className="w-4 h-4"/>{label}
              </button>
            ))}
          </div>

          {/* JOB MATCH */}
          {tab === "match" && (
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color:"#2A4545" }}>Job Title (optional)</label>
                  <input className={inputCls} style={inputStyle} placeholder="e.g. Backend Engineer at Google" value={jobTitle} onChange={e => setJobTitle(e.target.value)}/>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color:"#2A4545" }}>Paste Job Description</label>
                  <textarea className={inputCls} style={{ ...inputStyle, resize:"none", minHeight:200 }} placeholder="Paste the full job description here…" value={jobDescription} onChange={e => setJobDescription(e.target.value)}/>
                </div>
                <button onClick={handleMatch} disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                  style={{ background:F, color:"white" }}
                  onMouseEnter={e => { if(!loading) e.currentTarget.style.background=C; }}
                  onMouseLeave={e => { e.currentTarget.style.background=F; }}>
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin"/>Analyzing…</> : <><Search className="w-4 h-4"/>Analyze Match</>}
                </button>
              </Card>

              {matchResult ? (
                <Card className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold" style={{ fontFamily:"'Space Grotesk',sans-serif", color:"#0D1F1F" }}>Match Score</h2>
                    <span className="text-3xl font-bold" style={{ fontFamily:"'Space Grotesk',sans-serif", color:scoreColor(matchResult.match_score) }}>{Math.round(matchResult.match_score*100)}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden" style={{ background:"#F3F0EA" }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width:`${matchResult.match_score*100}%`, background:scoreColor(matchResult.match_score) }}/>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color:"#2A4545" }}>{matchResult.explanation}</p>
                  {matchResult.matched_skills?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold mb-2" style={{ color:"#2A4545" }}>Matched skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {matchResult.matched_skills.map((s: string) => (
                          <span key={s} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background:"rgba(123,168,154,0.1)", color:"#3D7A6A", border:"1px solid rgba(123,168,154,0.2)" }}>
                            <CheckCircle2 className="w-3 h-3"/>{s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {matchResult.missing_skills?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold mb-2" style={{ color:"#2A4545" }}>Missing skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {matchResult.missing_skills.map((s: string) => (
                          <span key={s} className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background:"rgba(184,58,42,0.06)", color:"#B83A2A", border:"1px solid rgba(184,58,42,0.12)" }}>+ {s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {matchResult.suggestions?.map((s: string, i: number) => (
                    <p key={i} className="text-xs flex items-start gap-1.5" style={{ color:C }}>
                      <Zap className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"/>{s}
                    </p>
                  ))}
                </Card>
              ) : (
                <Card className="flex flex-col items-center justify-center py-20 text-center">
                  <Search className="w-10 h-10 mb-3" style={{ color:"rgba(10,61,61,0.15)" }}/>
                  <p className="text-sm" style={{ color:"#5A7575" }}>Paste a JD and click Analyze</p>
                </Card>
              )}
            </div>
          )}

          {/* SKILL GAP */}
          {tab === "gap" && (
            <div className="grid grid-cols-5 gap-6">
              <div className="col-span-2 space-y-4">
                <Card className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color:"#2A4545" }}>Target Career Path</label>
                    <div className="space-y-1.5">
                      {CAREERS.map(c => (
                        <button key={c.id} onClick={() => { setTargetCareer(c.id); setJobDescription(""); }}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm border transition-all text-left"
                          style={{ background: targetCareer===c.id?"rgba(10,61,61,0.06)":"white", borderColor: targetCareer===c.id?"rgba(10,61,61,0.2)":"rgba(10,61,61,0.08)", color: targetCareer===c.id?F:"#2A4545", fontWeight: targetCareer===c.id?600:400 }}>
                          {c.label}
                          {targetCareer===c.id && <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color:F }}/>}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color:"#2A4545" }}>Or paste a Job Description</label>
                    <textarea className={inputCls} style={{ ...inputStyle, resize:"none", minHeight:90, opacity:targetCareer?0.5:1 }}
                      placeholder="Paste JD text…" value={jobDescription}
                      onChange={e => { setJobDescription(e.target.value); setTargetCareer(""); }}
                      disabled={!!targetCareer}/>
                  </div>
                  <button onClick={handleGap} disabled={gapLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                    style={{ background:F, color:"white" }}
                    onMouseEnter={e => { if(!gapLoading) e.currentTarget.style.background=C; }}
                    onMouseLeave={e => { e.currentTarget.style.background=F; }}>
                    {gapLoading ? <><Loader2 className="w-4 h-4 animate-spin"/>Analyzing…</> : <><Target className="w-4 h-4"/>Analyze Gaps</>}
                  </button>
                </Card>
              </div>

              <div className="col-span-3">
                {gapResult ? (
                  <div className="space-y-4">
                    {/* Readiness */}
                    <Card className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="font-semibold" style={{ fontFamily:"'Space Grotesk',sans-serif", color:"#0D1F1F" }}>Readiness Score</h2>
                        <span className="text-3xl font-bold" style={{ fontFamily:"'Space Grotesk',sans-serif", color:scoreColor(gapResult.overall_readiness??0) }}>{Math.round((gapResult.overall_readiness??0)*100)}%</span>
                      </div>
                      <div className="w-full h-3 rounded-full overflow-hidden mb-3" style={{ background:"#F3F0EA" }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width:`${(gapResult.overall_readiness??0)*100}%`, background:scoreColor(gapResult.overall_readiness??0) }}/>
                      </div>
                      {gapResult.strengths?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {gapResult.strengths.slice(0,3).map((s: string, i: number) => (
                            <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background:"rgba(123,168,154,0.1)", color:"#3D7A6A", border:"1px solid rgba(123,168,154,0.2)" }}>
                              <Star className="w-3 h-3"/>{s}
                            </span>
                          ))}
                        </div>
                      )}
                    </Card>

                    {/* Critical gaps */}
                    {gapResult.critical_gaps?.length > 0 && (
                      <Card className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-4 h-4" style={{ color:"#B83A2A" }}/>
                          <h2 className="font-semibold" style={{ fontFamily:"'Space Grotesk',sans-serif", color:"#0D1F1F" }}>Critical Gaps ({gapResult.critical_gaps.length})</h2>
                        </div>
                        <div className="space-y-2">
                          {gapResult.critical_gaps.map((g: any, i: number) => (
                            <div key={i} className="p-3 rounded-xl" style={{ background:"rgba(184,58,42,0.04)", border:"1px solid rgba(184,58,42,0.1)" }}>
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold" style={{ color:"#B83A2A" }}>{g.skill}</p>
                                <span className="flex items-center gap-1 text-xs flex-shrink-0" style={{ color:"#5A7575" }}>
                                  <Clock className="w-3 h-3"/>{g.time_estimate}
                                </span>
                              </div>
                              <p className="text-xs mt-1" style={{ color:"#2A4545" }}>{g.why_important}</p>
                              <p className="text-xs mt-1 flex items-center gap-1" style={{ color:C }}>
                                <BookOpen className="w-3 h-3"/>{g.how_to_learn}
                              </p>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Roadmap timeline */}
                    {gapResult.learning_roadmap?.length > 0 && (
                      <Card className="p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <TrendingUp className="w-4 h-4" style={{ color:F }}/>
                          <h2 className="font-semibold" style={{ fontFamily:"'Space Grotesk',sans-serif", color:"#0D1F1F" }}>Learning Roadmap</h2>
                        </div>
                        <div className="relative">
                          <div className="absolute left-5 top-0 bottom-0 w-0.5" style={{ background:"rgba(10,61,61,0.1)" }}/>
                          <div className="space-y-3">
                            {gapResult.learning_roadmap.map((step: any, i: number) => (
                              <div key={i} className="flex gap-4 relative">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 text-xs font-bold border-2"
                                  style={{ background: i===0?F:i===1?"rgba(10,61,61,0.08)":"white", color: i===0?"white":F, borderColor: i===0?F:"rgba(10,61,61,0.15)", fontFamily:"'Space Grotesk',sans-serif" }}>
                                  W{step.week?.toString().includes("-")?step.week.split("-")[0]:step.week}
                                </div>
                                <div className="flex-1 p-3 rounded-xl border mb-1"
                                  style={{ background: i===0?"rgba(10,61,61,0.04)":"#F3F0EA", borderColor: i===0?"rgba(10,61,61,0.15)":"rgba(10,61,61,0.07)" }}>
                                  <p className="text-sm font-semibold mb-1" style={{ color: i===0?F:"#0D1F1F" }}>Week {step.week}: {step.focus}</p>
                                  {step.resources?.map((r: string, j: number) => (
                                    <p key={j} className="text-xs flex items-center gap-1.5 mt-0.5" style={{ color:"#5A7575" }}>
                                      <ArrowRight className="w-3 h-3 flex-shrink-0" style={{ color:C }}/>{r}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            ))}
                            <div className="flex gap-4 relative">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2" style={{ background:"rgba(123,168,154,0.1)", borderColor:"rgba(123,168,154,0.3)" }}>
                                <CheckCircle2 className="w-5 h-5" style={{ color:S }}/>
                              </div>
                              <div className="flex-1 p-3 rounded-xl border mb-1" style={{ background:"rgba(123,168,154,0.06)", borderColor:"rgba(123,168,154,0.2)" }}>
                                <p className="text-sm font-semibold" style={{ color:"#3D7A6A" }}>Ready to apply!</p>
                                <p className="text-xs mt-0.5" style={{ color:"#5A7575" }}>Complete the roadmap and start applying confidently</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                ) : (
                  <Card className="flex flex-col items-center justify-center h-full py-20 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background:"rgba(10,61,61,0.06)" }}>
                      <Target className="w-8 h-8" style={{ color:F }}/>
                    </div>
                    <h3 className="font-semibold mb-1" style={{ fontFamily:"'Space Grotesk',sans-serif", color:"#0D1F1F" }}>Choose a target career</h3>
                    <p className="text-sm" style={{ color:"#5A7575", maxWidth:280 }}>Select a career path and click Analyze Gaps to get your personalized learning roadmap</p>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}