"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, FileText, Briefcase, MessageSquare,
  ClipboardList, UserCircle, History, LogOut, TrendingUp
} from "lucide-react";

const NAV = [
  { href: "/dashboard",  label: "Dashboard",      icon: LayoutDashboard },
  { href: "/resume",     label: "Resume",          icon: FileText },
  { href: "/jobs",       label: "Job Matcher",     icon: Briefcase },
  { href: "/chatbot",    label: "AI Advisor",      icon: MessageSquare },
  { href: "/interview",  label: "Interview Prep",  icon: ClipboardList },
  { href: "/history",    label: "Resume History",  icon: History },
  { href: "/profile",    label: "My Profile",      icon: UserCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const initials = (user?.name || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <aside className="fixed left-0 top-0 h-full w-60 flex flex-col z-50"
      style={{ background: "linear-gradient(180deg, #0A3D3D 0%, #062727 100%)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <img src="/logo/logo_dark.png" alt="Dalence" className="h-8 w-auto flex-shrink-0" />
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: "#F0EDE6", letterSpacing: "-0.03em" }}>
          Dalence
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: active ? "rgba(192,133,82,0.15)" : "transparent",
                color: active ? "#D4A574" : "rgba(240,237,230,0.55)",
                borderLeft: active ? "2px solid #C08552" : "2px solid transparent",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(240,237,230,0.85)"; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(240,237,230,0.55)"; } }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1"
          style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #C08552, #7BA89A)", color: "white", fontFamily: "'Space Grotesk', sans-serif" }}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold truncate" style={{ color: "#F0EDE6" }}>{user?.name}</p>
            <p className="text-[10px] truncate" style={{ color: "rgba(240,237,230,0.4)" }}>{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
          style={{ color: "rgba(240,237,230,0.4)" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(192,133,82,0.1)"; e.currentTarget.style.color = "#D4A574"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(240,237,230,0.4)"; }}>
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}