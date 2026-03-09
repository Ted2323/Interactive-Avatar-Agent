"use client";

import { useRef, useEffect } from "react";
import { useChatStore } from "@/store/chat";
import { useAvatar } from "@/hooks/useAvatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, VideoOff, Mic, MicOff, StopCircle } from "lucide-react";

interface AvatarDisplayProps {
  onSpeak: (speak: (text: string) => Promise<void>) => void;
  onStop: (stop: () => Promise<void>) => void;
}

const STATUS_LABELS: Record<string, string> = {
  idle: "Start Session",
  connecting: "Connecting...",
  connected: "Connected",
  speaking: "Speaking...",
  listening: "Listening...",
  error: "Error — Retry",
  disconnected: "Disconnected",
};

const STATUS_COLORS: Record<string, string> = {
  idle: "bg-gray-500",
  connecting: "bg-yellow-500 animate-pulse",
  connected: "bg-green-500",
  speaking: "bg-blue-500 animate-pulse",
  listening: "bg-purple-500 animate-pulse",
  error: "bg-red-500",
  disconnected: "bg-gray-500",
};

export function AvatarDisplay({ onSpeak, onStop }: AvatarDisplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { avatarStatus, isMuted, toggleMute } = useChatStore();
  const { startSession, speak, stopSpeaking, endSession } = useAvatar(videoRef);

  // Expose speak/stop to parent
  useEffect(() => {
    onSpeak(speak);
    onStop(stopSpeaking);
  }, [speak, stopSpeaking, onSpeak, onStop]);

  const isActive = ["connected", "speaking", "listening"].includes(avatarStatus);
  const isConnecting = avatarStatus === "connecting";

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Video container */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl"
           style={{ width: 420, height: 480 }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMuted}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            isActive ? "opacity-100" : "opacity-0"
          )}
        />

        {/* Placeholder when not connected */}
        {!isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400">
            <VideoOff size={48} className="opacity-40" />
            <p className="text-sm opacity-60">Avatar offline</p>
          </div>
        )}

        {/* Connecting overlay */}
        {isConnecting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/70 backdrop-blur-sm">
            <Loader2 size={40} className="animate-spin text-blue-400" />
            <p className="text-sm text-slate-300">Initializing avatar...</p>
          </div>
        )}

        {/* Status indicator */}
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/50 rounded-full px-3 py-1">
          <span className={cn("w-2 h-2 rounded-full", STATUS_COLORS[avatarStatus])} />
          <span className="text-xs text-white font-medium">{STATUS_LABELS[avatarStatus]}</span>
        </div>

        {/* Mute button (shown when active) */}
        {isActive && (
          <button
            onClick={toggleMute}
            className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 rounded-full p-2 text-white transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
        )}

        {/* Speaking animation ring */}
        {avatarStatus === "speaking" && (
          <div className="absolute inset-0 rounded-2xl ring-2 ring-blue-400/60 animate-pulse pointer-events-none" />
        )}
      </div>

      {/* Control buttons */}
      <div className="flex items-center gap-3">
        {!isActive && !isConnecting && (
          <Button onClick={startSession} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
            Start Avatar
          </Button>
        )}
        {isActive && (
          <>
            {avatarStatus === "speaking" && (
              <Button onClick={stopSpeaking} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <StopCircle size={16} className="mr-1" />
                Stop
              </Button>
            )}
            <Button onClick={endSession} variant="destructive" size="sm">
              End Session
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
