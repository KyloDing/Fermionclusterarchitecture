import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  getCurrentUser,
  saveAuthTokens,
  saveUser,
  getSavedUser,
  getAccessToken,
  getRefreshToken,
  isAuthenticated,
  logout as authLogout,
  refreshAccessToken,
  isTokenExpired,
  getIdToken,
} from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string, user?: User) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // 检查本地存储中的认证信息
      const savedUser = getSavedUser();
      const accessToken = getAccessToken();

      if (savedUser && accessToken && isAuthenticated()) {
        // 有效的登录状态
        setUser(savedUser);
      } else if (accessToken && isTokenExpired()) {
        // 令牌过期，尝试刷新
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          try {
            const newTokens = await refreshAccessToken(refreshToken);
            saveAuthTokens(newTokens);
            const freshUser = await getCurrentUser(newTokens.accessToken);
            setUser(freshUser);
            saveUser(freshUser);
          } catch (error) {
            // 刷新失败，清除登录状态
            await logout();
          }
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (accessToken: string, providedUser?: User) => {
    try {
      // 如果已经提供了用户信息（来自密码登录），直接使用
      const user = providedUser || await getCurrentUser(accessToken);
      
      setUser(user);
      saveUser(user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    const idToken = getIdToken();
    await authLogout(idToken || undefined);
    setUser(null);
  };

  const refreshUser = async () => {
    const accessToken = getAccessToken();
    if (accessToken) {
      const freshUser = await getCurrentUser(accessToken);
      setUser(freshUser);
      saveUser(freshUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
