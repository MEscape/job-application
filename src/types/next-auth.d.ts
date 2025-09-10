declare module "next-auth" {
    interface Session {
        user: {
            id: string
            name?: string | null
            email?: string | null
            company?: string | null
            location?: string | null
            accessCode: string
            isAdmin: boolean
        }
    }

    interface User {
        id: string
        name?: string | null
        email?: string | null
        company?: string | null
        location?: string | null
        accessCode: string
        isAdmin: boolean
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        company?: string | null
        location?: string | null
        accessCode?: string
        isAdmin?: boolean
    }
}