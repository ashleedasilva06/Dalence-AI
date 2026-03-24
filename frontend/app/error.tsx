"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#FBF9F6", fontFamily: "'DM Sans', sans-serif" }}>
      <div className="text-center px-6 max-w-sm">
        <div className="flex justify-center mb-6">
          <img src="/logo/logo_dark.png" alt="Dalence" className="h-12 w-auto"
            style={{ filter: "brightness(0) saturate(100%) invert(18%) sepia(40%) saturate(800%) hue-rotate(130deg)" }}/>
        </div>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(184,58,42,0.08)" }}>
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#B83A2A" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
        </div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: "#0D1F1F" }} className="mb-2">
          Something went wrong
        </h1>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: "#5A7575" }}>
          An unexpected error occurred. Try refreshing the page or go back to the dashboard.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "#0A3D3D", color: "white" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#C08552")}
            onMouseLeave={e => (e.currentTarget.style.background = "#0A3D3D")}>
            Try again
          </button>
          <Link href="/dashboard"
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: "white", color: "#2A4545", border: "1.5px solid rgba(10,61,61,0.15)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#F3F0EA")}
            onMouseLeave={e => (e.currentTarget.style.background = "white")}>
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}