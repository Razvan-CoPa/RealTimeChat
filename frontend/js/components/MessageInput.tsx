import React, { FormEvent, useRef, useState } from 'react';
import { AttachmentIcon, SendIcon } from './Icons';
import { ThemeOption } from '../types';

interface MessageInputProps {
  onSendMessage: (content: string | null, file: File | null) => void;
  disabled?: boolean;
  theme?: ThemeOption;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled = false, theme = 'dark' }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDark = theme === 'dark';

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (disabled || (!text.trim() && !file)) {
      return;
    }
    onSendMessage(text, file);
    setText('');
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`p-4 border-t ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
      {file && (
        <div className={`mb-2 p-2 rounded-lg flex justify-between items-center ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
          <p className="text-sm truncate">Attached: {file.name}</p>
          <button onClick={removeFile} className="text-red-500 hover:text-red-400 font-bold text-xl" disabled={disabled}>
            &times;
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" id="file-upload" disabled={disabled} />
        <label htmlFor="file-upload" className="cursor-pointer">
          <button
            type="button"
            onClick={() => !disabled && fileInputRef.current?.click()}
            className={`p-2 rounded-full transition-colors duration-200 ${
              isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            }`}
            disabled={disabled}
          >
            <AttachmentIcon className="w-6 h-6" />
          </button>
        </label>
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type a message..."
          className={`flex-1 w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
            isDark ? 'text-white bg-gray-700 border-transparent' : 'text-gray-900 bg-gray-100 border-gray-200'
          }`}
          disabled={disabled}
        />
        <button
          type="submit"
          className={`p-2 rounded-full transition-colors duration-200 ${
            disabled || (!text.trim() && !file)
              ? 'bg-indigo-400 text-white cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
          disabled={disabled || (!text.trim() && !file)}
        >
          <SendIcon className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
