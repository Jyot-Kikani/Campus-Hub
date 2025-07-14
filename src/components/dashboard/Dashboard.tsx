"use client";

import { useAuth } from "@/components/auth-provider";
import StudentDashboard from "./StudentDashboard";
import ClubStaffDashboard from "./ClubStaffDashboard";
import AdminDashboard from "./AdminDashboard";
import { Header } from "@/components/Header";

export function Dashboard() {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case "student":
        return <StudentDashboard />;
      case "club_staff":
        return <ClubStaffDashboard />;
      case "admin":
        return <AdminDashboard />;
      default:
        return <div>Invalid user role. Please log out and try again.</div>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
            {renderDashboard()}
        </main>
    </div>
  )
}
