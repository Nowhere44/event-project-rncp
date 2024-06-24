import { User } from "@prisma/client";

export type APIResponse = {
    statusCode: number,
    body: any
};

export type UserExtended = User & {
    // Ajoutez ici des propriétés supplémentaires si nécessaire
};