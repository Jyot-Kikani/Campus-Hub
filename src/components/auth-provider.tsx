
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
import { browserLocalPersistence, setPersistence } from "firebase/auth";

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
    console.log("🧪 handleUser - firebaseUser:", firebaseUser);
  
    if (firebaseUser?.email) {
      let appUser = await getUserByEmail(firebaseUser.email);
      console.log("🧪 handleUser - existing user from DB:", appUser);
  
      if (!appUser) {
        const newUser: Omit<User, 'id'> = {
          email: firebaseUser.email,
          name: firebaseUser.displayName || "New User",
          role: "student",
        };
        appUser = await createUser(newUser);
        console.log("🧪 handleUser - created new user:", appUser);
      }
  
      setUser(appUser);
      sessionStorage.setItem("campus-hub-user", JSON.stringify(appUser));
    } else {
      console.log("🧪 handleUser - No firebaseUser or no email");
      setUser(null);
      sessionStorage.removeItem("campus-hub-user");
    }
  
    setLoading(false);
  }, []);
  
  useEffect(() => {
    const sessionUserJson = sessionStorage.getItem("campus-hub-user");
    if (sessionUserJson) {
      try {
        const sessionUser = JSON.parse(sessionUserJson);
        setUser(sessionUser);
      } catch (e) {
        sessionStorage.removeItem("campus-hub-user");
      }
    }
    
    // This flag helps prevent race conditions between getRedirectResult and onAuthStateChanged
    let redirectResultHandled = false;

    // Handle the redirect result from Google Sign-In
    getRedirectResult(auth)
      .then(async (result) => {
        console.log("🧪 Redirect result:", result);
        redirectResultHandled = true;
        if (result?.user) {
          await handleUser(result.user);
        } else {
          // If no result, onAuthStateChanged will handle it, or we stop loading if no user is found.
           if (!auth.currentUser) {
            setLoading(false);
           }
        }
      })
      .catch((error) => {
        console.error("🧪 Redirect result error:", error);
        setLoading(false);
      });

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
       // Wait for getRedirectResult to finish before processing onAuthStateChanged
       // to avoid setting user to null and then back to the logged in user.
      if (redirectResultHandled) {
        console.log("🧪 onAuthStateChanged - firebaseUser:", firebaseUser);
        if (firebaseUser) {
          const sessionUser = sessionStorage.getItem("campus-hub-user");
          // Update user state only if it's not already set by session restore or redirect handler
          if (!sessionUser || JSON.parse(sessionUser).id !== firebaseUser.uid) {
              handleUser(firebaseUser);
          } else {
            setLoading(false);
          }
        } else {
          handleUser(null);
        }
      }
    });
    
    getUsers().then(setUsers);

    return () => unsubscribe();
  }, [handleUser]);

  const login = useCallback(async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
  
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithRedirect(auth, provider);
    } catch (err) {
      console.error("🧪 Login error:", err);
      setLoading(false);
    }
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
