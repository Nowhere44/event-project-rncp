'use client';

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { useSession } from 'next-auth/react';


const NavItems = () => {
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
    ]

    return (
        <ul className="md:flex-between flex w-full flex-col items-start gap-5 md:flex-row">
            {headerLinks.map((link) => {
                const isActive = pathname === link.route;

                return (
                    <li
                        key={link.route}
                        className={`${isActive && 'text-blue-500'
                            } flex-center p-medium-16 whitespace-nowrap`}
                    >
                        <Link href={link.route}>{link.label}</Link>
                    </li>
                )
            })}
        </ul>
    )
}

export default NavItems