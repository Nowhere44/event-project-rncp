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
        <div className="bg-gray-50 px-4 py-24 sm:px-6 lg:px-4">
            <div className="mx-auto max-w-6xl">
                <h1 className="text-4xl font-bold text-gray-900 text-center mb-8">
                    Créer un nouvel événement
                </h1>
                <div className="bg-white shadow-lgrounded-lg p-6 sm:p-10">
                    <EventForm userId={session.user.id} />
                </div>
            </div>
        </div>
    );
}