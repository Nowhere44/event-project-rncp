'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IEvent } from '@/types';
import { useRouter } from 'next/navigation';

type EventMapProps = {
    events: IEvent[];
};

const EventMap = ({ events }: EventMapProps) => {
    const mapRef = useRef<L.Map | null>(null);
    const router = useRouter();
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

    console.log('events:', events);

    useEffect(() => {
        if (typeof window !== 'undefined' && !mapRef.current) {
            mapRef.current = L.map('map').setView([46.603354, 1.888334], 6);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(mapRef.current);

            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setUserLocation([latitude, longitude]);

                        if (mapRef.current) {
                            mapRef.current.setView([latitude, longitude], 14);

                            L.marker([latitude, longitude], {
                                icon: L.divIcon({
                                    className: 'user-location-marker',
                                    html: '📍',
                                    iconSize: [25, 25],
                                    iconAnchor: [12, 24],
                                })
                            }).addTo(mapRef.current).bindPopup("Vous êtes ici");
                        }
                    },
                    (error) => {
                        console.error("Erreur de géolocalisation:", error);
                    }
                );
            }
        }

        if (mapRef.current) {
            events.forEach(event => {
                console.log('Event:', event);
                if (event.latitude && event.longitude) {
                    const marker = L.marker([event.latitude, event.longitude])
                        .addTo(mapRef.current!)
                        .bindPopup(`<div>
            <h3>${event.title}</h3>
            <img src="${event?.imageUrl}" alt="${event.title}" style="width:100%;max-width:200px;"/>
            <p>${event.description.substring(0, 100)}...</p>
            <button onclick="window.location.href='/events/${event.id}'">Voir l'événement</button>
        </div>
    `);

                    marker.on('click', () => {
                        router.push(`/events/${event.id}`);
                    });
                }
            });
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [events, router]);

    return (
        <>
            <div id="map" style={{ height: '400px', width: '100%' }} />
            <style jsx global>{`
                .user-location-marker {
                    font-size: 25px;
                    text-align: center;
                }
            `}</style>
        </>
    );
};

export default EventMap;