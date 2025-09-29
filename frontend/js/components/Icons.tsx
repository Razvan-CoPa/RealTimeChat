import React from 'react';

export const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

export const AttachmentIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.12 10.12a.75.75 0 001.06 1.061l10.12-10.12a.75.75 0 011.06 0l.25.25a.75.75 0 010 1.06l-7.62 7.62a2.25 2.25 0 01-3.182 0l-2.87-2.87a.75.75 0 00-1.06 1.061l2.87 2.87a3.75 3.75 0 005.303 0l7.62-7.62a2.25 2.25 0 000-3.182l-.25-.25z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M8.609 10.763a.75.75 0 00-1.06 1.06l4.5 4.5a.75.75 0 001.06 0l4.5-4.5a.75.75 0 00-1.06-1.06l-3.97 3.97-3.97-3.97z" clipRule="evenodd" />
  </svg>
);

export const LogoutIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);

export const FileIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a.375.375 0 01-.375-.375V6.75A3.75 3.75 0 0010.5 3h-1.875A.375.375 0 018.25 2.625V1.5H5.625z" />
    <path d="M12.971 1.816A5.23 5.23 0 0114.25 1.5h1.875c.414 0 .75.336.75.75v3.375c0 .414-.336.75-.75.75h-3.375a.75.75 0 01-.75-.75V1.816z" />
  </svg>
);

export const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const DeleteIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.006a.75.75 0 01-.749.658h-7.5a.75.75 0 01-.749-.658L5.165 6.663l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.347-9zm5.459 0a.75.75 0 10-1.5.058l-.347 9a.75.75 0 101.499-.058l.347-9z" clipRule="evenodd" />
  </svg>
);

export const UserPlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM19.75 7.5a.75.75 0 00-1.5 0v2.25H16a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25H22a.75.75 0 000-1.5h-2.25V7.5z" />
  </svg>
);export const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 18.75a6.75 6.75 0 100-13.5 6.75 6.75 0 000 13.5z" />
    <path fillRule="evenodd" d="M12 1.5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V2.25A.75.75 0 0112 1.5zm0 18a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zm9-6.75a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zm-18 0a.75.75 0 01-.75.75H.75a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zm14.384-6.116a.75.75 0 010 1.06l-1.061 1.061a.75.75 0 11-1.06-1.06l1.06-1.061a.75.75 0 011.061 0zm-9.647 9.647a.75.75 0 010 1.06l-1.061 1.061a.75.75 0 11-1.06-1.06l1.06-1.061a.75.75 0 011.061 0zm9.647 0l1.06 1.061a.75.75 0 001.061-1.06l-1.061-1.061a.75.75 0 10-1.06 1.06zM6.116 5.634a.75.75 0 011.06 0l1.061 1.061a.75.75 0 11-1.06 1.06L6.116 6.694a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);

export const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.752 15.002a.75.75 0 00-.917-.541A7.501 7.501 0 0110.54 3.165a.75.75 0 00-.541-.917 9 9 0 108.537 8.537 9.05 9.05 0 00.784-3.836.75.75 0 00-1.5 0 7.5 7.5 0 11-6.906 6.906.75.75 0 00.541-.917 7.501 7.501 0 0111.296 6.602.75.75 0 00.792.75 9.05 9.05 0 00-.791-5.288z" />
  </svg>
);

export const ImageIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3.375 3A2.375 2.375 0 001 5.375v13.25A2.375 2.375 0 003.375 21h17.25A2.375 2.375 0 0023 18.625V5.375A2.375 2.375 0 0020.625 3H3.375zM6.75 8.625a1.875 1.875 0 113.75 0 1.875 1.875 0 01-3.75 0zM4.5 18.75l3.94-4.787a1.5 1.5 0 012.32-.038l2.916 3.208 3.365-4.036a1.5 1.5 0 012.322-.005L19.5 15v3.75H4.5z" />
  </svg>
);

export const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.5 4a.75.75 0 01.75-.75h3a.75.75 0 010 1.5H6.81a7.5 7.5 0 016.69-3.75 7.5 7.5 0 017.5 7.5.75.75 0 01-1.5 0 6 6 0 00-6-6 6 6 0 00-5.764 7.5H10.5a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75v-6zM19.5 20a.75.75 0 01-.75.75h-3a.75.75 0 010-1.5h1.44a7.5 7.5 0 01-6.69 3.75 7.5 7.5 0 01-7.5-7.5.75.75 0 011.5 0 6 6 0 006 6 6 6 0 005.764-7.5H13.5a.75.75 0 010-1.5h6a.75.75 0 01.75.75v6z" />
  </svg>
);
