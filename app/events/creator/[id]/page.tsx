"use client"
import { useParams } from 'next/navigation';
import EventList from '../../_components/event-list';
import { useEffect, useState } from 'react';
import { CheckBadgeIcon } from '@heroicons/react/24/outline';
import { IEvent, IUser } from '../../../../types'
import { Skeleton } from "@/components/ui/skeleton";

const CreatorEvents = () => {
    const params = useParams();
    const id = params.id as string;
    const [userEvents, setUserEvents] = useState<IEvent[]>([]);
    const [userData, setUserData] = useState<IUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true);
            try {
                const userResponse = await fetch(`/api/event-creator/${id}`);
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setUserData(userData);
                }
                const eventsResponse = await fetch(`/api/event-creator?userId=${id}`);
                if (eventsResponse.ok) {
                    const events = await eventsResponse.json();
                    setUserEvents(events);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserData();
    }, [id]);

    if (isLoading) {
        return (
            <div className="p-14">
                <Skeleton className="h-12 w-3/4 mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-[300px] w-full rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-14">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <CheckBadgeIcon className="h-12 w-12 mr-2 text-red-500" />
                {` Tous les événements de ${userData?.first_name} ${userData?.last_name}`}
            </h2>
            <div className='p-12'>
                <EventList
                    data={userEvents}
                    emptyTitle="Aucun événement trouvé"
                    emptyStateSubtext="Ce créateur n'a pas encore d'événements"
                    collectionType="Events_Organized"
                    limit={10}
                    page={1}
                    totalPages={1}
                />
            </div>
        </div>
    );
}

export default CreatorEvents;