import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/features/shared/lib"
import { requireAdmin } from "@/features/auth/lib/adminMiddleware"
import { z } from "zod"
import { SessionTracker } from "@/features/auth/lib/sessionTracking"

const updateUserSchema = z.object({
    email: z.string().email("Invalid email format").optional(),
    company: z.string().min(1, "Company is required").optional(),
    name: z.string().nullable().optional(),
    location: z.string().min(1, "Location is required").optional(),
    latitude: z
        .number()
        .min(-90, "Latitude must be between -90 and 90")
        .max(90, "Latitude must be between -90 and 90")
        .optional(),
    longitude: z
        .number()
        .min(-180, "Longitude must be between -180 and 180")
        .max(180, "Longitude must be between -180 and 180")
        .optional(),
    isActive: z.boolean().optional(),
    isAdmin: z.boolean().optional()
})

interface RouteParams {
    params: Promise<{
        id: string
    }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        // Check if user has admin privileges
        const adminUser = await requireAdmin()

        const { id } = await params
        const body = await request.json()
        const validatedData = updateUserSchema.parse(body)

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id }
        })

        if (!existingUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        // If email is being updated, check for conflicts
        if (validatedData.email && validatedData.email !== existingUser.email) {
            const emailConflict = await prisma.user.findFirst({
                where: {
                    email: validatedData.email,
                    id: { not: id }
                }
            })

            if (emailConflict) {
                return NextResponse.json(
                    { error: "Email already exists" },
                    { status: 400 }
                )
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: validatedData,
            select: {
                id: true,
                accessCode: true,
                email: true,
                company: true,
                name: true,
                location: true,
                latitude: true,
                longitude: true,
                isActive: true,
                isAdmin: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true
            }
        })

        // Log user update
        await SessionTracker.logActivity({
            userId: adminUser.id,
            action: 'UPDATE_USER',
            resource: `api/admin/users/${id}`
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error('Error updating user:', error)
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { 
                    error: "Validation error", 
                    details: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)
                },
                { status: 400 }
            )
        }
        
        if (error instanceof Error) {
            if (error.message === "Authentication required") {
                return NextResponse.json(
                    { error: "Authentication required" },
                    { status: 401 }
                )
            }
            if (error.message === "Admin privileges required") {
                return NextResponse.json(
                    { error: "Admin privileges required" },
                    { status: 403 }
                )
            }
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
    try {
        // Check if user has admin privileges
        const adminUser = await requireAdmin()

        const { id } = await params

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id }
        })

        if (!existingUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        // Prevent deletion of admin users (optional safety measure)
        if (existingUser.isAdmin) {
            return NextResponse.json(
                { error: "Cannot delete admin users" },
                { status: 403 }
            )
        }

        await prisma.user.delete({
            where: { id }
        })

        // Log user deletion
        await SessionTracker.logActivity({
            userId: adminUser.id,
            action: 'DELETE_USER',
            resource: `api/admin/users/${id}`
        })

        return NextResponse.json(
            { message: "User deleted successfully" },
            { status: 200 }
        )
    } catch (error) {
        console.error('Error deleting user:', error)
        
        if (error instanceof Error) {
            if (error.message === "Authentication required") {
                return NextResponse.json(
                    { error: "Authentication required" },
                    { status: 401 }
                )
            }
            if (error.message === "Admin privileges required") {
                return NextResponse.json(
                    { error: "Admin privileges required" },
                    { status: 403 }
                )
            }
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}