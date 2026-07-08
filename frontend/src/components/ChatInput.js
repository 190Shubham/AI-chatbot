// ============================================================
// components/ChatInput.js - Input with File, Mic & Camera
// ============================================================
import React, { useRef, useEffect, useState, useCallback } from "react";
import LoadingSpinner from "./LoadingSpinner";
import FilePreview from "./FilePreview";
import CameraModal from "./CameraModal";
import useSpeechRecognition from "../hooks/useSpeechRecognition";

const ChatInput = ({ value, onChange, onSend, onFileAttach, loading, disabled }) => {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const [showCamera, setShowCamera] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [showTooltip, setShowTooltip] = useState("");

  const {
    isListening,
    transcript,
    error: micError,
    isSupported: micSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 160) + "px";
    }
  }, [value]);

  // When speech transcript updates, fill the input
  useEffect(() => {
    if (transcript) {
      onChange(transcript);
    }
  }, [transcript, onChange]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading && (value.trim() || attachedFile)) {
        handleSend();
      }
    }
  };

  const handleSend = () => {
    if (loading || (!value.trim() && !attachedFile)) return;
    onSend(attachedFile);
    setAttachedFile(null);
    setFilePreviewUrl(null);
    resetTranscript();
  };

  const processFile = useCallback((file) => {
    if (file.size > 10 * 1024 * 1024) {
      alert("File too large. Maximum size is 10MB.");
      return;
    }
    setAttachedFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreviewUrl(null);
    }
    if (onFileAttach) onFileAttach(file);
  }, [onFileAttach]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    processFile(file);
    e.target.value = "";
  };

  const handleCameraCapture = (file, previewUrl) => {
    setAttachedFile(file);
    setFilePreviewUrl(previewUrl);
  };

  const handleMicToggle = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const removeFile = () => {
    setAttachedFile(null);
    setFilePreviewUrl(null);
  };

  const canSend = (value.trim() || attachedFile) && !loading && !disabled;

  return (
    <>
      {showCamera && (
        <CameraModal onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
        onChange={handleFileChange}
      />

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto space-y-2">

          {attachedFile && (
            <FilePreview file={attachedFile} previewUrl={filePreviewUrl} onRemove={removeFile} />
          )}

          {micError && (
            <p className="text-xs text-red-500 dark:text-red-400 px-1">{micError}</p>
          )}

          {isListening && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-red-600 dark:text-red-400 font-medium">Listening... speak now</span>
              <button onClick={stopListening} className="ml-auto text-xs text-red-500 hover:text-red-700 font-medium">Stop</button>
            </div>
          )}

          <div className="relative flex items-end gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-3 py-3 focus-within:border-brand-400 dark:focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all shadow-sm">

            {/* Left buttons */}
            <div className="flex items-center gap-1 flex-shrink-0 pb-0.5">

              {/* File */}
              <div className="relative">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || loading}
                  onMouseEnter={() => setShowTooltip("file")}
                  onMouseLeave={() => setShowTooltip("")}
                  className="p-2 rounded-xl text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Attach file"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                {showTooltip === "file" && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap pointer-events-none z-10">Attach file</div>
                )}
              </div>

              {/* Camera */}
              <div className="relative">
                <button
                  onClick={() => setShowCamera(true)}
                  disabled={disabled || loading}
                  onMouseEnter={() => setShowTooltip("camera")}
                  onMouseLeave={() => setShowTooltip("")}
                  className="p-2 rounded-xl text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Take photo"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                {showTooltip === "camera" && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap pointer-events-none z-10">Take photo</div>
                )}
              </div>

              {/* Mic */}
              {micSupported && (
                <div className="relative">
                  <button
                    onClick={handleMicToggle}
                    disabled={disabled || loading}
                    onMouseEnter={() => setShowTooltip("mic")}
                    onMouseLeave={() => setShowTooltip("")}
                    className={`p-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      isListening
                        ? "text-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse"
                        : "text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20"
                    }`}
                    aria-label={isListening ? "Stop listening" : "Voice input"}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                  {showTooltip === "mic" && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap pointer-events-none z-10">
                      {isListening ? "Stop listening" : "Voice input"}
                    </div>
                  )}
                </div>
              )}

              <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening..." : "Message NexusAI..."}
              rows={1}
              disabled={disabled || loading}
              className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none outline-none text-sm leading-relaxed max-h-40 min-h-[24px] disabled:opacity-60"
            />

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200
                ${canSend
                  ? "bg-gradient-to-br from-brand-600 to-purple-600 text-white shadow-md shadow-brand-500/30 hover:from-brand-700 hover:to-purple-700 hover:scale-105 active:scale-95"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                }`}
              aria-label="Send message"
            >
              {loading ? <LoadingSpinner size="sm" color="white" /> : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-gray-600">
            <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded font-mono text-xs">Enter</kbd> send
            {" · "}
            <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded font-mono text-xs">Shift+Enter</kbd> new line
            {" · Supports images, PDF, docs"}
          </p>
        </div>
      </div>
    </>
  );
};

export default ChatInput;