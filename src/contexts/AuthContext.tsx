import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  student_id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  updateUser: (updates: Partial<User>) => void;
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
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      setToken(savedToken);
      fetchUserInfo(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserInfo = async (authToken: string): Promise<User | null> => {
    try {
      const apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
      const response = await fetch(`${apiEndpoint}/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Check if response has JSON content
        const contentType = response.headers.get('content-type');
        let userData: User | null = null;

        if (contentType && contentType.includes('application/json')) {
          const text = await response.text();
          if (text.trim()) {
            try {
              userData = JSON.parse(text);
              setUser(userData);
              return userData;
            } catch (parseError) {
              console.error('JSON parse error in fetchUserInfo:', parseError, 'Response text:', text);
              // Token might be invalid
              localStorage.removeItem('auth_token');
              setToken(null);
              setUser(null);
              return null;
            }
          } else {
            console.error('Empty response from user endpoint');
            localStorage.removeItem('auth_token');
            setToken(null);
            setUser(null);
            return null;
          }
        } else {
          console.error('Non-JSON response from user endpoint');
          localStorage.removeItem('auth_token');
          setToken(null);
          setUser(null);
          return null;
        }
      } else {
        // Token is invalid, remove it
        console.warn('User endpoint returned non-OK status:', response.status);
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = async (newToken: string): Promise<void> => {
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
    setLoading(true);
    await fetchUserInfo(newToken);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  const checkAuth = async (): Promise<boolean> => {
    if (!token) return false;
    const userData = await fetchUserInfo(token);
    return userData !== null;
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    logout,
    checkAuth,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
