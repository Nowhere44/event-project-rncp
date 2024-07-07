// app/profile/[id]/page.tsx
'use client'

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import ProfileComponent from '../_components/profile-component';
import EventList from '@/app/events/_components/event-list';
import { useEffect, useState } from 'react';
import { IEvent, IReservation, IUser } from '@/types';
import EventStats from '../_components/event-stats';
import Link from 'next/link';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from 'next/image';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [userEvents, setUserEvents] = useState<IEvent[]>([]);
    const [userReservations, setUserReservations] = useState<IReservation[]>([]);
    const [userData, setUserData] = useState<IUser | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (session?.user?.id === id) {
                const userResponse = await fetch(`/api/users/${id}`);
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setUserData(userData);
                }

                const eventsResponse = await fetch(`/api/user-events?userId=${id}`);
                if (eventsResponse.ok) {
                    const events = await eventsResponse.json();
                    setUserEvents(events);
                }

                const reservationsResponse = await fetch(`/api/user-reservations?userId=${id}`);
                if (reservationsResponse.ok) {
                    const reservations = await reservationsResponse.json();
                    setUserReservations(reservations);
                }
            }
        };

        fetchUserData();
    }, [id, session]);

    if (status === 'loading') return <div className="flex justify-center items-center h-screen">Chargement...</div>;
    if (status === 'unauthenticated') {
        router.push('/login');
        return null;
    }
    if (!session?.user || session.user.id !== id) {
        router.push('/unauthorized');
        return null;
    }

    return (
        <div className="bg-gray-100 py-12 h-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Profil</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <ProfileComponent userId={id} userData={userData} />
                    </div>

                    <div className="lg:col-span-2">
                        <Tabs defaultValue="stats" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 gap-1">
                                <TabsTrigger value="stats">Statistiques</TabsTrigger>
                                <TabsTrigger value="events">Mes événements</TabsTrigger>
                                <TabsTrigger value="reservations">Mes réservations</TabsTrigger>
                            </TabsList>
                            <TabsContent value="stats">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Statistiques des événements</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <EventStats events={userEvents} />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="events">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Mes événements et leurs réservations</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {userEvents.map(event => (
                                            <div key={event.id} className="mb-4 p-4 border rounded-lg">
                                                <h3 className="text-lg font-medium">{event.title}</h3>
                                                <p className="text-sm text-gray-600">Capacité: {event.capacity} | Places restantes: {event.availableTickets}</p>
                                                <div className="mt-2">
                                                    <h4 className="text-sm font-medium">Réservations:</h4>
                                                    <ul className="mt-1 space-y-1">
                                                        {event.reservations.map(reservation => (
                                                            <li key={reservation.id} className="text-sm">
                                                                {reservation.user?.first_name} {reservation.user?.last_name} - {reservation.numberOfTickets} place(s)
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="reservations">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Mes réservations</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {userReservations.map(reservation => (
                                            <Link href={`/reservations/${reservation.id}`} key={reservation.id}>
                                                <div className="flex items-center gap-2 mb-4 p-4 border rounded-lg hover:bg-gray-50 transition duration-150 ease-in-out">

                                                    <Image src={reservation.event?.imageUrl || ''} className='w-8 h-8' alt='event-Image'
                                                        width={32}
                                                        height={32}
                                                    />

                                                    <div>
                                                        <h3 className="text-lg font-medium">{reservation.event.title}</h3>
                                                        <p className="text-sm text-gray-600">
                                                            {reservation.numberOfTickets} ticket(s) | Total: {Number(reservation.totalAmount).toFixed(2)} €
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <CalendarIcon className="h-6 w-6 mr-2 text-blue-600" />
                        Tous mes événements
                    </h2>
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
            </div>
        </div>
    );
}