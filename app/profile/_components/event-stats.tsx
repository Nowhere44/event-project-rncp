'use client';

import { IEvent } from '@/types';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type EventStatsProps = {
    events: IEvent[];
};

const EventStats = ({ events }: EventStatsProps) => {
    const eventPopularity = events.map(event => ({
        ...event,
        reservationCount: event.reservations.reduce((sum, res) => sum + res.numberOfTickets, 0)
    })).sort((a, b) => b.reservationCount - a.reservationCount);

    const top5Events = eventPopularity.slice(0, 5);

    const data = {
        labels: top5Events.map(event => event.title),
        datasets: [
            {
                label: 'Nombre de réservations',
                data: top5Events.map(event => event.reservationCount),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            }
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Top 5 des événements les plus populaires',
            },
        },
    };

    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Statistiques des événements</h2>
            <Bar options={options} data={data} />
        </div>
    );
};

export default EventStats;