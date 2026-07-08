// ============================================================
// components/FilePreview.js - Show attached file before sending
// ============================================================
import React from "react";

const getFileIcon = (type) => {
  if (type.startsWith("image/")) return "🖼️";
  if (type === "application/pdf") return "📄";
  if (type.includes("word")) return "📝";
  if (type.includes("sheet") || type.includes("excel")) return "📊";
  if (type.includes("text")) return "📃";
  return "📎";
};

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FilePreview = ({ file, previewUrl, onRemove }) => {
  const isImage = file.type.startsWith("image/");

  return (
    <div className="flex items-center gap-3 p-3 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl animate-fade-in">
      {/* Preview */}
      {isImage && previewUrl ? (
        <img
          src={previewUrl}
          alt="preview"
          className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-brand-200 dark:border-brand-700"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center flex-shrink-0 text-2xl">
          {getFileIcon(file.type)}
        </div>
      )}

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {file.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {formatSize(file.size)}
        </p>
      </div>

      {/* Remove button */}
      <button
        onClick={onRemove}
        className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        aria-label="Remove file"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default FilePreview;