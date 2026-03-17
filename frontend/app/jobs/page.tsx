"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { resumeApi, analysisApi } from "@/lib/api";
import { Resume } from "@/types";
import {
  Loader2, Search, BookOpen, AlertTriangle, CheckCircle2,
  ChevronRight, Clock, ExternalLink, Target, TrendingUp,
  ArrowRight, Zap, Star
} from "lucide-react";
import toast from "react-hot-toast";
import { clsx } from "clsx";

const CAREERS = [
  { id: "full_stack_developer",   label: "Full Stack Developer" },
  { id: "ai_ml_engineer",         label: "AI/ML Engineer" },
  { id: "data_scientist",         label: "Data Scientist" },
  { id: "backend_developer",      label: "Backend Developer" },
  { id: "frontend_developer",     label: "Frontend Developer" },
  { id: "devops_engineer",        label: "DevOps Engineer" },
  { id: "mobile_developer",       label: "Mobile Developer" },
  { id: "data_engineer",          label: "Data Engineer" },
  { id: "cybersecurity_analyst",  label: "Cybersecurity Analyst" },
];

export default function JobsPage() {
  const [resumes, setResumes]           = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobDescription, setJobDescription]     = useState("");
  const [jobTitle, setJobTitle]                 = useState("");
  const [matchResult, setMatchResult]           = useState<any>(null);
  const [gapResult, setGapResult]               = useState<any>(null);
  const [targetCareer, setTargetCareer]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [gapLoading, setGapLoading] = useState(false);
  const [tab, setTab] = useState<"match" | "gap">("match");

  useEffect(() => {
    resumeApi.list().then(r => {
      const analyzed = r.data.filter((x: Resume) => x.status === "analyzed");
      setResumes(analyzed);
      if (analyzed.length > 0) setSelectedResumeId(analyzed[0].id);
    });
  }, []);

  const handleMatch = async () => {
    if (!selectedResumeId || !jobDescription.trim()) {
      toast.error("Select a resume and paste a job description"); return;
    }
    setLoading(true);
    try {
      const { data } = await analysisApi.jobMatch(selectedResumeId, jobDescription, jobTitle);
      setMatchResult(data);
    } catch { toast.error("Match analysis failed"); }
    finally { setLoading(false); }
  };

  const handleGap = async () => {
    if (!selectedResumeId) { toast.error("Select a resume first"); return; }
    if (!targetCareer && !jobDescription.trim()) {
      toast.error("Choose a career path or paste a JD"); return;
    }
    setGapLoading(true);
    try {
      const { data } = await analysisApi.skillGap(
        selectedResumeId,
        targetCareer || undefined,
        targetCareer ? undefined : jobDescription,
      );
      setGapResult(data);
    } catch { toast.error("Gap analysis failed"); }
    finally { setGapLoading(false); }
  };

  const scoreColor = (s: number) =>
    s >= 0.7 ? "#16a34a" : s >= 0.5 ? "#d97706" : "#dc2626";

  return (
    <AppShell>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <h1 className="text-xl font-semibold text-gray-900">Job Matcher & Skill Gap</h1>
          <p className="text-sm text-gray-500 mt-0.5">Match your resume to jobs and get a personalized learning roadmap</p>
        </div>

        <div className="p-8 max-w-6xl mx-auto">
          {/* Resume selector */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 flex-shrink-0">Resume:</label>
              {resumes.length === 0 ? (
                <p className="text-sm text-gray-500">No analyzed resumes yet — upload one first.</p>
              ) : (
                <select
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-xs"
                  value={selectedResumeId}
                  onChange={e => setSelectedResumeId(e.target.value)}
                >
                  {resumes.map(r => <option key={r.id} value={r.id}>{r.filename}</option>)}
                </select>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-gray-100 rounded-2xl p-1 w-fit">
            {(["match", "gap"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={clsx(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
                  tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                {t === "match" ? <><Search className="w-4 h-4" />Job Match</> : <><BookOpen className="w-4 h-4" />Skill Gap + Roadmap</>}
              </button>
            ))}
          </div>

          {/* JOB MATCH TAB */}
          {tab === "match" && (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Job Title (optional)</label>
                  <input className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Backend Engineer at Google"
                    value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Paste Job Description</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none h-52 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Paste the full job description here…"
                    value={jobDescription} onChange={e => setJobDescription(e.target.value)}
                  />
                </div>
                <button onClick={handleMatch} disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Analyzing…</> : <><Search className="w-4 h-4" />Analyze Match</>}
                </button>
              </div>

              <div>
                {matchResult ? (
                  <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
                    {/* Match score */}
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold text-gray-800">Match Score</h2>
                      <span className="text-3xl font-bold" style={{ color: scoreColor(matchResult.match_score) }}>
                        {Math.round(matchResult.match_score * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${matchResult.match_score * 100}%`, backgroundColor: scoreColor(matchResult.match_score) }} />
                    </div>
                    <p className="text-sm text-gray-600">{matchResult.explanation}</p>

                    {matchResult.matched_skills?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-2">Matched skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {matchResult.matched_skills.map((s: string) => (
                            <span key={s} className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 border border-green-100 rounded-xl text-xs font-medium">
                              <CheckCircle2 className="w-3 h-3" />{s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {matchResult.missing_skills?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-2">Missing skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {matchResult.missing_skills.map((s: string) => (
                            <span key={s} className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-medium">+ {s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {matchResult.suggestions?.map((s: string, i: number) => (
                      <p key={i} className="text-xs text-indigo-600 flex items-start gap-1.5">
                        <Zap className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{s}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-20 text-center h-full">
                    <Search className="w-10 h-10 text-gray-300 mb-3" />
                    <p className="text-sm text-gray-400">Paste a JD and click Analyze</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SKILL GAP TAB */}
          {tab === "gap" && (
            <div className="grid grid-cols-5 gap-6">
              {/* Config */}
              <div className="col-span-2 space-y-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Target Career Path</label>
                    <div className="space-y-1.5">
                      {CAREERS.map(c => (
                        <button key={c.id} onClick={() => { setTargetCareer(c.id); setJobDescription(""); }}
                          className={clsx(
                            "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm border transition-all text-left",
                            targetCareer === c.id
                              ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-medium"
                              : "bg-white border-gray-200 text-gray-700 hover:border-indigo-200 hover:bg-gray-50"
                          )}
                        >
                          {c.label}
                          {targetCareer === c.id && <CheckCircle2 className="w-4 h-4 text-indigo-500" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Or paste a Job Description</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                      placeholder="Paste JD text…"
                      value={jobDescription}
                      onChange={e => { setJobDescription(e.target.value); setTargetCareer(""); }}
                      disabled={!!targetCareer}
                    />
                  </div>
                  <button onClick={handleGap} disabled={gapLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50">
                    {gapLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Analyzing…</> : <><Target className="w-4 h-4" />Analyze Gaps</>}
                  </button>
                </div>
              </div>

              {/* Results */}
              <div className="col-span-3">
                {gapResult ? (
                  <div className="space-y-4">
                    {/* Readiness score */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="font-semibold text-gray-800">Readiness Score</h2>
                        <span className="text-3xl font-bold" style={{ color: scoreColor(gapResult.overall_readiness ?? 0) }}>
                          {Math.round((gapResult.overall_readiness ?? 0) * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${(gapResult.overall_readiness ?? 0) * 100}%`, backgroundColor: scoreColor(gapResult.overall_readiness ?? 0) }} />
                      </div>
                      {gapResult.strengths?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {gapResult.strengths.slice(0, 3).map((s: string, i: number) => (
                            <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 border border-green-100 rounded-xl text-xs">
                              <Star className="w-3 h-3" />{s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Critical gaps */}
                    {gapResult.critical_gaps?.length > 0 && (
                      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <h2 className="font-semibold text-gray-800">Critical Gaps ({gapResult.critical_gaps.length})</h2>
                        </div>
                        <div className="space-y-2">
                          {gapResult.critical_gaps.map((g: any, i: number) => (
                            <div key={i} className="p-3 bg-red-50 rounded-xl border border-red-100">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-red-700">{g.skill}</p>
                                <span className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                                  <Clock className="w-3 h-3" />{g.time_estimate}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">{g.why_important}</p>
                              <p className="text-xs text-indigo-600 mt-1 flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />{g.how_to_learn}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Learning roadmap — visual timeline */}
                    {gapResult.learning_roadmap?.length > 0 && (
                      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <TrendingUp className="w-4 h-4 text-indigo-500" />
                          <h2 className="font-semibold text-gray-800">Learning Roadmap</h2>
                        </div>
                        <div className="relative">
                          {/* Timeline line */}
                          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-indigo-100" />
                          <div className="space-y-4">
                            {gapResult.learning_roadmap.map((step: any, i: number) => (
                              <div key={i} className="flex gap-4 relative">
                                {/* Timeline dot */}
                                <div className={clsx(
                                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 text-xs font-bold border-2",
                                  i === 0 ? "bg-indigo-600 text-white border-indigo-600" :
                                  i === 1 ? "bg-indigo-100 text-indigo-700 border-indigo-200" :
                                  "bg-gray-100 text-gray-500 border-gray-200"
                                )}>
                                  W{step.week?.toString().includes("-") ? step.week.split("-")[0] : step.week}
                                </div>
                                {/* Content */}
                                <div className={clsx(
                                  "flex-1 p-3 rounded-xl border mb-1",
                                  i === 0 ? "bg-indigo-50 border-indigo-200" : "bg-gray-50 border-gray-100"
                                )}>
                                  <p className={clsx(
                                    "text-sm font-semibold mb-1",
                                    i === 0 ? "text-indigo-800" : "text-gray-800"
                                  )}>
                                    Week {step.week}: {step.focus}
                                  </p>
                                  {step.resources?.map((r: string, j: number) => (
                                    <p key={j} className="text-xs text-gray-600 flex items-center gap-1.5 mt-0.5">
                                      <ArrowRight className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                                      {r}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            ))}
                            {/* End dot */}
                            <div className="flex gap-4 relative">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 bg-green-100 border-2 border-green-200">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              </div>
                              <div className="flex-1 p-3 rounded-xl border bg-green-50 border-green-100 mb-1">
                                <p className="text-sm font-semibold text-green-800">Ready to apply!</p>
                                <p className="text-xs text-green-600 mt-0.5">Complete the roadmap and start applying confidently</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center h-full py-20 text-center">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                      <Target className="w-8 h-8 text-indigo-300" />
                    </div>
                    <h3 className="font-semibold text-gray-600 mb-1">Choose a target career</h3>
                    <p className="text-sm text-gray-400 max-w-xs">Select a career path on the left and click Analyze Gaps to get your personalized learning roadmap</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}