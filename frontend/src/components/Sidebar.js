import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../utils/api";
import LoadingSpinner from "./LoadingSpinner";

const Sidebar = ({ isOpen, onClose, onNewChat, refreshTrigger }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { chatId } = useParams();

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/chat");
      setChats(data.chats);
    } catch (err) {
      console.error("Failed to fetch chats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [refreshTrigger]);

  const handleNewChat = () => {
    onNewChat();
    navigate("/chat");
    if (window.innerWidth < 1024) onClose();
  };

  const handleSelectChat = (id) => {
    navigate(`/chat/${id}`);
    if (window.innerWidth < 1024) onClose();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    setDeleting(id);
    try {
      await api.delete(`/chat/${id}`);
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (chatId === id) {
        navigate("/chat");
        onNewChat();
      }
    } catch (err) {
      console.error("Failed to delete chat:", err);
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const groupedChats = chats.reduce((acc, chat) => {
    const label = formatDate(chat.updatedAt);
    if (!acc[label]) acc[label] = [];
    acc[label].push(chat);
    return acc;
  }, {});

  return (
    <>
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-30 w-72 flex flex-col
          bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800
          sidebar-transition
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">NexusAI</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 text-white font-medium text-sm hover:from-brand-700 hover:to-purple-700 transition-all duration-200 shadow-md shadow-brand-500/20 hover:shadow-brand-500/30"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">No chats yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Start a new conversation above</p>
            </div>
          ) : (
            Object.entries(groupedChats).map(([label, groupChats]) => (
              <div key={label}>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-2 py-2 mt-2">
                  {label}
                </p>
                {groupChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleSelectChat(chat.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleSelectChat(chat.id)}
                    className={`w-full group flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left transition-all duration-150 mb-0.5 cursor-pointer
                      ${chatId === chat.id
                        ? "bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800/80"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <svg className="w-4 h-4 flex-shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="text-sm truncate">{chat.title}</span>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, chat.id)}
                      className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                      aria-label="Delete chat"
                    >
                      {deleting === chat.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-1">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-sm"
          >
            {isDark ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                </svg>
                Light mode
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
                Dark mode
              </>
            )}
          </button>

          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group cursor-default">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex-shrink-0"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;