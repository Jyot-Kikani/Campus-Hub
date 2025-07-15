
"use client";

import type { Club, User } from "@/lib/types";
import { 
    getUsers, 
    getUserByEmail, 
    createUser,
    updateUser as updateUserInDb,
    getClubs,
} from "@/lib/firebase/services";
import React, { createContext, useState, useEffect, ReactNode, useCallback, useContext, useMemo } from "react";
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
  updateUser: (userId: string, data: Partial<User>) => Promise<void>;
  users: User[];
  clubs: Club[];
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHandlingUser, setIsHandlingUser] = useState(false);

  const fetchInitialData = useCallback(async () => {
    try {
      const [usersData, clubsData] = await Promise.all([getUsers(), getClubs()]);
      setUsers(usersData);
      setClubs(clubsData);
    } catch (error) {
      console.error("Failed to fetch initial data", error);
    }
  }, []);

  const handleUser = useCallback(async (firebaseUser: FirebaseUser | null) => {
    if (isHandlingUser) return;
    setIsHandlingUser(true);

    if (firebaseUser?.email) {
      try {
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
      } catch (error) {
        console.error("Error handling user:", error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
    setIsHandlingUser(false);
  }, [isHandlingUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleUser);
    fetchInitialData();
    return () => unsubscribe();
  }, [handleUser, fetchInitialData]);

  const login = useCallback(async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle the rest
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
  }, []);

  const updateUser = useCallback(async (userId: string, data: Partial<User>) => {
    await updateUserInDb(userId, data);
    const updatedUsers = await getUsers();
    setUsers(updatedUsers);
  }, []);


  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    updateUser,
    users,
    clubs
  }), [user, loading, login, logout, updateUser, users, clubs]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
