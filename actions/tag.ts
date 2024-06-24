import { prisma } from "@/server/db";

export async function createTag(name: string) {
    const tag = await prisma.tag.create({ data: { name } });
    return tag;
}

export async function getTags() {
    const tags = await prisma.tag.findMany();
    return tags;
}