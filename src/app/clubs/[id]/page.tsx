import { getClub, getEventsByClub } from '@/lib/firebase/services';
import { Header } from '@/components/Header';
import { AuthProvider } from '@/components/auth-provider';
// import type { Club, Event as EventType } from '@/lib/types';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ClubDetailPageClient } from './ClubDetailPageClient';

type Props = {
    params: { id: string };
};

// export async function generateMetadata({ params }: Props): Promise<Metadata> {
//   const club = await getClub(params.id);
//   if (!club) {
//     return {
//       title: 'Club Not Found | Campus Hub'
//     }
//   }
//   return {
//     title: `${club.name} | Campus Hub`,
//   }
// }

async function ClubDetailPage({ params }: Props) {
    const club = await getClub(params.id);
    
    if (!club) {
        notFound();
    }
    
    const events = await getEventsByClub(params.id);
    const sortedEvents = events.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <AuthProvider>
            <Header />
            <ClubDetailPageClient club={club} initialEvents={sortedEvents} />
        </AuthProvider>
    );
}

export default ClubDetailPage;
