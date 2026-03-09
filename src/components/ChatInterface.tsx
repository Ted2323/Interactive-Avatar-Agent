"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useChatStore } from "@/store/chat";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { Button } from "@/components/ui/button";
import { cn, formatTimestamp } from "@/lib/utils";
import { AgentRequest, AgentResponse } from "@/types";
import { Send, Mic, MicOff, Bot, User, Loader2, Trash2 } from "lucide-react";

interface ChatInterfaceProps {
  onSpeak: (text: string) => Promise<void>;
  onStopSpeaking: () => Promise<void>;
  isAvatarActive: boolean;
}

export function ChatInterface({ onSpeak, onStopSpeaking, isAvatarActive }: ChatInterfaceProps) {
  const { messages, isAgentThinking, inputMode, setInputMode, addMessage, setAgentThinking, clearMessages, setAvatarStatus } = useChatStore();
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isAgentThinking]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isAgentThinking) return;

    setInputText("");
    addMessage("user", trimmed);
    setAgentThinking(true);
    if (isAvatarActive) setAvatarStatus("listening");

    try {
      const conversationMessages = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: trimmed },
      ];

      const body: AgentRequest = { messages: conversationMessages };
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Agent request failed");

      const data: AgentResponse = await res.json();
      addMessage("assistant", data.reply);

      if (isAvatarActive) {
        await onSpeak(data.reply);
      }
    } catch (error) {
      console.error("Agent error:", error);
      addMessage("assistant", "Sorry, I encountered an error. Please try again.");
    } finally {
      setAgentThinking(false);
    }
  }, [isAgentThinking, addMessage, setAgentThinking, messages, isAvatarActive, onSpeak, setAvatarStatus]);

  const handleVoiceTranscript = useCallback((text: string) => {
    sendMessage(text);
  }, [sendMessage]);

  const { isListening, isSupported, startListening, stopListening } = useVoiceInput({
    onTranscript: handleVoiceTranscript,
    onListeningChange: (listening) => {
      if (isAvatarActive) setAvatarStatus(listening ? "listening" : "connected");
    },
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      setInputMode("voice");
      startListening();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/50">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-blue-400" />
          <span className="text-sm font-semibold text-slate-200">AI Agent Chat</span>
        </div>
        <button
          onClick={clearMessages}
          className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded"
          title="Clear chat"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
            <Bot size={40} className="opacity-30" />
            <p className="text-sm">Start a conversation...</p>
            <p className="text-xs opacity-70">Try: "What time is it?" or "What's 15% of 240?"</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3 max-w-[85%]",
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
              msg.role === "user" ? "bg-blue-600" : "bg-slate-600"
            )}>
              {msg.role === "user" ? <User size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
            </div>
            <div className={cn(
              "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
              msg.role === "user"
                ? "bg-blue-600 text-white rounded-tr-sm"
                : "bg-slate-700/80 text-slate-100 rounded-tl-sm"
            )}>
              <p>{msg.content}</p>
              <p className={cn("text-xs mt-1 opacity-60", msg.role === "user" ? "text-right" : "text-left")}>
                {formatTimestamp(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {isAgentThinking && (
          <div className="flex gap-3 mr-auto">
            <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-slate-700/80 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-blue-400" />
              <span className="text-sm text-slate-400">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="px-4 py-3 border-t border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center gap-2">
          {/* Voice button */}
          {isSupported && (
            <button
              onClick={toggleVoice}
              disabled={isAgentThinking}
              className={cn(
                "p-2.5 rounded-xl transition-all",
                isListening
                  ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                  : "bg-slate-700 hover:bg-slate-600 text-slate-300"
              )}
              title={isListening ? "Stop listening" : "Voice input"}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}

          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setInputMode("text");
            }}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Type a message..."}
            disabled={isAgentThinking || isListening}
            className="flex-1 bg-slate-700/60 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 border border-slate-600/50 transition-all disabled:opacity-50"
          />

          <Button
            onClick={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isAgentThinking}
            size="icon"
            className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40"
          >
            <Send size={18} />
          </Button>
        </div>

        {isListening && (
          <p className="text-xs text-red-400 mt-2 text-center animate-pulse">
            Listening... speak now
          </p>
        )}
      </div>
    </div>
  );
}
