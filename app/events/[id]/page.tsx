import React from 'react';
import { getEventById, deleteEvent } from '@/actions/event';
import { formatDate } from '@/lib/utils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import ReservationForm from '@/components/ReservationForm';

export default async function EventPage({ params }: { params: { id: string } }) {
    const event = await getEventById(params.id);
    const session = await getServerSession(authOptions);

    if (!event) {
        return <div>Événement non trouvé</div>;
    }

    const isOwner = session?.user?.id === event.userId;

    const handleDelete = async () => {
        'use server'
        await deleteEvent(params.id, event.userId);
        redirect('/events');
    }
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
            <p className="text-gray-600 mb-4">{event.description}</p>
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <p className="mb-2">
                    <span className="font-medium">Date:</span> {formatDate(event.event_date)}
                </p>
                <p className="mb-2">
                    <span className="font-medium">Heure:</span>{' '}
                    {formatDate(event.start_time, 'HH:mm')} - {formatDate(event.end_time, 'HH:mm')}
                </p>
                <p className="mb-2">
                    <span className="font-medium">Lieu:</span> {event.location}
                </p>
                <p className="mb-2">
                    <span className="font-medium">Capacité:</span> {event.capacity} personnes
                </p>
                <p>
                    <span className="font-medium">Prix:</span>{' '}
                    {event.is_paid ? `${event.price} €` : 'Gratuit'}
                </p>
            </div>
            <div>
                <h2 className="text-xl font-semibold mb-2">Tags</h2>
                <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag: any) => (
                        console.log(tag),
                        <p key={tag.tagId} className="bg-gray-200 rounded-full px-6 py-2 text-sm">
                            {tag.tag.name}
                        </p>
                    ))}
                </div>
            </div>
            {isOwner && (
                <div className="mt-4 space-x-4">
                    <Link href={`/events/${params.id}/edit`}>
                        <Button>Modifier</Button>
                    </Link>
                    <form action={handleDelete}>
                        <Button type="submit" variant="destructive">Supprimer</Button>
                    </form>
                </div>
            )}
            {event.capacity > 0 ? (
                session && session.user.id !== event.userId && (
                    <ReservationForm
                        eventId={event.id}
                        price={event.price}
                        availableTickets={event.capacity}
                        isPaid={event.is_paid}
                    />
                )
            ) : (
                <p className="text-red-500">Plus de places disponibles</p>
            )}
        </div>
    );
}