import { z } from "zod";

const addressSchema = z.object({
    number: z.number().int().positive(),
    streetName: z.string().trim().min(1),
    postCode: z.string().trim().min(1),
    city: z.string().trim().min(1)
});

const contactSchema = z.object({
    name: z.string().trim().min(1),
    email: z.email(),
    address: addressSchema
});

export const createShipmentSchema = z.object({
    senderId: z.string().trim().min(1),
    sender: contactSchema,
    recipient: contactSchema,
    weightGrams: z.number().int().positive()
});