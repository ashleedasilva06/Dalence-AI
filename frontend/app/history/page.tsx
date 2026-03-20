"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { resumeApi } from "@/lib/api";
import { Resume } from "@/types";
import { TrendingUp, TrendingDown, Minus, FileText, Calendar, Loader2, Zap, Target, AlertCircle, CheckCircle2, ArrowUp, ArrowDown } from "lucide-react";
import { clsx } from "clsx";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const F = "#0A3D3D", C = "#C08552", S = "#7BA89A";
const scoreColor = (s: number) => s >= 75 ? F : s >= 50 ? C : "#B83A2A";

export default function HistoryPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    resumeApi.list().then(r => {
      setResumes(r.data.filter((x: Resume) => x.status==="analyzed" && x.resume_score)
        .sort((a: Resume, b: Resume) => new Date(a.created_at||0).getTime() - new Date(b.created_at||0).getTime()));
    }).finally(() => setLoading(false));
  }, []);

  const chartData = resumes.map((r, i) => ({
    name: r.filename.replace(/\.(pdf|docx)$/i,"").slice(0,16),
    score: r.resume_score ?? 0, version: `v${i+1}`,
    date: r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short"}) : "",
  }));
  const first = resumes[0], last = resumes[resumes.length-1];
  const delta = resumes.length >= 2 ? (last?.resume_score??0) - (first?.resume_score??0) : null;
  const toggleSelect = (id: string) => setSelected(p => p.includes(id) ? p.filter(x=>x!==id) : p.length<2 ? [...p,id] : [p[1],id]);
  const cmp = resumes.filter(r => selected.includes(r.id));

  const Card = ({ children, className="" }: any) => (
    <div className={`rounded-2xl ${className}`} style={{ background:"white", border:"1px solid rgba(10,61,61,0.08)", boxShadow:"0 2px 8px rgba(10,61,61,0.04)" }}>{children}</div>
  );

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="px-4 py-3 rounded-xl text-sm" style={{ background:"white", border:"1px solid rgba(10,61,61,0.1)", boxShadow:"0 4px 16px rgba(10,61,61,0.08)" }}>
        <p className="font-semibold mb-0.5" style={{ color:"#0D1F1F" }}>{payload[0]?.payload?.name}</p>
        <p className="text-xs mb-1" style={{ color:"#5A7575" }}>{payload[0]?.payload?.date}</p>
        <p className="font-bold text-base" style={{ color: scoreColor(payload[0]?.value) }}>{payload[0]?.value}/100</p>
      </div>
    );
  };

  return (
    <AppShell>
      <div className="min-h-screen" style={{ background:"#FBF9F6" }}>
        <div className="px-8 py-6" style={{ background:"white", borderBottom:"1px solid rgba(10,61,61,0.08)" }}>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:22, color:"#0D1F1F", letterSpacing:"-0.02em" }}>Dalence Resume History</h1>
          <p className="text-sm mt-0.5" style={{ color:"#5A7575" }}>Track your score improvements across all versions</p>
        </div>

        <div className="p-8 max-w-6xl mx-auto space-y-6">
          {loading && <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" style={{ color:C }}/></div>}

          {!loading && resumes.length === 0 && (
            <Card className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background:"rgba(10,61,61,0.06)" }}>
                <TrendingUp className="w-8 h-8" style={{ color:F }}/>
              </div>
              <h3 className="font-semibold mb-1" style={{ fontFamily:"'Space Grotesk',sans-serif", color:"#0D1F1F" }}>No history yet</h3>
              <p className="text-sm" style={{ color:"#5A7575" }}>Upload and analyze multiple resumes to track your progress</p>
            </Card>
          )}

          {!loading && resumes.length >= 1 && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label:"Versions", value:resumes.length, color:"#0D1F1F" },
                  { label:"Best Score", value:`${Math.max(...resumes.map(r=>r.resume_score??0))}/100`, color:scoreColor(Math.max(...resumes.map(r=>r.resume_score??0))) },
                  { label:"Latest Score", value:`${last?.resume_score??"-"}/100`, color:scoreColor(last?.resume_score??0) },
                  { label:"Overall Progress", value: delta!==null ? `${delta>=0?"+":""}${delta?.toFixed(0)} pts` : "-", color: delta!==null ? (delta>=0?F:"#B83A2A") : "#5A7575" },
                ].map(({ label, value, color }) => (
                  <Card key={label} className="p-5">
                    <p className="text-xs mb-1" style={{ color:"#5A7575" }}>{label}</p>
                    <p className="text-3xl font-bold" style={{ fontFamily:"'Space Grotesk',sans-serif", color }}>{value}</p>
                  </Card>
                ))}
              </div>

              {/* Chart */}
              {resumes.length >= 2 && (
                <Card className="p-6">
                  <h2 className="text-sm font-semibold mb-5" style={{ fontFamily:"'Space Grotesk',sans-serif", color:"#2A4545" }}>Score Trend</h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData} margin={{ left:0, right:30, top:5, bottom:0 }}>
                      <defs>
                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={F} stopOpacity={0.12}/>
                          <stop offset="95%" stopColor={F} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(10,61,61,0.06)"/>
                      <XAxis dataKey="version" tick={{ fontSize:11, fill:"#5A7575" }} tickLine={false} axisLine={false}/>
                      <YAxis domain={[0,100]} tick={{ fontSize:11, fill:"#5A7575" }} tickLine={false} axisLine={false}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <ReferenceLine y={75} stroke={F} strokeDasharray="4 4" strokeOpacity={0.4} label={{ value:"Strong", fontSize:10, fill:F, position:"right" }}/>
                      <ReferenceLine y={50} stroke={C} strokeDasharray="4 4" strokeOpacity={0.4} label={{ value:"Good", fontSize:10, fill:C, position:"right" }}/>
                      <Area type="monotone" dataKey="score" stroke={F} strokeWidth={2.5} fill="url(#scoreGrad)" dot={{ r:5, fill:F, strokeWidth:2, stroke:"white" }} activeDot={{ r:7 }}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Compare */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold" style={{ fontFamily:"'Space Grotesk',sans-serif", color:"#2A4545" }}>
                    Compare Versions <span className="text-xs font-normal" style={{ color:"#5A7575" }}>— click any 2</span>
                  </h2>
                  {selected.length > 0 && <button onClick={() => setSelected([])} className="text-xs" style={{ color:"#5A7575" }}>Clear</button>}
                </div>
                <div className="flex flex-wrap gap-3 mb-5">
                  {resumes.map((r, i) => {
                    const isSel = selected.includes(r.id), pos = selected.indexOf(r.id);
                    return (
                      <button key={r.id} onClick={() => toggleSelect(r.id)}
                        className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 transition-all text-sm"
                        style={{ background: isSel ? "rgba(10,61,61,0.06)" : "white", borderColor: isSel ? "rgba(10,61,61,0.25)" : "rgba(10,61,61,0.1)", color: isSel ? F : "#2A4545" }}>
                        {isSel && <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background:F }}>{pos+1}</div>}
                        <span className="font-bold text-xs opacity-60">v{i+1}</span>
                        <span className="font-medium truncate max-w-[120px]">{r.filename.replace(/\.(pdf|docx)$/i,"")}</span>
                        <span className="font-bold" style={{ color:scoreColor(r.resume_score??0) }}>{r.resume_score}</span>
                      </button>
                    );
                  })}
                </div>

                {cmp.length === 2 && (
                  <div style={{ borderTop:"1px solid rgba(10,61,61,0.07)" }} className="pt-5">
                    <div className="grid grid-cols-2 gap-6">
                      {cmp.map((r, idx) => (
                        <div key={r.id} className="p-4 rounded-xl" style={{ background: idx===0 ? "#F3F0EA" : "rgba(10,61,61,0.04)", border:`1px solid ${idx===0 ? "rgba(10,61,61,0.1)" : "rgba(10,61,61,0.15)"}` }}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold truncate max-w-[150px]" style={{ color:"#5A7575" }}>{r.filename}</p>
                            <p className="text-xl font-bold" style={{ fontFamily:"'Space Grotesk',sans-serif", color:scoreColor(r.resume_score??0) }}>{r.resume_score}/100</p>
                          </div>
                          <div className="w-full h-2 rounded-full mb-4" style={{ background:"rgba(10,61,61,0.08)" }}>
                            <div className="h-full rounded-full" style={{ width:`${r.resume_score??0}%`, background:scoreColor(r.resume_score??0) }}/>
                          </div>
                          {[
                            { icon:<Zap className="w-3.5 h-3.5"/>, label:"Skills", value:r.skills?.length??0, delta:idx===1?(r.skills?.length??0)-(cmp[0].skills?.length??0):null },
                            { icon:<Target className="w-3.5 h-3.5"/>, label:"Career matches", value:r.career_matches?.length??0, delta:idx===1?(r.career_matches?.length??0)-(cmp[0].career_matches?.length??0):null },
                            { icon:<AlertCircle className="w-3.5 h-3.5"/>, label:"Issues", value:r.suggestions?.length??0, delta:idx===1?-((r.suggestions?.length??0)-(cmp[0].suggestions?.length??0)):null },
                          ].map(({ icon, label, value, delta }) => (
                            <div key={label} className="flex items-center justify-between py-1">
                              <div className="flex items-center gap-1.5 text-xs" style={{ color:"#5A7575" }}><span style={{ color:"#5A7575" }}>{icon}</span>{label}</div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold" style={{ color:"#0D1F1F" }}>{value}</span>
                                {delta!==null && delta!==0 && <span className="text-xs font-bold" style={{ color:delta>0?F:"#B83A2A" }}>{delta>0?"▲":"▼"}{Math.abs(delta)}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                    {(() => {
                      const diff = (cmp[1].resume_score??0)-(cmp[0].resume_score??0);
                      return (
                        <div className="mt-4 p-4 rounded-xl flex items-center gap-3" style={{ background: diff>0?"rgba(10,61,61,0.05)":diff<0?"rgba(184,58,42,0.05)":"rgba(10,61,61,0.03)", border:`1px solid ${diff>0?"rgba(10,61,61,0.12)":diff<0?"rgba(184,58,42,0.1)":"rgba(10,61,61,0.07)"}` }}>
                          {diff>0?<TrendingUp className="w-5 h-5 flex-shrink-0" style={{ color:F }}/>:diff<0?<TrendingDown className="w-5 h-5 flex-shrink-0" style={{ color:"#B83A2A" }}/>:<Minus className="w-5 h-5 flex-shrink-0" style={{ color:"#5A7575" }}/>}
                          <p className="text-sm" style={{ color:"#0D1F1F" }}>
                            {diff>0?<><strong style={{ color:F }}>+{diff.toFixed(0)} point improvement!</strong> Keep it up!</> : diff<0?<><strong style={{ color:"#B83A2A" }}>{diff.toFixed(0)} points dropped.</strong> Check suggestions tab.</> : <strong style={{ color:"#5A7575" }}>Scores are equal.</strong>}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}
                {selected.length===1 && <p className="text-center text-sm pt-2" style={{ color:"#5A7575" }}>Select one more to compare</p>}
              </Card>

              {/* Timeline */}
              <Card className="p-6">
                <h2 className="text-sm font-semibold mb-5" style={{ fontFamily:"'Space Grotesk',sans-serif", color:"#2A4545" }}>Version Timeline</h2>
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5" style={{ background:"rgba(10,61,61,0.1)" }}/>
                  <div className="space-y-3">
                    {resumes.map((r, i) => {
                      const prev = resumes[i-1], diff = prev ? (r.resume_score??0)-(prev.resume_score??0) : null, isLatest = i===resumes.length-1;
                      return (
                        <div key={r.id} className="flex gap-4 relative">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 text-xs font-bold"
                            style={{ background: isLatest?F:"white", color: isLatest?"white":"#5A7575", borderColor: isLatest?F:"rgba(10,61,61,0.15)", fontFamily:"'Space Grotesk',sans-serif" }}>v{i+1}</div>
                          <div className="flex-1 p-4 rounded-xl border flex items-center justify-between mb-1"
                            style={{ background: isLatest?"rgba(10,61,61,0.04)":"#F3F0EA", borderColor: isLatest?"rgba(10,61,61,0.15)":"rgba(10,61,61,0.07)" }}>
                            <div>
                              <p className="text-sm font-semibold" style={{ color:"#0D1F1F" }}>{r.filename}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="flex items-center gap-1 text-xs" style={{ color:"#5A7575" }}><Calendar className="w-3 h-3"/>{r.created_at?new Date(r.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}):""}</span>
                                <span className="flex items-center gap-1 text-xs" style={{ color:"#5A7575" }}><Zap className="w-3 h-3"/>{r.skills?.length??0} skills</span>
                                {isLatest && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background:"rgba(10,61,61,0.08)", color:F }}>Latest</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {diff!==null && <span className="flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full" style={{ background:diff>0?"rgba(10,61,61,0.08)":diff<0?"rgba(184,58,42,0.08)":"rgba(10,61,61,0.04)", color:diff>0?F:diff<0?"#B83A2A":"#5A7575" }}>
                                {diff>0?<ArrowUp className="w-3 h-3"/>:diff<0?<ArrowDown className="w-3 h-3"/>:<Minus className="w-3 h-3"/>}{Math.abs(diff).toFixed(0)} pts
                              </span>}
                              <span className="text-xl font-bold" style={{ fontFamily:"'Space Grotesk',sans-serif", color:scoreColor(r.resume_score??0) }}>{r.resume_score}/100</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex gap-4 relative">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 border-dashed" style={{ background:"white", borderColor:"rgba(10,61,61,0.15)" }}>
                        <CheckCircle2 className="w-4 h-4" style={{ color:"rgba(10,61,61,0.2)" }}/>
                      </div>
                      <div className="flex-1 p-3 rounded-xl border border-dashed flex items-center text-sm mb-1" style={{ borderColor:"rgba(10,61,61,0.1)", color:"#5A7575" }}>
                        Upload your next improved resume to continue tracking
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}