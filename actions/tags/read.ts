import { prisma } from '@/server/db';
import { Tag } from '@prisma/client';

export async function getTags(): Promise<Tag[]> {
    return prisma.tag.findMany();
}