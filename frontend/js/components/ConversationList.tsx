import React from 'react';
import { Conversation, ThemeOption, User, UserPresence } from '../types';
import { useAuth } from '../hooks/useAuth';
import { DeleteIcon, LogoutIcon, UserPlusIcon, SunIcon, MoonIcon, ImageIcon, RefreshIcon } from './Icons';

interface ConversationListProps {
  conversations: Conversation[];
  currentUser: User;
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId: string | null;
  onDeleteConversation: (conversationId: string) => void;
  onOpenAddUserModal: () => void;
  presenceMap: Record<string, UserPresence>;
  loading: boolean;
  theme: ThemeOption;
  onToggleTheme: () => void;
  onSetBackground: () => void;
  onClearBackground: () => void;
  isUpdatingTheme: boolean;
  isUpdatingBackground: boolean;
  hasCustomBackground: boolean;
}

const ConversationItem: React.FC<{
  conversation: Conversation;
  presence?: UserPresence;
  isUnread: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  theme: ThemeOption;
}> = ({ conversation, presence, isUnread, isSelected, onSelect, onDelete, theme }) => {
  const { otherUser, lastMessage } = conversation;
  const indicator = presence?.status === 'online' ? 'bg-green-400' : 'bg-gray-400';
  const isDark = theme === 'dark';

  const truncate = (text: string, length: number) => (text.length > length ? `${text.substring(0, length)}...` : text);

  const lastMessageText = lastMessage?.content
    ? truncate(lastMessage.content, 25)
    : lastMessage?.fileName
    ? `File: ${truncate(lastMessage.fileName, 20)}`
    : 'No messages yet';

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete();
  };

  const baseItemClass = isDark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-200 text-gray-700';
  const selectedClass = isDark ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-indigo-900';
  const subTextClass = isDark ? 'text-gray-400' : 'text-gray-500';

  return (
    <li
      onClick={onSelect}
      className={`relative group flex items-center p-3 cursor-pointer rounded-lg transition-colors duration-200 ${
        isSelected ? selectedClass : baseItemClass
      }`}
    >
      <div className="relative mr-4">
        <img className="w-12 h-12 rounded-full object-cover" src={`https://picsum.photos/seed/${otherUser.id}/100`} alt="avatar" />
        <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ${indicator} ring-2 ring-gray-900`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold truncate ${isSelected ? '' : ''}`}>
          {otherUser.firstName} {otherUser.lastName}
        </p>
        <p className={`text-sm truncate ${isSelected ? '' : subTextClass}`}>{lastMessageText}</p>
      </div>
      {isUnread && <div className="w-3 h-3 bg-blue-500 rounded-full ml-2" />}
      <button
        onClick={handleDelete}
        className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 ${
          isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
        }`}
        title="Delete chat"
      >
        <DeleteIcon className="w-5 h-5" />
      </button>
    </li>
  );
};

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentUser,
  onSelectConversation,
  selectedConversationId,
  onDeleteConversation,
  onOpenAddUserModal,
  presenceMap,
  loading,
  theme,
  onToggleTheme,
  onSetBackground,
  onClearBackground,
  isUpdatingTheme,
  isUpdatingBackground,
  hasCustomBackground,
}) => {
  const { logout } = useAuth();
  const isDark = theme === 'dark';
  const containerClass = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300';
  const dividerClass = isDark ? 'border-gray-700' : 'border-gray-200';
  const buttonBase = isDark
    ? 'p-2 text-gray-300 rounded-full hover:bg-gray-700 hover:text-white transition-colors duration-200 disabled:opacity-50'
    : 'p-2 text-gray-600 rounded-full hover:bg-gray-200 hover:text-gray-900 transition-colors duration-200 disabled:opacity-50';

  const sorted = [...conversations].sort((a, b) => {
    const first = a.lastMessage?.createdAt ?? a.createdAt;
    const second = b.lastMessage?.createdAt ?? b.createdAt;
    return new Date(second).getTime() - new Date(first).getTime();
  });

  return (
    <aside className={`w-1/4 md:w-1/3 lg:w-1/4 xl:w-1/5 border-r flex flex-col ${containerClass}`}>
      <div className={`p-4 flex flex-col space-y-4 border-b ${dividerClass}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center min-w-0">
            <img className="w-10 h-10 rounded-full object-cover mr-3" src={`https://picsum.photos/seed/${currentUser.id}/100`} alt="current user avatar" />
            <div className="min-w-0">
              <h2 className="text-lg font-semibold truncate">{currentUser.firstName}</h2>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{currentUser.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={onToggleTheme}
              className={buttonBase}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              disabled={isUpdatingTheme}
            >
              {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            <button onClick={logout} className={buttonBase} title="Logout">
              <LogoutIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <button onClick={onOpenAddUserModal} className={buttonBase} title="Start new chat">
              <UserPlusIcon className="w-5 h-5" />
            </button>
            <button
              onClick={onSetBackground}
              className={buttonBase}
              title="Set chat background"
              disabled={isUpdatingBackground}
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button
              onClick={onClearBackground}
              className={buttonBase}
              title="Remove background"
              disabled={!hasCustomBackground || isUpdatingBackground}
            >
              <RefreshIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <p className={`text-center mt-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading conversations...</p>
        ) : sorted.length === 0 ? (
          <p className={`text-center mt-4 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>No conversations yet.</p>
        ) : (
          <ul className="space-y-1">
            {sorted.map((conversation) => {
              const presence = presenceMap[conversation.otherUser.id];
              const isUnread =
                (conversation.user1Id === currentUser.id && !conversation.isReadByUser1) ||
                (conversation.user2Id === currentUser.id && !conversation.isReadByUser2);
              return (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  presence={presence}
                  isUnread={isUnread}
                  isSelected={conversation.id === selectedConversationId}
                  onSelect={() => onSelectConversation(conversation)}
                  onDelete={() => onDeleteConversation(conversation.id)}
                  theme={theme}
                />
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default ConversationList;

