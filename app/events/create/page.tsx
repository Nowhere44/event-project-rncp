//app
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import EventForm from "./_components/event-form";
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, MapPinIcon, TagIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default async function CreateEventPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="h-full place-content-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <Card className="flex flex-col h-[980px]">
                    <CardHeader>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col overflow-hidden">
                        <Tabs defaultValue="details" className="flex flex-col h-full">
                            <TabsList className="grid w-full grid-cols-4 bg-orange-50">
                                <TabsTrigger value="details" className="flex items-center">
                                    <CalendarIcon className="w-5 h-5 mr-2" />
                                    Détails
                                </TabsTrigger>
                                <TabsTrigger value="location" className="flex items-center">
                                    <MapPinIcon className="w-5 h-5 mr-2" />
                                    Lieu
                                </TabsTrigger>
                                <TabsTrigger value="tags" className="flex items-center">
                                    <TagIcon className="w-5 h-5 mr-2" />
                                    Tags
                                </TabsTrigger>
                                <TabsTrigger value="pricing" className="flex items-center">
                                    <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                                    Tarification
                                </TabsTrigger>
                            </TabsList>
                            <div className="flex-grow overflow-hidden">
                                <EventForm userId={session.user.id} />
                            </div>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}