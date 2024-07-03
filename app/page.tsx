'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import EventList from "./events/_components/event-list"
import { IEvent } from '@/types'
import SearchFilter from './events/_components/search-filter'
import EventMap from './events/_components/event-map'

export default function Home() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = useCallback(async (filters = {}) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({ ...filters, limit: '6' }).toString();
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

  return (
    <>
      <section className="bg-primary-50 bg-dotted-pattern bg-contain py-5 md:py-10">
        <div className="wrapper grid grid-cols-1 gap-5 md:grid-cols-2 2xl:gap-12 items-center">
          <div className="flex flex-col justify-center gap-8">
            <h1 className="h1-bold">Organisez, Connectez, Célébrez: Vos Événements, Notre Plateforme!</h1>
            <p className="p-regular-20 md:p-regular-24">Réservez et découvrez des conseils utiles de plus de 3 168 mentors dans des entreprises de classe mondiale avec notre communauté globale.</p>
            <p className="p-regular-20 md:p-regular-24">{`Notre application vous permet de créer, gérer et participer à divers événements. Que ce soit pour des soirées, des séminaires, des jeux, ou des ateliers, nous facilitons l'organisation et la participation à vos événements préférés.`}</p>
            <Button size="lg" asChild className="button w-full sm:w-fit">
              <Link href="#events">
                Explorez Maintenant
              </Link>
            </Button>
          </div>

          <Image
            src="/assets/images/10821625.jpg"
            alt="héros"
            width={1000}
            height={1000}
            className="max-h-[70vh] object-contain object-center 2xl:max-h-[50vh]"
          />
        </div>
      </section>

      <section id="events" className="wrapper my-8 flex flex-col gap-8 md:gap-12">
        <h2 className="h2-bold">Découvrez les événements près de chez vous</h2>
        <EventMap events={events} />

        <h2 className="h2-bold">Faites Confiance à des {`Milliers d'Événements`}</h2>
        <p className="p-regular-20 md:p-regular-24">{`Notre plateforme est utilisée par des milliers d'organisateurs d'événements pour planifier et exécuter leurs événements avec succès. Rejoignez-nous pour une expérience unique et enrichissante.`}</p>

        <SearchFilter onFilterChange={fetchEvents} />

        {isLoading ? (
          <p>Chargement des événements...</p>
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
          <Button size="lg" asChild className="button w-full sm:w-fit mx-auto">
            <Link href="/events">
              Voir tous les événements
            </Link>
          </Button>
        )}
      </section>
    </>
  )
}