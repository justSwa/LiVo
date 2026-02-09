
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  preferences: string[];
  isOnboarded: boolean;
  themeColor: ThemeOption;
}

export type ThemeOption = 'rose' | 'beige' | 'lavender' | 'blue' | 'grey' | 'sage' | 'teal';

export interface Memory {
  id: string;
  type: 'note' | 'event' | 'relationship' | 'goal' | 'health' | 'finance' | 'pattern';
  content: string;
  timestamp: string;
  metadata?: {
    progress?: number; // 0 to 100
    isCompleted?: boolean;
    [key: string]: any;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'image' | 'insight';
  imageUrl?: string;
  timestamp: string;
}

export enum AppView {
  AUTH = 'AUTH',
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  MIND_VAULT = 'MIND_VAULT',
  FLOW = 'FLOW',
  CHAT = 'CHAT',
  MEMORIES = 'MEMORIES',
  INSIGHTS = 'INSIGHTS',
  SETTINGS = 'SETTINGS',
  ACCOUNT = 'ACCOUNT'
}
