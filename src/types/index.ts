export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export type AvatarStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "speaking"
  | "listening"
  | "error"
  | "disconnected";

export type InputMode = "text" | "voice";

export interface AgentRequest {
  messages: Array<{ role: MessageRole; content: string }>;
  sessionId?: string;
}

export interface AgentResponse {
  reply: string;
  toolsUsed?: string[];
}

export interface HeyGenTokenResponse {
  token: string;
}
