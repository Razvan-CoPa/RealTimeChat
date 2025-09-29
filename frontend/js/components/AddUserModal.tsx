import React, { useState, FormEvent } from 'react';
import { SpinnerIcon } from './Icons';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (email: string) => Promise<void>;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onAddUser }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onAddUser(email);
      setEmail(''); // Reset on success before closing
    } catch (err) {
      const e = err as Error;
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    // Reset state when closing
    setEmail('');
    setError(null);
    setLoading(false);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-xl relative">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-white mb-4">Start New Conversation</h2>
        <p className="text-sm text-gray-400 mb-6">Enter the email address of the user you want to chat with.</p>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !email}
              className="relative flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {loading ? <SpinnerIcon className="w-5 h-5"/> : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;