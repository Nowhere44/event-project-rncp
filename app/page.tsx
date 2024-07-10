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
      setEvents(data.events);
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
    <div className="flex flex-col bg-white">
      <section className="bg-gradient-to-r from-orange-50 to-yellow-100 py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
          >
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-gray-900">
                Découvrez, Créez, Vivez avec <span className="text-orange-500">Evy</span>
              </h1>
              <p className="text-xl md:text-2xl font-light text-gray-700">
                Simplifiez votre expérience événementielle. Trouvez, organisez et partagez des moments inoubliables en quelques clics.
              </p>
              <div className="flex space-x-4">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg transition-all duration-300 transform hover:scale-105" asChild>
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
                src="https://cdn.discordapp.com/attachments/1260248323760328820/1260261079640969236/gamer120857_Ultra-high_resolution_vibrant_collage-style_illustr_44dcd83c-256c-4716-9c22-8d20c842b199.png?ex=668ead17&is=668d5b97&hm=0ed0b42c78601c71912c741067c78f3ac667f4f879a032aa136c2992a2a37237&"
                alt="Evy hero"
                width={600}
                height={400}
                className="rounded-2xl shadow-2xl object-cover"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg">
                <p className="text-orange-500 font-semibold">{`+${events.length} événements ce mois-ci`}</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-orange-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-16 text-center text-gray-900">Pourquoi choisir Evy ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
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
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <feature.icon className="w-14 h-14 text-orange-500 mb-6" />
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">{feature.title}</h3>
                <p className="text-gray-700">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="events" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-16 text-center text-gray-900">Événements à ne pas manquer</h2>
          <div className="mb-12">
            <EventMap events={events} />
          </div>

          <div className='mb-12'>
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
            <div className="text-center mt-16">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg transition-all duration-300 transform hover:scale-105" asChild>
                <Link href="/events">Voir tous les événements</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}