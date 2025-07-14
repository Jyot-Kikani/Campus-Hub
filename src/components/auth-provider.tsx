
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
    signInWithRedirect,
    getRedirectResult,
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
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // This handles session persistence. If user is logged in, it will be caught here.
      if (firebaseUser && !user) {
         handleUser(firebaseUser);
      } else {
        setLoading(false);
      }
    });

    // Check for redirect result
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          handleUser(result.user);
        }
      })
      .catch((error) => {
        console.error("Error getting redirect result:", error);
        setLoading(false);
      });
    
    // Also check session storage on initial load
    const sessionUser = sessionStorage.getItem("campus-hub-user");
    if(sessionUser) {
        try {
            setUser(JSON.parse(sessionUser));
        } catch (e) {
            sessionStorage.removeItem("campus-hub-user");
        }
    }
    
    // Fetch all users on initial load for admin panel
    getUsers().then(setUsers);

    return () => unsubscribe();
  }, [handleUser, user]);

  const login = useCallback(async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
    // No need to handle user here, it will be handled by getRedirectResult and onAuthStateChanged
  }, []);

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
