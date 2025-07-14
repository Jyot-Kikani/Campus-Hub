"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';
import type { Club, Event as EventType } from '@/lib/types';

interface ClubDetailPageClientProps {
    club: Club;
    initialEvents: EventType[];
}

export function ClubDetailPageClient({ club, initialEvents }: ClubDetailPageClientProps) {
    return (
        <main className="flex-grow container mx-auto px-4 py-8">
            <Link href="/" passHref>
                <Button variant="ghost" className="mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
            </Link>
            <Card>
                <CardHeader className="p-0">
                     <div className="relative h-64 w-full rounded-t-lg overflow-hidden">
                       <Image src={`https://placehold.co/1200x400.png`} alt={club.name} layout="fill" objectFit="cover" data-ai-hint="teamwork community" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                       <div className="absolute bottom-6 left-6">
                         <h1 className="text-4xl font-headline font-bold text-white">{club.name}</h1>
                       </div>
                     </div>
                </CardHeader>
                <CardContent className="p-6">
                    <p className="text-lg text-muted-foreground mb-8">{club.description}</p>

                    <div>
                        <h2 className="text-2xl font-headline font-semibold mb-4">Upcoming Events</h2>
                        {initialEvents.length > 0 ? (
                            <div className="space-y-4">
                                {initialEvents.map(event => {
                                    const eventDate = new Date(event.date);
                                    return (
                                    <div key={event.id} className="p-4 border rounded-lg flex justify-between items-center">
                                        <div>
                                            <h3 className="font-semibold">{event.name}</h3>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                 <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}</span>
                                                </div>
                                                 <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{event.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Link href={`/events/${event.id}`} passHref>
                                            <Button variant="outline">View Event</Button>
                                        </Link>
                                    </div>
                                )}
                                )}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">This club has no upcoming events.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
