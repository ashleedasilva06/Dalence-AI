"use client";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { clsx } from "clsx";

const STAGES = [
  { key: "reading",               label: "Reading resume",         pct: 15 },
  { key: "extracting_skills",     label: "Extracting skills",      pct: 35 },
  { key: "generating_embeddings", label: "Generating embeddings",  pct: 50 },
  { key: "predicting_careers",    label: "Predicting careers",     pct: 70 },
  { key: "scoring_resume",        label: "Scoring resume",         pct: 88 },
  { key: "done",                  label: "Analysis complete",      pct: 100 },
];

interface Props {
  stage: string | null | undefined;
}

export default function AnalysisProgress({ stage }: Props) {
  const isError = stage === "error";
  const currentIdx = STAGES.findIndex((s) => s.key === stage);
  const pct = stage === "done" ? 100 : currentIdx >= 0 ? STAGES[currentIdx].pct : 5;
  const currentLabel = STAGES[currentIdx]?.label ?? "Starting analysis…";

  return (
    <div className="card flex flex-col items-center py-10 text-center">
      {/* Spinner or check */}
      <div className="mb-5">
        {isError ? (
          <AlertCircle className="w-12 h-12 text-red-400" />
        ) : stage === "done" ? (
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        ) : (
          <Loader2 className="w-12 h-12 animate-spin text-brand-500" />
        )}
      </div>

      <p className="font-semibold text-gray-800 mb-1 text-base">
        {isError ? "Analysis failed" : stage === "done" ? "Analysis complete!" : "AI is analyzing your resume…"}
      </p>
      <p className="text-sm text-brand-600 font-medium mb-5">{isError ? "Please try uploading again" : currentLabel}</p>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div
            className={clsx(
              "h-full rounded-full transition-all duration-700",
              isError ? "bg-red-400" : stage === "done" ? "bg-green-500" : "bg-brand-500"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400">{pct}% complete</p>
      </div>

      {/* Stage checklist */}
      <div className="mt-6 space-y-1.5 w-full max-w-xs text-left">
        {STAGES.filter(s => s.key !== "done").map((s, i) => {
          const isDone = currentIdx > i || stage === "done";
          const isActive = currentIdx === i;
          return (
            <div key={s.key} className="flex items-center gap-2.5">
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : isActive ? (
                <Loader2 className="w-4 h-4 animate-spin text-brand-500 flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-gray-200 flex-shrink-0" />
              )}
              <span className={clsx(
                "text-xs",
                isDone ? "text-gray-500 line-through" : isActive ? "text-brand-700 font-medium" : "text-gray-400"
              )}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}