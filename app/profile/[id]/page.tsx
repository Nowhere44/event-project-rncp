'use client'

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import ProfileComponent from '../_components/profile-component';
import EventList from '@/app/events/_components/event-list';
import { useEffect, useState } from 'react';
import { IEvent, IReservation } from '@/types';
import EventStats from '../_components/event-stats';
import Link from 'next/link';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [userEvents, setUserEvents] = useState<IEvent[]>([]);
    const [userReservations, setUserReservations] = useState<IReservation[]>([]);

    useEffect(() => {
        const fetchUserEventsAndReservations = async () => {
            if (session?.user?.id === id) {
                // Fetch user's events
                const eventsResponse = await fetch(`/api/reservations?userId=${id}`);
                if (eventsResponse.ok) {
                    const events = await eventsResponse.json();
                    setUserEvents(events);
                }

                // Fetch user's reservations
                const reservationsResponse = await fetch(`/api/user-reservations?userId=${id}`);
                if (reservationsResponse.ok) {
                    const reservations = await reservationsResponse.json();
                    setUserReservations(reservations);
                }
            }
        };

        fetchUserEventsAndReservations();
    }, [id, session]);

    if (status === 'loading') return <div>Chargement...</div>;
    if (status === 'unauthenticated') {
        router.push('/login');
        return null;
    }
    if (!session?.user || session.user.id !== id) {
        router.push('/unauthorized');
        return null;
    }

    return (
        <>
            <ProfileComponent userId={id} />
            <EventStats events={userEvents} />
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Mes événements et leurs réservations</h2>
                {userEvents.map(event => (
                    <div key={event.id} className="mb-8 p-4 border rounded-lg">
                        <h3 className="text-xl font-semibold">{event.title}</h3>
                        <p>Capacité totale : {event.capacity}</p>
                        <p>Places restantes : {event.capacity - event.reservations.reduce((sum, res) => sum + res.numberOfTickets, 0)}</p>
                        <h4 className="mt-4 font-medium">Réservations :</h4>
                        <ul>
                            {event.reservations.map(reservation => (
                                <li key={reservation.id}>
                                    {reservation.user.first_name} {reservation.user.last_name} - {reservation.numberOfTickets} place(s)
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Mes réservations</h2>
                {userReservations.map(reservation => (
                    <Link href={`/reservations/${reservation.id}`} key={reservation.id}>
                        <div className="mb-4 p-4 border rounded-lg hover:bg-gray-100">
                            <h3 className="text-xl font-semibold">{reservation.event.title}</h3>
                            <p>Nombre de tickets : {reservation.numberOfTickets}</p>
                            <p>Montant total : {reservation.totalAmount} €</p>
                        </div>
                    </Link>
                ))}
            </div>
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Tous mes événements</h2>
                <EventList
                    data={userEvents}
                    emptyTitle="Vous n'avez pas encore créé d'événements"
                    emptyStateSubtext="Commencez à créer vos propres événements!"
                    collectionType="Events_Organized"
                    limit={10}
                    page={1}
                    totalPages={1}
                />
            </div>
        </>
    );
}