
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/auth-provider";
import { EventList } from "@/components/dashboard/student/EventList";
import { ClubList } from "@/components/dashboard/student/ClubList";
import { CalendarView } from "@/components/dashboard/student/CalendarView";
import { Calendar, Users, List } from "lucide-react";
import { getEvents, getClubs, getRegistrationsForUser, registerForEvent, unregisterFromEvent } from "@/lib/firebase/services";
import type { Event, Club, Registration } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState<Event[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudentData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const [eventsData, clubsData, registrationsData] = await Promise.all([
      getEvents(),
      getClubs(),
      getRegistrationsForUser(user.id),
    ]);
    setEvents(eventsData.filter(e => new Date(e.date) > new Date()));
    setClubs(clubsData);
    setRegistrations(registrationsData);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  const handleRegister = async (eventId: string) => {
    if (!user) return;
    try {
      await registerForEvent(user.id, eventId);
      await fetchStudentData(); // Re-fetch to update state
      toast({ title: "Success", description: "You have been registered for the event." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to register for the event.", variant: "destructive" });
    }
  };

  const handleUnregister = async (eventId: string) => {
    if (!user) return;
    try {
      await unregisterFromEvent(user.id, eventId);
      await fetchStudentData(); // Re-fetch to update state
      toast({ title: "Success", description: "You have been unregistered from the event." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to unregister from the event.", variant: "destructive" });
    }
  };

  if (!user) {
    return null;
  }
  
  const TABS = {
    events: {
      label: "Events",
      icon: List,
      component: <EventList 
        events={events} 
        registrations={registrations}
        onRegister={handleRegister}
        onUnregister={handleUnregister}
        isLoading={isLoading} 
      />,
    },
    clubs: {
      label: "Clubs",
      icon: Users,
      component: <ClubList clubs={clubs} isLoading={isLoading} />,
    },
    calendar: {
      label: "Calendar",
      icon: Calendar,
      component: <CalendarView events={events} isLoading={isLoading} />,
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
