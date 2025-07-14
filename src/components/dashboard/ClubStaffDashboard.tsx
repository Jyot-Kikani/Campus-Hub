"use client";

import { useAuth } from "@/components/auth-provider";
import { EventCard } from "@/components/EventCard";
import { getClub, getEventsByClub, createEvent, updateEvent, deleteEvent, getRegisteredUsersForEvent } from "@/lib/firebase/services";
import type { Event, Club, User } from "@/lib/types";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { EventForm } from "@/components/EventForm";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClubStaffDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [club, setClub] = useState<Club | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingRegistrations, setViewingRegistrations] = useState<string | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsersLoading, setIsUsersLoading] = useState(false);

  useEffect(() => {
    if (user?.clubId) {
      setIsLoading(true);
      Promise.all([
        getClub(user.clubId),
        getEventsByClub(user.clubId)
      ]).then(([clubData, eventsData]) => {
        setClub(clubData);
        setEvents(eventsData.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setIsLoading(false);
      });
    }
  }, [user]);

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleCreateNew = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
  };
  
  const handleDelete = async (eventId: string) => {
    // Add a confirmation dialog in a real app
    try {
      await deleteEvent(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
      toast({ title: "Success", description: "Event deleted successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete event.", variant: "destructive" });
    }
  };

  const handleFormSubmit = async (eventData: Omit<Event, 'id' | 'organizer' | 'clubId'>) => {
    if(!club) return;
    
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, { ...eventData, organizer: club.name });
      } else {
        const newEvent: Omit<Event, 'id'> = {
          ...eventData,
          clubId: club.id,
          organizer: club.name,
        };
        await createEvent(newEvent);
      }
      
      const updatedEvents = await getEventsByClub(club.id);
      setEvents(updatedEvents.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setIsFormOpen(false);
      setEditingEvent(null);
      toast({ title: "Success", description: `Event ${editingEvent ? 'updated' : 'created'} successfully.` });
    } catch (error) {
      toast({ title: "Error", description: `Failed to ${editingEvent ? 'update' : 'create'} event.`, variant: "destructive" });
    }
  };

  const handleViewRegistrations = async (eventId: string) => {
    setViewingRegistrations(eventId);
    setIsUsersLoading(true);
    const users = await getRegisteredUsersForEvent(eventId);
    setRegisteredUsers(users);
    setIsUsersLoading(false);
  }
  
  const eventToView = viewingRegistrations ? events.find(e => e.id === viewingRegistrations) : null;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-headline text-primary">Manage Events for {isLoading ? <Skeleton className="h-10 w-48 inline-block" /> : club?.name}</h1>
          <p className="text-lg font-body text-muted-foreground mt-2">Create, update, and oversee your club's activities.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateNew} disabled={isLoading}><PlusCircle className="mr-2 h-4 w-4" />Create Event</Button>
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
        {isLoading ? (
            Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)
        ) : events.map(event => (
          <EventCard
            key={event.id}
            event={event}
            userRole="club_staff"
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewRegistrations={handleViewRegistrations}
          />
        ))}
      </div>
      
      <Dialog open={!!viewingRegistrations} onOpenChange={(open) => !open && setViewingRegistrations(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Registrations for {eventToView?.name}</DialogTitle>
            <DialogDescription>{isUsersLoading ? "Loading..." : `${registeredUsers.length} student(s) registered.`}</DialogDescription>
          </DialogHeader>
            {isUsersLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            ) : registeredUsers.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {registeredUsers.map(user => (
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
