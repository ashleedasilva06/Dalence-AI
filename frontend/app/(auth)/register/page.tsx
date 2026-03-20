"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/lib/store";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [showCf, setShowCf]     = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [touched, setTouched]   = useState<Record<string, boolean>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())                     e.name     = "Full name is required";
    if (!email)                            e.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email))  e.email    = "Enter a valid email";
    if (!password)                          e.password = "Password is required";
    else if (password.length < 6)           e.password = "At least 6 characters";
    if (!confirm)                           e.confirm  = "Please confirm your password";
    else if (confirm !== password)          e.confirm  = "Passwords do not match";
    return e;
  };

  const handleBlur = (field: string) => {
    setTouched(p => ({ ...p, [field]: true }));
    setErrors(validate());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirm: true });
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      await register(name, email, password);
      toast.success("Welcome to Dalence! 🎉");
      router.replace("/dashboard");
    } catch {
      setErrors({ form: "This email is already registered. Try signing in instead." });
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

  // Password strength
  const strength = !password ? 0
    : password.length < 6 ? 1
    : /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 4
    : password.length >= 10 ? 3 : 2;
  const strengthConfig = [
    { label: "", color: "" },
    { label: "Weak", color: "#dc2626" },
    { label: "Fair", color: "#C08552" },
    { label: "Good", color: "#7BA89A" },
    { label: "Strong", color: "#0A3D3D" },
  ];

  const fieldCls = (field: string) =>
    `w-full px-4 py-3 rounded-[10px] border-2 text-sm outline-none transition-all duration-200 bg-[#F3F0EA] text-[#0D1F1F] placeholder-[#5A7575]
     ${touched[field] && errors[field]
       ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
       : "border-[rgba(10,61,61,0.15)] focus:border-[#0A3D3D] focus:bg-white focus:ring-2 focus:ring-[rgba(10,61,61,0.08)]"}`;

  const ErrMsg = ({ field }: { field: string }) =>
    touched[field] && errors[field] ? (
      <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500">
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
        {errors[field]}
      </p>
    ) : null;

  const EyeBtn = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
    <button type="button" onClick={toggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 transition-colors"
      style={{ color: "#5A7575" }}>
      {show
        ? <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><path d="M1 1l22 22" strokeLinecap="round"/></svg>
        : <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      }
    </button>
  );

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'DM Sans', sans-serif", background: "#FBF9F6" }}>

      {/* ── Left panel ───────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-12"
        style={{ background: "linear-gradient(145deg, #0A3D3D, #062727)" }}>
        <div className="absolute top-[-20%] right-[-15%] w-[60%] h-[60%] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(192,133,82,0.15) 0%, transparent 65%)" }} />
        <div className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(123,168,154,0.1) 0%, transparent 65%)" }} />

        <div className="relative flex items-center gap-3">
          <img src="/logo/logo_dark.png" alt="Dalence" className="h-10 w-auto" />
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22, color: "#F0EDE6", letterSpacing: "-0.03em" }}>Dalence</span>
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-xs font-semibold tracking-wide"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(240,237,230,0.6)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#7BA89A" }} />
            Free forever — no credit card needed
          </div>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: "clamp(30px,3vw,42px)", color: "#F0EDE6", letterSpacing: "-0.03em", lineHeight: 1.1 }} className="mb-5">
            Start your<br/>smarter career <span style={{ color: "#C08552", fontStyle: "italic" }}>journey</span>
          </h2>
          <p className="mb-8 leading-relaxed max-w-sm" style={{ fontSize: 15, color: "rgba(240,237,230,0.5)" }}>
            Join thousands of students and professionals using Dalence to accelerate their career growth with AI.
          </p>

          <div className="flex flex-col gap-4">
            {[["01","Upload your resume","PDF or DOCX, any format"],["02","Get AI analysis","Skills, gaps, career matches"],["03","Land your dream job","Apply with confidence"]].map(([n,t,s]) => (
              <div key={n} className="flex items-start gap-4">
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 12, color: "#C08552", width: 28, flexShrink: 0, marginTop: 1 }}>{n}</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "rgba(240,237,230,0.9)" }}>{t}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(240,237,230,0.4)" }}>{s}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative grid grid-cols-3 gap-4 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {[["2K+","Resumes analyzed"],["6","AI-powered tools"],["Rs. 0","Monthly cost"]].map(([n,l]) => (
            <div key={l}>
              <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 26, color: "#F0EDE6" }}>{n}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(240,237,230,0.4)" }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[400px] py-6">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <img src="/logo/logo_dark.png" alt="Dalence" className="h-8 w-auto" style={{ filter: "brightness(0) saturate(100%) invert(28%) sepia(40%) saturate(600%) hue-rotate(130deg)" }} />
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, color: "#0A3D3D", letterSpacing: "-0.03em" }}>Dalence</span>
          </div>

          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 28, color: "#0D1F1F", letterSpacing: "-0.03em" }} className="mb-1">
            Create your account
          </h1>
          <p className="text-sm mb-7" style={{ color: "#5A7575" }}>Free forever — start improving your resume today</p>

          {/* OAuth */}
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

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: "1px solid rgba(10,61,61,0.1)" }} />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-[11px] uppercase tracking-widest font-semibold" style={{ background: "#FBF9F6", color: "#5A7575" }}>or with email</span>
            </div>
          </div>

          {errors.form && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-[10px] mb-5" style={{ background: "#FEF2F2", border: "1px solid rgba(220,38,38,0.2)" }}>
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
              <p className="text-sm text-red-600">{errors.form}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#2A4545" }}>Full name</label>
              <input type="text" autoComplete="name" placeholder="Your full name"
                value={name} onChange={e => setName(e.target.value)} onBlur={() => handleBlur("name")}
                className={fieldCls("name")} />
              <ErrMsg field="name" />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#2A4545" }}>Email address</label>
              <input type="email" autoComplete="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} onBlur={() => handleBlur("email")}
                className={fieldCls("email")} />
              <ErrMsg field="email" />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#2A4545" }}>Password</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} autoComplete="new-password" placeholder="At least 6 characters"
                  value={password}
                  onChange={e => { setPassword(e.target.value); if (touched.password) setErrors(validate()); }}
                  onBlur={() => handleBlur("password")}
                  className={`${fieldCls("password")} pr-11`} />
                <EyeBtn show={showPw} toggle={() => setShowPw(p => !p)} />
              </div>
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= strength ? strengthConfig[strength].color : "rgba(10,61,61,0.1)" }} />
                    ))}
                  </div>
                  <p className="text-xs font-medium" style={{ color: strengthConfig[strength].color }}>
                    {strengthConfig[strength].label} password
                  </p>
                </div>
              )}
              <ErrMsg field="password" />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#2A4545" }}>Confirm password</label>
              <div className="relative">
                <input type={showCf ? "text" : "password"} autoComplete="new-password" placeholder="Repeat your password"
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); if (touched.confirm) setErrors(validate()); }}
                  onBlur={() => handleBlur("confirm")}
                  className={`${fieldCls("confirm")} pr-11`} />
                <EyeBtn show={showCf} toggle={() => setShowCf(p => !p)} />
                {confirm && confirm === password && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#0A3D3D" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
                  </div>
                )}
              </div>
              <ErrMsg field="confirm" />
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full py-3 rounded-[10px] text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
              style={{ background: "#0A3D3D", color: "white" }}
              onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = "#C08552"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#0A3D3D"; }}>
              {isLoading
                ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating account…</>
                : "Create account →"}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: "#5A7575" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold transition-colors" style={{ color: "#0A3D3D" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#C08552")}
              onMouseLeave={e => (e.currentTarget.style.color = "#0A3D3D")}>
              Sign in
            </Link>
          </p>

          <p className="text-center text-[11px] mt-4 leading-relaxed" style={{ color: "#5A7575" }}>
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-[#0A3D3D]" style={{ color: "#5A7575" }}>Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-[#0A3D3D]" style={{ color: "#5A7575" }}>Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}