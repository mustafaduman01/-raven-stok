import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('peynir_stok_token');
    const savedUser = localStorage.getItem('peynir_stok_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Token'ın sunucu tarafında geçerliliğini doğrula (SEC-03, SEC-05)
        api
          .get('/api/auth/me')
          .then((res) => {
            setUser(res.data);
            localStorage.setItem('peynir_stok_user', JSON.stringify(res.data));
          })
          .catch(() => {
            logout();
          })
          .finally(() => setIsLoading(false));
        return;
      } catch {
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('peynir_stok_token', newToken);
    localStorage.setItem('peynir_stok_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('peynir_stok_token');
    localStorage.removeItem('peynir_stok_user');
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data);
      localStorage.setItem('peynir_stok_user', JSON.stringify(res.data));
    } catch (err) {
      console.error('Kullanıcı güncellenemedi:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth bir AuthProvider içinde kullanılmalıdır.');
  }
  return context;
};
