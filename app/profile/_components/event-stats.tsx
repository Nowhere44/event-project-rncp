'use client';

import { IEvent } from '@/types';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useState, useEffect } from 'react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type EventStatsProps = {
    events: IEvent[];
};

const EventStats = ({ events }: EventStatsProps) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            if (typeof window !== 'undefined') {
                setIsMobile(window.innerWidth < 768);
            }
        };
        checkMobile();
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', checkMobile);
        }
        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', checkMobile);
            }
        };
    }, []);

    const eventRevenues = events.map(event => ({
        title: event.title,
        revenue: event.reservations.reduce((sum, res) => sum + Number(res.totalAmount), 0)
    })).sort((a, b) => b.revenue - a.revenue);

    const data = {
        labels: eventRevenues.map(event => isMobile ? event.title.substring(0, 10) + '...' : event.title),
        datasets: [
            {
                label: 'Revenus (€)',
                data: eventRevenues.map(event => event.revenue),
                backgroundColor: 'rgba(249, 115, 22, 0.6)',
                borderColor: 'rgba(249, 115, 22, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: !isMobile,
                position: 'top' as const,
                labels: {
                    color: '#4B5563',
                    font: {
                        size: isMobile ? 10 : 12,
                    },
                },
            },
            title: {
                display: true,
                text: 'Revenus par événement',
                color: '#1F2937',
                font: {
                    size: isMobile ? 14 : 16,
                    weight: 'bold' as const,
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: !isMobile,
                    text: 'Revenus (€)',
                    color: '#4B5563',
                },
                ticks: {
                    color: '#4B5563',
                    font: {
                        size: isMobile ? 10 : 12,
                    },
                },
            },
            x: {
                ticks: {
                    color: '#4B5563',
                    font: {
                        size: isMobile ? 8 : 10,
                    },
                    maxRotation: 90,
                    minRotation: 90,
                },
            },
        },
    };

    return (
        <div style={{ height: isMobile ? '300px' : '400px' }}>
            <Bar options={options} data={data} />
        </div>
    );
}

export default EventStats;