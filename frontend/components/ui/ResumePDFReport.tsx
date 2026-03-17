"use client";
import { Resume } from "@/types";
import { Download } from "lucide-react";

interface Props {
  resume: Resume;
}

export default function ResumePDFReport({ resume }: Props) {
  const handleDownload = () => {
    const scoreColor = (s: number) =>
      s >= 75 ? "#16a34a" : s >= 50 ? "#d97706" : "#dc2626";

    const skillBadges = (resume.skills || [])
      .map(s => `<span style="display:inline-block;background:#eef2ff;color:#4338ca;border:1px solid #a5b4fc;padding:3px 10px;border-radius:20px;font-size:11px;margin:2px 3px;">${s}</span>`)
      .join("");

    const careerRows = (resume.career_matches || [])
      .map(m => `
        <div style="border:1px solid #e5e7eb;border-radius:10px;padding:14px;margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span style="font-weight:600;font-size:14px;color:#111827;">${m.title}</span>
            <span style="font-weight:700;font-size:16px;color:${scoreColor(m.score * 100)}">${Math.round(m.score * 100)}%</span>
          </div>
          <div style="background:#f3f4f6;border-radius:4px;height:6px;margin-bottom:8px;">
            <div style="background:${scoreColor(m.score * 100)};height:6px;border-radius:4px;width:${m.score * 100}%;"></div>
          </div>
          ${m.reasons?.length ? `<p style="font-size:12px;color:#16a34a;margin:4px 0;">✓ ${m.reasons.slice(0,2).join(" · ")}</p>` : ""}
          ${m.missing_skills?.length ? `<p style="font-size:12px;color:#dc2626;margin:4px 0;">Missing: ${m.missing_skills.slice(0,3).join(", ")}</p>` : ""}
          ${m.roadmap_tip ? `<p style="font-size:12px;color:#6366f1;margin:4px 0;">→ ${m.roadmap_tip}</p>` : ""}
        </div>
      `).join("");

    const issueRows = (resume.suggestions || [])
      .map(s => {
        const bg = s.severity === "high" ? "#fef2f2" : s.severity === "medium" ? "#fffbeb" : "#eff6ff";
        const color = s.severity === "high" ? "#dc2626" : s.severity === "medium" ? "#d97706" : "#2563eb";
        return `
          <div style="background:${bg};border-radius:8px;padding:12px;margin-bottom:8px;">
            <p style="font-weight:600;font-size:13px;color:${color};margin:0 0 4px;text-transform:capitalize;">${s.section}</p>
            <p style="font-size:12px;color:#374151;margin:0 0 4px;">${s.issue}</p>
            <p style="font-size:12px;color:#6366f1;margin:0;">💡 ${s.fix}</p>
          </div>
        `;
      }).join("");

    const score = resume.resume_score ?? 0;
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Resume Analysis — ${resume.filename}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#111827; background:#fff; padding:40px; max-width:800px; margin:0 auto; }
    @media print {
      body { padding:20px; }
      .no-print { display:none !important; }
      @page { margin:15mm; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:24px;border-bottom:2px solid #6366f1;margin-bottom:28px;">
    <div>
      <h1 style="font-size:26px;font-weight:700;color:#111827;margin-bottom:4px;">Resume Analysis Report</h1>
      <p style="font-size:14px;color:#6b7280;">${resume.filename} · Generated ${new Date().toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })}</p>
    </div>
    <div style="text-align:center;background:#f5f3ff;border-radius:12px;padding:16px 24px;">
      <div style="font-size:36px;font-weight:800;color:${scoreColor(score)};">${score}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:2px;">out of 100</div>
    </div>
  </div>

  <!-- Score bar -->
  <div style="margin-bottom:32px;">
    <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
      <span style="font-size:13px;font-weight:600;color:#374151;">Overall Resume Score</span>
      <span style="font-size:13px;font-weight:700;color:${scoreColor(score)};">${score >= 75 ? "Strong" : score >= 50 ? "Good" : "Needs Work"}</span>
    </div>
    <div style="background:#f3f4f6;border-radius:6px;height:10px;">
      <div style="background:${scoreColor(score)};height:10px;border-radius:6px;width:${score}%;"></div>
    </div>
  </div>

  <!-- Skills -->
  <div style="margin-bottom:32px;">
    <h2 style="font-size:16px;font-weight:700;color:#111827;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #e5e7eb;">
      Detected Skills <span style="font-size:13px;font-weight:400;color:#6b7280;">(${(resume.skills || []).length} found)</span>
    </h2>
    <div>${skillBadges || '<p style="color:#9ca3af;font-size:13px;">No skills detected</p>'}</div>
  </div>

  <!-- Career Matches -->
  <div style="margin-bottom:32px;">
    <h2 style="font-size:16px;font-weight:700;color:#111827;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #e5e7eb;">Top Career Matches</h2>
    ${careerRows || '<p style="color:#9ca3af;font-size:13px;">No career matches available</p>'}
  </div>

  <!-- Improvements -->
  <div style="margin-bottom:32px;">
    <h2 style="font-size:16px;font-weight:700;color:#111827;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #e5e7eb;">Improvement Suggestions</h2>
    ${issueRows || '<p style="color:#9ca3af;font-size:13px;">No suggestions available</p>'}
  </div>

  <!-- Footer -->
  <div style="border-top:1px solid #e5e7eb;padding-top:16px;text-align:center;">
    <p style="font-size:11px;color:#9ca3af;">Generated by AI Career Platform · ${new Date().getFullYear()}</p>
  </div>

  <script>window.print(); window.onafterprint = () => window.close();</script>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
    >
      <Download className="w-4 h-4" />
      Download PDF Report
    </button>
  );
}