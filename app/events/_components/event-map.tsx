'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IEvent } from '@/types';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

type EventMapProps = {
    events: IEvent[];
};

const EventMap = ({ events }: EventMapProps) => {
    const mapRef = useRef<L.Map | null>(null);
    const router = useRouter();
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const { data: session } = useSession();

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

                            const userPopupContent = `
                                <div class="user-popup">
                                    <h3>${`${session?.user?.firstName}  ${session?.user?.lastName}` || 'Utilisateur'}</h3>
                                    ${session?.user?.image ? `<img src="${session.user.image}" alt="Profile" style="width:50px;height:50px;border-radius:50%;"/>` : ''}
                                    <p>Vous êtes ici</p>
                                </div>
                            `;


                            L.marker([latitude, longitude], {
                                icon: L.divIcon({
                                    className: 'user-location-marker',
                                    html: '📍',
                                    iconSize: [25, 25],
                                    iconAnchor: [12, 24],
                                })
                            }).addTo(mapRef.current)
                                .bindPopup(userPopupContent, {
                                    maxWidth: 300,
                                    className: 'user-popup'
                                });
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
                if (event.latitude && event.longitude) {
                    const marker = L.marker([event.latitude, event.longitude], {
                        icon: L.divIcon({
                            className: 'event-marker',
                            html: '🏢',
                            iconSize: [30, 30],
                            iconAnchor: [15, 30],
                        })
                    }).addTo(mapRef.current!);

                    const popupContent = `
                        <div class="event-popup">
                            <h3>${event.title}</h3>
                            ${event.imageUrl ? `<img src="${event.imageUrl}" alt="${event.title}" style="width:100%;max-width:200px;"/>` : ''}
                            <p>${event.description.substring(0, 100)}...</p>
                            <button onclick="window.location.href='/events/${event.id}'">Voir l'événement</button>
                        </div>
                    `;

                    marker.bindPopup(popupContent, {
                        maxWidth: 300,
                        className: 'event-popup'
                    });

                    marker.on('mouseover', (e) => {
                        e.target.openPopup();
                    });

                    marker.on('mouseout', (e) => {
                        e.target.closePopup();
                    });

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
    }, [events, router, session]);

    return (
        <>
            <div id="map" style={{ height: '400px', width: '100%' }} />
            <style jsx global>{`
                .user-location-marker {
                    font-size: 25px;
                    text-align: center;
                }
                .event-marker {
                    font-size: 30px;
                    text-align: center;
                }
                .event-popup .leaflet-popup-content-wrapper,
                .user-popup .leaflet-popup-content-wrapper {
                    background-color: #f8f9fa;
                    color: #333;
                    border-radius: 10px;
                    padding: 1px;
                    box-shadow: 0 3px 14px rgba(0,0,0,0.4);
                }
                .event-popup .leaflet-popup-content,
                .user-popup .leaflet-popup-content {
                    margin: 13px 19px;
                    line-height: 1.4;
                }
                .event-popup .leaflet-popup-content h3,
                .user-popup .leaflet-popup-content h3 {
                    margin: 0 0 10px 0;
                    font-size: 18px;
                    font-weight: bold;
                }
                .event-popup .leaflet-popup-content img,
                .user-popup .leaflet-popup-content img {
                    max-width: 100%;
                    height: auto;
                    margin-bottom: 10px;
                }
                .event-popup .leaflet-popup-content button {
                    background-color: #007bff;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 10px;
                }
                .event-popup .leaflet-popup-content button:hover {
                    background-color: #0056b3;
                }
                .user-popup .leaflet-popup-content img {
                    border-radius: 50%;
                }
            `}</style>
        </>
    );
};

export default EventMap;