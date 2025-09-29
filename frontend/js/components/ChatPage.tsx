import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Conversation, UserPresence } from '../types';
import { useAuth } from '../hooks/useAuth';
import {
  API_BASE_URL,
  createConversation,
  deleteConversation,
  getConversations,
  resolveFileUrl,
  uploadFile,
} from '../services/apiClient';
import ConversationList from './ConversationList';
import MessageArea from './MessageArea';
import WelcomeScreen from './WelcomeScreen';
import AddUserModal from './AddUserModal';

const ChatPage: React.FC = () => {
  const { user, token, updatePreferences } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const [isUpdatingTheme, setIsUpdatingTheme] = useState(false);
  const [isUpdatingBackground, setIsUpdatingBackground] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [presenceMap, setPresenceMap] = useState<Record<string, UserPresence>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState<boolean>(false);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId],
  );

  const theme = user?.theme ?? 'dark';
  const isDark = theme === 'dark';
  const layoutClass = isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900';
  const mainPanelClass = isDark ? 'bg-gray-800 text-gray-100' : 'bg-gray-50 text-gray-900';
  const contentOverlayClass = user?.backgroundUrl
    ? isDark
      ? 'bg-gray-900/85 text-gray-100'
      : 'bg-white/85 text-gray-900'
    : '';
  const backgroundStyle = user?.backgroundUrl
    ? {
        backgroundImage: `url(${user.backgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined;

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setPresenceMap({});
      setSelectedConversationId(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const items = await getConversations();
        if (!isMounted) {
          return;
        }
        setConversations(items);
        setPresenceMap((prev) => {
          const next = { ...prev };
          items.forEach(({ otherUser }) => {
            next[otherUser.id] = {
              status: next[otherUser.id]?.status ?? 'offline',
              lastSeen: otherUser.lastSeen,
            };
          });
          return next;
        });
        if (items.length > 0) {
          setSelectedConversationId((prev) => prev ?? items[0].id);
        }
      } catch (error) {
        console.error('Failed to load conversations', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
      }
      setSocket(null);
      return;
    }

    const instance = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    instance.on('conversation:updated', (incoming: Conversation) => {
      setConversations((prev) => {
        const normalized: Conversation = {
          ...incoming,
          otherUser: {
            ...incoming.otherUser,
            backgroundUrl: resolveFileUrl(incoming.otherUser.backgroundUrl),
          },
          lastMessage: incoming.lastMessage
            ? { ...incoming.lastMessage, fileUrl: resolveFileUrl(incoming.lastMessage.fileUrl) }
            : null,
        };
        const index = prev.findIndex((item) => item.id === normalized.id);
        if (index === -1) {
          return [normalized, ...prev];
        }
        const clone = [...prev];
        clone[index] = { ...clone[index], ...normalized };
        return clone;
      });

      setPresenceMap((prev) => ({
        ...prev,
        [incoming.otherUser.id]: {
          status: prev[incoming.otherUser.id]?.status ?? 'offline',
          lastSeen: incoming.otherUser.lastSeen,
        },
      }));
    });

    instance.on('user:status', ({ userId, status, lastSeen }: { userId: string; status: 'online' | 'offline'; lastSeen: string | null }) => {
      setPresenceMap((prev) => ({
        ...prev,
        [userId]: { status, lastSeen },
      }));
    });

    setSocket(instance);

    return () => {
      instance.disconnect();
      setSocket(null);
    };
  }, [token]);

  const handleSelectConversation = useCallback(
    (conversation: Conversation) => {
      setSelectedConversationId(conversation.id);
      if (!user) {
        return;
      }
      setConversations((prev) =>
        prev.map((item) => {
          if (item.id !== conversation.id) {
            return item;
          }
          if (item.user1Id === user.id) {
            return { ...item, isReadByUser1: true };
          }
          if (item.user2Id === user.id) {
            return { ...item, isReadByUser2: true };
          }
          return item;
        }),
      );
    },
    [user],
  );

  const handleConversationRead = useCallback(
    (conversationId: string) => {
      if (!user) {
        return;
      }
      setConversations((prev) =>
        prev.map((item) => {
          if (item.id !== conversationId) {
            return item;
          }
          if (item.user1Id === user.id) {
            return { ...item, isReadByUser1: true };
          }
          if (item.user2Id === user.id) {
            return { ...item, isReadByUser2: true };
          }
          return item;
        }),
      );
    },
    [user],
  );

  const handleDeleteConversation = useCallback(
    async (conversationId: string) => {
      setConversations((prev) => prev.filter((item) => item.id !== conversationId));
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null);
      }
      try {
        await deleteConversation(conversationId);
      } catch (error) {
        console.error('Failed to delete conversation', error);
        const refreshed = await getConversations();
        setConversations(refreshed);
        setPresenceMap((prev) => {
          const next = { ...prev };
          refreshed.forEach(({ otherUser }) => {
            next[otherUser.id] = {
              status: next[otherUser.id]?.status ?? 'offline',
              lastSeen: otherUser.lastSeen,
            };
          });
          return next;
        });
      }
    },
    [selectedConversationId],
  );

  const handleStartConversation = useCallback(async (email: string) => {
    const conversation = await createConversation(email);
    setConversations((prev) => {
      const exists = prev.find((item) => item.id === conversation.id);
      if (exists) {
        return prev.map((item) => (item.id === conversation.id ? conversation : item));
      }
      return [conversation, ...prev];
    });
    setPresenceMap((prev) => ({
      ...prev,
      [conversation.otherUser.id]: {
        status: prev[conversation.otherUser.id]?.status ?? 'offline',
        lastSeen: conversation.otherUser.lastSeen,
      },
    }));
    setSelectedConversationId(conversation.id);
    setIsAddUserModalOpen(false);
  }, []);

  const handleThemeToggle = useCallback(async () => {
    if (!user) {
      return;
    }
    const nextTheme = user.theme === 'dark' ? 'light' : 'dark';
    setIsUpdatingTheme(true);
    try {
      await updatePreferences({ theme: nextTheme });
    } catch (error) {
      console.error('Failed to toggle theme', error);
    } finally {
      setIsUpdatingTheme(false);
    }
  }, [updatePreferences, user]);

  const handleBackgroundUploadClick = useCallback(() => {
    backgroundInputRef.current?.click();
  }, []);

  const handleBackgroundFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!user) {
        return;
      }
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file for the background.');
        event.target.value = '';
        return;
      }
      setIsUpdatingBackground(true);
      try {
        const uploaded = await uploadFile(file);
        await updatePreferences({ backgroundUrl: uploaded.relativeUrl });
      } catch (error) {
        console.error('Failed to update background', error);
        alert((error as Error).message);
      } finally {
        setIsUpdatingBackground(false);
        event.target.value = '';
      }
    },
    [updatePreferences, user],
  );

  const handleBackgroundClear = useCallback(async () => {
    if (!user?.backgroundUrl) {
      return;
    }
    setIsUpdatingBackground(true);
    try {
      await updatePreferences({ backgroundUrl: null });
    } catch (error) {
      console.error('Failed to clear background', error);
    } finally {
      setIsUpdatingBackground(false);
    }
  }, [updatePreferences, user]);

  if (!user) {
    return null;
  }

  return (
    <>
      <input
        ref={backgroundInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleBackgroundFileChange}
      />
      <div className={`flex h-screen ${layoutClass}`}>
        <ConversationList
          conversations={conversations}
          currentUser={user}
          onSelectConversation={handleSelectConversation}
          selectedConversationId={selectedConversationId}
          onDeleteConversation={handleDeleteConversation}
          onOpenAddUserModal={() => setIsAddUserModalOpen(true)}
          presenceMap={presenceMap}
          loading={loading}
          theme={theme}
          onToggleTheme={handleThemeToggle}
          onSetBackground={handleBackgroundUploadClick}
          onClearBackground={handleBackgroundClear}
          isUpdatingTheme={isUpdatingTheme}
          isUpdatingBackground={isUpdatingBackground}
          hasCustomBackground={Boolean(user.backgroundUrl)}
        />
        <main className="flex-1 relative" style={backgroundStyle}>
          <div className={`flex flex-col h-full ${mainPanelClass} ${contentOverlayClass}`.trim()}>
            {selectedConversation ? (
              <MessageArea
                key={selectedConversation.id}
                conversation={selectedConversation}
                currentUser={user}
                socket={socket}
                onConversationRead={handleConversationRead}
                presence={presenceMap[selectedConversation.otherUser.id]}
                theme={theme}
              />
            ) : (
              <div className="flex-1 flex flex-col">
                <WelcomeScreen user={user} />
              </div>
            )}
          </div>
        </main>
      </div>
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onAddUser={handleStartConversation}
      />
    </>
  );
};

export default ChatPage;
