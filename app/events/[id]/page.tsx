import React, { Suspense } from 'react';
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
import { CalendarDaysIcon, ClockIcon, MapPinIcon, UsersIcon, TagIcon, CreditCardIcon, GlobeAltIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import EventImageGallery from './_components/EventImageGallery';
import VideoCall from './_components/VideoCall'
import { getUserReservations } from '@/actions/reservations/read';
import { decrypt } from '@/lib/encryption';
import { format, isBefore, isAfter, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import dynamic from 'next/dynamic';
import ServerSpinner from '@/components/ui/server-spinner';

const ClientSpinner = dynamic(() => import('@/components/ui/client-spinner'), {
    ssr: false,
    loading: () => <ServerSpinner />
});

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
    const isAuthenticated = !!session;
    const eventDate = parseISO(event.event_date);
    const userReservations = await getUserReservations(session?.user.id || '');
    const userHasEventReservation = userReservations.some((reservation: any) => reservation.eventId === event.id);

    let meetingLink = null;
    if (event.isOnline && event.meetingType === 'INTEGRATED' && (isOwner || userHasEventReservation)) {
        const now = new Date();
        if (now >= eventDate) {
            meetingLink = decrypt(event.meetingLink);
        }
    }

    const now = new Date();
    const eventStartTime = parseISO(event.start_time);
    const eventEndTime = parseISO(event.end_time);
    const isEventStarted = isAfter(now, eventStartTime);
    const isEventEnded = isAfter(now, eventEndTime);
    const isUpcoming = isBefore(now, eventStartTime);
    const isOngoing = isAfter(now, eventStartTime) && isBefore(now, eventEndTime);

    const handleDelete = async () => {
        'use server'
        await deleteEvent(params.id, event.userId);
        redirect('/events');
    }

    const formatLocalTime = (dateString: string) => {
        const date = parseISO(dateString);
        return format(date, 'HH:mm', { locale: fr });
    };
    return (
        <Suspense fallback={<ServerSpinner />}>
            <main>
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:max-w-none">
                        <div className="lg:grid lg:grid-cols-3 lg:gap-x-8">
                            {/* Event details */}
                            <div className="lg:col-span-2">
                                <div className="bg-white shadow overflow-hidden">
                                    <div className="bg-white shadow overflow-hidden h-96">
                                        <EventImageGallery images={event.imageUrls} />
                                    </div>
                                    <div className="px-4 py-5 sm:p-6">
                                        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{event.title}</h1>
                                        <div className="mt-4 flex items-center space-x-2">
                                            <ReadOnlyRatingStars rating={event.averageRating || 0} />
                                            <span className="text-sm text-gray-500">
                                                ({event.averageRating?.toFixed(1) || 'N/A'}) - {event.commentsCount} avis
                                            </span>
                                        </div>
                                        <p className="mt-4 text-lg text-gray-500">{event.description}</p>
                                    </div>
                                    <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                                        <dl className="sm:divide-y sm:divide-gray-200">
                                            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                                    <UsersIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                                                    Organisateur
                                                </dt>
                                                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                                    <Link href={`/events/creator/${event.userId}`} className='hover:underline text-blue-500'>
                                                        {event.user.first_name} {event.user.last_name}
                                                    </Link>
                                                </dd>
                                            </div>
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
                                                    {formatLocalTime(event.start_time)} - {formatLocalTime(event.end_time)}
                                                </dd>
                                            </div>
                                            {event.isOnline && (
                                                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                                                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                                                        <GlobeAltIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                                                        {`Type d'événement`}
                                                    </dt>
                                                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                                        Événement en ligne
                                                        {isOwner && (
                                                            <span className="ml-2 text-blue-500">
                                                                {`Vous êtes l'organisateur`}
                                                            </span>
                                                        )}
                                                        {!isOwner && userHasEventReservation && isUpcoming && (
                                                            <span className="ml-2 text-green-500">
                                                                Les détails de connexion seront disponibles le  {format(eventStartTime, "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                                                            </span>
                                                        )}
                                                    </dd>
                                                </div>
                                            )}

                                            {event.isOnline && (
                                                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                                                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                                                        <VideoCameraIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                                                        Accès à la réunion
                                                    </dt>
                                                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                                        {(isOwner && (isUpcoming || isOngoing || isEventStarted)) || userHasEventReservation && (isOngoing || isEventStarted) && !isEventEnded ? (
                                                            event.meetingType === 'EXTERNAL' ? (
                                                                <Link href={event.meetingLink}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-500 hover:underline"
                                                                >
                                                                    Rejoindre la réunion externe
                                                                </Link>
                                                            ) : (
                                                                <div className="mt-2">
                                                                    <VideoCall
                                                                        roomName={`event-${event?.title}-${event.id}`}
                                                                        displayName={session?.user?.name || 'Participant'}
                                                                        email={session?.user?.email || 'anonymous@example.com'}
                                                                    />
                                                                </div>
                                                            )
                                                        ) : userHasEventReservation && isUpcoming ? (
                                                            <p className="text-gray-600">
                                                                {`L'accès à la réunion sera disponible le ${format(eventStartTime, "d MMMM yyyy 'à' HH:mm", { locale: fr })}`}
                                                            </p>
                                                        ) : isEventEnded ? (
                                                            <p className="text-gray-600">
                                                                {`Cet événement est terminé. Merci d'avoir participé.`}
                                                            </p>
                                                        ) : !isOwner && (
                                                            <p className="text-gray-600">
                                                                Réservez votre place pour accéder à la réunion.
                                                            </p>
                                                        )}
                                                    </dd>
                                                </div>
                                            )}
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
                                                    {event.availableTickets} / {event.capacity} places disponibles
                                                </dd>
                                            </div>
                                            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                                    <TagIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                                                    Tags
                                                </dt>
                                                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                                                    <div className="flex flex-wrap gap-2">
                                                        {event.simplifiedTags.map((tag: string) => (
                                                            <span key={tag} className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                                                                {tag}
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

                                {isOwner && isUpcoming && (
                                    <div className="mt-6 flex space-x-3">
                                        <Link href={`/events/${params.id}/edit`}>
                                            <Button className="inline-flex items-center rounded-md bg-orange-500 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-orange-600">
                                                Modifier
                                            </Button>
                                        </Link>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button type="submit" className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
                                                    Supprimer
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet événement ?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Cette action est irréversible. Toutes les données liées à cet événement seront définitivement supprimées.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                                                        Supprimer
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
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
                                            {isAuthenticated ? (
                                                !isOwner ? (
                                                    (event.isOnline && !userHasEventReservation) || (!event.isOnline) ? (
                                                        !isEventEnded && (
                                                            <ReservationForm
                                                                eventId={event.id}
                                                                price={event.price}
                                                                availableTickets={event.availableTickets}
                                                                isPaid={event.is_paid}
                                                                eventDate={event.event_date}
                                                                isOnline={event.isOnline}
                                                                startTime={event.start_time}
                                                                endTime={event.end_time}
                                                            />
                                                        )
                                                    ) : (
                                                        event.isOnline && !isOngoing && !isEventEnded && (
                                                            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
                                                                <p className="font-bold">Réservation confirmée</p>
                                                                <p>{event.isOnline && !isOngoing ? "Le lien de connexion sera disponible le jour de l'événement." : "Votre réservation a été enregistrée avec succès."}</p>
                                                            </div>)
                                                    )
                                                ) : (
                                                    <p className="text-sm font-medium text-gray-500">{`Vous êtes l'organisateur de cet événement.`}</p>
                                                )
                                            ) : (
                                                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4" role="alert">
                                                    <p className="font-bold">Information</p>
                                                    <p>Pour réserver cet événement, veuillez vous <Link href="/login" className="underline">connecter</Link> ou <Link href="/register" className="underline">créer un compte</Link>.</p>
                                                </div>
                                            )}
                                            {event.availableTickets === 0 && (
                                                <p className="text-sm font-medium text-red-800">
                                                    Plus de places disponibles
                                                </p>
                                            )}
                                            {!isUpcoming && isOngoing && (
                                                <p className="text-sm font-medium text-yellow-800 mt-2">
                                                    Cet événement est en cours
                                                </p>
                                            )}
                                            {isEventEnded && (
                                                <p className="text-sm font-medium text-red-800">
                                                    Cet événement est déjà passé
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {isOwner && !isEventEnded && event.is_paid && !isOngoing && (
                                    <div className="bg-white shadow sm:rounded-lg mb-8">
                                        <div className="px-4 py-5 sm:p-6">
                                            {isOwner && event.is_paid && (
                                                <div className="bg-white sm:rounded-lg mb-8">
                                                    <div className="">
                                                        <PromoCodeGenerator eventId={event.id} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </Suspense>
    );
}
