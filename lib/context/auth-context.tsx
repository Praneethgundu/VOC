"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import api from "../services/api";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  username: string;
  role: string;
  loginTimestamp?: number;
}

interface AuthContextType {
  currentUser: User | null;
  role: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<User>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ 
  children,
  initialHasSession = false
}: { 
  children: ReactNode;
  initialHasSession?: boolean;
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    if (!initialHasSession) {
      setCurrentUser(null);
      localStorage.removeItem("auth_user");
      setIsLoading(false);
      return;
    }

    // Since initialHasSession is true, try to load from localStorage first for immediate UI
    try {
      const saved = localStorage.getItem("auth_user");
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to parse auth_user", e);
    }

    const initAuth = async () => {
      try {
        const res = await api.get("/auth/profile");
        const userProfile = {
          id: res.data.user.id,
          username: res.data.user.username,
          role: res.data.user.role,
          loginTimestamp: Date.now()
        };
        setCurrentUser(userProfile);
        localStorage.setItem("auth_user", JSON.stringify(userProfile));
      } catch (error: any) {
        // Only invalidate session on explicit auth errors (401, 403, 404).
        // Keep session active if it's a network issue or temporary server 500/503.
        if (error.response && [401, 403, 404].includes(error.response.status)) {
          setCurrentUser(null);
          localStorage.removeItem("auth_user");
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [initialHasSession]);


  const login = async (credentials: any) => {
    const res = await api.post("/auth/login", credentials);
    if (res.data.requiresPasswordChange) {
      return res.data;
    }
    const { user } = res.data;
    
    const userProfile = { 
      id: user.id, 
      username: user.username, 
      role: user.role,
      loginTimestamp: Date.now()
    };
    
    setCurrentUser(userProfile);
    localStorage.setItem("auth_user", JSON.stringify(userProfile));
    
    return userProfile;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error(e);
    } finally {
      setCurrentUser(null);
      localStorage.removeItem("auth_user");
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
