import { create } from "zustand";
import { ChatMessage, AvatarStatus, InputMode } from "@/types";
import { generateId } from "@/lib/utils";

interface ChatStore {
  messages: ChatMessage[];
  avatarStatus: AvatarStatus;
  inputMode: InputMode;
  isAgentThinking: boolean;
  isMuted: boolean;
  addMessage: (role: ChatMessage["role"], content: string) => ChatMessage;
  setAvatarStatus: (status: AvatarStatus) => void;
  setInputMode: (mode: InputMode) => void;
  setAgentThinking: (thinking: boolean) => void;
  toggleMute: () => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  avatarStatus: "idle",
  inputMode: "text",
  isAgentThinking: false,
  isMuted: false,

  addMessage: (role, content) => {
    const message: ChatMessage = {
      id: generateId(),
      role,
      content,
      timestamp: new Date(),
    };
    set((state) => ({ messages: [...state.messages, message] }));
    return message;
  },

  setAvatarStatus: (status) => set({ avatarStatus: status }),
  setInputMode: (mode) => set({ inputMode: mode }),
  setAgentThinking: (thinking) => set({ isAgentThinking: thinking }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  clearMessages: () => set({ messages: [] }),
}));
