
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
import { 
    GoogleAuthProvider, 
    signInWithPopup,
    signOut, 
    onAuthStateChanged, 
    type User as FirebaseUser 
} from "firebase/auth";

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
        const newUser: Omit<User, 'id'> = {
          email: firebaseUser.email,
          name: firebaseUser.displayName || "New User",
          role: "student",
        };
        appUser = await createUser(newUser);
      }
      setUser(appUser);
      setLoading(false);
      return appUser;
    } else {
      setUser(null);
      setLoading(false);
      return null;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        handleUser(firebaseUser);
    });

    getUsers().then(setUsers);

    return () => unsubscribe();
  }, [handleUser]);

  const login = useCallback(async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // The onAuthStateChanged listener will handle the user creation
      // and state update, so we don't need to do it here.
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
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
