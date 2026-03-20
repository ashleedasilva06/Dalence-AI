"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { useAuthStore } from "@/lib/store";
import { resumeApi } from "@/lib/api";
import { Resume } from "@/types";
import {
  FileText, Briefcase, MessageSquare, TrendingUp,
  Upload, ArrowRight, Loader2, Zap, Target, ClipboardList
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, Cell
} from "recharts";

const FOREST = "#0A3D3D";
const COPPER = "#C08552";
const SAGE   = "#7BA89A";

export default function DashboardPage() {
  const { user, token, setOAuthSession } = useAuthStore();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    const sync = async () => {
      if (token) { setSynced(true); return; }
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const session = await res.json();
        if (session?.backendToken && session?.backendUser)
          setOAuthSession(session.backendToken, session.backendUser);
      } catch {}
      setSynced(true);
    };
    sync();
  }, []);

  useEffect(() => {
    if (!synced) return;
    resumeApi.list().then(r => setResumes(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, [synced]);

  const latest   = resumes.find(r => r.status === "analyzed") ?? resumes[0];
  const score    = latest?.resume_score ?? 0;
  const skills   = latest?.skills ?? [];
  const careers  = latest?.career_matches ?? [];
  const radarData = latest?.skill_scores ? buildRadar(latest.skill_scores) : [];
  const barData   = careers.slice(0, 5).map(c => ({
    name: c.title.replace(" Developer","Dev").replace(" Engineer","Eng"),
    score: Math.round((c.score ?? 0) * 100),
  }));

  const scoreColor = score >= 75 ? "#0A3D3D" : score >= 50 ? "#C08552" : "#B83A2A";
  const scoreBg    = score >= 75 ? "rgba(10,61,61,0.08)" : score >= 50 ? "rgba(192,133,82,0.08)" : "rgba(184,58,42,0.08)";
  const scoreLabel = score >= 75 ? "Strong" : score >= 50 ? "Good" : "Needs Work";

  const Card = ({ children, className = "" }: any) => (
    <div className={`rounded-2xl p-5 ${className}`}
      style={{ background: "white", border: "1px solid rgba(10,61,61,0.08)", boxShadow: "0 2px 8px rgba(10,61,61,0.04), 0 8px 24px rgba(10,61,61,0.04)" }}>
      {children}
    </div>
  );

  return (
    <AppShell>
      <div className="min-h-screen" style={{ background: "#FBF9F6" }}>
        {/* Header */}
        <div className="px-8 py-6" style={{ background: "white", borderBottom: "1px solid rgba(10,61,61,0.08)" }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: "#0D1F1F", letterSpacing: "-0.02em" }}>
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#5A7575" }}>Here's your career overview</p>
        </div>

        <div className="p-8 max-w-7xl mx-auto space-y-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: COPPER }} />
            </div>
          ) : !latest ? (
            <Card>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(10,61,61,0.06)" }}>
                  <FileText className="w-8 h-8" style={{ color: FOREST }} />
                </div>
                <h3 className="font-semibold mb-1" style={{ fontFamily: "'Space Grotesk',sans-serif", color: "#0D1F1F" }}>No resume yet</h3>
                <p className="text-sm mb-5" style={{ color: "#5A7575" }}>Upload your resume to unlock your career dashboard</p>
                <Link href="/resume"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: FOREST, color: "white" }}
                  onMouseEnter={e => (e.currentTarget.style.background = COPPER)}
                  onMouseLeave={e => (e.currentTarget.style.background = FOREST)}>
                  <Upload className="w-4 h-4" /> Upload Resume
                </Link>
              </div>
            </Card>
          ) : (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Resume Score", value: score ? `${score}/100` : "—", sub: scoreLabel, icon: TrendingUp, color: scoreColor, bg: scoreBg },
                  { label: "Skills Detected", value: skills.length || "—", sub: "from your resume", icon: Zap, color: SAGE, bg: "rgba(123,168,154,0.1)" },
                  { label: "Career Matches", value: careers.length || "—", sub: "AI-suggested paths", icon: Target, color: COPPER, bg: "rgba(192,133,82,0.1)" },
                  { label: "Resumes", value: resumes.length, sub: `${resumes.filter(r => r.status === "analyzed").length} analyzed`, icon: FileText, color: FOREST, bg: "rgba(10,61,61,0.07)" },
                ].map(({ label, value, sub, icon: Icon, color, bg }) => (
                  <Card key={label}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <p className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk',sans-serif", color: "#0D1F1F" }}>{value}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#5A7575" }}>{label}</p>
                    <p className="text-xs font-semibold mt-1" style={{ color }}>{sub}</p>
                  </Card>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-2 gap-6">
                {/* Score gauge */}
                <Card>
                  <h2 className="text-sm font-semibold mb-4" style={{ fontFamily: "'Space Grotesk',sans-serif", color: "#2A4545" }}>Resume Score</h2>
                  <div className="flex items-center gap-6">
                    <div className="relative flex-shrink-0">
                      <svg width="140" height="80" viewBox="0 0 140 80">
                        <path d="M 10 75 A 60 60 0 0 1 130 75" fill="none" stroke="#F3F0EA" strokeWidth="12" strokeLinecap="round"/>
                        <path d="M 10 75 A 60 60 0 0 1 130 75" fill="none" stroke={scoreColor} strokeWidth="12" strokeLinecap="round"
                          strokeDasharray={`${(score/100)*188.5} 188.5`}/>
                        <text x="70" y="68" textAnchor="middle" fontSize="22" fontWeight="700" fill={scoreColor}>{score||"—"}</text>
                      </svg>
                    </div>
                    <div className="flex-1 space-y-2.5">
                      {[
                        { label: "ATS Friendly", val: score >= 60 },
                        { label: "Skills Present", val: skills.length >= 5 },
                        { label: "Career Aligned", val: careers.length > 0 },
                        { label: "Analysis Done", val: !!latest.resume_score },
                      ].map(({ label, val }) => (
                        <div key={label} className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: val ? "rgba(10,61,61,0.1)" : "rgba(10,61,61,0.04)" }}>
                            <div className="w-2 h-2 rounded-full" style={{ background: val ? FOREST : "rgba(10,61,61,0.2)" }} />
                          </div>
                          <span className="text-xs" style={{ color: "#5A7575" }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {latest.suggestions && latest.suggestions.length > 0 && (
                    <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(10,61,61,0.06)" }}>
                      <p className="text-xs font-semibold mb-2" style={{ color: "#2A4545" }}>Top suggestions</p>
                      {latest.suggestions.slice(0, 2).map((s: any, i: number) => (
                        <p key={i} className="text-xs flex gap-1.5 mb-1" style={{ color: "#5A7575" }}>
                          <span style={{ color: s.severity === "high" ? "#B83A2A" : COPPER }}>•</span>{s.fix}
                        </p>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Career bar chart */}
                <Card>
                  <h2 className="text-sm font-semibold mb-4" style={{ fontFamily: "'Space Grotesk',sans-serif", color: "#2A4545" }}>Career Match Scores</h2>
                  {barData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 20 }}>
                        <XAxis type="number" domain={[0,100]} tick={{ fontSize: 10, fill: "#5A7575" }} tickLine={false} axisLine={false}/>
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#2A4545" }} tickLine={false} axisLine={false} width={110}/>
                        <Tooltip formatter={(v: number) => [`${v}%`, "Match"]}
                          contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid rgba(10,61,61,0.1)", background: "white" }}/>
                        <Bar dataKey="score" radius={[0,6,6,0]}>
                          {barData.map((_,i) => (
                            <Cell key={i} fill={i===0 ? FOREST : i===1 ? "#1A5A5A" : i===2 ? SAGE : i===3 ? "#5A9A8A" : "#8BC4B4"}/>
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-44 text-sm" style={{ color: "#5A7575" }}>No career matches yet</div>
                  )}
                </Card>
              </div>

              {/* Radar + skills + quick actions */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <h2 className="text-sm font-semibold mb-4" style={{ fontFamily: "'Space Grotesk',sans-serif", color: "#2A4545" }}>Skills Strength Radar</h2>
                  {radarData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(10,61,61,0.08)"/>
                        <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: "#5A7575" }}/>
                        <Radar dataKey="score" stroke={FOREST} fill={FOREST} fillOpacity={0.1} strokeWidth={2}/>
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-52 text-sm" style={{ color: "#5A7575" }}>Skill radar appears after analysis</div>
                  )}
                </Card>

                <div className="space-y-4">
                  {/* Top skills */}
                  <Card>
                    <h2 className="text-sm font-semibold mb-3" style={{ fontFamily: "'Space Grotesk',sans-serif", color: "#2A4545" }}>Top Skills</h2>
                    {skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {skills.slice(0, 12).map(skill => {
                          const s = latest.skill_scores?.[skill] ?? 0.5;
                          return (
                            <span key={skill} className="px-2.5 py-1 rounded-full text-xs font-medium"
                              style={{
                                background: s >= 0.8 ? "rgba(10,61,61,0.08)" : s >= 0.6 ? "rgba(123,168,154,0.12)" : "rgba(10,61,61,0.04)",
                                color: s >= 0.8 ? FOREST : s >= 0.6 ? "#3D7A6A" : "#5A7575",
                                border: `1px solid ${s >= 0.8 ? "rgba(10,61,61,0.15)" : s >= 0.6 ? "rgba(123,168,154,0.2)" : "rgba(10,61,61,0.08)"}`,
                              }}>
                              {skill}
                            </span>
                          );
                        })}
                      </div>
                    ) : <p className="text-sm" style={{ color: "#5A7575" }}>No skills detected yet</p>}
                  </Card>

                  {/* Quick actions */}
                  <Card>
                    <h2 className="text-sm font-semibold mb-3" style={{ fontFamily: "'Space Grotesk',sans-serif", color: "#2A4545" }}>Quick Actions</h2>
                    <div className="space-y-1.5">
                      {[
                        { href: "/resume",    label: "Analyze resume",      icon: FileText,     color: FOREST, bg: "rgba(10,61,61,0.07)" },
                        { href: "/jobs",      label: "Match to jobs",       icon: Briefcase,    color: SAGE,   bg: "rgba(123,168,154,0.1)" },
                        { href: "/interview", label: "Practice interview",  icon: ClipboardList,color: COPPER, bg: "rgba(192,133,82,0.1)" },
                        { href: "/chatbot",   label: "Ask AI advisor",      icon: MessageSquare,color: "#5A9A8A", bg: "rgba(90,154,138,0.1)" },
                      ].map(({ href, label, icon: Icon, color, bg }) => (
                        <Link key={href} href={href}
                          className="flex items-center gap-3 p-2.5 rounded-xl transition-all group"
                          style={{ color: "#2A4545" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(10,61,61,0.03)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                            <Icon className="w-4 h-4" style={{ color }} />
                          </div>
                          <span className="text-sm font-medium">{label}</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-30 group-hover:opacity-60 transition-opacity" />
                        </Link>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function buildRadar(skillScores: Record<string, number>) {
  const cats: Record<string, { label: string; keywords: string[] }> = {
    programming: { label: "Programming", keywords: ["python","javascript","java","c++","typescript","r","go"] },
    webdev:      { label: "Web Dev",     keywords: ["react","next","vue","angular","node","fastapi","django"] },
    data:        { label: "Data/ML",     keywords: ["pandas","numpy","sklearn","tensorflow","pytorch","sql"] },
    cloud:       { label: "Cloud/DevOps",keywords: ["docker","kubernetes","aws","gcp","azure","linux","git"] },
    databases:   { label: "Databases",   keywords: ["postgresql","mysql","mongodb","redis"] },
    tools:       { label: "Tools",       keywords: ["git","jupyter","postman","figma","jira"] },
  };
  return Object.values(cats).map(({ label, keywords }) => {
    const matches = Object.entries(skillScores).filter(([s]) => keywords.some(k => s.toLowerCase().includes(k)));
    const avg = matches.length ? Math.round(matches.reduce((a,[,v]) => a+v,0) / matches.length * 100) : 0;
    return { category: label, score: avg };
  }).filter(d => d.score > 0);
}