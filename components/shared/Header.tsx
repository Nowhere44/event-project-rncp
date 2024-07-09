// Header.tsx
"use client"
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Button } from '../ui/button';
import NavItems from './NavItems';
import MobileNav from './MobileNav';

const Header = () => {
    const { data: session, status } = useSession();

    return (
        <header className='w-full border-b bg-white shadow-sm sticky top-0 z-[1005]'>
            <div className='max-w-7xl mx-auto flex items-center justify-between py-4 px-6 md:px-10'>
                <Link href="/" className='flex items-center space-x-2'>
                    <span className="text-2xl font-bold text-orange-500">Evy</span>
                </Link>

                {status === 'authenticated' ? (
                    <>
                        <nav className='hidden md:flex items-center space-x-8'>
                            <NavItems />
                        </nav>
                        <div className='flex items-center space-x-4'>
                            <div className='hidden md:block'>
                                <Button
                                    variant='default'
                                    size="lg"
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="bg-orange-500 hover:bg-orange-600 text-white"
                                >
                                    Déconnexion
                                </Button>
                            </div>
                            <MobileNav />
                        </div>
                    </>
                ) : (
                    <Button asChild variant='default' size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                        <Link href="/login">
                            Connexion
                        </Link>
                    </Button>
                )}
            </div>
        </header>
    );
};

export default Header;