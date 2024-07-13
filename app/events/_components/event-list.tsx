import React from 'react'
import EventCard from './event-card'
import Pagination from '@/components/shared/Pagination'
import { IEvent } from '@/types'
import { Skeleton } from "@/components/ui/skeleton"

type EventListProps = {
    data: IEvent[],
    emptyTitle: string,
    emptyStateSubtext: string,
    limit: number,
    page: number,
    totalPages: number,
    urlParamName?: string,
    collectionType?: 'Events_Organized' | 'My_Tickets' | 'All_Events',
    isLoading?: boolean
}

const EventList = ({
    data,
    emptyTitle,
    emptyStateSubtext,
    page,
    totalPages,
    collectionType,
    urlParamName,
    isLoading
}: EventListProps) => {
    if (isLoading) {
        return (
            <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-[300px] w-full rounded-lg" />
                ))}
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <div className="flex-center wrapper min-h-[200px] w-full flex-col gap-3 rounded-[14px] bg-grey-50 py-28 text-center">
                <h3 className="p-bold-20 md:h5-bold">{emptyTitle}</h3>
                <p className="p-regular-14">{emptyStateSubtext}</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center gap-10">
            <ul className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-10">
                {data.map((event) => {
                    const hasOrderLink = collectionType === 'Events_Organized';
                    const hidePrice = collectionType === 'My_Tickets';

                    return (
                        <li key={event.id}>
                            <EventCard event={event} hasOrderLink={hasOrderLink} hidePrice={hidePrice} />
                        </li>
                    )
                })}
            </ul>

            {totalPages > 1 && (
                <Pagination urlParamName={urlParamName} page={page} totalPages={totalPages} />
            )}
        </div>
    )
}

export default EventList