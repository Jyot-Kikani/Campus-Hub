import type { Event } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Edit, Trash2 } from "lucide-react";
import type { UserRole } from "@/lib/types";

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
    <Card className="flex flex-col h-full overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">{event.name}</CardTitle>
        <CardDescription className="font-body">{event.organizer}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <p className="font-body text-muted-foreground">{event.description}</p>
        <div className="space-y-2 font-body text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent" />
            <span>{eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-accent" />
            <span>{event.location}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 pt-4">
        {userRole === 'student' && onRegister && onUnregister && (
          isRegistered ? (
            <Button variant="outline" onClick={() => onUnregister(event.id)}>Unregister</Button>
          ) : (
            <Button onClick={() => onRegister(event.id)}>Register</Button>
          )
        )}
        {userRole === 'club_staff' && onEdit && onDelete && onViewRegistrations && (
          <div className="flex w-full justify-between items-center">
            <Button variant="outline" size="sm" onClick={() => onViewRegistrations(event.id)}><Users className="mr-2 h-4 w-4" />View Registrations</Button>
            <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => onEdit(event)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onDelete(event.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
