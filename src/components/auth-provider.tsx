"use client";

import type { User } from "@/lib/types";
import { mockUsers } from "@/lib/mock-data";
import React, { createContext, useState, useEffect, ReactNode, useCallback, useContext } from "react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, role: User["role"]) => void;
  logout: () => void;
  updateUserRole: (userId: string, newRole: User["role"]) => void;
  users: User[];
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for an existing session
    try {
      const sessionUser = sessionStorage.getItem("campus-hub-user");
      if (sessionUser) {
        setUser(JSON.parse(sessionUser));
      }
    } catch (error) {
      console.error("Could not parse user from session storage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((email: string, role: User["role"]) => {
    setLoading(true);
    // In a real app, you'd call Firebase here.
    // For this mock, we find a user with the specified role.
    let foundUser = users.find(u => u.role === role);
    if (!foundUser) {
        // fallback to first user of any role if specific role not found
        foundUser = users[0];
    }
    setUser(foundUser);
    sessionStorage.setItem("campus-hub-user", JSON.stringify(foundUser));
    setLoading(false);
  }, [users]);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem("campus-hub-user");
  }, []);

  const updateUserRole = useCallback((userId: string, newRole: User["role"]) => {
    setUsers(prevUsers => 
      prevUsers.map(u => u.id === userId ? { ...u, role: newRole } : u)
    );
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
