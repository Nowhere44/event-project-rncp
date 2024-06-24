'use client';

import { useState, useEffect, useCallback } from 'react';
import EventList from "./_components/event-list"
import { IEvent } from '@/types'
import SearchFilter from './_components/search-filter'


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
        <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold my-8">Tous les événements</h1>
            <SearchFilter onFilterChange={fetchEvents} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
                <div>
                    {isLoading ? (
                        <p>Chargement des événements...</p>
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
        </div>
    )
}