import React from "react";
import { useAuth } from "../context/AuthContext";

const suggestions = [
  { icon: "💡", text: "Explain quantum computing in simple terms" },
  { icon: "✍️", text: "Write a professional email for a job application" },
  { icon: "🐛", text: "Help me debug this JavaScript code" },
  { icon: "📊", text: "What are the best practices for REST APIs?" },
];

const WelcomeScreen = ({ onSuggestion }) => {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mb-6 shadow-2xl shadow-brand-500/30">
        <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Hello, {firstName} 👋
      </h1>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-10">
        I'm NexusAI, your intelligent assistant. Ask me anything — I'm here to help.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSuggestion(s.text)}
            className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-left hover:border-brand-400 dark:hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-all duration-200 group shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <span className="text-xl flex-shrink-0">{s.icon}</span>
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-brand-700 dark:group-hover:text-brand-300 leading-snug">
              {s.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WelcomeScreen;