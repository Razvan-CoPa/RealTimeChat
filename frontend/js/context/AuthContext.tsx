import React, { createContext, useCallback, useEffect, useState } from 'react';
import { AuthContextType, User, ThemeOption } from '../types';
import {
  fetchProfile,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  setAuthToken,
  updatePreferences as updatePreferencesRequest,
} from '../services/apiClient';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const initializeAuth = useCallback(async () => {
    setLoading(true);
    const storedToken = localStorage.getItem('authToken');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    setAuthToken(storedToken);
    try {
      const profile = await fetchProfile();
      setUser(profile.user);
      setToken(storedToken);
    } catch (err) {
      console.error('Failed to restore session', err);
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
      setAuthToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const { token: nextToken, user: nextUser } = await loginRequest(email, password);
      localStorage.setItem('authToken', nextToken);
      setAuthToken(nextToken);
      setToken(nextToken);
      setUser(nextUser);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      setAuthToken(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (firstName: string, lastName: string, email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const { token: nextToken, user: nextUser } = await registerRequest(firstName, lastName, email, password);
      localStorage.setItem('authToken', nextToken);
      setAuthToken(nextToken);
      setToken(nextToken);
      setUser(nextUser);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      setAuthToken(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch (err) {
      console.warn('Logout request failed', err);
    }
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setUser(null);
    setToken(null);
  };

  const updatePreferences = async (updates: { theme?: ThemeOption; backgroundUrl?: string | null }) => {
    if (!user) {
      return;
    }
    try {
      const updatedUser = await updatePreferencesRequest(updates);
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update preferences', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    updatePreferences,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
