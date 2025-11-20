import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, User, Tokens } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('accessToken');
    if (token) {
      // In a real app, you'd validate the token or fetch user info
      // For now, we'll assume the token is valid
      setUser({ id: 'temp', email: 'temp@example.com', createdAt: new Date().toISOString() });
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      setUser(response.user);
      localStorage.setItem('accessToken', response.tokens.access);
      localStorage.setItem('refreshToken', response.tokens.refresh);
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const response = await apiService.register(email, password);
      setUser(response.user);
      localStorage.setItem('accessToken', response.tokens.access);
      localStorage.setItem('refreshToken', response.tokens.refresh);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    apiService.logout();
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
