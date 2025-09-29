import React from 'react';
import { User } from '../types';

interface WelcomeScreenProps {
  user: User;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ user }) => {
  const isDark = user.theme === 'dark';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-300' : 'text-gray-600';
  const tipBorder = isDark ? 'border-gray-600' : 'border-gray-300';

  return (
    <div className={`flex flex-col items-center justify-center h-full text-center p-8 ${textSecondary}`}>
      <img className="w-24 h-24 rounded-full object-cover mb-4" src={`https://picsum.photos/seed/${user.id}/200`} alt="avatar" />
      <h2 className={`text-2xl font-semibold ${textPrimary}`}>Welcome, {user.firstName}!</h2>
      <p className="mt-2 max-w-md">
        Select a conversation from the left panel to start chatting. Your messages are end-to-end simulated for your privacy.
      </p>
      <div className={`mt-6 p-4 border border-dashed rounded-lg ${tipBorder}`}>
        <p className={`font-semibold ${textPrimary}`}>Tip:</p>
        <p>You can send text messages, images, PDFs, and Word documents.</p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
