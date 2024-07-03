'use client';
import { IEvent } from '@/types';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type EventStatsProps = {
    events: IEvent[];
};

const EventStats = ({ events }: EventStatsProps) => {
    const eventRevenues = events.map(event => {
        const revenue = event.reservations.reduce((sum, res) => sum + Number(res.totalAmount), 0);
        return {
            title: event.title,
            revenue: revenue
        };
    }).sort((a, b) => b.revenue - a.revenue);

    const data = {
        labels: eventRevenues.map(event => event.title),
        datasets: [
            {
                label: 'Revenus par événement',
                data: eventRevenues.map(event => event.revenue),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
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
                text: 'Revenus par événement',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Revenus (€)'
                }
            }
        }
    };

    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Statistiques des événements</h2>
            <Bar options={options} data={data} />
        </div>
    );
};

export default EventStats;