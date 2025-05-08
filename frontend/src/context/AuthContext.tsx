
import React, { createContext, useState, useContext, useEffect } from "react";
import apiClient from "@/lib/api-adapter";
import tokenService from "@/lib/token-service";
import { startInactivityTimer, stopInactivityTimer } from "@/utils/inactivityTimer";
import { toast } from "sonner";

interface User {
  id: number;
  username: string;
  email: string;
  name: string | null;
  role: 'admin' | 'editor' | 'viewer';
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (requiredRole: 'admin' | 'editor' | 'viewer') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      // Attempt login
      const response = await apiClient.post('/auth/login/', { username, password });

      if (response.data.tokens && response.data.user) {
        // Store tokens securely
        const { access, refresh } = response.data.tokens;

        // Parse JWT to get expiration time
        const tokenData = JSON.parse(atob(access.split('.')[1]));
        const expiresIn = tokenData.exp - Math.floor(Date.now() / 1000);

        // Store access token in memory only
        tokenService.setAccessToken(access, expiresIn);

        // Temporarily store refresh token in localStorage until HttpOnly cookies are implemented
        localStorage.setItem('refresh_token', refresh);

        // Store user data
        const userData = {
          ...response.data.user,
          // Ensure role is properly formatted
          role: typeof response.data.user.role === 'object'
            ? response.data.user.role.role
            : response.data.user.role
        };

        // Store minimal user info in localStorage
        localStorage.setItem('user_info', JSON.stringify({
          id: userData.id,
          name: userData.name,
          role: userData.role
        }));

        setUser(userData);
        setError(null);

        // Start inactivity timer with role-based timeout
        startInactivityTimer(() => {
          logout();
          // Navigation will be handled by the component using this context
          window.location.href = '/admin/login';
        }, userData.role);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err: any) {
      // Handle errors
      const errorMsg = err.response?.data?.error || err.message || 'Login failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear tokens from memory
    tokenService.clearTokens();

    // Clear user info from localStorage
    localStorage.removeItem('user_info');

    // Reset state
    setUser(null);

    // Stop inactivity timer
    stopInactivityTimer();
  };

  useEffect(() => {
    const initAuth = async () => {
      const userInfo = localStorage.getItem('user_info');

      if (userInfo && tokenService.isAuthenticated()) {
        try {
          // Parse user info
          const userData = JSON.parse(userInfo);
          setUser(userData);

          // Start inactivity timer with role-based timeout
          startInactivityTimer(() => {
            logout();
            // Navigation will be handled by the component using this context
            window.location.href = '/admin/login';
          }, userData.role);

          // Set up token expiry listener
          const handleTokenExpiring = (event: CustomEvent) => {
            const { remainingTime } = event.detail;
            toast.success(`Your session will expire in ${remainingTime} seconds. Please save your work.`);
          };

          window.addEventListener('token:expiring', handleTokenExpiring as EventListener);

          return () => {
            window.removeEventListener('token:expiring', handleTokenExpiring as EventListener);
            stopInactivityTimer();
          };
        } catch (err) {
          console.error('Error initializing authentication:', err);
          logout();
        }
      } else {
        // Clear any stale data
        logout();
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // Define hasPermission function within the provider
  const hasPermission = (requiredRole: 'admin' | 'editor' | 'viewer'): boolean => {
    if (!user) return false;

    const roleHierarchy = {
      admin: 3,
      editor: 2,
      viewer: 1
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


