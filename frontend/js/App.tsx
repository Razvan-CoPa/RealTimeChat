
import React from 'react';
import { useAuth } from './hooks/useAuth';
import AuthPage from './components/AuthPage';
import ChatPage from './components/ChatPage';

const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="h-screen w-screen overflow-hidden">
      {user ? <ChatPage /> : <AuthPage />}
    </div>
  );
};

export default App;
