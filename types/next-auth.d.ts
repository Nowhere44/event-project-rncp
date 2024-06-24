import "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
    interface User {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: Role;
        image?: string | null;
    }

    interface Session {
        user: User;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: Role;
        image?: string | null;
    }
}