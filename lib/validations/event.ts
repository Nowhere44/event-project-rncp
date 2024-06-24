import * as z from "zod";

export const eventSchema = z.object({
    title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
    description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
    imageUrl: z.string().url("L'URL de l'image n'est pas valide").optional(),
    event_date: z.date(),
    start_time: z.date(),
    end_time: z.date(),
    location: z.string().min(3, "La localisation doit contenir au moins 3 caractères"),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    capacity: z.number().min(1, "La capacité doit être d'au moins 1 personne"),
    is_paid: z.boolean(),
    price: z.number().optional(),
    tags: z.array(z.string())
});