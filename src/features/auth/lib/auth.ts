import NextAuth, {type NextAuthConfig} from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import {verifyPassword} from "./password"
import {signInSchema} from "./validation"
import {prisma} from "@/features/shared/lib"

export const config = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "credentials",
            credentials: {
                accessCode: { label: "Access Code", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    // Validate input with Zod schema
                    const { accessCode, password } = signInSchema.parse(credentials)

                    // Find user by access code
                    const user = await prisma.user.findUnique({
                        where: { accessCode }
                    })

                    // User not found or inactive
                    if (!user || !user.isActive) {
                        return null
                    }

                    // Verify password using secure comparison
                    const isValidPassword = await verifyPassword(password, user.password)
                    if (!isValidPassword) {
                        return null
                    }

                    // Update last login timestamp
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { lastLogin: new Date() }
                    }).catch(console.error)

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        company: user.company,
                        location: user.location,
                        accessCode: user.accessCode,
                        isAdmin: user.isAdmin
                    }
                } catch (error) {
                    console.error("Authentication error:", error)
                    return null
                }
            }
        })
    ],
    
    // Session configuration
    session: {
        // Use JWT strategy for sessions
        strategy: "jwt",
        // 30 days max age for sessions
        maxAge: 30 * 24 * 60 * 60, // 30 days
        // Update session every 24 hours
        updateAge: 24 * 60 * 60, // 24 hours
    },
    
    // JWT configuration
    jwt: {
        // Maximum age of the JWT
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    
    // Pages configuration
    pages: {
        signIn: "/auth/signin",
        signOut: "/auth/signout",
        error: "/auth/error",
    },
    
    callbacks: {
        // Customize JWT creation and updates
        async jwt({ token, user }) {
            // Initial sign in - add user data to token
            if (user) {
                token.company = user.company
                token.location = user.location
                token.accessCode = user.accessCode
                token.isAdmin = user.isAdmin
            }

            return token
        },

        // Customize session object sent to client
        async session({ session, token }) {
            if (token) {
                session.user = {
                    ...session.user,
                    id: token.sub!,
                    company: token.company as string,
                    location: token.location as string,
                    accessCode: token.accessCode as string,
                    isAdmin: token.isAdmin as boolean,
                }
            }
            return session
        }
    },
} satisfies NextAuthConfig

export const { handlers, auth } = NextAuth(config)
