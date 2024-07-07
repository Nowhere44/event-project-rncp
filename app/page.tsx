//app/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import EventList from "./events/_components/event-list"
import { IEvent } from '@/types'
import SearchFilter from './events/_components/search-filter'
import dynamic from 'next/dynamic'

const EventMap = dynamic(() => import('./events/_components/event-map'), { ssr: false })

export default function Home() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchEvents = useCallback(async (filters = {}) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({ ...filters, limit: '3' }).toString();
      const response = await fetch(`/api/events?${queryParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEvents(data.events.slice(0, 6));
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
    fetchEvents({ limit: 6 });
  }, [fetchEvents]);

  if (!isClient) {
    return null; // ou un placeholder
  }

  return (
    <div className="flex flex-col">
      <section className="bg-primary-50 bg-dotted-pattern bg-contain py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">Organisez, Connectez, Célébrez: Vos Événements, Notre Plateforme!</h1>
              <p className="text-lg md:text-xl">{`Notre application vous permet de créer, gérer et participer à divers événements. Que ce soit pour des soirées, des séminaires, des jeux, ou des ateliers, nous facilitons l'organisation et la participation à vos événements préférés.`}</p>
              <h2 className="text-3xl font-bold mt-16 mb-4">{`Faites Confiance à des Milliers d'Événements`}</h2>
              <p className="text-lg mb-8">{`Notre plateforme est utilisée par des milliers d'organisateurs d'événements pour planifier et exécuter leurs événements avec succès. Rejoignez-nous pour une expérience unique et enrichissante.`}</p>
              <Button size="lg" asChild>
                <Link href="/events">
                  Explorez Maintenant
                </Link>
              </Button>
            </div>
            <Image
              src="https://wallpaperaccess.com/full/3329.jpg"
              alt="héros"
              width={500}
              height={500}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      <section id="events" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Découvrez les événements près de chez vous</h2>
          <EventMap events={events} />

          <h2 className="text-3xl font-bold mt-16 mb-4">{`Faites Confiance à des Milliers d'Événement`}s</h2>
          <p className="text-lg mb-8">{`Notre plateforme est utilisée par des milliers d'organisateurs d'événements pour planifier et exécuter leurs événements avec succès. Rejoignez-nous pour une expérience unique et enrichissante.`}</p>

          <div className='mb-6'>
            <SearchFilter onFilterChange={fetchEvents} />
          </div>


          {isLoading ? (
            <p className="text-center py-8">Chargement des événements...</p>
          ) : (
            <EventList
              data={events}
              emptyTitle="Aucun événement trouvé"
              emptyStateSubtext="Revenez plus tard pour voir de nouveaux événements"
              collectionType="All_Events"
              limit={6}
              page={1}
              totalPages={1}
              urlParamName="page"
            />
          )}

          {events.length > 0 && (
            <div className="text-center mt-8">
              <Button size="lg" asChild>
                <Link href="/events">
                  Voir tous les événements
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}