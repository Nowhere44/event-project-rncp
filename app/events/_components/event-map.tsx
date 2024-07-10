'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IEvent } from '@/types';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Locate, X } from 'lucide-react';
import Image from 'next/image';

type EventMapProps = {
    events: IEvent[];
};

const EventMap = ({ events }: EventMapProps) => {
    const mapRef = useRef<L.Map | null>(null);
    const router = useRouter();
    const { data: session } = useSession();
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            if (typeof window !== 'undefined') {
                setIsMobile(window.innerWidth < 768);
            }
        };
        checkMobile();
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', checkMobile);
        }
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', checkMobile);
            }
        };
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && !mapRef.current) {
            mapRef.current = L.map('map', {
                center: [46.603354, 1.888334],
                zoom: 6,
                zoomControl: false
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(mapRef.current);

            L.control.zoom({
                position: 'bottomright'
            }).addTo(mapRef.current);

            events.forEach(event => {
                if (event.latitude && event.longitude) {
                    const marker = L.marker([event.latitude, event.longitude], {
                        icon: L.divIcon({
                            className: 'event-marker',
                            html: '📍',
                            iconSize: [30, 30],
                            iconAnchor: [15, 30],
                        })
                    }).addTo(mapRef.current!);

                    marker.on('click', () => {
                        setSelectedEvent(event);
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
    }, [events, router, session]);

    console.log("events", events)

    const centerOnUserLocation = () => {
        if (typeof window !== 'undefined' && "geolocation" in navigator) {
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
                                iconSize: [30, 30],
                                iconAnchor: [15, 30],
                            })
                        }).addTo(mapRef.current)
                            .bindPopup("Vous êtes ici")
                            .openPopup();
                    }
                },
                (error) => {
                    console.error("Erreur de géolocalisation:", error);
                    alert("Impossible de récupérer votre position. Veuillez vérifier vos paramètres de localisation.");
                }
            );
        } else {
            alert("La géolocalisation n'est pas supportée par ce navigateur.");
        }
    };

    const EventDetails = ({ event, onClose }: { event: IEvent; onClose: () => void }) => (
        <div className="bg-white p-4 rounded-lg shadow-lg max-w-sm w-full">
            <Button
                className="absolute top-2 right-2"
                variant="ghost"
                size="icon"
                onClick={onClose}
            >
                <X className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
            {event.imageUrl && (
                <Image src={event.imageUrl} alt={event.title} className="w-full h-32 object-cover mb-2 rounded"
                    width={400}
                    height={200}
                />
            )}
            <p className="text-sm mb-2"><strong>Date:</strong> {format(new Date(event.event_date), 'dd MMMM yyyy à HH:mm', { locale: fr })}</p>
            <p className="text-sm mb-2"><strong>Lieu:</strong> {event.location}</p>
            <p className="text-sm mb-2"><strong>Prix:</strong> {event.price ? `${event.price}€` : 'Gratuit'}</p>
            <p className="text-sm mb-4">{event.description}</p>
            <Button onClick={() => router.push(`/events/${event.id}`)}>
                {`Voir l'événement`}
            </Button>
        </div>
    );

    return (
        <div className="relative">
            <div id="map" className="h-[400px] w-full rounded-lg shadow-md" />
            <Button
                className="absolute top-4 right-4 z-[1000]"
                onClick={centerOnUserLocation}
                variant="secondary"
            >
                <Locate className="mr-2 h-4 w-4" /> Ma position
            </Button>
            {selectedEvent && (
                <div className={`
                    absolute inset-0 flex items-center justify-center
                    bg-black bg-opacity-50 z-[2000]
                `}>
                    <EventDetails event={selectedEvent} onClose={() => setSelectedEvent(null)} />
                </div>
            )}
            <style jsx global>{`
                .event-marker {
                    font-size: 30px;
                    text-align: center;
                }
                .user-location-marker {
                    font-size: 30px;
                    text-align: center;
                }
            `}</style>
        </div>
    );
};

export default EventMap;
