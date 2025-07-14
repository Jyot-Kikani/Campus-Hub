"use client";

import { useAuth } from "@/components/auth-provider";
import { EventCard } from "@/components/EventCard";
import { mockEvents, mockRegistrations } from "@/lib/mock-data";
import type { Registration, Event } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import Image from "next/image";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>(mockRegistrations);
  const [events] = useState<Event[]>(mockEvents);

  const userRegistrations = useMemo(() => {
    return registrations.filter(r => r.userId === user?.id).map(r => r.eventId);
  }, [registrations, user]);

  const registeredEvents = useMemo(() => {
    return events.filter(e => userRegistrations.includes(e.id));
  }, [events, userRegistrations]);
  
  const upcomingEvents = useMemo(() => {
    return events.filter(e => new Date(e.date) > new Date());
  }, [events]);


  const handleRegister = (eventId: string) => {
    if (!user) return;
    setRegistrations(prev => [...prev, { id: `r${Date.now()}`, eventId, userId: user.id }]);
  };

  const handleUnregister = (eventId: string) => {
    setRegistrations(prev => prev.filter(r => !(r.eventId === eventId && r.userId === user?.id)));
  };
  
  return (
    <div className="space-y-8">
      <div className="p-8 rounded-lg bg-card shadow-lg flex flex-col sm:flex-row items-center gap-8">
        <Image src="https://placehold.co/150x150.png" alt="Student" width={150} height={150} className="rounded-full border-4 border-primary" data-ai-hint="student smiling" />
        <div>
            <h1 className="text-4xl font-headline text-primary">Your Dashboard</h1>
            <p className="text-lg font-body text-muted-foreground mt-2">Explore events, track your registrations, and get involved in campus life.</p>
        </div>
      </div>
      
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="registered">My Registered Events ({registeredEvents.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {upcomingEvents.map(event => (
                    <EventCard
                        key={event.id}
                        event={event}
                        userRole="student"
                        isRegistered={userRegistrations.includes(event.id)}
                        onRegister={handleRegister}
                        onUnregister={handleUnregister}
                    />
                ))}
            </div>
        </TabsContent>
        <TabsContent value="registered">
           {registeredEvents.length > 0 ? (
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                 {registeredEvents.map(event => (
                    <EventCard
                        key={event.id}
                        event={event}
                        userRole="student"
                        isRegistered={true}
                        onUnregister={handleUnregister}
                    />
                ))}
            </div>
           ) : (
             <div className="text-center py-16 border-2 border-dashed rounded-lg mt-6">
                 <h3 className="text-xl font-headline text-muted-foreground">You haven't registered for any events yet.</h3>
                 <p className="font-body mt-2">Check out the "Upcoming Events" tab to find something for you!</p>
             </div>
           )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
