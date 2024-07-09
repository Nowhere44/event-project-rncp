import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/provider";
import dynamic from 'next/dynamic'
const DynamicHeader = dynamic(() => import('../components/shared/Header'), { ssr: false })
const DynamicFooter = dynamic(() => import('../components/shared/Footer'), { ssr: false })

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Evy - Découvrez, Créez, Vivez vos Événements",
  description: "Evy est la plateforme qui révolutionne la gestion d'événements. Trouvez des événements locaux, créez les vôtres, et connectez-vous avec une communauté passionnée.",
  keywords: "événements, organisation, communauté, local, réservation, expériences",
  openGraph: {
    title: "Evy - La Plateforme d'Événements Innovante",
    description: "Découvrez, créez et participez à des événements uniques avec Evy. Votre prochaine expérience mémorable est à portée de clic.",
    images: [{
      url: 'https://cdn.discordapp.com/attachments/1260248323760328820/1260306824339521606/gamer120857_Ultra-minimalist_logo_for_an_event_management_app.__918374bb-4006-4de4-a22e-7517497fdb6b.png?ex=668ed7b2&is=668d8632&hm=9febd9af68e575cfc56304b52046f159a5e159e1376245014f018a7b4b7b8de3&', width: 1200, height: 630, alt: `Evy - Plateforme d'événements`
    }],
  },
}
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex flex-col h-full`}>
        <Providers>
          <DynamicHeader />
          <main className="flex-grow">
            {children}
          </main>
          <DynamicFooter />
        </Providers>
      </body>
    </html>
  );
}