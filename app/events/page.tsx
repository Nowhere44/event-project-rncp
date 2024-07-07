'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import EventList from "./_components/event-list"
import { IEvent } from '@/types'
import SearchFilter from './_components/search-filter'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"


export default function Events() {
    const [events, setEvents] = useState<IEvent[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    const fetchEvents = useCallback(async (filters = {}) => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await fetch(`/api/events?${queryParams}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setEvents(data.events);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Error fetching events:', error);
            setEvents([]);
            setTotalPages(1);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    return (
        <div className="container mx-auto h-full px-4 py-8">
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Rechercher des événements</CardTitle>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<div className="space-y-4">{[...Array(3)].map((_, i) => (<Skeleton key={i} className="h-[200px] w-full" />))}</div>}>
                        <SearchFilter onFilterChange={fetchEvents} />
                    </Suspense>
                </CardContent>
            </Card>

            <div>
                <CardHeader>
                    <CardTitle>Tous les événements</CardTitle>
                </CardHeader>
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-[200px] w-full" />
                        ))}
                    </div>
                ) : (
                    <EventList
                        data={events}
                        emptyTitle="Aucun événement trouvé"
                        emptyStateSubtext="Revenez plus tard pour voir de nouveaux événements"
                        collectionType="All_Events"
                        limit={10}
                        page={1}
                        totalPages={totalPages}
                        urlParamName="page"
                    />
                )}
            </div>
        </div>
    )
}