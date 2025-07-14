"use client";

import { useAuth } from "@/components/auth-provider";
import { EventCard } from "@/components/EventCard";
import { mockEvents, mockClubs, mockRegistrations, mockUsers } from "@/lib/mock-data";
import type { Event, Club, Registration, User } from "@/lib/types";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { EventForm } from "@/components/EventForm";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ClubStaffDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [clubs] = useState<Club[]>(mockClubs);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [registrations] = useState<Registration[]>(mockRegistrations);
  const [users] = useState<User[]>(mockUsers);
  const [viewingRegistrations, setViewingRegistrations] = useState<string | null>(null);

  const club = useMemo(() => {
    return clubs.find(c => c.id === user?.clubId);
  }, [clubs, user]);

  const clubEvents = useMemo(() => {
    return events.filter(e => e.clubId === user?.clubId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [events, user]);

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleCreateNew = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };
  
  const handleDelete = (eventId: string) => {
    // Add a confirmation dialog in a real app
    setEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const handleFormSubmit = (eventData: Omit<Event, 'id' | 'organizer' | 'clubId'>) => {
    if(!club) return;

    if (editingEvent) {
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...e, ...eventData, organizer: club.name } : e));
    } else {
      const newEvent: Event = {
        id: `e${Date.now()}`,
        ...eventData,
        clubId: club.id,
        organizer: club.name,
      };
      setEvents(prev => [newEvent, ...prev]);
    }
    setIsFormOpen(false);
    setEditingEvent(null);
  };
  
  const registeredUsersForEvent = useMemo(() => {
    if (!viewingRegistrations) return [];
    const eventRegistrations = registrations.filter(r => r.eventId === viewingRegistrations);
    return users.filter(u => eventRegistrations.some(r => r.userId === u.id));
  }, [viewingRegistrations, registrations, users]);
  
  const eventToView = viewingRegistrations ? events.find(e => e.id === viewingRegistrations) : null;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-headline text-primary">Manage Events for {club?.name}</h1>
          <p className="text-lg font-body text-muted-foreground mt-2">Create, update, and oversee your club's activities.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateNew}><PlusCircle className="mr-2 h-4 w-4" />Create Event</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
            </DialogHeader>
            <EventForm onSubmit={handleFormSubmit} event={editingEvent ?? undefined} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubEvents.map(event => (
          <EventCard
            key={event.id}
            event={event}
            userRole="club_staff"
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewRegistrations={(eventId) => setViewingRegistrations(eventId)}
          />
        ))}
      </div>
      
      <Dialog open={!!viewingRegistrations} onOpenChange={(open) => !open && setViewingRegistrations(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Registrations for {eventToView?.name}</DialogTitle>
            <DialogDescription>{registeredUsersForEvent.length} student(s) registered.</DialogDescription>
          </DialogHeader>
            {registeredUsersForEvent.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {registeredUsersForEvent.map(user => (
                  <Card key={user.id}>
                    <CardContent className="p-3 flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={`https://placehold.co/100x100.png`} alt={user.name} data-ai-hint="user avatar" />
                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-muted-foreground font-body">No registrations yet.</p>
            )}
           <DialogFooter>
             <Button variant="outline" onClick={() => setViewingRegistrations(null)}>Close</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
