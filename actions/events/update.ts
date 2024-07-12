import { prisma } from "@/server/db";

export async function updateEvent(id: string, eventData: any, userId: string) {
    const { images, tags, ...otherData } = eventData;

    return await prisma.$transaction(async (prisma) => {
        const updateData: any = {
            ...otherData,
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
        };

        if (images && images.length > 0) {
            const existingImages = await prisma.image.findMany({
                where: { eventId: id },
                select: { id: true, url: true }
            });

            const imagesToDelete = existingImages.filter(img => !images.includes(img.url));
            const imagesToCreate = images.filter((url: any) => !existingImages.some(img => img.url === url));

            updateData.images = {
                deleteMany: {
                    id: { in: imagesToDelete.map(img => img.id) }
                },
                create: imagesToCreate.map((url: any, index: any) => ({
                    url,
                    order: existingImages.length + index
                }))
            };
        }

        const event = await prisma.event.update({
            where: {
                id: id,
                userId: userId
            },
            data: updateData,
            include: {
                tags: { include: { tag: true } },
                images: { orderBy: { order: 'asc' } }
            }
        });

        return event;
    });
}