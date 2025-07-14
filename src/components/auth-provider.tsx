"use client";

import type { User } from "@/lib/types";
import { 
    getUsers, 
    getUserByEmail, 
    createUser,
    updateUserRole as updateRoleInDb 
} from "@/lib/firebase/services";
import React, { createContext, useState, useEffect, ReactNode, useCallback, useContext } from "react";
import { auth } from '@/lib/firebase/config';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  updateUserRole: (userId: string, newRole: User["role"]) => void;
  users: User[];
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const handleUser = useCallback(async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser?.email) {
      let appUser = await getUserByEmail(firebaseUser.email);
      if (!appUser) {
        // If user does not exist in Firestore, create a new one.
        const newUser: Omit<User, 'id'> = {
          email: firebaseUser.email,
          name: firebaseUser.displayName || "New User",
          role: "student", // Default role
        };
        appUser = await createUser(newUser);
      }
      setUser(appUser);
      sessionStorage.setItem("campus-hub-user", JSON.stringify(appUser));
    } else {
      setUser(null);
      sessionStorage.removeItem("campus-hub-user");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleUser);
    
    // Also check session storage on initial load
    const sessionUser = sessionStorage.getItem("campus-hub-user");
    if(sessionUser) {
        try {
            setUser(JSON.parse(sessionUser));
        } catch (e) {
            sessionStorage.removeItem("campus-hub-user");
        }
    }
    setLoading(false);
    
    // Fetch all users on initial load for admin panel
    getUsers().then(setUsers);

    return () => unsubscribe();
  }, [handleUser]);

  const login = useCallback(async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await handleUser(result.user);
    } catch (error) {
      console.error("Authentication failed:", error);
      setLoading(false);
    }
  }, [handleUser]);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
    sessionStorage.removeItem("campus-hub-user");
  }, []);

  const updateUserRole = useCallback(async (userId: string, newRole: User["role"]) => {
    await updateRoleInDb(userId, newRole);
    const updatedUsers = await getUsers();
    setUsers(updatedUsers);
  }, []);


  const value = { user, loading, login, logout, updateUserRole, users };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
