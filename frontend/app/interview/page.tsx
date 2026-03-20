"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { interviewApi, resumeApi } from "@/lib/api";
import { Resume } from "@/types";
import { Loader2, ChevronDown, ChevronUp, Lightbulb, Code2, Users, Zap, BookOpen, CheckCircle2, Star } from "lucide-react";
import toast from "react-hot-toast";
import { clsx } from "clsx";

const F = "#0A3D3D", C = "#C08552", S = "#7BA89A";
const ROLES = ["Full Stack Developer","Data Scientist","AI/ML Engineer","Backend Developer","Frontend Developer","DevOps Engineer","Data Analyst","Mobile Developer","Cybersecurity Analyst"];
const LEVELS = [{ value:"fresher",label:"Fresher (0-1 yr)" },{ value:"junior",label:"Junior (1-3 yrs)" },{ value:"mid",label:"Mid-level (3-5 yrs)" },{ value:"senior",label:"Senior (5+ yrs)" }];
const DIFF: Record<string,{color:string;bg:string}> = { easy:{color:"#3D7A6A",bg:"rgba(123,168,154,0.1)"}, medium:{color:C,bg:"rgba(192,133,82,0.08)"}, hard:{color:"#B83A2A",bg:"rgba(184,58,42,0.06)"} };

