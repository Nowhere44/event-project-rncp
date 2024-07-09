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
import { motion } from 'framer-motion'
import { Calendar, MapPin, Users, Star, Clock, Zap } from 'lucide-react'

const EventMap = dynamic(() => import('./events/_components/event-map'), { ssr: false })

export default function Home() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [numberTotalEvents, setNumberTotalEvents] = useState(0);

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
      setNumberTotalEvents(data.events.length);
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
    return null;
  }

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-gray-100 to-blue-50 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
          >
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-gray-800">
                Découvrez, Créez, Vivez avec <span className="text-blue-600">Evy</span>
              </h1>
              <p className="text-xl md:text-2xl font-light text-gray-600">
                {`Evy simplifie la découverte et l'organisation d'événements locaux.`}
                Trouvez votre prochaine expérience inoubliable en quelques clics.
              </p>
              <div className="flex space-x-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
                  <Link href="/events">Explorer les événements</Link>
                </Button>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <Image
                src="https://wallpaperaccess.com/full/3329.jpg"
                alt="Evy en action"
                width={600}
                height={400}
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg">
                <p className="text-blue-600 font-semibold">{`+${numberTotalEvents} événements ce mois-ci`}</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">Pourquoi choisir Evy ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Calendar, title: "Événements Variés", description: "Une diversité d'événements pour tous les goûts et intérêts." },
              { icon: MapPin, title: "Localisation Précise", description: "Trouvez facilement des événements proches de vous." },
              { icon: Users, title: "Communauté Active", description: "Rencontrez des personnes partageant vos passions." },
              { icon: Star, title: "Expériences Uniques", description: "Participez à des événements exclusifs et mémorables." },
              { icon: Clock, title: "Gestion Simplifiée", description: "Organisez et gérez vos événements sans effort." },
              { icon: Zap, title: "Réservation Instantanée", description: "Réservez votre place en quelques secondes." },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="events" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Événements à ne pas manquer</h2>
          <EventMap events={events} />

          <div className='my-12'>
            <SearchFilter onFilterChange={fetchEvents} />
          </div>

          {isLoading ? (
            <p className="text-center py-8 text-gray-600">Chargement des événements...</p>
          ) : (
            <EventList
              data={events}
              emptyTitle="Aucun événement trouvé"
              emptyStateSubtext="Revenez bientôt pour découvrir de nouveaux événements passionnants"
              collectionType="All_Events"
              limit={6}
              page={1}
              totalPages={1}
              urlParamName="page"
            />
          )}

          {events.length > 0 && (
            <div className="text-center mt-12">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
                <Link href="/events">Voir tous les événements</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}