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
import { motion } from 'framer-motion';

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
                <motion.div whileTap={{ scale: 0.9 }}>
                    <Menu size={28} className="text-orange-600" />
                </motion.div>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col gap-6 bg-white md:hidden z-[1006]">
                <div className='flex gap-2 items-center'>
                    <h1 className='text-2xl font-bold text-orange-500'>Evy</h1>
                </div>

                <Separator className="border border-gray-200" />
                <nav className='flex flex-col space-y-4'>
                    <NavItems closeSheet={closeSheet} />
                </nav>
                <div>
                    <Button
                        variant='outline'
                        size="lg"
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