export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  conversationId: string;
  createdAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface OpenClawRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  user?: string;
}

export interface OpenClawChoice {
  index: number;
  message?: {
    role: string;
    content: string;
  };
  delta?: {
    role?: string;
    content?: string;
  };
  finish_reason: string | null;
}

export interface OpenClawResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenClawChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  modelId: string;
  systemPrompt: string;
  gatewayUrl: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformSettings {
  platformName: string;
  platformLogoUrl: string;
  defaultModel: string;
  gatewayUrl: string;
}
