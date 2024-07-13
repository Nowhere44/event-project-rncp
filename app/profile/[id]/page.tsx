'use client'

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import ProfileComponent from '../_components/profile-component';
import EventList from '@/app/events/_components/event-list';
import { useEffect, useState } from 'react';
import { IEvent, IReservation, IUser } from '@/types';
import EventStats from '../_components/event-stats';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from 'next/image';
import { format, differenceInYears } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import * as XLSX from 'xlsx';
import { CalendarIcon, TicketIcon, CurrencyEuroIcon, EnvelopeIcon, ClockIcon, TagIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Spinner from "@/components/ui/spinner";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [userEvents, setUserEvents] = useState<IEvent[]>([]);
    const [userReservations, setUserReservations] = useState<IReservation[]>([]);
    const [userData, setUserData] = useState<IUser | null>(null);
    const [isLoadingEvents, setIsLoadingEvents] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (session?.user?.id === id) {
                setIsLoadingEvents(true);
                try {
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
                } catch (error) {
                    console.error("Erreur lors du chargement des données:", error);
                } finally {
                    setIsLoadingEvents(false);
                }
            }
        };

        fetchUserData();
    }, [id, session]);

    const formatDate = (date: any) => {
        return format(new Date(date), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr });
    };

    const calculateAge = (birthDate: any) => {
        if (!birthDate) return "N/A";
        return differenceInYears(new Date(), new Date(birthDate));
    };

    const exportToExcel = () => {
        const workbook = XLSX.utils.book_new();
        userEvents.forEach(event => {
            const worksheet = XLSX.utils.json_to_sheet(event.reservations.map(reservation => ({
                'Événement': event.title,
                'Nom': `${reservation.user?.first_name} ${reservation.user?.last_name}`,
                'Tickets': reservation.numberOfTickets,
                'Total': Number(reservation.totalAmount) === 0 ? "Gratuit" : `${Number(reservation.totalAmount).toFixed(2)} €`,
                'Âge': calculateAge(reservation.user?.date_of_birth),
                'Email': reservation.user?.email,
                'Date de réservation': formatDate(reservation?.createdAt),
                'Code promo': reservation.appliedPromoCode || 'N/A'
            })));
            XLSX.utils.book_append_sheet(workbook, worksheet, event.title.slice(0, 31));
        });
        XLSX.writeFile(workbook, "reservations.xlsx");
    };

    if (status === 'loading') return (
        <div className="flex justify-center items-center h-screen">
            <Spinner />
        </div>
    );
    if (status === 'unauthenticated') {
        router.push('/login');
        return null;
    }
    if (!session?.user || session.user.id !== id) {
        router.push('/unauthorized');
        return null;
    }

    return (
        <div className="py-12 h-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Profil</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <ProfileComponent userId={id} userData={userData} />
                    </div>

                    <div className="lg:col-span-2">
                        <Tabs defaultValue="stats" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 gap-1">
                                <TabsTrigger value="stats" className="bg-orange-500 text-white hover:bg-orange-600">Statistiques</TabsTrigger>
                                <TabsTrigger value="events" className="bg-orange-500 text-white hover:bg-orange-600">Mes événements</TabsTrigger>
                                <TabsTrigger value="reservations" className="bg-orange-500 text-white hover:bg-orange-600">Mes réservations</TabsTrigger>
                            </TabsList>
                            <TabsContent value="stats">
                                <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
                                    <CardHeader>
                                        <CardTitle className="text-2xl font-bold text-gray-800">Statistiques des événements</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <EventStats events={userEvents} />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="events" className="h-[600px] overflow-y-auto">
                                <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
                                    <CardHeader className="flex justify-between items-center sticky top-0 bg-white z-10 border-b">
                                        <CardTitle className="text-2xl font-bold text-gray-800">Mes événements et leurs réservations</CardTitle>
                                        <Button onClick={exportToExcel} variant="outline" size="sm" className="bg-orange-500 text-white hover:bg-orange-600">
                                            <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
                                            Exporter en Excel
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        {userEvents.map(event => (
                                            <div key={event.id} className="mb-6 p-4 border shadow-sm bg-white rounded-lg">
                                                <h3 className="text-xl font-semibold mb-2 text-orange-500">{event.title}</h3>
                                                <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
                                                    <span>Capacité: {event.capacity}</span>
                                                    <span>Places restantes: {event.availableTickets}</span>
                                                </div>
                                                <div>
                                                    <h4 className="text-md font-medium mb-3 text-orange-400">Réservations:</h4>
                                                    <ul className="space-y-3">
                                                        {event.reservations.map(reservation => (
                                                            <li key={reservation.id} className="bg-orange-50 p-4 rounded-lg shadow-sm">
                                                                <div className="flex items-center gap-3 mb-3">
                                                                    <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                                                        <Image
                                                                            src={reservation.user?.profile_picture || "/default-avatar.png"}
                                                                            alt={`${reservation.user?.first_name} ${reservation.user?.last_name}`}
                                                                            layout="fill"
                                                                            objectFit="cover"
                                                                            className="rounded-full"
                                                                        />
                                                                    </div>
                                                                    <span className="font-medium text-orange-600 text-lg">
                                                                        {reservation.user?.first_name} {reservation.user?.last_name}
                                                                    </span>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                                                                    <div className="flex items-center gap-2">
                                                                        <TicketIcon className="h-4 w-4 text-orange-400" />
                                                                        <span>Tickets: {reservation.numberOfTickets}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <CurrencyEuroIcon className="h-4 w-4 text-orange-400" />
                                                                        <span>Total: {Number(reservation.totalAmount) === 0 ? "Gratuit" : `${Number(reservation.totalAmount).toFixed(2)} €`}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <CalendarIcon className="h-4 w-4 text-orange-400" />
                                                                        <span>Âge: {calculateAge(reservation.user?.date_of_birth)}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <EnvelopeIcon className="h-4 w-4 text-orange-400" />
                                                                        <span>Email: {reservation.user?.email}</span>
                                                                    </div>
                                                                    <div className="col-span-2 flex items-center gap-2">
                                                                        <ClockIcon className="h-4 w-4 text-orange-400" />
                                                                        <span>Réservé le: {formatDate(reservation?.createdAt)}</span>
                                                                    </div>
                                                                    {reservation.appliedPromoCode && (
                                                                        <div className="col-span-2 flex items-center gap-2">
                                                                            <TagIcon className="h-4 w-4 text-orange-400" />
                                                                            <span>Code promo: {reservation.appliedPromoCode}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="reservations" className='h-[600px] overflow-y-auto'>
                                <Card className="bg-white shadow-lg rounded-lg overflow-hidden">
                                    <CardHeader>
                                        <CardTitle className="text-2xl font-bold text-gray-800">Mes réservations</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {userReservations.map(reservation => (
                                            <Link href={`/reservations/${reservation.id}`} key={reservation.id}>
                                                <div className="flex items-center gap-2 mb-4 p-4 border rounded-lg hover:bg-gray-50 transition duration-150 ease-in-out">
                                                    <Image src={reservation.event?.images[0]?.url || ''} className='w-8 h-8 rounded-full' alt='event-Image'
                                                        width={32}
                                                        height={32}
                                                    />
                                                    <div>
                                                        <h3 className="text-lg font-medium text-gray-800">{reservation.event.title}</h3>
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
                        <CalendarIcon className="h-6 w-6 mr-2 text-orange-500" />
                        Tous mes événements
                    </h2>
                    {isLoadingEvents ? (
                        <div className="flex justify-center items-center h-[350px]">
                            <Spinner />
                        </div>
                    ) : (
                        <EventList
                            data={userEvents}
                            emptyTitle="Vous n'avez pas encore créé d'événements"
                            emptyStateSubtext="Commencez à créer vos propres événements!"
                            collectionType="Events_Organized"
                            limit={10}
                            page={1}
                            totalPages={1}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}