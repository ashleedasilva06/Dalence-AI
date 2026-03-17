"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import api from "@/lib/api";
import { Users, FileText, Briefcase, BarChart2 } from "lucide-react";

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    api.get("/api/admin/stats").then((r) => setStats(r.data));
    api.get("/api/admin/users").then((r) => setUsers(r.data));
  }, []);

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h1>

        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Users", value: stats.total_users, icon: Users, color: "bg-blue-50 text-blue-600" },
              { label: "Resumes", value: stats.total_resumes, icon: FileText, color: "bg-brand-50 text-brand-600" },
              { label: "Jobs", value: stats.total_jobs, icon: Briefcase, color: "bg-purple-50 text-purple-600" },
              { label: "Analyzed", value: stats.analyzed_resumes, icon: BarChart2, color: "bg-green-50 text-green-600" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Name", "Email", "Role", "Joined"].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 px-3 font-medium text-gray-900">{u.name}</td>
                    <td className="py-2.5 px-3 text-gray-600">{u.email}</td>
                    <td className="py-2.5 px-3">
                      <span className={`badge ${u.role === "admin" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>{u.role}</span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
