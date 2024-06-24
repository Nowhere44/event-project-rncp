// app/events/_components/event-card.tsx

import { formatDateTime } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { IEvent } from '@/types'
import { useSession } from 'next-auth/react'

type CardProps = {
    event: IEvent,
    hasOrderLink?: boolean,
    hidePrice?: boolean
}

const EventCard = ({ event, hasOrderLink, hidePrice }: CardProps) => {
    const { data: session, status } = useSession();

    const isOwner = session?.user?.id === event.userId;

    return (
        <div className="group relative flex min-h-[380px] w-full max-w-[400px] flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-lg md:min-h-[438px]">
            <Link
                href={`/events/${event.id}`}
                style={{ backgroundImage: event.imageUrl ? `url(${event.imageUrl})` : 'none' }}
                className="flex-center flex-grow bg-gray-50 bg-cover bg-center text-grey-500"
            />
            <div className="flex min-h-[230px] flex-col gap-3 p-5 md:gap-4">
                {!hidePrice && (
                    <div className="flex gap-2">
                        <span className="p-semibold-14 w-min rounded-full bg-green-100 px-4 py-1 text-green-60">
                            {event.is_paid ? `${event.price} €` : 'GRATUIT'}
                        </span>
                        <p className="p-semibold-14 w-min rounded-full bg-grey-500/10 px-4 py-1 text-grey-500 line-clamp-1">
                            {event?.tags && event.tags.length > 0
                                ? (event.tags[0].tag?.name || 'Tag sans nom')
                                : 'Non catégorisé'}
                        </p>
                    </div>
                )}
                <p className="p-medium-16 p-medium-18 text-grey-500">
                    {formatDateTime(event.start_time).dateTime}
                </p>
                <p className="">
                    Nombre de place : {event.capacity}
                </p>
                <p className="p-medium-16 p-medium-18 text-grey-500">
                    {isOwner && 'Vous êtes l\'organisateur'}
                </p>
                <Link href={`/events/${event.id}`}>
                    <p className="p-medium-16 md:p-medium-20 line-clamp-2 flex-1 text-black">{event.title}</p>
                </Link>
                <div className="flex-between w-full">
                    <p className="p-medium-14 md:p-medium-16 text-grey-600">
                        {event.user?.first_name} {event.user?.last_name}
                    </p>
                    {hasOrderLink && (
                        <Link href={`/orders?eventId=${event.id}`} className="flex gap-2">
                            <p className="text-primary-500">Détails de la commande</p>
                            <Image src="/assets/icons/arrow.svg" alt="search" width={10} height={10} />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}

export default EventCard