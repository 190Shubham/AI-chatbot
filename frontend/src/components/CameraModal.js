// ============================================================
// components/CameraModal.js - Take photo with webcam
// ============================================================
import React, { useRef, useState, useEffect, useCallback } from "react";

const CameraModal = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [captured, setCaptured] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setLoading(false);
      }
    } catch (err) {
      setError(
        err.name === "NotAllowedError"
          ? "Camera access denied. Please allow camera permission in your browser."
          : "Could not access camera. Make sure it's connected."
      );
      setLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    // Mirror the image (selfie style)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCaptured(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    setCaptured(null);
    startCamera();
  };

  const handleSend = () => {
    if (!captured) return;
    // Convert dataURL to File
    fetch(captured)
      .then((r) => r.blob())
      .then((blob) => {
        const file = new File([blob], `camera-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onCapture(file, captured);
        onClose();
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Take a Photo</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Camera view */}
        <div className="relative bg-black aspect-video">
          {loading && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            </div>
          )}

          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <p className="text-white/80 text-sm">{error}</p>
            </div>
          ) : captured ? (
            <img src={captured} alt="Captured" className="w-full h-full object-cover" />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
          )}

          {/* Viewfinder corners */}
          {!captured && !error && (
            <>
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-white/60 rounded-tl-sm" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-white/60 rounded-tr-sm" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-white/60 rounded-bl-sm" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-white/60 rounded-br-sm" />
            </>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 p-5">
          {!captured ? (
            <>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCapture}
                disabled={loading || !!error}
                className="w-14 h-14 rounded-full bg-white border-4 border-brand-500 shadow-lg hover:scale-105 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                aria-label="Take photo"
              >
                <div className="w-10 h-10 rounded-full bg-brand-500" />
              </button>
              <div className="w-20" />
            </>
          ) : (
            <>
              <button
                onClick={handleRetake}
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Retake
              </button>
              <button
                onClick={handleSend}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 text-white text-sm font-semibold hover:from-brand-700 hover:to-purple-700 transition-all shadow-md shadow-brand-500/25 hover:scale-[1.02] active:scale-[0.98]"
              >
                Use Photo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraModal;