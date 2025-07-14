
import type { Event } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Edit, Trash2, ArrowRight } from "lucide-react";
import type { UserRole } from "@/lib/types";
import Link from "next/link";

interface EventCardProps {
  event: Event;
  userRole: UserRole;
  isRegistered?: boolean;
  onRegister?: (eventId: string) => void;
  onUnregister?: (eventId: string) => void;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  onViewRegistrations?: (eventId: string) => void;
}

export function EventCard({
  event,
  userRole,
  isRegistered = false,
  onRegister,
  onUnregister,
  onEdit,
  onDelete,
  onViewRegistrations
}: EventCardProps) {
  const eventDate = new Date(event.date);

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-shadow duration-300 ease-in-out hover:shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl text-primary">{event.name}</CardTitle>
        <CardDescription className="font-body">{event.organizer}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <p className="font-body text-sm text-muted-foreground line-clamp-3">{event.description}</p>
        <div className="space-y-1.5 font-body text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>{eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} at {eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span>{event.location}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-4 bg-secondary/50 p-4">
        <Link href={`/events/${event.id}`}>
           <Button variant="link" className="p-0 h-auto">View Details <ArrowRight className="ml-1 h-4 w-4" /></Button>
        </Link>
        {userRole === 'student' && onRegister && onUnregister && (
           isRegistered ? (
             <Button variant="secondary" onClick={() => onUnregister(event.id)}>Unregister</Button>
           ) : (
             <Button onClick={() => onRegister(event.id)}>Register</Button>
           )
        )}
        {userRole === 'club_staff' && onEdit && onDelete && onViewRegistrations && (
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => onViewRegistrations(event.id)}><Users className="mr-2 h-4 w-4" />View</Button>
            <Button variant="ghost" size="icon" onClick={() => onEdit(event)}><Edit className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onDelete(event.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
