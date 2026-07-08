import React from "react";

const sizes = {
  sm: "h-4 w-4 border-2",
  md: "h-7 w-7 border-2",
  lg: "h-12 w-12 border-3",
};

const LoadingSpinner = ({ size = "md", color = "brand" }) => {
  const sizeClass = sizes[size];
  const colorClass =
    color === "white"
      ? "border-white/30 border-t-white"
      : "border-brand-300/30 border-t-brand-500";

  return (
    <div
      className={`${sizeClass} ${colorClass} rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );
};

export default LoadingSpinner;