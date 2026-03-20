import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// Helper — reads token from Zustand's persist storage
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth-storage");
    return raw ? JSON.parse(raw)?.state?.token ?? null : null;
  } catch {
    return null;
  }
}

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("auth-storage");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────
export const authApi = {
  register: (name: string, email: string, password: string) =>
    api.post("/api/auth/register", { name, email, password }),

  login: (email: string, password: string) =>
    api.post(
      "/api/auth/login",
      new URLSearchParams({ username: email, password }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    ),

  me: () => api.get("/api/auth/me"),
};

// ─── Resume ───────────────────────────────────────────────────────
export const resumeApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/api/resume/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  list: () => api.get("/api/resume/my"),
  get: (id: string) => api.get(`/api/resume/${id}`),
  delete: (id: string) => api.delete(`/api/resume/${id}`),
};

// ─── Analysis ─────────────────────────────────────────────────────
export const analysisApi = {
  jobMatch: (resumeId: string, jobDescription: string, jobTitle?: string) =>
    api.post("/api/analysis/job-match", {
      resume_id: resumeId,
      job_description: jobDescription,
      job_title: jobTitle,
    }),
  skillGap: (resumeId: string, targetCareerId?: string, jobDescription?: string) =>
    api.post("/api/analysis/skill-gap", {
      resume_id: resumeId,
      target_career_id: targetCareerId,
      job_description: jobDescription,
    }),
  rewriteSection: (resumeId: string, sectionName: string, targetRole?: string) =>
    api.post("/api/analysis/rewrite-section", {
      resume_id: resumeId,
      section_name: sectionName,
      target_role: targetRole,
    }),
};

// ─── Jobs ─────────────────────────────────────────────────────────
export const jobsApi = {
  list: () => api.get("/api/jobs/list"),
  match: (resumeId: string) => api.get(`/api/jobs/match/${resumeId}`),
};

// ─── Interview ────────────────────────────────────────────────────
export const interviewApi = {
  generate: (jobRole: string, experienceLevel: string, resumeId?: string, numTechnical = 8, numHr = 5) =>
    api.post("/api/interview/generate", {
      job_role: jobRole,
      experience_level: experienceLevel,
      resume_id: resumeId || null,
      num_technical: numTechnical,
      num_hr: numHr,
    }),
};

// ─── Profile ──────────────────────────────────────────────────────
export const profileApi = {
  get: () => api.get("/api/auth/profile"),
  update: (data: Record<string, any>) => api.put("/api/auth/profile", data),
};

// ─── Chat (streaming) ─────────────────────────────────────────────
export async function streamChat(
  messages: { role: string; content: string }[],
  resumeId: string | null,
  onChunk: (chunk: string) => void
) {
  const token = getToken();
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/chat/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ messages, resume_id: resumeId }),
    }
  );
  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) return;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value));
  }
}

export default api;