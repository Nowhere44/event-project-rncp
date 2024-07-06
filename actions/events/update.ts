//actions/events/update.ts
import { prisma } from "@/server/db";

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