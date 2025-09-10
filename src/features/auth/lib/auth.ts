import NextAuth, {NextAuthConfig} from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import {verifyPassword} from "@/lib/password"
import {signInSchema} from "@/lib/validation"
import {prisma} from "@/lib/prisma"

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

                    // Return user object that will be encoded in JWT
                    // Only include necessary data to minimize token size
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        company: user.company,
                        position: user.position,
                        accessCode: user.accessCode
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
    
    // Callbacks for customizing authentication behavior
    callbacks: {
        // Customize JWT creation and updates
        async jwt({ token, user }) {
            // Initial sign in - add user data to token
            if (user) {
                token.company = user.company
                token.position = user.position
                token.accessCode = user.accessCode
            }

            return token
        },

        // Customize session object sent to client
        async session({ session, token }) {
            if (token) {
                session.user.id = token.sub!
                session.user.company = token.company as string
                session.user.position = token.position as string
                session.user.accessCode = token.accessCode as string
            }
            return session
        }
    },
    
    // Enable debug messages in development
    debug: process.env.NODE_ENV === "development",
    
    // Security settings
    trustHost: true,
    useSecureCookies: process.env.NODE_ENV === "production",
    cookies: {
        sessionToken: {
            name: `__Secure-next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production"
            },
        },
    }
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
