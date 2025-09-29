import { Conversation, Message, UploadResponse, User, ThemeOption } from '../types';

const DEFAULT_API_URL = 'http://localhost:5000';
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? DEFAULT_API_URL;

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

interface ErrorPayload {
  message?: string;
}

type RequestOptions = RequestInit & { skipAuth?: boolean };

const isFormData = (body: unknown): body is FormData => body instanceof FormData;

const buildHeaders = (options: RequestOptions): Headers => {
  const headers = new Headers(options.headers || {});
  if (!isFormData(options.body) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (!options.skipAuth && authToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }
  return headers;
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }
  const contentType = response.headers.get('Content-Type') || '';
  const isJson = contentType.includes('application/json');
  if (!response.ok) {
    let message = 'Request failed.';
    if (isJson) {
      try {
        const payload = (await response.json()) as ErrorPayload;
        if (payload.message) {
          message = payload.message;
        }
      } catch (error) {
        // ignore JSON parse errors and fall back to default message
      }
    }
    throw new Error(message);
  }
  if (isJson) {
    return (await response.json()) as T;
  }
  return (await response.text()) as unknown as T;
}

export const resolveFileUrl = (filePath?: string | null): string | null => {
  if (!filePath) {
    return null;
  }
  if (/^https?:\/\//i.test(filePath)) {
    return filePath;
  }
  return `${API_BASE_URL}${filePath.startsWith('/') ? filePath : `/${filePath}`}`;
};

const normalizeUser = (user: User): User => ({
  ...user,
  backgroundUrl: resolveFileUrl(user.backgroundUrl ?? null),
});

const normalizeMessage = (message: Message): Message => ({
  ...message,
  fileUrl: resolveFileUrl(message.fileUrl),
  sender: message.sender
    ? {
        ...message.sender,
        backgroundUrl: resolveFileUrl(message.sender.backgroundUrl ?? null),
      }
    : message.sender,
});

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = buildHeaders(options);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  return handleResponse<T>(response);
}

export const login = async (email: string, password: string) => {
  const result = await request<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  });
  return { token: result.token, user: normalizeUser(result.user) };
};

export const register = async (firstName: string, lastName: string, email: string, password: string) => {
  const result = await request<{ token: string; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ firstName, lastName, email, password }),
    skipAuth: true,
  });
  return { token: result.token, user: normalizeUser(result.user) };
};

export const fetchProfile = async () => {
  const result = await request<{ user: User }>('/auth/me');
  return { user: normalizeUser(result.user) };
};

export const logout = () => request<{ message: string }>('/auth/logout', { method: 'POST' });

export const getConversations = async (): Promise<Conversation[]> => {
  const conversations = await request<Conversation[]>('/conversations');
  return conversations.map((conversation) => ({
    ...conversation,
    otherUser: normalizeUser(conversation.otherUser),
    lastMessage: conversation.lastMessage ? normalizeMessage(conversation.lastMessage) : null,
  }));
};

export const createConversation = async (email: string): Promise<Conversation> => {
  const conversation = await request<Conversation>('/conversations', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  return {
    ...conversation,
    otherUser: normalizeUser(conversation.otherUser),
    lastMessage: conversation.lastMessage ? normalizeMessage(conversation.lastMessage) : null,
  };
};

export const markConversationAsRead = (conversationId: string) =>
  request<{ message: string }>(`/conversations/${conversationId}/mark-read`, {
    method: 'PATCH',
  });

export const deleteConversation = (conversationId: string) =>
  request<{ message: string }>(`/conversations/${conversationId}`, {
    method: 'DELETE',
  });

export const getMessages = async (conversationId: string): Promise<Message[]> => {
  const messages = await request<Message[]>(`/messages/${conversationId}`);
  return messages.map(normalizeMessage);
};

export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const data = new FormData();
  data.append('file', file);
  const response = await request<UploadResponse>('/upload', {
    method: 'POST',
    body: data,
  });
  return {
    ...response,
    relativeUrl: response.fileUrl,
    fileUrl: resolveFileUrl(response.fileUrl) ?? response.fileUrl,
  };
};

export const sendMessage = async (
  conversationId: string,
  payload: { content: string | null; fileUrl: string | null; fileName: string | null; fileType: string | null },
): Promise<Message> => {
  const message = await request<Message>(`/messages/${conversationId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeMessage(message);
};

export const updatePreferences = async (updates: { theme?: ThemeOption; backgroundUrl?: string | null }) => {
  const result = await request<{ user: User }>('/auth/preferences', {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  return normalizeUser(result.user);
};
