"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, FileText, Briefcase, MessageSquare,
  ClipboardList, UserCircle, History, LogOut, Menu, X, Shield
} from "lucide-react";

const NAV = [
  { href: "/dashboard",  label: "Dashboard",      icon: LayoutDashboard },
  { href: "/resume",     label: "Resume",          icon: FileText },
  { href: "/jobs",       label: "Job Matcher",     icon: Briefcase },
  { href: "/chatbot",    label: "AI Advisor",      icon: MessageSquare },
  { href: "/interview",  label: "Interview Prep",  icon: ClipboardList },
  { href: "/history",    label: "Resume History",  icon: History },
  { href: "/profile",    label: "My Profile",      icon: UserCircle },
  { href: "/admin",      label: "Admin",           icon: Shield },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); router.replace("/login"); };
  const initials = (user?.name || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const NavLinks = ({ onClose }: { onClose?: () => void }) => (
    <>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: active ? "rgba(192,133,82,0.15)" : "transparent",
                color: active ? "#D4A574" : "rgba(240,237,230,0.55)",
                borderLeft: active ? "2px solid #C08552" : "2px solid transparent",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(240,237,230,0.85)"; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(240,237,230,0.55)"; }}}>
              <Icon className="w-4 h-4 flex-shrink-0" />{label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1" style={{ background: "rgba(255,255,255,0.04)" }}>
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
          <LogOut className="w-4 h-4" />Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 h-full w-60 flex-col z-50 hidden lg:flex"
        style={{ background: "linear-gradient(180deg, #0A3D3D 0%, #062727 100%)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2.5 px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <img src="/logo/logo_dark.png" alt="Dalence" className="h-8 w-auto flex-shrink-0" />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: "#F0EDE6", letterSpacing: "-0.03em" }}>Dalence</span>
        </div>
        <NavLinks />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4"
        style={{ background: "linear-gradient(90deg, #0A3D3D, #062727)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2.5">
          <img src="/logo/logo_dark.png" alt="Dalence" className="h-7 w-auto" />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: "#F0EDE6" }}>Dalence</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.08)", color: "#F0EDE6" }}>
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)}/>
          <div className="relative w-64 flex flex-col h-full" style={{ background: "linear-gradient(180deg, #0A3D3D 0%, #062727 100%)" }}>
            <div className="flex items-center justify-between px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2.5">
                <img src="/logo/logo_dark.png" alt="Dalence" className="h-7 w-auto" />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: "#F0EDE6" }}>Dalence</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.08)", color: "#F0EDE6" }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <NavLinks onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}