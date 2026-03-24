"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useAuthStore } from "@/lib/store";
import api from "@/lib/api";
import { Users, FileText, TrendingUp, Activity, Shield, CheckCircle2, AlertCircle, Loader2, Database, Zap, Globe } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const F = "#0A3D3D", C = "#C08552", S = "#7BA89A";

export default function AdminPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<"ok"|"error"|"checking">("checking");

  useEffect(() => {
    if (user?.role !== "admin") return;
    Promise.all([
      api.get("/api/admin/stats").then(r => setStats(r.data)).catch(() => {}),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/health`)
        .then(r => r.ok ? setHealth("ok") : setHealth("error"))
        .catch(() => setHealth("error")),
    ]).finally(() => setLoading(false));
  }, [user]);

  const Card = ({ children, className="" }: any) => (
    <div className={`rounded-2xl ${className}`} style={{ background:"white", border:"1px solid rgba(10,61,61,0.08)", boxShadow:"0 2px 8px rgba(10,61,61,0.04)" }}>{children}</div>
  );

  if (user?.role !== "admin") {
    return (
      <AppShell>
        <div className="min-h-screen flex items-center justify-center" style={{ background:"#FBF9F6" }}>
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background:"rgba(184,58,42,0.08)" }}>
              <Shield className="w-8 h-8" style={{ color:"#B83A2A" }}/>
            </div>
            <h2 className="font-bold text-lg mb-1" style={{ fontFamily:"'Space Grotesk',sans-serif", color:"#0D1F1F" }}>Access Denied</h2>
            <p className="text-sm" style={{ color:"#5A7575" }}>Admin access required</p>
          </div>
        </div>
      </AppShell>
    );
  }

  const statCards = [
    { label:"Total Users", value:stats?.total_users ?? "—", icon:Users, color:F, bg:"rgba(10,61,61,0.07)" },
    { label:"Resumes Analyzed", value:stats?.total_resumes ?? "—", icon:FileText, color:S, bg:"rgba(123,168,154,0.1)" },
    { label:"Avg Resume Score", value:stats?.avg_score ? `${stats.avg_score.toFixed(1)}/100` : "—", icon:TrendingUp, color:C, bg:"rgba(192,133,82,0.1)" },
    { label:"Active Today", value:stats?.active_today ?? "—", icon:Activity, color:"#5A9A8A", bg:"rgba(90,154,138,0.1)" },
  ];

  const skillsData = stats?.top_skills?.slice(0,8).map((s: any) => ({ name: s.skill.length > 12 ? s.skill.slice(0,12)+"…" : s.skill, count: s.count })) ?? [];
  const careersData = stats?.top_careers?.slice(0,5).map((c: any) => ({ name: c.title.replace(" Developer","Dev").replace(" Engineer","Eng"), count: c.count })) ?? [];

  return (
    <AppShell>
      <div className="min-h-screen" style={{ background:"#FBF9F6" }}>
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between" style={{ background:"white", borderBottom:"1px solid rgba(10,61,61,0.08)" }}>
          <div>
            <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:22, color:"#0D1F1F", letterSpacing:"-0.02em" }}>Admin Dashboard</h1>
            <p className="text-sm mt-0.5" style={{ color:"#5A7575" }}>Platform analytics and system health</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: health==="ok"?"rgba(123,168,154,0.1)":health==="error"?"rgba(184,58,42,0.08)":"rgba(10,61,61,0.05)", border:`1px solid ${health==="ok"?"rgba(123,168,154,0.2)":health==="error"?"rgba(184,58,42,0.15)":"rgba(10,61,61,0.1)"}` }}>
            {health==="checking" ? <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color:"#5A7575" }}/> : health==="ok" ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color:"#3D7A6A" }}/> : <AlertCircle className="w-3.5 h-3.5" style={{ color:"#B83A2A" }}/>}
            <span className="text-xs font-medium" style={{ color: health==="ok"?"#3D7A6A":health==="error"?"#B83A2A":"#5A7575" }}>
              {health==="checking"?"Checking…":health==="ok"?"Backend Online":"Backend Offline"}
            </span>
          </div>
        </div>

        <div className="p-8 max-w-7xl mx-auto space-y-6">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" style={{ color:C }}/></div>
          ) : (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-4 gap-4">
                {statCards.map(({ label, value, icon:Icon, color, bg }) => (
                  <Card key={label} className="p-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background:bg }}>
                      <Icon className="w-5 h-5" style={{ color }}/>
                    </div>
                    <p className="text-2xl font-bold" style={{ fontFamily:"'Space Grotesk',sans-serif", color:"#0D1F1F" }}>{value}</p>
                    <p className="text-xs mt-0.5" style={{ color:"#5A7575" }}>{label}</p>
                  </Card>
                ))}
              </div>

              {/* System info */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon:Database, label:"Database", value:"PostgreSQL · Neon", status:"Connected", color:F },
                  { icon:Zap, label:"AI Provider", value:"Groq Llama 3.3 70B", status:"Active", color:C },
                  { icon:Globe, label:"File Storage", value:"Cloudinary CDN", status:"Active", color:S },
                ].map(({ icon:Icon, label, value, status, color }) => (
                  <Card key={label} className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:`${color}14` }}>
                      <Icon className="w-5 h-5" style={{ color }}/>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color:"#5A7575" }}>{label}</p>
                      <p className="text-sm font-semibold" style={{ color:"#0D1F1F" }}>{value}</p>
                      <p className="text-xs font-medium" style={{ color:"#3D7A6A" }}>● {status}</p>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-2 gap-6">
                <Card className="p-5">
                  <h2 className="text-sm font-semibold mb-4" style={{ fontFamily:"'Space Grotesk',sans-serif", color:"#2A4545" }}>Top Skills Detected</h2>
                  {skillsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={skillsData} layout="vertical" margin={{ left:0, right:20 }}>
                        <XAxis type="number" tick={{ fontSize:10, fill:"#5A7575" }} tickLine={false} axisLine={false}/>
                        <YAxis type="category" dataKey="name" tick={{ fontSize:11, fill:"#2A4545" }} tickLine={false} axisLine={false} width={90}/>
                        <Tooltip contentStyle={{ fontSize:12, borderRadius:10, border:"1px solid rgba(10,61,61,0.1)" }}/>
                        <Bar dataKey="count" radius={[0,6,6,0]}>
                          {skillsData.map((_: any, i: number) => <Cell key={i} fill={i===0?F:i===1?"#1A5A5A":i===2?S:"#8BC4B4"}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div className="h-52 flex items-center justify-center text-sm" style={{ color:"#5A7575" }}>No data yet</div>}
                </Card>

                <Card className="p-5">
                  <h2 className="text-sm font-semibold mb-4" style={{ fontFamily:"'Space Grotesk',sans-serif", color:"#2A4545" }}>Top Career Matches</h2>
                  {careersData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={careersData} layout="vertical" margin={{ left:0, right:20 }}>
                        <XAxis type="number" tick={{ fontSize:10, fill:"#5A7575" }} tickLine={false} axisLine={false}/>
                        <YAxis type="category" dataKey="name" tick={{ fontSize:11, fill:"#2A4545" }} tickLine={false} axisLine={false} width={90}/>
                        <Tooltip contentStyle={{ fontSize:12, borderRadius:10, border:"1px solid rgba(10,61,61,0.1)" }}/>
                        <Bar dataKey="count" radius={[0,6,6,0]}>
                          {careersData.map((_: any, i: number) => <Cell key={i} fill={i===0?C:i===1?"#D4A574":i===2?"#E5C4A0":"#F0DCC8"}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div className="h-52 flex items-center justify-center text-sm" style={{ color:"#5A7575" }}>No data yet</div>}
                </Card>
              </div>

              {/* Recent users */}
              {stats?.recent_users?.length > 0 && (
                <Card className="p-5">
                  <h2 className="text-sm font-semibold mb-4" style={{ fontFamily:"'Space Grotesk',sans-serif", color:"#2A4545" }}>Recent Users</h2>
                  <div className="space-y-2">
                    {stats.recent_users.map((u: any) => {
                      const initials = u.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0,2);
                      return (
                        <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background:"#F3F0EA" }}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background:`linear-gradient(135deg,${F},${S})`, color:"white", fontFamily:"'Space Grotesk',sans-serif" }}>{initials}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color:"#0D1F1F" }}>{u.name}</p>
                            <p className="text-xs truncate" style={{ color:"#5A7575" }}>{u.email}</p>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: u.oauth_provider?"rgba(123,168,154,0.15)":"rgba(10,61,61,0.08)", color: u.oauth_provider?"#3D7A6A":F }}>
                            {u.oauth_provider || "email"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}