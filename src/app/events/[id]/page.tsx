
import { getEvent, getClub } from '@/lib/firebase/services';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Users } from 'lucide-react';
import { AuthProvider } from '@/components/auth-provider';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

type Props = {
    params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getEvent(params.id);
  return {
    title: event ? `${event.name} | Campus Hub` : 'Event Not Found',
  }
}

async function EventDetailPageContent({ eventId }: { eventId: string }) {
    const event = await getEvent(eventId);
    
    if (!event) {
        notFound();
    }
    
    const club = await getClub(event.clubId);
    const eventDate = new Date(event.date);

    return (
        <div className="flex flex-col min-h-screen bg-secondary/20">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                 <Link href="/">
                    <Button variant="ghost" className="mb-6">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                    </Button>
                </Link>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <Card>
                             <CardHeader className="p-0">
                                <div className="relative h-64 w-full rounded-t-lg overflow-hidden">
                                <Image src={`https://placehold.co/1200x600.png`} alt={event.name} layout="fill" objectFit="cover" data-ai-hint="event conference" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <h1 className="text-3xl font-headline font-bold mb-2 text-primary">{event.name}</h1>
                                <p className="text-lg text-muted-foreground font-body mt-4">{event.description}</p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl font-headline">Event Details</CardTitle>
                            </CardHeader>
                             <CardContent className="space-y-4 text-sm">
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-4 h-4 mt-0.5 text-primary" />
                                    <div>
                                        <p className="font-semibold">Date & Time</p>
                                        <p className="text-muted-foreground">{eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        <p className="text-muted-foreground">{eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                                 <div className="flex items-start gap-3">
                                    <MapPin className="w-4 h-4 mt-0.5 text-primary" />
                                    <div>
                                        <p className="font-semibold">Location</p>
                                        <p className="text-muted-foreground">{event.location}</p>
                                    </div>
                                </div>
                                {club && (
                                     <div className="flex items-start gap-3">
                                        <Users className="w-4 h-4 mt-0.5 text-primary" />
                                        <div>
                                            <p className="font-semibold">Organized by</p>
                                            <Link href={`/clubs/${club.id}`}>
                                                <Button variant="link" className="p-0 h-auto text-sm text-primary hover:underline">{club.name}</Button>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                         <Button size="lg" className="w-full" disabled>
                            Register via Dashboard
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    )
}


export default function EventDetailPage({ params }: Props) {
    return (
        <AuthProvider>
            <EventDetailPageContent eventId={params.id} />
        </AuthProvider>
    )
}
