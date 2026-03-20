"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useAuthStore } from "@/lib/store";
import { profileApi } from "@/lib/api";
import toast from "react-hot-toast";
import { User, Mail, MapPin, Phone, Briefcase, GraduationCap, Linkedin, Github, Globe, Edit3, Save, X, Loader2, Target, Star, Building2, Calendar, Shield } from "lucide-react";

const F = "#0A3D3D", C = "#C08552", S = "#7BA89A";
const EDUCATION_LEVELS = ["High School","Diploma","B.Sc","B.Tech / B.E","BCA","MCA","M.Tech","MBA","PhD","Other"];
const EXPERIENCE_OPTIONS = [{ value:0,label:"Fresher (0 years)" },{ value:1,label:"1 year" },{ value:2,label:"2 years" },{ value:3,label:"3 years" },{ value:4,label:"4 years" },{ value:5,label:"5+ years" }];

interface Profile {
  id:string; name:string; email:string; role:string;
  avatar_url?:string; headline?:string; bio?:string;
  location?:string; phone?:string; years_experience?:number;
  target_role?:string; education_level?:string; college?:string;
  linkedin_url?:string; github_url?:string; portfolio_url?:string;
  oauth_provider?:string; created_at?:string;
}

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Profile>>({});

  useEffect(() => {
    profileApi.get().then(r => { setProfile(r.data); setForm(r.data); }).catch(() => toast.error("Failed to load profile")).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await profileApi.update(form);
      setProfile(data); setForm(data); setEditing(false);
      toast.success("Profile updated!");
    } catch { toast.error("Failed to save."); } finally { setSaving(false); }
  };

  const set = (key: keyof Profile, val: any) => setForm(f => ({ ...f, [key]: val }));
  const initials = (profile?.name || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0,2);

  const fieldCls = "w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all";
  const fieldStyle = { border:"1.5px solid rgba(10,61,61,0.15)", background:"#F3F0EA", color:"#0D1F1F" };
  const labelCls = "block text-xs font-semibold uppercase tracking-wide mb-1.5";

  if (loading) return (
    <AppShell>
      <div className="min-h-screen flex items-center justify-center" style={{ background:"#FBF9F6" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color:C }}/>
      </div>
    </AppShell>
  );

  const Card = ({ children, className="" }: any) => (
    <div className={`rounded-2xl ${className}`} style={{ background:"white", border:"1px solid rgba(10,61,61,0.08)", boxShadow:"0 2px 8px rgba(10,61,61,0.04)" }}>{children}</div>
  );

  return (
    <AppShell>
      <div className="min-h-screen" style={{ background:"#FBF9F6" }}>
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between" style={{ background:"white", borderBottom:"1px solid rgba(10,61,61,0.08)" }}>
          <div>
            <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:22, color:"#0D1F1F", letterSpacing:"-0.02em" }}>My Profile</h1>
            <p className="text-sm mt-0.5" style={{ color:"#5A7575" }}>Manage your personal and career information</p>
          </div>
          {!editing ? (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background:F, color:"white" }}
              onMouseEnter={e => (e.currentTarget.style.background = C)}
              onMouseLeave={e => (e.currentTarget.style.background = F)}>
              <Edit3 className="w-4 h-4"/> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => { setForm(profile ?? {}); setEditing(false); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{ background:"white", border:"1.5px solid rgba(10,61,61,0.15)", color:"#2A4545" }}>
                <X className="w-4 h-4"/> Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                style={{ background:F, color:"white" }}
                onMouseEnter={e => { if(!saving) e.currentTarget.style.background = C; }}
                onMouseLeave={e => { e.currentTarget.style.background = F; }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        <div className="p-8 max-w-5xl mx-auto space-y-5">

          {/* Hero card */}
          <Card>
            <div className="h-24 rounded-t-2xl" style={{ background:`linear-gradient(135deg, ${F}, ${S})` }}/>
            <div className="px-6 pb-6">
              <div className="flex items-end justify-between -mt-10 mb-4">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.name} className="w-20 h-20 rounded-2xl object-cover" style={{ border:"4px solid white", boxShadow:"0 4px 16px rgba(10,61,61,0.15)" }}/>
                ) : (
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background:`linear-gradient(135deg,${C},${S})`, border:"4px solid white", boxShadow:"0 4px 16px rgba(10,61,61,0.15)" }}>
                    <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:22, color:"white" }}>{initials}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background:"rgba(10,61,61,0.06)", border:"1px solid rgba(10,61,61,0.1)" }}>
                  <Shield className="w-3.5 h-3.5" style={{ color:F }}/>
                  <span className="text-xs font-medium capitalize" style={{ color:F }}>{profile?.role || "user"}</span>
                </div>
              </div>

              {editing ? (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelCls} style={{ color:"#2A4545" }}>Full name</label>
                    <input className={fieldCls} style={fieldStyle} value={form.name||""} onChange={e => set("name",e.target.value)} placeholder="Your full name"/>
                  </div>
                  <div>
                    <label className={labelCls} style={{ color:"#2A4545" }}>Headline</label>
                    <input className={fieldCls} style={fieldStyle} value={form.headline||""} onChange={e => set("headline",e.target.value)} placeholder="e.g. MCA Student | Python Developer"/>
                  </div>
                </div>
              ) : (
                <div className="mb-2">
                  <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:20, color:"#0D1F1F" }}>{profile?.name}</h2>
                  <p className="text-sm font-medium mt-0.5" style={{ color:C }}>{profile?.headline || <span className="italic" style={{ color:"#5A7575" }}>Add a headline</span>}</p>
                </div>
              )}

              {editing ? (
                <div>
                  <label className={labelCls} style={{ color:"#2A4545" }}>Bio</label>
                  <textarea className={fieldCls} style={{ ...fieldStyle, resize:"none" }} rows={3} value={form.bio||""} onChange={e => set("bio",e.target.value)} placeholder="A short bio about yourself…"/>
                </div>
              ) : (
                <p className="text-sm leading-relaxed" style={{ color:"#5A7575" }}>{profile?.bio || <span className="italic">No bio added yet</span>}</p>
              )}

              {!editing && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {profile?.location && <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ background:"#F3F0EA", color:"#5A7575", border:"1px solid rgba(10,61,61,0.08)" }}><MapPin className="w-3 h-3"/>{profile.location}</span>}
                  {profile?.target_role && <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ background:"rgba(192,133,82,0.08)", color:C, border:"1px solid rgba(192,133,82,0.15)" }}><Target className="w-3 h-3"/>{profile.target_role}</span>}
                  {profile?.education_level && <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ background:"#F3F0EA", color:"#5A7575", border:"1px solid rgba(10,61,61,0.08)" }}><GraduationCap className="w-3 h-3"/>{profile.education_level}</span>}
                  {profile?.years_experience !== undefined && profile?.years_experience !== null && (
                    <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ background:"#F3F0EA", color:"#5A7575", border:"1px solid rgba(10,61,61,0.08)" }}>
                      <Briefcase className="w-3 h-3"/>{profile.years_experience === 0 ? "Fresher" : `${profile.years_experience} yr${profile.years_experience !== 1 ? "s" : ""} exp`}
                    </span>
                  )}
                  {profile?.created_at && (
                    <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ background:"#F3F0EA", color:"#5A7575", border:"1px solid rgba(10,61,61,0.08)" }}>
                      <Calendar className="w-3 h-3"/>Joined {new Date(profile.created_at).toLocaleDateString("en-IN",{month:"short",year:"numeric"})}
                    </span>
                  )}
                </div>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-5">
            {/* Personal info */}
            <Card className="p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide mb-4 flex items-center gap-2" style={{ color:"#2A4545" }}>
                <User className="w-4 h-4" style={{ color:F }}/> Personal Info
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={labelCls} style={{ color:"#2A4545" }}>Email</label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background:"#F3F0EA", border:"1.5px solid rgba(10,61,61,0.1)" }}>
                    <Mail className="w-4 h-4 flex-shrink-0" style={{ color:"#5A7575" }}/>
                    <span className="text-sm flex-1 truncate" style={{ color:"#5A7575" }}>{profile?.email}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background:"rgba(123,168,154,0.15)", color:"#3D7A6A" }}>verified</span>
                  </div>
                </div>
                {editing ? (
                  <>
                    <div>
                      <label className={labelCls} style={{ color:"#2A4545" }}>Phone</label>
                      <input className={fieldCls} style={fieldStyle} value={form.phone||""} onChange={e => set("phone",e.target.value)} placeholder="+91 9876543210"/>
                    </div>
                    <div>
                      <label className={labelCls} style={{ color:"#2A4545" }}>Location</label>
                      <input className={fieldCls} style={fieldStyle} value={form.location||""} onChange={e => set("location",e.target.value)} placeholder="Goa, India"/>
                    </div>
                  </>
                ) : (
                  <>
                    <InfoRow icon={<Phone className="w-4 h-4"/>} label="Phone" value={profile?.phone}/>
                    <InfoRow icon={<MapPin className="w-4 h-4"/>} label="Location" value={profile?.location}/>
                  </>
                )}
              </div>
            </Card>

            {/* Career info */}
            <Card className="p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide mb-4 flex items-center gap-2" style={{ color:"#2A4545" }}>
                <Briefcase className="w-4 h-4" style={{ color:F }}/> Career Info
              </h3>
              <div className="space-y-4">
                {editing ? (
                  <>
                    <div>
                      <label className={labelCls} style={{ color:"#2A4545" }}>Target Role</label>
                      <input className={fieldCls} style={fieldStyle} value={form.target_role||""} onChange={e => set("target_role",e.target.value)} placeholder="e.g. Full Stack Developer"/>
                    </div>
                    <div>
                      <label className={labelCls} style={{ color:"#2A4545" }}>Experience</label>
                      <select className={fieldCls} style={fieldStyle} value={form.years_experience??""} onChange={e => set("years_experience",Number(e.target.value))}>
                        <option value="">Select experience</option>
                        {EXPERIENCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls} style={{ color:"#2A4545" }}>Education Level</label>
                      <select className={fieldCls} style={fieldStyle} value={form.education_level||""} onChange={e => set("education_level",e.target.value)}>
                        <option value="">Select education</option>
                        {EDUCATION_LEVELS.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls} style={{ color:"#2A4545" }}>College / University</label>
                      <input className={fieldCls} style={fieldStyle} value={form.college||""} onChange={e => set("college",e.target.value)} placeholder="e.g. Goa University"/>
                    </div>
                  </>
                ) : (
                  <>
                    <InfoRow icon={<Target className="w-4 h-4"/>} label="Target Role" value={profile?.target_role}/>
                    <InfoRow icon={<Star className="w-4 h-4"/>} label="Experience" value={profile?.years_experience !== undefined && profile?.years_experience !== null ? EXPERIENCE_OPTIONS.find(o => o.value === profile.years_experience)?.label : undefined}/>
                    <InfoRow icon={<GraduationCap className="w-4 h-4"/>} label="Education" value={profile?.education_level}/>
                    <InfoRow icon={<Building2 className="w-4 h-4"/>} label="College" value={profile?.college}/>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Social links */}
          <Card className="p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide mb-4 flex items-center gap-2" style={{ color:"#2A4545" }}>
              <Globe className="w-4 h-4" style={{ color:F }}/> Social & Links
            </h3>
            {editing ? (
              <div className="grid grid-cols-3 gap-4">
                {[
                  { key:"linkedin_url", label:"LinkedIn", icon:<Linkedin className="w-3.5 h-3.5"/>, placeholder:"linkedin.com/in/yourname" },
                  { key:"github_url", label:"GitHub", icon:<Github className="w-3.5 h-3.5"/>, placeholder:"github.com/yourname" },
                  { key:"portfolio_url", label:"Portfolio", icon:<Globe className="w-3.5 h-3.5"/>, placeholder:"yourportfolio.com" },
                ].map(({ key, label, icon, placeholder }) => (
                  <div key={key}>
                    <label className={labelCls} style={{ color:"#2A4545" }}>
                      <span className="flex items-center gap-1">{icon}{label}</span>
                    </label>
                    <input className={fieldCls} style={fieldStyle} value={(form as any)[key]||""} onChange={e => set(key as keyof Profile, e.target.value)} placeholder={placeholder}/>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <SocialLink icon={<Linkedin className="w-4 h-4"/>} label="LinkedIn" url={profile?.linkedin_url} color={{ bg:"rgba(10,102,194,0.06)", border:"rgba(10,102,194,0.12)", text:"#0A66C2" }}/>
                <SocialLink icon={<Github className="w-4 h-4"/>} label="GitHub" url={profile?.github_url} color={{ bg:"rgba(10,61,61,0.05)", border:"rgba(10,61,61,0.12)", text:F }}/>
                <SocialLink icon={<Globe className="w-4 h-4"/>} label="Portfolio" url={profile?.portfolio_url} color={{ bg:"rgba(192,133,82,0.06)", border:"rgba(192,133,82,0.15)", text:C }}/>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background:"#F3F0EA", border:"1px solid rgba(10,61,61,0.08)", color:"#5A7575" }}>{icon}</div>
      <div>
        <p className="text-xs" style={{ color:"#5A7575" }}>{label}</p>
        <p className="text-sm font-medium" style={{ color: value ? "#0D1F1F" : "#5A7575", fontStyle: value ? "normal" : "italic" }}>{value || "Not added"}</p>
      </div>
    </div>
  );
}

function SocialLink({ icon, label, url, color }: { icon: React.ReactNode; label: string; url?: string; color: { bg: string; border: string; text: string } }) {
  return url ? (
    <a href={url.startsWith("http") ? url : `https://${url}`} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-all hover:opacity-80"
      style={{ background:color.bg, borderColor:color.border, color:color.text }}>
      {icon}
      <div className="min-w-0">
        <p className="text-xs opacity-60">{label}</p>
        <p className="text-xs font-semibold truncate">{url.replace(/^https?:\/\//,"")}</p>
      </div>
    </a>
  ) : (
    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-dashed" style={{ borderColor:"rgba(10,61,61,0.1)", color:"#5A7575" }}>
      {icon}
      <div>
        <p className="text-xs">{label}</p>
        <p className="text-xs italic">Not added</p>
      </div>
    </div>
  );
}