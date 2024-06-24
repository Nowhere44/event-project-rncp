import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/auth.config";
import EventForm from '/Users/charon/event-project/app/events/create/_components/event-form';
import { redirect } from 'next/navigation';
import { getEventById } from '@/actions/event';

export default async function EditEventPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    const event = await getEventById(params.id);

    console.log("event dans edit", event);

    if (!session || session.user.id !== event?.userId) {
        redirect('/login');
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-4">Modifier lévénement</h1>
            <EventForm userId={session.user.id} eventId={params.id} defaultValues={event} />
        </div>
    );
}