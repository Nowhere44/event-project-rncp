'use client';
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

interface NavItemsProps {
    closeSheet?: () => void;
}

const NavItems: React.FC<NavItemsProps> = ({ closeSheet }) => {
    const pathname = usePathname();
    const { data: session } = useSession();

    const isCreateEventActive = pathname === '/events/create' || pathname.startsWith('/verification');
    const isEventsActive = pathname === '/events' || pathname.startsWith('/event') && !pathname.startsWith('/events/create');

    const headerLinks = [
        { label: 'Accueil', route: '/' },
        { label: 'Créer un événement', route: '/events/create', isActive: isCreateEventActive },
        { label: 'Événements', route: '/events', isActive: isEventsActive },
        { label: 'Mon Profil', route: `/profile/${session?.user?.id}` },
        { label: 'Messagerie', route: "/chat" },
        ...(session?.user?.role === 'Admin' ? [{ label: 'Admin', route: '/admin/verifications' }] : [])
    ];

    return (
        <>
            {headerLinks.map((link) => {
                const isActive = link.isActive || pathname === link.route;
                return (
                    <motion.div
                        key={link.route}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link
                            href={link.route}
                            onClick={closeSheet}
                            className={`${isActive
                                ? 'text-orange-600 font-semibold'
                                : 'text-gray-600 hover:text-orange-700'
                                } transition-colors duration-200 text-lg`}
                        >
                            {link.label}
                        </Link>
                    </motion.div>
                )
            })}
        </>
    )
}

export default NavItems;