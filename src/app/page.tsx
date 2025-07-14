"use client";

import { AuthProvider, useAuth } from "@/components/auth-provider";
import { Login } from "@/components/auth/Login";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Image from "next/image";

function AppContent() {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow">
          {showLogin ? (
            <Login />
          ) : (
            <div className="container mx-auto px-4 py-16 text-center animate-fade-in-up">
              <h1 className="text-5xl md:text-6xl font-headline font-bold text-foreground mb-4">Welcome to Campus Hub</h1>
              <p className="text-lg md:text-xl font-body text-muted-foreground mb-8 max-w-3xl mx-auto">Your one-stop portal for all university clubs and events. Discover, connect, and get involved!</p>
              <div className="relative max-w-4xl mx-auto mb-8 rounded-lg overflow-hidden shadow-2xl">
                 <Image src="https://placehold.co/1200x600.png" alt="Campus Life" width={1200} height={600} className="w-full" data-ai-hint="university campus students" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              <Button size="lg" onClick={() => setShowLogin(true)} className="font-headline text-lg transition-transform hover:scale-105">
                Get Started
              </Button>
            </div>
          )}
        </main>
      </div>
    );
  }

  return <Dashboard />;
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
