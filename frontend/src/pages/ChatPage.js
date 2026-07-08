import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Message, { TypingIndicator } from "../components/Message";
import ChatInput from "../components/ChatInput";
import WelcomeScreen from "../components/WelcomeScreen";
import LoadingSpinner from "../components/LoadingSpinner";
import api from "../utils/api";
import { useTheme } from "../context/ThemeContext";

const ChatPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshSidebar, setRefreshSidebar] = useState(0);

  const messagesEndRef = useRef(null);
  const currentChatId = useRef(chatId || null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  const loadChat = useCallback(async (id) => {
    setLoadingChat(true);
    setError("");
    try {
      const { data } = await api.get(`/chat/${id}`);
      setMessages(data.chat.messages);
      currentChatId.current = id;
    } catch (err) {
      setError("Failed to load chat. Please try again.");
      if (err.response?.status === 404) navigate("/chat");
    } finally {
      setLoadingChat(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (chatId) loadChat(chatId);
    else {
      setMessages([]);
      currentChatId.current = null;
    }
  }, [chatId, loadChat]);

  const handleNewChat = () => {
    setMessages([]);
    currentChatId.current = null;
    setError("");
    setInput("");
  };

  const buildMessage = (text, file) => {
    if (!file) return text;
    const fileInfo = `[Attached file: ${file.name} (${file.type})]`;
    return text ? `${text}\n\n${fileInfo}` : fileInfo;
  };

  const handleSend = async (attachedFile = null) => {
    const trimmed = input.trim();
    if (!trimmed && !attachedFile) return;
    if (sending) return;

    const messageText = buildMessage(trimmed, attachedFile);

    const userMsg = {
      role: "user",
      content: messageText,
      timestamp: new Date(),
      filePreview: attachedFile?.type?.startsWith("image/") ? URL.createObjectURL(attachedFile) : null,
      fileName: attachedFile?.name || null,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);
    setTyping(true);
    setError("");

    try {
      const { data } = await api.post("/chat/send", {
        message: messageText,
        chatId: currentChatId.current,
      });

      if (!currentChatId.current) {
        currentChatId.current = data.chatId;
        navigate(`/chat/${data.chatId}`, { replace: true });
        setRefreshSidebar((n) => n + 1);
      }

      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          imageUrl: data.imageUrl || null, 
          timestamp: new Date()
        },
      ]);
      setRefreshSidebar((n) => n + 1);
    } catch (err) {
      setTyping(false);
      const errorMsg = err.response?.data?.error || "Failed to get a response. Please try again.";
      setError(errorMsg);
      setMessages((prev) => prev.filter((m) => m !== userMsg));
      setInput(trimmed);
    } finally {
      setSending(false);
    }
  };

  const handleSuggestion = (text) => setInput(text);

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? "dark" : ""} bg-gray-50 dark:bg-gray-900`}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        refreshTrigger={refreshSidebar}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {chatId ? "Chat" : "New Chat"}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-slow" />
            <span className="hidden sm:inline">AI Ready</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {loadingChat ? (
            <div className="flex justify-center items-center h-full">
              <LoadingSpinner size="lg" />
            </div>
          ) : messages.length === 0 ? (
            <WelcomeScreen onSuggestion={handleSuggestion} />
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {messages.map((msg, index) => (
                <Message key={index} message={msg} />
              ))}

              {typing && <TypingIndicator />}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm animate-fade-in">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          loading={sending}
          disabled={loadingChat}
        />
      </div>
    </div>
  );
};

export default ChatPage;