export default function InterviewPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [expLevel, setExpLevel] = useState("fresher");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [expandedIdx, setExpandedIdx] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"technical"|"hr">("technical");
  const [savedAnswers, setSavedAnswers] = useState<Record<string,string>>({});
  const [showAnswer, setShowAnswer] = useState<Record<string,boolean>>({});

  useEffect(() => {
    resumeApi.list().then(r => { const a = r.data.filter((x: Resume) => x.status==="analyzed"); setResumes(a); if (a.length>0) setSelectedResumeId(a[0].id); }).catch(()=>{});
  }, []);

  const handleGenerate = async () => {
    const role = customRole.trim() || jobRole;
    if (!role) { toast.error("Please select or enter a job role"); return; }
    setLoading(true); setData(null); setExpandedIdx(null); setShowAnswer({});
    try {
      const { data: result } = await interviewApi.generate(role, expLevel, selectedResumeId || undefined);
      if (result.error) { toast.error(result.error); return; }
      setData(result); toast.success(`Generated ${result.technical_questions?.length + result.hr_questions?.length} questions!`);
    } catch { toast.error("Failed to generate questions."); } finally { setLoading(false); }
  };

  const questions = data ? (activeTab==="technical" ? data.technical_questions : data.hr_questions) : [];

  const Card = ({ children, className="" }: any) => (
    <div className={`rounded-2xl ${className}`} style={{ background:"white", border:"1px solid rgba(10,61,61,0.08)", boxShadow:"0 2px 8px rgba(10,61,61,0.04)" }}>{children}</div>
  );

  return (
    <AppShell>
      <div className="min-h-screen" style={{ background:"#FBF9F6" }}>
        <div className="px-8 py-6" style={{ background:"white", borderBottom:"1px solid rgba(10,61,61,0.08)" }}>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:22, color:"#0D1F1F", letterSpacing:"-0.02em" }}>Dalence Interview Prep</h1>
          <p className="text-sm mt-0.5" style={{ color:"#5A7575" }}>AI-generated questions tailored to your role</p>
        </div>

        <div className="p-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-12 gap-6">
            {/* Config */}
            <div className="col-span-4 space-y-4">
              <Card className="p-5">
                <h2 className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color:"#2A4545" }}>Configure</h2>

                {resumes.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-xs font-semibold mb-1.5" style={{ color:"#2A4545" }}>Resume context</label>
                    <select className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border:"1.5px solid rgba(10,61,61,0.15)", background:"#F3F0EA", color:"#0D1F1F" }}
                      value={selectedResumeId} onChange={e => setSelectedResumeId(e.target.value)}>
                      <option value="">None — generic questions</option>
                      {resumes.map(r => <option key={r.id} value={r.id}>{r.filename}</option>)}
                    </select>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-xs font-semibold mb-2" style={{ color:"#2A4545" }}>Experience level</label>
                  <div className="grid grid-cols-2 gap-2">
                    {LEVELS.map(({ value, label }) => (
                      <button key={value} onClick={() => setExpLevel(value)}
                        className="py-2 px-3 rounded-xl text-xs font-medium border transition-all"
                        style={{ background: expLevel===value ? F : "white", color: expLevel===value ? "white" : "#2A4545", borderColor: expLevel===value ? F : "rgba(10,61,61,0.12)" }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold mb-2" style={{ color:"#2A4545" }}>Job role</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {ROLES.map(role => (
                      <button key={role} onClick={() => { setJobRole(role); setCustomRole(""); }}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium border transition-all"
                        style={{ background: jobRole===role && !customRole ? "rgba(10,61,61,0.08)" : "white", color: jobRole===role && !customRole ? F : "#5A7575", borderColor: jobRole===role && !customRole ? "rgba(10,61,61,0.2)" : "rgba(10,61,61,0.08)" }}>
                        {role}
                      </button>
                    ))}
                  </div>
                  <input className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ border:"1.5px solid rgba(10,61,61,0.15)", background:"#F3F0EA", color:"#0D1F1F" }}
                    placeholder="Or type a custom role…" value={customRole} onChange={e => { setCustomRole(e.target.value); setJobRole(""); }}/>
                </div>

                <button onClick={handleGenerate} disabled={loading || (!jobRole && !customRole.trim())}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
                  style={{ background: F, color:"white" }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = C; }}
                  onMouseLeave={e => { e.currentTarget.style.background = F; }}>
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin"/>Generating…</> : <><Zap className="w-4 h-4"/>Generate Questions</>}
                </button>
              </Card>

              {data?.preparation_tips?.length > 0 && (
                <Card className="p-5" style={{ background:"rgba(10,61,61,0.03)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4" style={{ color:C }}/>
                    <h2 className="text-sm font-semibold" style={{ fontFamily:"'Space Grotesk',sans-serif", color:F }}>Preparation Tips</h2>
                  </div>
                  <ul className="space-y-2">
                    {data.preparation_tips.map((tip: string, i: number) => (
                      <li key={i} className="flex gap-2 text-xs" style={{ color:"#2A4545" }}>
                        <span style={{ color:C, flexShrink:0 }}>→</span>{tip}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>

            {/* Questions */}
            <div className="col-span-8">
              {!data && !loading && (
                <Card className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background:"rgba(10,61,61,0.06)" }}>
                    <BookOpen className="w-8 h-8" style={{ color:F }}/>
                  </div>
                  <h3 className="font-semibold mb-1" style={{ fontFamily:"'Space Grotesk',sans-serif", color:"#0D1F1F" }}>Ready to prepare?</h3>
                  <p className="text-sm" style={{ color:"#5A7575" }}>Select a role and click Generate</p>
                </Card>
              )}

              {loading && (
                <Card className="flex flex-col items-center justify-center py-24">
                  <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color:C }}/>
                  <p className="font-medium" style={{ fontFamily:"'Space Grotesk',sans-serif", color:"#0D1F1F" }}>Generating questions for {customRole||jobRole}…</p>
                  <p className="text-sm mt-1" style={{ color:"#5A7575" }}>About 10 seconds</p>
                </Card>
              )}

              {data && !loading && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label:"Technical Qs", value:data.technical_questions?.length, color:F },
                      { label:"HR Qs", value:data.hr_questions?.length, color:S },
                      { label:"Level", value:data.experience_level, color:C },
                    ].map(({ label, value, color }) => (
                      <Card key={label} className="p-4 text-center">
                        <p className="text-2xl font-bold capitalize" style={{ fontFamily:"'Space Grotesk',sans-serif", color }}>{value}</p>
                        <p className="text-xs mt-1" style={{ color:"#5A7575" }}>{label}</p>
                      </Card>
                    ))}
                  </div>

                  <Card>
                    <div className="flex" style={{ borderBottom:"1px solid rgba(10,61,61,0.07)" }}>
                      {[{key:"technical",label:"Technical",icon:Code2,count:data.technical_questions?.length},{key:"hr",label:"HR / Behavioural",icon:Users,count:data.hr_questions?.length}].map(({ key, label, icon:Icon, count }) => (
                        <button key={key} onClick={() => setActiveTab(key as any)}
                          className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all"
                          style={{ color: activeTab===key ? F : "#5A7575", borderBottom: activeTab===key ? `2px solid ${F}` : "2px solid transparent", background: activeTab===key ? "rgba(10,61,61,0.03)" : "transparent" }}>
                          <Icon className="w-4 h-4"/>{label} ({count})
                        </button>
                      ))}
                    </div>

                    <div className="p-4 space-y-3 max-h-[65vh] overflow-y-auto">
                      {questions.map((q: any, i: number) => {
                        const key = `${activeTab}-${i}`;
                        const isOpen = expandedIdx === key;
                        const diff = q.difficulty ? DIFF[q.difficulty] : null;
                        return (
                          <div key={key} className="border rounded-xl transition-all" style={{ borderColor: isOpen ? "rgba(10,61,61,0.2)" : "rgba(10,61,61,0.07)" }}>
                            <button onClick={() => setExpandedIdx(isOpen ? null : key)} className="w-full flex items-start gap-3 p-4 text-left">
                              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                                style={{ background: activeTab==="technical" ? "rgba(10,61,61,0.08)" : "rgba(123,168,154,0.12)", color: activeTab==="technical" ? F : "#3D7A6A" }}>{i+1}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium leading-relaxed" style={{ color:"#0D1F1F" }}>{q.question}</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  {diff && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background:diff.bg, color:diff.color }}>{q.difficulty}</span>}
                                  {(q.topic||q.category) && <span className="text-xs" style={{ color:"#5A7575" }}>{q.topic||q.category}</span>}
                                </div>
                              </div>
                              {isOpen ? <ChevronUp className="w-4 h-4 flex-shrink-0 mt-1" style={{ color:"#5A7575" }}/> : <ChevronDown className="w-4 h-4 flex-shrink-0 mt-1" style={{ color:"#5A7575" }}/>}
                            </button>
                            {isOpen && (
                              <div className="px-4 pb-4 space-y-3 pt-3" style={{ borderTop:"1px solid rgba(10,61,61,0.05)" }}>
                                <div>
                                  <label className="text-xs font-semibold mb-1.5 block" style={{ color:"#2A4545" }}>Your answer (practice)</label>
                                  <textarea rows={3} placeholder="Type your answer before revealing the model answer…"
                                    className="w-full px-3 py-2 rounded-xl text-sm resize-none outline-none"
                                    style={{ border:"1.5px solid rgba(10,61,61,0.12)", background:"#F3F0EA", color:"#0D1F1F" }}
                                    value={savedAnswers[key]||""} onChange={e => setSavedAnswers(p => ({...p,[key]:e.target.value}))}/>
                                </div>
                                <button onClick={() => setShowAnswer(p => ({...p,[key]:!p[key]}))}
                                  className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                                  style={{ background: showAnswer[key] ? "rgba(123,168,154,0.15)" : "rgba(10,61,61,0.05)", color: showAnswer[key] ? "#3D7A6A" : "#2A4545" }}>
                                  {showAnswer[key] ? <><CheckCircle2 className="w-3.5 h-3.5"/>Hide model answer</> : <><Star className="w-3.5 h-3.5"/>Reveal model answer</>}
                                </button>
                                {showAnswer[key] && (
                                  <div className="space-y-2">
                                    <div className="p-3 rounded-xl" style={{ background:"rgba(123,168,154,0.07)", border:"1px solid rgba(123,168,154,0.2)" }}>
                                      <p className="text-xs font-semibold mb-1.5" style={{ color:"#3D7A6A" }}>Model Answer</p>
                                      <p className="text-sm leading-relaxed" style={{ color:"#0D1F1F" }}>{q.model_answer}</p>
                                    </div>
                                    <div className="p-3 rounded-xl" style={{ background:"rgba(192,133,82,0.06)", border:"1px solid rgba(192,133,82,0.15)" }}>
                                      <p className="text-xs font-semibold mb-1" style={{ color:C }}>Pro Tip</p>
                                      <p className="text-xs" style={{ color:"#2A4545" }}>{q.tip}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}