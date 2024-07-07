import React from 'react';
import { getEventById } from '@/actions/events/read';
import { deleteEvent } from '@/actions/events/delete';
import { formatDate } from '@/lib/utils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';
import ReservationForm from '@/components/ReservationForm';
import ReadOnlyRatingStars from '@/components/shared/ReadOnlyRatingStars';
import { CommentSection } from './_components/comment-section';
import PromoCodeGenerator from './_components/promo-code-generator';
import { verifyPayment } from '@/actions/payment';
import { CalendarDaysIcon, ClockIcon, MapPinIcon, UsersIcon, TagIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default async function EventPage({ params, searchParams }: { params: { id: string }, searchParams: { session_id?: string } }) {
    const session = await getServerSession(authOptions);
    const sessionId = searchParams.session_id;

    if (sessionId) {
        await verifyPayment(sessionId);
    }

    const event = await getEventById(params.id);

    if (!event) {
        return <div className="container mx-auto py-8 text-center">Événement non trouvé</div>;
    }

    const isOwner = session?.user?.id === event.userId;

    const handleDelete = async () => {
        'use server'
        await deleteEvent(params.id, event.userId);
        redirect('/events');
    }

    return (
        <main className="bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:max-w-none">
                    <div className="lg:grid lg:grid-cols-3 lg:gap-x-8">
                        {/* Event details */}
                        <div className="lg:col-span-2">
                            <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                                {event.imageUrl && (
                                    <div className="w-full h-64 sm:h-80 md:h-96 overflow-hidden">
                                        <Image
                                            src={event.imageUrl}
                                            alt={event.title}
                                            className="w-full h-full object-cover"
                                            width={800}
                                            height={400}
                                        />
                                    </div>
                                )}
                                <div className="px-4 py-5 sm:p-6">
                                    <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{event.title}</h1>
                                    <div className="mt-4 flex items-center space-x-2">
                                        <ReadOnlyRatingStars rating={event.averageRating || 0} />
                                        <span className="text-sm text-gray-500">({event.averageRating?.toFixed(1) || 'N/A'})</span>
                                    </div>
                                    <p className="mt-4 text-lg text-gray-500">{event.description}</p>
                                </div>
                                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                                    <dl className="sm:divide-y sm:divide-gray-200">
                                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500 flex items-center">
                                                <CalendarDaysIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                                                Date
                                            </dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                                {formatDate(event.event_date)}
                                            </dd>
                                        </div>
                                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500 flex items-center">
                                                <ClockIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                                                Horaires
                                            </dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                                {formatDate(event.start_time, 'HH:mm')} - {formatDate(event.end_time, 'HH:mm')}
                                            </dd>
                                        </div>
                                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500 flex items-center">
                                                <MapPinIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                                                Lieu
                                            </dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{event.location}</dd>
                                        </div>
                                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500 flex items-center">
                                                <UsersIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                                                Capacité
                                            </dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                                {event.availableTickets} / {event.capacity} places
                                            </dd>
                                        </div>
                                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500 flex items-center">
                                                <TagIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                                                Tags
                                            </dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                                <div className="flex flex-wrap gap-2">
                                                    {event.tags.map((tag: any) => (
                                                        <span key={tag.tagId} className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                                                            {tag.tag.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </dd>
                                        </div>
                                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                                            <dt className="text-sm font-medium text-gray-500 flex items-center">
                                                <CreditCardIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                                                Prix
                                            </dt>
                                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                                {event.is_paid ? `${event.price} €` : 'Gratuit'}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            {isOwner && new Date(event.event_date) > new Date() && (
                                <div className="mt-6 flex space-x-3">
                                    <Link href={`/events/${params.id}/edit`}>
                                        <Button className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                            Modifier
                                        </Button>
                                    </Link>
                                    <form action={handleDelete}>
                                        <Button type="submit" className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
                                            Supprimer
                                        </Button>
                                    </form>
                                </div>
                            )}

                            <CommentSection eventId={params.id} />
                        </div>

                        {/* Sidebar */}
                        <div className="mt-8 lg:mt-0">
                            <div className="bg-white shadow sm:rounded-lg mb-8">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-base font-semibold leading-6 text-gray-900">Réservation</h3>
                                    <div className="mt-2 max-w-xl text-sm text-gray-500">
                                        <p>Prix : {event.is_paid ? `${event.price} €` : 'Gratuit'}</p>
                                    </div>
                                    <div className="mt-5">
                                        {event.availableTickets > 0 && new Date(event.event_date) > new Date() ? (
                                            session && session.user.id !== event.userId && (
                                                <ReservationForm
                                                    eventId={event.id}
                                                    price={event.price}
                                                    availableTickets={event.availableTickets}
                                                    isPaid={event.is_paid}
                                                    eventDate={event.event_date.toISOString()}
                                                />
                                            )
                                        ) : (
                                            <p className="text-sm font-medium text-red-800">
                                                {event.availableTickets === 0 ? "Plus de places disponibles" : "Cet événement est déjà passé"}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {isOwner && event.is_paid && new Date(event.event_date) > new Date() && (
                                <div className="bg-white shadow sm:rounded-lg mb-8">
                                    <div className="px-4 py-5 sm:p-6">
                                        <PromoCodeGenerator eventId={event.id} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}