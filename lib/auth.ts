import { auth } from "@/server/auth";
import { Role } from "@prisma/client";
import { User } from "next-auth";

export const currentUser = async () => {
    const session = await auth();
    return session?.user as User & { id: string, role: Role };
};

export const currentRole = async () => {
    const session = await auth();
    return session?.user?.role;
};