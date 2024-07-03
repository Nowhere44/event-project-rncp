'use client';
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';

const NavItems = () => {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [notificationCount, setNotificationCount] = useState(0);

    // Use a ref to persist the socket connection across re-renders
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (session?.user?.id && !socketRef.current) {
            const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
                path: '/api/socketio',
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });
            socketRef.current = newSocket;

            newSocket.on('connect', () => {
                console.log('Connected to Socket.IO server');
                newSocket.emit('register', session.user.id); // Ajoutez cette ligne
            });
            newSocket.on('test_response', (data) => {
                console.log('Received test response:', data);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket.IO connection error:', error);
            });
            newSocket.on('notification', (notification) => {
                console.log('Received notification:', notification);
                setNotificationCount(prev => prev + 1);
            });
        }
    }, [session]);

    const headerLinks = [
        {
            label: 'Accueil',
            route: '/',
        },
        {
            label: 'Créer un événement',
            route: '/events/create',
        },
        {
            label: 'Mon Profile',
            route: `/profile/${session?.user?.id}`
        },
        {
            label: `Messagerie ${notificationCount > 0 ? `(${notificationCount})` : ''}`,
            route: "/chat"
        }
    ]

    const handleChatClick = () => {
        setNotificationCount(0);
    };

    return (
        <ul className="md:flex-between flex w-full flex-col items-start gap-5 md:flex-row">
            {headerLinks.map((link) => {
                const isActive = pathname === link.route;
                return (
                    <li
                        key={link.route}
                        className={`${isActive && 'text-blue-500'} flex-center p-medium-16 whitespace-nowrap`}
                    >
                        <Link href={link.route} onClick={link.route === '/chat' ? handleChatClick : undefined}>
                            {link.label}
                        </Link>
                    </li>
                )
            })}
        </ul>
    )
}

export default NavItems;