import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import EventForm from '../../create/_components/event-form';
import { redirect } from 'next/navigation';
import { getEventById } from '@/actions/events/read';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, MapPinIcon, TagIcon, CurrencyDollarIcon, PencilIcon } from '@heroicons/react/24/outline';

export default async function EditEventPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    const event = await getEventById(params.id);

    if (!session || session.user.id !== event?.userId) {
        redirect('/login');
    }

    return (
        <div className="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto"> {/* Increased max-width */}
                <Card className="bg-gray-50"> {/* Slightly gray background */}
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold flex items-center justify-center">
                            <PencilIcon className="w-8 h-8 mr-2" />
                            {`Modifier l'événement`}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6"> {/* Increased padding */}
                        <Tabs defaultValue="details" className="w-full">
                            <TabsList className="grid w-full grid-cols-4 mb-6">
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
                            <div className="mt-6">
                                <EventForm userId={session.user.id} eventId={params.id} defaultValues={event} />
                            </div>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}