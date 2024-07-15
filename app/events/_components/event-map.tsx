'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { IEvent } from '@/types';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { Locate, X, Layers } from 'lucide-react';
import Image from 'next/image';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

type EventMapProps = {
    events: IEvent[];
};

const EventMap = ({ events }: EventMapProps) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const router = useRouter();
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
    const [is3DMode, setIs3DMode] = useState(false);


    useEffect(() => {
        if (typeof window !== 'undefined' && !map.current) {
            map.current = new mapboxgl.Map({
                container: mapContainer.current!,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [1.888334, 46.603354],
                zoom: 5,
                pitch: is3DMode ? 45 : 0,
                bearing: is3DMode ? -17.6 : 0,
                antialias: true
            });

            map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

            map.current.on('load', () => {
                if (map.current) {
                    map.current.addLayer({
                        'id': '3d-buildings',
                        'source': 'composite',
                        'source-layer': 'building',
                        'filter': ['==', 'extrude', 'true'],
                        'type': 'fill-extrusion',
                        'minzoom': 15,
                        'paint': {
                            'fill-extrusion-color': '#aaa',
                            'fill-extrusion-height': [
                                "interpolate", ["linear"], ["zoom"],
                                15, 0,
                                15.05, ["get", "height"]
                            ],
                            'fill-extrusion-base': [
                                "interpolate", ["linear"], ["zoom"],
                                15, 0,
                                15.05, ["get", "min_height"]
                            ],
                            'fill-extrusion-opacity': .6
                        }
                    });
                }
            });

            events.forEach(event => {
                if (event.latitude && event.longitude) {
                    const el = document.createElement('div');
                    el.className = 'event-marker';
                    el.style.width = '40px';
                    el.style.height = '40px';
                    el.style.borderRadius = '50%';
                    el.style.overflow = 'hidden';
                    el.style.border = '2px solid #FFF';
                    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
                    el.style.cursor = 'pointer';

                    const img = document.createElement('img');
                    img.src = event.imageUrl || '/default-event-image.jpg';
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'cover';
                    el.appendChild(img);

                    el.addEventListener('click', () => {
                        setSelectedEvent(event);
                    });

                    new mapboxgl.Marker(el)
                        .setLngLat([event.longitude, event.latitude])
                        .addTo(map.current!);
                }
            });
        }

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [events, is3DMode]);

    const centerOnUserLocation = () => {
        if (typeof window !== 'undefined' && "geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([longitude, latitude]);
                    if (map.current) {
                        map.current.flyTo({
                            center: [longitude, latitude],
                            zoom: 14
                        });

                        const el = document.createElement('div');
                        el.className = 'user-location-marker';
                        el.style.width = '15px';
                        el.style.height = '15px';
                        el.style.borderRadius = '50%';
                        el.style.backgroundColor = '#4285F4';
                        el.style.border = '2px solid #FFF';
                        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

                        new mapboxgl.Marker(el)
                            .setLngLat([longitude, latitude])
                            .setPopup(new mapboxgl.Popup().setHTML("Vous êtes ici"))
                            .addTo(map.current);
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

    const toggle3DMode = () => {
        setIs3DMode(!is3DMode);
        if (map.current) {
            map.current.easeTo({
                pitch: is3DMode ? 0 : 45,
                bearing: is3DMode ? 0 : -17.6
            });
        }
    };

    const truncateDescription = (description: string, maxLength: number = 100) => {
        if (description.length <= maxLength) return description;
        return description.substr(0, maxLength) + '...';
    };

    const EventDetails = ({ event, onClose }: { event: IEvent; onClose: () => void }) => (
        <div className="bg-white p-4 rounded-lg shadow-lg max-w-sm w-full relative">
            <Button
                className="absolute top-2 right-2 z-10"
                variant="ghost"
                size="icon"
                onClick={onClose}
            >
                <X className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
            <p className="text-sm mb-2">
                <strong>Date:</strong>{' '}
                {format(
                    new Date(event.event_date).setHours(
                        new Date(event.start_time).getHours(),
                        new Date(event.start_time).getMinutes()
                    ),
                    "dd MMMM yyyy 'à' HH'h'mm",
                    { locale: fr }
                )}
            </p>
            <p className="text-sm mb-2"><strong>Lieu:</strong> {event.location}</p>
            <p className="text-sm mb-2"><strong>Prix:</strong> {event.price ? `${event.price}€` : 'Gratuit'}</p>
            <p className="text-sm mb-4">{truncateDescription(event.description)}</p>
            <Button onClick={() => router.push(`/events/${event.id}`)}>
                {`Voir l'événement`}
            </Button>
        </div>
    );

    return (
        <div className="relative">
            <div ref={mapContainer} className="h-[400px] w-full rounded-lg shadow-md" />
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <Button
                    onClick={centerOnUserLocation}
                    variant="secondary"
                >
                    <Locate className="mr-2 h-4 w-4" /> Ma position
                </Button>
                <Button
                    onClick={toggle3DMode}
                    variant="secondary"
                >
                    <Layers className="mr-2 h-4 w-4" /> {is3DMode ? '2D' : '3D'}
                </Button>
            </div>
            {selectedEvent && (
                <div
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20"
                    onClick={() => setSelectedEvent(null)}
                >
                    <div onClick={(e) => e.stopPropagation()}>
                        <EventDetails event={selectedEvent} onClose={() => setSelectedEvent(null)} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventMap;