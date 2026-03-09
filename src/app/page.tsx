"use client";

import { useRef, useState, useCallback } from "react";
import { AvatarDisplay } from "@/components/AvatarDisplay";
import { ChatInterface } from "@/components/ChatInterface";
import { useChatStore } from "@/store/chat";
import { Sparkles, Github, Cpu } from "lucide-react";

export default function Home() {
  const { avatarStatus } = useChatStore();
  const speakRef = useRef<((text: string) => Promise<void>) | null>(null);
  const stopRef = useRef<(() => Promise<void>) | null>(null);
  const [isAvatarReady, setIsAvatarReady] = useState(false);

  const handleSpeak = useCallback((speakFn: (text: string) => Promise<void>) => {
    speakRef.current = speakFn;
  }, []);

  const handleStop = useCallback((stopFn: () => Promise<void>) => {
    stopRef.current = stopFn;
  }, []);

  const isAvatarActive = ["connected", "speaking", "listening"].includes(avatarStatus);
  if (isAvatarActive !== isAvatarReady) setIsAvatarReady(isAvatarActive);

  const speakText = useCallback(async (text: string) => {
    await speakRef.current?.(text);
  }, []);

  const stopSpeaking = useCallback(async () => {
    await stopRef.current?.();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Interactive Avatar Agent</h1>
              <p className="text-xs text-slate-400">Powered by HeyGen + OpenAI GPT-4o</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <TechBadge icon="🎭" label="HeyGen" />
              <TechBadge icon="🤖" label="GPT-4o" />
              <TechBadge icon="⚡" label="Next.js 14" />
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <Github size={20} />
            </a>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8 h-full">
          {/* Left: Avatar panel */}
          <div className="flex flex-col items-center gap-6 lg:w-auto">
            <AvatarDisplay onSpeak={handleSpeak} onStop={handleStop} />

            {/* Capabilities card */}
            <div className="w-full max-w-[420px] bg-slate-800/40 rounded-2xl border border-slate-700/40 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Cpu size={15} className="text-violet-400" />
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Agent Capabilities</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <CapabilityItem emoji="🕐" label="Current Time" />
                <CapabilityItem emoji="🧮" label="Math Calculator" />
                <CapabilityItem emoji="🌤️" label="Weather Info" />
                <CapabilityItem emoji="💬" label="Conversation" />
              </div>
            </div>
          </div>

          {/* Right: Chat panel */}
          <div className="flex-1 flex flex-col min-h-[500px] lg:min-h-0 lg:h-[calc(100vh-180px)]">
            <ChatInterface
              onSpeak={speakText}
              onStopSpeaking={stopSpeaking}
              isAvatarActive={isAvatarReady}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/40 py-4 text-center">
        <p className="text-xs text-slate-600">
          Built with Next.js · HeyGen Streaming Avatar · OpenAI GPT-4o · TypeScript
        </p>
      </footer>
    </div>
  );
}

function TechBadge({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/50">
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
}

function CapabilityItem({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-700/30 rounded-lg px-3 py-2">
      <span>{emoji}</span>
      <span className="text-xs">{label}</span>
    </div>
  );
}
