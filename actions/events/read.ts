//actions/events/read.ts
import { prisma } from "@/server/db";
import { ReservationStatus } from "@prisma/client";
import { connectToDatabase } from "@/lib/database";
import Rating from "@/lib/database/models/rating.model";

export async function getEventById(id: string) {
    const event = await prisma.event.findUnique({
        where: { id },
        include: {
            tags: { include: { tag: true } },
            user: true,
            reservations: {
                where: {
                    status: {
                        in: [ReservationStatus.Confirmed, ReservationStatus.Pending]
                    },
                    numberOfTickets: {
                        gt: 0
                    }
                },
                include: {
                    user: true
                }
            }
        }
    });

    if (event) {
        await connectToDatabase();
        const commentsCount = await Rating.countDocuments({ eventId: id });
        const simplifiedTags = event.tags.map(et => et.tag.name);
        const reservedTickets = event.reservations.reduce((sum, res) => sum + res.numberOfTickets, 0);
        const availableTickets = Math.max(0, event.capacity - reservedTickets);
        return {
            ...event,
            simplifiedTags,
            availableTickets,
            commentsCount
        };
    }
    return event;
}


export async function getUserEvents(userId: string) {
    const events = await prisma.event.findMany({
        where: { userId },
        include: {
            tags: { include: { tag: true } },
            reservations: {
                include: {
                    user: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true
                        }
                    }
                }
            }
        }
    });

    return events.map(event => {
        const reservedTickets = event.reservations.reduce((sum, res) => sum + res.numberOfTickets, 0);
        const availableTickets = Math.max(0, event.capacity - reservedTickets);
        return {
            ...event,
            availableTickets
        };
    });
}

export async function getEvents(params: {
    userId?: string,
    search?: string,
    category?: string,
    page?: number,
    limit?: number,
    isPaid?: boolean,
    date?: Date
}) {
    const { userId, search, category, page = 1, limit = 10, isPaid, date } = params;
    const skip = (page - 1) * limit;

    const currentDate = new Date();

    const where: any = {
        OR: [
            {
                event_date: {
                    gte: date || currentDate,
                },
            },
            {
                end_time: {
                    gte: currentDate,
                },
            },
        ],
    };

    if (userId) where.userId = userId;
    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
        ];
    }
    if (category) {
        where.tags = {
            some: {
                tag: {
                    name: { in: category.split(',') },
                },
            },
        };
    }
    if (isPaid !== undefined) where.is_paid = isPaid;

    const events = await prisma.event.findMany({
        where,
        include: {
            tags: { include: { tag: true } },
            reservations: true,
            user: { select: { id: true, first_name: true, last_name: true, averageRating: true } }
        },
        skip,
        take: limit,
        orderBy: { event_date: 'asc' }
    });

    const eventsWithAvailableTickets = events.map(event => {
        const reservedTickets = event.reservations.reduce((sum, res) => sum + res.numberOfTickets, 0);
        const availableTickets = Math.max(0, event.capacity - reservedTickets);
        return {
            ...event,
            availableTickets,
            reservations: undefined // Optionnel : retirer les réservations pour réduire la taille des données
        };
    });

    const total = await prisma.event.count({ where });

    return { events: eventsWithAvailableTickets, total, totalPages: Math.ceil(total / limit) };
}
