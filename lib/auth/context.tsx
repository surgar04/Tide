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
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const stored = localStorage.getItem("tideoa_user_blob");
        // We also need the password/secret to decrypt.
        // However, if we want "auto-login next time", we must store the secret or the decrypted token.
        // But the prompt says "encrypted saved locally".
        // If we encrypt with the password, we can't decrypt without the user typing it again.
        // Unless we store the key itself (insecure) or use a session token approach.
        // BUT, the prompt says "Next time open do not need to re-login".
        // This implies we either:
        // 1. Store the password (bad).
        // 2. Store the data unencrypted but obfuscated? No, user said "encrypted".
        // 3. Use a persistent key stored in localStorage (which defeats the purpose of encryption against local access, but satisfies "encrypted format").
        // Let's assume for this "offline-first" style app, we generate a device-specific key or just store the session.
        
        // Strategy:
        // The "Binary File" contains the user data.
        // To auto-login, we need to be able to read it.
        // If it's encrypted with the user's password, we can't read it without the password.
        // Maybe the requirement "Encrypted saved locally" refers to the *format*, but for auto-login we might need to cache the key or use a "Remember Me" token.
        
        // Let's implement a "Device Key" that is stored in localStorage to decrypt the blob.
        // This simulates a "Session".
        
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
    // Save to local storage
    // We use the 'secret' (password) to generate the session key?
    // Or we just store the data encrypted with the password?
    // If we want auto-login, we effectively need to store the credential.
    // Let's use the provided secret as the key for encryption, and store it (or a hash) to decrypt later.
    // For a strictly local app, storing the password (or key derived from it) in localStorage is the only way to auto-decrypt on reload without user input.
    
    // To make it slightly better, we can assume the "secret" passed here IS the password.
    // We will encrypt the data with this password.
    // And to support "No re-login", we save the password (or derived key) in localStorage.
    
    const encrypted = await encryptData(userData, secret);
    localStorage.setItem("tideoa_user_blob", encrypted);
    localStorage.setItem("tideoa_session_key", secret); // In a real app, this is insecure, but required for "Auto-login with Client-side Encryption"
    
    setUser(userData);
    router.push("/");
  };

  const logout = () => {
    localStorage.removeItem("tideoa_user_blob");
    localStorage.removeItem("tideoa_session_key");
    setUser(null);
    router.push("/login");
  };

  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-[var(--end-yellow)]">
      SYSTEM INITIALIZING...
    </div>;
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
