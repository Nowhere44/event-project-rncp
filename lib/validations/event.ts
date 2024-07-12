import * as z from "zod";

export const eventSchema = z.object({
    title: z.string().min(1, "Le titre est requis"),
    description: z.string().min(1, "La description est requise"),
    event_date: z.union([z.string(), z.date()]).optional(),
    start_time: z.union([z.string(), z.date()]).optional(),
    end_time: z.union([z.string(), z.date()]).optional(),
    location: z.string().min(1, "La localisation est requise"),
    latitude: z.union([z.number(), z.string()]).nullable().optional(),
    longitude: z.union([z.number(), z.string()]).nullable().optional(),
    capacity: z.union([z.number(), z.string()]).optional(),
    is_paid: z.boolean().optional(),
    price: z.union([z.number(), z.string()]).nullable().optional(),
    tags: z.array(z.string()).optional(),
    isOnline: z.boolean().optional(),
    meetingType: z.enum(['EXTERNAL', 'INTEGRATED']).nullable().optional(),
    meetingLink: z.string().url().nullable().optional(),
});