'use client';
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { useSession } from 'next-auth/react';

interface NavItemsProps {
    closeSheet?: () => void;
}

const NavItems: React.FC<NavItemsProps> = ({ closeSheet }) => {
    const pathname = usePathname();
    const { data: session } = useSession();

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
            label: 'Messagerie',
            route: "/chat"
        }
    ]

    return (
        <>
            {headerLinks.map((link) => {
                const isActive = pathname === link.route;
                return (
                    <Link
                        key={link.route}
                        href={link.route}
                        onClick={closeSheet}
                        className={`${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'} transition-colors duration-200`}
                    >
                        {link.label}
                    </Link>
                )
            })}
        </>
    )
}

export default NavItems;