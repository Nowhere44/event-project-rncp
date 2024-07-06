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

    return (
        <header className='w-full border-b bg-white shadow-sm sticky top-0 z-[1005]'>
            <div className='wrapper flex items-center justify-between py-4 px-6 md:px-10'>
                <Link href="/" className='flex items-center space-x-2'>
                    <Image
                        src="/assets/images/diamond-removebg-preview.png"
                        width={40}
                        height={40}
                        alt='Event logo'
                        className="w-auto h-10"
                    />
                    <span className="text-xl font-bold text-gray-800">Evy</span>
                </Link>

                {status === 'authenticated' ? (
                    <>
                        <nav className='hidden md:flex items-center space-x-6'>
                            <NavItems />
                        </nav>
                        <div className='flex items-center space-x-4'>
                            <div className='hidden md:block'>                      <Button
                                variant='default'
                                size="sm"
                                onClick={() => signOut({ callbackUrl: '/' })}
                            >
                                Déconnexion
                            </Button></div>

                            <MobileNav />
                        </div>
                    </>
                ) : (
                    <Button asChild variant='default' size="sm">
                        <Link href="/login">
                            Connexion
                        </Link>
                    </Button>
                )}
            </div>
        </header>
    );
};