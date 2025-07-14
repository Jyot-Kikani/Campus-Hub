"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockEvents, mockClubs } from "@/lib/mock-data";
import { EventList } from "@/components/dashboard/student/EventList";
import { ClubList } from "@/components/dashboard/student/ClubList";
import { CalendarView } from "@/components/dashboard/student/CalendarView";
import { Calendar, Users, List } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("events");

  if (!user) {
    return null;
  }

  const upcomingEvents = mockEvents.filter(e => new Date(e.date) > new Date());
  
  const TABS = {
    events: {
      label: "Events",
      icon: List,
      component: <EventList events={upcomingEvents} />,
    },
    clubs: {
      label: "Clubs",
      icon: Users,
      component: <ClubList clubs={mockClubs} />,
    },
    calendar: {
      label: "Calendar",
      icon: Calendar,
      component: <CalendarView events={mockEvents} />,
    },
  };

  const ActiveComponent = TABS[activeTab as keyof typeof TABS].component;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Student Dashboard</h1>
        <p className="text-muted-foreground font-body">Welcome back, {user.name.split(' ')[0]}!</p>
      </div>
      <div className="border-b">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {Object.entries(TABS).map(([key, { label, icon: Icon }]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`${
                activeTab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
              } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              <Icon className="-ml-0.5 mr-2 h-5 w-5" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
      <div>
        {ActiveComponent}
      </div>
    </div>
  );
}
