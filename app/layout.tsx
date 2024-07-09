import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/provider";
import { Footer } from "@/components/shared/Footer";
import { Header } from "@/components/shared/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Evy - Découvrez, Créez, Vivez vos Événements",
  description: "Evy est la plateforme qui révolutionne la gestion d'événements. Trouvez des événements locaux, créez les vôtres, et connectez-vous avec une communauté passionnée.",
  keywords: "événements, organisation, communauté, local, réservation, expériences",
  openGraph: {
    title: "Evy - La Plateforme d'Événements Innovante",
    description: "Découvrez, créez et participez à des événements uniques avec Evy. Votre prochaine expérience mémorable est à portée de clic.",
    images: [{
      url: '/images/evy-og-image.jpg', width: 1200, height: 630, alt: `Evy - Plateforme d'événements`
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Evy - Révolutionnez vos Événements",
    description: "Rejoignez Evy pour découvrir et créer des événements exceptionnels dans votre région.",
    images: ['/images/evy-twitter-image.jpg'],
  },
}
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex flex-col h-full`}>
        <Providers>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}