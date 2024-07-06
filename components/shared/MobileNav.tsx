import { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import Image from "next/image"
import { Separator } from "../ui/separator"
import NavItems from "./NavItems"
import { Menu } from 'lucide-react'
import { Button } from "../ui/button"
import { signOut } from 'next-auth/react'

const MobileNav = () => {
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/' });
    };

    const closeSheet = () => {
        setIsOpen(false);
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger className="align-middle md:hidden">
                <Menu size={24} />
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col gap-6 bg-white md:hidden z-[1006]">
                <div className='flex gap-2 items-center'>
                    <Image
                        src="/assets/images/diamond-removebg-preview.png"
                        alt="logo"
                        width={40}
                        height={40}
                        className="h-12 w-12"
                    />
                    <h1 className='font-bold'>Evy</h1>
                </div>

                <Separator className="border border-gray-200" />
                <nav className='flex flex-col space-y-4'>
                    <NavItems closeSheet={closeSheet} />
                </nav>
                <div>
                    <Button
                        variant='default'
                        size="sm"
                        onClick={() => {
                            handleLogout();
                            closeSheet();
                        }}
                    >
                        Déconnexion
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default MobileNav