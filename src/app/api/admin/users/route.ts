import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/features/shared/lib"
import { requireAdmin } from "@/features/auth/lib/adminMiddleware"
import bcrypt from "bcryptjs"
import {generateAccessCode, generatePassword, signUpSchema} from "@/features/auth/lib";
import { SessionTracker } from "@/features/auth/lib/sessionTracking"
import { withErrorHandler, ErrorResponses } from "@/features/shared/lib/errorHandler"

export const GET = withErrorHandler(async () => {
        // Check if user has admin privileges
        await requireAdmin()

        const users = await prisma.user.findMany({
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
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(users)
})

export const POST = withErrorHandler(async (request: NextRequest) => {
        // Check if user has admin privileges
        const adminUser = await requireAdmin()

        const body = await request.json()
        const validatedData = signUpSchema.parse(body)

        // Generate default values
        const accessCode = validatedData.accessCode || generateAccessCode()
        const defaultPassword = validatedData.password || generatePassword()
        const hashedPassword = await bcrypt.hash(defaultPassword, 12)

        // Check if email or accessCode already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: validatedData.email },
                    { accessCode: accessCode }
                ]
            }
        })

        if (existingUser) {
            throw ErrorResponses.VALIDATION_ERROR
        }

        const newUser = await prisma.user.create({
            data: {
                accessCode: accessCode,
                password: hashedPassword,
                email: validatedData.email,
                company: validatedData.company,
                name: validatedData.name || null,
                location: validatedData.location,
                latitude: validatedData.latitude,
                longitude: validatedData.longitude,
                isActive: true,
                isAdmin: false
            },
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

        // Return user data with the unhashed password for admin reference
        return NextResponse.json({
            ...newUser,
            temporaryPassword: defaultPassword
        }, { status: 201 })
})

