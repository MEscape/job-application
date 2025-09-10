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

export const signUpSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .email("Invalid email format")
        .max(100, "Email too long"),
    company: z
        .string()
        .trim()
        .min(1, "Company is required")
        .max(100, "Company name too long"),
    name: z
        .string()
        .trim()
        .max(100, "Name too long")
        .optional(),
    location: z
        .string()
        .trim()
        .min(1, "Location is required")
        .max(100, "Location too long"),
    latitude: z
        .number()
        .min(-90, "Latitude must be between -90 and 90")
        .max(90, "Latitude must be between -90 and 90"),
    longitude: z
        .number()
        .min(-180, "Longitude must be between -180 and 180")
        .max(180, "Longitude must be between -180 and 180"),
    accessCode: z
        .string()
        .trim()
        .max(12, "Access code too long")
        .regex(/^[A-Z0-9]*$/, "Access code can only contain uppercase letters and numbers")
        .optional()
        .or(z.literal("")),
    password: z
        .string()
        .trim()
        .max(50, "Password too long")
        .optional()
        .or(z.literal(""))
        .refine((val) => !val || val.length >= 8, {
            message: "Password must be at least 8 characters if provided"
        })
})

export type SignUpInput = z.infer<typeof signUpSchema>