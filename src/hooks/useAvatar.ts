"use client";

import { useRef, useCallback } from "react";
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskType,
  VoiceEmotion,
} from "@heygen/streaming-avatar";
import { useChatStore } from "@/store/chat";

const AVATAR_ID = process.env.NEXT_PUBLIC_HEYGEN_AVATAR_ID || "Anna_public_3_20240108";
const VOICE_ID = process.env.NEXT_PUBLIC_HEYGEN_VOICE_ID || "";

export function useAvatar(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const avatarRef = useRef<StreamingAvatar | null>(null);
  const { setAvatarStatus } = useChatStore();

  const fetchToken = useCallback(async (): Promise<string> => {
    const res = await fetch("/api/heygen-token", { method: "POST" });
    if (!res.ok) throw new Error("Failed to fetch HeyGen token");
    const data = await res.json();
    return data.token as string;
  }, []);

  const startSession = useCallback(async () => {
    setAvatarStatus("connecting");
    try {
      const token = await fetchToken();

      const avatar = new StreamingAvatar({ token });
      avatarRef.current = avatar;

      avatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
        setAvatarStatus("speaking");
      });

      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
        setAvatarStatus("connected");
      });

      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        setAvatarStatus("disconnected");
      });

      avatar.on(StreamingEvents.STREAM_READY, (event) => {
        if (videoRef.current && event.detail) {
          videoRef.current.srcObject = event.detail as MediaStream;
        }
        setAvatarStatus("connected");
      });

      await avatar.createStartAvatar({
        quality: AvatarQuality.High,
        avatarName: AVATAR_ID,
        voice: {
          voiceId: VOICE_ID || undefined,
          emotion: VoiceEmotion.FRIENDLY,
        },
        language: "en",
        disableIdleTimeout: false,
      });
    } catch (error) {
      console.error("Failed to start avatar session:", error);
      setAvatarStatus("error");
    }
  }, [fetchToken, setAvatarStatus, videoRef]);

  const speak = useCallback(async (text: string) => {
    if (!avatarRef.current) return;
    try {
      setAvatarStatus("speaking");
      await avatarRef.current.speak({
        text,
        taskType: TaskType.REPEAT,
      });
    } catch (error) {
      console.error("Avatar speak error:", error);
      setAvatarStatus("connected");
    }
  }, [setAvatarStatus]);

  const stopSpeaking = useCallback(async () => {
    if (!avatarRef.current) return;
    try {
      await avatarRef.current.interrupt();
      setAvatarStatus("connected");
    } catch (error) {
      console.error("Avatar interrupt error:", error);
    }
  }, [setAvatarStatus]);

  const endSession = useCallback(async () => {
    if (!avatarRef.current) return;
    try {
      await avatarRef.current.stopAvatar();
      avatarRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setAvatarStatus("idle");
    } catch (error) {
      console.error("Avatar end session error:", error);
    }
  }, [setAvatarStatus, videoRef]);

  return { startSession, speak, stopSpeaking, endSession };
}
