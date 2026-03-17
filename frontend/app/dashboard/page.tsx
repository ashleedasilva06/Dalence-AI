"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { useAuthStore } from "@/lib/store";
import { resumeApi } from "@/lib/api";
import { Resume } from "@/types";
import {
  FileText, Briefcase, MessageSquare, TrendingUp,
  Upload, ArrowRight, Loader2, Star, Zap, Target, ClipboardList
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, Cell
} from "recharts";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resumeApi.list()
      .then(r => setResumes(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const latest = resumes.find(r => r.status === "analyzed") ?? resumes[0];
  const score = latest?.resume_score ?? 0;
  const skills = latest?.skills ?? [];
  const careers = latest?.career_matches ?? [];

  // Build radar data from skill categories
  const skillCategories = latest?.skill_scores
    ? buildRadarData(latest.skill_scores)
    : [];

  // Career match bar data
  const careerBarData = careers.slice(0, 5).map(c => ({
    name: c.title.replace(" Developer", " Dev").replace(" Engineer", " Eng"),
    score: Math.round((c.score ?? 0) * 100),
  }));

  const scoreColor = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
  const scoreLabel = score >= 75 ? "Strong" : score >= 50 ? "Good" : "Needs Work";

  return (
    <AppShell>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <h1 className="text-xl font-semibold text-gray-900">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Here's your career overview</p>
        </div>

        <div className="p-8 max-w-7xl mx-auto space-y-6">

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            </div>
          ) : !latest ? (
            // Empty state
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-1">No resume yet</h3>
              <p className="text-sm text-gray-400 mb-5">Upload your resume to unlock your career dashboard</p>
              <Link href="/resume" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all">
                <Upload className="w-4 h-4" /> Upload Resume
              </Link>
            </div>
          ) : (
            <>
              {/* Top stats row */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  {
                    label: "Resume Score",
                    value: score ? `${score}/100` : "—",
                    sub: scoreLabel,
                    icon: TrendingUp,
                    color: "text-indigo-600",
                    bg: "bg-indigo-50",
                  },
                  {
                    label: "Skills Detected",
                    value: skills.length || "—",
                    sub: "from your resume",
                    icon: Zap,
                    color: "text-emerald-600",
                    bg: "bg-emerald-50",
                  },
                  {
                    label: "Career Matches",
                    value: careers.length || "—",
                    sub: "AI-suggested paths",
                    icon: Target,
                    color: "text-amber-600",
                    bg: "bg-amber-50",
                  },
                  {
                    label: "Resumes",
                    value: resumes.length,
                    sub: `${resumes.filter(r => r.status === "analyzed").length} analyzed`,
                    icon: FileText,
                    color: "text-purple-600",
                    bg: "bg-purple-50",
                  },
                ].map(({ label, value, sub, icon: Icon, color, bg }) => (
                  <div key={label} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                    <p className="text-xs font-medium mt-1" style={{ color: label === "Resume Score" ? scoreColor : undefined }}>{sub}</p>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-2 gap-6">

                {/* Score gauge + skill summary */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-sm font-semibold text-gray-700 mb-4">Resume Score</h2>
                  <div className="flex items-center gap-6">
                    {/* SVG gauge */}
                    <div className="relative flex-shrink-0">
                      <svg width="140" height="80" viewBox="0 0 140 80">
                        {/* Background arc */}
                        <path
                          d="M 10 75 A 60 60 0 0 1 130 75"
                          fill="none" stroke="#f3f4f6" strokeWidth="12" strokeLinecap="round"
                        />
                        {/* Score arc */}
                        <path
                          d="M 10 75 A 60 60 0 0 1 130 75"
                          fill="none"
                          stroke={scoreColor}
                          strokeWidth="12"
                          strokeLinecap="round"
                          strokeDasharray={`${(score / 100) * 188.5} 188.5`}
                        />
                        <text x="70" y="68" textAnchor="middle" fontSize="22" fontWeight="700" fill={scoreColor}>{score || "—"}</text>
                      </svg>
                    </div>
                    {/* Score breakdown */}
                    <div className="flex-1 space-y-2">
                      {[
                        { label: "ATS Friendly", val: score >= 60 },
                        { label: "Skills Present", val: skills.length >= 5 },
                        { label: "Career Aligned", val: careers.length > 0 },
                        { label: "Analysis Done", val: !!latest.resume_score },
                      ].map(({ label, val }) => (
                        <div key={label} className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${val ? "bg-green-100" : "bg-gray-100"}`}>
                            <div className={`w-2 h-2 rounded-full ${val ? "bg-green-500" : "bg-gray-300"}`} />
                          </div>
                          <span className="text-xs text-gray-600">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggestions preview */}
                  {latest.suggestions && latest.suggestions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-50">
                      <p className="text-xs font-semibold text-gray-500 mb-2">Top suggestions</p>
                      {latest.suggestions.slice(0, 2).map((s: any, i: number) => (
                        <p key={i} className="text-xs text-gray-600 flex gap-1.5 mb-1">
                          <span className={s.severity === "high" ? "text-red-400" : "text-amber-400"}>•</span>
                          {s.fix}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Career matches bar chart */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-sm font-semibold text-gray-700 mb-4">Career Match Scores</h2>
                  {careerBarData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={careerBarData} layout="vertical" margin={{ left: 0, right: 20 }}>
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={110} />
                        <Tooltip
                          formatter={(v: number) => [`${v}%`, "Match"]}
                          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                        />
                        <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                          {careerBarData.map((_, i) => (
                            <Cell key={i} fill={i === 0 ? "#6366f1" : i === 1 ? "#8b5cf6" : i === 2 ? "#a78bfa" : "#c4b5fd"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-44 text-sm text-gray-400">
                      No career matches yet — upload and analyze a resume
                    </div>
                  )}
                </div>
              </div>

              {/* Radar chart + skills list */}
              <div className="grid grid-cols-2 gap-6">
                {/* Skills radar */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="text-sm font-semibold text-gray-700 mb-4">Skills Strength Radar</h2>
                  {skillCategories.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <RadarChart data={skillCategories}>
                        <PolarGrid stroke="#f3f4f6" />
                        <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: "#6b7280" }} />
                        <Radar
                          dataKey="score"
                          stroke="#6366f1"
                          fill="#6366f1"
                          fillOpacity={0.15}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-52 text-sm text-gray-400">
                      Skill radar will appear after analysis
                    </div>
                  )}
                </div>

                {/* Top skills + quick actions */}
                <div className="space-y-4">
                  {/* Top skills */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-700 mb-3">Top Skills</h2>
                    {skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {skills.slice(0, 12).map(skill => {
                          const s = latest.skill_scores?.[skill] ?? 0.5;
                          return (
                            <span key={skill}
                              className="px-2.5 py-1 rounded-xl text-xs font-medium border"
                              style={{
                                background: s >= 0.8 ? "#eef2ff" : s >= 0.6 ? "#f0fdf4" : "#f9fafb",
                                color: s >= 0.8 ? "#4338ca" : s >= 0.6 ? "#15803d" : "#6b7280",
                                borderColor: s >= 0.8 ? "#a5b4fc" : s >= 0.6 ? "#86efac" : "#e5e7eb",
                              }}
                            >
                              {skill}
                            </span>
                          );
                        })}
                        {skills.length > 12 && (
                          <span className="px-2.5 py-1 rounded-xl text-xs text-gray-400 border border-gray-100">
                            +{skills.length - 12} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No skills detected yet</p>
                    )}
                  </div>

                  {/* Quick actions */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h2>
                    <div className="space-y-2">
                      {[
                        { href: "/resume", label: "Analyze resume", icon: FileText, color: "text-indigo-600 bg-indigo-50" },
                        { href: "/jobs", label: "Match to jobs", icon: Briefcase, color: "text-emerald-600 bg-emerald-50" },
                        { href: "/interview", label: "Practice interview", icon: ClipboardList, color: "text-amber-600 bg-amber-50" },
                        { href: "/chatbot", label: "Ask AI advisor", icon: MessageSquare, color: "text-purple-600 bg-purple-50" },
                      ].map(({ href, label, icon: Icon, color }) => (
                        <Link key={href} href={href}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-all group"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-sm text-gray-700 font-medium group-hover:text-indigo-600 transition-colors">{label}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-300 ml-auto group-hover:text-indigo-400 transition-colors" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

// Build radar chart data from skill_scores
function buildRadarData(skillScores: Record<string, number>) {
  const categoryMap: Record<string, { label: string; keywords: string[] }> = {
    programming: { label: "Programming", keywords: ["python", "javascript", "java", "c++", "typescript", "r", "go", "rust"] },
    webdev:      { label: "Web Dev",     keywords: ["react", "next", "vue", "angular", "node", "fastapi", "django", "flask", "html", "css"] },
    data:        { label: "Data/ML",     keywords: ["pandas", "numpy", "sklearn", "tensorflow", "pytorch", "sql", "spark", "tableau", "power bi"] },
    cloud:       { label: "Cloud/DevOps",keywords: ["docker", "kubernetes", "aws", "gcp", "azure", "linux", "git", "ci/cd"] },
    databases:   { label: "Databases",   keywords: ["postgresql", "mysql", "mongodb", "redis", "sqlite"] },
    tools:       { label: "Tools",       keywords: ["git", "jupyter", "postman", "figma", "jira"] },
  };

  return Object.entries(categoryMap).map(([, { label, keywords }]) => {
    const matches = Object.entries(skillScores).filter(([skill]) =>
      keywords.some(k => skill.toLowerCase().includes(k))
    );
    const avg = matches.length
      ? Math.round((matches.reduce((s, [, v]) => s + v, 0) / matches.length) * 100)
      : 0;
    return { category: label, score: avg };
  }).filter(d => d.score > 0);
}