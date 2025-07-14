"use client";

import type { User } from "@/lib/types";
import { getUsers, getUserByRole, updateUserRole as updateRoleInDb } from "@/lib/firebase/services";
import React, { createContext, useState, useEffect, ReactNode, useCallback, useContext } from "react";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, role: User["role"]) => Promise<void>;
  logout: () => void;
  updateUserRole: (userId: string, newRole: User["role"]) => void;
  users: User[];
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for an existing session
    try {
      const sessionUser = sessionStorage.getItem("campus-hub-user");
      if (sessionUser) {
        const parsedUser = JSON.parse(sessionUser);
        // Dates will be strings, convert them back
        if(parsedUser.date) parsedUser.date = new Date(parsedUser.date);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Could not parse user from session storage", error);
    } finally {
      setLoading(false);
    }

    // Fetch all users on initial load for admin panel
    getUsers().then(setUsers);
  }, []);

  const login = useCallback(async (email: string, role: User["role"]) => {
    setLoading(true);
    // In a real app, you'd call Firebase Auth here.
    // For this mock, we find a user with the specified role.
    let foundUser = await getUserByRole(role);
    if (!foundUser) {
        console.warn(`No user found with role: ${role}. You may need to seed your database.`);
        // fallback to first user of any role if specific role not found
        const allUsers = await getUsers();
        if(allUsers.length > 0) {
            foundUser = allUsers[0];
        }
    }

    if (foundUser) {
        setUser(foundUser);
        sessionStorage.setItem("campus-hub-user", JSON.stringify(foundUser));
    }
    
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
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
