"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, loadUser, user, setOAuthSession } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        if (!user) loadUser();
        setReady(true);
        return;
      }
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const session = await res.json();
        if (session?.backendToken && session?.backendUser) {
          setOAuthSession(session.backendToken, session.backendUser);
          setReady(true);
          return;
        }
      } catch {}
      router.replace("/login");
    };
    checkAuth();
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FBF9F6" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-[3px] border-t-transparent animate-spin"
            style={{ borderColor: "rgba(10,61,61,0.2)", borderTopColor: "#0A3D3D" }} />
          <p className="text-sm" style={{ color: "#5A7575" }}>Loading…</p>
        </div>
      </div>
    );
  }

  const hasToken = !!token || !!(typeof window !== "undefined" &&
    (() => { try { return JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.token; } catch { return null; } })()
  );

  if (!hasToken) { router.replace("/login"); return null; }

  return (
    <div className="flex min-h-screen" style={{ background: "#FBF9F6" }}>
      <Sidebar />
      <main className="flex-1 min-h-screen overflow-y-auto lg:ml-60 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}