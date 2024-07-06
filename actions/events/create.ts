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