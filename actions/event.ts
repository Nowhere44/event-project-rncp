//actions/event.ts
import { prisma } from "@/server/db";
import { ReservationStatus } from "@prisma/client";

export async function createEvent(eventData: any, userId: string) {
    const event = await prisma.event.create({
        data: {
            ...eventData,
            userId,
            tags: {
                create: eventData.tags.map((tagName: string) => ({
                    tag: {
                        connectOrCreate: {
                            where: { name: tagName },
                            create: { name: tagName }
                        }
                    }
                }))
            }
        },
        include: { tags: { include: { tag: true } } }
    });
    return event;
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
        const simplifiedTags = event.tags.map(et => et.tag.name);
        const reservedTickets = event.reservations.reduce((sum, res) => sum + res.numberOfTickets, 0);
        const availableTickets = Math.max(0, event.capacity - reservedTickets);
        return {
            ...event,
            simplifiedTags,
            availableTickets
        };
    }
    return event;
}

export async function updateEvent(id: string, eventData: any, userId: string) {
    const { tags, ...rest } = eventData;
    const event = await prisma.event.update({
        where: { id, userId },
        data: {
            ...rest,
            tags: {
                deleteMany: {},
                create: tags.map((tagName: string) => ({
                    tag: {
                        connectOrCreate: {
                            where: { name: tagName },
                            create: { name: tagName }
                        }
                    }
                }))
            }
        },
        include: { tags: { include: { tag: true } } }
    });
    return event;
}

export async function deleteEvent(eventId: string, userId: string) {
    try {
        // Vérifier si l'utilisateur est le propriétaire de l'événement
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { reservations: true }
        });

        if (!event || event.userId !== userId) {
            throw new Error('Non autorisé à supprimer cet événement');
        }

        // Supprimer les réservations associées
        await prisma.reservation.deleteMany({
            where: { eventId }
        });

        // Supprimer les codes promo associés
        await prisma.promoCode.deleteMany({
            where: { eventId }
        });

        // Supprimer l'événement
        await prisma.event.delete({
            where: { id: eventId }
        });

        return { success: true };
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'événement:', error);
        throw error;
    }
}