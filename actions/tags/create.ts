import { prisma } from '@/server/db';
import { Tag } from '@prisma/client';

export async function createTag(name: string): Promise<Tag> {
    return prisma.tag.create({
        data: { name }
    });
}