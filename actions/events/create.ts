//action to create an event
import { prisma } from "@/server/db";

export async function createEvent(eventData: any, userId: string) {
    const { images = [], tags = [], title, description, ...otherData } = eventData;

    if (!title) {
        throw new Error("Le titre est requis");
    }

    const event = await prisma.event.create({
        data: {
            title,
            description,
            ...otherData,
            userId,
            tags: {
                create: (Array.isArray(tags) ? tags : []).map((tagName: string) => ({
                    tag: {
                        connectOrCreate: {
                            where: { name: tagName },
                            create: { name: tagName }
                        }
                    }
                }))
            },
            images: {
                create: (Array.isArray(images) ? images : []).map((url: string, index: number) => ({
                    url,
                    order: index
                }))
            }
        },
        include: {
            tags: { include: { tag: true } },
            images: true
        }
    });
    return event;
}