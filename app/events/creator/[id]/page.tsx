"use client"
import { useParams } from 'next/navigation';
import EventList from '../../_components/event-list';
import { useEffect, useState } from 'react';
import { CheckBadgeIcon } from '@heroicons/react/24/outline';
import { IEvent, IUser } from '../../../../types'

const CreatorEvents = () => {
    const params = useParams();
    const id = params.id as string;
    const [userEvents, setUserEvents] = useState<IEvent[]>([]);
    const [userData, setUserData] = useState<IUser | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
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
        };
        fetchUserData();
    }, [id]);

    return (

        <div className="p-14">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <CheckBadgeIcon className="h-12 w-12 mr-2 text-red-500" />
                {` Tous les événements de ${userData?.first_name} ${userData?.last_name}`}
            </h2>
            <div className='p-12'>
                <EventList
                    data={userEvents}
                    emptyTitle="Vous n'avez pas encore créé d'événements"
                    emptyStateSubtext="Commencez à créer vos propres événements!"
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