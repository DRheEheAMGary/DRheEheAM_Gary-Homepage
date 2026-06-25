import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as wpApi from '../api/wordpress';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 启动时尝试恢复登录状态
  useEffect(() => {
    wpApi.getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (username, password) => {
    const userData = await wpApi.login(username, password);
    const u = {
      name: userData.displayName || userData.nicename,
      slug: userData.nicename,
      avatar: userData.avatar,
    };
    setUser(u);
    return u;
  }, []);

  const logoutUser = useCallback(() => {
    wpApi.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout: logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
