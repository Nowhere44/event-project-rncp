import { prisma } from "@/server/db";

export async function searchEvents(params: {
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
            { event_date: { gte: date || currentDate } },
            { end_time: { gte: currentDate } },
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
            reservations: undefined
        };
    });

    const total = await prisma.event.count({ where });

    return { events: eventsWithAvailableTickets, total, totalPages: Math.ceil(total / limit) };
}