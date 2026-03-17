"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import { resumeApi } from "@/lib/api";
import toast from "react-hot-toast";
import { clsx } from "clsx";

interface Props {
  onUploaded: (resumeId: string) => void;
}

export default function ResumeUpload({ onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await resumeApi.upload(file);
      setDone(true);
      toast.success("Resume uploaded! AI analysis is running in the background.");
      onUploaded(data.id);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={clsx(
          "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors",
          isDragActive ? "border-brand-500 bg-brand-50" : "border-gray-300 hover:border-brand-400 hover:bg-gray-50"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <p className="font-medium text-gray-700">
          {isDragActive ? "Drop your resume here" : "Drag & drop your resume"}
        </p>
        <p className="text-sm text-gray-500 mt-1">PDF or DOCX up to 5MB</p>
        <button className="btn-secondary mt-4 text-xs" onClick={(e) => e.stopPropagation()}>
          Browse files
        </button>
      </div>

      {/* Selected file */}
      {file && (
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <FileText className="w-5 h-5 text-brand-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
          {done ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <button onClick={() => setFile(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Upload button */}
      {file && !done && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="btn-primary w-full justify-center"
        >
          {uploading ? "Uploading…" : "Upload & Analyze"}
        </button>
      )}
    </div>
  );
}
