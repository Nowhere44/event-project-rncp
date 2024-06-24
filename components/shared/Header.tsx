"use client"

import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Button } from '../ui/button';
import NavItems from './NavItems';
import MobileNav from './MobileNav';


export const Header = () => {
    const { data: session, status } = useSession();


    const handleLogout = async () => {
        await signOut({ callbackUrl: '/' });
    };

    return (
        <header className='w-full border-b'>
            <div className='wrapper flex items-center justify-between'>
                <Link href="/" className='w-16'>
                    <Image
                        src="/assets/images/diamond-removebg-preview.png"
                        width={130}
                        height={50}
                        alt='Event logo'
                    />
                </Link>
                {status === 'authenticated' ? (
                    <>
                        <nav className='md:flex-between hidden w-full max-w-xs'>
                            <NavItems />
                        </nav>
                        <div className='flex w-32 justify-end gap-3'>
                            <Button className='rounded-full' size="lg" onClick={handleLogout}>
                                Deconnexion
                            </Button>
                            <MobileNav />
                        </div>
                    </>
                ) : (
                    <div className='flex w-32 justify-end gap-3'>
                        <Button asChild className='rounded-full' size="lg">
                            <Link href="/login">
                                Connexion
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </header>
    );
};
