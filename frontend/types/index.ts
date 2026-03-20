export interface Resume {
  id: string;
  filename: string;
  file_type: string;
  skills: string[] | null;
  skill_scores: Record<string, number> | null;
  extracted_data: {
    name: string | null;
    email: string | null;
    phone: string | null;
    linkedin: string | null;
    github: string | null;
    sections: Record<string, string>;
    word_count: number;
  } | null;
  career_matches: CareerMatch[] | null;
  skill_gaps: SkillGap[] | null;
  resume_score: number | null;
  suggestions: ResumeSuggestion[] | null;
  status: "uploaded" | "processing" | "analyzed" | "error";
  analysis_stage?: string;
  created_at?: string;
  chroma_id?: string;
}

export interface CareerMatch {
  career_id: string;
  title: string;
  score: number;
  reasons: string[];
  missing_skills: string[];
  roadmap_tip: string;
}

export interface SkillGap {
  skill: string;
  why_important: string;
  how_to_learn: string;
  time_estimate: string;
}

export interface ResumeSuggestion {
  section: string;
  issue: string;
  severity: "low" | "medium" | "high";
  fix: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  experience_level: string;
  required_skills: string[];
}

export interface JobMatch {
  job_id: string;
  title: string;
  company: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  explanation: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}