"use client";

import { useState } from "react";
import type { Event } from "@/lib/types";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface CalendarViewProps {
  events: Event[];
}

export function CalendarView({ events }: CalendarViewProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const selectedDayEvents = events.filter(event => {
    if (!date) return false;
    const eventDate = new Date(event.date);
    return eventDate.toDateString() === date.toDateString();
  });

  const eventDates = events.map(event => new Date(event.date));

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">Event Calendar</h2>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-0">
               <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="p-0"
                modifiers={{ eventDays: eventDates }}
                modifiersStyles={{
                  eventDays: {
                    color: "hsl(var(--primary-foreground))",
                    backgroundColor: "hsl(var(--primary))",
                  },
                }}
                classNames={{
                  day: "h-12 w-12",
                  head_cell: "w-12",
                }}
              />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <h3 className="font-headline text-lg">
            Events on {date ? date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : 'selected date'}
          </h3>
          {selectedDayEvents.length > 0 ? (
            <div className="space-y-4">
              {selectedDayEvents.map(event => (
                <Card key={event.id}>
                  <CardHeader>
                    <CardTitle className="text-base font-headline">{event.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">{event.organizer}</p>
                     <Link href={`/events/${event.id}`} passHref>
                        <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-primary">
                          View Details <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground font-body pt-4">No events scheduled for this day.</p>
          )}
        </div>
      </div>
    </div>
  );
}
