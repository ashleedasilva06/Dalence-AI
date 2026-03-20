"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [errors, setErrors]     = useState<{ email?: string; password?: string; form?: string }>({});
  const [touched, setTouched]   = useState<{ email?: boolean; password?: boolean }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email)                           e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email    = "Enter a valid email";
    if (!password)                         e.password = "Password is required";
    else if (password.length < 6)          e.password = "At least 6 characters";
    return e;
  };

  const handleBlur = (field: "email" | "password") => {
    setTouched(p => ({ ...p, [field]: true }));
    setErrors(validate());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    try {
      await login(email, password);
      toast.success("Welcome back!");
      router.replace("/dashboard");
    } catch {
      setErrors({ form: "Incorrect email or password. Please try again." });
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setOauthLoading(provider);
    try {
      await signIn(provider, { callbackUrl: "/oauth-callback" });
    } catch {
      toast.error("Sign-in failed. Please try again.");
      setOauthLoading(null);
    }
  };

  const fieldCls = (field: "email" | "password") =>
    `w-full px-4 py-3 rounded-[10px] border-2 text-sm outline-none transition-all duration-200 bg-[#F3F0EA] text-[#0D1F1F] placeholder-[#5A7575]
     ${touched[field] && errors[field]
       ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
       : "border-[rgba(10,61,61,0.15)] focus:border-[#0A3D3D] focus:bg-white focus:ring-2 focus:ring-[rgba(10,61,61,0.08)]"}`;

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'DM Sans', sans-serif", background: "#FBF9F6" }}>

      {/* ── Left branding panel ──────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-12"
        style={{ background: "linear-gradient(145deg, #0A3D3D, #062727)" }}>

        {/* Gradient blobs */}
        <div className="absolute top-[-20%] right-[-15%] w-[60%] h-[60%] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(192,133,82,0.15) 0%, transparent 65%)" }} />
        <div className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(123,168,154,0.1) 0%, transparent 65%)" }} />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <img src="/logo/logo_dark.png" alt="Dalence" className="h-10 w-auto" />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: "#F0EDE6", letterSpacing: "-0.03em" }}>
            Dalence
          </span>
        </div>

        {/* Center */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-semibold tracking-wide"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(240,237,230,0.6)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#C08552" }} />
            AI-Powered Career Intelligence
          </div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(32px,3vw,44px)", color: "#F0EDE6", letterSpacing: "-0.03em", lineHeight: 1.1 }} className="mb-5">
            Your career,<br/>guided by <span style={{ color: "#C08552", fontStyle: "italic" }}>precision</span>
          </h2>
          <p className="mb-8 leading-relaxed max-w-sm" style={{ fontSize: 15, color: "rgba(240,237,230,0.5)" }}>
            Upload your resume and get instant AI analysis — skill gaps, career matches, and personalized guidance to land the role you deserve.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {["Resume scoring", "Skill gap analysis", "Career matching", "Interview prep", "AI advisor"].map(f => (
              <span key={f} className="text-xs font-medium px-3 py-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(240,237,230,0.55)" }}>
                {f}
              </span>
            ))}
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3 mt-8">
            <div className="flex">
              {[["#D4A574","#3D2814","AS"],["#7BA89A","#1A3030","RK"],["#C08552","#2D1F10","PM"],["#5A9A8A","#142828","NK"]].map(([bg,c,i]) => (
                <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold -ml-2 first:ml-0"
                  style={{ background: bg, color: c, border: "2.5px solid #062727" }}>{i}</div>
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "#F0EDE6" }}>2,000+ job seekers</p>
              <p className="text-xs" style={{ color: "rgba(240,237,230,0.4)" }}>already improving their resumes</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-3 gap-4 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {[["94%","User satisfaction"],["10+","AI modules"],["Rs. 0","Monthly cost"]].map(([n,l]) => (
            <div key={l}>
              <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 26, color: "#F0EDE6" }}>{n}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(240,237,230,0.4)" }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <img src="/logo/logo_dark.png" alt="Dalence" className="h-8 w-auto" style={{ filter: "brightness(0) saturate(100%) invert(28%) sepia(40%) saturate(600%) hue-rotate(130deg)" }} />
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, color: "#0A3D3D", letterSpacing: "-0.03em" }}>Dalence</span>
          </div>

          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 28, color: "#0D1F1F", letterSpacing: "-0.03em" }} className="mb-1">
            Welcome back
          </h1>
          <p className="text-sm mb-7" style={{ color: "#5A7575" }}>Sign in to continue your career journey</p>

          {/* OAuth buttons */}
          <div className="space-y-3 mb-6">
            <button onClick={() => handleOAuth("google")} disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-[10px] text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: "white", border: "2px solid rgba(10,61,61,0.15)", color: "#0D1F1F" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#F3F0EA")}
              onMouseLeave={e => (e.currentTarget.style.background = "white")}>
              {oauthLoading === "google"
                ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                : <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              }
              Continue with Google
            </button>

            <button onClick={() => handleOAuth("github")} disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-[10px] text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: "#0A3D3D", color: "white" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#C08552")}
              onMouseLeave={e => (e.currentTarget.style.background = "#0A3D3D")}>
              {oauthLoading === "github"
                ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                : <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              }
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: "1px solid rgba(10,61,61,0.1)" }} />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-[11px] uppercase tracking-widest font-semibold" style={{ background: "#FBF9F6", color: "#5A7575" }}>
                or with email
              </span>
            </div>
          </div>

          {/* Form error */}
          {errors.form && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-[10px] mb-5" style={{ background: "#FEF2F2", border: "1px solid rgba(220,38,38,0.2)" }}>
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
              <p className="text-sm text-red-600">{errors.form}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#2A4545" }}>Email address</label>
              <input type="email" autoComplete="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} onBlur={() => handleBlur("email")}
                className={fieldCls("email")} />
              {touched.email && errors.email && (
                <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#2A4545" }}>Password</label>
                <Link href="/forgot-password" className="text-xs font-medium transition-colors" style={{ color: "#C08552" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#0A3D3D")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#C08552")}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input type={showPw ? "text" : "password"} autoComplete="current-password" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} onBlur={() => handleBlur("password")}
                  className={`${fieldCls("password")} pr-11`} />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors p-0.5"
                  style={{ color: "#5A7575" }}>
                  {showPw
                    ? <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><path d="M1 1l22 22" strokeLinecap="round"/></svg>
                    : <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading}
              className="w-full py-3 rounded-[10px] text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
              style={{ background: "#0A3D3D", color: "white", fontFamily: "'DM Sans',sans-serif" }}
              onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = "#C08552"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#0A3D3D"; }}>
              {isLoading
                ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Signing in…</>
                : "Sign in →"}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: "#5A7575" }}>
            New to Dalence?{" "}
            <Link href="/register" className="font-semibold transition-colors" style={{ color: "#0A3D3D" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#C08552")}
              onMouseLeave={e => (e.currentTarget.style.color = "#0A3D3D")}>
              Create an account
            </Link>
          </p>

          {/* Trust bar */}
          <div className="flex items-center justify-center gap-5 mt-7 pt-6" style={{ borderTop: "1px solid rgba(10,61,61,0.08)" }}>
            {[["🔒","Secure login"],["⚡","Free forever"],["🌐","No spam"]].map(([icon,label]) => (
              <div key={label} className="flex items-center gap-1.5 text-[11px]" style={{ color: "#5A7575" }}>
                <span>{icon}</span>{label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}