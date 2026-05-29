"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Brain, 
  Send, 
  Sparkles, 
  MessageSquare, 
  RefreshCw,
  Trash2,
  PanelLeft,
  SquarePen,
  Search,
  X
} from "lucide-react";
import { useLanguageStore, translations } from "../../../store/languageStore";
import { useDashboardAnalytics } from "../../../hooks/useDashboardAnalytics";
import { useInventoryInsights } from "../../../hooks/useInventoryInsights";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

export default function ChatAiPage() {
  const { language } = useLanguageStore();
  const t = translations[language];

  // Fetch real-time dashboard context
  const { metrics, criticalStockCount } = useDashboardAnalytics();
  const { stockItems } = useInventoryInsights();

  const [input, setInput] = useState("");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  // Load sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem("lumina_chat_sessions_v3");
    const savedActiveId = localStorage.getItem("lumina_active_session_id_v3");

    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed);
        if (savedActiveId && parsed.some((s: any) => s.id === savedActiveId)) {
          setActiveSessionId(savedActiveId);
        } else if (parsed.length > 0) {
          setActiveSessionId(parsed[0].id);
        }
      } catch (e) {
        console.error("Error loading chat sessions:", e);
      }
    } else {
      const defaultId = Math.random().toString(36).substring(7);
      const initialSession: ChatSession = {
        id: defaultId,
        title: language === "ID" ? "Obrolan Baru" : "New Chat",
        messages: [
          {
            role: "assistant",
            content: language === "ID"
              ? "Halo, saya Lumina Assistant. Saya dapat membantu melihat data pesanan, produk, dan statistik toko Anda."
              : "Hello, I am Lumina Assistant. I can help you monitor order data, products, and store statistics.",
            timestamp: new Date().toISOString(),
          }
        ],
        createdAt: new Date().toISOString(),
      };
      setSessions([initialSession]);
      setActiveSessionId(defaultId);
    }
  }, [language]);

  // Save sessions to localStorage when they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("lumina_chat_sessions_v3", JSON.stringify(sessions));
    }
  }, [sessions]);

  // Save active session ID to localStorage when it changes
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem("lumina_active_session_id_v3", activeSessionId);
    }
  }, [activeSessionId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sessions, activeSessionId, isTyping]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [];

  const handleSend = async () => {
    if (!input.trim() || !activeSessionId) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];

    // Dynamic title based on first query
    let updatedTitle = activeSession.title;
    if (
      activeSession.title === "Obrolan Baru" || 
      activeSession.title === "New Chat" || 
      activeSession.title.startsWith("Obrolan Baru") ||
      activeSession.title.startsWith("New Chat")
    ) {
      updatedTitle = input.length > 25 ? input.substring(0, 25) + "..." : input;
    }

    // Update frontend immediately
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          title: updatedTitle,
          messages: updatedMessages
        };
      }
      return s;
    }));

    setInput("");
    setIsTyping(true);

    try {
      // Build real-time database context
      const context = {
        totalRevenue: metrics?.totalRevenue,
        totalOrders: metrics?.totalOrders,
        avgOrderValue: metrics?.avgOrderValue,
        criticalStockCount: criticalStockCount,
        inventorySummary: stockItems?.map(item => ({
          name: item.productName,
          stock: item.stock,
          category: item.category,
        })).slice(0, 15)
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
          context
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from chat API");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toISOString(),
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...updatedMessages, assistantMessage]
          };
        }
        return s;
      }));

    } catch (err: any) {
      console.error("Chat error:", err);
      const errorMessage: Message = {
        role: "assistant",
        content: language === "ID"
          ? "Maaf, terjadi kesalahan saat menghubungi AI Lumina. Silakan coba lagi."
          : "Sorry, an error occurred while connecting to Lumina AI. Please try again.",
        timestamp: new Date().toISOString()
      };
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...updatedMessages, errorMessage]
          };
        }
        return s;
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    const newId = Math.random().toString(36).substring(7);
    const newSession: ChatSession = {
      id: newId,
      title: language === "ID" ? "Obrolan Baru" : "New Chat",
      messages: [
        {
          role: "assistant",
          content: language === "ID"
            ? "Halo, saya Lumina Assistant. Saya dapat membantu melihat data pesanan, produk, dan statistik toko Anda."
            : "Hello, I am Lumina Assistant. I can help you monitor order data, products, and store statistics.",
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString()
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
  };

  const handleDeleteSession = () => {
    if (sessions.length <= 1) {
      const defaultId = Math.random().toString(36).substring(7);
      const initialSession: ChatSession = {
        id: defaultId,
        title: language === "ID" ? "Obrolan Baru" : "New Chat",
        messages: [
          {
            role: "assistant",
            content: language === "ID"
              ? "Halo, saya Lumina Assistant. Saya dapat membantu melihat data pesanan, produk, dan statistik toko Anda."
              : "Hello, I am Lumina Assistant. I can help you monitor order data, products, and store statistics.",
            timestamp: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString()
      };
      setSessions([initialSession]);
      setActiveSessionId(defaultId);
    } else {
      const remaining = sessions.filter(s => s.id !== activeSessionId);
      setSessions(remaining);
      setActiveSessionId(remaining[0].id);
    }
  };

  const handleRestartSession = () => {
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          messages: [
            {
              role: "assistant",
              content: language === "ID"
                ? "Halo, saya Lumina Assistant. Saya dapat membantu melihat data pesanan, produk, dan statistik toko Anda."
                : "Hello, I am Lumina Assistant. I can help you monitor order data, products, and store statistics.",
              timestamp: new Date().toISOString()
            }
          ]
        };
      }
      return s;
    }));
  };

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.messages.some(m => m.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const SUGGESTIONS = language === "ID" 
    ? [
        "Total pesanan hari ini",
        "Produk terlaris",
        "Produk stok rendah",
        "Statistik penjualan"
      ]
    : [
        "Total orders today",
        "Best selling products",
        "Low stock products",
        "Sales statistics"
      ];

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar - History */}
      <div 
        className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden shrink-0 ${
          isSidebarCollapsed ? "w-[72px]" : "w-80"
        }`}
      >
        {/* Sidebar Header - Logo & Toggle */}
        <div className="p-4 flex items-center justify-between h-16 shrink-0">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2 pl-2">
              <Brain className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100">Lumina AI</span>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex shrink-0 ${isSidebarCollapsed ? "mx-auto" : ""}`}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeft className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
          {/* Action Buttons */}
          <div className="space-y-1">
            <button 
              onClick={handleNewChat}
              className={`flex items-center gap-3 w-full py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-slate-100 dark:hover:bg-slate-800 group ${isSidebarCollapsed ? "justify-center" : "px-3"}`}
            >
              <SquarePen className="w-5 h-5 text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
              {!isSidebarCollapsed && <span className="text-slate-700 dark:text-slate-350">{language === "ID" ? "Obrolan baru" : "New chat"}</span>}
            </button>
            <button 
              onClick={() => {
                setIsSearching(!isSearching);
                if (isSearching) setSearchTerm("");
              }}
              className={`flex items-center gap-3 w-full py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-slate-100 dark:hover:bg-slate-800 group ${isSidebarCollapsed ? "justify-center" : "px-3"}`}
            >
              <Search className="w-5 h-5 text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
              {!isSidebarCollapsed && <span className="text-slate-700 dark:text-slate-350">{language === "ID" ? "Cari obrolan" : "Search chats"}</span>}
            </button>
          </div>

          {/* Search bar inside sidebar */}
          {isSearching && !isSidebarCollapsed && (
            <div className="relative px-3 animate-in slide-in-from-top-1 duration-200">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === "ID" ? "Cari..." : "Search..."}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {!isSidebarCollapsed && <div className="h-px bg-slate-100 dark:bg-slate-800 mx-2" />}

          {/* History List */}
          <div className="space-y-4">
            {!isSidebarCollapsed && (
              <h3 className="px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{language === "ID" ? "Terkini" : "Recent"}</h3>
            )}
            <div className="space-y-1">
              {filteredSessions.map((session) => (
                <button 
                  key={session.id} 
                  onClick={() => setActiveSessionId(session.id)}
                  className={`w-full flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all group hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    isSidebarCollapsed ? "justify-center" : "px-3"
                  } ${session.id === activeSessionId ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"}`}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate flex-1 text-left">{session.title}</span>}
                </button>
              ))}
              {filteredSessions.length === 0 && !isSidebarCollapsed && (
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center py-4">
                  {language === "ID" ? "Tidak ada obrolan" : "No chats found"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Chat Background Decors */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/20 dark:bg-indigo-950/5 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-50/20 dark:bg-purple-950/5 rounded-full blur-3xl -z-10 translate-y-1/2 -translate-x-1/2"></div>

        {/* Header */}
        <div className="px-8 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
              <Brain className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">{activeSession?.title || "Lumina Assistant"}</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  {language === "ID" ? "Lumina Assistant Online" : "Lumina Assistant Online"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRestartSession}
              className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
              title={language === "ID" ? "Mulai ulang percakapan" : "Restart chat"}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button 
              onClick={handleDeleteSession}
              className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-450 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
              title={language === "ID" ? "Hapus percakapan" : "Delete chat"}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth admin-scrollbar-hide">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-4 ${m.role === "assistant" ? "items-start" : "items-start flex-row-reverse"}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                m.role === "assistant" 
                  ? "bg-emerald-500 text-white" 
                  : "bg-slate-200 dark:bg-slate-800 text-slate-650 dark:text-slate-350"
              }`}>
                {m.role === "assistant" ? <Sparkles className="w-5 h-5" /> : <div className="w-full h-full rounded-full bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center border border-indigo-200 dark:border-indigo-850 text-indigo-600 dark:text-indigo-400 font-bold text-xs">U</div>}
              </div>
              
              <div className={`flex flex-col gap-2 max-w-[85%] ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                  m.role === "assistant" 
                    ? "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium" 
                    : "bg-indigo-600 text-white font-medium"
                }`}>
                  {m.content}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-4 items-start animate-pulse">
              <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center border border-emerald-100 dark:border-emerald-900">
                <Sparkles className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm space-y-2 w-32">
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-full animate-bounce"></div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-2/3 animate-bounce delay-75"></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-8 pt-0 shrink-0">
          <div className="max-w-4xl mx-auto">
            {/* Suggestions */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 admin-scrollbar-hide">
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
              {SUGGESTIONS.map((s, i) => (
                <button 
                  key={i} 
                  onClick={() => setInput(s)}
                  className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:border-indigo-600 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all shadow-sm whitespace-nowrap active:scale-95 cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="relative group">
              <textarea 
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder={language === "ID" ? "Ketik pesan untuk Lumina AI..." : "Type a message for Lumina AI..."}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-6 pr-16 py-4 text-[14px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all shadow-lg shadow-slate-200/20 dark:shadow-none resize-none min-h-[52px] max-h-32"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer ${
                  !input.trim() || isTyping 
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-650 cursor-not-allowed" 
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30"
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-center mt-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {language === "ID"
                ? "Lumina AI dapat membuat kesalahan. Periksa info bisnis penting."
                : "Lumina AI can make mistakes. Verify important business info."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
