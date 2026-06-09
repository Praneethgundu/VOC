"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import api from "../services/api";
import { getAccessToken, setTokens, removeTokens } from "../utils/jwt";
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const res = await api.get("/auth/profile");
          const userProfile = {
            id: res.data.user.id,
            username: res.data.user.username,
            role: res.data.user.role,
            loginTimestamp: Date.now()
          };
          setCurrentUser(userProfile);
        } catch (error) {
          console.error("Failed to fetch profile", error);
          removeTokens();
          setCurrentUser(null);
        }
      } else {
        removeTokens();
        setCurrentUser(null);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: any) => {
    const res = await api.post("/auth/login", credentials);
    const { accessToken, refreshToken, user } = res.data;
    
    const userProfile = { 
      id: user.id, 
      username: user.username, 
      role: user.role,
      loginTimestamp: Date.now()
    };
    
    setTokens(accessToken, refreshToken);
    setCurrentUser(userProfile);
    
    return userProfile;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error(e);
    } finally {
      removeTokens();
      setCurrentUser(null);
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
