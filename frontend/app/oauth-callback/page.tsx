"use client";
import { useEffect, useRef } from "react";

export default function OAuthCallback() {
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const run = async () => {
      // Step 1: fetch session
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const session = await res.json();
      const backendToken = session?.backendToken;
      const backendUser  = session?.backendUser;

      console.log("[CB] backendToken:", backendToken ? backendToken.slice(0,30)+"..." : "MISSING");

      if (!backendToken || !backendUser) {
        window.location.href = "/login?error=no_token";
        return;
      }

      // Step 2: write into localStorage exactly as Zustand persist expects
      const zustandState = JSON.stringify({
        state: { token: backendToken, user: backendUser },
        version: 0,
      });
      localStorage.setItem("auth-storage", zustandState);

      // Step 3: verify it's written
      const verify = localStorage.getItem("auth-storage");
      console.log("[CB] localStorage written:", verify ? "YES" : "NO");
      console.log("[CB] verify token:", verify ? JSON.parse(verify)?.state?.token?.slice(0,30)+"..." : "MISSING");

      // Step 4: hard redirect
      window.location.href = "/dashboard";
    };

    run();
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F6F2] dark:bg-[#0F1014] flex flex-col items-center justify-center gap-4">
      <div className="w-9 h-9 bg-[#0B0C0F] rounded-[9px] flex items-center justify-center">
        <svg viewBox="0 0 14 14" fill="none" className="w-4 h-4">
          <path d="M2 7h10M7 2l5 5-5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="w-7 h-7 border-[3px] border-[#1A6BFF] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-[#7A7E8A] font-medium">Signing you into Dalence…</p>
    </div>
  );
}