"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#FBF9F6", fontFamily: "'DM Sans', sans-serif" }}>
      <div className="text-center px-6">
        <div className="flex justify-center mb-6">
          <img src="/logo/logo_dark.png" alt="Dalence" className="h-14 w-auto" style={{ filter: "brightness(0) saturate(100%) invert(18%) sepia(40%) saturate(800%) hue-rotate(130deg)" }}/>
        </div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 96, color: "#0A3D3D", letterSpacing: "-0.04em", lineHeight: 1 }}>404</h1>
        <p className="text-xl font-semibold mt-2 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#0D1F1F" }}>Page not found</p>
        <p className="text-sm mb-8 max-w-xs mx-auto" style={{ color: "#5A7575" }}>The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/dashboard"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "#0A3D3D", color: "white" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#C08552")}
            onMouseLeave={e => (e.currentTarget.style.background = "#0A3D3D")}>
            Go to Dashboard
          </Link>
          <Link href="/"
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: "white", color: "#2A4545", border: "1.5px solid rgba(10,61,61,0.15)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#F3F0EA")}
            onMouseLeave={e => (e.currentTarget.style.background = "white")}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}