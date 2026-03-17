"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, loadUser, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!token) {
      router.replace("/login");
    } else if (!user) {
      loadUser();
    }
  }, [token]);

  // Avoid SSR/client mismatch — render nothing until mounted on client
  if (!mounted) return null;
  if (!token) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-60 flex-1 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}