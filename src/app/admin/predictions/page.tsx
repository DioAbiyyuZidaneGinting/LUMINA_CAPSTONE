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
  Search
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "chart" | "recommendation";
}

export default function ChatAiPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Halo, saya Lumina Assistant. Saya dapat membantu melihat data pesanan, produk, dan statistik toko Anda.",
      timestamp: new Date(),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("lumina_chat_history");
    if (saved) {
      setChatHistory(JSON.parse(saved));
    } else {
      setChatHistory([
        "Optimasi Stok Lebaran",
        "Prediksi Churn Pelanggan",
        "Analisis Margin Jakarta",
        "Audit Inventaris Q1"
      ]);
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem("lumina_chat_history", JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate Database Query Response
    setTimeout(() => {
      setIsTyping(false);
      
      let response = "";
      if (input.toLowerCase().includes("pesanan") || input.toLowerCase().includes("total")) {
        response = "Berdasarkan data hari ini, terdapat 94 pesanan masuk dengan total pendapatan Rp12.450.000.";
      } else if (input.toLowerCase().includes("produk") || input.toLowerCase().includes("terlaris")) {
        response = "Produk terlaris minggu ini adalah 'Kemeja Oxford Slim Fit' dengan total penjualan 42 unit.";
      } else if (input.toLowerCase().includes("stok") || input.toLowerCase().includes("rendah")) {
        response = "Ada 3 produk dengan stok di bawah ambang batas: Kaos Polos Hitam (2), Celana Chino (5), dan Jaket Bomber (1).";
      } else {
        response = "Saya telah memproses permintaan Anda. Data menunjukkan performa toko dalam kondisi stabil dengan tingkat penyelesaian pesanan 98%.";
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Add to history if it's the first message of a new chat
      if (messages.length <= 1) {
        setChatHistory(prev => [input.length > 25 ? input.substring(0, 25) + "..." : input, ...prev]);
      }
    }, 2000);
  };

  const SUGGESTIONS = [
    "Total pesanan hari ini",
    "Produk terlaris",
    "Produk stok rendah",
    "Jumlah pesanan selesai",
    "Statistik penjualan minggu ini"
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#f8fafc] text-slate-900">
      {/* Sidebar - History */}
      <div 
        className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
          isSidebarCollapsed ? "w-[72px]" : "w-80"
        }`}
      >
        {/* Sidebar Header - Logo & Toggle */}
        <div className="p-4 flex items-center justify-between h-16">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2 pl-2">
              <Brain className="w-6 h-6 text-indigo-600" />
              <span className="font-bold text-sm tracking-tight text-slate-900">Lumina AI</span>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`p-2 hover:bg-slate-100 rounded-lg transition-colors flex shrink-0 ${isSidebarCollapsed ? "mx-auto" : ""}`}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeft className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 px-3 py-2 space-y-4">
          {/* Action Buttons */}
          <div className="space-y-1">
            <button className={`flex items-center gap-3 w-full py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-slate-100 group ${isSidebarCollapsed ? "justify-center" : "px-3"}`}>
              <SquarePen className="w-5 h-5 text-slate-500 group-hover:text-indigo-600" />
              {!isSidebarCollapsed && <span className="text-slate-700">Obrolan baru</span>}
            </button>
            <button className={`flex items-center gap-3 w-full py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-slate-100 group ${isSidebarCollapsed ? "justify-center" : "px-3"}`}>
              <Search className="w-5 h-5 text-slate-500 group-hover:text-indigo-600" />
              {!isSidebarCollapsed && <span className="text-slate-700">Cari obrolan</span>}
            </button>
          </div>

          {!isSidebarCollapsed && <div className="h-px bg-slate-100 mx-2" />}

          {/* History List */}
          <div className="space-y-4">
            {!isSidebarCollapsed && (
              <h3 className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Terkini</h3>
            )}
            <div className="space-y-1">
              {chatHistory.map((chat, i) => (
                <button 
                  key={i} 
                  className={`w-full flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all group hover:bg-slate-100 ${
                    isSidebarCollapsed ? "justify-center" : "px-3"
                  } ${i === 0 && !isSidebarCollapsed ? "bg-slate-100 text-slate-900" : "text-slate-500"}`}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate flex-1 text-left">{chat}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-100">
          <button className={`w-full flex items-center gap-3 py-3 rounded-lg text-sm font-medium hover:bg-slate-100 transition-all ${isSidebarCollapsed ? "justify-center" : "px-3"}`}>
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center shrink-0">
               <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            {!isSidebarCollapsed && <span className="flex-1 text-left text-slate-700">Upgrade Plan</span>}
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Chat Background Decors */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/40 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-50/40 rounded-full blur-3xl -z-10 translate-y-1/2 -translate-x-1/2"></div>

        {/* Header (Mobile Toggle etc) */}
        <div className="px-8 py-4 border-b border-slate-200 flex items-center justify-between bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
              <Brain className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Lumina Assistant</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Lumina Assistant Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all border border-transparent hover:border-slate-200">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-all border border-transparent hover:border-slate-200">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-4 ${m.role === "assistant" ? "items-start" : "items-start flex-row-reverse"}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                m.role === "assistant" 
                  ? "bg-emerald-500 text-white" 
                  : "bg-slate-200 text-slate-600"
              }`}>
                {m.role === "assistant" ? <Sparkles className="w-5 h-5" /> : <div className="w-full h-full rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 text-indigo-600 font-bold text-xs">U</div>}
              </div>
              
              <div className={`flex flex-col gap-2 max-w-[85%] ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                  m.role === "assistant" 
                    ? "bg-white border border-slate-100 text-slate-800 font-medium" 
                    : "bg-indigo-600 text-white font-medium"
                }`}>
                  {m.content}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-4 items-start animate-pulse">
              <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <Sparkles className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm space-y-2 w-32">
                <div className="h-2 bg-slate-100 rounded w-full animate-bounce"></div>
                <div className="h-2 bg-slate-100 rounded w-2/3 animate-bounce delay-75"></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-8 pt-0">
          <div className="max-w-4xl mx-auto">
            {/* Suggestions */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
              {SUGGESTIONS.map((s, i) => (
                <button 
                  key={i} 
                  onClick={() => setInput(s)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm whitespace-nowrap active:scale-95"
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
                placeholder="Pesan Lumina AI..."
                className="w-full bg-white border border-slate-200 rounded-2xl pl-6 pr-16 py-4 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all shadow-lg shadow-slate-200/20 resize-none min-h-[52px] max-h-32"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all shadow-md active:scale-95 ${
                  !input.trim() || isTyping 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30"
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-center mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Lumina AI can make mistakes. Check important business info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
