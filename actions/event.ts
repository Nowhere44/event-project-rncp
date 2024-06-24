import { prisma } from "@/server/db";

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
    limit?: number
}) {
    const { userId, search, category, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where: any = {
        event_date: {
            gte: new Date()  // Inclure seulement les événements à partir d'aujourd'hui
        }
    };
    if (userId) where.userId = userId;
    if (search) where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
    ];
    if (category) where.tags = { some: { tag: { name: category } } };

    const events = await prisma.event.findMany({
        where,
        include: { tags: { include: { tag: true } } },
        skip,
        take: limit,
        orderBy: { event_date: 'asc' }  // Trier par date croissante
    });

    const total = await prisma.event.count({ where });

    return { events, total, totalPages: Math.ceil(total / limit) };
}

export async function getEventById(id: string) {
    const event = await prisma.event.findUnique({
        where: { id },
        include: {
            tags: {
                include: {
                    tag: true
                }
            },
            user: true
        }
    });
    if (event) {
        const simplifiedTags = event.tags.map(et => et.tag.name);
        return {
            ...event,
            simplifiedTags
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

export async function deleteEvent(id: string, userId: string) {
    await prisma.event.delete({ where: { id, userId } });
}