
import React, { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { SpinnerIcon } from './Icons';

const AuthPage: React.FC = () => {
  const defaultEntry = typeof window !== 'undefined' ? window.__APP_ENTRY : undefined;
  const [isLogin, setIsLogin] = useState(defaultEntry !== 'register');
  useEffect(() => {
    if (typeof window !== 'undefined' && window.__APP_ENTRY) {
      window.__APP_ENTRY = undefined;
    }
  }, []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const { login, register, loading, error } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        if (!email || !password) return;
        await login(email, password);
      } else {
        if (!firstName || !lastName || !email || !password) return;
        if(password.length < 6) {
            alert('Password must contain at least 6 characters.');
            return;
        }
        await register(firstName, lastName, email, password);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
        <div>
          <h2 className="text-3xl font-extrabold text-center text-white">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </h2>
          <p className="mt-2 text-sm text-center text-gray-400">
            or{' '}
            <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-indigo-400 hover:text-indigo-300">
              {isLogin ? 'create an account' : 'sign in instead'}
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="flex space-x-4">
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="relative block w-full px-3 py-2 text-white placeholder-gray-500 bg-gray-700 border border-gray-600 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="relative block w-full px-3 py-2 text-white placeholder-gray-500 bg-gray-700 border border-gray-600 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          )}
          <input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="relative block w-full px-3 py-2 text-white placeholder-gray-500 bg-gray-700 border border-gray-600 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            className="relative block w-full px-3 py-2 text-white placeholder-gray-500 bg-gray-700 border border-gray-600 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          {error && <p className="text-sm text-red-400">{error}</p>}
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {loading ? <SpinnerIcon className="w-5 h-5"/> : (isLogin ? 'Sign in' : 'Register')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
