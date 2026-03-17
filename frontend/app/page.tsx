"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";

export default function Home() {
  const router = useRouter();
  const { token, loadUser } = useAuthStore();

  useEffect(() => {
    if (token) {
      loadUser().then(() => router.replace("/dashboard"));
    } else {
      window.location.replace("/index.html");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}