/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { AuditReport } from "../types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

interface FloatingChatProps {
  auditReport: AuditReport | null;
}

export default function FloatingChat({ auditReport }: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am DiffGuard's assistant. Ask me anything about Monad's parallel execution model, smart contract security concepts (like reentrancy, access control, and storage contention), or the findings from your active contract audit.",
      createdAt: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMsgText = inputValue.trim();
    setInputValue("");
    setIsLoading(true);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMsgText,
      createdAt: Date.now()
    };

    const assistantPlaceholderMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: "...",
      createdAt: Date.now() + 1
    };

    const updatedMessages = [...messages, userMessage];
    setMessages([...updatedMessages, assistantPlaceholderMessage]);

    try {
      const response = await fetch("/api/assistant-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          auditReport: auditReport
        })
      });

      if (!response.ok) {
        throw new Error("Failed to get response from assistant");
      }

      if (!response.body) {
        throw new Error("No response body stream received");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedText = "";
      let buffer = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: !done });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const cleanLine = line.trim();
            if (cleanLine.startsWith("data: ")) {
              const dataContent = cleanLine.substring(6).trim();
              if (dataContent === "[DONE]") {
                continue;
              }
              try {
                const parsed = JSON.parse(dataContent);
                if (parsed.text) {
                  accumulatedText += parsed.text;
                  setMessages(prev => {
                    const next = [...prev];
                    const last = next[next.length - 1];
                    if (last && last.role === "assistant") {
                      last.content = accumulatedText;
                    }
                    return next;
                  });
                }
              } catch (err) {
                // Ignore parsing errors for incomplete JSON
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error(error);
      setMessages(prev => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last && last.role === "assistant") {
          last.content = `I encountered an issue connecting to my brain. Please try again. (${error.message || "Network Error"})`;
        }
        return next;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I am DiffGuard's assistant. Ask me anything about Monad's parallel execution model, smart contract security concepts (like reentrancy, access control, and storage contention), or the findings from your active contract audit.",
        createdAt: Date.now()
      }
    ]);
  };

  return (
    <div id="floating-chat-root" className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Chat Assistant Panel */}
      {isOpen && (
        <div 
          id="chat-panel" 
          className="mb-4 w-96 h-[500px] rounded-2xl bg-[#14171E] border border-[#222631] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-[#1A1E29] border-b border-[#222631] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-sm font-semibold tracking-wide text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0088FF]" />
                DiffGuard Assistant
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={clearChat}
                className="p-1 rounded-md text-gray-500 hover:text-gray-300 hover:bg-[#202431] transition-all cursor-pointer"
                title="Reset Chat"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-[#202431] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Audit Banner */}
          {auditReport && (
            <div className="bg-[#0D0F14] border-b border-[#222631]/50 px-3.5 py-1.5 flex items-center gap-2 text-[10px] font-mono text-[#0088FF]">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                Audited: <strong className="text-gray-300 font-medium">{auditReport.name}</strong> ({auditReport.findings.length} findings)
              </span>
            </div>
          )}

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0D0F14]/40 font-sans">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div 
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user" 
                      ? "bg-[#0088FF] text-white rounded-tr-none" 
                      : "bg-[#1C202C] text-gray-200 border border-[#2B303F]/60 rounded-tl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.content === "..." && (
              <div className="flex items-center gap-1.5 pl-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0088FF] animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#0088FF] animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#0088FF] animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-[#14171E] border-t border-[#222631] flex gap-2">
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about parallel EVM, reentrancy, contention..."
              disabled={isLoading}
              className="flex-1 bg-[#0D0F14] border border-[#222631] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#0088FF] transition-all"
            />
            <button 
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="p-2 rounded-xl bg-[#0088FF] hover:bg-[#0077EE] disabled:bg-gray-800 disabled:text-gray-500 text-white transition-all cursor-pointer flex items-center justify-center shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button Bubble */}
      <button 
        id="floating-chat-bubble"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full bg-[#0088FF] hover:bg-[#0077EE] text-white shadow-2xl transition-all hover:scale-105 cursor-pointer flex items-center justify-center relative group ${
          isOpen ? "rotate-90" : ""
        }`}
        title="Open Assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6" />
            <span className="absolute right-14 bg-[#14171E] border border-[#222631] text-[10px] text-gray-300 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl font-mono">
              DiffGuard Assistant
            </span>
          </>
        )}
      </button>
    </div>
  );
}
