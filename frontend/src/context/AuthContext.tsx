import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiClient } from '../api/client';

export interface User {
  id: string;
  email: string;
  full_name: string;
  roles: string[];
  avatar_url?: string;
  company?: string;
  title?: string;
  country?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (access_token: string, refresh_token: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const queryToken = searchParams.get('token');
      const queryRefreshToken = searchParams.get('refresh_token');
      const isLogout = searchParams.get('logout') === 'true';

      if (isLogout) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        
        searchParams.delete('logout');
        const newSearch = searchParams.toString();
        const newPath = window.location.pathname + (newSearch ? `?${newSearch}` : '');
        window.history.replaceState({}, '', newPath);
      } else if (queryToken && queryRefreshToken) {
        localStorage.setItem('access_token', queryToken);
        localStorage.setItem('refresh_token', queryRefreshToken);
        
        searchParams.delete('token');
        searchParams.delete('refresh_token');
        const newSearch = searchParams.toString();
        const newPath = window.location.pathname + (newSearch ? `?${newSearch}` : '');
        window.history.replaceState({}, '', newPath);
      }

      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const { data } = await apiClient.get('/auth/profile');
          setUser(data.data);
        } catch (error) {
          console.error("Failed to fetch profile", error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const login = (access_token: string, refresh_token: string) => {
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    // Fetch profile after login
    apiClient.get('/auth/profile').then(({ data }) => setUser(data.data));
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
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
