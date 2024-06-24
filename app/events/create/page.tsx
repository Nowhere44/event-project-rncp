import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import EventForm from "./_components/event-form";
import { redirect } from 'next/navigation';

export default async function CreateEventPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-4">Créer un nouvel événement</h1>
            <EventForm userId={session.user.id} />
        </div>
    );
}