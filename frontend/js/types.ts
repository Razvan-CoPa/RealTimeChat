
export type ThemeOption = 'dark' | 'light';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  lastSeen: string | null;
  theme: ThemeOption;
  backgroundUrl: string | null;
}

export interface MessageSender {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  theme?: ThemeOption;
  backgroundUrl?: string | null;
}

export interface Message {
  id: string;
  senderId: string;
  conversationId: string;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileType: string | null;
  createdAt: string;
  updatedAt?: string;
  readAt: string | null;
  sender?: MessageSender | null;
}

export interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  isReadByUser1: boolean;
  isReadByUser2: boolean;
  deletedByUser1?: boolean;
  deletedByUser2?: boolean;
  createdAt: string;
  updatedAt?: string;
  lastMessage: Message | null;
  otherUser: User;
}

export interface UploadResponse {
  fileUrl: string;
  relativeUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storedName: string;
}

export interface UserPresence {
  status: 'online' | 'offline';
  lastSeen: string | null;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updatePreferences: (updates: { theme?: ThemeOption; backgroundUrl?: string | null }) => Promise<void>;
  loading: boolean;
  error: string | null;
}

declare global {
  interface Window {
    __APP_ENTRY?: 'login' | 'register' | 'chat';
  }
}

export {};
