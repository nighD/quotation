import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { apiClient } from "../api/client";

export interface User {
  id: string;
  email: string;
  full_name: string;
  roles: string[];
  avatar_url?: string;
  company?: string;
  title?: string;
  country?: string;
  is_joined_waitlist?: boolean;
  card_number?: string;
  card_type?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (access_token: string, refresh_token: string) => void;
  devLogin: (role?: "admin" | "user") => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isLocalEnvironment = () => {
      const hostname = window.location.hostname;
      return (
        hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.") || hostname.startsWith("10.") || hostname.endsWith(".local")
      );
    };

    const isProtectedRoute = (path: string) => {
      if (path === "/" || path === "/login" || path === "/register") {
        return false;
      }
      return true;
    };

    const fetchProfile = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const queryToken = searchParams.get("token");
      const queryRefreshToken = searchParams.get("refresh_token");
      const isLogout = searchParams.get("logout") === "true";

      if (isLogout) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("dev_mock_user");
        setUser(null);

        searchParams.delete("logout");
        const newSearch = searchParams.toString();
        const newPath = window.location.pathname + (newSearch ? `?${newSearch}` : "");
        window.history.replaceState({}, "", newPath);
      } else if (queryToken && queryRefreshToken) {
        localStorage.setItem("access_token", queryToken);
        localStorage.setItem("refresh_token", queryRefreshToken);

        searchParams.delete("token");
        searchParams.delete("refresh_token");
        const newSearch = searchParams.toString();
        const newPath = window.location.pathname + (newSearch ? `?${newSearch}` : "");
        window.history.replaceState({}, "", newPath);
      }

      let token = localStorage.getItem("access_token");
      const pathname = window.location.pathname;

      if (token === "dev-mock-token") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("dev_mock_user");
        token = null;
      }

      if (!token && isLocalEnvironment() && isProtectedRoute(pathname)) {
        try {
          const role = pathname.startsWith("/admin") ? "admin" : "user";
          const { data } = await apiClient.post("/auth/dev-login", { role });
          localStorage.removeItem("dev_mock_user");
          localStorage.setItem("access_token", data.data.access_token);
          localStorage.setItem("refresh_token", data.data.refresh_token);

          setUser(data.data.user);
          setLoading(false);
          return;
        } catch (error) {
          console.error("Auto dev login failed", error);
        }
      }

      if (token) {
        try {
          const { data } = await apiClient.get("/auth/profile");
          setUser(data.data);
        } catch (error) {
          console.error("Failed to fetch profile", error);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("dev_mock_user");
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const login = (access_token: string, refresh_token: string) => {
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    apiClient.get("/auth/profile").then(({ data }) => {
      setUser(data.data);
    });
  };

  const devLogin = async (role: "admin" | "user" = "admin") => {
    const { data } = await apiClient.post("/auth/dev-login", { role });
    localStorage.removeItem("dev_mock_user");
    localStorage.setItem("access_token", data.data.access_token);
    localStorage.setItem("refresh_token", data.data.refresh_token);
    setUser(data.data.user);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("dev_mock_user");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, devLogin, logout, setUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
