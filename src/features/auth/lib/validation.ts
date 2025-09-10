import { z } from "zod"

export const signInSchema = z.object({
    accessCode: z
        .string()
        .trim()
        .min(1, "Access code is required")
        .max(50, "Access code too long")
        .regex(/^[a-zA-Z0-9_-]+$/, "Invalid access code format"),
    password: z
        .string()
        .min(5, "Password is required")
        .max(64, "Password too long")
})

export type SignInInput = z.infer<typeof signInSchema>