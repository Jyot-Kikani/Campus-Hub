
"use client";

import { EventCard } from "@/components/EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Event, Registration } from "@/lib/types";

interface EventListProps {
  events: Event[];
  registrations: Registration[];
  onRegister: (eventId: string) => void;
  onUnregister: (eventId: string) => void;
  isLoading: boolean;
}

export function EventList({ events, isLoading, registrations, onRegister, onUnregister }: EventListProps) {
  const registeredEventIds = new Set(registrations.map(r => r.eventId));

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">Upcoming Events</h2>
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            ))}
        </div>
      ) : events.length > 0 ? (
         <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map(event => (
                <EventCard
                    key={event.id}
                    event={event}
                    userRole="student"
                    isRegistered={registeredEventIds.has(event.id)}
                    onRegister={onRegister}
                    onUnregister={onUnregister}
                />
            ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg mt-6">
            <h3 className="text-xl font-headline text-muted-foreground">No upcoming events.</h3>
            <p className="font-body mt-2">Check back later for more events!</p>
        </div>
      )}
    </div>
  );
}
