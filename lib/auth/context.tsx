"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { encryptData, decryptData } from "./crypto";

interface User {
  username: string;
  email: string;
  avatar: string; // Base64 data URL
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: User, secret: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // ... (useEffect remains same) ...

  useEffect(() => {
    const initAuth = async () => {
      try {
        const stored = localStorage.getItem("tideoa_user_blob");
        const sessionKey = localStorage.getItem("tideoa_session_key");
        
        if (stored && sessionKey) {
          const decrypted = await decryptData(stored, sessionKey);
          setUser(decrypted);
          if (pathname === "/login") {
            router.push("/");
          }
        } else {
          if (pathname !== "/login") {
            router.push("/login");
          }
        }
      } catch (e) {
        console.error("Auth init failed", e);
        localStorage.removeItem("tideoa_user_blob");
        localStorage.removeItem("tideoa_session_key");
        if (pathname !== "/login") {
          router.push("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (userData: User, secret: string) => {
    const encrypted = await encryptData(userData, secret);
    localStorage.setItem("tideoa_user_blob", encrypted);
    localStorage.setItem("tideoa_session_key", secret);
    
    setUser(userData);
    router.push("/");
  };

  const logout = () => {
    localStorage.removeItem("tideoa_user_blob");
    localStorage.removeItem("tideoa_session_key");
    setUser(null);
    router.push("/login");
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const newUser = { ...user, ...updates };
    setUser(newUser);
    
    // Re-encrypt with existing session key
    const sessionKey = localStorage.getItem("tideoa_session_key");
    if (sessionKey) {
      const encrypted = await encryptData(newUser, sessionKey);
      localStorage.setItem("tideoa_user_blob", encrypted);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-[var(--end-yellow)]">
      SYSTEM INITIALIZING...
    </div>;
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
