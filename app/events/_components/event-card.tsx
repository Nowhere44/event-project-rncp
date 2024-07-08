import Link from 'next/link'
import React from 'react'
import { IEvent } from '@/types'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, MapPinIcon, UsersIcon, StarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Image from 'next/image'

type CardProps = {
    event: IEvent,
    hasOrderLink?: boolean,
    hidePrice?: boolean
}

const EventCard = ({ event, hasOrderLink, hidePrice }: CardProps) => {
    const { data: session } = useSession();

    const isOwner = session?.user?.id === event.userId;
    const availableTickets = event.availableTickets ?? 'N/A';

    const formattedDate = format(new Date(event.event_date), "d MMMM yyyy 'à' HH:mm", { locale: fr })

    return (
        <Link href={`/events/${event.id}`} className="block h-full">
            <Card className="h-full flex flex-col">
                <CardHeader className="p-0">
                    <AspectRatio ratio={16 / 9}>
                        <Image
                            src={event.imageUrl || '/placeholder.jpg'}
                            alt={event.title}
                            className="object-cover w-full h-full rounded-t-lg"
                            width={500}
                            height={500}
                        />
                    </AspectRatio>
                </CardHeader>
                <CardContent className="flex-grow p-4">
                    <CardTitle className="mb-2 line-clamp-1">{event.title}</CardTitle>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="line-clamp-1">{event.location}</span>
                        </div>
                        <div className="flex items-center">
                            <UsersIcon className="h-4 w-4 mr-2 text-gray-500" />
                            <span>Capacité: {event.capacity} | Restant: {availableTickets}</span>
                        </div>
                        <div className="flex items-center">
                            <StarIcon className="h-4 w-4 mr-2 text-yellow-400" />
                            <span>Note moyenne: {event.averageRating?.toFixed(1) || 'N/A'}</span>
                        </div>
                        {!hidePrice && (
                            <div className="flex items-center">
                                <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-500" />
                                <span className="text-sm text-gray-700">
                                    {event.is_paid ? `${event.price}€` : 'Gratuit'}
                                </span>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center p-4 bg-gray-50 gap-2">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                            {event.user?.first_name} {event.user?.last_name}
                        </span>
                    </div>
                    <div className="flex items-center">
                        {event.user?.averageRating && (
                            <div className="flex items-center">
                                <StarIcon className="h-4 w-4 text-yellow-400" />
                                <span className="text-sm ml-1">{event.user.averageRating.toFixed(1)}</span>
                            </div>
                        )}
                        {isOwner && <Badge variant="outline" className="ml-2">Organisateur</Badge>}
                        {hasOrderLink && (
                            <Link href={`/reservations/${event.id}`}>
                                <Badge variant="secondary" className="ml-2">Voir la réservation</Badge>
                            </Link>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </Link>
    )
}

export default EventCard