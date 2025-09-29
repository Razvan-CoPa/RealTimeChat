import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Conversation, Message, UploadResponse, User, UserPresence, ThemeOption } from '../types';
import { getMessages, markConversationAsRead, resolveFileUrl, sendMessage, uploadFile } from '../services/apiClient';
import MessageInput from './MessageInput';
import { FileIcon } from './Icons';

const ALLOWED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface SocketAck {
  ok: boolean;
  message?: string;
}

interface MessageAck extends SocketAck {
  message?: Message;
}

const normalizeIncomingMessage = (incoming: Message): Message => ({
  ...incoming,
  fileUrl: resolveFileUrl(incoming.fileUrl),
  sender: incoming.sender
    ? {
        ...incoming.sender,
        backgroundUrl: resolveFileUrl(incoming.sender.backgroundUrl ?? null),
      }
    : incoming.sender,
});

const MessageItem: React.FC<{ message: Message; isCurrentUser: boolean; theme: ThemeOption }> = ({
  message,
  isCurrentUser,
  theme,
}) => {
  const isImage = message.fileType?.startsWith('image/');
  const isDark = theme === 'dark';

  const outgoingClass = 'bg-indigo-600 text-white self-end rounded-l-lg rounded-tr-lg';
  const incomingClass = isDark
    ? 'bg-gray-700 text-white self-start rounded-r-lg rounded-tl-lg'
    : 'bg-white text-gray-800 self-start rounded-r-lg rounded-tl-lg border border-gray-200';
  const containerClass = isCurrentUser ? 'items-end ml-auto' : 'items-start mr-auto';

  return (
    <div className={`flex flex-col max-w-lg mb-2 ${containerClass}`}>
      <div className={`px-4 py-2 ${isCurrentUser ? outgoingClass : incomingClass}`}>
        {message.content && <p>{message.content}</p>}
        {message.fileUrl && (
          isImage ? (
            <img
              src={message.fileUrl}
              alt={message.fileName || 'uploaded image'}
              className="mt-2 rounded-lg max-w-xs max-h-64 cursor-pointer"
              onClick={() => window.open(message.fileUrl, '_blank')}
            />
          ) : (
            <a
              href={message.fileUrl}
              download={message.fileName || 'file'}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-2 flex items-center p-2 rounded-lg ${
                isDark ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              <FileIcon className="w-6 h-6 mr-2" />
              <span>{message.fileName || 'Download File'}</span>
            </a>
          )
        )}
      </div>
      <div className="flex items-center mt-1 px-1">
        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {isCurrentUser && (
            <>
              {' - '}
              {message.readAt
                ? `read at ${new Date(message.readAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'sent'}
            </>
          )}
        </span>
      </div>
    </div>
  );
};

interface MessageAreaProps {
  conversation: Conversation;
  currentUser: User;
  socket: Socket | null;
  onConversationRead: (conversationId: string) => void;
  presence?: UserPresence;
  theme: ThemeOption;
}

const MessageArea: React.FC<MessageAreaProps> = ({ conversation, currentUser, socket, onConversationRead, presence, theme }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showNewMessageNotification, setShowNewMessageNotification] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';

  const otherUserPresence = presence ?? {
    status: 'offline',
    lastSeen: conversation.otherUser.lastSeen,
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const markConversationAsViewed = () => {
    onConversationRead(conversation.id);
    if (!socket) {
      markConversationAsRead(conversation.id).catch((error) => console.error('Failed to mark as read', error));
      return;
    }
    socket.emit('conversation:markRead', conversation.id, (ack?: SocketAck) => {
      if (!ack?.ok) {
        markConversationAsRead(conversation.id).catch((error) => console.error('Failed to mark as read', error));
      }
    });
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setShowNewMessageNotification(false);

    const loadHistory = async () => {
      try {
        const history = await getMessages(conversation.id);
        if (!isMounted) {
          return;
        }
        setMessages(history);
        markConversationAsViewed();
        setTimeout(() => scrollToBottom('auto'), 0);
      } catch (error) {
        console.error('Failed to load messages', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    if (socket) {
      const handleReceive = (incoming: Message) => {
        if (incoming.conversationId !== conversation.id) {
          return;
        }

        setMessages((prev) => {
          const exists = prev.some((item) => item.id === incoming.id);
          if (exists) {
            return prev;
          }
          const normalized = normalizeIncomingMessage(incoming);
          const container = messageContainerRef.current;
          const isAtBottom = container
            ? container.scrollHeight - container.scrollTop - container.clientHeight < 150
            : true;
          if (!isAtBottom && incoming.senderId !== currentUser.id) {
            setShowNewMessageNotification(true);
          }
          return [...prev, normalized];
        });

        if (incoming.senderId !== currentUser.id) {
          markConversationAsViewed();
        }
      };

      socket.emit('conversation:join', conversation.id, (ack?: SocketAck) => {
        if (!ack?.ok) {
          console.error('Failed to join conversation room', ack?.message);
        }
      });

      socket.on('message:receive', handleReceive);

      return () => {
        isMounted = false;
        socket.emit('conversation:leave', conversation.id);
        socket.off('message:receive', handleReceive);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [conversation.id, socket, currentUser.id]);

  useEffect(() => {
    if (loading || showNewMessageNotification) {
      return;
    }
    scrollToBottom();
  }, [messages, loading, showNewMessageNotification]);

  const handleSendMessage = async (content: string | null, file: File | null) => {
    if ((!content || !content.trim()) && !file) {
      return;
    }

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert('File size cannot exceed 5MB.');
        return;
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        alert('Accepted file formats: png, jpg, pdf, docx.');
        return;
      }
    }

    setSending(true);
    let uploadResult: UploadResponse | null = null;

    try {
      if (file) {
        uploadResult = await uploadFile(file);
      }

      const payload = {
        content: content && content.trim().length > 0 ? content.trim() : null,
        fileUrl: uploadResult ? uploadResult.relativeUrl : null,
        fileName: uploadResult ? uploadResult.fileName : null,
        fileType: uploadResult ? uploadResult.fileType : null,
      };

      if (socket) {
        socket.emit(
          'message:send',
          { conversationId: conversation.id, ...payload },
          (ack?: MessageAck) => {
            if (!ack?.ok || !ack.message) {
              console.error('Message send failed', ack?.message);
              return;
            }
            setMessages((prev) => {
              const exists = prev.some((item) => item.id === ack.message!.id);
              if (exists) {
                return prev;
              }
              const normalized = normalizeIncomingMessage(ack.message);
              return [...prev, normalized];
            });
            setShowNewMessageNotification(false);
            markConversationAsViewed();
          },
        );
      } else {
        const created = await sendMessage(conversation.id, payload);
        setMessages((prev) => [...prev, created]);
        markConversationAsViewed();
      }
    } catch (error) {
      console.error('Failed to send message', error);
      alert((error as Error).message);
    } finally {
      setSending(false);
    }
  };

  const handleScrollToNewMessage = () => {
    scrollToBottom('smooth');
    setShowNewMessageNotification(false);
    markConversationAsViewed();
  };

  const handleScroll = () => {
    const container = messageContainerRef.current;
    if (!container) {
      return;
    }
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 10;
    if (isAtBottom) {
      setShowNewMessageNotification(false);
    }
  };

  const headerStatus = useMemo(() => {
    if (otherUserPresence.status === 'online') {
      return 'Online';
    }
    if (otherUserPresence.lastSeen) {
      return `Last seen: ${new Date(otherUserPresence.lastSeen).toLocaleString()}`;
    }
    return 'Offline';
  }, [otherUserPresence]);

  return (
    <div className="flex flex-col h-full">
      <header className={`flex items-center p-4 border-b ${isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <img
          className="w-10 h-10 rounded-full object-cover mr-4"
          src={`https://picsum.photos/seed/${conversation.otherUser.id}/100`}
          alt="avatar"
        />
        <div>
          <h3 className="text-lg font-semibold">{conversation.otherUser.firstName} {conversation.otherUser.lastName}</h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{headerStatus}</p>
        </div>
      </header>

      <div className="flex-1 relative min-h-0">
        <div
          ref={messageContainerRef}
          onScroll={handleScroll}
          className={`p-4 overflow-y-auto h-full ${isDark ? 'text-gray-100' : 'text-gray-900'}`}
        >
          <div className="flex flex-col">
            {loading ? (
              <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading messages...</p>
            ) : messages.length > 0 ? (
              messages.map((messageItem) => (
                <MessageItem
                  key={messageItem.id}
                  message={messageItem}
                  isCurrentUser={messageItem.senderId === currentUser.id}
                  theme={theme}
                />
              ))
            ) : (
              <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                No messages yet. Start the conversation!
              </p>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {showNewMessageNotification && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <button
              onClick={handleScrollToNewMessage}
              className={`px-4 py-2 text-sm font-semibold rounded-full shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isDark
                  ? 'text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-offset-gray-800 focus:ring-indigo-500'
                  : 'text-white bg-indigo-600 hover:bg-indigo-500 focus:ring-offset-white focus:ring-indigo-500'
              }`}
            >
              New message received
            </button>
          </div>
        )}
      </div>

      <MessageInput onSendMessage={handleSendMessage} disabled={sending} theme={theme} />
    </div>
  );
};

export default MessageArea;

